/**
 * Rounds numbers to iOS-style format:
 * 0-900 -> "x00+" (e.g. 450 -> 400+)
 * 901-999k -> "#.#k"
 * 1m+ -> "#.#m"
 */
export const formatCount = (num: number): string => {
  if (num < 901) {
    return `${Math.floor(num / 100) * 100}+`;
  }
  if (num < 1000000) {
    const k = num / 1000;
    // Show 1 decimal place if under 10k, otherwise round to nearest whole k
    return k < 10 ? `${k.toFixed(1)}k` : `${Math.floor(k)}k`;
  }
  const m = num / 1000000;
  return m < 10 ? `${m.toFixed(1)}m` : `${Math.floor(m)}m`;
};
