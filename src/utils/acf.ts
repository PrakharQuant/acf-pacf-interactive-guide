/**
 * Sample Autocorrelation Function (ACF)
 * ACF(k) = Cov(X_t, X_{t-k}) / Var(X)
 * Uses the biased sample variance (divide by n) for consistency with common time-series practice
 * in small educational examples. For large n the difference is negligible.
 */

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function variance(arr: number[], biased = true): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const sumSq = arr.reduce((s, x) => s + (x - m) ** 2, 0);
  return biased ? sumSq / arr.length : sumSq / (arr.length - 1);
}

export function covariance(x: number[], y: number[], biased = true): number {
  if (x.length !== y.length || x.length === 0) return 0;
  const mx = mean(x);
  const my = mean(y);
  const sum = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
  return biased ? sum / x.length : sum / (x.length - 1);
}

/**
 * Calculate ACF at lag k
 * Returns null if insufficient data
 */
export function acf(series: number[], lag: number): number | null {
  if (lag < 0 || series.length <= lag) return null;
  if (lag === 0) return 1;

  const n = series.length;
  const x = series.slice(lag);           // current observations
  const y = series.slice(0, n - lag);     // lagged observations

  const cov = covariance(x, y);
  const varX = variance(series);
  if (varX === 0) return null; // constant series

  return cov / varX;
}

/**
 * Full ACF up to maxLag
 */
export function acfSeries(series: number[], maxLag: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let k = 0; k <= maxLag; k++) {
    result.push(acf(series, k));
  }
  return result;
}

export function pearsonCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;
  const cov = covariance(x, y, false); // use unbiased for pure Pearson
  const varX = variance(x, false);
  const varY = variance(y, false);
  if (varX === 0 || varY === 0) return null;
  return cov / Math.sqrt(varX * varY);
}
