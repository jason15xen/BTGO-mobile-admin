"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Ecosystem } from "@/lib/types";

const FACE_COLOR: Record<Ecosystem, string> = {
  terrestrial: "rgba(43, 135, 31, 0.34)",
  freshwater: "rgba(20, 184, 166, 0.34)",
  marine: "rgba(101, 163, 13, 0.34)",
};

export default function PyramidTetrahedron({ ecosystem }: { ecosystem: Ecosystem }) {
  const [landscape, setLandscape] = useState(false);

  useEffect(() => {
    const sync = () => setLandscape(window.innerWidth > window.innerHeight);
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 55%, ${FACE_COLOR[ecosystem]} 0%, transparent 72%)`,
        }}
      />
      {/* 3D tetrahedron only on larger screens — too busy on mobile */}
      <div className="pyramid-scene absolute inset-0 hidden sm:flex">
        <div
          className={`pyramid-tetra ${landscape ? "pyramid-tetra--landscape" : "pyramid-tetra--portrait"}`}
          style={{ "--pyramid-face": FACE_COLOR[ecosystem] } as CSSProperties}
        >
          <div className="pyramid-tetra-face" />
          <div className="pyramid-tetra-face" />
          <div className="pyramid-tetra-face" />
          <div className="pyramid-tetra-face" />
        </div>
      </div>
    </div>
  );
}
