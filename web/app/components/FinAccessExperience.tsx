"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Concept,
  ageData,
  concepts,
  educationData,
  inclusionSignals,
  incomeData,
  internetData,
  mobileSignals,
  modelMetrics,
  overviewMetrics,
} from "../data";
import { Assessment } from "./Assessment";
import { GroupedBars, ModelScore, SignalBars, Statistic } from "./DataViews";

type SectionKey = "overview" | "inclusion" | "mobile" | "assessment" | "methodology";

const navigation: { key: SectionKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "inclusion", label: "Financial inclusion" },
  { key: "mobile", label: "Mobile money" },
  { key: "assessment", label: "Assessment" },
  { key: "methodology", label: "Methodology" },
];

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className="section-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{copy}</p>
    </header>
  );
}

function ResearchNote({ children }: { children: React.ReactNode }) {
  return <p className="research-note"><span aria-hidden="true">Note</span>{children}</p>;
}

function Overview({ onNavigate }: { onNavigate: (section: SectionKey) => void }) {
  const heroStatistics = [overviewMetrics[1], overviewMetrics[2], overviewMetrics[0], overviewMetrics[3]];

  return (
    <>
      <section className="report-hero">
        <div className="hero-copy">
          <span className="eyebrow">Financial access · Eswatini</span>
          <h1>Financial Access in Eswatini</h1>
          <p>Explore national evidence, compare access patterns, and assess one profile through two independently validated machine-learning models.</p>
          <div className="hero-actions">
            <button className="button button--primary" onClick={() => onNavigate("assessment")}>Start an assessment</button>
            <button className="text-link" onClick={() => onNavigate("methodology")}>Review the evidence <span aria-hidden="true">→</span></button>
          </div>
        </div>
        <aside className="hero-context" aria-label="Research brief details">
          <span className="hero-context__index">SZ / 2025</span>
          <dl>
            <div><dt>Source</dt><dd>World Bank Global Findex</dd></div>
            <div><dt>Study</dt><dd>Financial inclusion and mobile money</dd></div>
            <div><dt>Approach</dt><dd>Survey evidence and explainable prediction</dd></div>
          </dl>
        </aside>
      </section>

      <section className="metric-strip" aria-label="Project summary">
        {heroStatistics.map((metric) => <Statistic key={metric.label} value={metric.value} label={metric.label === "Financially included" ? "Financial institution account" : metric.label} note={metric.note} />)}
      </section>

      <section className="analysis-story">
        <header className="story-heading">
          <span className="chapter-number">01</span>
          <div>
            <span className="eyebrow">Observed patterns</span>
            <h2>Access changes across the life course</h2>
            <p>Both forms of access vary meaningfully across age groups. Financial inclusion rises sharply after early adulthood, while mobile-money adoption reaches its highest observed rate among respondents aged 55–64.</p>
            <button className="text-link" onClick={() => onNavigate("inclusion")}>Explore the full analysis <span aria-hidden="true">→</span></button>
          </div>
        </header>
        <figure className="story-visual">
          <GroupedBars data={ageData} compact />
          <figcaption><ResearchNote>Weighted rates. These differences are associations in the observed data—not causal effects.</ResearchNote></figcaption>
        </figure>
      </section>

      <section className="evidence-note">
        <div className="evidence-note__label"><span>01</span><small>Evidence note</small></div>
        <div className="evidence-note__body">
          <h2>Digital access is part of the story, not the whole story.</h2>
          <p>Recent internet users show higher weighted rates for both outcomes, while age, workforce status, income, and education remain prominent in the models.</p>
        </div>
        <div className="comparison-pair" aria-label="Financial inclusion comparison by internet use">
          <Statistic value="53.1%" label="Included among recent internet users" />
          <span className="versus">versus</span>
          <Statistic value="32.5%" label="Among no / DK / refused" />
        </div>
      </section>

      <section className="signal-overview">
        <div className="section-heading">
          <div><span className="eyebrow">Model behaviour</span><h2>What each model pays attention to</h2></div>
          <p>Ranked mean absolute SHAP values on protected holdouts, aggregated to original input fields. Magnitude describes model influence—not causal impact.</p>
        </div>
        <div className="model-comparison">
          <article className="model-ranking">
            <header><span>Model 01</span><h3>Financial inclusion</h3></header>
            <SignalBars data={inclusionSignals} accent="one" />
          </article>
          <article className="model-ranking">
            <header><span>Model 02</span><h3>Mobile-money adoption</h3></header>
            <SignalBars data={mobileSignals} accent="two" />
          </article>
        </div>
      </section>
    </>
  );
}

function OutcomePage({ outcome }: { outcome: "inclusion" | "mobile" }) {
  const isInclusion = outcome === "inclusion";
  const metrics = isInclusion ? modelMetrics.inclusion : modelMetrics.mobile;

  return (
    <>
      <SectionIntro
        eyebrow={isInclusion ? "Research brief 01 · Financial inclusion" : "Research brief 02 · Mobile money"}
        title={isInclusion ? "Understanding financial inclusion in Eswatini" : "Understanding mobile-money adoption"}
        copy={isInclusion ? "How observed inclusion varies across demographic, socioeconomic, and digital-access characteristics—and what the predictive model learned." : "How observed mobile-money adoption differs across respondent profiles—and what the independent adoption model learned."}
      />

      <section className="outcome-summary">
        <Statistic value={isInclusion ? "43.1%" : "50.4%"} label={isInclusion ? "Reported a financial institution account" : "Reported a mobile money account"} note="Survey-weighted national sample estimate" />
        <ResearchNote>Descriptive estimates and SHAP values support interpretation, but neither demonstrates that a characteristic causes an outcome.</ResearchNote>
      </section>

      <section className="analysis-chapter">
        <header className="analysis-chapter__copy">
          <span className="chapter-number">01</span>
          <span className="eyebrow">Age profile</span>
          <h2>Rates across the life course</h2>
          <p>Account access is not evenly distributed by age. The paired view keeps each outcome visible without implying that one explains the other.</p>
        </header>
        <div className="analysis-chapter__visual"><GroupedBars data={ageData} /></div>
      </section>

      <section className="paired-analysis">
        <article>
          <header><span className="eyebrow">Education</span><h2>A clear observed gradient</h2><p>Weighted access rates rise across broad education categories.</p></header>
          <GroupedBars data={educationData} compact />
        </article>
        <article>
          <header><span className="eyebrow">Income</span><h2>Within-economy quintiles</h2><p>Rates vary across the five relative household-income groups.</p></header>
          <GroupedBars data={incomeData} compact />
        </article>
      </section>

      <section className="analysis-chapter analysis-chapter--reverse">
        <header className="analysis-chapter__copy">
          <span className="chapter-number">02</span>
          <span className="eyebrow">Digital access</span>
          <h2>Recent internet use</h2>
          <p>Respondents reporting recent internet use have higher observed rates for both outcomes. The combined comparison group includes no, do-not-know, and refused responses.</p>
        </header>
        <div className="analysis-chapter__visual"><GroupedBars data={internetData} compact /></div>
      </section>

      <section className="model-research">
        <div className="model-research__summary">
          <span className="eyebrow">Protected holdout</span>
          <h2>{metrics.model}</h2>
          <p>The final model was selected through group-aware cross-validation, with identical predictor profiles kept together.</p>
          <div className="model-score-grid"><ModelScore label="ROC–AUC" value={metrics.auc} /><ModelScore label="Accuracy" value={metrics.accuracy} /><ModelScore label="F1 score" value={metrics.f1} /></div>
        </div>
        <div className="model-research__signals">
          <span className="eyebrow">Global explanation</span>
          <h2>Leading model signals</h2>
          <SignalBars data={isInclusion ? inclusionSignals : mobileSignals} accent={isInclusion ? "one" : "two"} />
          <ResearchNote>Ranked by mean absolute SHAP value. These magnitudes describe predictive influence, not causal importance.</ResearchNote>
        </div>
      </section>
    </>
  );
}

function AssessmentPage() {
  return (
    <>
      <SectionIntro eyebrow="Analytical tool · Two model views" title="Financial Access Assessment" copy="Describe one profile once to receive two model-based estimates: likely financial inclusion and likely mobile-money adoption." />
      <section className="assessment-context">
        <div><span className="eyebrow">What the assessment provides</span><p>Two probability-based answers, with five model-derived factors for each outcome.</p></div>
        <ResearchNote>This portfolio tool does not determine eligibility, creditworthiness, or access to a financial product.</ResearchNote>
      </section>
      <Assessment />
    </>
  );
}

function Methodology() {
  const process = ["Findex microdata", "Leakage review", "Model-specific pipelines", "Protected evaluation", "SHAP explanations", "Prediction API"];

  return (
    <>
      <SectionIntro eyebrow="Technical documentation · SZ" title="Methodology and model evidence" copy="A transparent account of the data, target definitions, leakage controls, modelling workflows, protected evaluation, and explainability layer." />

      <ol className="method-flow" aria-label="Project architecture">
        {process.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>)}
      </ol>

      <div className="methodology-document">
        <section className="method-section">
          <div className="method-section__index">01</div>
          <header><span className="eyebrow">Dataset</span><h2>Global Findex microdata, scoped to Eswatini</h2></header>
          <div className="method-section__body"><p>The project uses the supplied World Bank Global Findex Eswatini microdata and preserves a documented, immutable raw-data contract.</p><dl><div><dt>Respondents</dt><dd>1,051</dd></div><div><dt>Raw variables</dt><dd>199</dd></div><div><dt>Geography</dt><dd>Eswatini · SZ</dd></div></dl></div>
        </section>

        <section className="method-section">
          <div className="method-section__index">02</div>
          <header><span className="eyebrow">Survey weighting and targets</span><h2>Descriptive evidence remains separate from prediction</h2></header>
          <div className="method-section__body"><p>Survey weights produce the national-sample estimates shown throughout the interface. Two independently defined binary outcomes support the predictive workflows.</p><ul><li>Financial institution account: 43.1% weighted estimate</li><li>Mobile money account: 50.4% weighted estimate</li><li>Displayed subgroup patterns remain descriptive associations</li></ul></div>
        </section>

        <section className="method-section">
          <div className="method-section__index">03</div>
          <header><span className="eyebrow">Preprocessing and leakage control</span><h2>Two defensible feature blueprints</h2></header>
          <div className="method-section__body"><p>Each target received its own eligibility review. Direct target derivatives, parallel outcomes, and post-outcome financial behaviours were excluded before modelling.</p><dl><div><dt>Model 1</dt><dd>15 predictors</dd></div><div><dt>Model 2</dt><dd>16 predictors</dd></div><div><dt>Review</dt><dd>Model-specific</dd></div></dl></div>
        </section>

        <section className="method-section">
          <div className="method-section__index">04</div>
          <header><span className="eyebrow">Model development</span><h2>Selection within independent pipelines</h2></header>
          <div className="method-section__body"><p>Financial inclusion uses Gradient Boosting; mobile-money adoption uses Logistic Regression. Selection was performed through group-aware cross-validation.</p><div className="mini-metric-row"><ModelScore label="Model 1 AUC" value="0.745" /><ModelScore label="Model 2 AUC" value="0.726" /></div></div>
        </section>

        <section className="method-section">
          <div className="method-section__index">05</div>
          <header><span className="eyebrow">Validation</span><h2>Generalisation before performance</h2></header>
          <div className="method-section__body"><p>Identical predictor profiles remain grouped across holdout and cross-validation boundaries. Final holdouts were evaluated once after model selection.</p><ul><li>Group-aware validation boundaries</li><li>Protected final holdouts</li><li>Independent pipeline and category checks</li></ul></div>
        </section>

        <section className="method-section">
          <div className="method-section__index">06</div>
          <header><span className="eyebrow">Explainability</span><h2>Every displayed reason comes from the model</h2></header>
          <div className="method-section__body"><p>Tree SHAP explains financial inclusion; Linear SHAP explains mobile-money adoption. One-hot contributions are summed back to recognisable source features.</p><ul><li>Raw-score additivity validated</li><li>Individual factors preserve direction</li><li>Explanations are not causal claims</li></ul></div>
        </section>
      </div>

      <section className="limitations">
        <div><span className="eyebrow">Responsible-use boundary</span><h2>What this system should not be used for</h2></div>
        <ul><li>A nationwide production decision engine</li><li>An eligibility or credit-scoring tool</li><li>Evidence that a characteristic causes inclusion</li><li>An official World Bank classification</li></ul>
      </section>
    </>
  );
}

export function FinAccessExperience({ concept, selected = false }: { concept: Concept; selected?: boolean }) {
  const [section, setSection] = useState<SectionKey>("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(next: SectionKey) {
    setSection(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={`product-shell concept concept--${concept.key}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="product-header">
        <button className="brand" onClick={() => navigate("overview")} aria-label="FinAccess Eswatini home">
          <span className="brand-mark">SZ</span>
          <span><strong>FinAccess</strong><small>Eswatini</small></span>
        </button>
        <span className="header-context">Global Findex research</span>
        <button className="menu-button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>Menu</button>
        <nav className={menuOpen ? "is-open" : ""} aria-label="Product navigation">
          {navigation.map((item) => <button key={item.key} className={section === item.key ? "is-active" : ""} onClick={() => navigate(item.key)}>{item.label}</button>)}
        </nav>
        {!selected && <div className="concept-switcher">
          <span>{concept.number} / 03</span>
          <div>{concepts.map((item) => <Link key={item.key} className={item.key === concept.key ? "is-active" : ""} href={`/concepts/${item.key}`} aria-label={`View ${item.name}`}>{item.number}</Link>)}</div>
          <Link className="compare-link" href="/">Selected design</Link>
        </div>}
      </header>
      <main id="main-content" className="product-main">
        {!selected && <div className="concept-label"><span>Archived concept {concept.number}</span><strong>{concept.name}</strong><small>{concept.descriptor}</small></div>}
        {section === "overview" && <Overview onNavigate={navigate} />}
        {section === "inclusion" && <OutcomePage outcome="inclusion" />}
        {section === "mobile" && <OutcomePage outcome="mobile" />}
        {section === "assessment" && <AssessmentPage />}
        {section === "methodology" && <Methodology />}
      </main>
      <footer className="product-footer">
        <div><strong>FinAccess Eswatini</strong><span>Financial-access evidence and model research</span></div>
        <p>World Bank Global Findex 2025 microdata · Eswatini · n=1,051</p>
        <p>Developed by Thando F. Dlamini</p>
      </footer>
    </div>
  );
}
