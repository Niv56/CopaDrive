export function formatBytes(bytes, decimals = 1) {
  const n = Number(bytes);

  // Guard clause for invalid or zero values
  if (!Number.isFinite(n) || n <= 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  // Calculate unit index based on powers of 1024
  const i = Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length - 1);

  const value = n / Math.pow(k, i);

  // Use 0 decimals for integers to keep the UI clean
  const fixed = Number.isInteger(value) ? 0 : decimals;

  return `${value.toFixed(fixed)} ${sizes[i]}`;
}