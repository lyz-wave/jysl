'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PaperButton } from '../paper/PaperButton';
import { useForestStore } from '@/lib/store';
import { Wind } from 'lucide-react';

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_CONFIG: Record<
  BreathPhase,
  { label: string; tip: string; color: string; next: BreathPhase }
> = {
  inhale: { label: '吸气', tip: '小腹微微隆起，感受清凉空气充盈肺叶', color: '#4A7C39', next: 'hold1' },
  hold1: { label: '屏息', tip: '平稳闭气，感受身体充满氧气与生机', color: '#D4AF37', next: 'exhale' },
  exhale: { label: '呼气', tip: '缓慢吐出所有浊气，双肩自然下沉放松', color: '#3E6B7A', next: 'hold2' },
  hold2: { label: '安顿', tip: '在空灵与宁静中稍作停留，回到当下', color: '#7A583E', next: 'inhale' },
};

export const TurtleBreathing: React.FC = () => {
  const { addGameContext, closeGame } = useForestStore();
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(3);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // 切换到下一个阶段
          const nextPhase = PHASE_CONFIG[phase].next;
          if (phase === 'hold2') {
            if (currentRound >= totalRounds) {
              setIsCompleted(true);
              addGameContext(`与慢慢完成了 ${totalRounds} 轮 4-4-4-4 盒式龟壳呼吸，舒缓了交感神经，回归身体平静`);
              return 4;
            }
            setCurrentRound((r) => r + 1);
          }
          setPhase(nextPhase);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentRound, totalRounds, isCompleted, addGameContext]);

  const currentCfg = PHASE_CONFIG[phase];

  return (
    <div className="space-y-5 select-none text-xs text-center">
      {!isCompleted ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[11px] text-[#7A583E]">
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-[#38662F]" />
              慢慢的 4-4-4-4 盒式呼吸法
            </span>
            <span>
              第 {currentRound} / {totalRounds} 轮
            </span>
          </div>

          {/* 呼吸龟壳等高线膨胀环 */}
          <div className="relative h-60 rounded-3xl bg-[#EAF0E8] border border-[#CCDBC8] flex items-center justify-center overflow-hidden">
            {/* 3 层外扩等高线同心圆纸雕 */}
            <motion.div
              animate={{
                scale: phase === 'inhale' || phase === 'hold1' ? [1, 1.45] : [1.45, 1],
                opacity: phase === 'inhale' || phase === 'hold1' ? [0.4, 0.85] : [0.85, 0.4],
              }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className="absolute w-44 h-44 rounded-full border-4 border-dashed border-[#608D6B]/40"
            />

            <motion.div
              animate={{
                scale: phase === 'inhale' || phase === 'hold1' ? [1, 1.3] : [1.3, 1],
              }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className="absolute w-36 h-36 rounded-full bg-[#4A7C39]/15 border-2 border-[#4A7C39]/30"
            />

            {/* 中心核心呼吸球 */}
            <motion.div
              animate={{
                scale: phase === 'inhale' || phase === 'hold1' ? [1, 1.2] : [1.2, 1],
              }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className="relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-lg font-bold"
              style={{ background: currentCfg.color }}
            >
              <span className="text-base font-extrabold">{currentCfg.label}</span>
              <span className="text-2xl mt-0.5">{secondsLeft}</span>
            </motion.div>
          </div>

          <p className="text-xs text-[#5C4033] font-medium leading-relaxed">
            {currentCfg.tip}
          </p>
        </div>
      ) : (
        /* 完成后的通达心境 */
        <div className="space-y-4 py-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E5EFE3] border border-[#38662F]/30 flex items-center justify-center text-2xl shadow-xs">
            🐢
          </div>

          <p className="text-sm font-bold text-[#3B2D25]">
            慢慢微笑道：「心跳安顿下来了，呼吸是带我们回到当下的锚。」
          </p>

          <p className="text-xs text-[#7A583E] leading-relaxed max-w-sm mx-auto">
            把时间轴拉长到五年、十年，眼前的慌张只是大河里的一朵浪花。
            只要能呼吸，任何时刻我们都可以重新从从容容地启程。
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <PaperButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsCompleted(false);
                setCurrentRound(1);
                setPhase('inhale');
                setSecondsLeft(4);
              }}
            >
              再深呼吸 3 轮
            </PaperButton>

            <PaperButton variant="primary" size="md" onClick={closeGame}>
              带着舒展身心回森林 ›
            </PaperButton>
          </div>
        </div>
      )}
    </div>
  );
};
