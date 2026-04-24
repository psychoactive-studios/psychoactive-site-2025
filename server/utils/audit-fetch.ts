/**
 * Design Audit — URL fetch + HTML cleaning.
 *
 * Fetches the target page, strips scripts/styles/tracking/noise, keeps
 * meaningful structure and copy. Extracts key meta (title, description)
 * separately so the prompt can surface them explicitly.
 *
 * Defensive throughout — the input is arbitrary user URLs, so we
 * validate, cap size, time out, and surface clear errors.
 */

import * as cheerio from 'cheerio';

const MAX_HTML_BYTES = 2_000_000; // 2 MB — refuse anything bigger
const MAX_CLEANED_CHARS = 40_000; // context-limit budget for Claude
const FETCH_TIMEOUT_MS = 15_000;

export interface FetchedSite {
  url: string;
  title: string;
  description: string;
  html: string; // cleaned body text + structure
  // og:image / twitter:image / apple-touch-icon from the page's head.
  // Null if the site doesn't expose any preview image. Used in the UI
  // to give the user a visual anchor for "this is the page you
  // audited".
  heroImageUrl: string | null;
}

export class AuditFetchError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

/**
 * Normalise + validate a user-submitted URL. Rejects localhost, private
 * IPs, non-http schemes, malformed input. Returns a URL that's safe to
 * fetch server-side.
 */
export function normaliseUrl(raw: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) {
    throw new AuditFetchError('EMPTY_URL', 'Please enter a URL.');
  }

  // Accept bare domains (example.com) — prefix https://
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new AuditFetchError('INVALID_URL', 'That URL looks malformed. Try including the domain (e.g. example.com).');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new AuditFetchError('BAD_SCHEME', 'Only http and https URLs are supported.');
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.startsWith('172.16.') ||
    host === '::1'
  ) {
    throw new AuditFetchError('LOCAL_URL', 'Local and private network URLs aren\'t supported.');
  }

  return parsed.toString();
}

/**
 * Fetch the URL with a timeout. Follows redirects. Rejects non-HTML
 * responses and anything too big.
 */
async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'PsychoactiveDesignAudit/1.0 (+https://psychoactive.co.nz)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new AuditFetchError('TIMEOUT', 'That site took too long to respond. Try again?');
    }
    throw new AuditFetchError(
      'UNREACHABLE',
      'We couldn\'t reach that URL. Check the address and try again.',
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new AuditFetchError(
      'BAD_STATUS',
      `The URL returned HTTP ${res.status}. Try a different page?`,
    );
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
    throw new AuditFetchError(
      'NOT_HTML',
      'We can only audit HTML pages. That URL returned something else.',
    );
  }

  const contentLength = parseInt(res.headers.get('content-length') || '0', 10);
  if (contentLength && contentLength > MAX_HTML_BYTES) {
    throw new AuditFetchError('TOO_LARGE', 'That page is too large to audit.');
  }

  const text = await res.text();
  if (text.length > MAX_HTML_BYTES) {
    throw new AuditFetchError('TOO_LARGE', 'That page is too large to audit.');
  }

  return text;
}

/**
 * Strip the noisy parts of the HTML, keep the meaningful bits. Claude
 * doesn't need scripts, styles, or SVG paths — it needs the text and
 * structure.
 */
function cleanHtml(
  rawHtml: string,
  pageUrl: string
): {
  title: string;
  description: string;
  cleaned: string;
  heroImageUrl: string | null;
} {
  const $ = cheerio.load(rawHtml);

  const title = $('title').first().text().trim().slice(0, 300);
  const description =
    ($('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '').trim().slice(0, 500);

  // Try each common "preview image" source in priority order. og:image
  // is the canonical one; the others are sensible fallbacks when it's
  // missing.
  const rawImageCandidate =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[property="og:image:secure_url"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    $('meta[name="twitter:image:src"]').attr('content') ||
    $('link[rel="apple-touch-icon"]').attr('href') ||
    '';

  let heroImageUrl: string | null = null;
  if (rawImageCandidate) {
    try {
      // Resolve against the page URL so relative paths become absolute.
      heroImageUrl = new URL(rawImageCandidate, pageUrl).toString();
    } catch {
      heroImageUrl = null;
    }
  }

  // Remove noise
  $('script, style, noscript, iframe, svg, link, meta').remove();
  $('[aria-hidden="true"]').remove();
  // Cookie banners, chat widgets, intercom, etc. — best-effort selectors.
  $(
    '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [id*="intercom" i], [class*="intercom" i], [id*="drift" i], [class*="drift" i]',
  ).remove();

  // Collapse whitespace within text nodes.
  let cleaned = $('body').html() || $.root().html() || '';
  cleaned = cleaned
    .replace(/<!--[\s\S]*?-->/g, '') // strip comments
    .replace(/\s+/g, ' ') // collapse whitespace
    .replace(/>\s+</g, '><') // no whitespace between tags
    .trim();

  if (cleaned.length > MAX_CLEANED_CHARS) {
    cleaned = cleaned.slice(0, MAX_CLEANED_CHARS);
  }

  return { title, description, cleaned, heroImageUrl };
}

/**
 * Top-level orchestrator: validate → fetch → clean → return.
 */
export async function fetchAndCleanSite(rawUrl: string): Promise<FetchedSite> {
  const url = normaliseUrl(rawUrl);
  const rawHtml = await fetchHtml(url);
  const { title, description, cleaned, heroImageUrl } = cleanHtml(rawHtml, url);

  return {
    url,
    title,
    description,
    html: cleaned,
    heroImageUrl,
  };
}
