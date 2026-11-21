import { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { acfSeries, mean, variance } from './utils/acf';
import { pacfDetailed, pacfSeries } from './utils/pacf';

const DEFAULT_LINEAR = [2, 4, 6, 8, 10];
const DEFAULT_MIXED = [2, -1, 3, -2, 1];
const DEFAULT_PACF = [1, 2, 3, 4, 5, 6, 7, 8];
const DEFAULT_PACF2 = [2, 1, 4, 3, 6, 5, 8, 7];

function parseSeries(input: string): number[] {
  return input.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
}

function formatNum(n: number | null, digits = 4): string {
  if (n === null || isNaN(n)) return '—';
  return n.toFixed(digits);
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const sections = [
    { id: 'mystery', title: '1. Mystery' },
    { id: 'what-acf', title: '2. What is ACF' },
    { id: 'acf-calc', title: '3. ACF Calculator' },
    { id: 'acf-plot', title: '4. ACF Plot' },
    { id: 'problem', title: '5. The Problem' },
    { id: 'what-pacf', title: '6. What is PACF' },
    { id: 'pacf-calc', title: '7. PACF Calculator' },
    { id: 'compare', title: '8. ACF vs PACF' },
    { id: 'ar', title: '9. AR Models' },
    { id: 'significance', title: '10. Significance' },
    { id: 'finance', title: '11. Finance' },
    { id: 'mistakes', title: '12. Mistakes' },
    { id: 'quiz', title: '13. Quiz' },
    { id: 'summary', title: '14. Summary' },
  ];

  return (
    <>
      <header>
        <div className="container">
          <nav>
            <div className="logo">ACF & PACF Interactive Guide</div>
            <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </nav>
        </div>
      </header>

      <div className="progress">
        {sections.map(s => (
          <a key={s.id} href={`#${s.id}`}>{s.title}</a>
        ))}
      </div>

      <main>
        <MysterySection />
        <WhatIsACFSection />
        <ACFCalculatorSection />
        <ACFPlotSection />
        <ProblemSection />
        <WhatIsPACFSection />
        <PACFCalculatorSection />
        <CompareSection />
        <ARSimulatorSection />
        <SignificanceSection />
        <FinanceSection />
        <MistakesSection />
        <QuizSection />
        <SummarySection />
      </main>

      <footer>
        <div className="container">
          <p>Built by <strong>Prakhar Gupta</strong></p>
          <div className="credit-links">
            <a href="mailto:bestofprakhar@gmail.com" target="_blank" rel="noopener noreferrer">📧 Email</a>
            <a href="https://www.linkedin.com/in/prakhar-gupta-5b7250372/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://x.com/PrakharQuant" target="_blank" rel="noopener noreferrer">Twitter / X</a>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Interactive educational guide for quantitative finance students and aspiring quants.
          </p>
        </div>
      </footer>
    </>
  );
}

function MysterySection() {
  const [selected, setSelected] = useState<'A' | 'B' | null>(null);
  return (
    <section id="mystery">
      <div className="container">
        <h2>1. The Mystery of Time-Series Data</h2>
        <p className="interpretation">
          <strong>If yesterday's stock return was positive, does that tell us anything about today's return?</strong>
        </p>
        <p>Look at these two sequences. Which one appears to contain a pattern?</p>
        <div className="sequence-box">
          <div className={`seq-item ${selected === 'A' ? 'active' : ''}`} onClick={() => setSelected('A')}>
            <strong>Sequence A</strong>
            <div style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>2, 4, 6, 8, 10</div>
          </div>
          <div className={`seq-item ${selected === 'B' ? 'active' : ''}`} onClick={() => setSelected('B')}>
            <strong>Sequence B</strong>
            <div style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>2, -1, 3, -2, 1</div>
          </div>
        </div>
        {selected && (
          <div className="interpretation">
            {selected === 'A' 
              ? "Sequence A is perfectly linear — each number is exactly 2 more than the previous. Clear deterministic pattern."
              : "Sequence B looks more random with alternating signs. No obvious simple rule."}
          </div>
        )}
        <p>Financial econometricians investigate whether observations are related to their own past values.</p>
        <h3>What is a time series?</h3>
        <p>A <strong>time series</strong> is a sequence of observations arranged chronologically.</p>
        <div className="timeline">
          {[2, 4, 6, 8, 10].map((val, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="obs">{val}</div>
              {i < 4 && <span className="arrow">→</span>}
            </div>
          ))}
        </div>
        <h3>What is a lag?</h3>
        <p>A <strong>lag</strong> tells us how many periods we move backwards.</p>
        <ul>
          <li><strong>Lag 1</strong>: one period ago</li>
          <li><strong>Lag 2</strong>: two periods ago</li>
          <li><strong>Lag 3</strong>: three periods ago</li>
        </ul>
      </div>
    </section>
  );
}

function WhatIsACFSection() {
  return (
    <section id="what-acf">
      <div className="container">
        <h2>2. What is Autocorrelation?</h2>
        <p>Ordinary correlation measures the relationship between two different variables.</p>
        <p><strong>Autocorrelation</strong> measures the relationship between a variable and its own past values.</p>
        <div className="card">
          <h3>Example: Perfectly linear series X = [2, 4, 6, 8, 10]</h3>
          <p>For lag 1 we pair:</p>
          <table>
            <thead><tr><th>Current</th><th>Previous</th></tr></thead>
            <tbody>
              <tr><td>4</td><td>2</td></tr>
              <tr><td>6</td><td>4</td></tr>
              <tr><td>8</td><td>6</td></tr>
              <tr><td>10</td><td>8</td></tr>
            </tbody>
          </table>
          <p>Pearson correlation = 1.</p>
          <div className="interpretation">This happens because the series is perfectly linear.</div>
        </div>
        <h3>The formula</h3>
        <div className="card" style={{ textAlign: 'center', fontSize: '1.2rem' }}>
          ACF(k) = Corr(X<sub>t</sub>, X<sub>t-k</sub>) = Cov(X<sub>t</sub>, X<sub>t-k</sub>) / Var(X)
        </div>
        <p>In plain English: How correlated are observations separated by k periods?</p>
      </div>
    </section>
  );
}

function ACFCalculatorSection() {
  const [input, setInput] = useState(DEFAULT_LINEAR.join(', '));
  const [lag, setLag] = useState(1);

  const series = useMemo(() => parseSeries(input), [input]);
  const n = series.length;
  const pairs = useMemo(() => {
    if (lag >= n || lag < 1) return [];
    return series.slice(lag).map((curr, i) => ({ current: curr, lagged: series[i] }));
  }, [series, lag]);

  const calc = useMemo(() => {
    if (pairs.length < 2) return null;
    const curr = pairs.map(p => p.current);
    const lagged = pairs.map(p => p.lagged);
    const mCurr = mean(curr);
    const mLag = mean(lagged);
    const products = curr.map((c, i) => (c - mCurr) * (lagged[i] - mLag));
    const cov = mean(products);
    const varS = variance(series);
    const acfVal = varS === 0 ? null : cov / varS;
    return { mCurr, mLag, cov, varS, acfVal };
  }, [pairs, series]);

  return (
    <section id="acf-calc">
      <div className="container">
        <h2>3. Interactive ACF Calculator</h2>
        <div className="controls">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} style={{ width: '280px' }} />
          <button onClick={() => setInput(DEFAULT_LINEAR.join(', '))}>Linear</button>
          <button onClick={() => setInput(DEFAULT_MIXED.join(', '))}>Mixed</button>
          <label>Lag {lag} <input type="range" min={1} max={Math.max(1, n-2)} value={lag} onChange={e => setLag(+e.target.value)} /></label>
        </div>
        {pairs.length > 0 && calc && (
          <div className="card">
            <table>
              <thead><tr><th>Current</th><th>Lagged</th></tr></thead>
              <tbody>{pairs.map((p, i) => <tr key={i}><td>{p.current}</td><td>{p.lagged}</td></tr>)}</tbody>
            </table>
            <p>Means: {formatNum(calc.mCurr,2)} / {formatNum(calc.mLag,2)}</p>
            <p>Covariance: {formatNum(calc.cov)} &nbsp; Variance: {formatNum(calc.varS)}</p>
            <div className="interpretation"><strong>ACF(lag {lag}) = {formatNum(calc.acfVal)}</strong></div>
          </div>
        )}
      </div>
    </section>
  );
}

function ACFPlotSection() {
  const [input, setInput] = useState(DEFAULT_LINEAR.join(', '));
  const series = useMemo(() => parseSeries(input), [input]);
  const maxLag = Math.min(8, Math.floor(series.length / 2));
  const acfs = useMemo(() => acfSeries(series, maxLag), [series, maxLag]);
  const chartData = acfs.map((v, k) => ({ lag: k, acf: v ?? 0 }));

  return (
    <section id="acf-plot">
      <div className="container">
        <h2>4. What does an ACF plot tell us?</h2>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} style={{ width: '300px' }} />
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="lag" />
              <YAxis domain={[-1, 1]} />
              <Tooltip />
              <Bar dataKey="acf" fill="var(--accent)" />
              <ReferenceLine y={0} stroke="var(--text-muted)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="interpretation">Lag 0 is always 1. Positive ACF: observations move together. Negative: opposite directions. Near zero: little linear correlation.</div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const [show, setShow] = useState(true);
  return (
    <section id="problem">
      <div className="container">
        <h2>5. The Problem with ACF — Indirect Relationships</h2>
        <p>If Day 3 depends on Day 2, and Day 2 depends on Day 1, then Day 3 and Day 1 can be correlated even without a direct link.</p>
        <div className="card" style={{ textAlign: 'center' }}>
          Day 1 {show ? '→ Day 2 →' : '→'} Day 3
          <br /><button onClick={() => setShow(s => !s)}>{show ? 'Hide intermediate' : 'Show intermediate'}</button>
        </div>
        <div className="interpretation">ACF at lag 2 measures overall correlation. It does not remove the path through Day 2. This is why PACF exists.</div>
      </div>
    </section>
  );
}

function WhatIsPACFSection() {
  return (
    <section id="what-pacf">
      <div className="container">
        <h2>6. What is PACF?</h2>
        <p>PACF measures the direct relationship at lag k after accounting for intermediate lags.</p>
        <div className="interpretation">PACF(lag 2) asks: After accounting for Day 2, is there any additional relationship between Day 3 and Day 1?</div>
        <p>We regress both series on the intermediate lags, then correlate the residuals. That is the PACF.</p>
        <p><strong>PACF is not simply Corr(X(t), X(t-k)). That is ACF.</strong></p>
      </div>
    </section>
  );
}

function PACFCalculatorSection() {
  const [input, setInput] = useState(DEFAULT_PACF.join(', '));
  const [lag, setLag] = useState(2);
  const series = useMemo(() => parseSeries(input), [input]);
  const detail = useMemo(() => pacfDetailed(series, lag), [series, lag]);

  return (
    <section id="pacf-calc">
      <div className="container">
        <h2>7. Interactive PACF Calculator</h2>
        <div className="controls">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} style={{ width: '320px' }} />
          <button onClick={() => setInput(DEFAULT_PACF.join(', '))}>Linear</button>
          <button onClick={() => setInput(DEFAULT_PACF2.join(', '))}>Alternating</button>
          <label>Lag {lag} <input type="range" min={1} max={5} value={lag} onChange={e => setLag(+e.target.value)} /></label>
        </div>
        {detail && (
          <div className="card">
            {detail.isLag1 
              ? <div className="interpretation">{detail.message} PACF(1) = {formatNum(detail.value)}</div>
              : <div><strong>PACF(lag {lag}) = {formatNum(detail.value)}</strong><br />Computed via residual correlation after controlling for intermediate lags.</div>
            }
          </div>
        )}
      </div>
    </section>
  );
}

function CompareSection() {
  const [input, setInput] = useState('2, 4, 6, 8, 10, 12, 14, 16');
  const [view, setView] = useState<'acf'|'pacf'|'both'>('both');
  const series = useMemo(() => parseSeries(input), [input]);
  const maxLag = Math.min(6, Math.floor(series.length / 2));
  const acfs = useMemo(() => acfSeries(series, maxLag), [series, maxLag]);
  const pacfs = useMemo(() => pacfSeries(series, maxLag), [series, maxLag]);
  const chartData = Array.from({length: maxLag+1}, (_,k) => ({ lag: k, acf: acfs[k]??0, pacf: pacfs[k]??0 }));

  return (
    <section id="compare">
      <div className="container">
        <h2>8. ACF versus PACF</h2>
        <table>
          <thead><tr><th>Question</th><th>ACF</th><th>PACF</th></tr></thead>
          <tbody>
            <tr><td>What does it measure?</td><td>Overall lagged correlation</td><td>Direct after controlling intermediates</td></tr>
            <tr><td>Accounts for intermediate lags?</td><td>No</td><td>Yes</td></tr>
            <tr><td>Lag 1</td><td>Same as PACF(1)</td><td>Same as ACF(1)</td></tr>
            <tr><td>Main use</td><td>Correlation structure</td><td>Identify AR order</td></tr>
          </tbody>
        </table>
        <div className="controls">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} style={{width:'300px'}} />
          <button onClick={() => setView('acf')}>ACF</button>
          <button onClick={() => setView('pacf')}>PACF</button>
          <button onClick={() => setView('both')}>Both</button>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="lag" />
              <YAxis domain={[-1,1]} />
              <Tooltip /><Legend />
              {(view==='acf'||view==='both') && <Bar dataKey="acf" fill="#58a6ff" />}
              {(view==='pacf'||view==='both') && <Bar dataKey="pacf" fill="#3fb950" />}
              <ReferenceLine y={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function ARSimulatorSection() {
  const [phi1, setPhi1] = useState(0.6);
  const [phi2, setPhi2] = useState(0);
  const [nObs, setNObs] = useState(100);
  const [seed, setSeed] = useState(42);

  const series = useMemo(() => {
    let s = seed;
    const rand = () => { s = (s * 16807) % 2147483647; return (s / 2147483647) * 2 - 1; };
    const data = [rand(), rand()];
    for (let t = 2; t < nObs; t++) {
      data.push(phi1 * data[t-1] + phi2 * data[t-2] + rand() * 0.5);
    }
    return data;
  }, [phi1, phi2, nObs, seed]);

  const maxLag = 12;
  const acfs = useMemo(() => acfSeries(series, maxLag), [series]);
  const pacfs = useMemo(() => pacfSeries(series, maxLag), [series]);
  const chartData = Array.from({length: maxLag+1}, (_,k) => ({ lag:k, acf:acfs[k]??0, pacf:pacfs[k]??0 }));

  return (
    <section id="ar">
      <div className="container">
        <h2>9. ACF and PACF in AR Models</h2>
        <p><strong>AR(1):</strong> X(t) = c + φ₁ X(t-1) + error</p>
        <p><strong>AR(2):</strong> X(t) = c + φ₁ X(t-1) + φ₂ X(t-2) + error</p>
        <div className="controls">
          <label>φ₁ {phi1.toFixed(2)} <input type="range" min={-0.9} max={0.9} step={0.05} value={phi1} onChange={e=>setPhi1(+e.target.value)} /></label>
          <label>φ₂ {phi2.toFixed(2)} <input type="range" min={-0.9} max={0.9} step={0.05} value={phi2} onChange={e=>setPhi2(+e.target.value)} /></label>
          <label>N {nObs} <input type="range" min={30} max={200} value={nObs} onChange={e=>setNObs(+e.target.value)} /></label>
          <button onClick={() => setSeed(s=>s+1)}>New seed</button>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="lag" /><YAxis domain={[-1,1]} /><Tooltip /><Legend />
              <Bar dataKey="acf" fill="#58a6ff" name="ACF" />
              <Bar dataKey="pacf" fill="#3fb950" name="PACF" />
              <ReferenceLine y={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="interpretation">
          AR(1): PACF cuts off after lag 1, ACF decays gradually.<br />
          AR(2): PACF cuts off after lag 2. Finite-sample plots are noisy.
        </div>
      </div>
    </section>
  );
}

function SignificanceSection() {
  const [n, setN] = useState(100);
  const band = 1.96 / Math.sqrt(n);
  return (
    <section id="significance">
      <div className="container">
        <h2>10. Statistical Significance and Confidence Bands</h2>
        <p>Approximate band under white-noise null: ±1.96 / √n</p>
        <div className="controls">
          <label>n = {n} <input type="range" min={20} max={500} value={n} onChange={e=>setN(+e.target.value)} /></label>
        </div>
        <p>Current band: ±{band.toFixed(3)}</p>
        <div className="interpretation">Bars outside suggest non-zero autocorrelation. These are approximate pointwise bands. Multiple testing is an issue. Inside the band ≠ proof of zero.</div>
      </div>
    </section>
  );
}

function FinanceSection() {
  const [returns, setReturns] = useState<number[]>([]);
  const generate = () => {
    const r: number[] = [];
    let prev = 0;
    for (let i = 0; i < 200; i++) {
      prev = 0.15 * prev + (Math.random() - 0.5) * 0.04;
      r.push(prev);
    }
    setReturns(r);
  };
  const acfs = useMemo(() => returns.length ? acfSeries(returns, 12) : [], [returns]);
  const sqAcfs = useMemo(() => returns.length ? acfSeries(returns.map(x=>x*x), 12) : [], [returns]);

  return (
    <section id="finance">
      <div className="container">
        <h2>11. Apply to Financial Returns</h2>
        <p>Price levels are persistent. Returns usually show weaker linear autocorrelation. Squared returns can reveal volatility clustering.</p>
        <button onClick={generate}>Generate synthetic returns</button>
        {returns.length > 0 && (
          <>
            <h3>ACF of returns</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={acfs.map((v,k)=>({lag:k, acf:v??0}))}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="lag" /><YAxis domain={[-1,1]} />
                  <Bar dataKey="acf" fill="var(--accent)" />
                  <ReferenceLine y={0} />
                  <ReferenceLine y={1.96/Math.sqrt(returns.length)} stroke="red" strokeDasharray="3 3" />
                  <ReferenceLine y={-1.96/Math.sqrt(returns.length)} stroke="red" strokeDasharray="3 3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <h3>ACF of squared returns</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sqAcfs.map((v,k)=>({lag:k, acf:v??0}))}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="lag" /><YAxis domain={[-1,1]} />
                  <Bar dataKey="acf" fill="var(--positive)" /><ReferenceLine y={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="interpretation">Distinguish autocorrelation in returns from autocorrelation in squared returns (volatility clustering).</div>
          </>
        )}
      </div>
    </section>
  );
}

function MistakesSection() {
  const mistakes = [
    { wrong: "ACF at lag 2 measures only the direct effect.", right: "ACF measures total correlation including indirect paths." },
    { wrong: "PACF is just Corr(X(t), X(t-k)).", right: "That is ACF. PACF controls for intermediate lags." },
    { wrong: "Lag 0 can be other than 1.", right: "ACF(0) = PACF(0) = 1 always." },
    { wrong: "Non-significant ACF proves independence.", right: "Only little linear correlation. Nonlinear dependence possible." },
    { wrong: "Sample plots always show perfect theoretical cutoffs.", right: "Finite samples are noisy." },
    { wrong: "ACF of returns = ACF of squared returns.", right: "Squared returns detect volatility clustering." },
  ];
  return (
    <section id="mistakes">
      <div className="container">
        <h2>12. Common Mistakes</h2>
        {mistakes.map((m,i) => (
          <div key={i} className="mistake">
            <div className="card" style={{borderLeft:'4px solid var(--negative)'}}><strong>Incorrect:</strong> {m.wrong}</div>
            <div className="card" style={{borderLeft:'4px solid var(--positive)'}}><strong>Correct:</strong> {m.right}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuizSection() {
  const questions = [
    { q: "What does lag 2 mean?", options: ["Two periods from now", "Two periods ago", "Second observation", "Twice the value"], correct: 1, exp: "Lag 2 means look back two periods." },
    { q: "Why is ACF(0) equal to 1?", options: ["Convention", "Perfect correlation with itself", "Not always", "Stationarity"], correct: 1, exp: "A series is perfectly correlated with itself at lag 0." },
    { q: "Why can ACF(2) be non-zero while PACF(2) is near zero?", options: ["Error", "Indirect path through lag 1", "Non-stationarity", "Always smaller"], correct: 1, exp: "ACF includes indirect effects; PACF isolates direct." },
    { q: "Why PACF(1) = ACF(1)?", options: ["Always equal", "No intermediate lags", "Identity for all", "Only AR(1)"], correct: 1, exp: "No intermediate lags to control for at lag 1." },
    { q: "What does negative ACF(1) mean?", options: ["Declining series", "Tends to reverse direction", "Negative mean", "No pattern"], correct: 1, exp: "High values tend to be followed by low values." },
    { q: "PACF cutoff after lag 2 suggests?", options: ["White noise", "AR(2) possible", "MA(2)", "Non-stationary"], correct: 1, exp: "Classic signature of AR(p)." },
    { q: "What are ±1.96/√n bands?", options: ["Exact CIs", "Approx reference under white-noise null", "True ACF", "SE of mean"], correct: 1, exp: "Approximate pointwise bands." },
    { q: "Why distinguish returns vs squared returns ACF?", options: ["Identical", "Squared detect volatility clustering", "Never square", "Only squared matter"], correct: 1, exp: "Volatility clustering is a key financial stylized fact." },
  ];
  const [answers, setAnswers] = useState<(number|null)[]>(Array(8).fill(null));
  const [shown, setShown] = useState<boolean[]>(Array(8).fill(false));

  return (
    <section id="quiz">
      <div className="container">
        <h2>13. Knowledge Check</h2>
        {questions.map((q, qi) => (
          <div key={qi} className="card">
            <h3>Q{qi+1}. {q.q}</h3>
            {q.options.map((opt, oi) => (
              <button key={oi} className={`quiz-option ${answers[qi]!==null ? (oi===q.correct?'correct':oi===answers[qi]?'incorrect':'') : ''}`}
                onClick={() => { const a=[...answers]; a[qi]=oi; setAnswers(a); const s=[...shown]; s[qi]=true; setShown(s); }}
                disabled={answers[qi]!==null}>
                {opt}
              </button>
            ))}
            {shown[qi] && <div className="interpretation">{q.exp}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function SummarySection() {
  return (
    <section id="summary">
      <div className="container">
        <h2>14. Final Summary</h2>
        <div className="card" style={{textAlign:'center', fontSize:'1.3rem', padding:'2rem'}}>
          <p><strong>ACF:</strong> How related are observations k periods apart?</p>
          <p style={{marginTop:'1.5rem'}}><strong>PACF:</strong> What direct relationship remains at lag k after removing intermediate lag effects?</p>
        </div>
        <div className="card">
          <h3>Cheat Sheet</h3>
          <ul>
            <li>Lag k = look back k periods</li>
            <li>ACF(k) = total correlation</li>
            <li>PACF(k) = direct correlation after controlling 1..k-1</li>
            <li>PACF(1) = ACF(1)</li>
            <li>AR(p): PACF cuts off after p</li>
            <li>Bands ≈ ±1.96/√n</li>
            <li>Check returns and squared returns separately</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
