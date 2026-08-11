export type ConceptKey = "ledger" | "open-field" | "signal";

export type Concept = {
  key: ConceptKey;
  number: string;
  name: string;
  descriptor: string;
  summary: string;
  personality: string;
};

export const concepts: Concept[] = [
  {
    key: "ledger",
    number: "01",
    name: "The Ledger",
    descriptor: "Editorial evidence",
    summary:
      "A composed research-led interface with fine rules, warm paper tones, and decisive typography.",
    personality: "Credible · measured · timeless",
  },
  {
    key: "open-field",
    number: "02",
    name: "Open Field",
    descriptor: "Human-centred insight",
    summary:
      "An approachable public-interest product with soft colour, generous spacing, and guided storytelling.",
    personality: "Warm · accessible · grounded",
  },
  {
    key: "signal",
    number: "03",
    name: "Signal",
    descriptor: "Modern fintech clarity",
    summary:
      "A precise product interface with crisp data hierarchy, compact navigation, and confident blue accents.",
    personality: "Focused · current · product-led",
  },
];

export const overviewMetrics = [
  { label: "Respondents", value: "1,051", note: "Eswatini microdata" },
  { label: "Financially included", value: "43.1%", note: "survey-weighted" },
  { label: "Mobile money", value: "50.4%", note: "survey-weighted" },
  { label: "Validated models", value: "2", note: "independent pipelines" },
];

export const ageData = [
  { label: "15–24", inclusion: 24.3, mobile: 31.9 },
  { label: "25–34", inclusion: 48.1, mobile: 60.4 },
  { label: "35–44", inclusion: 56.0, mobile: 56.4 },
  { label: "45–54", inclusion: 49.8, mobile: 56.1 },
  { label: "55–64", inclusion: 51.5, mobile: 64.6 },
  { label: "65+", inclusion: 44.7, mobile: 47.0 },
];

export const educationData = [
  { label: "Primary or less", inclusion: 36.8, mobile: 43.3 },
  { label: "Secondary", inclusion: 46.1, mobile: 55.6 },
  { label: "Tertiary+", inclusion: 82.4, mobile: 68.7 },
];

export const incomeData = [
  { label: "Q1", inclusion: 34.1, mobile: 32.4 },
  { label: "Q2", inclusion: 37.0, mobile: 44.0 },
  { label: "Q3", inclusion: 33.6, mobile: 49.9 },
  { label: "Q4", inclusion: 45.9, mobile: 64.7 },
  { label: "Q5", inclusion: 65.0, mobile: 60.9 },
];

export const internetData = [
  { label: "Recent internet use", inclusion: 53.1, mobile: 60.5 },
  { label: "No / DK / refused", inclusion: 32.5, mobile: 39.7 },
];

export const inclusionSignals = [
  { label: "Age group", value: 0.335 },
  { label: "Workforce status", value: 0.32 },
  { label: "Income quintile", value: 0.267 },
  { label: "Education level", value: 0.223 },
  { label: "Recent internet use", value: 0.203 },
];

export const mobileSignals = [
  { label: "SIM registered in own name", value: 0.269 },
  { label: "Age group", value: 0.199 },
  { label: "Internet engagement", value: 0.172 },
  { label: "Data-purchase pattern", value: 0.17 },
  { label: "Income quintile", value: 0.169 },
];

export const modelMetrics = {
  inclusion: { auc: "0.745", accuracy: "0.706", f1: "0.710", model: "Gradient Boosting" },
  mobile: { auc: "0.726", accuracy: "0.676", f1: "0.721", model: "Logistic Regression" },
};

export const assessmentDefaults = {
  female: "Female",
  age_group: "65+",
  educ: "Primary education or less",
  inc_q: "Income quintile 2",
  emp_in: "Out of the workforce",
  fin24c: "Yes",
  internet_use: "No / don't know / refused",
  internet_engagement_level: "No recent internet use / no-DK-ref",
  phone_access_tier: "Smartphone",
  con11: "Yes",
  con12: "Daily",
  con14: "Yes",
  con16: "Yes",
  con18: "No",
  con20: "No",
  data_purchase_pattern: "No recent internet use / skipped",
  fin46: "Yes",
};

export const fieldOptions: Record<keyof typeof assessmentDefaults, string[]> = {
  female: ["Female", "Male"],
  age_group: ["15–24", "25–34", "35–44", "45–54", "55–64", "65+"],
  educ: ["Primary education or less", "Secondary education", "Tertiary education or more", "Missing or nonresponse"],
  inc_q: ["Income quintile 1", "Income quintile 2", "Income quintile 3", "Income quintile 4", "Income quintile 5"],
  emp_in: ["In the workforce", "Out of the workforce"],
  fin24c: ["Yes", "No", "Nonresponse"],
  internet_use: ["Yes", "No / don't know / refused"],
  internet_engagement_level: [
    "Daily internet use",
    "Weekly internet use",
    "Monthly internet use",
    "Less than monthly internet use",
    "Recent-use indicator; frequency reported never",
    "Recent internet use; frequency nonresponse",
    "No recent internet use / no-DK-ref",
  ],
  phone_access_tier: ["Smartphone", "Basic text phone", "No personal mobile phone", "Phone ownership nonresponse", "Phone type nonresponse"],
  con11: ["Yes", "No", "Nonresponse", "Not applicable / skipped"],
  con12: ["Daily", "Weekly", "Monthly", "Less than once a month", "Never", "Nonresponse", "Not applicable / skipped"],
  con14: ["Yes", "No", "Nonresponse", "Not applicable / skipped"],
  con16: ["Yes", "No", "Nonresponse", "Not applicable / skipped"],
  con18: ["Yes", "No", "Nonresponse", "Not applicable / skipped"],
  con20: ["Yes", "No", "Nonresponse", "Not applicable / skipped"],
  data_purchase_pattern: [
    "Purchases data daily",
    "Purchases data weekly",
    "Purchases data monthly",
    "Purchases data less than monthly",
    "Reports purchasing data but frequency never",
    "Data-purchase frequency nonresponse",
    "Does not purchase data",
    "Data-purchase status nonresponse",
    "No recent internet use / skipped",
  ],
  fin46: ["Yes", "No", "Nonresponse"],
};
