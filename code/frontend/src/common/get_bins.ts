export default function (s: number[], n_bins = 30) {
  s = s.slice();
  s.sort(function (a, b) {
    return a - b;
  });

  function quantile(p: number) {
    const idx = 1 + (s.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    const h = idx - lo;
    return (1 - h) * s[Math.max(0, lo)] + h * s[Math.min(hi, s.length - 1)];
  }

  // calc bins
  const hi = quantile(0.99);
  const lo = quantile(0.01);
  const hilo = hi - lo;
  n_bins = hilo == 0 ? 1 : n_bins;
  const bins = Array(n_bins).fill(0);
  const bin_size = hilo == 0 ? 1 : hilo / (n_bins - 1);
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
