'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AnimalId, PuppetAnimationMood, Speaker, TimeOfDay } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import { PuppetRenderer } from '../animals/PuppetRenderer';
import { RangerPuppet } from '../animals/RangerPuppet';
import { BonfireCamp } from '../scene/BonfireCamp';

interface GatheringCircleProps {
  timeOfDay: TimeOfDay;
  activeSpeaker?: Speaker | null;
  animalMoods: Record<AnimalId, PuppetAnimationMood>;
  isUserTyping?: boolean;
  onAnimalClick?: (speaker: Speaker) => void;
}

interface CampfireCircleSeat {
  id: AnimalId;
  label: string;
  leftPercent: number; // 0-100% 椭圆水平百分比
  topPercent: number;  // 0-100% 椭圆垂直百分比
  facing: 1 | -1;      // 朝向中央篝火 (1 = 朝右, -1 = 朝左)
  scale: number;
  zIndex: number;
  perchType: 'stump' | 'stone' | 'log' | 'moss' | 'water';
}

// 围绕中央篝火形成的真实 360° 椭圆纵深座次（绝非横排单列）
// 中心篝火位于 (50%, 48%)
const CIRCLE_SEATS: CampfireCircleSeat[] = [
  // 10:30 (后左方，树桩上，朝向右下方篝火)
  { id: 'woodpecker', label: '笃笃', leftPercent: 26, topPercent: 23, facing: 1, scale: 0.82, zIndex: 14, perchType: 'stump' },
  // 1:30 (后右方，青石上，朝向左下方篝火)
  { id: 'owl', label: '墨墨', leftPercent: 74, topPercent: 23, facing: -1, scale: 0.84, zIndex: 14, perchType: 'stone' },
  // 9:00 (正左翼，松针席上，朝向正右方篝火)
  { id: 'bear', label: '团团', leftPercent: 14, topPercent: 47, facing: 1, scale: 0.98, zIndex: 22, perchType: 'moss' },
  // 3:00 (正右翼，花草斜坡，朝向正左方篝火)
  { id: 'fox', label: '阿橘', leftPercent: 86, topPercent: 47, facing: -1, scale: 0.92, zIndex: 22, perchType: 'moss' },
  // 7:30 (前左方，平缓溪石，朝向右上方篝火)
  { id: 'turtle', label: '慢慢', leftPercent: 28, topPercent: 71, facing: 1, scale: 0.90, zIndex: 28, perchType: 'stone' },
  // 4:30 (前右方，草地草垫，朝向左上方篝火)
  { id: 'squirrel', label: '跳跳', leftPercent: 72, topPercent: 71, facing: -1, scale: 0.84, zIndex: 28, perchType: 'moss' },
  // 6:00 (正前沿，溪流泉眼叶舟，朝向上方篝火)
  { id: 'otter', label: '漂漂', leftPercent: 50, topPercent: 78, facing: 1, scale: 0.86, zIndex: 30, perchType: 'water' },
];

export const GatheringCircle: React.FC<GatheringCircleProps> = ({
  timeOfDay,
  activeSpeaker,
  animalMoods,
  isUserTyping = false,
  onAnimalClick,
}) => {
  const isRangerSpeaking = activeSpeaker === 'ranger' || activeSpeaker === 'tree';

  return (
    <div className="relative w-full max-w-4xl h-[460px] sm:h-[500px] md:h-[540px] mx-auto rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(15,25,20,0.35)] border-2 border-[#1E3A2B] select-none bg-[#0D1C15]">
      {/* ================= 1. 森林夜幕背景图层 ================= */}
      {/* 渐变夜空 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #091510 0%, #11231a 32%, #193627 65%, #224634 100%)',
        }}
      />

      {/* 闪烁剪纸繁星 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" aria-hidden="true">
        {[
          { cx: '12%', cy: '10%', r: 1.6, delay: 0 },
          { cx: '18%', cy: '18%', r: 2.2, delay: 1.1 },
          { cx: '30%', cy: '8%', r: 1.4, delay: 0.5 },
          { cx: '42%', cy: '14%', r: 2.0, delay: 1.7 },
          { cx: '58%', cy: '9%', r: 1.5, delay: 0.8 },
          { cx: '68%', cy: '16%', r: 2.4, delay: 2.1 },
          { cx: '80%', cy: '11%', r: 1.8, delay: 1.3 },
          { cx: '88%', cy: '19%', r: 1.5, delay: 0.3 },
          { cx: '24%', cy: '25%', r: 1.2, delay: 2.5 },
          { cx: '76%', cy: '26%', r: 1.7, delay: 1.9 },
        ].map((star, i) => (
          <motion.circle
            key={i}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="#FFF8DB"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.25, 0.9] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* 右上方剪纸弯月与晕光 */}
      <div className="absolute top-5 right-8 pointer-events-none flex items-center justify-center">
        <div className="absolute w-20 h-20 rounded-full bg-[#FFEAA7]/20 blur-md" />
        <svg viewBox="0 0 60 60" className="w-14 h-14 overflow-visible filter drop-shadow-[0_0_12px_rgba(255,234,167,0.5)]">
          <path
            d="M 38 8 A 24 24 0 1 0 52 46 A 26 26 0 1 1 38 8 Z"
            fill="#FFF4CF"
            stroke="#F5DF9E"
            strokeWidth="1.2"
          />
          {/* 月面微暗剪纸纹理 */}
          <circle cx="26" cy="30" r="3" fill="#E8D18C" opacity="0.35" />
          <circle cx="34" cy="38" r="2" fill="#E8D18C" opacity="0.3" />
        </svg>
      </div>

      {/* 顶部古树遮顶枝桠与传统镂空松针叶层 */}
      <div className="absolute top-0 inset-x-0 h-32 pointer-events-none overflow-hidden z-5">
        <svg viewBox="0 0 1000 160" preserveAspectRatio="none" className="w-full h-full">
          {/* 左侧延展苍翠树冠 */}
          <path
            d="M -40 -20 Q 180 -10 320 60 Q 220 85 100 65 Q 40 100 -40 80 Z"
            fill="#163826"
            opacity="0.95"
          />
          <path
            d="M -20 -10 Q 140 20 250 80 Q 150 95 60 80 Q 0 110 -30 90 Z"
            fill="#214A34"
          />
          {/* 右侧延展苍翠树冠 */}
          <path
            d="M 1040 -20 Q 820 -10 680 60 Q 780 85 900 65 Q 960 100 1040 80 Z"
            fill="#163826"
            opacity="0.95"
          />
          <path
            d="M 1020 -10 Q 860 20 750 80 Q 850 95 940 80 Q 1000 110 1030 90 Z"
            fill="#214A34"
          />
          {/* 枝桠镂空星孔与月牙纹 */}
          <circle cx="120" cy="40" r="3.5" fill="#0D1C15" />
          <circle cx="140" cy="48" r="2.5" fill="#0D1C15" />
          <circle cx="860" cy="40" r="3.5" fill="#0D1C15" />
          <circle cx="840" cy="48" r="2.5" fill="#0D1C15" />
        </svg>

        {/* 悬挂于枝桠上的暖光纸马灯（左侧与右侧轻摇） */}
        <motion.div
          animate={{ rotate: [-2.5, 2.5, -2.5] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[13%] top-0 origin-top flex flex-col items-center pointer-events-none"
        >
          <div className="w-0.5 h-10 bg-[#8C6D4A]" />
          <div className="w-6 h-8 rounded-lg bg-[#FFD57E] border border-[#B38743] shadow-[0_0_16px_rgba(255,213,126,0.7)] flex items-center justify-center">
            <div className="w-2.5 h-4 bg-white/90 rounded-full blur-[0.5px]" />
          </div>
        </motion.div>

        <motion.div
          animate={{ rotate: [2.5, -2.5, 2.5] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[16%] top-0 origin-top flex flex-col items-center pointer-events-none"
        >
          <div className="w-0.5 h-14 bg-[#8C6D4A]" />
          <div className="w-6 h-8 rounded-lg bg-[#FFD57E] border border-[#B38743] shadow-[0_0_16px_rgba(255,213,126,0.7)] flex items-center justify-center">
            <div className="w-2.5 h-4 bg-white/90 rounded-full blur-[0.5px]" />
          </div>
        </motion.div>
      </div>

      {/* 远山与深林剪纸剪影 */}
      <div className="absolute bottom-[44%] inset-x-0 h-28 pointer-events-none opacity-45">
        <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M 0 120 L 0 50 Q 150 20 280 60 Q 420 15 560 55 Q 720 10 860 50 Q 940 30 1000 45 L 1000 120 Z"
            fill="#122B1E"
          />
        </svg>
      </div>

      {/* ================= 2. 营地空地草坪与鹅卵石环 ================= */}
      {/* 森林营地地面 (深苔藓色纸雕基底) */}
      <div className="absolute inset-x-0 bottom-0 h-[68%] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(180deg, #1C3D29 0%, #173322 45%, #132A1C 100%)',
          }}
        />

        {/* 围在篝火四周的真实大鹅卵石透视环 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed border-[#A8947C]/40"
          style={{
            top: '46%',
            width: '84%',
            height: '76%',
            boxShadow: 'inset 0 0 32px rgba(10, 25, 18, 0.65)',
          }}
        />

        {/* 散落在营地边缘的林间剪纸点缀（小蘑菇、野花、松果） */}
        <div className="absolute left-[8%] bottom-[20%] text-sm opacity-80">🍄</div>
        <div className="absolute left-[20%] bottom-[8%] text-xs opacity-70">🌿</div>
        <div className="absolute right-[12%] bottom-[18%] text-xs opacity-80">🍂</div>
        <div className="absolute right-[22%] bottom-[6%] text-sm opacity-85">🍄</div>
      </div>

      {/* ================= 3. 中央篝火与 360° 扩散暖融火光 ================= */}
      {/* 篝火向四周铺洒的动态脉动暖橙火光 */}
      <motion.div
        animate={{
          scale: [0.98, 1.08, 0.97, 1.05, 0.98],
          opacity: [0.72, 0.96, 0.78, 1, 0.72],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute pointer-events-none z-18 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: '50%',
          top: '48%',
          width: '76%',
          height: '66%',
          background:
            'radial-gradient(ellipse 65% 52% at 50% 50%, rgba(255, 175, 55, 0.44) 0%, rgba(240, 110, 30, 0.22) 42%, rgba(180, 65, 15, 0.08) 68%, transparent 84%)',
        }}
      />

      {/* 升起的微光暖火星与萤火虫 */}
      {[
        { x: '49%', delay: 0 },
        { x: '52%', delay: 0.6 },
        { x: '47%', delay: 1.2 },
        { x: '53%', delay: 1.8 },
      ].map((ember, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-10, -55, -95],
            x: [0, (i % 2 === 0 ? 12 : -12), (i % 2 === 0 ? -8 : 8)],
            opacity: [0, 1, 0],
            scale: [0.6, 1.2, 0.4],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: ember.delay,
            ease: 'easeOut',
          }}
          className="absolute z-25 w-1.5 h-1.5 rounded-full bg-[#FFE875] blur-[0.6px] pointer-events-none"
          style={{ left: ember.x, top: '46%' }}
        />
      ))}

      {/* 正中央常驻剪纸篝火堆 (处于整个椭圆几何正中心) */}
      <div
        className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ left: '50%', top: '48%' }}
      >
        <BonfireCamp isNight={true} />
      </div>

      {/* ================= 4. 围绕篝火成圆圈的 8 位伙伴 ================= */}

      {/* ① 守林人：12:00（正后方高处，坐在原木长凳上，提着马灯、递上热茶，统领全局） */}
      <motion.div
        animate={{
          y: isRangerSpeaking ? -14 : 0,
          scale: isRangerSpeaking ? 1.05 : 0.88,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => onAnimalClick?.('ranger')}
        className="absolute z-12 flex flex-col items-center cursor-pointer transition-all -translate-x-1/2 -translate-y-1/2"
        style={{ left: '50%', top: '15%' }}
      >
        {/* 发言小火苗标签 */}
        {isRangerSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-[#C84630] text-white text-[10px] font-bold shadow-md flex items-center gap-1 whitespace-nowrap animate-bounce z-40"
          >
            <span>🔥</span>
            <span>正在总结</span>
          </motion.div>
        )}

        {/* 发言金黄光环 */}
        {isRangerSpeaking && (
          <div className="absolute -bottom-2 w-28 h-8 rounded-full bg-amber-400/50 blur-xs -z-10 border border-amber-500/60 animate-pulse" />
        )}

        {/* 原木长凳底座 */}
        <div className="absolute -bottom-1 w-24 h-4 rounded-md bg-[#4E3423] border border-[#322014] -z-10 shadow-md" />

        <RangerPuppet
          scale={0.88}
          isSpeaking={isRangerSpeaking}
          mood={isUserTyping ? 'nod' : isRangerSpeaking ? 'gentle' : 'idle'}
        />

        <div
          className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors shadow-xs ${
            isRangerSpeaking
              ? 'bg-[#C84630] text-white border-[#8C2E1D]'
              : 'bg-[#152B20]/90 text-[#F4EBD9] border-[#365A46]'
          }`}
        >
          🌲 守林人
        </div>
      </motion.div>

      {/* ② 其余 7 位动物：沿 360° 椭圆轨道分布，全员面向中央篝火 */}
      {CIRCLE_SEATS.map((seat) => {
        const isSpeaking = activeSpeaker === seat.id;
        const mood = isUserTyping
          ? seat.id === 'bear'
            ? 'gentle'
            : seat.id === 'owl'
            ? 'thinking'
            : 'nod'
          : animalMoods[seat.id] || 'idle';

        return (
          <motion.div
            key={seat.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: isSpeaking ? -14 : 0,
              scale: isSpeaking ? seat.scale * 1.14 : seat.scale,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="absolute flex flex-col items-center cursor-pointer transition-all -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${seat.leftPercent}%`,
              top: `${seat.topPercent}%`,
              zIndex: isSpeaking ? 35 : seat.zIndex,
            }}
            onClick={() => onAnimalClick?.(seat.id)}
          >
            {/* 发言小火苗浮动徽章 */}
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-[#C84630] text-white text-[10px] font-bold shadow-md flex items-center gap-1 whitespace-nowrap animate-bounce z-40"
              >
                <span>🔥</span>
                <span>正在发言</span>
              </motion.div>
            )}

            {/* 发言高亮金黄光环 */}
            {isSpeaking && (
              <motion.div
                layoutId="speaking-glow-ring"
                className="absolute -bottom-2 w-24 h-6 rounded-full bg-amber-400/50 blur-xs -z-10 border border-amber-500/60 animate-pulse"
              />
            )}

            {/* 各动物身下专属环境坐垫 */}
            {seat.perchType === 'stone' && (
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-[#677782] border border-[#44525B] -z-10"
                style={{ boxShadow: '0 2px 6px rgba(10, 20, 15, 0.4)' }}
              />
            )}
            {seat.perchType === 'stump' && (
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-5 rounded-md bg-[#543825] border border-[#341F12] -z-10"
                style={{ boxShadow: '0 2px 6px rgba(10, 20, 15, 0.4)' }}
              />
            )}
            {seat.perchType === 'moss' && (
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-18 h-4 rounded-full bg-[#27482D] border border-[#18311C] -z-10"
                style={{ boxShadow: '0 2px 6px rgba(10, 20, 15, 0.35)' }}
              />
            )}
            {seat.perchType === 'water' && (
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-[#2B5768]/80 border border-[#4C859E]/60 -z-10"
                style={{ boxShadow: '0 0 10px rgba(76, 133, 158, 0.5)' }}
              >
                {/* 漂漂的落叶小舟垫 */}
                <div className="absolute inset-x-2 top-0 h-2 bg-[#709B3E] rounded-full border border-[#4C6D27]" />
              </div>
            )}

            {/* 动物纸偶 (朝向中央篝火，并带有生物呼吸) */}
            <div
              style={{
                transform: `scaleX(${seat.facing})`,
                transformOrigin: 'bottom center',
              }}
            >
              <PuppetRenderer
                animalId={seat.id}
                mood={mood}
                scale={0.76}
                interactive={true}
              />
            </div>

            {/* 动物名牌标签 (正向排版，在夜幕背景下清晰可辨) */}
            <div
              className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors shadow-xs ${
                isSpeaking
                  ? 'bg-[#C84630] text-white border-[#8C2E1D]'
                  : 'bg-[#152B20]/90 text-[#F4EBD9] border-[#365A46]'
              }`}
            >
              {seat.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
