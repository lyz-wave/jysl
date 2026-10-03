'use client';

import React, { useState } from 'react';
import { Memory, FixedTheme, AnimalId } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface MemoryListProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
}

export const MemoryList: React.FC<MemoryListProps> = ({
  memories,
  onSelectMemory,
  selectedYear,
  onSelectYear,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<FixedTheme | 'all'>('all');

  // 提取所有年份选项
  const availableYears = Array.from(
    new Set(memories.map((m) => parseInt(m.date.split('-')[0], 10)))
  ).sort((a, b) => b - a);

  // 提取所有出现过的主题
  const allThemes = Array.from(
    new Set(memories.flatMap((m) => m.themes))
  );

  // 过滤后的列表
  const filteredMemories = memories.filter((m) => {
    const matchesYear =
      selectedYear === null || m.date.startsWith(`${selectedYear}`);
    const matchesTheme =
      selectedTheme === 'all' || m.themes.includes(selectedTheme);
    const matchesSearch =
      !searchTerm.trim() ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.insight.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.shift.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.shift.to.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesTheme && matchesSearch;
  });

  return (
    <div className="w-full space-y-4 text-left">
      {/* 搜索与主题筛选栏 */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* 搜索输入框 */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C6648] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索心事、领悟、关键词..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border border-[#D9CDB8] text-xs text-[#4D3524] placeholder-[#A89481] focus:outline-none focus:border-[#38662F]"
          />
        </div>

        {/* 主题下拉筛选 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTheme('all')}
            className={`px-3 py-1.5 rounded-full text-xs shrink-0 transition-colors cursor-pointer ${
              selectedTheme === 'all'
                ? 'bg-[#38662F] text-white font-bold'
                : 'bg-white/80 text-[#7A583E] border border-[#E8DEC8] hover:bg-white'
            }`}
          >
            全部主题
          </button>
          {allThemes.slice(0, 5).map((theme) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`px-3 py-1.5 rounded-full text-xs shrink-0 transition-colors cursor-pointer ${
                selectedTheme === theme
                  ? 'bg-[#A3431F] text-white font-bold'
                  : 'bg-white/80 text-[#7A583E] border border-[#E8DEC8] hover:bg-white'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* 记忆卡片列表 */}
      {filteredMemories.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-white/60 border border-[#E8DEC8] text-xs text-[#8C6648]">
          未找到匹配的心事年轮记忆
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMemory(m)}
              className="relative drop-shadow-paper-edge-sm cursor-pointer group transition-transform hover:-translate-y-0.5"
            >
              <div className="relative p-4 sm:p-5 rounded-3xl glass-card-paper hover:bg-white/80 transition-all space-y-3 paper-rough-edge">
                {/* 顶部镜面反光扫光 */}
                <div className="absolute top-0 inset-x-0 h-20 pointer-events-none bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-3xl" />

                {/* 卡片头部：日期、主题与心情指示 */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#6E472B] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {m.date}
                    </span>
                    {m.themes.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full bg-emerald-500/18 text-emerald-950 text-[10px] font-bold border border-emerald-600/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* 晴雨对比指示 */}
                  <div className="flex items-center gap-1 text-[11px] text-[#5C321E] bg-white/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/80 shadow-xs">
                    <span>{m.moodBefore ? `${m.moodBefore}分` : '🌧️'}</span>
                    <ArrowRight className="w-3 h-3 text-[#2F5927]" />
                    <span className="font-bold text-[#1B4E17]">
                      {m.moodAfter ? `${m.moodAfter}分` : '☀️'}
                    </span>
                  </div>
                </div>

                {/* 标题 */}
                <h3 className="relative z-10 font-bold text-sm sm:text-base text-[#28180E] group-hover:text-[#24611E] transition-colors drop-shadow-xs">
                  {m.title}
                </h3>

                {/* 认知转变胶囊 (微霜玻璃) */}
                <div className="relative z-10 p-2.5 rounded-xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)] text-[11px] space-y-1">
                  <div className="text-[#6E472B] truncate">
                    <span className="opacity-75 font-medium">旧念：</span>
                    {m.shift.from}
                  </div>
                  <div className="text-[#1B4E17] font-semibold truncate">
                    <span className="opacity-75 font-medium">新解：</span>
                    {m.shift.to}
                  </div>
                </div>

                {/* 底部同行伙伴与展开引导 */}
                <div className="relative z-10 flex items-center justify-between pt-1 text-[11px] text-[#6E472B]">
                  <div className="flex items-center gap-1">
                    <span>同行：</span>
                    {m.helpfulAnimals.map((id) => (
                      <span
                        key={id}
                        className="px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[#3D2819] text-[10px] font-medium"
                      >
                        {ANIMALS[id as AnimalId]?.name || id}
                      </span>
                    ))}
                  </div>
                  <span className="text-[#24611E] font-bold group-hover:underline flex items-center gap-0.5">
                    查看年轮卡片 ›
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
