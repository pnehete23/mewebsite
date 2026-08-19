"use client";

// Client boundary + code-split for the shared WebGL scene. layout.tsx is a
// Server Component and cannot call next/dynamic with ssr:false, so three is
// kept out of the first-load bundle here.

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneLayer() {
  return <Scene />;
}
