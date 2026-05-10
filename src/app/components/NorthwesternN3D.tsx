"use client";

import { motion } from "framer-motion";

// Geometric bold "N" inspired by the Northwestern wordmark.
// All values are in a 100x100 viewBox so the letterform is a clean square.
//   stem_width  = 22  (vertical bars on left & right)
//   diag_width  = 12  (thickness of the connecting diagonal stroke)
//   margins     = 7 top/bottom, 7 left/right -> cap height 86, total width 86
const STEM = 22;
const DIAG = 12;
const M = 7;
const TOP = M;
const BOT = 100 - M;
const LEFT = M;
const RIGHT = 100 - M;

const LEFT_BAR = { x: LEFT, w: STEM };
const RIGHT_BAR = { x: RIGHT - STEM, w: STEM };

// Diagonal: top corners sit flush with top of the N, bottom corners sit flush
// with the bottom. Top runs from inside-edge of left bar; bottom ends at
// inside-edge of right bar.
const DIAG_TOP_LEFT_X = LEFT_BAR.x + LEFT_BAR.w;       // 29
const DIAG_TOP_RIGHT_X = DIAG_TOP_LEFT_X + DIAG;       // 41
const DIAG_BOT_RIGHT_X = RIGHT_BAR.x;                  // 71
const DIAG_BOT_LEFT_X = DIAG_BOT_RIGHT_X - DIAG;       // 59

// Number of extruded slices stacked along the Z axis. More = smoother edge,
// heavier DOM. 12 is a good balance.
const LAYERS = 12;
const LAYER_GAP = 1.4; // px in CSS-3D space

function NShape({ fill }: { fill: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full"
      shapeRendering="geometricPrecision"
    >
      <g fill={fill}>
        <rect
          x={LEFT_BAR.x}
          y={TOP}
          width={LEFT_BAR.w}
          height={BOT - TOP}
        />
        <rect
          x={RIGHT_BAR.x}
          y={TOP}
          width={RIGHT_BAR.w}
          height={BOT - TOP}
        />
        <polygon
          points={`${DIAG_TOP_LEFT_X},${TOP} ${DIAG_TOP_RIGHT_X},${TOP} ${DIAG_BOT_RIGHT_X},${BOT} ${DIAG_BOT_LEFT_X},${BOT}`}
        />
      </g>
    </svg>
  );
}

export default function NorthwesternN3D() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ perspective: "900px" }}
    >
      <motion.div
        className="relative"
        style={{
          width: "72%",
          height: "72%",
          transformStyle: "preserve-3d",
        }}
        initial={{ rotateY: -22, rotateX: 6 }}
        animate={{ rotateY: [-22, 22, -22], rotateX: [6, -4, 6] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {Array.from({ length: LAYERS }, (_, i) => {
          // 0 = deepest (back), LAYERS-1 = closest (front)
          const t = i / (LAYERS - 1);
          const z = (i - (LAYERS - 1) / 2) * LAYER_GAP;

          // Color ramp: deep indigo at back -> Northwestern purple -> bright
          // violet highlight at front. Tuned so the side-walls of the
          // extrusion read as slightly darker than the front face.
          const r = Math.round(46 + t * 78);   // 46  -> 124
          const g = Math.round(22 + t * 60);   // 22  -> 82
          const b = Math.round(82 + t * 80);   // 82  -> 162
          const fill = `rgb(${r}, ${g}, ${b})`;

          const isFront = i === LAYERS - 1;

          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                transform: `translateZ(${z.toFixed(2)}px)`,
                filter: isFront
                  ? "drop-shadow(0 0 12px rgba(168, 85, 247, 0.55))"
                  : undefined,
              }}
            >
              <NShape fill={fill} />
            </div>
          );
        })}

        {/* Front-face specular sheen — a soft white highlight that sits just
            in front of the top extrusion layer so it catches as the N tilts. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translateZ(${(((LAYERS - 1) / 2) * LAYER_GAP + 0.3).toFixed(2)}px)`,
            mixBlendMode: "screen",
            opacity: 0.5,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            shapeRendering="geometricPrecision"
          >
            <defs>
              <linearGradient id="nSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <mask id="nMask">
                <g fill="#fff">
                  <rect
                    x={LEFT_BAR.x}
                    y={TOP}
                    width={LEFT_BAR.w}
                    height={BOT - TOP}
                  />
                  <rect
                    x={RIGHT_BAR.x}
                    y={TOP}
                    width={RIGHT_BAR.w}
                    height={BOT - TOP}
                  />
                  <polygon
                    points={`${DIAG_TOP_LEFT_X},${TOP} ${DIAG_TOP_RIGHT_X},${TOP} ${DIAG_BOT_RIGHT_X},${BOT} ${DIAG_BOT_LEFT_X},${BOT}`}
                  />
                </g>
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100"
              height="100"
              fill="url(#nSheen)"
              mask="url(#nMask)"
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
