'use client';

import React from 'react';
import { ChevronRight, TreePine, Calendar, Sparkles } from 'lucide-react';

interface RingBreadcrumbsProps {
  selectedYear: number | null;
  selectedMonth: number | null;
  selectedMemoryTitle: string | null;
  totalMemoriesCount: number;
  yearMemoriesCount?: number;
  monthMemoriesCount?: number;
  onSelectRoot: () => void;
  onSelectYear: (year: number) => void;
  onSelectMonth: (month: number) => void;
}

export const RingBreadcrumbs: React.FC<RingBreadcrumbsProps> = ({
  selectedYear,
  selectedMonth,
  selectedMemoryTitle,
  totalMemoriesCount,
  yearMemoriesCount,
  monthMemoriesCount,
  onSelectRoot,
  onSelectYear,
  onSelectMonth,
}) => {
  return (
    <nav className="flex items-center flex-wrap gap-1.5 text-xs select-none">
      {/* 根节点：全部年轮 */}
      <button
        onClick={onSelectRoot}
        className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
          selectedYear === null
            ? 'bg-[#38662F] text-white font-bold border-[#2A4E23] shadow-xs'
            : 'bg-white/80 text-[#7A583E] border-[#E8DEC8] hover:bg-white hover:text-[#38662F]'
        }`}
      >
        <TreePine className="w-3.5 h-3.5" />
        <span>古树全部年轮</span>
        <span className="text-[10px] opacity-80 bg-black/10 px-1.5 py-0.2 rounded-full">
          {totalMemoriesCount}
        </span>
      </button>

      {/* 年份节点 */}
      {selectedYear !== null && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-[#B39B88]" />
          <button
            onClick={() => onSelectYear(selectedYear)}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedMonth === null
                ? 'bg-[#38662F] text-white font-bold border-[#2A4E23] shadow-xs'
                : 'bg-white/80 text-[#7A583E] border-[#E8DEC8] hover:bg-white hover:text-[#38662F]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{selectedYear} 年</span>
            {yearMemoriesCount !== undefined && (
              <span className="text-[10px] opacity-80 bg-black/10 px-1.5 py-0.2 rounded-full">
                {yearMemoriesCount}
              </span>
            )}
          </button>
        </>
      )}

      {/* 月份节点 */}
      {selectedYear !== null && selectedMonth !== null && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-[#B39B88]" />
          <button
            onClick={() => onSelectMonth(selectedMonth)}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              !selectedMemoryTitle
                ? 'bg-[#38662F] text-white font-bold border-[#2A4E23] shadow-xs'
                : 'bg-white/80 text-[#7A583E] border-[#E8DEC8] hover:bg-white hover:text-[#38662F]'
            }`}
          >
            <span>{selectedMonth} 月</span>
            {monthMemoriesCount !== undefined && (
              <span className="text-[10px] opacity-80 bg-black/10 px-1.5 py-0.2 rounded-full">
                {monthMemoriesCount}
              </span>
            )}
          </button>
        </>
      )}

      {/* 具体条目节点 */}
      {selectedMemoryTitle && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-[#B39B88]" />
          <div className="px-3 py-1.5 rounded-xl bg-[#FFF6EE] border border-[#EACBB8] text-[#A3431F] font-bold flex items-center gap-1 shadow-xs max-w-[200px] sm:max-w-none truncate">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{selectedMemoryTitle}</span>
          </div>
        </>
      )}
    </nav>
  );
};
