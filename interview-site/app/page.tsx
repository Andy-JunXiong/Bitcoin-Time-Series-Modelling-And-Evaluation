const regimes = [
  ["2018 BEAR", "370.2", "501.0", "-35.3%", "50.00%"],
  ["2020 SHOCK", "424.8", "445.3", "-4.8%", "50.27%"],
  ["2021 BULL", "423.2", "609.2", "-44.0%", "50.14%"],
  ["2022 DELEVERAGING", "337.8", "383.3", "-13.5%", "48.77%"],
  ["2023 RECOVERY", "229.2", "233.9", "-2.0%", "52.88%"],
  ["2024 INSTITUTIONAL", "276.2", "281.9", "-2.1%", "51.37%"],
  ["2025 RECENT", "217.8", "223.3", "-2.5%", "50.96%"],
];

const questions = [
  ["01", "What exactly is being predicted?", "Information available at the end of day t estimates Bitcoin's log return on day t + 1.", "DAY t FEATURES -> DAY t + 1 RETURN"],
  ["02", "Did the candidate beat the baseline?", "No. The Ridge candidate lost to a zero-return forecast in every declared regime.", "0 OF 7 REGIMES WON"],
  ["03", "Was temporal leakage controlled?", "Yes. Shifted rolling features and expanding-history folds preserve the forecasting boundary.", "LEAKAGE-SAFE PIPELINE"],
  ["04", "Did more market fields help?", "Not reliably. Price history lost less badly than the larger OHLCV and full feature groups.", "PRICE HISTORY: 1 OF 7"],
  ["05", "Did direction accuracy change the decision?", "No. Mean direction accuracy was 50.63%, which is not evidence of economic value.", "50.63% MEAN DIRECTION"],
  ["06", "What is the defensible conclusion?", "Model complexity did not create stable out-of-sample improvement, so the baseline stayed approved.", "CANDIDATE REJECTED"],
];

const pipeline = [
  ["01", "SOURCE", "Complete Binance BTCUSDT UTC candles"],
  ["02", "VALIDATE", "Dates, continuity, nulls and OHLC invariants"],
  ["03", "FEATURES", "Causal lags and shifted rolling windows"],
  ["04", "BACKTEST", "Seven expanding-history market regimes"],
  ["05", "ABLATE", "Price, OHLCV and full feature groups"],
  ["06", "RELEASE", "Versioned gate preserves the baseline"],
];

const legacy = [
  ["Naive persistence", "154.06", "296.00", "2.24%", "N/A"],
  ["Random Forest", "180.98", "305.13", "2.84%", "46.41%"],
  ["HistGradientBoosting", "182.30", "310.09", "2.81%", "50.83%"],
  ["Ridge", "189.20", "311.05", "3.14%", "51.38%"],
  ["Elastic Net", "193.13", "316.67", "3.15%", "49.17%"],
];

export default function Home() {
  return (
    <main id="overview">
      <header className="topbar">
        <a className="brand" href="#overview"><span className="btc-mark">B</span><span>BITCOIN FORECASTING LAB</span></a>
        <nav aria-label="Primary navigation">
          <a href="#overview">Overview</a><a href="#questions">Questions</a><a href="#evidence">Evidence</a><a href="#benchmark">Benchmark</a><a href="#system">System</a>
        </nav>
        <span className="verified"><i /> BENCHMARK VERIFIED</span>
      </header>

      <aside className="rail" aria-label="Section navigation">
        <span>RESEARCH / 2026</span>
        <a href="#overview"><b>01</b> Overview</a>
        <a href="#questions"><b>02</b> Questions</a>
        <a href="#evidence"><b>03</b> Evidence</a>
        <a href="#benchmark"><b>04</b> Benchmark</a>
        <a href="#system"><b>05</b> System</a>
        <a href="#conclusion"><b>06</b> Conclusion</a>
        <small>RMSE LOWER IS BETTER<br />TARGET DAY t + 1<br />UTC DAILY GRAIN</small>
      </aside>

      <div className="page">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">RESEARCH BENCHMARK / NEXT-DAY RETURNS</span>
            <h1>Can a return model survive <em>seven Bitcoin regimes?</em></h1>
            <p className="lead">A leakage-safe, expanding-history evaluation of Bitcoin return forecasting against an auditable zero-return baseline.</p>
            <p className="support">The project tests whether price history and OHLCV features create genuine out-of-sample value across bear markets, shocks, recoveries and institutional cycles.</p>
            <div className="actions">
              <a className="button primary" href="#benchmark">EXPLORE THE BENCHMARK</a>
              <a className="button secondary" href="https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation">VIEW SOURCE CODE <span>↗</span></a>
            </div>
          </div>
          <div className="hero-ledger" aria-label="Release decision summary">
            <div className="ledger-head"><span>MODEL RELEASE LEDGER</span><b>REJECTED</b></div>
            <div className="hash">SHA / EVIDENCE / 2026-07-21</div>
            <strong className="hero-score">0<span>/7</span></strong>
            <p>DECLARED REGIMES WON</p>
            <dl>
              <div><dt>Candidate</dt><dd>RIDGE / ALPHA 10</dd></div>
              <div><dt>Mean RMSE lift</dt><dd className="negative">-14.88%</dd></div>
              <div><dt>Required wins</dt><dd>5 / 7</dd></div>
              <div><dt>Baseline</dt><dd className="positive">PRESERVED</dd></div>
            </dl>
          </div>
        </section>

        <section className="metrics" aria-label="Project metrics">
          <article><span>COMPLETE UTC DAYS</span><strong>3,261</strong><small>2017-08-17 to 2026-07-21</small></article>
          <article><span>FEATURE ROWS</span><strong>3,229</strong><small>leakage-safe observations</small></article>
          <article><span>MARKET REGIMES</span><strong>7</strong><small>expanding-history folds</small></article>
          <article className="metric-highlight"><span>CANDIDATE WINS</span><strong>0 / 7</strong><small>baseline remains approved</small></article>
        </section>

        <section className="section" id="questions">
          <header className="section-heading"><span>02 / RESEARCH QUESTIONS</span><h2>Start with the decision boundary.</h2><p>Every answer is tied to committed evidence, a declared rule or a measurable result.</p></header>
          <div className="question-grid">
            {questions.map(([number, title, copy, evidence], index) => (
              <article className={index === 1 ? "question featured" : "question"} key={number}>
                <span>{number}</span><h3>{title}</h3><p>{copy}</p><strong>{evidence}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="evidence">
          <header className="section-heading"><span>03 / MARKET & FEATURE EVIDENCE</span><h2>The model saw more than yesterday's return.</h2><p>More inputs were allowed to compete. None were assumed to add signal.</p></header>
          <div className="evidence-grid">
            <article className="evidence-lead">
              <span>FINDING 01</span><h3>A hard baseline is a feature, not an inconvenience.</h3>
              <p>A zero-return forecast asks the candidate to improve on no predictable movement. Across all seven regimes, the Ridge model increased RMSE.</p>
              <div className="range"><i /><b>2017</b><i /><b>2019</b><i /><b>2021</b><i /><b>2023</b><i /><b>2025</b></div>
            </article>
            <article><span>FINDING 02 / PRICE HISTORY</span><h3>28 causal features</h3><ul><li>1, 2, 3, 7, 14 and 30-day lags</li><li>Rolling price means</li><li>Return and volatility history</li></ul></article>
            <article><span>FINDING 03 / OHLCV</span><h3>7 added market fields</h3><ul><li>Open, high, low and close</li><li>Base and quote volume</li><li>Trade count and volume change</li></ul></article>
          </div>
          <div className="feature-flow">
            <div><span>01</span><b>PRICE HISTORY</b><small>lags + returns</small></div><i>→</i>
            <div><span>02</span><b>OHLCV ACTIVITY</b><small>market fields</small></div><i>→</i>
            <div><span>03</span><b>SHIFTED WINDOWS</b><small>no future access</small></div><i>→</i>
            <div><span>04</span><b>NEXT-DAY RETURN</b><small>day t + 1 target</small></div>
          </div>
        </section>

        <section className="section benchmark" id="benchmark">
          <header className="section-heading"><span>04 / CROSS-REGIME BENCHMARK</span><h2>The candidate was required to beat doing nothing.</h2><p>Each fold trained only on history before the named market regime.</p></header>
          <div className="benchmark-layout">
            <div className="table-wrap">
              <table>
                <caption>Ridge log-return candidate / return RMSE in basis points</caption>
                <thead><tr><th>Regime</th><th>Baseline</th><th>Candidate</th><th>Lift</th><th>Direction</th></tr></thead>
                <tbody>{regimes.map((row) => <tr key={row[0]}>{row.map((value, index) => <td className={index === 3 ? "negative" : ""} key={value}>{value}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <aside className="result-card"><span>RELEASE RESULT</span><strong>0 / 7</strong><h3>Candidate regimes won.</h3><p>Metric: cross-regime RMSE<br />Lower is better</p><b>BASELINE PRESERVED</b></aside>
          </div>

          <div className="negative-result">
            <header><span>THE NEGATIVE RESULT</span><h2>IS THE RESULT.</h2><p>More features did not produce more reliable forecasts. The release gate prevented complexity from being mistaken for predictive value.</p></header>
            <div className="result-facts">
              <article className="orange-top"><span>BASELINE</span><strong>ZERO RETURN</strong><b>0 / 7 LOSSES</b></article>
              <article><span>CLOSEST FEATURE GROUP</span><strong>PRICE HISTORY</strong><b>-7.60% MEAN LIFT</b></article>
              <article className="signal-top"><span>DIRECTION ACCURACY</span><strong>RIDGE</strong><b>50.63% MEAN</b></article>
            </div>
          </div>

          <div className="ablation">
            <header><span>FEATURE ABLATION</span><h3>More inputs did not create more signal.</h3></header>
            {[["PRICE HISTORY", 1, "-7.60%", "78%"], ["PRICE + OHLCV", 0, "-14.88%", "100%"], ["ALL AVAILABLE", 0, "-14.95%", "100%"]].map(([name, wins, lift, width]) => (
              <div className="bar-row" key={name}><span>{name}</span><div><i style={{ width }} /></div><b>{wins} / 7</b><em>{lift}</em></div>
            ))}
          </div>
        </section>

        <section className="section legacy">
          <header className="section-heading"><span>HISTORICAL EVIDENCE / 2019 PRICE-LEVEL BENCHMARK</span><h2>The earlier benchmark reached the same warning.</h2><p>This archived experiment predicts closing-price levels. It is retained as research history, not the current release candidate.</p></header>
          <div className="table-wrap">
            <table>
              <caption>181 holdout predictions / 2019-01-01 to 2019-06-30</caption>
              <thead><tr><th>Model</th><th>MAE USD</th><th>RMSE USD</th><th>MAPE</th><th>Direction</th></tr></thead>
              <tbody>{legacy.map((row, rowIndex) => <tr className={rowIndex === 0 ? "best" : ""} key={row[0]}>{row.map((value) => <td key={value}>{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="legacy-note"><b>0 / 4 ML MODELS BEAT PERSISTENCE.</b> The old result supports the platform's baseline discipline, but it does not replace the current seven-regime return evaluation.</p>
        </section>

        <section className="section" id="system">
          <header className="section-heading"><span>05 / EVALUATION SYSTEM</span><h2>Evaluation is the product.</h2><p>The platform preserves the temporal boundary, challenges the model and publishes auditable evidence.</p></header>
          <div className="pipeline">
            {pipeline.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
          <div className="principles">
            <article><span>TEMPORAL BOUNDARY</span><strong>Day t information → day t + 1 target</strong></article>
            <article><span>BASELINE DISCIPLINE</span><strong>Every candidate must earn promotion</strong></article>
            <article><span>AUDITABILITY</span><strong>Contracts + committed metrics + release policy</strong></article>
          </div>
        </section>

        <section className="conclusion" id="conclusion">
          <span>THE OUTCOME</span><h2>Not a trading signal.<br />A defensible forecasting benchmark.</h2>
          <p>The project demonstrates why honest evaluation matters more than producing an impressive-looking prediction.</p>
          <div><b>Leakage-safe features</b><b>Cross-regime testing</b><b>Baseline comparison</b><b>Reproducible evidence</b></div>
          <a className="button conclusion-button" href="https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation">VIEW THE REPOSITORY ↗</a>
          <small>RESEARCH AND EDUCATIONAL USE ONLY / NOT FINANCIAL ADVICE</small>
        </section>
      </div>
    </main>
  );
}
