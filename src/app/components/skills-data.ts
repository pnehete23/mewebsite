// Skills content, organised by the three role families being targeted:
// data science / ML, entry-level SWE, and business / product analytics.
//
// Structure is deliberate. A recruiter screening for ONE of these should land
// on a self-contained cluster with the tool names they scan for, plus a hard
// number that proves it — rather than a flat tag cloud that reads as generic.
// Every tool name here appears on the resume, and every proof figure comes
// from a shipped project, so the site and the resume corroborate each other.

import type { Formation } from "./particles/core";

export type Cluster = {
  name: string;
  /** Particle formation this cluster morphs the field into on hover/focus. */
  formation: Formation;
  tools: string[];
};

export type Proof = {
  /** The number does the persuading — keep it literal and verifiable. */
  value: string;
  label: string;
  source: string;
};

export type Track = {
  key: string;
  label: string;
  /** Short role-framing line — what this person does for that team. */
  blurb: string;
  hue: number;
  clusters: Cluster[];
  proof: Proof[];
};

export const TRACKS: Track[] = [
  {
    key: "ds",
    label: "Data Science & ML",
    blurb:
      "End-to-end modelling: framing the question, engineering the features, validating honestly, and shipping the model behind an API with monitoring.",
    hue: 266,
    clusters: [
      {
        name: "Modelling & Validation",
        formation: "helix",
        tools: [
          "scikit-learn",
          "XGBoost",
          "LightGBM",
          "Feature Engineering",
          "Cross-Validation",
          "Statistical Modeling",
          "NLP",
        ],
      },
      {
        name: "Python Data Stack",
        formation: "lattice",
        tools: ["Python", "pandas", "NumPy", "SQL", "DuckDB", "R"],
      },
      {
        name: "MLOps & Monitoring",
        formation: "torus",
        tools: ["MLflow", "Model Monitoring", "Docker", "Kafka", "AWS"],
      },
    ],
    proof: [
      {
        value: "85.7%",
        label: "ROC AUC, spatially held-out XGBoost",
        source: "Chicago Curbside Decision Lab",
      },
      {
        value: "81.5%",
        label: "balanced accuracy on held-out geography",
        source: "Chicago Curbside Decision Lab",
      },
      {
        value: "58.8M",
        label: "traffic observations joined to 496,575 validated 311 records",
        source: "Chicago Curbside Decision Lab",
      },
    ],
  },
  {
    key: "swe",
    label: "Software Engineering",
    blurb:
      "Production services, not notebooks: typed React front ends, FastAPI back ends, streaming and caching layers, containerised and shipped through CI.",
    hue: 224,
    clusters: [
      {
        name: "Backend & APIs",
        formation: "sphere",
        tools: ["Python", "FastAPI", "REST APIs", "PostgreSQL", "Kafka", "Redis", "API Testing"],
      },
      {
        name: "Frontend",
        formation: "wave",
        tools: ["React", "TypeScript", "JavaScript", "Vite", "Streamlit"],
      },
      {
        name: "Ship & Operate",
        formation: "cone",
        tools: ["Docker", "Git", "GitHub Actions", "AWS", "Vercel", "Railway"],
      },
    ],
    proof: [
      {
        value: "4 APIs",
        label: "CPIC, openFDA, RxNav and RxNorm reconciled with audit logging and consent controls",
        source: "Patient360 NU",
      },
      {
        value: "Real-time",
        label: "Kafka-backed ML decision support with MLflow monitoring and automated tests",
        source: "RA Flare Sentinel",
      },
      {
        value: "4.0 / 3.86",
        label: "GPA — Northwestern M.S. Data Science (AI) / ASU B.S. Computer Science",
        source: "Education",
      },
    ],
  },
  {
    key: "analyst",
    label: "Business & Product Analytics",
    blurb:
      "Turning messy source data into decisions stakeholders act on — SQL and ETL underneath, dashboards and clear recommendations on top. CS degree with a business minor.",
    hue: 38,
    clusters: [
      {
        name: "SQL, ETL & Data Modeling",
        formation: "lattice",
        tools: ["SQL", "PostgreSQL", "DuckDB", "ETL Pipelines", "Data Modeling", "Python"],
      },
      {
        name: "BI & Dashboards",
        formation: "wave",
        tools: ["Tableau", "Power BI", "Streamlit", "Stakeholder Reporting"],
      },
      {
        name: "Experimentation & Risk",
        formation: "spiral",
        tools: [
          "Hypothesis Testing",
          "Backtesting",
          "Value-at-Risk",
          "Sharpe Ratio",
          "Drawdown Analysis",
          "Cohort & Trend Analysis",
        ],
      },
    ],
    proof: [
      {
        value: "359,448",
        label: "SEC Form D filings modelled through a Python → PostgreSQL ETL",
        source: "US Private Capital Intelligence",
      },
      {
        value: "$7.5T",
        label: "reported private capital analysed and surfaced in Tableau",
        source: "US Private Capital Intelligence",
      },
      {
        value: "Published",
        label:
          "Credit Risk Modeling and Fraud Detection: A Comprehensive Review — IJERT Vol. 14 Issue 08",
        source: "Aug 2025",
      },
    ],
  },
];
