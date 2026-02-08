const mode = ref('mixed'); // Default mode is 'mixed', can be 'dark', 'light', or 'mixed'

export default function useHeader() {
  return { mode };
}
