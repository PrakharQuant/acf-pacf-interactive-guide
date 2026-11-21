# ACF & PACF Interactive Guide

An interactive educational website that teaches the Autocorrelation Function (ACF) and Partial Autocorrelation Function (PACF) from absolute beginner intuition to practical use in financial time-series analysis.

## What this project teaches

- What a time series and a lag are
- The difference between ordinary correlation and autocorrelation
- How to calculate ACF step-by-step with transparent formulas
- Why ACF includes indirect relationships
- What PACF measures (direct lagged correlation after controlling for intermediate lags)
- How to compute PACF using the residual regression method
- How ACF and PACF help identify AR model order
- Approximate confidence bands
- Application to financial returns vs. squared returns (volatility clustering)

## Why ACF and PACF matter in quantitative finance

They are fundamental diagnostic tools for understanding linear temporal dependence in returns, prices, and volatility. Correct interpretation of ACF vs PACF is essential for model identification (ARIMA, GARCH, etc.).

## Mathematical conventions

- **ACF**: Sample autocorrelation using biased variance (divide by *n*).  
  `ACF(k) = Cov(X_t, X_{t-k}) / Var(X)`  
  Lag 0 is always 1.

- **PACF**: Residual-based definition.  
  For lag *k* > 1: regress both `X_t` and `X_{t-k}` on intermediate lags `X_{t-1} … X_{t-k+1}`, then take the correlation of the residuals.  
  PACF(1) = ACF(1) by construction.

All calculations run in the browser with transparent implementations (no black-box stats libraries for the core math).

## Running locally

```bash
npm install
npm run dev
```

Open the URL shown (usually http://localhost:5173).

## Building

```bash
npm run build
```

Output is in `dist/`.

## Deploying to GitHub Pages

1. Push this repository to GitHub (already done if you are reading the live site).
2. Go to repository **Settings → Pages**.
3. Source: **GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) will automatically build and deploy on every push to `main`.

The Vite `base` is set to `/acf-pacf-interactive-guide/` so the site works at  
`https://<username>.github.io/acf-pacf-interactive-guide/`

## Limitations

- Sample ACF/PACF plots are noisy in small samples; theoretical cutoffs are approximate.
- Confidence bands are pointwise and approximate; multiple-testing issues exist.
- Near-zero ACF does not prove independence (only little linear correlation).
- This is an educational tool, not production econometric software.

## Credits

Built by **Prakhar Gupta**  
- Email: bestofprakhar@gmail.com  
- LinkedIn: https://www.linkedin.com/in/prakhar-gupta-5b7250372/  
- Twitter/X: https://x.com/PrakharQuant

---

Interactive learning experience designed so a beginner can independently understand ACF and PACF without a textbook.
