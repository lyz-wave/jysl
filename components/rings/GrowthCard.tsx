'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, AnimalId } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import { PaperButton } from '../paper/PaperButton';
import {
  X,
  Share2,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  ArrowRight,
  Heart,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';

interface GrowthCardProps {
  memory: Memory;
  onClose: () => void;
  onViewDialogue?: (sessionId: string) => void;
}

export const GrowthCard: React.FC<GrowthCardProps> = ({
  memory,
  onClose,
  onViewDialogue,
}) => {
  const [actionDone, setActionDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // 心情晴雨表文案与表情
  const getMoodVisual = (score?: number) => {
    if (score === undefined) return { icon: '🌱', label: '未评' };
    if (score <= 3) return { icon: '🌧️', label: `${score}分·阴雨` };
    if (score <= 6) return { icon: '⛅', label: `${score}分·多云` };
    if (score <= 8) return { icon: '🌤️', label: `${score}分·初晴` };
    return { icon: '☀️', label: `${score}分·晴朗` };
  };

  const beforeVisual = getMoodVisual(memory.moodBefore);
  const afterVisual = getMoodVisual(memory.moodAfter);
  const moodDelta =
    memory.moodBefore !== undefined && memory.moodAfter !== undefined
      ? memory.moodAfter - memory.moodBefore
      : null;

  const handleCopyCard = async () => {
    const textToCopy = `【解忧森林 · 成长年轮】\n📅 日期：${memory.date}\n🌿 悟道：${memory.title}\n💭 转变：${memory.shift.from} ➔ ${memory.shift.to}\n✨ 洞察：${memory.insight}\n🌱 行动：${memory.action || '无'}\n🐾 陪伴伙伴：${memory.helpfulAnimals.map((id) => ANIMALS[id]?.name).join('、')}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 森林暗调毛玻璃半透明背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/45 backdrop-blur-xs transition-all"
      />

      {/* 立体书折起弹出卡片 (以底边为轴 rotateX 展开) - 外部带有机边缘柔和投影 */}
      <motion.div
        initial={{ opacity: 0, rotateX: 65, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
        exit={{ opacity: 0, rotateX: 50, y: 40, scale: 0.92 }}
        transition={{
          type: 'spring',
          damping: 24,
          stiffness: 260,
        }}
        style={{ transformOrigin: 'bottom center', perspective: 1200 }}
        className="relative z-10 w-full max-w-xl max-h-[90vh] drop-shadow-paper-edge flex flex-col my-auto"
      >
        <div className="relative w-full overflow-y-auto rounded-3xl glass-card-paper p-6 sm:p-8 paper-rough-edge text-left space-y-6">
          {/* 顶部镜面反光光扫条 (提升通透晶莹感) */}
          <div className="absolute top-0 inset-x-0 h-36 pointer-events-none bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-3xl" />

          {/* 底部篝火暖光折射层 (温暖的琥珀微光) */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full pointer-events-none bg-amber-500/15 blur-2xl" />

          {/* 卡片顶部：年轮印章与关闭按钮 */}
          <div className="relative z-10 flex items-start justify-between border-b border-white/60 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/18 text-emerald-950 text-xs font-bold border border-emerald-600/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {memory.date}
                </span>
                {memory.themes.map((theme) => (
                  <span
                    key={theme}
                    className="px-2.5 py-1 rounded-full bg-amber-500/18 text-amber-950 text-xs font-semibold border border-amber-600/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]"
                  >
                    {theme}
                  </span>
                ))}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#28180E] pt-1 tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                {memory.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6E472B] hover:text-[#28180E] bg-white/40 hover:bg-white/75 border border-white/70 backdrop-blur-md shadow-xs transition-all cursor-pointer active:scale-95"
              title="收起年轮卡片"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 心情晴雨表前后对比 (透光晶体玻璃子卡片) */}
          {(memory.moodBefore !== undefined || memory.moodAfter !== undefined) && (
            <div className="relative z-10 p-4 rounded-2xl bg-white/45 backdrop-blur-md border border-white/75 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_4px_16px_rgba(60,40,20,0.06)] flex items-center justify-around text-center">
              <div className="space-y-0.5">
                <span className="text-[11px] text-[#7A5438] block font-medium">倾诉前</span>
                <span className="text-sm sm:text-base font-bold text-[#69381E]">
                  {beforeVisual.icon} {beforeVisual.label}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-4 h-4 text-[#2F5927]" />
                {moodDelta !== null && moodDelta > 0 && (
                  <span className="text-[10px] font-bold text-emerald-950 bg-emerald-500/20 border border-emerald-600/35 px-2 py-0.5 rounded-full mt-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
                    +{moodDelta} 舒展
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-[#7A5438] block font-medium">释怀后</span>
                <span className="text-sm sm:text-base font-bold text-[#1B4E17]">
                  {afterVisual.icon} {afterVisual.label}
                </span>
              </div>
            </div>
          )}

          {/* 认知转变对比 (from ... to ...) (双色微霜玻璃并列) */}
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-[#633F23] uppercase tracking-wider flex items-center gap-1.5">
              <span>🍃</span>
              <span>认知的破茧与舒展</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#FFF5EC]/60 backdrop-blur-md border border-[#F0D5C3]/85 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85)] text-[#503422]">
                <span className="text-[11px] font-bold text-[#A3431F] block mb-1">
                  旧念头的紧绷：
                </span>
                <p className="leading-relaxed font-medium">{memory.shift.from}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#EFF8ED]/65 backdrop-blur-md border border-[#C5E6BF]/90 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.9)] text-[#183E15]">
                <span className="text-[11px] font-bold text-[#23601E] block mb-1">
                  新视角的宽阔：
                </span>
                <p className="leading-relaxed font-medium">{memory.shift.to}</p>
              </div>
            </div>
          </div>

          {/* 第一人称深层洞察 (琥珀晨曦微光玻璃) */}
          <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/75 via-white/65 to-amber-50/70 backdrop-blur-md border border-amber-200/90 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_6px_20px_rgba(217,107,67,0.08)] text-[#382110] space-y-1.5">
            <span className="text-xs font-bold text-[#A3431F] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              刻入心头的领悟
            </span>
            <p className="italic leading-relaxed font-bold text-xs sm:text-sm pl-2 border-l-2 border-amber-400/70">
              “{memory.insight}”
            </p>
          </div>

          {/* 切实可行的微小行动 (交互式玻璃按键，可勾选完成) */}
          {memory.action && (
            <div
              onClick={() => setActionDone(!actionDone)}
              className={`relative z-10 p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 text-xs backdrop-blur-md ${
                actionDone
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-[#163F14] shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]'
                  : 'bg-white/55 hover:bg-white/75 border-white/80 text-[#4D3322] shadow-[inset_0_1px_2px_rgba(255,255,255,0.85),0_2px_8px_rgba(60,40,20,0.04)]'
              }`}
            >
              {actionDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#2B6624] shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-[#8C6648] shrink-0" />
              )}
              <div className="flex-1">
                <span className="font-bold block text-[11px] opacity-80">
                  当时许下的微小一步：
                </span>
                <p className={`font-medium ${actionDone ? 'line-through opacity-75' : ''}`}>
                  {memory.action}
                </p>
              </div>
              {actionDone && (
                <span className="text-[10px] bg-[#2B6624] text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                  已践行
                </span>
              )}
            </div>
          )}

          {/* 助力动物伙伴与情绪标签 */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#6E472B] text-[11px] font-medium">助力的伙伴：</span>
              <div className="flex items-center gap-1.5">
                {memory.helpfulAnimals.map((id) => {
                  const a = ANIMALS[id as AnimalId];
                  if (!a) return null;
                  return (
                    <span
                      key={id}
                      title={`${a.name} · ${a.mindset}`}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/60 backdrop-blur-md border border-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] text-[11px] text-[#3D2819] font-medium"
                    >
                      <span>{a.name}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#6E472B]">
              <span>感受轨迹：</span>
              {memory.emotions.map((emo, idx) => (
                <span key={emo} className="font-medium">
                  {emo}
                  {idx < memory.emotions.length - 1 && ' › '}
                </span>
              ))}
            </div>
          </div>

          {/* 底部操作：复制金句 & 重温对话 */}
          <div className="relative z-10 flex items-center justify-between pt-2">
            <button
              onClick={handleCopyCard}
              className="flex items-center gap-1.5 text-xs text-[#5C3C24] hover:text-[#1F541B] px-3 py-1.5 rounded-full bg-white/40 hover:bg-white/70 border border-white/70 backdrop-blur-md shadow-xs transition-all cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1F541B]" />
                  <span className="text-[#1F541B] font-bold">已复制到剪贴板</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制金句卡片</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2.5">
              {onViewDialogue && memory.sessionId && (
                <PaperButton
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDialogue(memory.sessionId)}
                  icon={<BookOpen className="w-3.5 h-3.5" />}
                  className="!bg-white/50 hover:!bg-white/80 !border-white/80 !text-[#4A3220] backdrop-blur-md"
                >
                  重温那次对话
                </PaperButton>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#2B6624] to-[#3E8B34] hover:from-[#21511C] hover:to-[#317329] text-white border border-emerald-300/60 shadow-[0_4px_16px_rgba(43,102,36,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
              >
                收进心底
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
