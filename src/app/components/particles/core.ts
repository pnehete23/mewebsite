// Shared particle core — one shader and one set of formations, used by both
// the skills field and the load-in intro so the two read as the same system.
//
// The vertex shader owns everything that moves: the formation morph (with
// per-particle stagger and a mid-flight outward arc), idle drift, pointer
// repulsion, and the intro's dissipation blast. The CPU only writes attributes
// when a morph starts.

export type Formation =
  | "sphere"
  | "torus"
  | "lattice"
  | "helix"
  | "wave"
  | "spiral"
  | "cone"
  | "knot"
  | "cloud";

/** Morph duration in seconds. */
export const MORPH_S = 1.35;
/** Share of the morph timeline given away to per-particle stagger. */
export const STAGGER = 0.45;

/** Mirrors the shader's easing so an interrupted morph can be baked exactly. */
export function easeFor(delay: number, progress: number) {
  const span = 1 - delay * STAGGER;
  const p = Math.min(1, Math.max(0, (progress - delay * STAGGER) / span));
  return p * p * (3 - 2 * p);
}

// ── Formations ───────────────────────────────────────────────────────────────
// Each fills `out` with `count` xyz triples inside roughly a unit-2 sphere, so
// every shape occupies a similar volume and morphs read as a re-arrangement
// rather than a scale change.
export function build(kind: Formation, count: number, out: Float32Array) {
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const t = i / count;
    let x = 0;
    let y = 0;
    let z = 0;

    switch (kind) {
      case "sphere": {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
        const theta = GOLDEN * i;
        const r = 1.75;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case "torus": {
        const u = t * Math.PI * 2 * 7;
        const v = GOLDEN * i;
        const R = 1.5;
        const r = 0.5;
        x = (R + r * Math.cos(v)) * Math.cos(u);
        y = (R + r * Math.cos(v)) * Math.sin(u);
        z = r * Math.sin(v);
        break;
      }
      case "lattice": {
        const n = Math.ceil(Math.cbrt(count));
        const ix = i % n;
        const iy = Math.floor(i / n) % n;
        const iz = Math.floor(i / (n * n)) % n;
        const s = 2.6 / (n - 1 || 1);
        x = ix * s - 1.3;
        y = iy * s - 1.3;
        z = iz * s - 1.3;
        break;
      }
      case "helix": {
        const strand = i % 2 === 0 ? 0 : Math.PI;
        const u = t * Math.PI * 2 * 4;
        x = Math.cos(u + strand) * 1.05;
        y = t * 3.4 - 1.7;
        z = Math.sin(u + strand) * 1.05;
        break;
      }
      case "wave": {
        const n = Math.ceil(Math.sqrt(count));
        const ix = i % n;
        const iy = Math.floor(i / n);
        const u = (ix / (n - 1 || 1)) * 2 - 1;
        const v = (iy / (n - 1 || 1)) * 2 - 1;
        x = u * 1.9;
        z = v * 1.9;
        y = Math.sin(u * 3.2) * Math.cos(v * 3.2) * 0.72;
        break;
      }
      case "spiral": {
        const arm = (i % 4) * ((Math.PI * 2) / 4);
        const d = Math.pow(t, 0.62);
        const u = d * Math.PI * 2.4 + arm;
        const jitter = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        x = Math.cos(u) * d * 2.05 + jitter * 0.18;
        z = Math.sin(u) * d * 2.05 - jitter * 0.18;
        y = (jitter - 0.5) * 0.5 * (1 - d);
        break;
      }
      case "knot": {
        // Trefoil torus knot (p=2, q=3), swept into a tube. It self-
        // intersects as it turns, which reads as "interlocking systems" and is
        // unmistakable next to the helix and the lattice.
        const u = t * Math.PI * 2;
        const cx = Math.sin(u) + 2 * Math.sin(2 * u);
        const cy = Math.cos(u) - 2 * Math.cos(2 * u);
        const cz = -Math.sin(3 * u);
        // Give the curve thickness so it reads as a rope, not a wire.
        const v = GOLDEN * i;
        const tube = 0.26;
        x = cx * 0.6 + Math.cos(v) * tube;
        y = cy * 0.6 + Math.sin(v) * tube;
        z = cz * 0.6 + Math.cos(v * 1.7) * tube * 0.7;
        break;
      }
      case "cone": {
        const u = GOLDEN * i;
        const d = Math.sqrt(t);
        x = Math.cos(u) * d * 1.6;
        z = Math.sin(u) * d * 1.6;
        y = 1.7 - d * 3.2;
        break;
      }
      default: {
        // Nebula — deterministic hash so SSR and client agree.
        const h = (n: number) => {
          const s = Math.sin(i * n) * 43758.5453;
          return (s - Math.floor(s)) * 2 - 1;
        };
        const r = 1.85 * Math.pow(Math.abs(h(1.7)), 0.45);
        const phi = Math.acos(h(3.1));
        const theta = h(5.3) * Math.PI;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta) * 0.8;
        z = r * Math.cos(phi);
      }
    }

    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** Per-particle stagger + size jitter, shared by every field. */
export function seeds(count: number) {
  const delays = new Float32Array(count);
  const scales = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const s = Math.sin(i * 78.233) * 43758.5453;
    const r = s - Math.floor(s);
    delays[i] = r;
    scales[i] = 0.35 + Math.pow(r, 3) * 1.5;
  }
  return { delays, scales };
}

export const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uDpr;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uDissipate;
  uniform vec3  uPointer;

  attribute vec3  aTarget;
  attribute float aDelay;
  attribute float aScale;

  uniform float uHiBucket;
  uniform float uHiMix;
  uniform float uBuckets;

  varying float vAlpha;
  varying float vPush;
  varying float vHi;

  void main() {
    // Sub-skill highlight: each particle belongs to a deterministic bucket, so
    // selecting a chip lights the same slice of the shape every time. vHi eases
    // in via uHiMix rather than snapping.
    float bucket = floor(aDelay * uBuckets);
    vHi = (uHiBucket >= 0.0 && abs(bucket - uHiBucket) < 0.5) ? uHiMix : 0.0;

    // Per-particle stagger: later particles start later, all land together.
    float span = 1.0 - aDelay * ${STAGGER.toFixed(2)};
    float p = clamp((uProgress - aDelay * ${STAGGER.toFixed(2)}) / span, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);

    vec3 pos = mix(position, aTarget, p);

    // Swing outward at the midpoint so the swarm arcs between formations.
    float bulge = sin(p * 3.14159265);
    pos += normalize(pos + 0.0001) * bulge * 0.5 * aScale;

    // Cheap pseudo-curl drift — keeps the field alive while it sits still.
    float t = uTime * 0.28;
    pos += vec3(
      sin(pos.y * 0.8 + t),
      cos(pos.z * 0.7 + t * 0.9),
      sin(pos.x * 0.6 + t * 1.1)
    ) * 0.055;

    // Pointer repulsion — the swarm parts around the cursor.
    vec2 diff = pos.xy - uPointer.xy;
    float d = length(diff);
    float f = 1.0 - smoothstep(0.0, uRadius, d);
    pos.xy += normalize(diff + 0.0001) * f * uStrength;
    vPush = f;

    // Dissipation: the intro's hand-off. Particles are thrown outward along
    // their own bearing, staggered so the field tears apart rather than
    // expanding as one rigid shell, with a swirl so it reads as motion.
    float dsp = uDissipate;
    if (dsp > 0.0) {
      float ds = clamp((dsp - aDelay * 0.3) / 0.7, 0.0, 1.0);
      ds = ds * ds;
      vec3 dir = normalize(pos + 0.0001);
      float swirl = ds * 1.6 * (0.5 + aScale);
      pos += dir * ds * 7.0 * (0.6 + aScale * 0.5);
      pos.xz += vec2(-dir.z, dir.x) * swirl;
    }

    // Highlighted particles lift toward the viewer and swell slightly, so the
    // selected slice separates from the shape instead of only recolouring.
    pos += normalize(pos + 0.0001) * vHi * 0.28;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * aScale * uDpr * (1.0 + vHi * 0.9) * (1.0 / max(-mv.z, 0.001));
    gl_Position = projectionMatrix * mv;

    vAlpha = (0.30 + 0.55 * aScale + bulge * 0.25) * (1.0 - smoothstep(0.15, 0.95, dsp));
  }
`;

export const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform vec3 uHiColor;
  uniform float uAlpha;
  uniform float uLight;
  varying float vAlpha;
  varying float vPush;
  varying float vHi;

  void main() {
    // Soft radial sprite — no texture needed.
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.0, d);
    // On cream, additive blending is unavailable and a wide soft halo turns to
    // haze, so light mode tightens the falloff into a crisper, denser core.
    a = pow(a, mix(2.0, 3.4, uLight));
    vec3 c = mix(uColor, uHot, clamp(vPush * 1.4, 0.0, 1.0));
    // Selected sub-skill: its slice of the shape takes the contrast colour.
    c = mix(c, uHiColor, vHi);
    // Light mode composites normally, so alpha has to carry the density that
    // additive build-up gives us for free on dark.
    float alpha = a * vAlpha * uAlpha * mix(1.0, 1.35, uLight);
    gl_FragColor = vec4(c, clamp(alpha, 0.0, 1.0) * (1.0 + vHi * 0.4));
    #include <colorspace_fragment>
  }
`;

/** Per-theme render settings for any field using the shared shader. */
export function themeTuning(light: boolean) {
  return {
    // Additive is what makes the dark field glow; on cream it only washes out,
    // so light mode composites normally with denser, more saturated ink.
    additive: !light,
    alpha: light ? 1 : 1,
    // Slightly larger points on light: without additive build-up, thin points
    // read as grey dust on cream.
    size: light ? 30 : 26,
    hot: light ? "#2a0f4f" : "#ffffff",
  };
}

// ── Track palettes ───────────────────────────────────────────────────────────
// Hand-authored per theme rather than derived from one hue by flipping
// lightness. Inverting the dark palette is exactly what made light mode look
// dull: the dark colours are tuned to GLOW additively against black, and the
// same hues composited normally on cream go muddy. These light values are
// deeper, more chromatic inks chosen to sit on #faf5ea.
export const TRACK_COLORS: Record<string, { dark: string; light: string; hot: string }> = {
  ds: { dark: "hsl(266, 82%, 62%)", light: "#7b1fd1", hot: "#e0119a" },
  swe: { dark: "hsl(224, 82%, 62%)", light: "#1442c9", hot: "#00a6c4" },
  analyst: { dark: "hsl(38, 82%, 62%)", light: "#b8480a", hot: "#d4008a" },
};

export function trackColor(key: string, light: boolean) {
  const c = TRACK_COLORS[key] ?? TRACK_COLORS.ds;
  return light ? c.light : c.dark;
}

/** High-contrast colour used when a sub-skill is selected. */
export function trackHot(key: string) {
  return (TRACK_COLORS[key] ?? TRACK_COLORS.ds).hot;
}
