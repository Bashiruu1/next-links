export function formatFollowerCount(count: number): string {
  if (count >= 1_000_000) {
    const s = (count / 1_000_000).toFixed(1);
    return `${s.replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    const s = (count / 1_000).toFixed(1);
    return `${s.replace(/\.0$/, "")}K`;
  }
  return count.toLocaleString();
}
