"use client";

import { FormEvent, useMemo, useState } from "react";
import { assessmentDefaults, fieldOptions } from "../data";

type AssessmentValues = typeof assessmentDefaults;
type FieldKey = keyof AssessmentValues;

type ApiFactor = {
  feature: string;
  label: string;
  value: string;
  direction: "increased_likelihood" | "reduced_likelihood" | "neutral";
  explanation: string;
  contribution_log_odds: number;
};

type ApiResult = {
  question: string;
  answer: string;
  probability: number;
  probability_percent: number;
  main_factors: ApiFactor[];
  warnings: string[];
};

type ApiResponse = {
  assessment_id: string;
  financial_inclusion: ApiResult;
  mobile_money_adoption: ApiResult;
  disclaimer: string;
};

const groups: { title: string; description: string; fields: { key: FieldKey; label: string; hint?: string }[] }[] = [
  {
    title: "About the person",
    description: "Basic demographic and socioeconomic characteristics.",
    fields: [
      { key: "female", label: "Gender" },
      { key: "age_group", label: "Age group" },
      { key: "educ", label: "Education level" },
      { key: "inc_q", label: "Household income quintile" },
      { key: "emp_in", label: "Workforce status" },
      { key: "fin24c", label: "Natural-disaster or severe-weather experience" },
      { key: "fin46", label: "Foundational ID ownership" },
    ],
  },
  {
    title: "Connectivity",
    description: "Recent internet use, phone access, and data-purchase behaviour.",
    fields: [
      { key: "internet_use", label: "Internet use in the past three months" },
      { key: "internet_engagement_level", label: "Internet-use frequency" },
      { key: "data_purchase_pattern", label: "Data-purchase pattern" },
      { key: "phone_access_tier", label: "Phone access" },
    ],
  },
  {
    title: "Phone use",
    description: "Practical access, capability, privacy, and autonomy indicators.",
    fields: [
      { key: "con11", label: "SIM registered in own name" },
      { key: "con12", label: "Mobile-phone use frequency" },
      { key: "con14", label: "Can read a text message" },
      { key: "con16", label: "Can send a text message" },
      { key: "con18", label: "Phone has a PIN or password" },
      { key: "con20", label: "Someone sets rules on phone use" },
    ],
  },
];

function SelectField({ field, value, disabled, onChange }: {
  field: { key: FieldKey; label: string; hint?: string };
  value: string;
  disabled: boolean;
  onChange: (key: FieldKey, value: string) => void;
}) {
  return (
    <label className={`form-field ${disabled ? "form-field--disabled" : ""}`}>
      <span>{field.label}</span>
      {field.hint && <small>{field.hint}</small>}
      <select value={value} disabled={disabled} onChange={(event) => onChange(field.key, event.target.value)}>
        {fieldOptions[field.key].map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ResultPanel({ result, type }: { result: ApiResult; type: "inclusion" | "mobile" }) {
  return (
    <article className={`prediction-result prediction-result--${type}`}>
      <div className="result-heading">
        <div>
          <span className="eyebrow">{type === "inclusion" ? "Financial inclusion" : "Mobile money adoption"}</span>
          <h3>{result.answer}</h3>
        </div>
        <div className="probability-orbit" aria-label={`Estimated likelihood ${result.probability_percent}%`}>
          <strong>{result.probability_percent.toFixed(1)}%</strong>
          <span>estimated likelihood</span>
        </div>
      </div>
      <p className="result-question">{result.question}</p>
      <div className="factor-heading"><span>Main factors</span><small>relative to the model baseline</small></div>
      <ol className="factor-list">
        {result.main_factors.map((factor) => (
          <li key={factor.feature}>
            <span className={`factor-direction factor-direction--${factor.direction}`} aria-hidden="true">
              {factor.direction === "increased_likelihood" ? "+" : factor.direction === "reduced_likelihood" ? "−" : "·"}
            </span>
            <span><strong>{factor.label}</strong><small>{factor.value}</small></span>
            <span className="factor-copy">{factor.direction === "increased_likelihood" ? "Supported a higher estimate" : factor.direction === "reduced_likelihood" ? "Supported a lower estimate" : "Had little local effect"}</span>
          </li>
        ))}
      </ol>
      {result.warnings.length > 0 && <p className="result-warning">{result.warnings.join(" ")}</p>}
    </article>
  );
}

export function Assessment() {
  const [values, setValues] = useState<AssessmentValues>(assessmentDefaults);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  const noInternet = values.internet_use === "No / don't know / refused";
  const noPhone = values.phone_access_tier === "No personal mobile phone";
  const disabledFields = useMemo(() => new Set<FieldKey>([
    ...(noInternet ? ["internet_engagement_level", "data_purchase_pattern"] as FieldKey[] : []),
    ...(noPhone ? ["con11", "con12", "con14", "con16", "con18", "con20"] as FieldKey[] : []),
  ]), [noInternet, noPhone]);

  function updateValue(key: FieldKey, value: string) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "internet_use") {
        if (value === "No / don't know / refused") {
          next.internet_engagement_level = "No recent internet use / no-DK-ref";
          next.data_purchase_pattern = "No recent internet use / skipped";
        } else {
          next.internet_engagement_level = "Daily internet use";
          next.data_purchase_pattern = "Purchases data monthly";
        }
      }
      if (key === "phone_access_tier" && value === "No personal mobile phone") {
        next.con11 = "Not applicable / skipped";
        next.con12 = "Not applicable / skipped";
        next.con14 = "Not applicable / skipped";
        next.con16 = "Not applicable / skipped";
        next.con18 = "Not applicable / skipped";
        next.con20 = "Not applicable / skipped";
      }
      if (key === "phone_access_tier" && current.phone_access_tier === "No personal mobile phone" && value !== "No personal mobile phone") {
        next.con11 = "Yes"; next.con12 = "Daily"; next.con14 = "Yes";
        next.con16 = "Yes"; next.con18 = "No"; next.con20 = "No";
      }
      return next;
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading"); setError(""); setResult(null);
    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message || "The assessment could not be completed.");
      setResult(body); setStatus("success");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The assessment could not be completed.");
      setStatus("error");
    }
  }

  if (status === "success" && result) {
    return (
      <div className="assessment-results" aria-live="polite">
        <div className="assessment-results__intro">
          <div><span className="eyebrow">Assessment complete</span><h2>Your financial access profile</h2></div>
          <button className="button button--quiet" type="button" onClick={() => { setStatus("idle"); setResult(null); setStep(0); }}>Start another assessment</button>
        </div>
        <div className="result-grid">
          <ResultPanel result={result.financial_inclusion} type="inclusion" />
          <ResultPanel result={result.mobile_money_adoption} type="mobile" />
        </div>
        <p className="assessment-disclaimer">{result.disclaimer}</p>
      </div>
    );
  }

  return (
    <form className="assessment-form" onSubmit={submit}>
      <div className="form-progress" aria-label={`Step ${step + 1} of ${groups.length}`}>
        {groups.map((group, index) => (
          <button key={group.title} type="button" className={index === step ? "is-active" : index < step ? "is-complete" : ""} onClick={() => setStep(index)}>
            <span>{index < step ? "✓" : index + 1}</span><small>{group.title}</small>
          </button>
        ))}
      </div>
      <div className="form-stage">
        <div className="form-stage__heading"><span>Step {step + 1} of {groups.length}</span><h3>{groups[step].title}</h3><p>{groups[step].description}</p></div>
        <div className="form-grid">
          {groups[step].fields.map((field) => <SelectField key={field.key} field={field} value={values[field.key]} disabled={disabledFields.has(field.key)} onChange={updateValue} />)}
        </div>
      </div>
      {status === "error" && <p className="form-error" role="alert">{error} Check that the Phase 10 API is running and try again.</p>}
      <div className="form-actions">
        <button className="button button--quiet" type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</button>
        {step < groups.length - 1 ? (
          <button className="button button--primary" type="button" onClick={() => setStep((current) => Math.min(groups.length - 1, current + 1))}>Continue</button>
        ) : (
          <button className="button button--primary" type="submit" disabled={status === "loading"}>{status === "loading" ? "Running both models…" : "Generate assessment"}</button>
        )}
      </div>
    </form>
  );
}
