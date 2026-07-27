import benchmark from "../public/evidence/benchmark.json";
import platform from "../public/evidence/platform-summary.json";

const shortCommit = process.env.GIT_COMMIT_SHA ?? "__COMMIT_SHA__";
const repositoryUrl =
  "https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation";

const mean = (values: number[]) =>
  values.reduce((total, value) => total + value, 0) / values.length;
const fixed = (value: number, digits = 2) => value.toFixed(digits);
const humanize = (value: string) => {
  const words = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const regimes = platform.regimes;
const gate = platform.release_gate;
const meanBaselineRmse = mean(regimes.map((row) => row.baseline_rmse_bps));
const meanCandidateRmse = mean(regimes.map((row) => row.candidate_rmse_bps));
const regimeScale = Math.max(
  ...regimes.flatMap((row) => [row.baseline_rmse_bps, row.candidate_rmse_bps]),
);

const orderedBenchmark = [...benchmark].sort((a, b) => a.rmse - b.rmse);
const naive = orderedBenchmark.find((row) => row.model === "naive");
if (!naive) throw new Error("benchmark.json must include the naive baseline");
const bestMl = orderedBenchmark.find((row) => row.model !== "naive");
if (!bestMl) throw new Error("benchmark.json must include an ML candidate");
const benchmarkScale = Math.max(...orderedBenchmark.map((row) => row.rmse));

const displayName: Record<string, string> = {
  naive: "Naive persistence",
  random_forest: "Random Forest",
  hist_gradient_boosting: "HistGradientBoosting",
  ridge: "Ridge",
  elastic_net: "Elastic Net",
};

export default function Home() {
  return (
    <main>
      <header className="provenance">
        <span>source: outputs/platform/platform_summary.json + outputs/metrics/benchmark.json</span>
        <span>commit: {shortCommit}</span>
        <span>repro: python -m bitcoin_forecasting.research</span>
      </header>

      <div className="shell">
        <section className="headline">
          <div className="status-line">
            <span>Report / BTCUSDT / 1D / UTC / rows: {platform.dataset.row_count.toLocaleString()} / features: {platform.dataset.feature_row_count.toLocaleString()}</span>
            <span>Status: Candidate rejected</span>
          </div>
          <h1>Bitcoin forecast benchmark report</h1>
          <p>
            Leakage-safe model evidence across seven market regimes. The
            candidate did not earn promotion; the zero-return baseline remains
            the approved reference.
          </p>

          <div className="headline-metrics">
            <article className="baseline-panel">
              <span>MEAN BASELINE RMSE</span>
              <strong>{fixed(meanBaselineRmse, 1)} BPS</strong>
              <small>ZERO-RETURN REFERENCE</small>
            </article>
            <article>
              <span>MEAN CANDIDATE RMSE</span>
              <strong>{fixed(meanCandidateRmse, 1)} BPS</strong>
              <small>RIDGE / ALPHA 10</small>
            </article>
            <article>
              <span>REGIMES &gt; BASELINE</span>
              <strong className="verdict">{gate.folds_won}/{gate.folds_total}</strong>
              <small>REQUIRED: {gate.required_folds_won}/{gate.folds_total}</small>
            </article>
          </div>
        </section>

        <section className="report-section" id="platform">
          <header className="section-header">
            <div><span>01</span><h2>Cross-regime release evidence</h2></div>
            <p>
              target={humanize(platform.experiment.target)} / candidate={humanize(platform.experiment.candidate)}
              <br />validation={platform.experiment.validation}
            </p>
          </header>

          <div className="table-scroll">
            <table>
              <caption>Return model results / RMSE in basis points / lower is better</caption>
              <thead>
                <tr>
                  <th>Regime</th><th>Train</th><th>Test</th><th>Baseline RMSE</th>
                  <th>Candidate RMSE</th><th>Δ vs baseline</th><th>Direction</th><th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {regimes.map((row) => (
                  <tr key={row.regime}>
                    <td>{row.label}</td><td>{row.n_train}</td><td>{row.n_test}</td>
                    <td>{fixed(row.baseline_rmse_bps, 1)}</td>
                    <td>{fixed(row.candidate_rmse_bps, 1)}</td>
                    <td>{fixed(row.rmse_improvement_percent, 1)}%</td>
                    <td>{fixed(row.direction_accuracy_percent, 2)}%</td>
                    <td className="verdict">LOST</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-panel">
            <div className="chart-title">
              <span>Fig. 01 / Regime RMSE</span>
              <span>Baseline <i className="baseline-key" /> Candidate <i className="candidate-key" /></span>
            </div>
            {regimes.map((row) => (
              <div className="regime-bars" key={row.regime}>
                <span>{row.label}</span>
                <div className="paired-bars">
                  <div>
                    <span><i className="baseline-bar" style={{ width: `${(row.baseline_rmse_bps / regimeScale) * 100}%` }} /></span>
                    <b>{fixed(row.baseline_rmse_bps, 1)} bps</b>
                  </div>
                  <div>
                    <span><i className="candidate-bar" style={{ width: `${(row.candidate_rmse_bps / regimeScale) * 100}%` }} /></span>
                    <b>{fixed(row.candidate_rmse_bps, 1)} bps</b>
                  </div>
                </div>
                <b>{fixed(row.rmse_improvement_percent, 1)}%</b>
              </div>
            ))}
          </div>

          <div className="release-log">
            <span>[release gate]</span>
            <p><b>rule 01</b> candidate must beat baseline RMSE in at least 60% of regimes</p>
            <p><b>rule 02</b> mean RMSE improvement across regimes must be positive</p>
            <p><b>observed</b> wins={gate.folds_won}/{gate.folds_total}; mean lift={fixed(gate.mean_rmse_improvement_percent, 2)}%</p>
            <strong>decision=Rejected; baseline=Preserved</strong>
          </div>
        </section>

        <section className="report-section" id="ablation">
          <header className="section-header">
            <div><span>02</span><h2>Feature ablation</h2></div>
            <p>More columns were permitted to compete. None were assumed to add signal.</p>
          </header>
          <div className="ablation-grid">
            {platform.ablation.map((row) => (
              <article key={row.feature_group}>
                <span>{row.feature_group === "ohlcv" ? "OHLCV" : humanize(row.feature_group)}</span>
                <strong>{row.feature_count}</strong>
                <small>FEATURES</small>
                <dl>
                  <div><dt>regimes won</dt><dd>{row.folds_won}/{row.folds_total}</dd></div>
                  <div><dt>mean RMSE</dt><dd>{fixed(row.mean_candidate_rmse_bps, 1)} bps</dd></div>
                  <div><dt>mean lift</dt><dd>{fixed(row.mean_rmse_improvement_percent, 2)}%</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="report-section" id="archive">
          <header className="section-header">
            <div><span>03</span><h2>Archive / 2019 price-level benchmark</h2></div>
            <p>holdout=2019-01-01..2019-06-30 / n={naive.n_test} daily predictions</p>
          </header>

          <div className="archive-metrics">
            <article className="baseline-panel">
              <span>BASELINE RMSE</span><strong>${fixed(naive.rmse)}</strong><small>NAIVE PERSISTENCE</small>
            </article>
            <article>
              <span>BEST ML RMSE</span><strong>${fixed(bestMl.rmse)}</strong><small>{displayName[bestMl.model]}</small>
            </article>
            <article>
              <span>ML MODELS &gt; NAIVE</span><strong>0/4</strong><small>HOLDOUT RMSE</small>
            </article>
          </div>

          <div className="table-scroll">
            <table>
              <caption>Original next-day closing-price benchmark</caption>
              <thead><tr><th>Model</th><th>MAE</th><th>RMSE</th><th>MAPE</th><th>Direction acc.</th><th>Δ vs naive</th></tr></thead>
              <tbody>
                {orderedBenchmark.map((row) => {
                  const delta = ((row.rmse / naive.rmse) - 1) * 100;
                  return (
                    <tr key={row.model}>
                      <td>{displayName[row.model] ?? row.model}</td>
                      <td>${fixed(row.mae)}</td><td>${fixed(row.rmse)}</td>
                      <td>{fixed(row.mape_percent)}%</td>
                      <td>{row.model === "naive" ? "N/A" : `${fixed(row.direction_accuracy_percent)}%`}</td>
                      <td>
                        {row.model === "naive" ? "REFERENCE" : `+${fixed(delta, 1)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="chart-panel">
            <div className="chart-title"><span>Fig. 02 / Holdout RMSE</span><span>USD / lower is better</span></div>
            {orderedBenchmark.map((row) => (
              <div className="model-bar" key={row.model}>
                <span>{displayName[row.model] ?? humanize(row.model)}</span>
                <div><i className={row.model === "naive" ? "baseline-bar" : "candidate-bar"} style={{ width: `${(row.rmse / benchmarkScale) * 100}%` }} /></div>
                <b>${fixed(row.rmse)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="report-section" id="method">
          <header className="section-header">
            <div><span>04</span><h2>Methodology / control log</h2></div>
            <p>Compact controls that keep the forecast boundary inspectable.</p>
          </header>
          <div className="control-log">
            <p><span>[PASS]</span><b>source contract</b> complete UTC candles; unique dates; valid OHLC relationships</p>
            <p><span>[PASS]</span><b>target alignment</b> day t features map to day t + 1 target</p>
            <p><span>[PASS]</span><b>rolling features</b> shifted before aggregate calculation</p>
            <p><span>[PASS]</span><b>validation</b> expanding history; no evaluated regime enters training</p>
            <p><span>[PASS]</span><b>baseline</b> zero-return candidate challenge; persistence in archived study</p>
            <p><span>[PASS]</span><b>release policy</b> written thresholds applied before publication</p>
            <p><span>[PASS]</span><b>audit outputs</b> committed JSON, CSV evidence and reproducible commands</p>
          </div>
        </section>

        <section className="interpretation">
          <span>INTERPRETATION</span>
          <h2>The negative result is the result.</h2>
          <p>
            Greater model complexity did not create stable out-of-sample
            improvement. The benchmark prevented a sophisticated candidate from
            being mistaken for a better forecast.
          </p>
          <p>
            Next steps remain hypotheses: alternative horizons, external causal
            signals, calibrated uncertainty and cost-aware decisions. Every
            replacement must face the same release discipline.
          </p>
        </section>
      </div>

      <footer>
        <span>Research and educational use only / Not financial advice</span>
        <a href={repositoryUrl}>Repository ↗</a>
      </footer>
    </main>
  );
}
