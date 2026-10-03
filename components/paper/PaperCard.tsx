'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaperCardProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  tag?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'pop-up' | 'flat';
}

export const PaperCard: React.FC<PaperCardProps> = ({
  isOpen = true,
  onClose,
  title,
  subtitle,
  tag,
  children,
  className = '',
  variant = 'pop-up',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={
            variant === 'pop-up'
              ? { opacity: 0, rotateX: 75, y: 40, scale: 0.92 }
              : { opacity: 0, y: 15 }
          }
          animate={{
            opacity: 1,
            rotateX: 0,
            y: 0,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 280,
              damping: 22,
              mass: 0.8,
            },
          }}
          exit={
            variant === 'pop-up'
              ? { opacity: 0, rotateX: 60, y: 30, scale: 0.95 }
              : { opacity: 0, y: -10 }
          }
          style={{ transformOrigin: 'bottom center', perspective: 1200 }}
          className={`relative ${variant === 'pop-up' ? 'drop-shadow-paper-edge' : 'drop-shadow-paper-edge-sm'}`}
        >
          <div
            className={`relative glass-card-paper text-[#3D2819] rounded-3xl p-6 sm:p-7 paper-rough-edge ${className}`}
          >
            {/* 顶部镜面反光光扫 */}
            <div className="absolute top-0 inset-x-0 h-28 pointer-events-none bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-3xl" />

            {/* 纸张边缘内透光切线（立体工艺质感） */}
            <div className="absolute inset-2 border border-dashed border-white/60 rounded-2xl pointer-events-none" />

            {/* 顶部标题区 */}
            {(title || tag) && (
              <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  {title && (
                    <h3 className="text-xl font-bold text-[#2A1B10] tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                      {title}
                    </h3>
                  )}
                  {tag && (
                    <span className="px-2.5 py-0.5 text-xs rounded-full bg-emerald-500/18 text-emerald-950 font-bold border border-emerald-600/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
                      {tag}
                    </span>
                  )}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white/40 hover:bg-white/75 border border-white/70 text-[#6E472B] hover:text-[#28180E] text-xs transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {subtitle && (
              <p className="relative z-10 text-sm text-[#6E472B] mb-4 leading-relaxed font-medium">
                {subtitle}
              </p>
            )}

            {/* 正文内容 */}
            <div className="relative z-10">{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
