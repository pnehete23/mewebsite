"use client";

// Wordmark logos for the tool chips.
//
// react-icons is already a dependency and its Si* set is per-icon tree-shaken,
// so importing the two dozen used here adds a few KB rather than a whole icon
// font. Only tools with a genuine, recognisable mark are mapped — anything
// else (Feature Engineering, Value-at-Risk) renders as a text-only chip rather
// than getting a made-up glyph.

import type { IconType } from "react-icons";
import {
  SiAmazonwebservices,
  SiApachekafka,
  SiDocker,
  SiDuckdb,
  SiFastapi,
  SiGit,
  SiGithubactions,
  SiJavascript,
  SiMlflow,
  SiNumpy,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiR,
  SiRailway,
  SiReact,
  SiRedis,
  SiScikitlearn,
  SiStreamlit,
  SiTableau,
  SiTypescript,
  SiVercel,
  SiVite,
} from "react-icons/si";

export const TOOL_LOGOS: Record<string, IconType> = {
  Python: SiPython,
  pandas: SiPandas,
  NumPy: SiNumpy,
  "scikit-learn": SiScikitlearn,
  MLflow: SiMlflow,
  Docker: SiDocker,
  Kafka: SiApachekafka,
  Redis: SiRedis,
  PostgreSQL: SiPostgresql,
  DuckDB: SiDuckdb,
  React: SiReact,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  Vite: SiVite,
  Streamlit: SiStreamlit,
  FastAPI: SiFastapi,
  Tableau: SiTableau,
  AWS: SiAmazonwebservices,
  Git: SiGit,
  "GitHub Actions": SiGithubactions,
  Vercel: SiVercel,
  Railway: SiRailway,
  R: SiR,
};
