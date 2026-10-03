'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, Session, AnimalId } from '@/lib/types';
import { db } from '@/lib/db';
import { seedDemoMemories, clearAllMemories } from '@/lib/demoData';
import { PaperTexture } from '@/components/paper/PaperTexture';
import { PaperButton } from '@/components/paper/PaperButton';
import { RingContours } from '@/components/rings/RingContours';
import { RingBreadcrumbs } from '@/components/rings/RingBreadcrumbs';
import { GrowthCard } from '@/components/rings/GrowthCard';
import { MemoryList } from '@/components/rings/MemoryList';
import { ANIMALS } from '@/lib/animals';
import {
  TreePine,
  ArrowLeft,
  Sparkles,
  Layers,
  List,
  RotateCcw,
  BookOpen,
  X,
  Compass,
} from 'lucide-react';

export default function RingsPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  // 视图模式：纸雕年轮 (rings) 或 时光印记列表 (list)
  const [viewMode, setViewMode] = useState<'rings' | 'list'>('rings');

  // 下钻导航层级状态
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);

  // 对话回放弹窗状态
  const [replaySession, setReplaySession] = useState<Session | null>(null);

  // 从 Dexie 加载所有成长记忆
  const loadMemories = useCallback(async () => {
    try {
      setLoading(true);
      const all = await db.memories.toArray();
      // 按日期降序排列
      all.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setMemories(all);

      // 如果当前没有数据，自动或引导注入演示数据
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
    loadMemories();
  }, [loadMemories]);

  // 一键重新注入演示数据
  const handleSeedDemoData = async () => {
    const inserted = await seedDemoMemories();
    await loadMemories();
    alert(
      inserted > 0
        ? `已成功注入 ${inserted} 条跨越 2024~2026 年的心理成长演示年轮！`
        : '演示数据已存在，可以直接浏览。'
    );
  };

  // 重置清除所有记忆 (开发测试)
  const handleClearMemories = async () => {
    if (confirm('确定要清空所有年轮记忆吗？清空后可随时再次一键注入。')) {
      await clearAllMemories();
      await loadMemories();
      setSelectedYear(null);
      setSelectedMonth(null);
      setActiveMemory(null);
    }
  };

  // 点击查看原对话记录
  const handleViewDialogue = async (sessionId: string) => {
    try {
      const sess = await db.sessions.get(sessionId);
      if (sess) {
        setReplaySession(sess);
      } else {
        alert('该条年轮为演示数据，未关联历史完整会话日志。');
      }
    } catch (err) {
      console.error('Error fetching session:', err);
    }
  };

  // 计算当前层级的统计数
  const totalCount = memories.length;
  const yearCount = selectedYear
    ? memories.filter((m) => m.date.startsWith(`${selectedYear}`)).length
    : undefined;
  const monthCount =
    selectedYear && selectedMonth
      ? memories.filter(
          (m) =>
            m.date.startsWith(
              `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
            )
        ).length
      : undefined;

  return (
    <main className="min-h-screen bg-[#FAF7EE] text-[#4D3524] relative overflow-x-hidden flex flex-col justify-between pb-12">
      <PaperTexture opacity={0.35} />

      {/* 顶部导航条 */}
      <header className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between border-b border-[#E8DEC8]/80 select-none">
        <div className="flex items-center gap-3">
          <Link href="/forest">
            <PaperButton
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              返回森林
            </PaperButton>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#3B2D25] leading-tight">
                岁岁的年轮 · 成长画卷
              </h1>
              <span className="text-[11px] text-[#8C6648]">
                共沉淀了 {totalCount} 圈生命的坚韧与舒展
              </span>
            </div>
          </div>
        </div>

        {/* 右侧控制：注入演示数据 & 视图切换 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <PaperButton
            variant="secondary"
            size="sm"
            onClick={handleSeedDemoData}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#38662F]" />}
            className="hidden sm:inline-flex"
          >
            注入2-3年演示数据
          </PaperButton>

          {/* 视图切换 (纸雕同心圆 / 列表) */}
          <div className="flex items-center p-1 rounded-full bg-white/80 border border-[#E8DEC8]">
            <button
              onClick={() => setViewMode('rings')}
              title="2.5D 纸雕年轮视图"
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'rings'
                  ? 'bg-[#38662F] text-white shadow-xs'
                  : 'text-[#7A583E] hover:bg-stone-100'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="时光印记列表视图"
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#38662F] text-white shadow-xs'
                  : 'text-[#7A583E] hover:bg-stone-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 主体交互区域 */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 flex-1 flex flex-col space-y-5">
        {/* 面包屑导航与快捷年份标签 */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <RingBreadcrumbs
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedMemoryTitle={activeMemory?.title || null}
            totalMemoriesCount={totalCount}
            yearMemoriesCount={yearCount}
            monthMemoriesCount={monthCount}
            onSelectRoot={() => {
              setSelectedYear(null);
              setSelectedMonth(null);
              setActiveMemory(null);
            }}
            onSelectYear={(y) => {
              setSelectedYear(y);
              setSelectedMonth(null);
              setActiveMemory(null);
            }}
            onSelectMonth={(m) => {
              setSelectedMonth(m);
              setActiveMemory(null);
            }}
          />

          {/* 移动端注入演示数据按钮 */}
          <div className="sm:hidden w-full flex justify-end">
            <button
              onClick={handleSeedDemoData}
              className="text-xs text-[#38662F] font-bold underline cursor-pointer"
            >
              🌱 一键注入 2-3 年演示数据
            </button>
          </div>
        </div>

        {/* 核心视图渲染 */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-xs text-[#8C6648]">
            <span className="animate-spin text-xl mr-2">🍃</span>
            正在翻阅古树的年轮手记...
          </div>
        ) : viewMode === 'rings' ? (
          /* ================= 视图 A：2.5D 纸雕同心圆年轮 ================= */
          <div className="flex-1 flex flex-col items-center justify-center relative py-4">
            <div className="text-center space-y-1 mb-2">
              <span className="text-xs text-[#7A583E]">
                {selectedYear === null
                  ? '每一圈都是生命受力后长出的坚实保护层。点击外圈或内圈，下钻展开那一年'
                  : selectedMonth === null
                  ? `正在浏览【${selectedYear}年】的 12 个月度枝芽，点击有绿芽圆点的月份`
                  : `正在浏览【${selectedYear}年 ${selectedMonth}月】的心事萌芽，点击卡片打开领悟`}
              </span>
            </div>

            <RingContours
              memories={memories}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onSelectYear={(y) => setSelectedYear(y)}
              onSelectMonth={(m) => setSelectedMonth(m)}
              onSelectMemory={(m) => setActiveMemory(m)}
            />

            {/* 底部小提示 */}
            <div className="text-[11px] text-[#A89481] flex items-center gap-1 mt-4">
              <span>💡 支持在右上角切换为「列表时光卷」视图</span>
              <span>·</span>
              <button
                onClick={handleClearMemories}
                className="hover:underline text-[#B8563B]"
              >
                重置清空年轮
              </button>
            </div>
          </div>
        ) : (
          /* ================= 视图 B：时光印记列表/卡片列阵 ================= */
          <div className="flex-1 py-2">
            <MemoryList
              memories={memories}
              selectedYear={selectedYear}
              onSelectYear={(y) => setSelectedYear(y)}
              onSelectMemory={(m) => setActiveMemory(m)}
            />
          </div>
        )}
      </section>

      {/* 3D 弹出式成长年轮卡片 (GrowthCard) */}
      <AnimatePresence>
        {activeMemory && (
          <GrowthCard
            memory={activeMemory}
            onClose={() => setActiveMemory(null)}
            onViewDialogue={handleViewDialogue}
          />
        )}
      </AnimatePresence>

      {/* 对话历史重温弹窗 (若用户点击「重温那次对话」) */}
      <AnimatePresence>
        {replaySession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReplaySession(null)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl bg-[#FAF7EE] border-2 border-[#38662F] shadow-2xl p-6 text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3">
                <span className="font-bold text-sm text-[#3B2D25] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#38662F]" />
                  当时在篝火旁的倾诉回音
                </span>
                <button
                  onClick={() => setReplaySession(null)}
                  className="p-1 rounded-full text-[#8C6648] hover:bg-[#E8DEC8]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {replaySession.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl text-xs ${
                      m.speaker === 'user'
                        ? 'bg-[#E5EFE3] text-[#23481F] font-semibold border border-[#38662F]/30 ml-6'
                        : 'bg-white text-[#4D3524] border border-[#E8DEC8] mr-6'
                    }`}
                  >
                    <span className="text-[10px] opacity-75 block mb-1">
                      {m.speaker === 'user'
                        ? '你'
                        : m.speaker === 'tree' || m.speaker === 'ranger'
                        ? '🌲 守林人手记'
                        : `🐾 ${ANIMALS[m.speaker as AnimalId]?.name || m.speaker}`}
                    </span>
                    <p className="leading-relaxed">{m.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
