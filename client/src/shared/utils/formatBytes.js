// Format a byte count into a human-readable string (B/KB/MB/GB/TB).
export function formatBytes(bytes, decimals = 1) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length - 1);

  const value = n / Math.pow(k, i);
  const fixed = i === 0 ? 0 : decimals;
  return `${value.toFixed(fixed)} ${sizes[i]}`;
}
