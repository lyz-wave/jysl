'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TreePine,
  Layers,
  Heart,
  Shield,
  ArrowRight,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { PaperButton } from '@/components/paper/PaperButton';
import { PaperTexture } from '@/components/paper/PaperTexture';
import { ANIMALS } from '@/lib/animals';

export default function HomePage() {
  const animalsList = Object.values(ANIMALS);

  return (
    <main className="min-h-screen bg-[#FAF7EE] text-[#4D3524] relative overflow-hidden flex flex-col justify-between">
      <PaperTexture opacity={0.35} />

      {/* 顶部简易品牌条 */}
      <header className="max-w-5xl mx-auto w-full px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E5EFE3] border border-[#38662F]/30 flex items-center justify-center text-xl shadow-sm">
            🌳
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-[#3B2D25]">
              解忧森林
            </h1>
            <p className="text-xs text-[#7A583E]">释放情绪 · 转变思维 · 沉淀成长</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/rings">
            <PaperButton
              variant="secondary"
              size="sm"
              icon={<TreePine className="w-4 h-4 text-[#38662F]" />}
            >
              古树年轮
            </PaperButton>
          </Link>
          <Link href="/styleguide">
            <PaperButton variant="outline" size="sm" icon={<Compass className="w-4 h-4" />}>
              风格沙盒
            </PaperButton>
          </Link>
          <Link href="/forest">
            <PaperButton variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              进入森林
            </PaperButton>
          </Link>
        </div>
      </header>

      {/* Hero 区域：温暖纸艺书本视觉 */}
      <section className="max-w-5xl mx-auto w-full px-6 py-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5EFE3] text-[#2F5927] text-xs font-semibold mb-6 border border-[#38662F]/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#38662F]" />
            <span>阶段三完成 · 2.5D纸雕年轮三级画卷与成长记忆沉淀已就绪</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#3B2D25] leading-tight mb-5">
            在纯手工质感的剪纸森林里，
            <br />
            遇见倾听你的 7 只动物伙伴
          </h2>

          <p className="text-base sm:text-lg text-[#7A583E] leading-relaxed mb-8">
            像翻开一本立体的纸雕故事书，古树守护着每一寸年轮。
            <br className="hidden sm:inline" />
            没有说教，不加评判，每一声微小的烦恼，都会被温柔接住。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/forest">
              <PaperButton
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                className="shadow-md px-8 text-base"
              >
                🍃 踏入解忧森林（开启完整体验）
              </PaperButton>
            </Link>
            <Link href="/rings">
              <PaperButton
                variant="secondary"
                size="lg"
                icon={<TreePine className="w-5 h-5 text-[#38662F]" />}
              >
                🌳 岁岁的年轮画卷
              </PaperButton>
            </Link>
            <Link href="/styleguide">
              <PaperButton variant="outline" size="lg" icon={<Compass className="w-5 h-5" />}>
                风格沙盒
              </PaperButton>
            </Link>
          </div>
        </motion.div>

        {/* 7 只动物角色长廊卡片 */}
        <div className="mt-14 w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-left">
          {animalsList.map((animal) => (
            <motion.div
              key={animal.id}
              whileHover={{ y: -4 }}
              className="p-3.5 rounded-2xl bg-white/70 border border-[#E8DEC8] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[#3B2D25]">
                    {animal.name}
                  </span>
                  <span className="text-xs text-[#8A6A4E]">{animal.gameName}</span>
                </div>
                <div className="text-[11px] text-[#38662F] font-semibold mb-2">
                  {animal.mindset}
                </div>
              </div>
              <div className="text-[10px] text-[#A6886E] border-t border-[#F0E8DC] pt-1.5">
                {animal.psychology}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 四阶段交付路线说明 */}
      <section
        id="roadmap"
        className="max-w-5xl mx-auto w-full px-6 py-10 border-t border-[#E8DEC8]/80"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#3B2D25] flex items-center gap-2">
            <TreePine className="w-5 h-5 text-[#38662F]" />
            项目四阶段开发进度
          </h3>
          <span className="text-xs text-[#7A583E]">当前：阶段二（森林与圆桌）已完成</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              phase: '阶段 1',
              title: '风格样板页',
              status: '已交付',
              desc: '6层2.5D纸雕、两脚钉纸偶、四时光影、视差陀螺仪与立纸卡。',
              done: true,
            },
            {
              phase: '阶段 2（当前）',
              title: '森林场景与倾诉圆桌',
              status: '已交付，可演示',
              desc: '7个情绪释放小游戏、伙伴召集动画、Claude API 圆桌接龙发言与古树总结。',
              done: true,
            },
            {
              phase: '阶段 3',
              title: '成长年轮三级画卷',
              status: '待开始',
              desc: '年/月/日等高线纸雕分层展开、思维转变卡片、演示假数据一键生成。',
              done: false,
            },
            {
              phase: '阶段 4',
              title: '记忆唤醒与安全兜底',
              status: '待开始',
              desc: 'Haiku 历史记忆双层比对飘落叶、危机干预无条件熔断、纸音与全端打磨。',
              done: false,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                item.done
                  ? 'bg-[#E5EFE3]/80 border-[#38662F] shadow-sm'
                  : 'bg-white/50 border-[#E8DEC8] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#38662F]">
                  {item.phase}
                </span>
                {item.done && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <h4 className="font-bold text-sm text-[#3B2D25] mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-[#7A583E] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 底部免责声明与版权 */}
      <footer className="border-t border-[#E8DEC8]/80 py-6 text-center text-xs text-[#A6886E] px-4 space-y-1">
        <p>
          解忧森林旨在提供温和的情绪梳理与认知陪伴，不可替代专业心理咨询或医疗诊断。
        </p>
        <p>如遇紧急心理危机，请随时拨打全国心理援助热线 12356（24小时免费）。</p>
      </footer>
    </main>
  );
}
