export default function (s: number[], n_bins = 30) {
  s = s.slice();
  s.sort(function (a, b) {
    return a - b;
  });

  function quantile(p: number) {
    const idx = 1 + (s.length - 1) * p,
      lo = Math.floor(idx),
      hi = Math.ceil(idx),
      h = idx - lo;
    return (1 - h) * s[lo] + h * s[hi];
  }

  // calc bins
  const hi = quantile(0.99);
  const lo = quantile(0.01);
  const hilo = hi - lo;
  const bins = Array(n_bins).fill(0);
  const bin_size = hilo / (n_bins - 1);
  for (let i = 0; i < n_bins; i++) {
    bins[i] = lo + bin_size * i;
  }

  // calc bincounts
  const bin_counts = Array(n_bins).fill(0);
  for (let i = 0; i < s.length; i++) {
    const idx = Math.floor((s[i] - lo) / bin_size);
    if (idx >= 0 && idx < n_bins) bin_counts[idx]++;
  }
  return { bins, bin_counts };
}
