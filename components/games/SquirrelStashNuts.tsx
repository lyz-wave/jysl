'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperButton } from '../paper/PaperButton';
import { useForestStore } from '@/lib/store';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface NutStep {
  id: string;
  step: string;
  duration: string;
  isStashed: boolean;
}

const DEFAULT_PRESETS = [
  {
    bigTask: '手头的大项目毫无头绪，完全不知道从哪里下手，一想就焦虑瘫痪。',
    steps: [
      { id: 'n1', step: '今天只花 5 分钟，在纸上随便列出 3 个想到的碎片词', duration: '5分钟', isStashed: false },
      { id: 'n2', step: '把最模糊的一个问题，发微信请教一个懂行的同事或朋友', duration: '2分钟', isStashed: false },
      { id: 'n3', step: '只要完成上面任意一个，今天就心安理得犒劳自己一杯热饮', duration: '立即', isStashed: false },
    ],
  },
  {
    bigTask: '想换新工作，但是简历没改、方向迷茫，拖延了几个月。',
    steps: [
      { id: 'n4', step: '今天只把旧简历翻开，更新一下现在的在职起止时间', duration: '3分钟', isStashed: false },
      { id: 'n5', step: '上招聘软件只搜一个感兴趣的岗位要求，不投递，只看看关键词', duration: '5分钟', isStashed: false },
      { id: 'n6', step: '把想到的困扰写下来，不苛求今天必须全部搞定', duration: '随时', isStashed: false },
    ],
  },
];

export const SquirrelStashNuts: React.FC = () => {
  const { addGameContext, closeGame } = useForestStore();
  const [presetIndex, setPresetIndex] = useState(0);
  const [steps, setSteps] = useState<NutStep[]>(DEFAULT_PRESETS[0].steps);

  const currentTask = DEFAULT_PRESETS[presetIndex].bigTask;

  const handleStash = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isStashed: true } : s))
    );
  };

  const stashedCount = steps.filter((s) => s.isStashed).length;

  const handleFinish = () => {
    const selected = steps.filter((s) => s.isStashed).map((s) => s.step);
    if (selected.length > 0) {
      addGameContext(
        `跳跳帮我把庞大焦虑【${currentTask.slice(0, 18)}...】啃成了松果，我藏进了愿尝试的微步骤：【${selected.join('；')}】`
      );
    }
    closeGame();
  };

  return (
    <div className="space-y-4 select-none text-xs">
      <div className="flex items-center justify-between text-[11px] text-[#7A583E]">
        <span>🐿️ 拖延与瘫痪的大难题：</span>
        <button
          onClick={() => {
            const nextIdx = (presetIndex + 1) % DEFAULT_PRESETS.length;
            setPresetIndex(nextIdx);
            setSteps(DEFAULT_PRESETS[nextIdx].steps);
          }}
          className="underline hover:text-[#C84630] cursor-pointer"
        >
          换一个焦虑大任务
        </button>
      </div>

      <div className="p-3 rounded-2xl bg-[#FFF6EE] border border-[#EACBB8] text-[#5C321E] font-medium leading-relaxed italic">
        "{currentTask}"
      </div>

      <div className="p-3 rounded-2xl bg-white/70 border border-[#E8DEC8] text-xs text-[#5C4033] leading-relaxed">
        跳跳蹦跳着用牙齿咔嚓咔嚓，把大山般的难题啃成了 3 颗触手可及的轻量小松果。
        <br />
        <strong>点击你今天愿意迈出的小坚果，藏进树洞：</strong>
      </div>

      {/* 3 颗小坚果卡片 */}
      <div className="space-y-2.5">
        {steps.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              item.isStashed
                ? 'bg-[#E5EFE3] border-[#38662F] text-[#23481F] shadow-xs'
                : 'bg-white/90 border-[#D9CDB8] text-[#4D3524] shadow-xs'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl shrink-0 mt-0.5">🌰</span>
              <div>
                <p className="font-bold leading-relaxed">{item.step}</p>
                <span className="text-[10px] text-[#8C6648] font-normal">
                  预计耗时：{item.duration}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleStash(item.id)}
              disabled={item.isStashed}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                item.isStashed
                  ? 'bg-transparent text-[#38662F] cursor-default flex items-center gap-1'
                  : 'bg-[#C45229] hover:bg-[#A83D17] text-white active:scale-95 shadow-xs'
              }`}
            >
              {item.isStashed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已藏进树洞
                </>
              ) : (
                '愿意试试 ›'
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-[#E8DEC8]">
        <span className="text-[11px] text-[#7A583E]">
          {stashedCount > 0 ? `已藏好 ${stashedCount} 颗行动小松果` : '挑一颗今天最轻松的藏好'}
        </span>

        <PaperButton
          variant="primary"
          size="md"
          disabled={stashedCount === 0}
          onClick={handleFinish}
        >
          带着小行动回森林 ›
        </PaperButton>
      </div>
    </div>
  );
};
