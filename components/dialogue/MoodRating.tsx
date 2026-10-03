'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PaperButton } from '../paper/PaperButton';

interface MoodRatingProps {
  title?: string;
  subtitle?: string;
  onSelect: (score: number) => void;
  onSkip?: () => void;
}

export const MoodRating: React.FC<MoodRatingProps> = ({
  title = '此刻心里的沉重感 / 晴雨度如何？',
  subtitle = '1 分像狂风暴雨沉入谷底，10 分如雨过天晴明亮舒展（可随意选或跳过）',
  onSelect,
  onSkip,
}) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const getMoodLabel = (score: number) => {
    if (score <= 2) return '⛈️ 暴风骤雨 · 极度难受';
    if (score <= 4) return '🌧️ 阴雨绵绵 · 沉重紧绷';
    if (score <= 6) return '⛅ 阴晴交替 · 有些烦闷';
    if (score <= 8) return '🌤️ 微风拂面 · 逐渐回暖';
    return '☀️ 暖阳当空 · 舒展平静';
  };

  return (
    <div className="w-full max-w-md mx-auto drop-shadow-paper-edge-sm">
      <div className="relative p-6 sm:p-7 rounded-3xl glass-card-paper paper-rough-edge text-center space-y-5 select-none">
        {/* 顶部镜面反光扫光 */}
        <div className="absolute top-0 inset-x-0 h-24 pointer-events-none bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-3xl" />

        <div className="relative z-10">
          <h3 className="font-bold text-base sm:text-lg text-[#28180E] drop-shadow-xs">
            {title}
          </h3>
          <p className="text-xs text-[#6E472B] mt-1.5 leading-relaxed font-medium">
            {subtitle}
          </p>
        </div>

        {/* 1 ~ 10 透光晶体数字按键 */}
        <div className="relative z-10 grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
            const isSelected = selectedScore === score;
            return (
              <motion.button
                key={score}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedScore(score)}
                className={`h-11 rounded-2xl border text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center backdrop-blur-md ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#2B6624] to-[#3E8B34] text-white border-emerald-300/80 shadow-[0_4px_14px_rgba(43,102,36,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] scale-105'
                    : 'bg-white/45 hover:bg-white/75 text-[#3D2819] border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]'
                }`}
              >
                <span>{score}</span>
              </motion.button>
            );
          })}
        </div>

        {selectedScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-xs font-bold text-[#1B4E17] bg-emerald-500/20 py-2 px-3.5 rounded-full border border-emerald-600/35 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] inline-block"
          >
            {getMoodLabel(selectedScore)}
          </motion.div>
        )}

        <div className="relative z-10 pt-2 flex items-center justify-center gap-3">
          {onSkip && (
            <PaperButton
              variant="outline"
              size="sm"
              onClick={onSkip}
              className="!bg-white/40 hover:!bg-white/70 !border-white/70 !text-[#4A3220] backdrop-blur-md"
            >
              暂时跳过
            </PaperButton>
          )}
          <button
            type="button"
            disabled={selectedScore === null}
            onClick={() => selectedScore !== null && onSelect(selectedScore)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2B6624] to-[#3E8B34] hover:from-[#21511C] hover:to-[#317329] disabled:opacity-40 disabled:cursor-not-allowed text-white border border-emerald-300/60 shadow-[0_4px_16px_rgba(43,102,36,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
          >
            确认心情分 ›
          </button>
        </div>
      </div>
    </div>
  );
};
