'use client';

import React from 'react';

interface ParallaxLayerProps {
  id: string;
  zDepth: number;
  scale?: number;
  mouseXRatio?: number; // -0.5 to 0.5
  mouseYRatio?: number; // -0.5 to 0.5
  parallaxStrength?: number;
  children: React.ReactNode;
  className?: string;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  id,
  zDepth,
  scale = 1.0,
  mouseXRatio = 0,
  mouseYRatio = 0,
  parallaxStrength = 1.0,
  children,
  className = '',
}) => {
  // 根据 Z 轴深度计算横向与纵向视差平移偏移量
  // 越靠近镜头（zDepth 越大），位移越大；远景（zDepth 负值）位移小
  const depthFactor = (zDepth + 400) / 400; // 0.2 ~ 1.5
  const offsetX = mouseXRatio * 45 * depthFactor * parallaxStrength;
  const offsetY = mouseYRatio * 25 * depthFactor * parallaxStrength;

  return (
    <div
      id={`paper-layer-${id}`}
      className={`absolute inset-0 w-full h-full pointer-events-none preserve-3d will-change-transform ${className}`}
      style={{
        transform: `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(
          2
        )}px, ${zDepth}px) scale(${scale})`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
};
