'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperButton } from '../paper/PaperButton';
import { useForestStore } from '@/lib/store';

interface Bubble {
  id: string;
  text: string;
  type: 'fact' | 'guess';
  trap?: string;
  assignedTo?: 'fact' | 'guess';
}

const PRESET_THOUGHTS = [
  {
    original: '今天领导在周会上皱着眉头看我，他肯定对我很不满意，我快要被开除了。',
    bubbles: [
      { id: 'b1', text: '领导今天在周会上皱着眉', type: 'fact' as const },
      { id: 'b2', text: '他皱眉是因为对我极度不满意', type: 'guess' as const, trap: '读心术陷阱' },
      { id: 'b3', text: '我很快就要被公司开除了', type: 'guess' as const, trap: '灾难化预言' },
    ],
  },
  {
    original: '发给朋友的信息两小时没回，他们一定是在背后排挤我、讨厌我。',
    bubbles: [
      { id: 'b4', text: '发出的信息过去了两小时暂未回复', type: 'fact' as const },
      { id: 'b5', text: '大家都在背后孤立排挤我', type: 'guess' as const, trap: '以偏概全陷阱' },
      { id: 'b6', text: '所有人都不喜欢我', type: 'guess' as const, trap: '非黑即白陷阱' },
    ],
  },
];

export const OwlFactOrGuess: React.FC = () => {
  const { addGameContext, closeGame } = useForestStore();
  const [inputText, setInputText] = useState(PRESET_THOUGHTS[0].original);
  const [bubbles, setBubbles] = useState<Bubble[]>(PRESET_THOUGHTS[0].bubbles);
  const [activeBubbleIndex, setActiveBubbleIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleClassify = (target: 'fact' | 'guess') => {
    const updated = [...bubbles];
    updated[activeBubbleIndex].assignedTo = target;
    setBubbles(updated);

    if (activeBubbleIndex < bubbles.length - 1) {
      setActiveBubbleIndex(activeBubbleIndex + 1);
    } else {
      // 全部归类完成
      const facts = updated.filter((b) => b.assignedTo === 'fact').length;
      const guesses = updated.filter((b) => b.assignedTo === 'guess').length;
      addGameContext(
        `在墨墨处拆解了烦恼【${inputText.slice(0, 20)}...】，分清了 ${facts} 项客观事实与 ${guesses} 项主观脑补猜测，打破了灾难化思维陷阱`
      );
      setIsFinished(true);
    }
  };

  const handleSelectPreset = (index: number) => {
    setInputText(PRESET_THOUGHTS[index].original);
    setBubbles(PRESET_THOUGHTS[index].bubbles.map((b) => ({ ...b, assignedTo: undefined })));
    setActiveBubbleIndex(0);
    setIsFinished(false);
  };

  const currentBubble = bubbles[activeBubbleIndex];

  return (
    <div className="space-y-5 select-none text-xs">
      {!isFinished ? (
        <>
          {/* 示例切换 */}
          <div className="flex items-center justify-between text-[11px] text-[#7A583E]">
            <span>困扰念头：</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectPreset(0)}
                className="underline hover:text-[#38662F] cursor-pointer"
              >
                示例一(职场)
              </button>
              <button
                onClick={() => handleSelectPreset(1)}
                className="underline hover:text-[#38662F] cursor-pointer"
              >
                示例二(人际)
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 border border-[#E8DEC8] text-[#4D3524] italic">
            "{inputText}"
          </div>

          {/* 正在待分类的气泡纸片 */}
          <div className="py-2 text-center">
            <span className="text-[11px] text-[#8A6A4E]">
              待分类气泡（{activeBubbleIndex + 1} / {bubbles.length}）：
            </span>

            <AnimatePresence mode="wait">
              {currentBubble && (
                <motion.div
                  key={currentBubble.id}
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -15 }}
                  className="mt-2.5 mx-auto max-w-sm p-4 rounded-2xl bg-[#FFF9EC] border-2 border-[#D9C4A1] text-sm font-bold text-[#3B2D25] shadow-md"
                >
                  💭 "{currentBubble.text}"
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 事实与猜测两个树洞投递槽 */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleClassify('fact')}
              className="p-4 rounded-2xl bg-[#E5EFE3] hover:bg-[#D5E6D2] border-2 border-[#38662F] text-[#23481F] flex flex-col items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <span className="text-2xl">🌿</span>
              <span className="font-bold text-sm">事实树洞</span>
              <span className="text-[10px] opacity-80">
                可被录像机拍下的客观发生
              </span>
            </button>

            <button
              onClick={() => handleClassify('guess')}
              className="p-4 rounded-2xl bg-[#FFF0E8] hover:bg-[#FFE3D4] border-2 border-[#C84630] text-[#8C2919] flex flex-col items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <span className="text-2xl">🌪️</span>
              <span className="font-bold text-sm">猜测树洞</span>
              <span className="text-[10px] opacity-80">
                大脑未经证实的推论与假想
              </span>
            </button>
          </div>
        </>
      ) : (
        /* 分类完成结果页 */
        <div className="space-y-4 py-2">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E8DEC8] space-y-2">
            <div className="font-bold text-sm text-[#3B2D25] flex items-center gap-2">
              <span>🦉 墨墨的理性分析盘点：</span>
            </div>
            {bubbles.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7EE] text-xs"
              >
                <span className="text-[#5C4033]">"{b.text}"</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    b.assignedTo === 'fact'
                      ? 'bg-[#E5EFE3] text-[#38662F]'
                      : 'bg-[#FFF0E8] text-[#C84630]'
                  }`}
                >
                  {b.assignedTo === 'fact' ? '✓ 真实事实' : `⚠ 脑补猜测 (${b.trap || '认知陷阱'})`}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#7A583E] leading-relaxed">
            你看，真正板上钉钉的事实通常只有极其简单的一句话，
            折磨我们的，往往是紧随其后的灾难性剧本。认出剧本，它就不能再控制你。
          </p>

          <div className="pt-2 flex justify-end">
            <PaperButton variant="primary" size="md" onClick={closeGame}>
              收下这份理性的明辨 ›
            </PaperButton>
          </div>
        </div>
      )}
    </div>
  );
};
