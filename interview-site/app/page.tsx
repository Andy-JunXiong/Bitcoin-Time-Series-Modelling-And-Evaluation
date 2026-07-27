"use client";

import { useState } from "react";

const regimes = [
  ["2018 bear", 370.2, 501.0, "-35.3%", "50.00%"],
  ["2020 shock", 424.8, 445.3, "-4.8%", "50.27%"],
  ["2021 bull", 423.2, 609.2, "-44.0%", "50.14%"],
  ["2022 deleveraging", 337.8, 383.3, "-13.5%", "48.77%"],
  ["2023 recovery", 229.2, 233.9, "-2.0%", "52.88%"],
  ["2024 institutional", 276.2, 281.9, "-2.1%", "51.37%"],
  ["2025 recent", 217.8, 223.3, "-2.5%", "50.96%"],
];

const questions = [
  ["01", "Can the market history be trusted?", "Yes—after daily continuity, OHLC invariants, duplicate checks, and a SHA-256-bound manifest.", "3,261 complete UTC candles"],
  ["02", "Does return prediction fix the price-level problem?", "It creates a cleaner stationary target, but the candidate still failed every declared regime.", "0 / 7 regime wins"],
  ["03", "Do OHLCV features add signal?", "Not in this candidate. Price-only features lost less badly than OHLCV and the full feature set.", "−7.60% vs −14.88%"],
  ["04", "Was one market period driving the result?", "No. The candidate was evaluated from the 2018 bear market through the 2025 recent market.", "7 distinct regimes"],
  ["05", "Would this model be released?", "No. The versioned gate rejected it and preserved the zero-return baseline as the reference.", "REJECTED by policy"],
  ["06", "What did failure improve?", "It turned a notebook result into an auditable system with contracts, ablation, gates, and reproducible evidence.", "13 automated tests"],
];

const pipeline = [
  ["Source", "Bounded", "Complete Binance UTC candles"],
  ["Raw", "Traceable", "CSV + SHA-256 manifest"],
  ["Validate", "Contracted", "Continuity + OHLC gates"],
  ["Features", "Leakage-safe", "Day t predicts day t+1"],
  ["Backtest", "Cross-regime", "Seven expanding-history folds"],
  ["Release", "Fail-safe", "Reject or promote by policy"],
];

export default function Home() {
  const [metric, setMetric] = useState<"rmse" | "direction">("rmse");

  return (
    <main id="top">
      <header className="nav shell">
        <a className="brand" href="#top"><span className="coin">₿</span><span>Bitcoin <span className="muted">Forecast Intelligence</span></span></a>
        <nav><a href="#questions">Questions</a><a href="#evidence">Evidence</a><a href="#model">Model</a><a href="#system">System</a></nav>
        <span className="release-badge"><i /> Candidate rejected</span>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> GOVERNED FORECASTING CASE STUDY · 2017–2026</div>
          <h1>Bitcoin forecasts,<br />made <em>defensible.</em></h1>
          <p className="lede">How 3,261 daily market observations became a leakage-safe, cross-regime model decision—with an explicit gate that refused to promote a losing candidate.</p>
          <div className="hero-actions">
            <a className="primary" href="#questions">Read the case study <span>↓</span></a>
            <a className="caption source-caption" href="https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation" target="_blank" rel="noreferrer">Python · scikit-learn · source ↗</a>
          </div>
        </div>
        <div className="hero-result">
          <div className="result-top"><span>RELEASE DECISION</span><span className="status">REJECTED</span></div>
          <div className="gate-score">0<span>/7</span></div>
          <div className="unit">market regimes beat the zero-return baseline</div>
          <div className="gate-rule">
            <span>Required</span><strong>≥ 5 / 7 regime wins</strong>
            <span>Observed mean RMSE lift</span><strong className="negative">−14.88%</strong>
            <span>Baseline status</span><strong className="safe">PRESERVED</strong>
          </div>
          <div className="result-foot">The gate worked: no model was promoted on weak evidence.</div>
        </div>
      </section>

      <section className="truth-strip">
        <div className="shell truth-inner">
          <span className="truth-label">THE OUTCOME</span>
          <p><strong>The model failed. The platform succeeded.</strong> A governed rejection is more valuable than an unearned production claim.</p>
          <span className="truth-note">Negative results remain first-class evidence.</span>
        </div>
      </section>

      <section className="section shell" id="questions">
        <div className="section-head">
          <div><span className="section-no">01 / DECISION QUESTIONS</span><h2>Start with decisions,<br />not model complexity.</h2></div>
          <p>Every answer is tied to a generated artifact, declared rule, or measurable result.</p>
        </div>
        <div className="question-grid">
          {questions.map(([n, q, a, proof]) => (
            <article className="question-card" key={n}>
              <span>{n}</span><h3>{q}</h3><p>{a}</p><strong>{proof}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="method-wrap" id="evidence">
        <div className="section shell">
          <div className="section-head">
            <div><span className="section-no">02 / GOVERNED EVIDENCE</span><h2>Nine years of history,<br />with a trust boundary.</h2></div>
            <p>Raw observations are not modelling evidence until they pass a declared contract.</p>
          </div>
          <div className="metric-row">
            <div><small>Source history</small><strong>3,261</strong><span>complete daily candles</span></div>
            <div><small>Coverage</small><strong>2017–26</strong><span>continuous UTC history</span></div>
            <div><small>Feature snapshot</small><strong>3,229</strong><span>leakage-safe rows</span></div>
            <div><small>Data gaps</small><strong>0</strong><span>missing calendar days</span></div>
          </div>
          <div className="evidence-note">
            <span>CONTRACT</span>
            <h3>One symbol × one complete UTC day.</h3>
            <p>Positive prices, non-negative activity, unique dates, continuous coverage, valid OHLC relationships, and a checksum-bound manifest.</p>
            <b>market_daily.v1</b>
          </div>
        </div>
      </section>

      <section className="section shell" id="model">
        <div className="section-head">
          <div><span className="section-no">03 / MODEL EVIDENCE</span><h2>The candidate had to<br />earn promotion.</h2></div>
          <p>Each fold trains on all prior history, then evaluates a complete, named market regime.</p>
        </div>
        <div className="model-controls">
          <span>RIDGE LOG-RETURN CANDIDATE</span>
          <div className="toggle">
            <button className={metric === "rmse" ? "active" : ""} onClick={() => setMetric("rmse")}>RMSE</button>
            <button className={metric === "direction" ? "active" : ""} onClick={() => setMetric("direction")}>DIRECTION</button>
          </div>
        </div>
        <div className="regime-table">
          <div className="regime-head"><span>Market regime</span><span>{metric === "rmse" ? "Baseline bps" : "Signal"}</span><span>{metric === "rmse" ? "Candidate bps" : "Accuracy"}</span><span>{metric === "rmse" ? "Improvement" : "Decision"}</span></div>
          {regimes.map(([name, baseline, candidate, lift, direction]) => (
            <div className="regime-row" key={name}>
              <strong>{name}</strong>
              <span>{metric === "rmse" ? baseline : "up / down"}</span>
              <span>{metric === "rmse" ? candidate : direction}</span>
              <b>{metric === "rmse" ? lift : "LOST"}</b>
            </div>
          ))}
        </div>
        <div className="model-grid">
          <figure className="chart-card"><img src="/figures/regime-comparison.png" alt="Return RMSE baseline and candidate across seven market regimes" /><figcaption>Seven declared cross-regime folds · lower is better</figcaption></figure>
          <aside className="takeaway">
            <span>RELEASE GATE</span><strong>0 / 7</strong>
            <h3>Candidate loses every regime.</h3>
            <p>The release policy required five wins and positive average improvement. Neither condition passed.</p>
            <div><b>Decision</b><em>BASELINE PRESERVED</em></div>
          </aside>
        </div>
      </section>

      <section className="artifact-wrap">
        <div className="section shell">
          <div className="section-head">
            <div><span className="section-no">04 / FEATURE ABLATION</span><h2>More inputs did not<br />create more signal.</h2></div>
            <p>Ablation separates useful information from feature accumulation.</p>
          </div>
          <div className="ablation-grid">
            <figure className="chart-card"><img src="/figures/feature-ablation.png" alt="Mean return RMSE across feature groups" /><figcaption>Mean cross-regime RMSE · lower is better</figcaption></figure>
            <div className="ablation-cards">
              <article><span>PRICE HISTORY</span><strong>1 / 7</strong><p>28 features · −7.60% mean lift</p></article>
              <article><span>+ OHLCV</span><strong>0 / 7</strong><p>35 features · −14.88% mean lift</p></article>
              <article><span>ALL AVAILABLE</span><strong>0 / 7</strong><p>36 features · −14.95% mean lift</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="method-wrap" id="system">
        <div className="section shell">
          <div className="section-head">
            <div><span className="section-no">05 / PRODUCTION SYSTEM</span><h2>Built to reject safely<br />and explain why.</h2></div>
            <p>Every stage creates an inspectable handoff instead of hiding state in a notebook.</p>
          </div>
          <div className="pipeline">
            {pipeline.map(([label, title, copy], index) => <article key={label}><span>{String(index + 1).padStart(2, "0")} · {label}</span><strong>{title}</strong><p>{copy}</p></article>)}
          </div>
          <div className="guardrails">
            <span>✓ Versioned data contract</span><span>✓ Machine-readable evidence</span><span>✓ Feature ablation</span><span>✓ Fail-safe release policy</span>
          </div>
        </div>
      </section>

      <section className="next shell">
        <span className="section-no">THE OUTCOME</span>
        <h2>Not a trading signal.<br />A governed research product.</h2>
        <p className="closing-copy">The current candidate stays rejected. The next iteration must earn its way forward with alternative horizons, richer causal inputs, uncertainty estimates, and the same uncompromising baseline.</p>
        <div className="next-items"><div><b>01</b><span>Alternative horizons</span></div><div><b>02</b><span>External causal signals</span></div><div><b>03</b><span>Prediction intervals</span></div><div><b>04</b><span>Cost-aware decisions</span></div></div>
      </section>

      <footer><div className="shell footer-inner"><div><span className="coin">₿</span><strong>Bitcoin Forecast Intelligence</strong></div><p>Data engineering · forecasting · model governance</p><a href="https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation" target="_blank" rel="noreferrer">GitHub repository ↗</a></div></footer>
    </main>
  );
}
