'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const BonfireCamp: React.FC<{ isNight?: boolean }> = ({ isNight = true }) => {
  if (!isNight) return null;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center pointer-events-none select-none">
      {/* 地面温暖光晕 */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.65, 0.9, 0.65],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-36 h-20 rounded-full bg-[#F39C12]/35 blur-md -bottom-2"
      />

      {/* 底部交叉纸柴木 */}
      <svg viewBox="0 0 100 60" className="absolute bottom-2 w-20 h-12 overflow-visible">
        {/* 左柴 */}
        <line x1="15" y1="50" x2="85" y2="25" stroke="#4A301E" strokeWidth="9" strokeLinecap="round" />
        <line x1="15" y1="50" x2="85" y2="25" stroke="#7A543A" strokeWidth="6" strokeLinecap="round" />
        {/* 右柴 */}
        <line x1="85" y1="50" x2="15" y2="25" stroke="#4A301E" strokeWidth="9" strokeLinecap="round" />
        <line x1="85" y1="50" x2="15" y2="25" stroke="#7A543A" strokeWidth="6" strokeLinecap="round" />
      </svg>

      {/* 多层跳动剪纸火焰 */}
      {/* 1. 外层深朱红火舌 */}
      <motion.div
        animate={{
          scaleY: [1, 1.15, 0.95, 1.1, 1],
          scaleX: [1, 0.92, 1.05, 0.95, 1],
          rotate: [-3, 4, -2, 3, -3],
        }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 w-14 h-20"
        style={{
          background: 'linear-gradient(180deg, #D43827 0%, #E67E22 100%)',
          clipPath:
            'polygon(50% 0%, 75% 35%, 100% 70%, 80% 100%, 20% 100%, 0% 70%, 25% 35%)',
        }}
      />

      {/* 2. 中层金黄火舌 */}
      <motion.div
        animate={{
          scaleY: [1.1, 0.9, 1.15, 1],
          scaleX: [0.95, 1.08, 0.92, 1],
          rotate: [3, -4, 2, -2, 3],
        }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 w-10 h-14"
        style={{
          background: 'linear-gradient(180deg, #F1C40F 0%, #E67E22 100%)',
          clipPath:
            'polygon(50% 0%, 75% 35%, 100% 70%, 80% 100%, 20% 100%, 0% 70%, 25% 35%)',
        }}
      />

      {/* 3. 内层白亮火芯 */}
      <motion.div
        animate={{ scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 w-5 h-8 bg-[#FFF8DB] rounded-full blur-[1px]"
      />
    </div>
  );
};
