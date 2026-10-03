'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PuppetRenderer } from '../animals/PuppetRenderer';
import { PaperButton } from '../paper/PaperButton';
import { useForestStore } from '@/lib/store';

const EMOTION_TAGS = [
  '焦虑',
  '委屈',
  '疲惫',
  '愤怒',
  '失落',
  '羞愧',
  '孤独',
  '害怕',
  '不甘',
  '迷茫',
  '自责',
  '紧绷',
];

export const PeckerTapHole: React.FC = () => {
  const { addGameContext, closeGame } = useForestStore();
  const [tapCount, setTapCount] = useState(0);
  const [isPecking, setIsPecking] = useState(false);
  const [chips, setChips] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [phase, setPhase] = useState<'tapping' | 'selecting' | 'finished'>('tapping');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [screenShake, setScreenShake] = useState(false);

  const handleTap = () => {
    setTapCount((prev) => prev + 1);
    setIsPecking(true);
    setScreenShake(true);

    // 手机震动反馈
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }

    // 生成飞溅纸屑粒子
    const newChip = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 60,
    };
    setChips((prev) => [...prev.slice(-12), newChip]);

    setTimeout(() => setIsPecking(false), 200);
    setTimeout(() => setScreenShake(false), 120);
  };

  const handleFinishTapping = () => {
    setPhase('selecting');
  };

  const toggleEmotion = (tag: string) => {
    if (selectedEmotions.includes(tag)) {
      setSelectedEmotions(selectedEmotions.filter((t) => t !== tag));
    } else {
      if (selectedEmotions.length < 3) {
        setSelectedEmotions([...selectedEmotions, tag]);
      }
    }
  };

  const handleConfirmEmotions = () => {
    if (selectedEmotions.length === 0) return;
    const summary = `在敲树洞中觉察并标注了当下情绪：【${selectedEmotions.join('、')}】（连击敲击释放了 ${tapCount} 次）`;
    addGameContext(summary);
    setPhase('finished');
  };

  return (
    <div className="space-y-5 select-none">
      {phase === 'tapping' && (
        <div className="text-center space-y-4">
          <p className="text-xs text-[#7A583E]">
            对着树干快速点击，把心头堆积的沉重都敲出来！
          </p>

          {/* 敲击主舞台 */}
          <div
            onClick={handleTap}
            className={`relative h-56 rounded-2xl bg-[#EBE3D5] border-2 border-[#D9CDB8] flex items-center justify-center overflow-hidden cursor-pointer active:scale-[0.99] transition-transform ${
              screenShake ? 'translate-y-0.5' : ''
            }`}
          >
            {/* 树干背景纸片 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
              <div className="w-28 h-full bg-[#5C4033] border-x-4 border-[#3D2819]" />
            </div>

            {/* 笃笃纸偶 */}
            <div className="relative z-10 scale-90 pointer-events-none">
              <PuppetRenderer
                animalId="woodpecker"
                mood={isPecking ? 'peck' : 'idle'}
                interactive={false}
              />
            </div>

            {/* 连击数气泡 */}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#D43827] text-white font-bold text-xs shadow-md">
              连击: {tapCount}
            </div>

            {/* 飞溅的木屑纸片 */}
            <AnimatePresence>
              {chips.map((chip) => (
                <motion.div
                  key={chip.id}
                  initial={{ opacity: 1, scale: 0.8, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 1.2,
                    x: chip.x,
                    y: chip.y - 40,
                    rotate: (chip.x > 0 ? 1 : -1) * 90,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute w-3.5 h-2 rounded bg-[#C8923E] pointer-events-none shadow-xs"
                />
              ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8A6A4E]">
              {tapCount > 0 ? `已猛烈啄击 ${tapCount} 下！` : '轻触上方树干开始'}
            </span>
            <PaperButton
              variant="primary"
              size="sm"
              disabled={tapCount === 0}
              onClick={handleFinishTapping}
            >
              敲累了，看看心里装了什么 ›
            </PaperButton>
          </div>
        </div>
      )}

      {phase === 'selecting' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-white/70 border border-[#E8DEC8] text-xs text-[#5C4033] leading-relaxed">
            🌲 树洞裂开一道缝隙，飘出了一缕缕情绪的纸片。
            <br />
            <strong>请选出 1～3 个最符合你此刻感受的词：</strong>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {EMOTION_TAGS.map((tag) => {
              const isSelected = selectedEmotions.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleEmotion(tag)}
                  className={`py-2 px-1 text-xs rounded-xl border transition-all cursor-pointer font-medium ${
                    isSelected
                      ? 'bg-[#D43827] text-white border-[#9E2012] shadow-sm font-bold scale-[1.03]'
                      : 'bg-white/80 hover:bg-white text-[#5C4033] border-[#E8DEC8]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <PaperButton
              variant="primary"
              size="md"
              disabled={selectedEmotions.length === 0}
              onClick={handleConfirmEmotions}
            >
              直面它们，收入背包 ›
            </PaperButton>
          </div>
        </div>
      )}

      {phase === 'finished' && (
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E5EFE3] flex items-center justify-center text-2xl border border-[#38662F]/30 shadow-xs">
            🌿
          </div>
          <p className="text-sm font-bold text-[#3B2D25]">
            笃笃歪着头说：「原来你此刻感到【{selectedEmotions.join('、')}】啊，这非常正常！」
          </p>
          <p className="text-xs text-[#7A583E] leading-relaxed max-w-sm mx-auto">
            情绪是敲响警钟的信使，不是你的敌人。
            当你准确叫出它名字的那一秒，大脑的杏仁核就已经开始平静下来了。
          </p>
          <div className="pt-2">
            <PaperButton variant="primary" size="md" onClick={closeGame}>
              带着这份觉察回到森林
            </PaperButton>
          </div>
        </div>
      )}
    </div>
  );
};
