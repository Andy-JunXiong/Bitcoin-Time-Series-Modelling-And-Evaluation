import benchmark from "../public/evidence/benchmark.json";
import platform from "../public/evidence/platform-summary.json";

const shortCommit = "__COMMIT_SHA__";
const repositoryUrl =
  "https://github.com/Andy-JunXiong/Bitcoin-Time-Series-Modelling-And-Evaluation";

const mean = (values: number[]) =>
  values.reduce((total, value) => total + value, 0) / values.length;
const fixed = (value: number, digits = 2) => value.toFixed(digits);

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
            <span>REPORT / BTCUSDT / 1D / UTC / ROWS: {platform.dataset.row_count.toLocaleString()} / FEATURES: {platform.dataset.feature_row_count.toLocaleString()}</span>
            <span>STATUS: CANDIDATE REJECTED</span>
          </div>
          <h1>BITCOIN FORECAST<br />BENCHMARK REPORT</h1>
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
              <strong className="worse">{gate.folds_won}/{gate.folds_total}</strong>
              <small>REQUIRED: {gate.required_folds_won}/{gate.folds_total}</small>
            </article>
          </div>
        </section>

        <section className="report-section" id="platform">
          <header className="section-header">
            <div><span>01</span><h2>CROSS-REGIME RELEASE EVIDENCE</h2></div>
            <p>
              target={platform.experiment.target} / candidate={platform.experiment.candidate}
              <br />validation={platform.experiment.validation}
            </p>
          </header>

          <div className="table-scroll">
            <table>
              <caption>RETURN MODEL RESULTS / RMSE IN BASIS POINTS / LOWER IS BETTER</caption>
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
                    <td className="baseline-value">{fixed(row.baseline_rmse_bps, 1)}</td>
                    <td>{fixed(row.candidate_rmse_bps, 1)}</td>
                    <td className="worse">{fixed(row.rmse_improvement_percent, 1)}%</td>
                    <td>{fixed(row.direction_accuracy_percent, 2)}%</td>
                    <td className="worse">LOST</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-panel">
            <div className="chart-title">
              <span>FIG. 01 / REGIME RMSE</span><span>BASELINE <i className="baseline-key" /> CANDIDATE <i /></span>
            </div>
            {regimes.map((row) => (
              <div className="regime-bars" key={row.regime}>
                <span>{row.regime.toUpperCase()}</span>
                <div>
                  <i className="baseline-bar" style={{ width: `${(row.baseline_rmse_bps / regimeScale) * 100}%` }} />
                  <i style={{ width: `${(row.candidate_rmse_bps / regimeScale) * 100}%` }} />
                </div>
                <b className="worse">{fixed(row.rmse_improvement_percent, 1)}%</b>
              </div>
            ))}
          </div>

          <div className="release-log">
            <span>[release_gate]</span>
            <p><b>rule_01</b> candidate must beat baseline RMSE in at least 60% of regimes</p>
            <p><b>rule_02</b> mean RMSE improvement across regimes must be positive</p>
            <p><b>observed</b> wins={gate.folds_won}/{gate.folds_total}; mean_lift=<i>{fixed(gate.mean_rmse_improvement_percent, 2)}%</i></p>
            <strong className="baseline-text">decision=REJECTED; baseline=PRESERVED</strong>
          </div>
        </section>

        <section className="report-section" id="ablation">
          <header className="section-header">
            <div><span>02</span><h2>FEATURE ABLATION</h2></div>
            <p>More columns were permitted to compete. None were assumed to add signal.</p>
          </header>
          <div className="ablation-grid">
            {platform.ablation.map((row) => (
              <article key={row.feature_group}>
                <span>{row.feature_group.toUpperCase()}</span>
                <strong>{row.feature_count}</strong>
                <small>FEATURES</small>
                <dl>
                  <div><dt>regimes won</dt><dd>{row.folds_won}/{row.folds_total}</dd></div>
                  <div><dt>mean RMSE</dt><dd>{fixed(row.mean_candidate_rmse_bps, 1)} bps</dd></div>
                  <div><dt>mean lift</dt><dd className="worse">{fixed(row.mean_rmse_improvement_percent, 2)}%</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="report-section" id="archive">
          <header className="section-header">
            <div><span>03</span><h2>ARCHIVE / 2019 PRICE-LEVEL BENCHMARK</h2></div>
            <p>holdout=2019-01-01..2019-06-30 / n={naive.n_test} daily predictions</p>
          </header>

          <div className="archive-metrics">
            <article className="baseline-panel">
              <span>BASELINE RMSE</span><strong>${fixed(naive.rmse)}</strong><small>NAIVE PERSISTENCE</small>
            </article>
            <article>
              <span>BEST ML RMSE</span><strong>${fixed(bestMl.rmse)}</strong><small>{displayName[bestMl.model].toUpperCase()}</small>
            </article>
            <article>
              <span>ML MODELS &gt; NAIVE</span><strong className="worse">0/4</strong><small>HOLDOUT RMSE</small>
            </article>
          </div>

          <div className="table-scroll">
            <table>
              <caption>ORIGINAL NEXT-DAY CLOSING-PRICE BENCHMARK</caption>
              <thead><tr><th>Model</th><th>MAE</th><th>RMSE</th><th>MAPE</th><th>Direction acc.</th><th>Δ vs naive</th></tr></thead>
              <tbody>
                {orderedBenchmark.map((row) => {
                  const delta = ((row.rmse / naive.rmse) - 1) * 100;
                  return (
                    <tr className={row.model === "naive" ? "baseline-row" : ""} key={row.model}>
                      <td>{displayName[row.model] ?? row.model}</td>
                      <td>${fixed(row.mae)}</td><td>${fixed(row.rmse)}</td>
                      <td>{fixed(row.mape_percent)}%</td>
                      <td>{row.model === "naive" ? "N/A" : `${fixed(row.direction_accuracy_percent)}%`}</td>
                      <td className={row.model === "naive" ? "baseline-value" : "worse"}>
                        {row.model === "naive" ? "REFERENCE" : `+${fixed(delta, 1)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="chart-panel">
            <div className="chart-title"><span>FIG. 02 / HOLDOUT RMSE</span><span>USD / LOWER IS BETTER</span></div>
            {orderedBenchmark.map((row) => (
              <div className="model-bar" key={row.model}>
                <span>{(displayName[row.model] ?? row.model).toUpperCase()}</span>
                <div><i className={row.model === "naive" ? "baseline-bar" : ""} style={{ width: `${(row.rmse / benchmarkScale) * 100}%` }} /></div>
                <b>${fixed(row.rmse)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="report-section" id="method">
          <header className="section-header">
            <div><span>04</span><h2>METHODOLOGY / CONTROL LOG</h2></div>
            <p>Compact controls that keep the forecast boundary inspectable.</p>
          </header>
          <div className="control-log">
            <p><span>[PASS]</span><b>source_contract</b> complete UTC candles; unique dates; valid OHLC relationships</p>
            <p><span>[PASS]</span><b>target_alignment</b> day t features map to day t + 1 target</p>
            <p><span>[PASS]</span><b>rolling_features</b> shifted before aggregate calculation</p>
            <p><span>[PASS]</span><b>validation</b> expanding history; no evaluated regime enters training</p>
            <p><span>[PASS]</span><b>baseline</b> zero-return candidate challenge; persistence in archived study</p>
            <p><span>[PASS]</span><b>release_policy</b> written thresholds applied before publication</p>
            <p><span>[PASS]</span><b>audit_outputs</b> committed JSON, CSV evidence and reproducible commands</p>
          </div>
        </section>

        <section className="interpretation">
          <span>INTERPRETATION</span>
          <h2>THE NEGATIVE RESULT IS THE RESULT.</h2>
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
        <span>RESEARCH AND EDUCATIONAL USE ONLY / NOT FINANCIAL ADVICE</span>
        <a href={repositoryUrl}>REPOSITORY ↗</a>
      </footer>
    </main>
  );
}
