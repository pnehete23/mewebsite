"use client";

// Client boundary for the golden stars. layout.tsx is a Server Component and
// cannot call next/dynamic with ssr:false, so the code-split happens here —
// three never enters the first-load bundle.

import dynamic from "next/dynamic";

const GoldenStars = dynamic(() => import("./GoldenStars"), { ssr: false });

export default function StarLayer() {
  return <GoldenStars />;
}
