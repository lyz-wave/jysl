'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import { Sparkles, Calendar, Heart, ArrowUpRight } from 'lucide-react';

interface RingContoursProps {
  memories: Memory[];
  selectedYear: number | null;
  selectedMonth: number | null;
  onSelectYear: (year: number) => void;
  onSelectMonth: (month: number) => void;
  onSelectMemory: (memory: Memory) => void;
}

// 辅助算法：生成有机手剪微波动的同心年轮闭合路径
function getOrganicCirclePath(
  cx: number,
  cy: number,
  r: number,
  wobble: number = 3,
  seed: number = 1
): string {
  const steps = 32;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    // 多频正弦叠加产生天然树木年轮的微小起伏
    const delta =
      Math.sin(angle * 3 + seed) * wobble +
      Math.cos(angle * 5 + seed * 1.7) * (wobble * 0.45);
    const radius = Math.max(10, r + delta);
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }

  // 拼接平滑封闭贝塞尔曲线
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < steps; i++) {
    const curr = points[i];
    const next = points[(i + 1) % steps];
    const mx = (curr.x + next.x) / 2;
    const my = (curr.y + next.y) / 2;
    d += ` Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}, ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  d += ' Z';
  return d;
}

// 辅助算法：生成环形纸片面 (外圈 - 内圈)
function getOrganicAnnulusPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  seed: number = 1
): string {
  const outerPath = getOrganicCirclePath(cx, cy, outerR, 3, seed);
  const innerPath = getOrganicCirclePath(cx, cy, innerR, 2, seed + 10);
  return `${outerPath} ${innerPath}`;
}

export const RingContours: React.FC<RingContoursProps> = ({
  memories,
  selectedYear,
  selectedMonth,
  onSelectYear,
  onSelectMonth,
  onSelectMemory,
}) => {
  const [hoveredRingKey, setHoveredRingKey] = useState<string | null>(null);

  // 1. 按年份聚合数据
  const memoriesByYear = useMemo(() => {
    const map = new Map<number, Memory[]>();
    for (const m of memories) {
      const y = parseInt(m.date.split('-')[0], 10);
      if (!isNaN(y)) {
        if (!map.has(y)) map.set(y, []);
        map.get(y)!.push(m);
      }
    }
    // 升序排列（最早年份在内圈，最新年份在外圈，符合真实树木年轮生长逻辑）
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [memories]);

  // 2. 按月份聚合当前年份的数据
  const memoriesByMonth = useMemo(() => {
    if (selectedYear === null) return [];
    const map = new Map<number, Memory[]>();
    for (let m = 1; m <= 12; m++) map.set(m, []);

    const yearMemories =
      memoriesByYear.find(([y]) => y === selectedYear)?.[1] || [];
    for (const m of yearMemories) {
      const month = parseInt(m.date.split('-')[1], 10);
      if (map.has(month)) {
        map.get(month)!.push(m);
      }
    }
    return Array.from(map.entries());
  }, [memoriesByYear, selectedYear]);

  // 3. 计算年份年轮环带半径划分
  const yearRingsConfig = useMemo(() => {
    const totalCount = memories.length || 1;
    const minR = 60; // 树心外边缘
    const maxR = 250; // 树皮内边缘
    const availableThickness = maxR - minR;

    let currentInnerR = minR;
    const configs: Array<{
      year: number;
      count: number;
      innerR: number;
      outerR: number;
      color: string;
      fill: string;
      seed: number;
      memories: Memory[];
    }> = [];

    // 为每个年份分配厚度（成正比，保底 35px 厚度）
    const countWeight = memoriesByYear.map(([_, list]) => list.length);
    const sumCount = countWeight.reduce((a, b) => a + b, 0) || 1;

    // 年份色彩阶梯：越早越深沉厚重（树木老材色），越新越鲜亮萌发（嫩黄/苔绿/新阳金）
    const yearColors = [
      { fill: '#EAD9C6', stroke: '#8C6648', active: '#D8BEA3' }, // 2024 等老轮
      { fill: '#E0E7DC', stroke: '#4D6B42', active: '#C8D6C0' }, // 2025 苔绿年轮
      { fill: '#FBF2D5', stroke: '#B28228', active: '#F5E2A8' }, // 2026 暖阳金年轮
      { fill: '#FCE7DF', stroke: '#B8563B', active: '#F7CCA0' }, // 后续朱阳年轮
    ];

    memoriesByYear.forEach(([year, list], index) => {
      const weight = list.length / sumCount;
      const thickness = Math.max(38, weight * availableThickness);
      const outerR = Math.min(maxR, currentInnerR + thickness);
      const palette = yearColors[index % yearColors.length];

      configs.push({
        year,
        count: list.length,
        innerR: currentInnerR,
        outerR,
        color: palette.stroke,
        fill: palette.fill,
        seed: index * 7 + 3,
        memories: list,
      });

      currentInnerR = outerR + 4; // 留 4px 纸间微缝
    });

    return configs;
  }, [memories, memoriesByYear]);

  const cx = 300;
  const cy = 300;

  return (
    <div className="relative w-full max-w-[580px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* 2.5D CSS 3D 透视舞台容器 */}
      <div className="w-full h-full relative perspective-stage flex items-center justify-center">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          <defs>
            {/* 年轮纸雕微阴影滤镜 */}
            <filter id="ringShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow
                dx="1"
                dy="3"
                stdDeviation="3"
                floodColor="#3A2818"
                floodOpacity="0.18"
              />
            </filter>
            <filter
              id="activeRingGlow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="6"
                floodColor="#38662F"
                floodOpacity="0.3"
              />
            </filter>
          </defs>

          {/* ================= 1. 最外层：树皮层 (Bark Layer) ================= */}
          <g className="bark-layer">
            {/* 树皮深棕糙纸 */}
            <path
              d={getOrganicCirclePath(cx, cy, 275, 5, 42)}
              fill="#523924"
              stroke="#382516"
              strokeWidth="4"
            />
            {/* 树皮内韧皮层浅棕纸片 */}
            <path
              d={getOrganicCirclePath(cx, cy, 260, 4, 18)}
              fill="#7A5636"
              stroke="#543B23"
              strokeWidth="2"
            />
            {/* 形成木质部边缘底纸 */}
            <path
              d={getOrganicCirclePath(cx, cy, 252, 3, 9)}
              fill="#D4C2A9"
              filter="url(#ringShadow)"
            />
          </g>

          {/* ================= 2. 年轮环带层 (根据视图层级渲染) ================= */}

          {/* ---------- 视图 A：年份层 (未选年份时，展示所有年份同心圈) ---------- */}
          {selectedYear === null && (
            <g className="year-rings">
              {yearRingsConfig.map((ring, idx) => {
                const isHovered = hoveredRingKey === `year_${ring.year}`;
                const annulusD = getOrganicAnnulusPath(
                  cx,
                  cy,
                  ring.outerR,
                  ring.innerR,
                  ring.seed
                );
                const midR = (ring.innerR + ring.outerR) / 2;

                return (
                  <motion.g
                    key={ring.year}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredRingKey(`year_${ring.year}`)}
                    onMouseLeave={() => setHoveredRingKey(null)}
                    onClick={() => onSelectYear(ring.year)}
                  >
                    {/* 纸片投下的阴影副本 */}
                    <path
                      d={annulusD}
                      fill={ring.fill}
                      fillRule="evenodd"
                      stroke={isHovered ? '#38662F' : ring.color}
                      strokeWidth={isHovered ? '2.5' : '1.5'}
                      filter={
                        isHovered
                          ? 'url(#activeRingGlow)'
                          : 'url(#ringShadow)'
                      }
                      className="transition-all duration-200"
                    />

                    {/* 年轮环内微细生长刻线 (两三圈更细的手工剪刻线) */}
                    <path
                      d={getOrganicCirclePath(cx, cy, midR, 2, ring.seed + 2)}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth="0.7"
                      strokeDasharray="4 3"
                      opacity={0.4}
                    />

                    {/* 年份文字标签与记录数徽章 (放置在正上方环带中) */}
                    <g
                      transform={`translate(${cx}, ${cy - midR})`}
                      className="pointer-events-none"
                    >
                      <rect
                        x="-48"
                        y="-12"
                        width="96"
                        height="24"
                        rx="12"
                        fill="#FAF7EE"
                        stroke={isHovered ? '#38662F' : ring.color}
                        strokeWidth="1"
                        className="shadow-xs"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#3B2D25"
                        fontSize="11"
                        fontWeight="bold"
                        className="font-wenkai"
                      >
                        {ring.year}年 · {ring.count}圈
                      </text>
                    </g>
                  </motion.g>
                );
              })}
            </g>
          )}

          {/* ---------- 视图 B：月份层 (选定年份后展开该年 12 个月轮) ---------- */}
          {selectedYear !== null && selectedMonth === null && (
            <g className="month-rings">
              {/* 底层年份光晕水洗底纸 */}
              <circle
                cx={cx}
                cy={cy}
                r={245}
                fill="#F7F1E4"
                stroke="#C7B298"
                strokeWidth="1.5"
              />

              {/* 渲染 12 个月份的同心月度纸圈 */}
              {memoriesByMonth.map(([month, list], index) => {
                const innerR = 60 + index * 15;
                const outerR = innerR + 13;
                const midR = (innerR + outerR) / 2;
                const hasMemories = list.length > 0;
                const isHovered = hoveredRingKey === `month_${month}`;

                return (
                  <g
                    key={month}
                    className={
                      hasMemories ? 'cursor-pointer' : 'cursor-default'
                    }
                    onMouseEnter={() =>
                      hasMemories && setHoveredRingKey(`month_${month}`)
                    }
                    onMouseLeave={() => setHoveredRingKey(null)}
                    onClick={() => hasMemories && onSelectMonth(month)}
                  >
                    {/* 月份同心纸圈 */}
                    <path
                      d={getOrganicAnnulusPath(
                        cx,
                        cy,
                        outerR,
                        innerR,
                        month * 3
                      )}
                      fillRule="evenodd"
                      fill={
                        hasMemories
                          ? isHovered
                            ? '#E5EFE3'
                            : '#FAF4E8'
                          : '#F2ECE0'
                      }
                      stroke={
                        hasMemories
                          ? isHovered
                            ? '#38662F'
                            : '#8C6648'
                          : '#D9CDB8'
                      }
                      strokeWidth={hasMemories ? (isHovered ? 2 : 1.2) : 0.6}
                      filter={
                        hasMemories
                          ? isHovered
                            ? 'url(#activeRingGlow)'
                            : 'url(#ringShadow)'
                          : undefined
                      }
                    />

                    {/* 如果该月份有记忆，环上标注纸芽徽标 */}
                    {hasMemories && (
                      <g
                        transform={`translate(${cx + midR * 0.86}, ${
                          cy - midR * 0.5
                        })`}
                        className="pointer-events-none"
                      >
                        <circle
                          r="10"
                          fill="#38662F"
                          stroke="#FAF7EE"
                          strokeWidth="2"
                        />
                        <text
                          y="3.5"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          {list.length}
                        </text>
                      </g>
                    )}

                    {/* 环内月份文本 (位于右侧) */}
                    <text
                      x={cx + 12}
                      y={cy - midR + 4}
                      fill={hasMemories ? '#3B2D25' : '#B39B88'}
                      fontSize="9"
                      fontWeight={hasMemories ? 'bold' : 'normal'}
                      className="font-wenkai pointer-events-none"
                    >
                      {month}月 {hasMemories ? `(${list.length}条)` : ''}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ---------- 视图 C：日/条目层 (选定月份后，展示具体记忆纸芽) ---------- */}
          {selectedYear !== null && selectedMonth !== null && (
            <g className="entry-rings">
              {/* 底层展开的大纸叶 */}
              <circle
                cx={cx}
                cy={cy}
                r={245}
                fill="#F9F6ED"
                stroke="#38662F"
                strokeWidth="2"
                strokeDasharray="6 3"
              />

              {/* 取出该选定月份的所有条目 */}
              {(() => {
                const currentMonthList =
                  memoriesByMonth.find(([m]) => m === selectedMonth)?.[1] ||
                  [];

                if (currentMonthList.length === 0) {
                  return (
                    <text
                      x={cx}
                      y={cy + 100}
                      textAnchor="middle"
                      fill="#8C6648"
                      fontSize="13"
                    >
                      本月尚无记录，在篝火旁聊聊吧
                    </text>
                  );
                }

                // 将该月的条目环形均匀排布在年轮上
                const count = currentMonthList.length;
                const ringRadius = 160;

                return currentMonthList.map((mem, idx) => {
                  const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
                  const itemX = cx + Math.cos(angle) * ringRadius;
                  const itemY = cy + Math.sin(angle) * ringRadius;
                  const isHovered = hoveredRingKey === `mem_${mem.id}`;

                  return (
                    <motion.g
                      key={mem.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.08, type: 'spring' }}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRingKey(`mem_${mem.id}`)}
                      onMouseLeave={() => setHoveredRingKey(null)}
                      onClick={() => onSelectMemory(mem)}
                    >
                      {/* 从中心引向各条目的金色木质纤维细线 */}
                      <line
                        x1={cx}
                        y1={cy}
                        x2={itemX}
                        y2={itemY}
                        stroke="#B89F82"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />

                      {/* 记忆纸片气泡 */}
                      <g transform={`translate(${itemX}, ${itemY})`}>
                        {/* 气泡底板 */}
                        <rect
                          x="-65"
                          y="-24"
                          width="130"
                          height="48"
                          rx="16"
                          fill={isHovered ? '#FAF7EE' : '#FFFFFF'}
                          stroke={isHovered ? '#38662F' : '#D9CDB8'}
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          filter="url(#ringShadow)"
                          className="transition-all"
                        />

                        {/* 日期小字 */}
                        <text
                          x="-52"
                          y="-6"
                          fill="#8C6648"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          {mem.date.slice(5)}
                        </text>

                        {/* 标题 */}
                        <text
                          x="-52"
                          y="10"
                          fill="#3B2D25"
                          fontSize="10"
                          fontWeight="bold"
                          className="font-wenkai"
                        >
                          {mem.title.length > 8
                            ? mem.title.slice(0, 7) + '…'
                            : mem.title}
                        </text>

                        {/* 晴雨指示点 */}
                        <circle
                          cx="48"
                          cy="0"
                          r="8"
                          fill={
                            (mem.moodAfter || 5) >= 7
                              ? '#E5EFE3'
                              : '#FFF0E6'
                          }
                          stroke={
                            (mem.moodAfter || 5) >= 7
                              ? '#38662F'
                              : '#C84630'
                          }
                          strokeWidth="1"
                        />
                        <text
                          x="48"
                          y="3"
                          textAnchor="middle"
                          fontSize="8"
                        >
                          {(mem.moodAfter || 5) >= 7 ? '☀️' : '🌱'}
                        </text>
                      </g>
                    </motion.g>
                  );
                });
              })()}
            </g>
          )}

          {/* ================= 3. 最中心：古树心材与幼苗 (Heartwood Center) ================= */}
          <g
            className="heartwood-center cursor-pointer"
            onClick={() => {
              if (selectedMonth !== null) {
                onSelectMonth(selectedMonth);
              } else if (selectedYear !== null) {
                // 点击中心重置回顶层
                onSelectYear(selectedYear);
              }
            }}
          >
            {/* 最内圈纸雕升高阴影 */}
            <circle
              cx={cx}
              cy={cy}
              r={52}
              fill="#C8A882"
              filter="url(#ringShadow)"
            />
            <path
              d={getOrganicCirclePath(cx, cy, 46, 2, 7)}
              fill="#EFE4CF"
              stroke="#8C6648"
              strokeWidth="2"
            />
            {/* 树心年轮萌发纸芽 */}
            <g transform={`translate(${cx}, ${cy})`}>
              <circle r="18" fill="#38662F" />
              {/* 双片嫩叶剪纸 */}
              <path
                d="M 0 10 Q -10 -4 0 -12 Q 10 -4 0 10 Z"
                fill="#8CB37C"
              />
              <path
                d="M 0 10 Q -6 -2 0 -8 Q 6 -2 0 10 Z"
                fill="#E5EFE3"
              />
            </g>

            {/* 古树「岁岁」名字标签 */}
            <text
              x={cx}
              y={cy + 34}
              textAnchor="middle"
              fill="#5C3E28"
              fontSize="10"
              fontWeight="bold"
              className="font-wenkai pointer-events-none"
            >
              岁岁之芯
            </text>
          </g>
        </svg>

        {/* 悬停环带时的浮动即时解忧小提示 */}
        {hoveredRingKey && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-[#38662F]/30 text-xs text-[#2F5927] font-semibold pointer-events-none shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#38662F]" />
            <span>点击展开这圈纸雕年轮</span>
          </div>
        )}
      </div>
    </div>
  );
};
