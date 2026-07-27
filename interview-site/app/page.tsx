"use client";

import { useState } from "react";

const models = [
  { name: "Naive persistence", short: "Baseline", rmse: 296.0, mae: 154.06, direction: 0, best: true },
  { name: "Random Forest", short: "Ensemble", rmse: 305.13, mae: 180.98, direction: 46.41 },
  { name: "Hist. Gradient Boosting", short: "Ensemble", rmse: 310.09, mae: 182.3, direction: 50.83 },
  { name: "Ridge", short: "Linear", rmse: 311.05, mae: 189.2, direction: 51.38 },
  { name: "Elastic Net", short: "Linear", rmse: 316.67, mae: 193.13, direction: 49.17 },
];

const phases = [
  ["01", "Frame", "Day t information predicts the close on day t + 1."],
  ["02", "Protect", "Shifted rolling features prevent future leakage."],
  ["03", "Tune", "TimeSeriesSplit sees training history only."],
  ["04", "Test", "181 expanding-window forecasts, refit each day."],
];

export default function Home() {
  const [metric, setMetric] = useState<"rmse" | "mae">("rmse");

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Bitcoin Forecast Lab home">
          <span className="coin">₿</span>
          <span>Forecast<span className="muted">/Lab</span></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#result">Result</a>
          <a href="#method">Method</a>
          <a href="#findings">Findings</a>
        </nav>
        <a className="code-link" href="https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation" target="_blank" rel="noreferrer">
          View source <span>↗</span>
        </a>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> REPRODUCIBLE TIME-SERIES STUDY · 2019 HOLDOUT</div>
          <h1>Can machine learning<br />beat <em>“tomorrow = today”</em>?</h1>
          <p className="lede">A leakage-aware benchmark for next-day Bitcoin forecasting—built to test an honest question, not manufacture a winning chart.</p>
          <div className="hero-actions">
            <a className="primary" href="#result">Explore the evidence <span>↓</span></a>
            <span className="caption">Python · scikit-learn · walk-forward validation</span>
          </div>
        </div>
        <div className="hero-result" aria-label="Headline result">
          <div className="result-top"><span>HEADLINE RESULT</span><span className="status">NOT BEATEN</span></div>
          <div className="big-number">296<span>.00</span></div>
          <div className="unit">USD holdout RMSE · naive baseline</div>
          <div className="mini-chart" aria-hidden="true">
            <div className="grid-lines" />
            <div className="trace trace-one" />
            <div className="trace trace-two" />
            <span className="point p1" /><span className="point p2" /><span className="point p3" />
          </div>
          <div className="comparison">
            <div><strong>+3.1%</strong><span>next-best RMSE</span></div>
            <div><strong>181</strong><span>holdout days</span></div>
            <div><strong>0</strong><span>models beat baseline</span></div>
          </div>
        </div>
      </section>

      <section className="truth-strip">
        <div className="shell truth-inner">
          <span className="truth-label">THE CONCLUSION</span>
          <p><strong>None of the ML models won.</strong> Bitcoin price persistence was stronger than every tuned model out of sample.</p>
          <span className="truth-note">That is the finding—not a failed experiment.</span>
        </div>
      </section>

      <section className="section shell" id="result">
        <div className="section-head">
          <div><span className="section-no">01 / EVIDENCE</span><h2>The baseline stayed ahead.</h2></div>
          <p>Every model faced the same dated holdout. Lower error is better.</p>
        </div>
        <div className="evidence-grid">
          <div className="leaderboard card">
            <div className="card-top">
              <span>MODEL LEADERBOARD</span>
              <div className="toggle" aria-label="Select metric">
                <button className={metric === "rmse" ? "active" : ""} onClick={() => setMetric("rmse")}>RMSE</button>
                <button className={metric === "mae" ? "active" : ""} onClick={() => setMetric("mae")}>MAE</button>
              </div>
            </div>
            <div className="table-head"><span>MODEL</span><span>{metric.toUpperCase()} / USD</span><span>VS. BEST</span></div>
            {models.map((model, i) => {
              const value = model[metric];
              const best = models[0][metric];
              const delta = ((value / best - 1) * 100).toFixed(1);
              return (
                <div className={`model-row ${model.best ? "winner" : ""}`} key={model.name}>
                  <span className="rank">0{i + 1}</span>
                  <span className="model-name"><strong>{model.name}</strong><small>{model.short}</small></span>
                  <span className="metric-value">{value.toFixed(2)}</span>
                  <span className="delta">{model.best ? "BEST" : `+${delta}%`}</span>
                </div>
              );
            })}
          </div>
          <aside className="insight card">
            <span className="card-kicker">WHY IT MATTERS</span>
            <blockquote>“A sophisticated model is not useful merely because it is sophisticated.”</blockquote>
            <p>The close price is highly persistent. Without a naive reference, a low-looking error can be deeply misleading.</p>
            <div className="insight-rule" />
            <div className="insight-stat"><span>51.38%</span><p>Best direction accuracy<br /><b>Ridge · not evidence of profit</b></p></div>
          </aside>
        </div>
      </section>

      <section className="method-wrap" id="method">
        <div className="section shell">
          <div className="section-head">
            <div><span className="section-no">02 / METHOD</span><h2>Designed against hindsight.</h2></div>
            <p>The evaluation imitates what would have been knowable on each day.</p>
          </div>
          <div className="timeline">
            {phases.map(([number, title, copy]) => (
              <article key={number}>
                <span className="phase-no">{number}</span>
                <div className="phase-icon">{title === "Frame" ? "t→t+1" : title === "Protect" ? "≠ future" : title === "Tune" ? "▥" : "↻"}</div>
                <h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="split-bar">
            <div className="train"><span>TRAINING HISTORY</span><strong>2018-01-01 → 2018-12-31</strong></div>
            <div className="split-mark"><span>SPLIT</span><b>2019-01-01</b></div>
            <div className="holdout"><span>UNSEEN HOLDOUT</span><strong>2019-01-01 → 2019-06-30</strong></div>
          </div>
          <div className="guardrails">
            <span>✓ Chronological split</span><span>✓ Shifted rolling features</span><span>✓ Training-only tuning</span><span>✓ Expanding window</span>
          </div>
        </div>
      </section>

      <section className="section shell" id="findings">
        <div className="section-head">
          <div><span className="section-no">03 / INTERPRETATION</span><h2>What the result actually says.</h2></div>
        </div>
        <div className="findings">
          <article className="finding-primary">
            <span className="finding-index">01</span>
            <h3>Price-level forecasting rewards inertia.</h3>
            <p>When tomorrow’s price is usually close to today’s, copying the latest observation becomes a formidable forecast. Models must add signal beyond that persistence—not merely fit the price curve.</p>
          </article>
          <article><span className="finding-index">02</span><h3>Direction is a separate problem.</h3><p>Ridge reached 51.38% direction accuracy, but one holdout and no transaction-cost model cannot support a trading claim.</p></article>
          <article><span className="finding-index">03</span><h3>Negative results create direction.</h3><p>The next experiment should target log returns, repeat across regimes, and isolate whether network features add value.</p></article>
        </div>
      </section>

      <section className="artifact-wrap">
        <div className="section shell">
          <div className="section-head">
            <div><span className="section-no">04 / ARTIFACT</span><h2>Every score is auditable.</h2></div>
            <p>Machine-readable metrics, dated forecasts, and reproducible figures are generated by one command.</p>
          </div>
          <div className="artifact-grid">
            <figure className="chart-card"><img src="/figures/model-comparison.png" alt="Bar chart comparing RMSE by model" /><figcaption>Holdout RMSE by model</figcaption></figure>
            <figure className="chart-card wide"><img src="/figures/predictions.png" alt="Walk-forward predictions compared with actual Bitcoin close" /><figcaption>181 dated walk-forward predictions</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="next shell">
        <span className="section-no">NEXT ITERATION</span>
        <h2>From a benchmark<br />to a stronger research system.</h2>
        <div className="next-items">
          <div><b>01</b><span>Predict log return</span></div>
          <div><b>02</b><span>Evaluate market regimes</span></div>
          <div><b>03</b><span>Ablate feature groups</span></div>
          <div><b>04</b><span>Add costs & uncertainty</span></div>
        </div>
      </section>

      <footer>
        <div className="shell footer-inner">
          <div><span className="coin">₿</span><strong>Bitcoin Next-Day Forecasting</strong></div>
          <p>Educational research · Not financial advice</p>
          <a href="https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation" target="_blank" rel="noreferrer">GitHub repository ↗</a>
        </div>
      </footer>
    </main>
  );
}
