"use client";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaCopy,
  FaCheck,
  FaPaperPlane,
  FaJava,
  FaDatabase,
  FaChartLine,
  FaBrain,
  FaUniversity,
  FaServer,
  FaShieldAlt,
  FaCogs,
  FaProjectDiagram,
  FaMapMarkerAlt,
  FaHeartbeat,
} from "react-icons/fa";
import {
  SiPython,
  SiR,
  SiPostgresql,
  SiMongodb,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiPandas,
  SiNumpy,
  SiTableau,
  SiPlotly,
  SiOpenai,
  SiAnthropic,
  SiHuggingface,
  SiLangchain,
  SiStreamlit,
  SiRailway,
  SiSupabase,
  SiReact,
  SiNodedotjs,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiStripe,
  SiFlask,
  SiHtml5,
  SiCss3,
  SiVercel,
  SiCplusplus,
  SiAmazonwebservices,
  SiGooglegemini,
  SiRazorpay,
  SiFastapi,
  SiMlflow,
  SiApachekafka,
  SiApachespark,
  SiApacheairflow,
  SiApachesuperset,
  SiDocker,
  SiPydantic,
  SiDuckdb,
  SiGithubactions,
  SiPytest,
} from "react-icons/si";
import type { IconType } from "react-icons";
import {
  HeartPulse,
  CandlestickChart,
  Award,
  BookMarked,
  Plane,
} from "lucide-react";
import SkillChip, { SkillChipVariant } from "./components/SkillChip";
import ConceptStack, { type ConceptGroup } from "./components/ConceptStack";
import CountUp from "./components/CountUp";
import TiltSpotlight from "./components/TiltSpotlight";
import SkillDeck from "./components/SkillDeck";

function getTechIcon(name: string): IconType | null {
  const n = name.toLowerCase();
  if (n.includes("python")) return SiPython;
  if (n.startsWith("r (") || n === "r") return SiR;
  if (n.includes("postgres")) return SiPostgresql;
  if (n.includes("mongo")) return SiMongodb;
  if (n.includes("sql") || n.includes("database")) return FaDatabase;
  if (n.includes("tensorflow")) return SiTensorflow;
  if (n.includes("pytorch")) return SiPytorch;
  if (n.includes("scikit") || n.includes("sklearn")) return SiScikitlearn;
  if (n.includes("pandas")) return SiPandas;
  if (n.includes("numpy")) return SiNumpy;
  if (n.includes("tableau")) return SiTableau;
  if (n.includes("plotly")) return SiPlotly;
  if (n.includes("openai")) return SiOpenai;
  if (n.includes("claude") || n.includes("anthropic")) return SiAnthropic;
  if (n.includes("huggingface") || n.includes("hugging face")) return SiHuggingface;
  if (n.includes("langchain")) return SiLangchain;
  if (n.includes("gemini")) return SiGooglegemini;
  if (n.includes("c++") || n.includes("cpp")) return SiCplusplus;
  if (n.includes("java")) return FaJava;
  if (n.includes("aws") || n.includes("amazon")) return SiAmazonwebservices;
  if (n.includes("streamlit")) return SiStreamlit;
  if (n.includes("railway")) return SiRailway;
  if (n.includes("supabase")) return SiSupabase;
  if (n.includes("razorpay")) return SiRazorpay;
  if (n.includes("fastapi")) return SiFastapi;
  if (n.includes("mlflow")) return SiMlflow;
  if (n.includes("kafka")) return SiApachekafka;
  if (n.includes("spark")) return SiApachespark;
  if (n.includes("airflow")) return SiApacheairflow;
  if (n.includes("superset")) return SiApachesuperset;
  if (n.includes("docker")) return SiDocker;
  if (n.includes("pydantic")) return SiPydantic;
  if (n.includes("duckdb")) return SiDuckdb;
  if (n.includes("github actions") || n.includes("ci")) return SiGithubactions;
  if (n.includes("pytest")) return SiPytest;
  if (n.includes("xgboost") || n.includes("gradient")) return FaProjectDiagram;
  if (n.includes("shap") || n.includes("optuna")) return FaBrain;
  if (n.includes("react")) return SiReact;
  if (n.includes("node")) return SiNodedotjs;
  if (n.includes("next")) return SiNextdotjs;
  if (n.includes("typescript")) return SiTypescript;
  if (n.includes("tailwind")) return SiTailwindcss;
  if (n.includes("stripe")) return SiStripe;
  if (n.includes("flask")) return SiFlask;
  if (n.includes("html")) return SiHtml5;
  if (n.includes("css")) return SiCss3;
  if (n.includes("vercel")) return SiVercel;
  if (n.includes("northwestern")) return FaUniversity;
  if (n.includes("statistical") || n.includes("hypothesis") || n.includes("visualization")) return FaChartLine;
  if (n.includes("nlp") || n.includes("llm") || n.includes("learning")) return FaBrain;
  if (n.includes("rest") || n.includes("api")) return FaServer;
  if (n.includes("research")) return FaBrain;
  return null;
}

const skills = [
  { name: "Python (pandas, NumPy, SciPy)", level: 95 },
  { name: "R (tidyverse, ggplot2)", level: 85 },
  { name: "SQL & Database Design", level: 90 },
  { name: "Machine Learning (scikit-learn)", level: 90 },
  { name: "Deep Learning (TensorFlow, PyTorch)", level: 82 },
  { name: "Statistical Analysis & Hypothesis Testing", level: 88 },
  { name: "Data Visualization (Tableau, matplotlib)", level: 85 },
  { name: "NLP & LLMs", level: 80 },
  { name: "AWS (S3, Athena, SageMaker)", level: 85 },
  { name: "C++ / Java", level: 88 },
];

// Skill radar — 8-axis spider chart organized by tech-stack role. Tools listed
// under each axis are the actual stack used across GitHub projects
// (CareerCraft AI, trading dashboards, this Next.js portfolio, ML pipelines)
// + Northwestern MSDS coursework (430, 401, 420, 422, 460, 453, 485).
const skillRadar: { axis: string; value: number; tools: string[] }[] = [
  {
    axis: "Frontend",
    value: 80,
    tools: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "HTML / CSS"],
  },
  {
    axis: "Backend",
    value: 85,
    tools: ["Node.js", "FastAPI", "Flask", "REST APIs", "Razorpay / Stripe", "Auth & Webhooks"],
  },
  {
    axis: "Database",
    value: 92,
    tools: ["PostgreSQL", "Supabase", "Elasticsearch", "Milvus (Vector)", "Neo4j (Graph)", "MongoDB"],
  },
  {
    axis: "ML / Modeling",
    value: 90,
    tools: ["scikit-learn", "XGBoost", "Random Forest", "PyTorch", "TensorFlow / Keras", "Cross-Validation"],
  },
  {
    axis: "LLM / NLP",
    value: 84,
    tools: ["Transformers", "RAG", "Prompt Engineering", "Fine-tuning", "Word2Vec", "LDA Topic Modeling"],
  },
  {
    axis: "Data Engineering",
    value: 88,
    tools: ["pandas", "NumPy", "DuckDB", "ETL Pipelines", "SQL", "Jupyter"],
  },
  {
    axis: "Cloud / DevOps",
    value: 82,
    tools: ["AWS (S3, SageMaker)", "Docker", "Vercel", "Railway", "GitHub Actions", "Git"],
  },
  {
    axis: "Visualization",
    value: 84,
    tools: ["Plotly", "matplotlib", "seaborn", "Tableau", "ggplot2", "Streamlit"],
  },
];

type CourseworkKpi = {
  code: string;
  title: string;
  term: string;
  status: "Taken" | "In Progress";
  grade?: string;
  syllabus?: string;
  skills: string[];
};

// Sourced from official Northwestern MSDS transcript. Skills phrased with
// industry-recognized keywords (recruiter / JD vocabulary). Syllabus links
// only attached for courses whose syllabi exist in /public.
const courseworkKpis: CourseworkKpi[] = [
  {
    code: "MSDS 430",
    title: "Python for Data Analysis",
    term: "Fall 2025",
    status: "Taken",
    grade: "B",
    skills: [
      "Python 3",
      "pandas / NumPy",
      "Data Wrangling",
      "Jupyter",
      "OOP",
      "matplotlib / seaborn",
      "File & API I/O",
      "Reproducible Notebooks",
    ],
  },
  {
    code: "MSDS 401",
    title: "Applied Statistics with R",
    term: "Fall 2025 · Tsapara",
    status: "Taken",
    grade: "C",
    syllabus: "/Tsapara%20-Syllabus_ADS_401_Fall%202024.pdf",
    skills: [
      "Statistical Inference",
      "Hypothesis Testing",
      "Probability Distributions",
      "Multiple Linear Regression",
      "Chi-Square & Contingency",
      "Bootstrap Resampling",
      "Exploratory Data Analysis",
      "R / RStudio",
    ],
  },
  {
    code: "MSDS 420",
    title: "Database Systems",
    term: "Winter 2026",
    status: "Taken",
    grade: "A",
    syllabus: "/420%20Database%20Systems%20Syllabus.pdf",
    skills: [
      "SQL & PostgreSQL",
      "ERD & Normalization",
      "ETL Pipelines",
      "Dimensional Modeling",
      "Elasticsearch",
      "Vector DB (Milvus)",
      "Graph DB (Neo4j)",
      "Information Retrieval",
    ],
  },
  {
    code: "MSDS 422",
    title: "Practical Machine Learning",
    term: "Winter 2026",
    status: "Taken",
    grade: "A-",
    skills: [
      "Supervised & Unsupervised Learning",
      "scikit-learn",
      "Random Forest / XGBoost",
      "Cross-Validation",
      "Hyperparameter Tuning",
      "Feature Engineering",
      "Model Evaluation",
      "ML Pipelines",
    ],
  },
  {
    code: "MSDS 460",
    title: "Decision Analytics",
    term: "Spring 2026",
    status: "In Progress",
    skills: [
      "Linear & Integer Programming",
      "Optimization",
      "Network Flow Models",
      "Monte Carlo Simulation",
      "Decision Trees",
      "Risk Analysis",
      "Operations Research",
      "PuLP / Gurobi",
    ],
  },
  {
    code: "MSDS 485",
    title: "Data Governance, Ethics & Law",
    term: "Spring 2026",
    status: "In Progress",
    skills: [
      "Data Governance",
      "Privacy (GDPR / CCPA)",
      "Responsible AI",
      "Bias & Fairness",
      "Compliance & Risk",
      "Data Stewardship",
      "AI Ethics",
      "Regulatory Frameworks",
    ],
  },
  {
    code: "MSDS 453",
    title: "AI & Natural Language Processing",
    term: "Spring 2026 · Maren",
    status: "In Progress",
    syllabus: "/MSDS%20453-Syllabus-Maren-Winter-2026.docx",
    skills: [
      "Text Vectorization",
      "Word2Vec / Doc2Vec",
      "Topic Modeling (LDA)",
      "Text Classification",
      "Sentiment Analysis",
      "Entity Extraction",
      "Deep Learning (TF / Keras)",
      "Recommendation Systems",
    ],
  },
];

const experiences = [
  {
    title: "Machine Learning Engineer",
    company: "MSEDCL (Maharashtra State Electricity Distribution Co.), India (Hybrid)",
    period: "May 2024 - Present",
    description: [
      "Wrote reproducible data analysis and built Python data pipelines in Spark, Kafka, and AWS S3 over petabyte-scale telemetry from ~1,000 substations, cutting data landing time from ~6 hours to under 10 minutes so grid operators can watch load in near real time.",
      "Wrote ETL workflows on AWS using S3, Glue, and Trino that turn 8–12M daily smart-meter and billing records into clean dimensional tables, and promoted ad-hoc analyses into production Superset and Jupyter dashboards that cut manual reporting by ~60%.",
      "Applied statistics and an XGBoost energy-loss model in Python and SQL to flag high-loss zones and likely theft, pointing field teams to ~120 priority feeders, while scoping vague problems with engineering and ops stakeholders into self-serve tools and data visualizations.",
    ],
  },
  {
    title: "Software Development Engineering Intern",
    company: "Electro-Active Technologies, Knoxville, TN",
    period: "Apr 2025 - June 2025",
    description: [
      "Wrote reproducible data analysis in Python over live IoT sensor data from hydrogen energy systems, surfacing inefficiencies that helped improve the conversion cycle by 15%.",
      "Built automated data pipelines on AWS using Lambda and S3 with REST APIs and quality checks that cut manual validation by 40% and promoted ad-hoc analyses into steady operational reporting for the engineering team.",
    ],
  },
  {
    title: "Data Analyst",
    company: "YYC Beeswax, Tempe, AZ",
    period: "May 2024 - Aug 2024",
    description: [
      "Ran statistical analysis on sales and inventory across 50+ SKUs in Python and SQL and surfaced demand patterns that cut overstock carrying costs by 20%.",
      "Built dashboards and data visualizations on revenue and order trends so leadership could self-serve their own numbers and reallocate marketing spend.",
    ],
  },
];

// Interview-friendly tooltips surfaced when hovering a tech chip on a
// project card. Keys must match the strings in `project.technologies`.
const TECH_TOOLTIPS: Record<string, string> = {
  RestAPIs:
    "REST endpoints designed around resources; JSON over HTTP, predictable status codes, idempotent verbs where it matters.",
  React:
    "React 18 with hooks-first composition, Suspense boundaries for async data, and memoized leaf components to keep re-renders cheap.",
  "Node.js":
    "Node backend handling resume parsing, prompt orchestration, and Razorpay webhook verification — async I/O so a slow LLM call doesn't block the loop.",
  Supabase:
    "Postgres + Auth + Storage as a single backend; row-level security policies enforce per-user isolation on resumes and interview recordings.",
  Razorpay:
    "Subscription billing for the MVP; signed webhook handler verifies HMAC, idempotency keys prevent double-credit on retries.",
  "Claude API":
    "Anthropic Claude API for resume rewriting and interview question generation; streaming responses with prompt caching to keep p95 latency under 15s.",
};

// Single source of truth for the concept-stack chips on each featured
// project. Used both by the desktop hover overlay AND a mobile-visible
// static section, so phone users (no hover) see the same curated chips.

const gradientRiskGroups: ReadonlyArray<ConceptGroup> = [
  {
    Icon: FaBrain,
    title: "ML Methodology",
    iconColor: "text-black dark:text-purple-300",
    titleColor: "text-black dark:text-purple-200",
    variant: "purple",
    chips: [
      { label: "Patient-grouped walk-forward CV", tooltip: "Splits by patient AND time so the same patient never appears in both train and validation — kills both subject leakage and look-ahead bias." },
      { label: "Isotonic calibration", tooltip: "Non-parametric monotonic mapping from raw XGBoost scores to true probabilities, validated by reliability diagram + Brier score." },
      { label: "Precision @ 10% review budget", tooltip: "Top-k threshold tuned to the realistic clinician triage capacity, not an abstract F1 — what actually matters in deployment." },
      { label: "Optuna Bayesian HPO", tooltip: "TPE sampler over learning rate, depth, regularization; pruned trials via MedianPruner — far cheaper than grid search." },
      { label: "SHAP feature attribution", tooltip: "TreeSHAP per-prediction explanations; surfaced in the clinician UI so flagged cases come with the why, not just the score." },
      { label: "HDBSCAN subgroup discovery", tooltip: "Density-based clustering on SHAP-space embeddings to discover patient subgroups with distinct flare patterns." },
    ],
  },
  {
    Icon: FaCogs,
    title: "Production Engineering",
    iconColor: "text-black dark:text-blue-300",
    titleColor: "text-black dark:text-blue-200",
    variant: "blue",
    chips: [
      { label: "Real-time streaming inference", tooltip: "Sub-100ms per-event scoring on incoming patient telemetry; backpressure handled at the queue." },
      { label: "Kafka event ingestion", tooltip: "Patient-data events partitioned by subject_id for ordering; consumer groups for horizontal scale." },
      { label: "Async FastAPI · Pydantic v2", tooltip: "Async I/O so a slow model call doesn't block the loop; Pydantic v2 schemas validate every payload at the edge." },
      { label: "MLflow versioning", tooltip: "Model registry with stages (Staging → Production), artifact storage, and a recorded lineage from data to deployed binary." },
      { label: "DuckDB analytical store", tooltip: "In-process columnar SQL — vectorized aggregations on parquet without standing up Postgres for analytical workloads." },
      { label: "Docker Compose", tooltip: "API + Kafka + MLflow + DuckDB stack stood up via one compose file; reproducible across dev and CI." },
    ],
  },
  {
    Icon: FaShieldAlt,
    title: "Responsible AI & Rigor",
    iconColor: "text-black dark:text-emerald-300",
    titleColor: "text-black dark:text-emerald-200",
    variant: "emerald",
    chips: [
      { label: "Data-leakage guardrails", tooltip: "Time-based + group-based splits enforced in code; assertions catch any feature derived after the prediction window." },
      { label: "PHI scanning in CI", tooltip: "Pre-merge regex/entity scans on diffs to block raw PHI from entering the repo or model artifacts." },
      { label: "Model + data cards", tooltip: "Each model ships with a model card (intended use, fairness, limits) and a data card (provenance, splits, demographics)." },
      { label: "Threat model & ADRs", tooltip: "STRIDE-style threat model; architecture decisions captured as numbered ADRs so future changes know the trade-offs." },
      { label: "Hypothesis property tests", tooltip: "Property-based tests via Hypothesis catch edge cases unit tests never enumerate (NaNs, monotonicity, idempotence)." },
      { label: "Strict Mypy · 80%+ coverage", tooltip: "strict-mode type checking + branch coverage gate so refactors don't silently break invariants in untested branches." },
    ],
  },
];

const patient360Groups: ReadonlyArray<ConceptGroup> = [
  {
    Icon: FaHeartbeat,
    title: "Clinical & Genomic Engineering",
    iconColor: "text-black dark:text-cyan-300",
    titleColor: "text-black dark:text-cyan-200",
    variant: "cyan",
    chips: [
      { label: "4-tier CPIC safety engine", tooltip: "Pharmacogenomic prescribing rules graded Level A → D from CPIC; engine fires per-prescription drug + diplotype check at the point of order." },
      { label: "HIPAA Safe Harbor (18 categories)", tooltip: "All 18 PHI identifier classes (names, dates, geo, MRNs, etc.) detected and tokenized before storage so re-identification risk stays under §164.514(b)." },
      { label: "Deterministic PII tokenization", tooltip: "HMAC-SHA256 with a per-tenant salt — same PHI maps to the same token forever, enabling joins without ever surfacing raw values." },
      { label: "Cross-runtime hash parity (Py ↔ JS)", tooltip: "Browser tokenizes identically to the Python generator. Verified by parity tests so a clinician token resolves the same on either side." },
      { label: "Granular consent model", tooltip: "Consent is a first-class object: scoped per-field, per-purpose, revocable, with time bounds and an audit trail back to the patient action." },
      { label: "Real CPIC genes & alleles", tooltip: "Synthetic patients carry real CPIC genes (CYP2D6, DPYD, TPMT, …) with authentic star-allele frequencies — not random labels." },
    ],
  },
  {
    Icon: FaShieldAlt,
    title: "Governance & Compliance",
    iconColor: "text-black dark:text-emerald-300",
    titleColor: "text-black dark:text-emerald-200",
    variant: "emerald",
    chips: [
      { label: "Immutable audit log (classified events)", tooltip: "Append-only ledger; every reveal/consent/alert is a typed event — replays produce the same state and satisfy 21 CFR Part 11 e-records." },
      { label: "Per-field reveal · vault model", tooltip: "Tokens by default; raw value released only on a typed reveal request that's logged, scoped, and tied to a specific clinical purpose." },
      { label: "Data lineage + catalog", tooltip: "Every derived field traces back to source records; downstream models inherit consent and PHI classification automatically." },
      { label: "Composite integrity score", tooltip: "One number summarizing freshness, completeness, and concordance across upstream APIs — surfaced as a UI badge." },
      { label: "Consent-gated computation", tooltip: "If consent doesn't cover a feature/purpose, the pipeline short-circuits — no silent overrides, no exception paths." },
      { label: "21 CFR Part 11 / GDPR Art. 30 ready", tooltip: "Audit log + lineage + tokenization map cleanly onto the FDA e-records and EU records-of-processing requirements." },
    ],
  },
  {
    Icon: FaCogs,
    title: "Engineering & Live Integrations",
    iconColor: "text-black dark:text-blue-300",
    titleColor: "text-black dark:text-blue-200",
    variant: "blue",
    chips: [
      { label: "React 18 + Vite 5 (319KB / 92KB gzip)", tooltip: "Code-split routes, treeshaken icons, and a precomputed dataset bundle keep the production gzip under 100 KB." },
      { label: "Python synthetic data generator", tooltip: "Reproducible cohort generator: 200 patients, 22 genes, realistic prevalence/comorbidity priors — seeded RNG for parity in tests." },
      { label: "Live: CPIC · openFDA · CT.gov · RxNav", tooltip: "Four public APIs wired in: CPIC (gene-drug rules), openFDA (adverse events), ClinicalTrials.gov (matching), RxNav (DDI)." },
      { label: "Custom Node static server", tooltip: "Tiny Node server adds the security headers and SPA fallback routing that vanilla static hosting on Railway lacks." },
      { label: "Railway + Nixpacks deployment", tooltip: "Nixpacks autodetects the build; Railway provides the proxy, TLS, and zero-config HTTPS." },
      { label: "Memoized derived datasets", tooltip: "Heavy joins computed once and memoized by hash of inputs — UI tab switches stay instant on a 200-patient cohort." },
    ],
  },
];

const quantDashboardGroups: ReadonlyArray<ConceptGroup> = [
  {
    Icon: FaChartLine,
    title: "Strategy & Signals",
    iconColor: "text-black dark:text-emerald-300",
    titleColor: "text-black dark:text-emerald-200",
    variant: "emerald",
    chips: [
      { label: "RSI · MACD · Bollinger overlays", tooltip: "Momentum/trend indicators plus volatility-band confirmation. Computed via rolling/EW windows in pandas; no Python row loops." },
      { label: "Momentum + mean-reversion screens", tooltip: "Two complementary strategy classes — trending breakouts vs. reversion-to-mean — wired through one engine." },
      { label: "Multi-timeframe alignment", tooltip: "Daily-trend filter on top of intraday entries to suppress chop and only trade with the higher-TF bias." },
      { label: "Walk-forward backtesting", tooltip: "Out-of-sample testing on rolling time slices — the only way to detect overfit parameters before a live deploy." },
      { label: "Volatility regime detection", tooltip: "Bucket equity curve by ATR percentile so regime-dependent edge is visible instead of blended into one Sharpe." },
      { label: "Pairs / cointegration checks", tooltip: "Engle-Granger cointegration on candidate pairs (ADF on residuals) for stat-arb screening." },
    ],
  },
  {
    Icon: FaShieldAlt,
    title: "Risk & Performance",
    iconColor: "text-black dark:text-cyan-300",
    titleColor: "text-black dark:text-cyan-200",
    variant: "cyan",
    chips: [
      { label: "Sharpe · Sortino · Calmar", tooltip: "Risk-adjusted return: Sharpe (full vol), Sortino (downside dev), Calmar (CAGR ÷ max drawdown)." },
      { label: "Max drawdown & VaR / CVaR", tooltip: "Tail-risk: peak-to-trough loss, 95% historical VaR, expected shortfall — drives circuit breakers." },
      { label: "Slippage + transaction-cost model", tooltip: "Per-trade cost in bps + fixed; cost-sensitivity sweep visualizes how alpha decays with realistic frictions." },
      { label: "Out-of-sample validation", tooltip: "Train/test split + walk-forward to measure decay vs. in-sample fit; flags parameter overfitting." },
      { label: "Rolling correlation matrix", tooltip: "30-day rolling correlations across watchlist for diversification and regime-shift detection." },
      { label: "Risk-parity position sizing", tooltip: "Inverse-volatility weighting so each position contributes equal portfolio variance, not equal capital." },
    ],
  },
  {
    Icon: FaCogs,
    title: "Data & Engineering",
    iconColor: "text-black dark:text-blue-300",
    titleColor: "text-black dark:text-blue-200",
    variant: "blue",
    chips: [
      { label: "Live market-data ingestion", tooltip: "yfinance pulls with TTL=3600s caching; tickers regex-validated (^[A-Z0-9][A-Z0-9.\\-]{0,9}$) as a security boundary." },
      { label: "Vectorized pandas pipelines", tooltip: "All indicators / features computed via rolling, ewm, groupby, NumPy ops — no per-row Python." },
      { label: "Plotly interactive charts", tooltip: "Candlestick + indicator overlays with brush zoom, crosshair tooltips, and entry/exit markers." },
      { label: "Reactive Streamlit UI (4-page)", tooltip: "Backtest · Watchlist · Compare · Optimize. Sidebar inputs trigger memoized recomputation per tab." },
      { label: "Cached compute layer", tooltip: "@st.cache_data on data fetches and @st.cache_resource on engine instances — sub-second tab switches." },
      { label: "Containerized on Railway", tooltip: "Procfile + railway.json define the start command; XSRF disabled behind Railway's proxy." },
    ],
  },
];

const airlineWarehouseGroups: ReadonlyArray<ConceptGroup> = [
  {
    Icon: FaProjectDiagram,
    title: "Dimensional Modeling",
    iconColor: "text-black dark:text-sky-300",
    titleColor: "text-black dark:text-sky-200",
    variant: "blue",
    chips: [
      { label: "Star schema (fact + dimensions)", tooltip: "A central flight-fact table surrounded by conformed dimensions (date, carrier, airport, aircraft) — denormalized so analytical joins stay cheap." },
      { label: "20M+ flight records", tooltip: "Warehouse loaded with 20M+ historical flight legs; partitioned by date so time-bounded queries prune untouched partitions." },
      { label: "Conformed dimensions", tooltip: "Shared dimension tables (airport, carrier, calendar) reused across facts so metrics roll up consistently everywhere." },
      { label: "Slowly changing dimensions", tooltip: "Type-2 SCDs preserve history so a route's metrics reflect the carrier/airport attributes as they were at flight time." },
      { label: "Grain + surrogate keys", tooltip: "One row per flight leg; integer surrogate keys decouple the warehouse from volatile source natural keys." },
      { label: "Sub-second analytical queries", tooltip: "Pre-aggregated rollups plus columnar scans keep dashboard queries under a second on 20M rows." },
    ],
  },
  {
    Icon: FaCogs,
    title: "Pipelines & Orchestration",
    iconColor: "text-black dark:text-amber-300",
    titleColor: "text-black dark:text-amber-200",
    variant: "amber",
    chips: [
      { label: "Apache Spark ETL", tooltip: "Distributed Spark jobs clean, conform, and load raw flight feeds into dimensional tables in parallel." },
      { label: "Airflow orchestration", tooltip: "DAGs schedule and monitor every load; retries and SLAs catch late or failed source files before they break downstream tables." },
      { label: "ETL / ELT hybrid", tooltip: "Heavy transforms run in Spark (ETL); light reshaping is pushed down into Trino SQL (ELT) where it's cheaper." },
      { label: "Trino federated SQL", tooltip: "Trino queries the warehouse and external sources through one SQL engine — no copying data around to analyze it." },
      { label: "Idempotent loads", tooltip: "Partition-overwrite plus dedupe keys mean re-running a DAG never double-counts a flight." },
      { label: "Data-quality checks", tooltip: "Row-count, null, and referential-integrity assertions gate each load before it's published to analysts." },
    ],
  },
  {
    Icon: FaChartLine,
    title: "Analytics & Serving",
    iconColor: "text-black dark:text-cyan-300",
    titleColor: "text-black dark:text-cyan-200",
    variant: "cyan",
    chips: [
      { label: "Superset dashboards", tooltip: "Interactive ops dashboards on delays, load factors, and route performance built straight on the warehouse." },
      { label: "Jupyter exploration", tooltip: "Ad-hoc analysis notebooks answer one-off questions before they graduate into governed dashboards." },
      { label: "Pre-aggregated marts", tooltip: "Materialized summary tables for the heaviest dashboard tiles keep refreshes instant." },
      { label: "Self-serve metrics", tooltip: "Defined, reusable metric definitions so analysts query consistent KPIs without re-deriving them." },
      { label: "Ops decision support", tooltip: "Surfaces on-time performance and bottleneck routes so ops teams act on one shared source of truth." },
    ],
  },
];

type Project = {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubUrl?: string;
  featured?: boolean;
};

const projects: Project[] = [
  {
    id: 0,
    title: "CareerCraft AI",
    description:
      "MVP soon to be released live. Craft your tailored new resume with AI enhancement tailored to any Job Description with just one click and under 15 secs. Interview coach to record and practice interview questions based on users job description and resume.",
    image: "/imagez.png",
    githubUrl: "https://github.com/pnehete23/-CareerCraft-Ai",
    technologies: ["RestAPIs", "React", "Node.js", "Supabase", "Razorpay", "Claude API"],
    featured: true,
  },
];

export default function Home() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [copied, setCopied] = useState<{ email: boolean; phone: boolean }>({ email: false, phone: false });
  const [gitStats, setGitStats] = useState<{
    repos: number | null;
    followers: number | null;
    stars: number | null;
  }>({ repos: null, followers: null, stars: null });

  // Live local time for the location chip — California / Pacific Time.
  // Updates every 30s so it stays accurate without burning RAF.
  const [localTime, setLocalTime] = useState<string>("");
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Los_Angeles",
      });
    setLocalTime(fmt());
    const id = setInterval(() => setLocalTime(fmt()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  // Hero parallax — text drifts up + fades as user scrolls past hero.
  // Pure transform/opacity → GPU compositor, zero layout cost.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7, 1], [1, 0.6, 0]);
  const heroBgY = useTransform(heroProgress, [0, 1], [0, 80]);

  // Wildcat Willy hanging — drops down when Projects section enters viewport
  // and retracts back up when it exits. Driven by section scroll progress so
  // the descent ties cleanly to the section's lifecycle.
  const projectsRef = useRef<HTMLElement>(null);
  const { scrollYProgress: projectsProgress } = useScroll({
    target: projectsRef,
    offset: ["start end", "end start"],
  });
  // -260px (above the section, hidden) → 0px (fully dropped, hanging) → -260px (retracted up)
  const willyY = useTransform(
    projectsProgress,
    [0, 0.12, 0.88, 1],
    [-260, 0, 0, -260]
  );

  // Profile coin flip — front: pfp1.png, back: image01.jpeg.
  // Highly sensitive thresholds so the slightest swipe / nudge triggers a flip.
  const reduceMotion = useReducedMotion();
  const [coinFlipped, setCoinFlipped] = useState(false);
  const [coinLocked, setCoinLocked] = useState(false);
  const flipDuration = reduceMotion ? 0.001 : 0.85;
  const flipCoin = () => {
    if (coinLocked) return;
    setCoinLocked(true);
    setCoinFlipped((p) => !p);
    window.setTimeout(
      () => setCoinLocked(false),
      Math.max(80, flipDuration * 1000 + 50)
    );
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const userRes = await fetch("https://api.github.com/users/pnehete23");
        if (!userRes.ok) return;
        const user = await userRes.json();
        if (cancelled) return;
        setGitStats((s) => ({
          ...s,
          repos: typeof user.public_repos === "number" ? user.public_repos : s.repos,
          followers: typeof user.followers === "number" ? user.followers : s.followers,
        }));

        const reposRes = await fetch(
          "https://api.github.com/users/pnehete23/repos?per_page=100&sort=updated"
        );
        if (!reposRes.ok) return;
        const repos = await reposRes.json();
        if (cancelled || !Array.isArray(repos)) return;
        const stars = repos.reduce(
          (sum: number, r: { stargazers_count?: number }) =>
            sum + (typeof r.stargazers_count === "number" ? r.stargazers_count : 0),
          0
        );
        setGitStats((s) => ({ ...s, stars }));
      } catch {
        // network/rate-limit failure — keep fallback values
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({ type: "success", message: data.message || "Message sent successfully." });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.error || "Submission failed. Please try again." });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus({ type: "error", message: "An unexpected error occurred. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, key: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 1500);
    } catch {
      // no-op
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="scroll-smooth">
      {/* HERO */}
      <section
        ref={heroRef}
        id="hero"
        className="min-h-screen pt-24 pb-12 px-4 relative flex flex-col justify-center overflow-hidden"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[1]"
          style={{ y: heroBgY, willChange: "transform" }}
        />
        <motion.div
          className="max-w-7xl mx-auto w-full space-y-10 md:space-y-14"
          style={{ y: heroY, opacity: heroOpacity, willChange: "transform, opacity" }}
        >
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT — identity + quote */}
            <div className="lg:col-span-8 space-y-6 md:space-y-7 relative z-[1] order-2 lg:order-1">
              {/* Name */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.92] tracking-tight dark:text-gray-300"
              >
                <span className="block bg-gradient-to-r from-slate-900 dark:from-purple-300 via-blue-800 to-slate-900 dark:to-purple-500 bg-clip-text text-transparent dark:text-gray-300">
                  Prathamesh
                </span>
                <span className="block bg-gradient-to-r from-slate-900 dark:from-purple-500 via-blue-700 to-slate-900 dark:to-purple-300 bg-clip-text text-transparent dark:text-gray-300">
                  Nehete
                </span>
              </motion.h1>

              {/* Quote + summary */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="relative pt-3 pb-4 md:pb-6 max-w-2xl space-y-5"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 text-[150px] md:text-[220px] font-serif italic select-none pointer-events-none dark:text-gray-300"
                  style={{
                    lineHeight: 0.9,
                    color: "rgba(180, 180, 190, 0.13)",
                    transform: "translate(-18%, -32%)",
                  }}
                >
                  &ldquo;
                </span>

                <p
                  className="relative text-lg md:text-2xl leading-relaxed font-extrabold italic px-2 md:px-4 dark:text-gray-300"
                  style={{
                    color: "var(--ink-hero-quote)",
                    textShadow: "var(--ink-hero-quote-shadow)",
                  }}
                >
                  All models are wrong. The useful ones ship anyway.
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-wrap gap-3 pt-1"
              >
                <a
                  href="#projects"
                  className="group px-7 py-3 bg-gradient-to-r from-blue-800 dark:from-purple-600 via-blue-800 dark:via-violet-500 to-blue-900 dark:to-purple-700 rounded-full text-black dark:text-white font-semibold hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.8)] transition-all duration-300 inline-flex items-center gap-2"
                >
                  View My Work
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
                <a
                  href="/pnu04%20(1).pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-7 py-3 bg-black/[0.04] dark:bg-white/5 border border-black/15 dark:border-white/15 backdrop-blur-sm rounded-full text-black dark:text-white font-medium hover:bg-black/[0.07] dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/30 transition-all duration-300 inline-flex items-center gap-2"
                >
                  Resume
                  <span className="transition-transform duration-300 group-hover:translate-y-0.5">
                    &darr;
                  </span>
                </a>
              </motion.div>

              {/* Socials */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="flex items-center gap-4 pt-2 text-black dark:text-gray-400"
              >
                <a
                  href="https://www.linkedin.com/in/nehete23/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="hover:text-black dark:hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <FaLinkedin className="text-2xl dark:text-gray-300" />
                </a>
                <a
                  href="https://github.com/pnehete23"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="hover:text-black dark:hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <FaGithub className="text-2xl dark:text-gray-300" />
                </a>
                <span className="h-px w-10 bg-black/[0.08] dark:bg-white/15" />
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] text-black dark:text-purple-200/85 uppercase"
                  aria-label="Location and current local time"
                >
                  <FaMapMarkerAlt className="text-black dark:text-purple-300/90 text-[11px]" />
                  United States
                  <span className="text-black dark:text-purple-400/45">·</span>
                  <span className="text-black dark:text-gray-300">PT</span>
                  {localTime && (
                    <span className="text-black dark:text-gray-300 tabular-nums" suppressHydrationWarning>
                      {localTime}
                    </span>
                  )}
                </span>
              </motion.div>
            </div>

            {/* RIGHT — small profile pic with royal glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-4 relative flex items-center justify-center order-1 lg:order-2"
            >
              <div className="relative w-48 md:w-64">
                {/* Outer NU purple radiant glow */}
                <motion.div
                  className="absolute inset-0 -m-14 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.55),rgba(126,34,206,0.3)_55%,transparent_75%)] rounded-full blur-3xl"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Inner violet wash */}
                <motion.div
                  className="absolute inset-0 -m-4 rounded-full bg-blue-700/30 dark:bg-violet-400/30 blur-2xl"
                  animate={{ opacity: [0.55, 0.9, 0.55] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Profile coin — front: pfp1, back: image01. Flips on slightest swipe. */}
                <motion.div
                  drag="x"
                  dragSnapToOrigin
                  dragElastic={0.4}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragMomentum={false}
                  onDragEnd={(_, info) => {
                    // Highly sensitive — slightest nudge flips the coin
                    if (
                      Math.abs(info.offset.x) > 12 ||
                      Math.abs(info.velocity.x) > 60
                    ) {
                      flipCoin();
                    }
                  }}
                  onClick={flipCoin}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      flipCoin();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={coinFlipped}
                  aria-label={`Profile coin, currently showing ${
                    coinFlipped ? "back image" : "front photo"
                  }. Tap, swipe, or press Enter to flip.`}
                  whileTap={{ scale: 0.97 }}
                  className="relative aspect-square w-full cursor-grab active:cursor-grabbing select-none rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/70 dark:focus-visible:ring-purple-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  style={{ perspective: "1200px", touchAction: "pan-y" }}
                >
                  <motion.div
                    className="relative w-full h-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: coinFlipped ? 180 : 0 }}
                    transition={{ duration: flipDuration, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Front face — pfp1.png */}
                    <div
                      className="absolute inset-0 rounded-full overflow-hidden border-2 border-blue-700/40 dark:border-purple-300/40 shadow-[0_20px_50px_-10px_rgba(168,85,247,0.6)]"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      <img
                        src="/pfp1.png"
                        alt="Prathamesh Nehete"
                        draggable={false}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </div>
                    {/* Back face — image01.jpeg */}
                    <div
                      className="absolute inset-0 rounded-full overflow-hidden border-2 border-blue-700/40 dark:border-purple-300/40 shadow-[0_20px_50px_-10px_rgba(168,85,247,0.6)]"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <img
                        src="/image01.jpeg"
                        alt="Prathamesh Nehete (alt)"
                        draggable={false}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </div>
                  </motion.div>
                </motion.div>

              </div>
            </motion.div>
          </div>

          {/* VALUE STRIP — Northwestern affiliation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="max-w-md"
          >
            <div className="relative overflow-hidden px-4 py-3 rounded-xl bg-black/[0.035] dark:bg-white/[0.03] border border-blue-700/20 dark:border-purple-400/20 backdrop-blur-sm hover:bg-blue-800/[0.08] dark:hover:bg-purple-500/[0.08] hover:border-blue-700/40 dark:hover:border-purple-400/40 transition-colors">
              <div className="flex items-center h-9 md:h-11">
                <img
                  src="/nu.jpg"
                  alt="Northwestern · M.S. Data Science (AI)"
                  className="h-full w-auto object-contain rounded"
                />
              </div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-widest text-black dark:text-gray-400 mt-1 font-mono">
                Northwestern &middot; M.S. Data Science (AI)
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ABOUT */}
      <section id="about" className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center dark:text-gray-300"
          >
            <motion.h2
              initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 dark:from-purple-300 via-blue-800 to-slate-900 dark:to-purple-500 bg-clip-text text-transparent mb-6 dark:text-gray-300 inline-block"
              style={{ willChange: "clip-path, opacity" }}
            >
              About Me
            </motion.h2>
            <p className="text-xl text-black dark:text-gray-300 max-w-3xl mx-auto">
              I&apos;m Prathamesh Nehete, a data scientist and machine learning engineer with a strong
              foundation in computer science, statistics, and AI. I build models and systems that
              turn raw data into actionable insights.
            </p>
          </motion.div>

          {/* My Story, then Skills — stacked single-column for breathing room.
              On mobile, story content centers; on md+ it left-aligns. */}
          <div className="space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto space-y-6"
              style={{
                fontFamily:
                  'var(--font-fraunces), "Fraunces", "Cormorant Garamond", Georgia, serif',
              }}
            >
              <h3
                className="text-4xl md:text-5xl font-bold text-black dark:text-white text-center md:text-left tracking-tight italic"
                style={{
                  fontVariationSettings: '"opsz" 144, "SOFT" 30',
                  letterSpacing: "-0.02em",
                }}
              >
                My Story.
              </h3>

              {/* Northwestern image + opening paragraph wrap */}
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <motion.div
                  initial={{ opacity: 0, rotate: -6, y: 12 }}
                  whileInView={{ opacity: 1, rotate: -2, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ rotate: 0, scale: 1.04, y: -4 }}
                  transition={{ type: "spring", stiffness: 130, damping: 14, delay: 0.15 }}
                  className="flex-shrink-0 w-44 sm:w-48 self-center sm:self-start relative aspect-[4/5] overflow-hidden rounded-xl border border-blue-700/30 dark:border-purple-300/30 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.18),_0_0_30px_-5px_rgba(168,85,247,0.18)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),_0_0_30px_-5px_rgba(168,85,247,0.4)] cursor-pointer"
                >
                  <img
                    src="/nu1.jpg"
                    alt="Northwestern University"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 dark:from-purple-900/40 via-transparent to-transparent pointer-events-none" />
                </motion.div>

                <p className="text-black dark:text-gray-200 leading-[1.7] text-center sm:text-left text-lg">
                  I&apos;m currently pursuing an{" "}
                  <span className="italic text-black dark:text-white">M.S. in Data Science</span> with a
                  concentration in Artificial Intelligence at{" "}
                  <span className="italic text-black dark:text-purple-200">Northwestern University</span>. I
                  completed my B.S. in Computer Science with a Business Minor at Arizona State
                  University (GPA: 3.93).
                </p>
              </div>

              <p className="text-black dark:text-gray-200 leading-[1.75] text-center md:text-left text-lg">
                My coursework this quarter covered the foundations of{" "}
                <span className="italic text-black dark:text-purple-200">statistical inference</span>: hypothesis
                testing, p-values, confidence intervals, cross-validation, and regression
                analysis. I combine this statistical rigor with hands-on ML engineering
                experience from internships building data pipelines, recommendation engines, and
                anomaly detection systems.
              </p>
              <p className="text-black dark:text-gray-200 leading-[1.75] text-center md:text-left text-lg">
                I&apos;m passionate about applying data science to solve{" "}
                <span className="italic text-black dark:text-white">real-world problems</span>, from healthcare
                AI to predictive analytics and NLP systems.
              </p>
              <p className="text-black dark:text-gray-200 leading-[1.75] text-center md:text-left text-lg">
                And I ship outside the classroom. I built a working clone of{" "}
                <span className="italic text-black dark:text-purple-200">Cluely</span> (the real-time interview
                and meeting copilot) to learn the production loop end-to-end. I also built{" "}
                <span className="italic text-black dark:text-purple-200">CareerCraft.ai</span>, an AI resume and
                interview-prep product, which I{" "}
                <span className="font-semibold text-black dark:text-white not-italic">
                  sold to a startup
                </span>
                .
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-bold text-black dark:text-white">Skills</h3>
                <span className="font-mono text-[10px] text-black dark:text-purple-300/70 tracking-[0.35em] uppercase">
                  Projects &middot; Coursework
                </span>
              </div>

              <div>
                <SkillDeck data={skillRadar} />
              </div>

              {/* Live GitHub KPI strip */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-mono text-[10px] text-black dark:text-purple-300/80 tracking-widest uppercase">
                    GitHub &middot; live
                  </h4>
                  <a
                    href="https://github.com/pnehete23"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-mono text-[9px] text-black dark:text-purple-300/70 hover:text-black dark:hover:text-purple-200 tracking-widest uppercase inline-flex items-center gap-1"
                  >
                    <FaGithub className="text-[11px] dark:text-gray-300" /> @pnehete23
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      value: gitStats.repos,
                      fallback: "20+",
                      label: "Public Repos",
                      href: "https://github.com/pnehete23?tab=repositories",
                    },
                    {
                      value: gitStats.stars,
                      fallback: "—",
                      label: "Stars Earned",
                      href: "https://github.com/pnehete23?tab=repositories&q=&type=&language=&sort=stargazers",
                    },
                    {
                      value: gitStats.followers,
                      fallback: "—",
                      label: "Followers",
                      href: "https://github.com/pnehete23?tab=followers",
                    },
                  ].map((k) => (
                    <a
                      key={k.label}
                      href={k.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block rounded-lg bg-blue-800/10 dark:bg-purple-500/10 border border-blue-700/25 dark:border-purple-400/25 px-3 py-2 text-center hover:bg-blue-800/15 dark:hover:bg-purple-500/15 hover:border-blue-700/50 dark:hover:border-purple-400/50 transition-colors dark:text-gray-300"
                    >
                      <div className="text-xl font-bold bg-gradient-to-r from-slate-900 dark:from-purple-200 via-blue-700 dark:via-purple-300 to-slate-900 dark:to-purple-300 bg-clip-text text-transparent dark:text-gray-300">
                        <CountUp value={k.value} fallback={k.fallback} />
                      </div>
                      <div className="font-mono text-[9px] text-black dark:text-purple-300/80 tracking-wider uppercase mt-0.5">
                        {k.label}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>

          {/* NU FOOTBALL FIELD — full-bleed decorative banner. In light mode the
              image renders at full strength; in dark mode a soft veil keeps it
              consistent with the surrounding dark sections. */}
          <div className="relative my-2 h-24 md:h-36 overflow-hidden rounded-2xl">
            <img
              src="/northwestern-wildcats-desktop-2025-2000px-thumb.webp"
              alt="Northwestern Wildcats Field"
              className="absolute inset-0 w-full h-full object-cover opacity-100 dark:opacity-65"
            />
            {/* Dark-mode-only veil so text reads on the photo at night.
                In light mode the photo is fully visible — no overlay. */}
            <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-black via-purple-950/40 to-black" />
            <div className="hidden dark:block absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center dark:text-gray-300">
                <div
                  className="font-mono text-[9px] md:text-[11px] text-yellow-400 dark:text-yellow-300 tracking-[0.5em] uppercase"
                  style={{
                    textShadow:
                      "0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.55)",
                  }}
                >
                  Northwestern Wildcats &middot; Evanston, IL
                </div>
                <div
                  className="text-2xl md:text-4xl font-bold mt-1 tracking-tight text-yellow-400 dark:text-yellow-300"
                  style={{
                    textShadow:
                      "0 2px 8px rgba(0,0,0,0.85), 0 0 14px rgba(0,0,0,0.55)",
                    WebkitTextStroke: "1px black",
                  }}
                >
                  Go &lsquo;Cats.
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* COURSEWORK */}
      <section id="coursework" className="pt-16 pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center space-y-3 dark:text-gray-300"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-yellow-300">
              Coursework
            </h2>
            <p className="font-mono text-[10px] md:text-[11px] text-black dark:text-purple-300/70 tracking-[0.4em] uppercase inline-flex items-center gap-2 justify-center">
              <FaUniversity className="text-[12px] dark:text-gray-300" />
              Northwestern MSDS &middot; AI Specialization
            </p>
          </motion.div>

          <div className="space-y-3">
            {courseworkKpis.map((c, idx) => {
              const inProgress = c.status === "In Progress";
              const inner = (
                <div className="grid grid-cols-12 gap-4 items-baseline">
                  <div className="col-span-3 sm:col-span-2">
                    <span className="font-mono text-sm md:text-base font-semibold text-black dark:text-purple-200 tracking-wider whitespace-nowrap">
                      {c.code}
                    </span>
                  </div>
                  <div className="col-span-9 sm:col-span-10 md:col-span-5 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-black dark:text-white leading-snug">
                      {c.title}
                    </h3>
                    <div className="text-xs md:text-sm text-black dark:text-gray-400 mt-1 font-mono tracking-wide">
                      {c.term}
                      {inProgress && (
                        <span className="ml-2 inline-flex items-center gap-1 text-black dark:text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                          in progress
                        </span>
                      )}
                      {c.syllabus && (
                        <span className="ml-2 text-black dark:text-purple-300">
                          &middot; syllabus &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-5 min-w-0">
                    <div className="text-sm text-black dark:text-gray-300 leading-snug">
                      {c.skills.slice(0, 5).join(" · ")}
                      {c.skills.length > 5 && (
                        <span className="text-black dark:text-purple-300/60 ml-1">
                          +{c.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 md:hidden text-sm text-black leading-snug dark:text-gray-300">
                    {c.skills.slice(0, 5).join(" · ")}
                    {c.skills.length > 5 && (
                      <span className="text-black dark:text-purple-300/60 ml-1">
                        +{c.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              );

              const wrapperClass =
                "block rounded-xl border border-blue-700/15 dark:border-purple-400/15 bg-black/[0.035] dark:bg-white/[0.03] hover:bg-blue-800/[0.06] dark:hover:bg-purple-500/[0.06] hover:border-blue-700/40 dark:hover:border-purple-400/40 backdrop-blur-sm px-5 py-4 transition-colors";

              return (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: idx * 0.06, ease: "easeOut" }}
                  whileHover={{ x: 4 }}
                >
                  {c.syllabus ? (
                    <a
                      href={c.syllabus}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={wrapperClass}
                      title={`${c.code} — open syllabus`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className={wrapperClass}>{inner}</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="pt-16 pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-black dark:text-white text-center"
          >
            Experience
          </motion.h2>
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-black/[0.04] dark:bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h3 className="text-xl font-semibold text-black dark:text-white">{exp.title}</h3>
                  <span className="text-black font-medium dark:text-gray-300">{exp.period}</span>
                </div>
                <h4 className="text-lg text-black dark:text-gray-300 mb-2">{exp.company}</h4>
                {Array.isArray(exp.description) ? (
                  <ul className="text-black dark:text-gray-400 space-y-1.5 list-disc pl-5 marker:text-black dark:marker:text-gray-500">
                    {exp.description.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black dark:text-gray-400">{exp.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section
        ref={projectsRef}
        id="projects"
        className="pt-16 pb-20 px-4 relative"
      >
        {/* Wildcat Willy — hangs down on the LEFT side throughout the Projects
            section. Outer wrapper fills the section so the inner sticky pin
            has room to travel. Inner motion.div is `position: sticky` so Willy
            stays in viewport while the user scrolls through every project; the
            existing willyY transform handles the entry drop and the exit
            retract (string yanks him back up to the section's start). */}
        <div className="hidden lg:block absolute inset-0 left-6 xl:left-12 z-10 pointer-events-none select-none">
          <motion.div
            style={{ y: willyY }}
            className="sticky top-24 w-fit"
          >
            <div className="flex flex-col items-center">
              {/* Hanger string */}
              <div className="w-px h-14 bg-gradient-to-b from-transparent via-blue-700/30 dark:via-purple-300/30 to-blue-700/60 dark:to-purple-300/60" />
              {/* Pin */}
              <div className="w-2.5 h-2.5 rounded-full bg-blue-700 dark:bg-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.7)] -mt-1" />
              <motion.div
                style={{ transformOrigin: "top center" }}
                animate={{ rotate: [-3, 3, -3] }}
                transition={{
                  rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                }}
                whileHover={{ rotate: 12, scale: 1.05 }}
                className="relative -mt-0.5 w-32 xl:w-40 pointer-events-auto cursor-pointer"
              >
                <img
                  src="/wildcatwilly.jpg"
                  alt="Northwestern Wildcat Willy"
                  className="w-full h-auto rounded-lg shadow-[0_20px_40px_-10px_rgba(168,85,247,0.5)] mix-blend-screen"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-blue-950/80 dark:bg-purple-900/80 backdrop-blur-sm border border-blue-700/40 dark:border-purple-400/40 font-mono text-[9px] text-black dark:text-purple-200 tracking-widest uppercase whitespace-nowrap">
                  Go Cats
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto space-y-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center dark:text-gray-300"
          >
            <motion.h2
              initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 dark:from-purple-300 via-blue-800 to-slate-900 dark:to-purple-500 bg-clip-text text-transparent mb-6 leading-[1.18] pb-2 inline-block dark:text-gray-300"
              style={{ willChange: "clip-path, opacity" }}
            >
              My Projects
            </motion.h2>
            <p className="text-xl text-black dark:text-gray-300 max-w-3xl mx-auto">
              Recent work spanning research prototypes, AI products, ML pipelines, and full-stack apps.
            </p>
          </motion.div>

          {/* RESEARCH PROTOTYPE — featured showcase */}
          <motion.div
            initial={{ opacity: 0, y: 90, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-700/60 dark:to-purple-400/60" />
              <span className="text-black dark:text-purple-300 text-xs font-mono uppercase tracking-[0.3em]">
                Research Prototype
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-700/60 dark:to-purple-400/60" />
            </div>

            <TiltSpotlight className="relative block" max={5} lift={6} glare="rgba(168,85,247,0.18)">
            <a
              href="https://stealth-nu-research.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative rounded-2xl overflow-hidden border border-blue-700/30 dark:border-purple-400/30 bg-black/[0.05] dark:bg-black/40 backdrop-blur-md transition-all duration-500 group-hover:border-blue-700/70 dark:group-hover:border-purple-400/70 group-hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.55)]">
                <div className="grid md:grid-cols-5">
                  {/* Clinical RA-flare risk dashboard */}
                  <div className="md:col-span-3 relative h-80 md:h-auto md:min-h-[480px] md:self-stretch overflow-hidden border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-slate-950 dark:via-purple-950/40 dark:to-slate-950" />
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage:
                          "radial-gradient(rgba(168,85,247,0.35) 1px, transparent 1.5px)",
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Clean hero illustration — minimal medical motif */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-10 gap-6">
                      <HeartPulse
                        strokeWidth={1.6}
                        className="text-black w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_28px_rgba(244,114,182,0.55)] dark:text-gray-300"
                      />

                      <svg
                        viewBox="0 0 400 110"
                        className="w-full max-w-md"
                        preserveAspectRatio="xMidYMid meet"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient id="ra-clean-line" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(216,180,254,0.85)" />
                            <stop offset="60%" stopColor="rgba(168,85,247,0.95)" />
                            <stop offset="100%" stopColor="rgba(248,113,113,0.95)" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,55 L60,55 L80,40 L100,70 L120,55 L180,55 L195,30 L210,80 L225,55 L300,55 L320,18 L340,90 L360,50 L400,50"
                          stroke="url(#ra-clean-line)"
                          strokeWidth="2.4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ filter: "drop-shadow(0 0 8px rgba(168,85,247,0.5))" }}
                        />
                        <circle cx="395" cy="50" r="4" fill="rgba(248,113,113,0.95)">
                          <animate
                            attributeName="opacity"
                            values="1;0.3;1"
                            dur="1.6s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </svg>

                      <div className="font-mono text-[11px] text-black dark:text-purple-200/85 tracking-[0.4em] uppercase">
                        RA Flare Risk Predictor
                      </div>
                    </div>

                    {/* Hover hint */}
                    <div className="hidden md:block absolute top-5 right-12 font-mono text-[9px] text-black dark:text-purple-200/70 tracking-[0.35em] uppercase opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                      hover &rarr; stack
                    </div>

                    {/* Concept stack hover overlay (desktop, single source of truth) */}
                    <div className="hidden md:flex absolute inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto flex-col justify-center px-8 py-6 z-20 overflow-y-auto">
                      <ConceptStack groups={gradientRiskGroups} accentColor="text-black dark:text-purple-300" mode="overlay" />
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center space-y-5 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full bg-blue-800/20 dark:bg-purple-500/20 border border-blue-700/40 dark:border-purple-400/40 text-black dark:text-purple-200 font-mono">
                        Stealth Mode
                      </span>
                      <span className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full bg-blue-500/20 border border-blue-400/40 text-black dark:text-blue-200 font-mono inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Live
                      </span>
                      <span className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full bg-slate-900/[0.06] dark:bg-pink-500/20 border border-slate-900/25 dark:border-pink-400/40 text-black dark:text-pink-200 font-mono">
                        Northwestern
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 dark:from-purple-300 via-blue-800 dark:via-pink-300 to-slate-900 dark:to-blue-300 bg-clip-text text-transparent dark:text-gray-300">
                      RA Flare Risk Predictor
                    </h3>
                    <p className="text-black dark:text-gray-300 leading-relaxed">
                      A 7-day flare-risk pipeline for rheumatoid arthritis. XGBoost with
                      isotonic calibration on patient-grouped walk-forward splits, hitting{" "}
                      <span className="text-black dark:text-purple-200 font-medium">
                        61.5% precision at 21.6% recall
                      </span>{" "}
                      under a 10% clinician review budget. Served as a real-time streaming inference
                      API behind a SHAP-driven clinician dashboard with HDBSCAN subgroup discovery.
                    </p>
                    <p className="text-xs text-black italic leading-relaxed -mt-1 dark:text-gray-300">
                      Cohorts simulated from published RCT parameters (Wang et al., JMIR 2018;
                      NCT02822521). Hover the visual to explore the concept stack.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["Python", "XGBoost", "FastAPI", "MLflow", "Kafka", "Docker"].map((tech) => {
                        const Icon = getTechIcon(tech);
                        return (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-blue-800/15 dark:bg-purple-500/15 border border-blue-700/30 dark:border-purple-400/30 text-black dark:text-purple-200 text-xs rounded-full font-mono inline-flex items-center gap-1.5"
                          >
                            {Icon && <Icon className="shrink-0" />}
                            {tech}
                          </span>
                        );
                      })}
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-black dark:text-purple-300 group-hover:text-black dark:group-hover:text-white font-medium transition-colors">
                        View prototype
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          &rarr;
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
            </TiltSpotlight>

          {/* Mobile concept stack (md:hidden) — same data as desktop hover overlay */}
          <div className="md:hidden mt-3 rounded-2xl border border-blue-700/25 dark:border-purple-400/25 bg-black/[0.05] dark:bg-black/40 backdrop-blur-md p-5 space-y-4">
            <ConceptStack groups={gradientRiskGroups} accentColor="text-black dark:text-purple-300" mode="static" />
          </div>
          </motion.div>

          {/* PATIENT360 NU — featured clinical-genomic governance prototype */}
          <motion.div
            initial={{ opacity: 0, y: 90, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-400/60 dark:to-cyan-400/60" />
              <span className="text-black dark:text-cyan-300 text-xs font-mono uppercase tracking-[0.3em]">
                Patient360 NU
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-400/60 dark:to-cyan-400/60" />
            </div>

            <TiltSpotlight className="relative block" max={5} lift={6} glare="rgba(34,211,238,0.18)">
            <a
              href="https://patient360nu-production.up.railway.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative rounded-2xl overflow-hidden border border-blue-400/30 dark:border-cyan-400/30 bg-black/[0.05] dark:bg-black/40 backdrop-blur-md transition-all duration-500 group-hover:border-blue-400/70 dark:group-hover:border-cyan-400/70 group-hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.55)]">
                <div className="grid md:grid-cols-5">
                  {/* Clinical-genomic dashboard visual */}
                  <div className="md:col-span-3 relative h-80 md:h-auto md:min-h-[480px] md:self-stretch overflow-hidden border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 dark:from-cyan-50 via-blue-100 dark:via-cyan-100 to-blue-50 dark:to-cyan-50 dark:from-slate-950 dark:via-cyan-950/40 dark:to-slate-950" />
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(6,182,212,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.22) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                      }}
                    />

                    {/* TOP STRIP */}
                    <div className="absolute top-0 left-0 right-0 h-9 border-b border-blue-500/25 dark:border-cyan-500/25 bg-black/[0.06] dark:bg-black/60 backdrop-blur-sm flex items-stretch overflow-hidden z-[2]">
                      <div className="px-3 flex items-center border-r border-blue-500/25 dark:border-cyan-500/25 bg-blue-500/10 dark:bg-cyan-500/10">
                        <span className="font-mono text-[10px] text-black dark:text-cyan-100 tracking-[0.3em] uppercase">
                          Patient360 NU &middot; v3
                        </span>
                      </div>
                      <div className="flex-1 flex items-center px-3 gap-3 overflow-hidden">
                        <span className="font-mono text-[9px] text-black dark:text-emerald-300 tracking-widest uppercase inline-flex items-center gap-1.5 whitespace-nowrap">
                          <FaShieldAlt className="text-[10px] dark:text-gray-300" />
                          HIPAA Safe Harbor
                        </span>
                        <span className="font-mono text-[9px] text-black hidden md:inline whitespace-nowrap dark:text-gray-300">
                          CPIC &middot; openFDA &middot; CT.gov &middot; RxNav
                        </span>
                      </div>
                      <div className="px-3 flex items-center gap-1.5 border-l border-blue-500/25 dark:border-cyan-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-black dark:text-emerald-300 tracking-widest">
                          LIVE
                        </span>
                      </div>
                    </div>

                    {/* MAIN — full-width DNA helix (no sidebar — distinct shape) */}
                    <div className="absolute inset-x-0 top-9 bottom-[68px]">
                      <div className="relative w-full h-full">
                        <div className="absolute top-2 left-3 z-[1]">
                          <div className="font-mono text-[9px] text-black tracking-widest uppercase dark:text-gray-300">
                            Pharmacogenomic Safety
                          </div>
                          <div className="font-mono text-[8px] text-black mt-0.5 dark:text-gray-300">
                            CPIC 4-tier &middot; cross-gene scan
                          </div>
                        </div>

                        {/* Floating high-risk alert */}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="absolute top-2 right-3 z-[1] px-2 py-1.5 rounded bg-yellow-500/15 dark:bg-rose-500/15 border border-yellow-400/40 dark:border-rose-400/40 backdrop-blur-sm font-mono text-[9px] max-w-[180px] dark:text-gray-300"
                        >
                          <div className="flex items-center gap-1.5 text-black dark:text-rose-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-rose-400 animate-pulse" />
                            <span className="font-semibold tracking-wider">HIGH RISK</span>
                          </div>
                          <div className="text-black text-[9px] mt-0.5 leading-snug dark:text-gray-300">
                            CYP2D6 + Codeine: poor metabolizer &middot; avoid
                          </div>
                        </motion.div>

                        {/* DNA helix SVG — full-bleed, more cycles to fill the wider area */}
                        <svg
                          className="absolute inset-0 w-full h-full"
                          viewBox="0 0 480 300"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <defs>
                            <linearGradient id="p360StrandA" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(34,211,238,0.95)" />
                              <stop offset="100%" stopColor="rgba(16,185,129,0.95)" />
                            </linearGradient>
                            <linearGradient id="p360StrandB" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(244,114,182,0.85)" />
                              <stop offset="100%" stopColor="rgba(168,85,247,0.85)" />
                            </linearGradient>
                          </defs>

                          {(() => {
                            const N = 32;
                            const startX = 25;
                            const endX = 455;
                            const span = endX - startX;
                            const cycles = 3.2;
                            const cy = 160;
                            const amp = 62;
                            const path = (phase: number) => {
                              const pts: string[] = [];
                              for (let i = 0; i <= N; i++) {
                                const t = i / N;
                                const x = startX + t * span;
                                const y =
                                  cy + amp * Math.sin(t * Math.PI * 2 * cycles + phase);
                                pts.push(
                                  `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
                                );
                              }
                              return pts.join(" ");
                            };
                            const rungs: { x: number; yA: number; yB: number; idx: number }[] =
                              [];
                            for (let i = 1; i < N; i += 2) {
                              const t = i / N;
                              const x = startX + t * span;
                              const phaseA = t * Math.PI * 2 * cycles;
                              const yA = cy + amp * Math.sin(phaseA);
                              const yB = cy + amp * Math.sin(phaseA + Math.PI);
                              rungs.push({ x, yA, yB, idx: i });
                            }
                            const alertIdx = new Set([4, 10]);
                            return (
                              <g>
                                <path
                                  d={path(0)}
                                  stroke="url(#p360StrandA)"
                                  strokeWidth="1.6"
                                  fill="none"
                                  style={{
                                    filter: "drop-shadow(0 0 4px rgba(34,211,238,0.5))",
                                  }}
                                />
                                <path
                                  d={path(Math.PI)}
                                  stroke="url(#p360StrandB)"
                                  strokeWidth="1.6"
                                  fill="none"
                                  style={{
                                    filter: "drop-shadow(0 0 4px rgba(244,114,182,0.5))",
                                  }}
                                />
                                {rungs.map((r, k) => {
                                  const isAlert = alertIdx.has(k);
                                  return (
                                    <line
                                      key={r.idx}
                                      x1={r.x}
                                      y1={r.yA}
                                      x2={r.x}
                                      y2={r.yB}
                                      stroke={
                                        isAlert
                                          ? "rgba(248,113,113,0.85)"
                                          : "rgba(125,211,252,0.4)"
                                      }
                                      strokeWidth={isAlert ? "1.6" : "0.7"}
                                    >
                                      {isAlert && (
                                        <animate
                                          attributeName="opacity"
                                          values="1;0.3;1"
                                          dur="1.6s"
                                          repeatCount="indefinite"
                                        />
                                      )}
                                    </line>
                                  );
                                })}
                                {/* Gene callouts at alert rungs */}
                                {[
                                  { idx: 4, label: "CYP2D6" },
                                  { idx: 10, label: "DPYD" },
                                ].map((g, k) => {
                                  const r = rungs[g.idx];
                                  if (!r) return null;
                                  const yLabel = k === 0 ? Math.min(r.yA, r.yB) - 8 : Math.max(r.yA, r.yB) + 14;
                                  return (
                                    <text
                                      key={g.label}
                                      x={r.x}
                                      y={yLabel}
                                      fill="rgba(248,113,113,0.95)"
                                      fontSize="8.5"
                                      fontFamily="ui-monospace, monospace"
                                      textAnchor="middle"
                                      fontWeight="600"
                                    >
                                      {g.label}
                                    </text>
                                  );
                                })}
                              </g>
                            );
                          })()}
                        </svg>

                        {/* Bottom helix label */}
                        <div className="absolute bottom-2 left-3 z-[1] flex items-center gap-2 font-mono text-[8.5px] text-black tracking-wider dark:text-gray-300">
                          <span>22 GENES</span>
                          <span className="text-black dark:text-gray-300">·</span>
                          <span>200 PATIENTS</span>
                          <span className="text-black dark:text-gray-300">·</span>
                          <span className="text-black dark:text-gray-300">2 ALERTS</span>
                        </div>
                      </div>
                    </div>

                    {/* AUDIT LOG MARQUEE — horizontal scrolling band (replaces sidebar) */}
                    <div className="absolute bottom-9 left-0 right-0 h-7 border-y border-blue-500/25 dark:border-cyan-500/25 bg-white/70 dark:bg-black/55 backdrop-blur-sm flex items-stretch overflow-hidden z-[2]">
                      <div className="px-3 flex items-center border-r border-blue-500/25 dark:border-cyan-500/25 bg-blue-500/10 dark:bg-cyan-500/10 shrink-0">
                        <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-black dark:text-cyan-200 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                          Audit
                        </span>
                      </div>
                      <div className="relative flex-1 overflow-hidden flex items-center">
                        <motion.div
                          className="flex gap-6 items-center whitespace-nowrap font-mono text-[10px] pl-4 dark:text-gray-300"
                          animate={{ x: ["0%", "-50%"] }}
                          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                        >
                          {(() => {
                            const events = [
                              { t: "12:34", e: "consent:granted", c: "bg-emerald-500 dark:bg-emerald-400" },
                              { t: "12:33", e: "reveal:dx_code", c: "bg-slate-900 dark:bg-amber-400" },
                              { t: "12:33", e: "cpic:CYP2D6", c: "bg-blue-400 dark:bg-cyan-400" },
                              { t: "12:32", e: "alert:hi-risk", c: "bg-red-500 dark:bg-rose-400" },
                              { t: "12:32", e: "vault:lookup", c: "bg-blue-700 dark:bg-violet-400" },
                              { t: "12:31", e: "fda:adverse", c: "bg-blue-400 dark:bg-cyan-400" },
                              { t: "12:30", e: "lineage:view", c: "bg-blue-400 dark:bg-indigo-400" },
                              { t: "12:29", e: "rxnav:ddi", c: "bg-blue-400 dark:bg-cyan-400" },
                            ];
                            return [...events, ...events].map((row, i) => (
                              <span key={i} className="flex items-center gap-1.5">
                                <span
                                  className={`w-1 h-1 rounded-full ${row.c} shrink-0`}
                                />
                                <span className="text-black dark:text-gray-300">{row.t}</span>
                                <span className="text-black dark:text-gray-200">{row.e}</span>
                              </span>
                            ));
                          })()}
                        </motion.div>
                      </div>
                    </div>

                    {/* BOTTOM STRIP */}
                    <div className="absolute bottom-0 left-0 right-0 h-9 border-t border-blue-500/25 dark:border-cyan-500/25 bg-black/[0.06] dark:bg-black/60 backdrop-blur-sm flex items-center justify-between px-3 font-mono text-[10px] z-[2] dark:text-gray-300">
                      <div className="flex items-center gap-2.5 md:gap-4 text-black dark:text-gray-400">
                        <span>
                          APIs <span className="text-black dark:text-cyan-100">4</span>
                        </span>
                        <span>
                          PHI <span className="text-black dark:text-emerald-300">18 cat</span>
                        </span>
                        <span className="hidden md:inline">
                          Audit <span className="text-black dark:text-emerald-300">100%</span>
                        </span>
                        <span className="hidden md:inline">
                          Bundle <span className="text-black dark:text-cyan-100">92KB</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-black dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        <span>0 LEAKS</span>
                      </div>
                    </div>

                    {/* Hover hint */}
                    <div className="hidden md:block absolute top-12 right-3 font-mono text-[9px] text-black tracking-[0.35em] uppercase opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none dark:text-gray-300">
                      hover &rarr; stack
                    </div>

                    {/* Concept stack hover overlay (desktop, single source of truth) */}
                    <div className="hidden md:flex absolute inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto flex-col justify-center px-8 py-6 z-20 overflow-y-auto">
                      <ConceptStack groups={patient360Groups} accentColor="text-black dark:text-cyan-300" mode="overlay" />
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center space-y-5 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-600/45 dark:border-emerald-400/40 text-black dark:text-emerald-100 font-mono inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                      <span className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full bg-slate-900/[0.06] dark:bg-rose-500/15 border border-slate-900/25 dark:border-rose-400/40 text-black dark:text-rose-100 font-mono">
                        HIPAA
                      </span>
                      <span className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full bg-blue-500/15 dark:bg-cyan-500/15 border border-blue-400/35 dark:border-cyan-400/35 text-black dark:text-cyan-100 font-mono">
                        Synthetic Data
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 dark:from-cyan-200 via-blue-800 dark:via-sky-100 to-slate-900 dark:to-blue-300 bg-clip-text text-transparent dark:text-gray-300">
                      Patient360 NU
                    </h3>
                    <p className="text-black dark:text-gray-300 leading-relaxed">
                      A HIPAA-compliant clinical-genomic governance prototype. A{" "}
                      <span className="text-black dark:text-cyan-200 font-medium">
                        4-tier CPIC safety engine
                      </span>{" "}
                      catches high-risk gene-drug pairs at prescription time, paired with a PHI
                      vault, immutable audit log, and granular consent. All backed by{" "}
                      <span className="text-black dark:text-cyan-200 font-medium">
                        four live public health APIs
                      </span>
                      .
                    </p>
                    <ul className="text-[12.5px] text-black leading-relaxed space-y-1 -mt-1 dark:text-gray-300">
                      <li className="flex gap-2">
                        <span className="text-black dark:text-cyan-300">·</span>
                        Adverse-event prevention at prescription time
                      </li>
                      <li className="flex gap-2">
                        <span className="text-black dark:text-cyan-300">·</span>
                        Regulator-ready: HIPAA, GDPR Art. 30, 21 CFR Part 11
                      </li>
                      <li className="flex gap-2">
                        <span className="text-black dark:text-cyan-300">·</span>
                        Consent as a first-class, revocable object
                      </li>
                    </ul>
                    <p className="text-xs text-black italic leading-relaxed -mt-1 dark:text-gray-300">
                      Built on synthetic patient data &middot; live gene-level APIs are massive
                      and access-gated, so the generator mirrors real CPIC alleles, ClinVar
                      pathogenicity, and SEER prevalence. Hover the visual to explore the concept
                      stack.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["React", "Vite", "Python", "CPIC", "openFDA", "Railway"].map((tech) => {
                        const Icon = getTechIcon(tech);
                        return (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-blue-500/15 dark:bg-cyan-500/15 border border-blue-400/30 dark:border-cyan-400/30 text-black dark:text-cyan-100 text-xs rounded-full font-mono inline-flex items-center gap-1.5"
                          >
                            {Icon && <Icon className="shrink-0" />}
                            {tech}
                          </span>
                        );
                      })}
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-black dark:text-cyan-200 group-hover:text-black dark:group-hover:text-white font-medium transition-colors">
                        Open prototype
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          &rarr;
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
            </TiltSpotlight>

          {/* Mobile concept stack (md:hidden) — same data as desktop hover overlay */}
          <div className="md:hidden mt-3 rounded-2xl border border-blue-400/25 dark:border-cyan-400/25 bg-black/[0.05] dark:bg-black/40 backdrop-blur-md p-5 space-y-4">
            <ConceptStack groups={patient360Groups} accentColor="text-black dark:text-cyan-300" mode="static" />
          </div>
          </motion.div>

          {/* QUANT TRADING DASHBOARD — featured */}
          <motion.div
            initial={{ opacity: 0, y: 90, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-700/60 dark:to-emerald-400/60" />
              <span className="text-black dark:text-emerald-300 text-xs font-mono uppercase tracking-[0.3em]">
                Quant Trading Dashboard
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-700/60 dark:to-emerald-400/60" />
            </div>

            <TiltSpotlight className="relative block" max={5} lift={6} glare="rgba(16,185,129,0.18)">
            <a
              href="https://web-production-404cc.up.railway.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative rounded-2xl overflow-hidden border border-yellow-400/30 dark:border-emerald-400/30 bg-black/[0.05] dark:bg-black/40 backdrop-blur-md transition-all duration-500 group-hover:border-yellow-400/70 dark:group-hover:border-emerald-400/70 group-hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.55)]">
                <div className="grid md:grid-cols-5">
                  {/* Live trading terminal visual (multi-pane) */}
                  <div className="md:col-span-3 relative h-80 md:h-auto md:min-h-[480px] md:self-stretch overflow-hidden border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
                    {/* Background — different motif from stealth: dot grid on deep slate */}
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 dark:from-emerald-50 via-yellow-100 dark:via-emerald-100 to-yellow-50 dark:to-emerald-50 dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-950" />
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "radial-gradient(rgba(16,185,129,0.45) 1px, transparent 1.5px)",
                        backgroundSize: "18px 18px",
                      }}
                    />

                    {/* Clean hero illustration — minimal trading-chart motif */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-10 gap-6">
                      <CandlestickChart
                        strokeWidth={1.6}
                        className="text-black w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_28px_rgba(16,185,129,0.55)] dark:text-gray-300"
                      />

                      <svg
                        viewBox="0 0 400 150"
                        className="w-full max-w-md"
                        preserveAspectRatio="xMidYMid meet"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient id="qt-clean-line" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(16,185,129,0.95)" />
                            <stop offset="100%" stopColor="rgba(34,211,238,0.95)" />
                          </linearGradient>
                          <linearGradient id="qt-clean-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(16,185,129,0.45)" />
                            <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,95 L40,85 L80,105 L120,70 L160,80 L200,60 L240,70 L280,40 L320,50 L360,30 L400,42 L400,150 L0,150 Z"
                          fill="url(#qt-clean-fill)"
                        />
                        <path
                          d="M0,95 L40,85 L80,105 L120,70 L160,80 L200,60 L240,70 L280,40 L320,50 L360,30 L400,42"
                          stroke="url(#qt-clean-line)"
                          strokeWidth="2.4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.6))" }}
                        />
                        <circle cx="395" cy="42" r="4" fill="rgba(167,243,208,0.95)">
                          <animate
                            attributeName="opacity"
                            values="1;0.3;1"
                            dur="1.8s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </svg>

                      <div className="font-mono text-[11px] text-black tracking-[0.4em] uppercase dark:text-gray-300">
                        Quant Trading Dashboard
                      </div>
                    </div>
                    {/* Hover hint */}
                    <div className="hidden md:block absolute top-12 right-3 font-mono text-[9px] text-black tracking-[0.35em] uppercase opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none dark:text-gray-300">
                      hover &rarr; stack
                    </div>

                    {/* Concept stack hover overlay (desktop, single source of truth) */}
                    <div className="hidden md:flex absolute inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto flex-col justify-center px-8 py-6 z-20 overflow-y-auto">
                      <ConceptStack groups={quantDashboardGroups} accentColor="text-black dark:text-emerald-300" mode="overlay" />
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center space-y-5 bg-gradient-to-br from-white/5 to-transparent">
                    <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 dark:from-emerald-300 via-blue-800 dark:via-cyan-300 to-slate-900 dark:to-blue-300 bg-clip-text text-transparent dark:text-gray-300">
                      Quant Trading Dashboard
                    </h3>
                    <p className="text-black dark:text-gray-300 leading-relaxed">
                      A 4-page Streamlit dashboard for momentum and mean-reversion backtesting on
                      live yfinance data. Includes <span className="text-black dark:text-emerald-200">walk-forward validation</span>,
                      a <span className="text-black dark:text-emerald-200">parameter heatmap</span>, a{" "}
                      <span className="text-black dark:text-emerald-200">cost-sensitivity sweep</span>, watchlist
                      compare, and entry/exit markers on real prices. Vectorized pandas core with a
                      TTL-cached compute layer; deployed on Railway.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {["Python", "Streamlit", "pandas", "NumPy", "Plotly", "Railway"].map(
                        (tech) => {
                          const Icon = getTechIcon(tech);
                          return (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-yellow-500/15 dark:bg-emerald-500/15 border border-yellow-400/30 dark:border-emerald-400/30 text-black dark:text-emerald-200 text-xs rounded-full font-mono inline-flex items-center gap-1.5"
                            >
                              {Icon && <Icon className="shrink-0" />}
                              {tech}
                            </span>
                          );
                        }
                      )}
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-black dark:text-emerald-300 group-hover:text-black dark:group-hover:text-white font-medium transition-colors">
                        Open dashboard
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          &rarr;
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
            </TiltSpotlight>

          {/* Mobile concept stack (md:hidden) — same data as desktop hover overlay */}
          <div className="md:hidden mt-3 rounded-2xl border border-emerald-600/25 dark:border-emerald-400/25 bg-black/[0.05] dark:bg-black/40 backdrop-blur-md p-5 space-y-4">
            <ConceptStack groups={quantDashboardGroups} accentColor="text-black dark:text-emerald-300" mode="static" />
          </div>
          </motion.div>

          {/* AIRLINE DATA WAREHOUSE & ANALYTICS — featured */}
          <motion.div
            initial={{ opacity: 0, y: 90, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-700/60 dark:to-sky-400/60" />
              <span className="text-black dark:text-sky-300 text-xs font-mono uppercase tracking-[0.3em]">
                Data Warehouse &amp; Analytics
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-700/60 dark:to-sky-400/60" />
            </div>

            <TiltSpotlight className="relative block" max={5} lift={6} glare="rgba(56,189,248,0.18)">
            <div className="group block">
              <div className="relative rounded-2xl overflow-hidden border border-sky-500/30 dark:border-sky-400/30 bg-black/[0.05] dark:bg-black/40 backdrop-blur-md transition-all duration-500 group-hover:border-sky-500/70 dark:group-hover:border-sky-400/70 group-hover:shadow-[0_0_60px_-15px_rgba(56,189,248,0.55)]">
                <div className="grid md:grid-cols-5">
                  {/* Star-schema warehouse visual */}
                  <div className="md:col-span-3 relative h-80 md:h-auto md:min-h-[480px] md:self-stretch overflow-hidden border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50 dark:from-slate-950 dark:via-sky-950/30 dark:to-slate-950" />
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "radial-gradient(rgba(56,189,248,0.45) 1px, transparent 1.5px)",
                        backgroundSize: "18px 18px",
                      }}
                    />

                    {/* Clean hero illustration — star-schema motif */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-10 gap-6">
                      <Plane
                        strokeWidth={1.6}
                        className="text-black w-14 h-14 md:w-16 md:h-16 drop-shadow-[0_0_28px_rgba(56,189,248,0.55)] dark:text-gray-300"
                      />

                      <svg
                        viewBox="0 0 400 200"
                        className="w-full max-w-md"
                        preserveAspectRatio="xMidYMid meet"
                        aria-hidden="true"
                      >
                        {/* fact → dimension connectors */}
                        <g
                          stroke="rgba(56,189,248,0.85)"
                          strokeWidth="1.6"
                          strokeDasharray="3 4"
                          strokeLinecap="round"
                          fill="none"
                        >
                          <path d="M200,100 L68,43">
                            <animate attributeName="stroke-dashoffset" values="0;-14" dur="1.5s" repeatCount="indefinite" />
                          </path>
                          <path d="M200,100 L332,43">
                            <animate attributeName="stroke-dashoffset" values="0;-14" dur="1.7s" repeatCount="indefinite" />
                          </path>
                          <path d="M200,100 L68,157">
                            <animate attributeName="stroke-dashoffset" values="0;-14" dur="1.9s" repeatCount="indefinite" />
                          </path>
                          <path d="M200,100 L332,157">
                            <animate attributeName="stroke-dashoffset" values="0;-14" dur="1.6s" repeatCount="indefinite" />
                          </path>
                        </g>

                        {/* dimension tables */}
                        {[
                          { x: 40, y: 28 },
                          { x: 304, y: 28 },
                          { x: 40, y: 142 },
                          { x: 304, y: 142 },
                        ].map((d, i) => (
                          <g key={i} transform={`translate(${d.x}, ${d.y})`}>
                            <rect width="56" height="30" rx="4" fill="rgba(56,189,248,0.12)" stroke="rgba(56,189,248,0.7)" strokeWidth="1.2" />
                            <rect x="8" y="7" width="40" height="3" rx="1.5" fill="rgba(56,189,248,0.85)" />
                            <rect x="8" y="15" width="32" height="2.5" rx="1.25" fill="rgba(255,255,255,0.55)" />
                            <rect x="8" y="21" width="36" height="2.5" rx="1.25" fill="rgba(255,255,255,0.4)" />
                          </g>
                        ))}

                        {/* central fact table */}
                        <g transform="translate(162, 80)">
                          <rect width="76" height="40" rx="6" fill="rgba(34,211,238,0.18)" stroke="rgba(34,211,238,0.95)" strokeWidth="1.8">
                            <animate attributeName="opacity" values="0.75;1;0.75" dur="2.6s" repeatCount="indefinite" />
                          </rect>
                          <rect x="12" y="8" width="52" height="4" rx="2" fill="rgba(34,211,238,0.95)" />
                          <rect x="12" y="18" width="44" height="2.5" rx="1.25" fill="rgba(255,255,255,0.6)" />
                          <rect x="12" y="25" width="50" height="2.5" rx="1.25" fill="rgba(255,255,255,0.45)" />
                          <rect x="12" y="32" width="38" height="2.5" rx="1.25" fill="rgba(255,255,255,0.35)" />
                        </g>
                      </svg>

                      <div className="font-mono text-[11px] text-black tracking-[0.4em] uppercase dark:text-gray-300">
                        Airline Star Schema
                      </div>
                    </div>

                    {/* Hover hint */}
                    <div className="hidden md:block absolute top-12 right-3 font-mono text-[9px] text-black tracking-[0.35em] uppercase opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none dark:text-gray-300">
                      hover &rarr; stack
                    </div>

                    {/* Concept stack hover overlay (desktop, single source of truth) */}
                    <div className="hidden md:flex absolute inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto flex-col justify-center px-8 py-6 z-20 overflow-y-auto">
                      <ConceptStack groups={airlineWarehouseGroups} accentColor="text-black dark:text-sky-300" mode="overlay" />
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center space-y-5 bg-gradient-to-br from-white/5 to-transparent">
                    <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 dark:from-sky-300 via-blue-800 dark:via-cyan-300 to-slate-900 dark:to-blue-300 bg-clip-text text-transparent dark:text-gray-300">
                      Airline Data Warehouse &amp; Analytics
                    </h3>
                    <p className="text-black dark:text-gray-300 leading-relaxed">
                      A <span className="text-black dark:text-sky-200">star-schema warehouse</span> over{" "}
                      <span className="text-black dark:text-sky-200">20M+ flight records</span> with automated{" "}
                      <span className="text-black dark:text-sky-200">Apache Spark ETL</span> and Airflow
                      orchestration. Trino-backed analytical queries return in{" "}
                      <span className="text-black dark:text-sky-200">under a second</span> and feed
                      interactive Superset and Jupyter dashboards for ops decisions.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {["PostgreSQL", "Python", "Apache Spark", "Trino", "Airflow", "Superset"].map(
                        (tech) => {
                          const Icon = getTechIcon(tech);
                          return (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-sky-500/15 border border-sky-400/30 text-black dark:text-sky-200 text-xs rounded-full font-mono inline-flex items-center gap-1.5"
                            >
                              {Icon && <Icon className="shrink-0" />}
                              {tech}
                            </span>
                          );
                        }
                      )}
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-black dark:text-sky-300 font-medium font-mono text-xs uppercase tracking-widest">
                        Star schema &middot; 20M+ records &middot; sub-second queries
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </TiltSpotlight>

          {/* Mobile concept stack (md:hidden) — same data as desktop hover overlay */}
          <div className="md:hidden mt-3 rounded-2xl border border-sky-500/25 dark:border-sky-400/25 bg-black/[0.05] dark:bg-black/40 backdrop-blur-md p-5 space-y-4">
            <ConceptStack groups={airlineWarehouseGroups} accentColor="text-black dark:text-sky-300" mode="static" />
          </div>
          </motion.div>

          {/* SELECTED PROJECTS */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-400/60" />
              <span className="text-black dark:text-blue-300 text-xs font-mono uppercase tracking-[0.3em]">
                Selected Projects
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-400/60" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: (index % 4) * 0.08 }}
                  className={`group ${project.featured ? "md:col-span-2" : ""}`}
                >
                  <TiltSpotlight className="relative h-full" max={6} lift={8} glare="rgba(99,102,241,0.20)">
                  <div className="relative h-full bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden hover:border-black/20 dark:hover:border-white/30 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.45)]">
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      {project.title === "CareerCraft AI" ? (
                        <div className="absolute inset-0">
                          {/* Layered gradient backdrop */}
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_30%,rgba(168,85,247,0.5),transparent_55%),radial-gradient(ellipse_at_80%_75%,rgba(59,130,246,0.4),transparent_60%),linear-gradient(135deg,#1a0838_0%,#0c0a1f_55%,#06101e_100%)]" />

                          {/* Faint grid */}
                          <svg
                            className="absolute inset-0 w-full h-full opacity-[0.16]"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <defs>
                              <pattern id="cc-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                                <path
                                  d="M 32 0 L 0 0 0 32"
                                  fill="none"
                                  stroke="rgba(168,85,247,0.45)"
                                  strokeWidth="0.6"
                                />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#cc-grid)" />
                          </svg>

                          {/* Main illustration */}
                          <svg
                            viewBox="0 0 480 280"
                            preserveAspectRatio="xMidYMid meet"
                            className="absolute inset-0 w-full h-full"
                            aria-hidden="true"
                          >
                            <defs>
                              <linearGradient id="cc-doc" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.13)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
                              </linearGradient>
                              <radialGradient id="cc-orb" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(232,213,255,0.95)" />
                                <stop offset="55%" stopColor="rgba(168,85,247,0.35)" />
                                <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                              </radialGradient>
                            </defs>

                            {/* Resume document */}
                            <g transform="translate(70, 38)">
                              <rect
                                width="170"
                                height="204"
                                rx="8"
                                fill="url(#cc-doc)"
                                stroke="rgba(216,180,254,0.55)"
                                strokeWidth="1.4"
                              />
                              {/* Header */}
                              <rect x="20" y="22" width="80" height="8" rx="3" fill="rgba(216,180,254,0.85)" />
                              <rect x="20" y="38" width="120" height="3" rx="1.5" fill="rgba(255,255,255,0.45)" />
                              <rect x="20" y="48" width="90" height="3" rx="1.5" fill="rgba(255,255,255,0.30)" />

                              {/* Section: Experience */}
                              <rect x="20" y="72" width="50" height="5" rx="2" fill="rgba(168,85,247,0.95)">
                                <animate
                                  attributeName="opacity"
                                  values="0.55;1;0.55"
                                  dur="2.6s"
                                  repeatCount="indefinite"
                                />
                              </rect>
                              <rect x="20" y="86" width="130" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
                              <rect x="20" y="96" width="115" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
                              <rect x="20" y="106" width="100" height="3" rx="1.5" fill="rgba(255,255,255,0.45)" />

                              {/* Section: Skills */}
                              <rect x="20" y="128" width="50" height="5" rx="2" fill="rgba(59,130,246,0.95)" />
                              <rect x="20" y="142" width="130" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
                              <rect x="20" y="152" width="105" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
                              <rect x="20" y="162" width="120" height="3" rx="1.5" fill="rgba(255,255,255,0.45)" />
                              <rect x="20" y="172" width="80" height="3" rx="1.5" fill="rgba(255,255,255,0.30)" />
                            </g>

                            {/* Animated dashed beams: doc → AI orb */}
                            <g
                              stroke="rgba(216,180,254,0.55)"
                              strokeWidth="1.5"
                              fill="none"
                              strokeDasharray="3 4"
                              strokeLinecap="round"
                            >
                              <path d="M 240 95 Q 310 95 355 80">
                                <animate
                                  attributeName="stroke-dashoffset"
                                  values="0;-14"
                                  dur="1.4s"
                                  repeatCount="indefinite"
                                />
                              </path>
                              <path d="M 240 145 Q 310 145 355 140">
                                <animate
                                  attributeName="stroke-dashoffset"
                                  values="0;-14"
                                  dur="1.7s"
                                  repeatCount="indefinite"
                                />
                              </path>
                              <path d="M 240 200 Q 310 200 355 200">
                                <animate
                                  attributeName="stroke-dashoffset"
                                  values="0;-14"
                                  dur="2.0s"
                                  repeatCount="indefinite"
                                />
                              </path>
                            </g>

                            {/* AI orb */}
                            <g transform="translate(390, 140)">
                              <circle r="62" fill="url(#cc-orb)" />
                              <circle
                                r="32"
                                fill="rgba(34,12,68,0.85)"
                                stroke="rgba(216,180,254,0.85)"
                                strokeWidth="1.8"
                              />
                              <text
                                textAnchor="middle"
                                dy="6"
                                fontFamily="ui-monospace, monospace"
                                fontSize="18"
                                fontWeight="700"
                                fill="rgba(243,232,255,1)"
                                letterSpacing="2"
                              >
                                AI
                              </text>

                              {/* Orbiting accents */}
                              <g>
                                <circle cx="42" cy="0" r="3" fill="rgba(216,180,254,1)" />
                                <animateTransform
                                  attributeName="transform"
                                  type="rotate"
                                  from="0"
                                  to="360"
                                  dur="6.2s"
                                  repeatCount="indefinite"
                                />
                              </g>
                              <g>
                                <circle cx="-46" cy="0" r="2.4" fill="rgba(125,211,252,0.95)" />
                                <animateTransform
                                  attributeName="transform"
                                  type="rotate"
                                  from="0"
                                  to="-360"
                                  dur="8.8s"
                                  repeatCount="indefinite"
                                />
                              </g>
                            </g>

                            {/* Sparkles */}
                            <g fill="rgba(232,213,255,0.95)">
                              <circle cx="278" cy="68" r="2">
                                <animate
                                  attributeName="opacity"
                                  values="0;1;0"
                                  dur="1.9s"
                                  repeatCount="indefinite"
                                  begin="0s"
                                />
                              </circle>
                              <circle cx="316" cy="208" r="1.8">
                                <animate
                                  attributeName="opacity"
                                  values="0;1;0"
                                  dur="2.1s"
                                  repeatCount="indefinite"
                                  begin="0.45s"
                                />
                              </circle>
                              <circle cx="298" cy="120" r="1.5">
                                <animate
                                  attributeName="opacity"
                                  values="0;1;0"
                                  dur="2.3s"
                                  repeatCount="indefinite"
                                  begin="0.85s"
                                />
                              </circle>
                              <circle cx="338" cy="170" r="2">
                                <animate
                                  attributeName="opacity"
                                  values="0;1;0"
                                  dur="1.7s"
                                  repeatCount="indefinite"
                                  begin="1.25s"
                                />
                              </circle>
                            </g>
                          </svg>

                          {/* Meta chip */}
                          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-800/15 dark:bg-purple-500/15 border border-blue-700/35 dark:border-purple-300/35 font-mono text-[10px] tracking-widest uppercase text-black dark:text-purple-100/90 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            AI Resume Engine
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(min-width: 768px) 50vw, 100vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/92 dark:from-black/85 via-white/30 dark:via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white drop-shadow-lg group-hover:text-black dark:group-hover:text-blue-300 transition-colors">
                          {project.title}
                        </h3>
                      </div>
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-4 right-4 px-3 py-2 rounded-full bg-white/85 dark:bg-black/70 backdrop-blur-sm border border-black/15 dark:border-white/20 text-black dark:text-white text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/95 dark:hover:bg-black/90 hover:scale-105"
                        >
                          <FaGithub />
                          View
                        </a>
                      )}
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-black dark:text-gray-300 leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => {
                          const Icon = getTechIcon(tech);
                          const tooltip = TECH_TOOLTIPS[tech];
                          return (
                            <span
                              key={tech}
                              className="relative inline-block group/chip align-middle"
                            >
                              <span
                                className={`px-3 py-1 bg-blue-500/10 border border-blue-400/30 text-black dark:text-blue-200 text-xs rounded-full font-medium inline-flex items-center gap-1.5 transition-colors duration-200 cursor-default ${
                                  tooltip
                                    ? "underline decoration-dotted decoration-blue-400/30 underline-offset-[5px] group-hover/chip:bg-blue-500/25 group-hover/chip:border-blue-400/55"
                                    : ""
                                }`}
                              >
                                {Icon && <Icon className="shrink-0" />}
                                {tech}
                              </span>
                              {tooltip && (
                                <span
                                  role="tooltip"
                                  className="pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 max-w-[15rem] rounded-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-blue-500/45 dark:border-blue-400/40 px-3 py-2 text-[10.5px] leading-snug text-black dark:text-gray-100 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.22)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] opacity-0 translate-y-1 group-hover/chip:opacity-100 group-hover/chip:translate-y-0 transition-[opacity,transform] duration-200"
                                >
                                  {tooltip}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  </TiltSpotlight>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HONORS & PUBLICATION — fanned card hand */}
      <section className="pt-12 pb-8 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12 dark:text-gray-300"
          >
            <div className="flex items-center gap-3 mb-3 max-w-md mx-auto">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-700/50 dark:to-purple-400/50" />
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-black dark:text-purple-300/85">
                Recognition
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-700/50 dark:to-purple-400/50" />
            </div>
            <h3
              className="text-3xl md:text-4xl font-bold italic tracking-tight bg-gradient-to-r from-slate-900 dark:from-violet-200 via-blue-800 dark:via-violet-100 to-slate-900 dark:to-purple-300 bg-clip-text text-transparent dark:text-gray-300"
              style={{
                fontFamily:
                  'var(--font-fraunces), "Fraunces", "Cormorant Garamond", Georgia, serif',
                fontVariationSettings: '"opsz" 144, "SOFT" 30',
                letterSpacing: "-0.02em",
              }}
            >
              Honors &amp; Publication.
            </h3>
            <p className="text-sm text-black mt-2 max-w-md mx-auto dark:text-gray-300">
              Three artifacts, fanned out like a hand of cards. Hover any card to lift and read it.
            </p>
          </motion.div>

          {/* Card hand — fanned, slight overlap, distinct rotations */}
          <div
            className="relative flex items-end justify-center pt-16 pb-10"
            style={{ perspective: "1200px" }}
          >
            {(() => {
              const cards = [
                {
                  title: "Dean's List",
                  subtitle: "Fall · ASU CS",
                  index: "F'23",
                  description:
                    "Top-tier GPA distinction for academic excellence in computer science coursework.",
                  href: "/Dean_List_for_Fall%20(1)%20(1).pdf",
                  Icon: Award,
                  rotate: -12,
                  dip: 20,
                  z: 1,
                },
                {
                  title: "IJERT Publication",
                  subtitle: "Peer-Reviewed · 2025",
                  index: "Pub",
                  description:
                    "Co-authored research paper published in the International Journal of Engineering Research and Technology.",
                  href: "/IJERTV14IS080131_Certi_A6.pdf",
                  Icon: BookMarked,
                  rotate: 0,
                  dip: 0,
                  z: 3,
                },
                {
                  title: "Dean's List",
                  subtitle: "Spring · ASU CS",
                  index: "S'24",
                  description:
                    "Earned a second consecutive semester on the Dean's List for sustained academic performance.",
                  href: "/Dean_List_for_Spring%20(1)%20(1).pdf",
                  Icon: Award,
                  rotate: 12,
                  dip: 20,
                  z: 1,
                },
              ];
              return cards.map((card, i) => (
                <motion.a
                  key={card.title + i}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 60, rotate: card.rotate }}
                  whileInView={{ opacity: 1, y: card.dip, rotate: card.rotate }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ rotate: 0, y: card.dip - 30, scale: 1.07, zIndex: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 110,
                    damping: 15,
                    delay: i * 0.12,
                  }}
                  className="group relative w-32 sm:w-48 md:w-52 aspect-[3/4] cursor-pointer -mx-3 sm:-mx-4"
                  style={{
                    transformOrigin: "bottom center",
                    zIndex: card.z,
                  }}
                  aria-label={`${card.title} ${card.subtitle} — opens PDF in a new tab`}
                  title={`${card.title} — ${card.subtitle}`}
                >
                  <div className="absolute inset-0 rounded-xl border border-blue-700/40 dark:border-purple-300/30 bg-gradient-to-br from-blue-200/85 dark:from-purple-200/85 via-blue-200/75 dark:via-violet-200/75 to-blue-200/85 dark:to-purple-200/85 dark:from-purple-950/85 dark:via-violet-950/75 dark:to-purple-950/85 backdrop-blur-md shadow-[0_25px_50px_-12px_rgba(15,23,42,0.20),_0_0_30px_-8px_rgba(168,85,247,0.20)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75),_0_0_30px_-8px_rgba(168,85,247,0.4)] group-hover:border-blue-800/65 dark:group-hover:border-purple-500/65 dark:group-hover:border-purple-200/55 group-hover:shadow-[0_35px_60px_-12px_rgba(15,23,42,0.25),_0_0_50px_-6px_rgba(168,85,247,0.30)] dark:group-hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.85),_0_0_50px_-6px_rgba(168,85,247,0.7)] transition-all duration-300 overflow-hidden">
                    {/* Inner ornamental border (playing card frame) */}
                    <div className="absolute inset-2 rounded-lg border border-blue-700/15 dark:border-purple-300/15 pointer-events-none" />
                    <div className="absolute inset-3 rounded-md border border-blue-700/[0.07] dark:border-purple-300/[0.07] pointer-events-none" />

                    {/* Top-left corner index */}
                    <div className="absolute top-2.5 left-3 flex flex-col items-center leading-none">
                      <card.Icon
                        strokeWidth={1.6}
                        className="text-black dark:text-purple-200/90 w-3.5 h-3.5"
                      />
                      <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-black dark:text-purple-300/65 mt-0.5">
                        {card.index}
                      </span>
                    </div>

                    {/* Bottom-right corner index (rotated 180 — like a real card) */}
                    <div className="absolute bottom-2.5 right-3 flex flex-col items-center leading-none rotate-180">
                      <card.Icon
                        strokeWidth={1.6}
                        className="text-black dark:text-purple-200/90 w-3.5 h-3.5"
                      />
                      <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-black dark:text-purple-300/65 mt-0.5">
                        {card.index}
                      </span>
                    </div>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center dark:text-gray-300">
                      <div className="mb-3 w-12 h-12 rounded-full bg-blue-800/20 dark:bg-purple-500/20 border border-blue-700/35 dark:border-purple-300/35 flex items-center justify-center shadow-[0_0_20px_-4px_rgba(168,85,247,0.5)]">
                        <card.Icon
                          strokeWidth={1.6}
                          className="text-black dark:text-purple-100 w-6 h-6"
                        />
                      </div>
                      <h4
                        className="text-base md:text-lg font-bold text-black dark:text-white leading-tight italic tracking-tight"
                        style={{
                          fontFamily:
                            'var(--font-fraunces), "Fraunces", Georgia, serif',
                        }}
                      >
                        {card.title}
                      </h4>
                      <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-black dark:text-purple-300/80 mt-1.5">
                        {card.subtitle}
                      </p>
                      <p
                        className="text-[11px] md:text-xs text-black mt-3 leading-snug px-1 dark:text-gray-300"
                        style={{
                          fontFamily:
                            'var(--font-fraunces), "Fraunces", Georgia, serif',
                        }}
                      >
                        {card.description}
                      </p>
                    </div>

                    {/* "Open PDF" CTA — appears on hover, sits above bottom corner */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-7 inline-flex items-center gap-1 font-mono text-[9px] text-black dark:text-purple-100 tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      Open PDF
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </motion.a>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="pt-16 pb-24 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center relative dark:text-gray-300"
          >
            {/* Wildcat mascot — peeking next to the title with a speech bubble */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotate: -25, scale: 0.6 }}
              whileInView={{ opacity: 1, x: 0, rotate: -10, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ rotate: 0, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 130, damping: 14, delay: 0.15 }}
              className="hidden md:block absolute right-2 lg:right-10 -top-2 z-10 cursor-pointer select-none"
              aria-label="Northwestern wildcat mascot waving hello"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <img
                  src="/wildcat.png"
                  alt="Wildcat"
                  draggable={false}
                  className="w-20 h-20 lg:w-24 lg:h-24 object-contain drop-shadow-[0_12px_28px_rgba(168,85,247,0.6)] pointer-events-none"
                />
                {/* Glow halo behind cat */}
                <div className="absolute inset-0 -z-10 rounded-full bg-blue-800/25 dark:bg-purple-500/25 blur-2xl" />
                {/* Speech bubble */}
                <motion.div
                  animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-blue-800/25 dark:bg-purple-500/25 backdrop-blur-md border border-blue-700/45 dark:border-purple-300/45 font-mono text-[9px] text-black dark:text-purple-50 whitespace-nowrap shadow-[0_4px_15px_rgba(168,85,247,0.45)]"
                >
                  Say hi!
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-1.5 h-1.5 rotate-45 bg-blue-800/25 dark:bg-purple-500/25 border-r border-b border-blue-700/45 dark:border-purple-300/45"
                  />
                </motion.div>
                {/* Tiny paw print trail */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.7, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-3 -right-2 font-mono text-[10px] text-black dark:text-purple-300/60"
                  aria-hidden="true"
                >
                  &#10042;
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 dark:from-purple-300 via-blue-800 to-slate-900 dark:to-purple-500 bg-clip-text text-transparent mb-6 dark:text-gray-300 inline-block"
              style={{ willChange: "clip-path, opacity" }}
            >
              Get In Touch
            </motion.h2>
            <p className="text-xl text-black dark:text-gray-300 max-w-2xl mx-auto">
              Let&apos;s work together to bring your ideas to life. I typically respond within 24 hours.
            </p>
          </motion.div>

          {/* Open to Roles — graduation + role-seeking callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative max-w-3xl mx-auto rounded-xl bg-gradient-to-br from-blue-800/15 dark:from-purple-500/15 via-blue-800/10 dark:via-violet-500/10 to-blue-800/15 dark:to-purple-500/15 border border-blue-700/30 dark:border-purple-300/30 px-5 py-5 backdrop-blur-sm"
          >
            <span className="absolute -top-2 left-5 px-2 py-0.5 rounded-full bg-blue-800/40 dark:bg-purple-500/40 border border-blue-700/50 dark:border-purple-300/50 font-mono text-[10px] text-black dark:text-purple-50 tracking-[0.3em] uppercase backdrop-blur-md">
              Open to Roles
            </span>
            <p className="text-black dark:text-purple-50 leading-relaxed text-[15px] md:text-base mt-1 text-center md:text-left">
              Graduating <span className="font-semibold text-black dark:text-white">August 2026</span> and actively
              interviewing for{" "}
              <span className="font-semibold text-black dark:text-white">data science internship</span> and{" "}
              <span className="font-semibold text-black dark:text-white">full-time roles</span>. Available to start
              immediately.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-black dark:text-emerald-200 tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Replying within 24h
              </span>
              <span className="text-black dark:text-purple-300/40">/</span>
              <a
                href="mailto:prathameshnehete2026@u.northwestern.edu"
                className="font-mono text-[10px] text-black dark:text-purple-200 tracking-widest uppercase hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <FaEnvelope className="text-[10px] dark:text-gray-300" />
                Reach out
              </a>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-3xl font-bold text-black dark:text-white mb-6">Let&apos;s Connect</h3>
                <p className="text-black dark:text-gray-300 leading-relaxed">
                  I&apos;m open to roles and collaborations in data science, analytics, and machine
                  learning. Reach out directly using the options below or the form.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FaEnvelope className="text-black dark:text-gray-300" />
                    </div>
                    <div>
                      <h4 className="text-black dark:text-white font-semibold">Email</h4>
                      <a
                        href="mailto:prathameshnehete2026@u.northwestern.edu"
                        className="text-black dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                      >
                        prathameshnehete2026@u.northwestern.edu
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Copy email"
                    onClick={() => copyToClipboard("prathameshnehete2026@u.northwestern.edu", "email")}
                    className="shrink-0 px-3 py-2 rounded-md bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/15 dark:hover:border-white/20 text-black dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {copied.email ? <FaCheck className="text-black dark:text-gray-300" /> : <FaCopy />}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-800/20 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FaLinkedin className="text-black dark:text-purple-300" />
                    </div>
                    <div>
                      <h4 className="text-black dark:text-white font-semibold">LinkedIn</h4>
                      <a
                        href="https://linkedin.com/in/nehete23"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                      >
                        linkedin.com/in/nehete23
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
                      <FaGithub className="text-black dark:text-gray-300" />
                    </div>
                    <div>
                      <h4 className="text-black dark:text-white font-semibold">GitHub</h4>
                      <a
                        href="https://github.com/pnehete23"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                      >
                        github.com/pnehete23
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900/[0.06] dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FaPhone className="text-black dark:text-gray-300" />
                    </div>
                    <div>
                      <h4 className="text-black dark:text-white font-semibold">Phone</h4>
                      <a
                        href="tel:+14808730791"
                        className="text-black dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                      >
                        (480) 873-0791
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Copy phone"
                    onClick={() => copyToClipboard("+14808730791", "phone")}
                    className="shrink-0 px-3 py-2 rounded-md bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/15 dark:hover:border-white/20 text-black dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {copied.phone ? <FaCheck className="text-black dark:text-gray-300" /> : <FaCopy />}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-800 dark:from-purple-600 via-blue-800 dark:via-violet-500 to-blue-900 dark:to-purple-700 text-black dark:text-white font-semibold rounded-lg hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaPaperPlane className="animate-pulse" /> Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Send Message
                    </>
                  )}
                </button>

                {status.type && (
                  <div
                    role="status"
                    className={`mt-2 rounded-md px-4 py-3 border ${
                      status.type === "success"
                        ? "border-emerald-600/45 dark:border-green-400/40 bg-emerald-500/10 dark:bg-green-500/10 text-black"
                        : "border-red-500/50 dark:border-red-400/40 bg-red-500/10 dark:bg-red-500/10 text-black"
                    } dark:text-gray-300`}
                  >
                    {status.message}
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
