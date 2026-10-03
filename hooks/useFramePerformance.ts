'use client';

import { useState, useEffect, useRef } from 'react';

export function useFramePerformance() {
  const [fps, setFps] = useState(60);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let frameId: number;

    const measure = (now: number) => {
      frameCountRef.current++;
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        if (currentFps < 38) {
          setIsLowPerformance(true);
        }
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      frameId = requestAnimationFrame(measure);
    };

    frameId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return { fps, isLowPerformance };
}
