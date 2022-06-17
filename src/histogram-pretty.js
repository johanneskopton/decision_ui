export default function(s, n_bins = 10) {
  s = s.slice();
  s.sort(function(a, b) {
    return a - b;
  });

  function quantile(p) {
    var idx = 1 + (s.length - 1) * p,
      lo = Math.floor(idx),
      hi = Math.ceil(idx),
      h = idx - lo;
    return (1 - h) * s[lo] + h * s[hi];
  }

  // calc bins
  var hi = quantile(0.99);
  var lo = quantile(0.01);
  var hilo = hi - lo;
  var bins = Array(n_bins).fill(0);
  var bin_size = hilo / n_bins;
  for (var i = 0; i < n_bins; i++) {
    bins[i] = lo + bin_size * i;
  }

  // calc bincounts
  var bin_counts = Array(n_bins).fill(0);
  for (var i = 0; i < s.length; i++) {
    let idx = Math.floor(((s[i] - lo) / hilo) * n_bins);
    if (idx >= 0 && idx < n_bins) bin_counts[idx]++;
  }
  console.log(bin_counts);
  return { bins, bin_counts };
}
