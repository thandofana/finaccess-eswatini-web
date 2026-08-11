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
import { GroupedBars, ModelScore, SignalBars } from "./DataViews";

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

function Overview({ onNavigate }: { onNavigate: (section: SectionKey) => void }) {
  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Financial access · Eswatini</span>
          <h1>Financial Access in Eswatini</h1>
          <p>Explore the evidence, compare patterns, and assess one profile with two independently validated machine-learning models.</p>
          <div className="hero-actions">
            <button className="button button--primary" onClick={() => onNavigate("assessment")}>Start an assessment</button>
            <button className="text-link" onClick={() => onNavigate("methodology")}>Review the evidence <span aria-hidden="true">→</span></button>
          </div>
        </div>
        <div className="hero-figure" aria-label="Weighted access rates">
          <div className="hero-ring hero-ring--one"><strong>43.1%</strong><span>financial institution account</span></div>
          <div className="hero-ring hero-ring--two"><strong>50.4%</strong><span>mobile money account</span></div>
          <small>Survey-weighted estimates</small>
        </div>
      </section>

      <section className="metric-strip" aria-label="Project summary">
        {overviewMetrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></div>)}
      </section>

      <section className="content-grid content-grid--lead">
        <article className="panel panel--chart">
          <div className="panel-heading"><div><span className="eyebrow">Observed patterns</span><h2>Access changes across the life course</h2></div><button className="text-link" onClick={() => onNavigate("inclusion")}>Explore analysis →</button></div>
          <GroupedBars data={ageData} compact />
          <p className="chart-note">Weighted rates. These differences are associations in the observed data—not causal effects.</p>
        </article>
        <aside className="insight-panel">
          <span className="insight-number">01</span>
          <span className="eyebrow">Evidence note</span>
          <h2>Digital access is part of the story, not the whole story.</h2>
          <p>Recent internet users show higher weighted rates for both outcomes, while age, workforce status, income, and education remain prominent in the models.</p>
          <div className="comparison-pair"><div><strong>53.1%</strong><span>included among recent internet users</span></div><div><strong>32.5%</strong><span>among the combined no / DK / refused group</span></div></div>
        </aside>
      </section>

      <section className="signal-overview">
        <div className="section-heading"><div><span className="eyebrow">Model behaviour</span><h2>What each model pays attention to</h2></div><p>Mean absolute SHAP values on protected holdouts, aggregated to original input fields.</p></div>
        <div className="two-column-panels">
          <article className="panel"><h3>Financial inclusion</h3><SignalBars data={inclusionSignals} accent="one" /></article>
          <article className="panel"><h3>Mobile money adoption</h3><SignalBars data={mobileSignals} accent="two" /></article>
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
        eyebrow={isInclusion ? "Model 01 · Financial inclusion" : "Model 02 · Mobile money"}
        title={isInclusion ? "Understanding financial inclusion in Eswatini" : "Understanding mobile-money adoption"}
        copy={isInclusion ? "Explore how observed inclusion rates vary across demographic, socioeconomic, and digital-access characteristics." : "See which profiles differ in observed mobile-money adoption and what the independent adoption model learned."}
      />
      <section className="outcome-summary">
        <div className="outcome-rate"><span>Weighted national sample estimate</span><strong>{isInclusion ? "43.1%" : "50.4%"}</strong><p>{isInclusion ? "reported a financial institution account" : "reported a mobile money account"}</p></div>
        <div className="outcome-note"><span className="eyebrow">Read this carefully</span><p>These are survey-weighted descriptive estimates. The model is predictive, and neither the chart patterns nor SHAP values demonstrate causation.</p></div>
      </section>
      <section className="analysis-grid">
        <article className="panel panel--chart panel--wide"><div className="panel-heading"><div><span className="eyebrow">Age profile</span><h2>Rates by age group</h2></div></div><GroupedBars data={ageData} /></article>
        <article className="panel panel--chart"><div className="panel-heading"><div><span className="eyebrow">Education</span><h2>A clear observed gradient</h2></div></div><GroupedBars data={educationData} compact /></article>
        <article className="panel panel--chart"><div className="panel-heading"><div><span className="eyebrow">Income</span><h2>Within-economy quintiles</h2></div></div><GroupedBars data={incomeData} compact /></article>
        <article className="panel panel--chart"><div className="panel-heading"><div><span className="eyebrow">Digital access</span><h2>Recent internet use</h2></div></div><GroupedBars data={internetData} compact /></article>
        <article className="panel panel--model">
          <div><span className="eyebrow">Protected holdout</span><h2>{metrics.model}</h2><p>The final model was selected through group-aware cross-validation, with identical predictor profiles kept together.</p></div>
          <div className="model-score-grid"><ModelScore label="ROC–AUC" value={metrics.auc} /><ModelScore label="Accuracy" value={metrics.accuracy} /><ModelScore label="F1 score" value={metrics.f1} /></div>
        </article>
        <article className="panel panel--signals"><div className="panel-heading"><div><span className="eyebrow">Global explanation</span><h2>Leading model signals</h2></div></div><SignalBars data={isInclusion ? inclusionSignals : mobileSignals} accent={isInclusion ? "one" : "two"} /></article>
      </section>
    </>
  );
}

function AssessmentPage() {
  return (
    <>
      <SectionIntro eyebrow="Two models · One profile" title="Financial Access Assessment" copy="Enter demographic, socioeconomic, and digital-access characteristics once to estimate whether this profile is likely to be financially included and likely to use mobile money." />
      <section className="assessment-context"><div><strong>What you will receive</strong><span>Two clear answers</span><span>Supporting probabilities</span><span>Five model-derived factors per outcome</span></div><p>This tool is a portfolio proof of concept. It does not determine eligibility, creditworthiness, or access to a financial product.</p></section>
      <Assessment />
    </>
  );
}

function Methodology() {
  return (
    <>
      <SectionIntro eyebrow="Built for scrutiny" title="Methodology and model evidence" copy="A transparent view of the dataset, leakage controls, independent modelling workflows, evaluation, and explainability layer." />
      <section className="method-flow" aria-label="Project architecture">
        {["Findex microdata", "Leakage review", "Model-specific pipelines", "Protected evaluation", "SHAP explanations", "Prediction API"].map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < 5 && <i aria-hidden="true">→</i>}</div>)}
      </section>
      <section className="method-grid">
        <article className="panel"><span className="eyebrow">Data foundation</span><h2>1,051 respondents · 199 raw variables</h2><p>The project uses the supplied World Bank Global Findex Eswatini microdata and preserves a documented, immutable raw-data contract.</p><ul><li>Systematic missingness and coding audit</li><li>Survey-weighted descriptive estimates</li><li>Complete variable dictionary and source notes</li></ul></article>
        <article className="panel"><span className="eyebrow">Leakage controls</span><h2>Two defensible feature blueprints</h2><p>Each target received its own eligibility review. Direct target derivatives, parallel outcomes, and post-outcome financial behaviours were excluded.</p><ul><li>15 Model 1 predictors</li><li>16 Model 2 predictors</li><li>Model-specific engineered digital fields</li></ul></article>
        <article className="panel"><span className="eyebrow">Evaluation</span><h2>Generalisation before performance</h2><p>Identical predictor profiles remain grouped across holdout and cross-validation boundaries. Final holdouts were evaluated once after selection.</p><div className="mini-metric-row"><ModelScore label="Model 1 AUC" value="0.745" /><ModelScore label="Model 2 AUC" value="0.726" /></div></article>
        <article className="panel"><span className="eyebrow">Explainability</span><h2>Every displayed reason comes from the model</h2><p>Tree SHAP explains financial inclusion; Linear SHAP explains mobile-money adoption. One-hot contributions are summed back to recognisable source features.</p><ul><li>Raw-score additivity validated</li><li>Individual factors preserve direction</li><li>Explanations are not causal claims</li></ul></article>
      </section>
      <section className="limitations"><span className="eyebrow">Responsible-use boundary</span><h2>What this system should not be used for</h2><div><p>Not a nationwide production decision engine.</p><p>Not an eligibility or credit-scoring tool.</p><p>Not evidence that any characteristic causes inclusion.</p><p>Not an official World Bank classification.</p></div></section>
    </>
  );
}

export function FinAccessExperience({ concept, selected = false }: { concept: Concept; selected?: boolean }) {
  const [section, setSection] = useState<SectionKey>("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(next: SectionKey) { setSection(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return (
    <div className={`product-shell concept concept--${concept.key}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="product-header">
        <button className="brand" onClick={() => navigate("overview")} aria-label="FinAccess Eswatini home"><span className="brand-mark">FA</span><span><strong>FinAccess</strong><small>Eswatini</small></span></button>
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
        {!selected && <div className="concept-label"><span>Design concept {concept.number}</span><strong>{concept.name}</strong><small>{concept.descriptor}</small></div>}
        {section === "overview" && <Overview onNavigate={navigate} />}
        {section === "inclusion" && <OutcomePage outcome="inclusion" />}
        {section === "mobile" && <OutcomePage outcome="mobile" />}
        {section === "assessment" && <AssessmentPage />}
        {section === "methodology" && <Methodology />}
      </main>
      <footer className="product-footer"><div><strong>FinAccess Eswatini</strong><span>Explainable financial-access intelligence</span></div><p>World Bank Global Findex 2025 microdata · Eswatini · n=1,051</p><p>Developed by Thando F. Dlamini ·</p></footer>
    </div>
  );
}
