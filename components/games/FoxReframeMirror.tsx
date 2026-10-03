'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PaperButton } from '../paper/PaperButton';
import { useForestStore } from '@/lib/store';
import { Sparkles, Check } from 'lucide-react';

const REFRAME_PRESETS = [
  {
    thought: '我觉得自己一事无成，同龄人都远远走在我前面了。',
    reframes: {
      humor: '一事无成？今天你至少成功呼吸了两万多次，还找到了解忧森林！狐狸宣布你是今日最佳探索者。',
      gentle: '走得慢也是在往前走。你在无人知晓的心底风暴里默默坚持到了今天，这本身就已经是一件很了不起的事。',
      reality: '人生不是只有一条跑道的大马路，每朵花的季节都不同，一时的停顿绝不等于全盘否定。',
    },
  },
  {
    thought: '这次考核搞砸了，我注定做不好任何事情。',
    reframes: {
      humor: '搞砸了一次考核，只能证明你暂时不擅长应付这个特定试卷，可没证明你不会过好今天的生活！',
      gentle: '失误是疲惫的信号，而不是无能的宣判。允许自己有做不好的时候，你已经尽力了。',
      reality: '一次具体的考核结果只能评价一件具体的事，它无法定义你作为一个完整人的潜力与未来。',
    },
  },
];

export const FoxReframeMirror: React.FC = () => {
  const { addGameContext, closeGame } = useForestStore();
  const [presetIndex, setPresetIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const current = REFRAME_PRESETS[presetIndex];

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleCollect = (title: string, text: string) => {
    setSelectedVersion(title);
    addGameContext(
      `在阿橘的翻面镜中将【${current.thought.slice(0, 18)}...】重构为${title}：『${text}』`
    );
  };

  return (
    <div className="space-y-5 select-none text-xs">
      {/* 念头输入/切换卡 */}
      <div className="flex items-center justify-between text-[11px] text-[#7A583E]">
        <span>心头卡住的念头：</span>
        <button
          onClick={() => {
            setPresetIndex((prev) => (prev + 1) % REFRAME_PRESETS.length);
            setIsFlipped(false);
            setSelectedVersion(null);
          }}
          className="underline hover:text-[#C84630] cursor-pointer"
        >
          换一个困扰念头
        </button>
      </div>

      {/* 3D 翻面镜主卡片 */}
      <div className="perspective-stage w-full h-72">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 180, damping: 18 }}
          className="relative w-full h-full preserve-3d"
        >
          {/* 正面：沉重灰暗负面卡纸 */}
          <div
            className={`absolute inset-0 rounded-3xl p-6 bg-[#FAF0DC] border-2 border-[#D9CDB8] shadow-md flex flex-col justify-between backface-hidden ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <span className="px-2 py-0.5 rounded-full bg-[#EFE0C9] text-[10px] text-[#7A583E] font-bold">
                镜前原念头
              </span>
              <p className="mt-6 text-sm sm:text-base font-bold text-[#4D3524] leading-relaxed italic">
                "{current.thought}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E8DEC8]">
              <span className="text-[11px] text-[#8A6A4E]">
                🦊 阿橘在一旁晃着大尾巴跃跃欲试...
              </span>
              <PaperButton
                variant="vermilion"
                size="md"
                onClick={handleFlip}
                icon={<Sparkles className="w-4 h-4" />}
              >
                尾巴一扫，翻转镜面！
              </PaperButton>
            </div>
          </div>

          {/* 反面：温暖明亮重构卡纸 (rotateY: 180deg) */}
          <div
            className={`absolute inset-0 rounded-3xl p-5 bg-[#FAF7EE] border-2 border-[#38662F] shadow-lg flex flex-col justify-between overflow-y-auto ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#38662F] flex items-center gap-1.5">
                <span>✨ 翻转镜面，换个看台有三道新风景：</span>
              </span>

              {/* 三种版本卡片 */}
              {[
                { key: '幽默版', text: current.reframes.humor, badge: '😄 幽默解构' },
                { key: '温柔版', text: current.reframes.gentle, badge: '💖 温柔接纳' },
                { key: '现实版', text: current.reframes.reality, badge: '🌱 客观现实' },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleCollect(item.key, item.text)}
                  className={`p-2.5 rounded-xl border text-[11px] transition-all cursor-pointer leading-relaxed ${
                    selectedVersion === item.key
                      ? 'bg-[#E5EFE3] border-[#38662F] text-[#23481F] font-bold shadow-xs'
                      : 'bg-white/80 hover:bg-white border-[#E8DEC8] text-[#5C4033]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[10px] text-[#38662F]">
                      {item.badge}
                    </span>
                    {selectedVersion === item.key && (
                      <span className="text-[10px] text-[#38662F] flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> 已收藏
                      </span>
                    )}
                  </div>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[#E8DEC8]">
              <button
                onClick={() => setIsFlipped(false)}
                className="text-[11px] text-[#7A583E] underline cursor-pointer"
              >
                ‹ 翻回正面看看
              </button>

              <PaperButton
                variant="primary"
                size="sm"
                disabled={!selectedVersion}
                onClick={closeGame}
              >
                收下这句灵光，回森林 ›
              </PaperButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
