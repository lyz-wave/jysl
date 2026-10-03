'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { PaperButton } from '../paper/PaperButton';

interface RangerSummaryCardProps {
  summaryText: string;
  onResolved: () => void;
  onPause: () => void;
  onContinue: () => void;
}

export const RangerSummaryCard: React.FC<RangerSummaryCardProps> = ({
  summaryText,
  onResolved,
  onPause,
  onContinue,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative w-full max-w-2xl mx-auto drop-shadow-paper-edge"
    >
      <div className="relative w-full p-6 sm:p-7 rounded-3xl glass-card-paper paper-rough-edge text-left space-y-4">
        {/* 顶部镜面反光扫光 */}
        <div className="absolute top-0 inset-x-0 h-28 pointer-events-none bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-3xl" />

        {/* 顶部守林人营地徽章 */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/18 border border-amber-600/30 backdrop-blur-md flex items-center justify-center text-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
              🪵
            </div>
            <div>
              <h3 className="font-bold text-base text-[#28180E] flex items-center gap-1.5 drop-shadow-xs">
                <span>守林人的篝火手记</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              </h3>
              <span className="text-[11px] text-[#A3431F] font-semibold">
                整合大家的视角 · 提着马灯照亮你的前路
              </span>
            </div>
          </div>
        </div>

        {/* 5 段式结构化总结内容 (透光晶体玻璃子卡片) */}
        <div className="relative z-10 text-xs sm:text-sm text-[#3E2514] leading-relaxed whitespace-pre-wrap font-medium space-y-2 p-4 sm:p-5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]">
          {summaryText}
        </div>

        {/* 底部行动选项栏 */}
        <div className="relative z-10 pt-3 border-t border-white/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <PaperButton
              variant="outline"
              size="sm"
              onClick={onPause}
              className="!bg-white/40 hover:!bg-white/70 !border-white/70 !text-[#4A3220] backdrop-blur-md"
            >
              先烤烤火，待会聊
            </PaperButton>
            <PaperButton
              variant="secondary"
              size="sm"
              onClick={onContinue}
              className="!bg-white/50 hover:!bg-white/80 !border-white/80 !text-[#A3431F] backdrop-blur-md"
            >
              向守林人再追问几句...
            </PaperButton>
          </div>

          <button
            type="button"
            onClick={onResolved}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C84630] to-[#DF5C3A] hover:from-[#B03A26] hover:to-[#C84630] text-white border border-rose-300/60 shadow-[0_4px_16px_rgba(200,70,48,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>🌱 心结解开了（刻入古树年轮）</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
