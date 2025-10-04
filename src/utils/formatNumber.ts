/**
 * Abbreviate large numbers for compact display
 * Examples:
 * 500 -> 500
 * 1500 -> 1.5k
 * 2000 -> 2k
 * 11500 -> 11.5k
 * 116500 -> 116.5k
 * 1000000 -> 1M
 */
export function abbreviateNumber(value: number): string {
  if (value < 1000) {
    return value.toString();
  }

  if (value < 1000000) {
    // Thousands
    const thousands = value / 1000;
    // Remove unnecessary decimals (e.g., 2.0k -> 2k)
    return thousands % 1 === 0
      ? `${Math.floor(thousands)}k`
      : `${thousands.toFixed(1)}k`;
  }

  // Millions
  const millions = value / 1000000;
  return millions % 1 === 0
    ? `${Math.floor(millions)}M`
    : `${millions.toFixed(1)}M`;
}
