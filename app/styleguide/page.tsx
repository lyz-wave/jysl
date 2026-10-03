'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Sliders,
  Layers,
  Sparkles,
  Heart,
  RotateCw,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';
import { TimeOfDay, AnimalId, PuppetAnimationMood } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import { SceneStage } from '@/components/scene/SceneStage';
import { PaperTexture } from '@/components/paper/PaperTexture';
import { PaperCard } from '@/components/paper/PaperCard';
import { PaperButton } from '@/components/paper/PaperButton';
import { useFramePerformance } from '@/hooks/useFramePerformance';

export default function StyleGuidePage() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('noon');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalId>('woodpecker');
  const [animalMood, setAnimalMood] = useState<PuppetAnimationMood>('idle');
  const [parallaxStrength, setParallaxStrength] = useState<number>(1.0);
  const [autoDrift, setAutoDrift] = useState<boolean>(true);
  const [textureEnabled, setTextureEnabled] = useState<boolean>(true);
  const [textureOpacity, setTextureOpacity] = useState<number>(0.38);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const { fps } = useFramePerformance();

  const currentAnimal = ANIMALS[selectedAnimal];

  return (
    <main className="min-h-screen bg-[#FAF7EE] text-[#4D3524] relative overflow-x-hidden pb-20">
      {/* 全局纸张噪点纤维层 */}
      <PaperTexture opacity={textureOpacity} enabled={textureEnabled} />

      {/* 顶部标题与导航栏 */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DEC8]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🍃</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3B2D25]">
              解忧森林 · 2.5D 纸雕视觉样板
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#E5EFE3] text-[#38662F] border border-[#38662F]/20">
              阶段一交付
            </span>
          </div>
          <p className="text-sm text-[#7A583E] mt-1">
            层叠纸雕风 · 纯 CSS 3D 透视视差 · 纸偶骨骼定格动画 · 四时光影变幻
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF0DC] text-xs text-[#7A583E] border border-[#E2D2B8]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>实时帧率: {fps} FPS</span>
          </div>
          <Link href="/">
            <PaperButton variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              返回首页
            </PaperButton>
          </Link>
        </div>
      </header>

      {/* 核心工作区：左侧 2.5D 舞台，右侧沙盒控制台 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左侧：2.5D 纸雕主舞台 (占据 7/12 宽度) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative">
            {/* 提示便签 */}
            <div className="absolute top-4 left-4 z-40 px-3 py-1 rounded-full bg-white/80 backdrop-blur text-xs text-[#5C4033] shadow-sm border border-[#E8DEC8] flex items-center gap-1.5 pointer-events-none">
              <Compass className="w-3.5 h-3.5 text-[#38662F]" />
              <span>晃动鼠标体验纸雕层间视差 · 点击动物弹出立体卡</span>
            </div>

            {/* 2.5D 纸雕场景舞台 */}
            <SceneStage
              timeOfDay={timeOfDay}
              showAllAnimals={true}
              selectedAnimal={selectedAnimal}
              animalMood={animalMood}
              parallaxStrength={parallaxStrength}
              autoDrift={autoDrift}
              onAnimalClick={(animalId) => {
                setSelectedAnimal(animalId);
                setIsCardOpen(true);
              }}
            />
          </div>

          {/* 舞台下方说明卡片 */}
          <div className="p-4 rounded-2xl bg-white/60 border border-[#E8DEC8] text-xs text-[#6B513C] leading-relaxed flex items-start gap-3">
            <Info className="w-4 h-4 shrink-0 text-[#38662F] mt-0.5" />
            <div>
              <p className="font-bold text-[#3B2D25] mb-1">
                2.5D 剪纸视差架构说明：
              </p>
              <p>
                舞台共分 6 层纸雕（天空 → 远山 → 远景林海 → 中景古树「岁岁」→ 草地小溪 → 近景蕨叶）。
                每一层均使用纯矢量 SVG 与 translateZ 空间分层，不调用任何重量级 3D 引擎。
                动物身上带两脚钉细节，并以 12fps 定格微抽帧呈现纸偶的温润质感。
              </p>
            </div>
          </div>
        </div>

        {/* 右侧：沙盒控制与材质调校台 (占据 5/12 宽度) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* 控制面板卡片 */}
          <div className="bg-[#FAF7EE] rounded-3xl p-6 border-2 border-[#E8DEC8] shadow-lg flex flex-col gap-6">
            {/* 1. 四时光影切换 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[#3B2D25] flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  四时光影与色温
                </span>
                <span className="text-xs text-[#7A583E]">
                  {timeOfDay === 'dawn' && '07:00 清晨'}
                  {timeOfDay === 'noon' && '12:00 正午'}
                  {timeOfDay === 'dusk' && '18:00 黄昏'}
                  {timeOfDay === 'night' && '23:00 夜晚'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'dawn', name: '清晨', icon: Sunrise },
                  { id: 'noon', name: '正午', icon: Sun },
                  { id: 'dusk', name: '黄昏', icon: Sunset },
                  { id: 'night', name: '夜晚', icon: Moon },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = timeOfDay === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTimeOfDay(item.id as TimeOfDay)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#E5EFE3] text-[#2F5927] border-[#38662F] shadow-sm font-bold scale-[1.02]'
                          : 'bg-white/80 hover:bg-white text-[#7A583E] border-[#E8DEC8]'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 纸偶动物与思维方式 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[#3B2D25] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  纸偶角色（两脚钉骨骼）
                </span>
                <span className="text-xs text-[#38662F] font-medium">
                  {currentAnimal.title}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setSelectedAnimal('woodpecker')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedAnimal === 'woodpecker'
                      ? 'bg-[#E5EFE3] border-[#38662F] text-[#2F5927] shadow-sm'
                      : 'bg-white/70 hover:bg-white border-[#E8DEC8] text-[#5C4033]'
                  }`}
                >
                  <div className="font-bold text-sm">笃笃 · 啄木鸟</div>
                  <div className="text-xs opacity-80 mt-0.5">情绪觉察 (标注)</div>
                </button>
                <button
                  onClick={() => setSelectedAnimal('bear')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedAnimal === 'bear'
                      ? 'bg-[#E5EFE3] border-[#38662F] text-[#2F5927] shadow-sm'
                      : 'bg-white/70 hover:bg-white border-[#E8DEC8] text-[#5C4033]'
                  }`}
                >
                  <div className="font-bold text-sm">团团 · 大棕熊</div>
                  <div className="text-xs opacity-80 mt-0.5">自我关怀 (抱抱)</div>
                </button>
              </div>

              {/* 7 只动物全量卡片切换 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                {(
                  [
                    ['woodpecker', '笃笃 · 啄木鸟', '情绪觉察'],
                    ['bear', '团团 · 棕熊', '自我关怀'],
                    ['owl', '墨墨 · 猫头鹰', '理性分析'],
                    ['fox', '阿橘 · 狐狸', '认知重构'],
                    ['turtle', '慢慢 · 乌龟', '时间视角'],
                    ['otter', '漂漂 · 小野鸭', '认知解离'],
                    ['squirrel', '跳跳 · 松鼠', '行为拆解'],
                  ] as const
                ).map(([id, label, mindset]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedAnimal(id as AnimalId);
                      setAnimalMood('idle');
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedAnimal === id
                        ? 'bg-[#E5EFE3] border-[#38662F] text-[#2F5927] shadow-xs font-bold scale-[1.02]'
                        : 'bg-white/70 hover:bg-white border-[#E8DEC8] text-[#5C4033]'
                    }`}
                  >
                    <div className="text-xs truncate">{label}</div>
                    <div className="text-[10px] opacity-75 font-normal">{mindset}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 纸偶肢体动作与情绪触发 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#3B2D25] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  纸偶大幅度动作触发
                </span>
                <span className="text-xs text-[#7A583E]">高区分度关节形变</span>
              </div>

              {/* 专属招牌大动作快捷键 */}
              {selectedAnimal === 'woodpecker' && (
                <div className="mb-2">
                  <button
                    onClick={() => setAnimalMood('peck')}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      animalMood === 'peck'
                        ? 'bg-[#D43827] text-white border-[#9E2012] shadow-sm animate-pulse'
                        : 'bg-[#FFF3E8] hover:bg-[#FFE6D4] text-[#B83218] border-[#E8C2B0]'
                    }`}
                  >
                    <span>🔨 触发笃笃招牌动作：高频快速啄树（敲树洞释放压力）</span>
                  </button>
                </div>
              )}

              {selectedAnimal === 'bear' && (
                <div className="mb-2">
                  <button
                    onClick={() => setAnimalMood('hug')}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      animalMood === 'hug'
                        ? 'bg-[#6B4931] text-white border-[#4A301E] shadow-sm animate-pulse'
                        : 'bg-[#F5ECE3] hover:bg-[#EFE2D4] text-[#5A3820] border-[#D9C4B2]'
                    }`}
                  >
                    <span>🫂 触发团团招牌动作：大开合双臂环抱（大熊抱温情安抚）</span>
                  </button>
                </div>
              )}

              {selectedAnimal === 'otter' && (
                <div className="mb-2">
                  <button
                    onClick={() => setAnimalMood('paddle')}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      animalMood === 'paddle'
                        ? 'bg-[#2B5844] text-white border-[#183628] shadow-sm animate-pulse'
                        : 'bg-[#EBF5EF] hover:bg-[#DDEFE4] text-[#1E4534] border-[#B9DEC7]'
                    }`}
                  >
                    <span>🦆 触发漂漂招牌动作：浮水探首戏水（羽毛不沾水，念头随流走）</span>
                  </button>
                </div>
              )}

              {/* 常用通用动作网格 */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'idle', label: '待机呼吸', desc: '12fps节律' },
                  { id: 'nod', label: '大幅颔首', desc: '深度赞同' },
                  { id: 'gentle', label: '温柔偏头', desc: '倾听抚慰' },
                  { id: 'surprised', label: '受惊腾空', desc: '大弹簧回弹' },
                  { id: 'playful', label: '灵动俏皮', desc: '大幅摆尾' },
                  { id: 'thinking', label: '深沉托腮', desc: '歪头沉思' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAnimalMood(m.id as PuppetAnimationMood)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      animalMood === m.id
                        ? 'bg-[#FAF0DC] text-[#7A583E] border-[#D4AF37] font-bold shadow-sm scale-[1.02]'
                        : 'bg-white/70 hover:bg-white border-[#E8DEC8] text-[#7A583E]'
                    }`}
                  >
                    <div className="text-xs">{m.label}</div>
                    <div className="text-[10px] opacity-70 font-normal">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. 视差阻尼与漂移控制 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#3B2D25] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  视差深度强度
                </span>
                <span className="text-xs text-[#7A583E]">
                  {(parallaxStrength * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={parallaxStrength}
                onChange={(e) => setParallaxStrength(parseFloat(e.target.value))}
                className="w-full accent-[#38662F] cursor-pointer"
              />
              <div className="flex items-center justify-between mt-2.5">
                <label className="text-xs text-[#6B513C] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDrift}
                    onChange={(e) => setAutoDrift(e.target.checked)}
                    className="accent-[#38662F] rounded"
                  />
                  <span>开启静止时的微幅正弦呼吸漂移</span>
                </label>
              </div>
            </div>

            {/* 5. 纸张肌理质感调节 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#3B2D25] flex items-center gap-1.5">
                  <RotateCw className="w-4 h-4 text-stone-600" />
                  SVG feTurbulence 纸纤维噪点
                </span>
                <span className="text-xs text-[#7A583E]">
                  {textureEnabled ? `${(textureOpacity * 100).toFixed(0)}% 浓度` : '已关闭'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTextureEnabled(!textureEnabled)}
                  className={`px-3 py-1 text-xs rounded-xl border transition-colors ${
                    textureEnabled
                      ? 'bg-[#E5EFE3] text-[#38662F] border-[#38662F]'
                      : 'bg-white text-stone-500 border-stone-300'
                  }`}
                >
                  {textureEnabled ? '质感开启' : '质感关闭'}
                </button>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={textureOpacity}
                  disabled={!textureEnabled}
                  onChange={(e) => setTextureOpacity(parseFloat(e.target.value))}
                  className="flex-1 accent-[#38662F] cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* 6. 立体书弹起交互测试 */}
            <div className="pt-2 border-t border-[#E8DEC8]">
              <PaperButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setIsCardOpen(true)}
                icon={<Heart className="w-4 h-4" />}
              >
                测试立体书卡片弹出动画 (Pop-up Book)
              </PaperButton>
            </div>
          </div>
        </div>
      </section>

      {/* 立体书折叠弹出的角色介绍卡片 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        {isCardOpen && (
          <div
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs pointer-events-auto"
            onClick={() => setIsCardOpen(false)}
          />
        )}
        <div className="relative pointer-events-auto w-full max-w-md perspective-stage">
          <PaperCard
            isOpen={isCardOpen}
            onClose={() => setIsCardOpen(false)}
            title={currentAnimal.name}
            subtitle={currentAnimal.mindset}
            tag={currentAnimal.psychology}
          >
            <div className="space-y-4 text-sm">
              <div className="p-3.5 rounded-xl bg-white/70 border border-[#E8DEC8] space-y-1.5">
                <div className="text-xs font-bold text-[#3B2D25] flex items-center gap-1.5">
                  <span>🍃 专属释放小游戏：</span>
                  <span className="text-[#38662F] font-extrabold">
                    {currentAnimal.gameName}
                  </span>
                </div>
                <p className="text-xs text-[#7A583E] leading-relaxed">
                  {currentAnimal.gameSummary}
                </p>
              </div>

              <div className="text-xs text-[#6B513C] leading-relaxed">
                <span className="font-bold">语气风格：</span>
                {currentAnimal.tone}
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <PaperButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCardOpen(false)}
                >
                  合上立体卡
                </PaperButton>
                <PaperButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setAnimalMood('playful');
                    setIsCardOpen(false);
                  }}
                >
                  和它打招呼
                </PaperButton>
              </div>
            </div>
          </PaperCard>
        </div>
      </div>
    </main>
  );
}
