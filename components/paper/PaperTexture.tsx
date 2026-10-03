'use client';

import React from 'react';

interface PaperTextureProps {
  opacity?: number;
  enabled?: boolean;
}

export const PaperTexture: React.FC<PaperTextureProps> = ({
  opacity = 0.38,
  enabled = true,
}) => {
  if (!enabled) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-[9999]"
      aria-hidden="true"
      style={{
        opacity,
        mixBlendMode: 'multiply',
      }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
          {/* 生成自然纸张木质微小纤维分布 */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          {/* 将高频噪点柔化为触感温润的宣纸/道林纸肌理 */}
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.88
              0 0 0 0 0.84
              0 0 0 0 0.78
              0 0 0 0.45 0"
            result="coloredNoise"
          />
          <feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" fill="#FAF7EE" />
      </svg>
    </div>
  );
};
