'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TreePine, Sparkles, Layers, List } from 'lucide-react';
import { Memory, Session } from '@/lib/types';
import { db } from '@/lib/db';
import { seedDemoMemories } from '@/lib/demoData';
import { MemoryList } from './MemoryList';
import { GrowthCard } from './GrowthCard';

interface RingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RingsModal: React.FC<RingsModalProps> = ({ isOpen, onClose }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);

  const loadMemories = useCallback(async () => {
    try {
      setLoading(true);
      const all = await db.memories.toArray();
      all.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setMemories(all);

      if (all.length === 0) {
        await seedDemoMemories();
        const seeded = await db.memories.toArray();
        seeded.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMemories(seeded);
      }
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen, loadMemories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/45 backdrop-blur-xs transition-all"
      />

      {/* 弹窗主体 (高质感透明液态玻璃 + 手撕多边形边缘) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="relative z-10 w-full max-w-4xl drop-shadow-paper-edge flex flex-col my-auto max-h-[92vh]"
      >
        <div className="relative w-full overflow-hidden rounded-3xl glass-card-paper paper-rough-edge text-left flex flex-col max-h-[88vh]">
          {/* 顶部镜面反光光扫条 */}
          <div className="absolute top-0 inset-x-0 h-32 pointer-events-none bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-3xl" />

          {/* 弹窗头部 */}
          <div className="relative z-10 p-5 sm:p-6 pb-4 border-b border-white/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/18 border border-emerald-600/30 flex items-center justify-center text-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
                🌳
              </div>
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-[#28180E] drop-shadow-xs flex items-center gap-2">
                  <span>岁岁的年轮长卷</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/18 text-emerald-950 border border-emerald-600/30 font-medium">
                    共 {memories.length} 圈成长年轮
                  </span>
                </h3>
                <p className="text-xs text-[#6E472B]">每一圈年轮，都是一次破茧成蝶的思维舒展</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6E472B] hover:text-[#28180E] bg-white/40 hover:bg-white/75 border border-white/70 backdrop-blur-md shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 年轮列表内容区 */}
          <div className="relative z-10 p-5 sm:p-6 overflow-y-auto space-y-4">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#6E472B]">
                正在舒展年轮记忆...
              </div>
            ) : (
              <MemoryList
                memories={memories}
                onSelectMemory={(m) => setActiveMemory(m)}
              />
            )}
          </div>

          {/* 底部关闭 */}
          <div className="relative z-10 p-4 border-t border-white/60 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-[#FAF7EE] text-[#4A3220] border border-[#8C6648]/40 hover:bg-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              返回森林
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3D 弹出式单张成长年轮卡片 */}
      <AnimatePresence>
        {activeMemory && (
          <GrowthCard
            memory={activeMemory}
            onClose={() => setActiveMemory(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
