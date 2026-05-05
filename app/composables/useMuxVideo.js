// composables/useMuxVideo.js
//
// Attaches a Mux HLS stream to a <video> element ref. The stream URL
// is `https://stream.mux.com/{playbackId}.m3u8`.
//
// Two delivery paths depending on the browser:
//   - Safari supports HLS natively in <video> tags. We just set src.
//   - Chrome / Firefox / Edge don't. We hand the URL to hls.js, which
//     converts the HLS segments into MSE chunks the browser can play.
//
// hls.js is dynamically imported on the non-Safari path so the bundle
// it adds (~30KB gzipped) doesn't ship to Safari users at all.
//
// Usage:
//   const videoRef = ref(null);
//   useMuxVideo(videoRef, 'L4cwV1O9pQPNJ1px400NV3sNGpNbbX6V3rbrybMq9a6A');
//
//   // or with a reactive playback id (e.g. from a prop)
//   useMuxVideo(videoRef, () => props.playbackId);
//
// All mux-stream cleanup is handled in onUnmounted, so callers don't
// need to do anything special on teardown.

import { isRef, onMounted, onUnmounted, watch } from 'vue';

const HLS_URL = (id) => `https://stream.mux.com/${id}.m3u8`;
const NATIVE_HLS_MIME = 'application/vnd.apple.mpegurl';

export default function useMuxVideo(videoRef, playbackId) {
  let hls = null;

  const resolveId = () => {
    if (typeof playbackId === 'function') return playbackId();
    if (isRef(playbackId)) return playbackId.value;
    return playbackId;
  };

  // play() can reject if the browser blocks autoplay (e.g. unmuted on
  // some platforms). Our videos are all muted + playsinline so it
  // should always be allowed, but swallow the rejection just in case
  // — playback isn't critical to the parent component succeeding.
  function playSafe(video) {
    const p = video?.play?.();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  async function attach() {
    const video = videoRef.value;
    const id = resolveId();
    if (!video || !id) return;

    // Tear down any existing stream before re-attaching (e.g. when the
    // playback id changes reactively).
    detach();

    const url = HLS_URL(id);

    // Safari (and iOS WebKit): native HLS support — no JS needed.
    if (video.canPlayType(NATIVE_HLS_MIME)) {
      video.src = url;
      // Native autoplay attribute usually handles this, but kick it
      // explicitly in case the metadata-load event has already fired.
      playSafe(video);
      return;
    }

    // Everywhere else: hls.js. Dynamically imported so it's not in the
    // Safari path's bundle.
    const { default: Hls } = await import('hls.js');
    if (!Hls.isSupported()) {
      // Last-resort fallback — try the URL anyway. Some non-Safari
      // browsers still cope with .m3u8 in edge cases.
      video.src = url;
      playSafe(video);
      return;
    }

    hls = new Hls({
      // Background / loop videos don't need fancy ABR — keep it light.
      enableWorker: true,
      lowLatencyMode: false,
    });
    // Canonical hls.js bring-up: attachMedia, then loadSource, then
    // play once the manifest has parsed. With autoplay attribute the
    // browser usually plays on its own, but the explicit call avoids
    // edge cases where the video is used as a WebGL texture source
    // (Three.js VideoTexture only updates when the video is playing).
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(url);
    });
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      playSafe(video);
    });
    hls.attachMedia(video);
  }

  function detach() {
    if (hls) {
      try { hls.destroy(); } catch { /* noop */ }
      hls = null;
    }
  }

  onMounted(attach);

  // Re-attach if either the video element ref or the playback id
  // changes. (Common for components that mount the video via v-if.)
  watch(videoRef, (v) => { if (v) attach(); });
  if (isRef(playbackId)) watch(playbackId, attach);

  onUnmounted(detach);
}
