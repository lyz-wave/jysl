'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PuppetRenderer } from '../animals/PuppetRenderer';
import { PaperButton } from '../paper/PaperButton';
import { useForestStore } from '@/lib/store';
import { Heart } from 'lucide-react';

const BEAR_QUOTES = [
  '如果此刻换成你最亲近的朋友在痛苦，你绝不会用那么严苛的字眼指责TA。转过身来，也像对待挚友一样抱抱自己吧。',
  '允许自己今天就只是这样。你不需要时刻都紧绷着证明自己，累了就靠在我肩头，这里的微风很暖。',
  '辛苦了。世界很大，但此刻只有我们。深吸一口气，把压在胸口的石头放一放，你值得被温柔以待。',
  '别忘了，你也是第一次经历这一生。有走不通的路太正常了，慢慢走，我会一直在这里等你。',
];

export const BearHug: React.FC = () => {
  const { addGameContext, closeGame } = useForestStore();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 ~ 100
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHolding && !isCompleted) {
      // 60bpm 心跳震动反馈
      const heartbeatInterval = setInterval(() => {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([40, 80, 40]);
        }
      }, 1000);

      // 充能进度增长
      timerRef.current = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timerRef.current!);
            clearInterval(heartbeatInterval);
            setIsCompleted(true);
            const quote = BEAR_QUOTES[quoteIndex];
            addGameContext(`在团团怀里沉浸了60bpm心跳熊抱，获得了自我关怀安抚：『${quote}』`);
            return 100;
          }
          return prev + 2.5;
        });
      }, 80);

      return () => {
        clearInterval(timerRef.current!);
        clearInterval(heartbeatInterval);
      };
    }
  }, [isHolding, isCompleted, quoteIndex, addGameContext]);

  const handleStartHold = () => {
    if (isCompleted) return;
    setIsHolding(true);
  };

  const handleEndHold = () => {
    setIsHolding(false);
    if (!isCompleted && holdProgress > 30) {
      // 达到一定时长提前松手也可视为完成
      setIsCompleted(true);
      const quote = BEAR_QUOTES[quoteIndex];
      addGameContext(`在团团怀里沉浸了温情熊抱，获得了自我关怀安抚：『${quote}』`);
    }
  };

  return (
    <div className="space-y-5 select-none text-xs text-center">
      {!isCompleted ? (
        <div className="space-y-4">
          <p className="text-xs text-[#7A583E]">
            长按屏幕中央的团团，感受双臂合拢的温暖与 60bpm 安定心跳
          </p>

          {/* 熊抱按压主触控区 */}
          <div
            onMouseDown={handleStartHold}
            onMouseUp={handleEndHold}
            onTouchStart={handleStartHold}
            onTouchEnd={handleEndHold}
            className={`relative h-64 rounded-3xl overflow-hidden cursor-pointer transition-all flex flex-col items-center justify-center ${
              isHolding ? 'scale-[1.02]' : ''
            }`}
            style={{
              background: isHolding
                ? `radial-gradient(circle, rgba(246, 189, 96, ${0.4 + holdProgress * 0.005}) 0%, #FAF7EE 75%)`
                : '#FAF7EE',
              border: isHolding ? '2px solid #E69C24' : '2px dashed #D9CDB8',
            }}
          >
            {/* 60bpm 心跳波纹 */}
            {isHolding && (
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.6, 0.1, 0.6],
                }}
                transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-44 h-44 rounded-full bg-[#F39C12]/20 pointer-events-none"
              />
            )}

            {/* 团团纸偶 */}
            <div className="relative z-10 scale-95 pointer-events-none">
              <PuppetRenderer
                animalId="bear"
                mood={isHolding ? 'hug' : 'idle'}
                interactive={false}
              />
            </div>

            {/* 底部按压充能进度指示条 */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="h-2 rounded-full bg-stone-200/80 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-75 rounded-full"
                  style={{ width: `${holdProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-[#8C6648] mt-1.5 block">
                {isHolding ? '正在深拥中，感受暖意...' : '按住不放，把整个人靠过来'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* 抱抱完成文案 */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 py-3"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF0E8] border border-[#E6A57E] flex items-center justify-center text-2xl shadow-xs">
            🫂
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-[#E8DEC8] space-y-2 shadow-sm text-left">
            <span className="text-[10px] font-bold text-[#C84630] flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-[#C84630]" /> 团团趴在你耳边轻声说：
            </span>
            <p className="text-xs sm:text-sm text-[#4D3524] leading-relaxed italic font-medium">
              "{BEAR_QUOTES[quoteIndex]}"
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <PaperButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsCompleted(false);
                setHoldProgress(0);
                setQuoteIndex((prev) => (prev + 1) % BEAR_QUOTES.length);
              }}
            >
              还想再抱一会儿
            </PaperButton>

            <PaperButton variant="primary" size="md" onClick={closeGame}>
              带着温暖回森林 ›
            </PaperButton>
          </div>
        </motion.div>
      )}
    </div>
  );
};
