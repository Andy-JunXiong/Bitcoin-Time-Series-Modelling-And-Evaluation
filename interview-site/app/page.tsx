const regimes = [
  ["2018", "BEAR MARKET", 370.2, 501.0, "-35.3%", "50.00%"],
  ["2020", "SHOCK + RECOVERY", 424.8, 445.3, "-4.8%", "50.27%"],
  ["2021", "BULL MARKET", 423.2, 609.2, "-44.0%", "50.14%"],
  ["2022", "DELEVERAGING", 337.8, 383.3, "-13.5%", "48.77%"],
  ["2023", "RECOVERY", 229.2, 233.9, "-2.0%", "52.88%"],
  ["2024", "INSTITUTIONAL CYCLE", 276.2, 281.9, "-2.1%", "51.37%"],
  ["2025", "RECENT MARKET", 217.8, 223.3, "-2.5%", "50.96%"],
];

const questions = [
  ["01", "What is predicted?", "Day t information estimates the log return on day t + 1.", "NEXT-DAY LOG RETURN"],
  ["02", "Did the candidate win?", "No. Ridge lost to zero return in every declared market regime.", "0 / 7 REGIMES"],
  ["03", "Was leakage controlled?", "Shifted windows and expanding-history folds preserve the temporal boundary.", "STRICTLY PRIOR HISTORY"],
  ["04", "Did OHLCV add signal?", "Not reliably. Price history lost less badly than the larger feature groups.", "1 / 7 VS 0 / 7"],
  ["05", "Did direction help?", "50.63% mean accuracy is not evidence of economic value.", "NO RELEASE OVERRIDE"],
  ["06", "What was released?", "Nothing. The candidate was rejected and the baseline remained approved.", "FAIL-SAFE DECISION"],
];

const stages = [
  ["01", "SOURCE", "Complete BTCUSDT daily candles"],
  ["02", "CONTRACT", "Continuity, uniqueness and OHLC invariants"],
  ["03", "FEATURE", "Causal lags and shifted windows"],
  ["04", "OBSERVE", "Seven expanding-history regimes"],
  ["05", "CHALLENGE", "Ablation and zero-return baseline"],
  ["06", "DECIDE", "Reject or promote by written policy"],
];

const legacy = [
  ["NAIVE PERSISTENCE", "296.00", "154.06"],
  ["RANDOM FOREST", "305.13", "180.98"],
  ["HIST GRADIENT BOOSTING", "310.09", "182.30"],
  ["RIDGE", "311.05", "189.20"],
  ["ELASTIC NET", "316.67", "193.13"],
];

export default function Home() {
  return (
    <main id="top">
      <header className="nav">
        <a className="wordmark" href="#top"><i>₿</i><span>FORECAST OBSERVATORY</span></a>
        <nav aria-label="Primary navigation">
          <a href="#inquiry">Inquiry</a><a href="#evidence">Evidence</a><a href="#regimes">Regimes</a><a href="#method">Method</a>
        </nav>
        <a className="repo" href="https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation">SOURCE ↗</a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="overline">BITCOIN / TIME-SERIES RESEARCH / 2017—2026</span>
          <h1>Forecasting,<br />without the<br /><em>fiction.</em></h1>
          <p>A nine-year experiment in asking one hard question: can a model improve on predicting no next-day return?</p>
          <a className="text-link" href="#regimes">SEE WHAT SURVIVED <span>↓</span></a>
        </div>
        <div className="observatory" aria-label="Seven-regime release decision">
          <div className="orbit orbit-one"><span>2018</span><span>2021</span><span>2025</span></div>
          <div className="orbit orbit-two"><span>2020</span><span>2023</span></div>
          <div className="orbit orbit-three"><span>2022</span><span>2024</span></div>
          <div className="core">
            <small>REGIMES WON</small><strong>0<span>/7</span></strong><b>CANDIDATE REJECTED</b>
          </div>
          <div className="axis axis-x" /><div className="axis axis-y" />
          <span className="north">ZERO-RETURN BASELINE / PRESERVED</span>
          <span className="east">RIDGE α=10</span>
        </div>
      </section>

      <section className="ticker" aria-label="Research summary">
        <div><b>3,261</b><span>COMPLETE UTC DAYS</span></div>
        <div><b>3,229</b><span>FEATURE ROWS</span></div>
        <div><b>7</b><span>MARKET REGIMES</span></div>
        <div><b>-14.88%</b><span>MEAN RMSE LIFT</span></div>
        <div className="ticker-status"><b>REJECTED</b><span>RELEASE STATUS</span></div>
      </section>

      <section className="thesis">
        <span className="section-tag">THE THESIS</span>
        <blockquote>“The negative result is not an absence of evidence. It is the evidence.”</blockquote>
        <div>
          <p>The platform was designed to make a losing model visible, reproducible and safe to reject.</p>
          <small>NO TRADING CLAIMS<br />NO LIVE PRICE<br />NO PROMOTION WITHOUT EVIDENCE</small>
        </div>
      </section>

      <section className="inquiry section" id="inquiry">
        <header><span className="section-tag">01 / INQUIRY</span><h2>Six questions.<br />No convenient answers.</h2></header>
        <div className="question-list">
          {questions.map(([number, title, copy, result]) => (
            <article key={number}>
              <span>{number}</span><h3>{title}</h3><p>{copy}</p><strong>{result}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="evidence section" id="evidence">
        <header><span className="section-tag">02 / EVIDENCE FIELD</span><h2>Every feature remains on the correct side of time.</h2></header>
        <div className="constellation">
          <div className="target"><span>TARGET</span><strong>t + 1</strong><small>LOG RETURN</small></div>
          <div className="feature f1"><b>PRICE</b><span>1 / 2 / 3 / 7 / 14 / 30D</span></div>
          <div className="feature f2"><b>RETURNS</b><span>LAGS + VOLATILITY</span></div>
          <div className="feature f3"><b>OHLC</b><span>DAILY MARKET RANGE</span></div>
          <div className="feature f4"><b>VOLUME</b><span>BASE + QUOTE</span></div>
          <div className="feature f5"><b>ACTIVITY</b><span>TRADE COUNT</span></div>
          <div className="feature f6"><b>CALENDAR</b><span>DAY + MONTH</span></div>
          <i className="path p1" /><i className="path p2" /><i className="path p3" />
        </div>
        <div className="evidence-notes">
          <article><span>BOUNDARY</span><h3>Shift first. Calculate second.</h3><p>Rolling statistics use only information available at the end of day t.</p></article>
          <article><span>CONTRACT</span><h3>One symbol. One complete UTC day.</h3><p>Continuity, numeric validity, uniqueness and OHLC relationships are checked before research.</p></article>
          <article><span>LINEAGE</span><h3>Raw history is checksum-bound.</h3><p>The manifest records source, coverage, row count and SHA-256 evidence.</p></article>
        </div>
      </section>

      <section className="regimes section" id="regimes">
        <header><span className="section-tag">03 / REGIME SPECTRUM</span><h2>Seven climates.<br />The same verdict.</h2><p>Return RMSE in basis points. Shorter is better.</p></header>
        <div className="spectrum">
          {regimes.map(([year, name, baseline, candidate, lift, direction]) => (
            <article key={String(year)}>
              <div className="regime-name"><b>{year}</b><span>{name}</span></div>
              <div className="tracks">
                <div><span>BASE</span><i style={{ width: `${Number(baseline) / 6.5}%` }} /><em>{baseline}</em></div>
                <div className="candidate"><span>MODEL</span><i style={{ width: `${Number(candidate) / 6.5}%` }} /><em>{candidate}</em></div>
              </div>
              <div className="regime-outcome"><b>{lift}</b><span>{direction} DIR.</span></div>
            </article>
          ))}
        </div>
        <div className="verdict">
          <div><span>RELEASE OBSERVATION</span><strong>0</strong><small>REGIMES WON</small></div>
          <p>The candidate failed both written conditions: at least five regime wins and positive average RMSE improvement.</p>
          <b>BASELINE<br />PRESERVED</b>
        </div>
      </section>

      <section className="ablation section">
        <header><span className="section-tag">04 / ABLATION LANDSCAPE</span><h2>More inputs.<br />Less evidence.</h2></header>
        <div className="ablation-lines">
          <article><span>PRICE HISTORY / 28 FEATURES</span><strong>-7.60%</strong><i><b style={{ width: "51%" }} /></i><small>1 / 7 REGIMES WON</small></article>
          <article><span>PRICE + OHLCV / 35 FEATURES</span><strong>-14.88%</strong><i><b style={{ width: "99%" }} /></i><small>0 / 7 REGIMES WON</small></article>
          <article><span>ALL AVAILABLE / 36 FEATURES</span><strong>-14.95%</strong><i><b style={{ width: "100%" }} /></i><small>0 / 7 REGIMES WON</small></article>
        </div>
        <p className="ablation-note">Adding contemporaneous market fields did not create stable incremental signal. This is evidence against this candidate—not against every possible Bitcoin forecasting horizon.</p>
      </section>

      <section className="archive section">
        <header><span className="section-tag">ARCHIVE / 2019 PRICE-LEVEL STUDY</span><h2>An older experiment left the same warning.</h2><p>181 chronological holdout forecasts. This is historical context, not the current release candidate.</p></header>
        <div className="archive-table">
          <div className="archive-head"><span>MODEL</span><span>RMSE USD</span><span>MAE USD</span></div>
          {legacy.map(([model, rmse, mae], index) => <div className={index === 0 ? "archive-row best" : "archive-row"} key={model}><b>{model}</b><span>{rmse}</span><span>{mae}</span></div>)}
        </div>
        <strong className="archive-result">0 / 4 ML MODELS BEAT PERSISTENCE</strong>
      </section>

      <section className="method section" id="method">
        <header><span className="section-tag">05 / METHOD</span><h2>A chain of custody for a forecast.</h2></header>
        <div className="method-line">
          {stages.map(([number, title, copy]) => <article key={number}><span>{number}</span><i /><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
        <div className="principles">
          <p><b>TEMPORAL BOUNDARY</b> Day t information → day t + 1 target</p>
          <p><b>BASELINE DISCIPLINE</b> Every candidate must earn promotion</p>
          <p><b>AUDITABILITY</b> Contracts + metrics + release policy</p>
        </div>
      </section>

      <section className="closing">
        <span className="section-tag">FINAL OBSERVATION</span>
        <h2>The model failed.<br /><em>The evaluation held.</em></h2>
        <p>Not a trading signal. Not a profitability claim. A defensible record of what the evidence did—and did not—support.</p>
        <a href="https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation">OPEN THE RESEARCH REPOSITORY ↗</a>
        <small>RESEARCH AND EDUCATIONAL USE ONLY / NOT FINANCIAL ADVICE</small>
      </section>
    </main>
  );
}
