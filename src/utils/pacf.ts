/**
 * Partial Autocorrelation Function (PACF)
 * Residual-based interpretation:
 * PACF(k) is the correlation between the residuals of two regressions:
 * 1. X_t regressed on intermediate lags X_{t-1}, ..., X_{t-k+1}
 * 2. X_{t-k} regressed on the same intermediate lags
 *
 * For k=1 there are no intermediate lags, so PACF(1) = ACF(1)
 */

import { acf, mean, variance, covariance } from './acf';

function solveLinearSystem(A: number[][], b: number[]): number[] {
  // Gaussian elimination with partial pivoting (for small systems)
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // Pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    }
    [M[i], M[maxRow]] = [M[maxRow], M[i]];

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-12) return Array(n).fill(0);

    for (let j = i; j <= n; j++) M[i][j] /= pivot;

    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = M[k][i];
      for (let j = i; j <= n; j++) M[k][j] -= factor * M[i][j];
    }
  }

  return M.map(row => row[n]);
}

function multipleRegression(y: number[], X: number[][]): { coefficients: number[]; residuals: number[]; fitted: number[] } {
  // X is array of predictor series (each of length n)
  const n = y.length;
  if (n === 0 || X.length === 0) {
    return { coefficients: [], residuals: y.slice(), fitted: Array(n).fill(mean(y)) };
  }

  // Add intercept
  const predictors = [Array(n).fill(1), ...X];
  const p = predictors.length;

  // Build normal equations: (X'X) beta = X'y
  const XtX: number[][] = Array(p).fill(0).map(() => Array(p).fill(0));
  const Xty: number[] = Array(p).fill(0);

  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      XtX[i][j] = predictors[i].reduce((s, xi, idx) => s + xi * predictors[j][idx], 0);
    }
    Xty[i] = predictors[i].reduce((s, xi, idx) => s + xi * y[idx], 0);
  }

  const beta = solveLinearSystem(XtX, Xty);

  const fitted = y.map((_, idx) => predictors.reduce((s, pred, j) => s + beta[j] * pred[idx], 0));
  const residuals = y.map((yi, idx) => yi - fitted[idx]);

  return { coefficients: beta, residuals, fitted };
}

/**
 * Calculate PACF at lag k using residual method
 */
export function pacf(series: number[], lag: number): number | null {
  if (lag < 1 || series.length <= lag + 1) return null;
  if (lag === 1) return acf(series, 1);

  const n = series.length;
  // We need observations from index lag to n-1 for the current series
  const start = lag;
  const y = series.slice(start); // X_t
  const xk = series.slice(0, n - lag); // X_{t-k}

  // Intermediate lags: X_{t-1} to X_{t-k+1}
  const intermediate: number[][] = [];
  for (let j = 1; j < lag; j++) {
    intermediate.push(series.slice(j, n - lag + j));
  }

  if (intermediate.length === 0) {
    // Should not happen for lag > 1, but safety
    return acf(series, lag);
  }

  // Align lengths
  const len = Math.min(y.length, xk.length, ...intermediate.map(s => s.length));
  const yAligned = y.slice(0, len);
  const xkAligned = xk.slice(0, len);
  const interAligned = intermediate.map(s => s.slice(0, len));

  const regY = multipleRegression(yAligned, interAligned);
  const regX = multipleRegression(xkAligned, interAligned);

  // Correlation of residuals
  const resY = regY.residuals;
  const resX = regX.residuals;

  const cov = covariance(resY, resX);
  const varY = variance(resY);
  const varX = variance(resX);

  if (varY === 0 || varX === 0) return null;

  return cov / Math.sqrt(varY * varX);
}

export function pacfSeries(series: number[], maxLag: number): (number | null)[] {
  const result: (number | null)[] = [1]; // lag 0
  for (let k = 1; k <= maxLag; k++) {
    result.push(pacf(series, k));
  }
  return result;
}

/**
 * Detailed PACF calculation for educational display
 */
export function pacfDetailed(series: number[], lag: number) {
  if (lag < 1 || series.length <= lag + 1) return null;
  if (lag === 1) {
    return {
      lag,
      isLag1: true,
      value: acf(series, 1),
      message: 'At lag 1 there are no intermediate lags to control for. PACF(1) = ACF(1).'
    };
  }

  const n = series.length;
  const start = lag;
  const y = series.slice(start);
  const xk = series.slice(0, n - lag);

  const intermediateLabels: string[] = [];
  const intermediate: number[][] = [];
  for (let j = 1; j < lag; j++) {
    intermediateLabels.push(`X(t-${j})`);
    intermediate.push(series.slice(j, n - lag + j));
  }

  const len = Math.min(y.length, xk.length, ...intermediate.map(s => s.length));
  const yA = y.slice(0, len);
  const xkA = xk.slice(0, len);
  const interA = intermediate.map(s => s.slice(0, len));

  const regY = multipleRegression(yA, interA);
  const regX = multipleRegression(xkA, interA);

  const cov = covariance(regY.residuals, regX.residuals);
  const varY = variance(regY.residuals);
  const varX = variance(regX.residuals);
  const value = (varY === 0 || varX === 0) ? null : cov / Math.sqrt(varY * varX);

  return {
    lag,
    isLag1: false,
    value,
    y: yA,
    xk: xkA,
    intermediate: interA,
    intermediateLabels,
    residualsY: regY.residuals,
    residualsX: regX.residuals,
    fittedY: regY.fitted,
    fittedX: regX.fitted,
    coefficientsY: regY.coefficients,
    coefficientsX: regX.coefficients
  };
}
