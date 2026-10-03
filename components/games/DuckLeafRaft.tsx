'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperButton } from '../paper/PaperButton';
import { useForestStore } from '@/lib/store';
import { Waves, Sparkles, ShieldCheck } from 'lucide-react';

interface LeafItem {
  id: string;
  text: string;
  isDrifting: boolean;
}

export const DuckLeafRaft: React.FC = () => {
  const { addGameContext, closeGame } = useForestStore();
  const [inputText, setInputText] = useState('');
  const [leaves, setLeaves] = useState<LeafItem[]>([
    { id: 'l1', text: '总担心自己表现得不够好', isDrifting: false },
    { id: 'l2', text: '对未来未知的恐慌', isDrifting: false },
  ]);
  const [driftedCount, setDriftedCount] = useState(0);

  const handleAddLeaf = () => {
    if (!inputText.trim()) return;
    setLeaves((prev) => [
      ...prev,
      { id: `leaf_${Date.now()}`, text: inputText.trim(), isDrifting: false },
    ]);
    setInputText('');
  };

  const handleDrift = (id: string) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isDrifting: true } : l))
    );
    setDriftedCount((c) => c + 1);

    // 漂流走后从列表彻底移除
    setTimeout(() => {
      setLeaves((prev) => prev.filter((l) => l.id !== id));
    }, 3500);
  };

  const handleFinish = () => {
    addGameContext(
      `在漂漂的小溪中放飞了 ${Math.max(driftedCount, 1)} 片烦恼落叶，字迹化水消散，体会了不被念头缠绕的认知解离`
    );
    closeGame();
  };

  return (
    <div className="space-y-4 select-none text-xs">
      <div className="flex items-center justify-between text-[11px] text-[#7A583E]">
        <span className="flex items-center gap-1">
          <Waves className="w-3.5 h-3.5 text-[#3E6B7A]" />
          把沉重的念头写在落叶上，看它顺溪流走
        </span>
        <span className="text-[10px] text-[#2F5927] font-semibold flex items-center gap-0.5">
          <ShieldCheck className="w-3 h-3" /> 文字不留痕
        </span>
      </div>

      {/* 写烦恼落叶输入框 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="写下一个抓着你不放的念头..."
          maxLength={40}
          onKeyDown={(e) => e.key === 'Enter' && handleAddLeaf()}
          className="flex-1 px-3 py-2 rounded-xl bg-white/90 border border-[#D9CDB8] text-xs text-[#4D3524] focus:outline-none focus:border-[#38662F]"
        />
        <PaperButton variant="primary" size="sm" onClick={handleAddLeaf}>
          折成纸叶
        </PaperButton>
      </div>

      {/* 小溪流漂流舞台 */}
      <div className="relative h-64 rounded-3xl bg-gradient-to-b from-[#E6F0F2] to-[#C9DFE5] border-2 border-[#A8C7CE] overflow-hidden p-4 flex flex-col justify-between">
        {/* 溪水波纹剪纸层 */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[120%] h-full flex flex-col justify-around"
          >
            <div className="h-1 bg-[#6EA4B5]/30 rounded-full" />
            <div className="h-1 bg-[#6EA4B5]/40 rounded-full translate-x-10" />
            <div className="h-1 bg-[#6EA4B5]/30 rounded-full translate-x-4" />
          </motion.div>
        </div>

        {/* 漂漂小野鸭在水面怡然自得 */}
        <div className="absolute right-4 bottom-3 z-10 opacity-90 pointer-events-none flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-full text-[10px] text-[#2A4638]">
          <span>🦆 漂漂：「羽毛不沾水，念头过境，随它漂便是」</span>
        </div>

        {/* 待漂流与正在漂走的纸叶群 */}
        <div className="relative z-20 space-y-2.5">
          <AnimatePresence>
            {leaves.map((leaf) => (
              <motion.div
                key={leaf.id}
                initial={{ opacity: 0, y: 15 }}
                animate={
                  leaf.isDrifting
                    ? {
                        x: [0, 80, 280, 450],
                        y: [0, 8, -6, 12],
                        opacity: [1, 0.8, 0.3, 0],
                        filter: ['blur(0px)', 'blur(1px)', 'blur(4px)', 'blur(8px)'],
                      }
                    : { opacity: 1, y: 0 }
                }
                transition={
                  leaf.isDrifting
                    ? { duration: 3.2, ease: 'easeInOut' }
                    : { duration: 0.3 }
                }
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F4EBD9] border border-[#DFC9A8] shadow-sm text-xs text-[#5C4033]"
                style={{
                  clipPath:
                    'polygon(4% 0%, 96% 0%, 100% 50%, 96% 100%, 4% 100%, 0% 50%)',
                }}
              >
                <span className="truncate pr-2 font-medium italic">
                  🍂 "{leaf.text}"
                </span>
                {!leaf.isDrifting ? (
                  <button
                    onClick={() => handleDrift(leaf.id)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-[#3E6B7A] hover:bg-[#305562] text-white text-[10px] font-bold cursor-pointer active:scale-95 shadow-xs"
                  >
                    放手漂走 ›
                  </button>
                ) : (
                  <span className="text-[10px] text-[#3E6B7A] animate-pulse">
                    正在化水消散...
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {leaves.length === 0 && (
            <div className="py-12 text-center text-[#557B88] font-bold text-xs">
              🌊 溪面上空空如也，所有写下的念头均已随流水洗净消散。
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-[#8A6A4E]">
          已看淡并放飞 {driftedCount} 片烦恼纸叶
        </span>

        <PaperButton variant="primary" size="md" onClick={handleFinish}>
          体会到了念头的流过，回森林 ›
        </PaperButton>
      </div>
    </div>
  );
};
