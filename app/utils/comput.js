export function calculateReadingTime(text, wpm = 200) {
  // 1. Check if text is empty or null
  if (!text || text.length === 0) return 0;

  // 2. Clean the text from extra spaces and split into an array of words
  // The regex /\s+/ splits by any whitespace (tabs, line breaks)
  const words = text.trim().split(/\s+/).length;

  // 3. Divide the number of words by the speed (WPM - Words Per Minute)
  const time = Math.ceil(words / wpm);

  // 4. Return the time (minimum 1 minute if there is text)
  return time < 1 ? 1 : time;
}
