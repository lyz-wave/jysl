'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AnimalId, PuppetAnimationMood, TimeOfDay, Speaker, Memory } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import { db, saveUserProfile } from '@/lib/db';
import { useForestStore } from '@/lib/store';
import { SceneStage } from '@/components/scene/SceneStage';
import { PaperTexture } from '@/components/paper/PaperTexture';
import { PaperButton } from '@/components/paper/PaperButton';
import { PaperCard } from '@/components/paper/PaperCard';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { GameModal } from '@/components/games/GameModal';
import { PeckerTapHole } from '@/components/games/PeckerTapHole';
import { OwlFactOrGuess } from '@/components/games/OwlFactOrGuess';
import { FoxReframeMirror } from '@/components/games/FoxReframeMirror';
import { BearHug } from '@/components/games/BearHug';
import { TurtleBreathing } from '@/components/games/TurtleBreathing';
import { DuckLeafRaft } from '@/components/games/DuckLeafRaft';
import { SquirrelStashNuts } from '@/components/games/SquirrelStashNuts';
import { MoodRating } from '@/components/dialogue/MoodRating';
import { VoiceInput } from '@/components/dialogue/VoiceInput';
import { GatheringCircle } from '@/components/dialogue/GatheringCircle';
import { RoundtableDialogue } from '@/components/dialogue/RoundtableDialogue';
import { SafetyCrisisModal } from '@/components/dialogue/SafetyCrisisModal';
import { GrowthCard } from '@/components/rings/GrowthCard';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { RingsModal } from '@/components/rings/RingsModal';

export default function ForestPage() {
  const {
    profile,
    loadProfile,
    timeOfDay,
    setTimeOfDay,
    forestStage,
    setForestStage,
    activeGameAnimal,
    openGame,
    closeGame,
    currentSession,
    startNewSession,
    setMoodBefore,
    setMoodAfter,
    addMessage,
    pauseSession,
    resolveSession,
    loadPausedSession,
    animalMoods,
  } = useForestStore();

  const [inspectAnimal, setInspectAnimal] = useState<AnimalId | null>(null);
  const [ventingText, setVentingText] = useState('');
  const [isSubmittingVenting, setIsSubmittingVenting] = useState(false);
  const [hasPausedCheck, setHasPausedCheck] = useState(false);
  const [pausedFound, setPausedFound] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDistilling, setIsDistilling] = useState(false);
  const [distilledMemory, setDistilledMemory] = useState<Memory | null>(null);
  const [showGrowthCardModal, setShowGrowthCardModal] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);
  const [selectedCampfireSpeaker, setSelectedCampfireSpeaker] = useState<Speaker | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRingsModalOpen, setIsRingsModalOpen] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 初始化加载用户 Profile 与检查暂存会话
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!hasPausedCheck && profile?.hasCompletedOnboarding) {
      setHasPausedCheck(true);
      // 检查是否有未完结暂存会话
      loadPausedSession().then((found) => {
        if (found) {
          setPausedFound(true);
        }
      });
    }
  }, [hasPausedCheck, profile, loadPausedSession]);

  // 开始倾诉流程：平滑进入夜幕篝火讨论模式，所有动物围坐成圈
  const handleStartVentingFlow = (targetCompanion?: AnimalId) => {
    const companion = targetCompanion || profile?.companion || 'bear';
    startNewSession(companion);
    setTimeOfDay('night'); // 自动平滑过渡为静谧温暖夜幕
    setForestStage('input'); // 原地呈现篝火输入与发言入口
    setActiveSpeaker(null);
    setSelectedCampfireSpeaker(null);
  };

  // 结束讨论，退出篝火，平滑返回白天漫步
  const handleExitCampfire = () => {
    setForestStage('explore');
    setTimeOfDay('noon'); // 平滑恢复为正午暖阳白昼
    setActiveSpeaker(null);
    setSelectedCampfireSpeaker(null);
    setVentingText('');
  };

  // 释怀后提炼并沉淀为年轮
  const handleDistillAndSave = async (score?: number) => {
    if (!currentSession) return;
    if (score !== undefined) {
      setMoodAfter(score);
    }
    setIsDistilling(true);

    try {
      const userMsg =
        currentSession.messages.find((m) => m.speaker === 'user')?.content ||
        ventingText;
      const res = await fetch('/api/ai/distill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          nickname: profile?.nickname || '旅人',
          userInput: userMsg,
          messages: currentSession.messages,
          moodBefore: currentSession.moodBefore,
          moodAfter: score ?? currentSession.moodAfter ?? 7,
          gameContext: currentSession.gameContext,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const memory: Memory = json.data;
        await db.memories.put(memory);
        setDistilledMemory(memory);
        setShowGrowthCardModal(true);
      }
    } catch (err) {
      console.error('Distill error:', err);
    } finally {
      setIsDistilling(false);
      await resolveSession();
    }
  };

  // 提交倾诉内容
  const handleSubmitVenting = async () => {
    if (!ventingText.trim() || isSubmittingVenting || !currentSession) return;

    const text = ventingText.trim();
    setIsSubmittingVenting(true);

    // 1. 风险检测
    try {
      const safetyRes = await fetch('/api/ai/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: text }),
      });
      const safetyData = await safetyRes.json();
      if (safetyData.level === 'crisis') {
        setIsCrisisModalOpen(true);
        setIsSubmittingVenting(false);
        return;
      }
    } catch (e) {
      console.warn('Safety check skipped:', e);
    }

    // 2. 存入当前会话用户倾诉记录
    addMessage({
      speaker: 'user',
      content: text,
    });

    // 3. 请求圆桌发言
    try {
      const res = await fetch('/api/ai/roundtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: profile?.nickname || '旅人',
          companion: currentSession.companion,
          userInput: text,
          gameContext: currentSession.gameContext,
          moodScore: currentSession.moodBefore,
        }),
      });

      const data = await res.json();
      if (data.data?.speeches) {
        // 依次将动物发言加入消息栈
        for (const sp of data.data.speeches) {
          addMessage({
            speaker: sp.animal,
            content: sp.text,
            mood: sp.mood,
          });
        }
        // 守林人手记总结加入消息栈
        if (data.data.treeSummary) {
          addMessage({
            speaker: 'ranger',
            content: data.data.treeSummary,
          });
        }
        setForestStage('roundtable');
      }
    } catch (err) {
      console.error('Roundtable error:', err);
    } finally {
      setIsSubmittingVenting(false);
      setVentingText('');
    }
  };

  // 渲染具体的小游戏
  const renderMiniGame = () => {
    switch (activeGameAnimal) {
      case 'woodpecker':
        return <PeckerTapHole />;
      case 'owl':
        return <OwlFactOrGuess />;
      case 'fox':
        return <FoxReframeMirror />;
      case 'bear':
        return <BearHug />;
      case 'turtle':
        return <TurtleBreathing />;
      case 'otter':
        return <DuckLeafRaft />;
      case 'squirrel':
        return <SquirrelStashNuts />;
      default:
        return null;
    }
  };

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#FAF7EE] text-[#4D3524] relative flex flex-col items-center justify-center p-0 sm:p-2 select-none">
      <PaperTexture opacity={0.35} />

      {/* 首次入林引导弹窗 */}
      <OnboardingModal />

      {/* 危机干预弹窗 */}
      <SafetyCrisisModal
        isOpen={isCrisisModalOpen}
        onConfirmSafe={() => setIsCrisisModalOpen(false)}
      />

      {/* 活跃小游戏弹窗 */}
      {activeGameAnimal && (
        <GameModal
          animalId={activeGameAnimal}
          isOpen={true}
          onClose={closeGame}
        >
          {renderMiniGame()}
        </GameModal>
      )}

      {/* 森林统一设置弹窗 (所有功能归集于此，页面纯粹一体) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenRings={() => setIsRingsModalOpen(true)}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* 古树年轮长卷弹窗 (就地在森林中浮现，不跳出页面) */}
      <RingsModal
        isOpen={isRingsModalOpen}
        onClose={() => setIsRingsModalOpen(false)}
      />

      {/* 核心主舞台与一体化交互流 (SceneStage 永不卸载，贯穿始终) */}
      <section className="w-full h-full max-w-7xl flex flex-col justify-center items-center relative p-1 sm:p-2">
        {/* 1. 2.5D 森林永续画布 */}
        <div className="w-full h-full relative flex items-center justify-center">
          <SceneStage
            timeOfDay={timeOfDay}
            showAllAnimals={true}
            selectedAnimal={profile?.companion || 'bear'}
            animalMoods={animalMoods}
            parallaxStrength={1.0}
            autoDrift={true}
            campfireMode={forestStage !== 'explore' && forestStage !== 'game'}
            activeSpeaker={forestStage !== 'explore' ? activeSpeaker : null}
            isUserTyping={isTyping}
            onAnimalClick={(animalId) => {
              if (forestStage === 'explore') {
                setInspectAnimal(animalId);
              } else if (forestStage === 'roundtable') {
                setSelectedCampfireSpeaker(animalId);
              }
            }}
            onRangerClick={() => {
              if (forestStage === 'roundtable') {
                setSelectedCampfireSpeaker('ranger');
              }
            }}
            onStartCampfire={handleStartVentingFlow}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* 森林顶端引导指示标签 */}
          <div className="absolute top-4 left-4 z-40 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md text-xs text-[#5C4033] shadow-sm border border-[#E8DEC8] hidden sm:flex items-center gap-2 pointer-events-none">
            <span className="text-sm">{forestStage !== 'explore' ? '🔥' : '🍃'}</span>
            <span className="font-semibold">
              {forestStage !== 'explore'
                ? '围坐篝火讨论中 · 7位伙伴轮流发言 · 点击火堆旁伙伴可切换倾听'
                : '7位伙伴全员齐聚森林 · 点击林间任意动物开启互动与小游戏'}
            </span>
          </div>

          {/* 篝火夜话进行中时的右上角快捷返回按钮 */}
          {forestStage !== 'explore' && forestStage !== 'game' && (
            <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
              <button
                onClick={async () => {
                  await pauseSession();
                  handleExitCampfire();
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-md text-xs text-[#5C4033] hover:text-[#2E1E14] font-medium shadow-sm border border-[#E8DEC8] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <span>🌿</span>
                <span>暂存并返回</span>
              </button>
            </div>
          )}

          {/* 探索态 (白天漫步) 下，极简融入环境的自然引导胶囊 */}
          {forestStage === 'explore' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
              <button
                onClick={() => handleStartVentingFlow()}
                className="px-4 py-1.5 rounded-full bg-[#FAF7EE]/85 hover:bg-[#FAF7EE] backdrop-blur-xs border border-[#8C6648]/35 hover:border-[#8C6648]/70 text-[#5C402E] hover:text-[#2E1E14] text-xs font-medium shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 group paper-rough-edge"
              >
                <span className="text-xs">🪵</span>
                <span>轻点林间火塘 · 拾柴生起篝火夜话</span>
                <span className="text-[10px] text-[#8C6648] group-hover:translate-x-0.5 transition-transform">›</span>
              </button>
            </div>
          )}
          {/* ================= 核心：直接在篝火中央弹出的超晶透 iOS Liquid Glass 倾诉输入窗 ================= */}
          <AnimatePresence>
            {forestStage === 'input' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/10 backdrop-blur-[0.5px] rounded-3xl"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    handleExitCampfire();
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 28 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.90, y: 16 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.28 }}
                  className="relative w-full max-w-xl rounded-[32px] p-5 sm:p-7 overflow-hidden text-left space-y-4 pointer-events-auto"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)',
                    backdropFilter: 'blur(16px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.45)',
                    boxShadow:
                      'inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.75), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.15), 0 24px 60px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* iOS 玻璃折射光晕：底部篝火暖光漫射与顶部高光切边 */}
                  <div
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full pointer-events-none -z-10"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(255, 175, 55, 0.28) 0%, transparent 72%)',
                      filter: 'blur(24px)',
                    }}
                  />
                  <div
                    className="absolute top-0 inset-x-0 h-24 pointer-events-none -z-10"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 100%)',
                      borderRadius: '32px 32px 0 0',
                    }}
                  />

                  {/* 顶栏：标题胶囊与 iOS 玻璃关闭按钮 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/20 border border-white/40 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1.5 shadow-xs">
                        <span className="text-sm animate-pulse">🔥</span>
                        <span>篝火夜话 · 倾诉心事</span>
                      </span>
                      <span className="text-[11px] text-[#F3E6D0] font-medium hidden sm:inline drop-shadow-xs">
                        伙伴们围坐火堆旁安静聆听
                      </span>
                    </div>

                    <button
                      onClick={handleExitCampfire}
                      title="关闭并返回林间漫步"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/40 border border-white/40 backdrop-blur-md flex items-center justify-center text-white shadow-xs transition-all cursor-pointer text-xs font-bold active:scale-95"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 心情晴雨度轻量快捷打分 (高透明度 iOS 磨砂玻璃药丸栏) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-white/15 border border-white/35 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                    <div className="flex items-center gap-1.5 text-xs text-[#FFF6E5]">
                      <span>🌤️ 此刻心头晴雨度：</span>
                      <span className="font-bold text-[#72E86B] drop-shadow-xs">
                        {currentSession?.moodBefore ?? 5} 分
                      </span>
                      <span className="text-[10px] text-[#E8D4BE] hidden sm:inline">
                        （1分沉重谷底，10分舒展晴空）
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                        const isSelected = (currentSession?.moodBefore ?? 5) === score;
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setMoodBefore(score)}
                            className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#358330] text-white shadow-[0_0_12px_rgba(53,131,48,0.8)] border border-emerald-300 scale-105'
                                : 'bg-white/15 hover:bg-white/35 text-white/90 border border-white/25'
                            }`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 倾诉输入框 (高透光晶体玻璃质感，背景篝火清晰可见，文本亮白高对比清晰) */}
                  <textarea
                    autoFocus
                    value={ventingText}
                    onChange={(e) => setVentingText(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    rows={4}
                    placeholder="发生什么事让你感到委屈、焦虑或不知所措？长篇叙述、琐碎念头都可以放心写在这里，也可以点击左下方 🎙️ 语音输入倾诉，大家会围绕篝火逐一认真回应..."
                    className="w-full p-4 rounded-2xl bg-white/15 focus:bg-white/25 border border-white/35 focus:border-white/60 text-xs sm:text-sm text-[#FFFDF8] placeholder:text-white/45 leading-relaxed shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] focus:outline-none resize-none backdrop-blur-md transition-all font-medium"
                  />

                  {/* 底部输入辅助与提交按钮 (高透光 iOS 触感按键) */}
                  <div className="flex items-center justify-between pt-1">
                    <VoiceInput
                      onTranscript={(t) => setVentingText((prev) => prev + t)}
                      className="!bg-white/18 hover:!bg-white/30 !text-white !border-white/35 backdrop-blur-md rounded-2xl px-3 py-2"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExitCampfire}
                        className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/30 border border-white/30 text-[#FFF6E5] text-xs font-semibold backdrop-blur-md shadow-xs transition-all cursor-pointer active:scale-95"
                      >
                        🌿 先不想说了
                      </button>
                      <button
                        type="button"
                        disabled={!ventingText.trim() || isSubmittingVenting}
                        onClick={handleSubmitVenting}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2B6624] to-[#3E8B34] hover:from-[#21511C] hover:to-[#317329] disabled:opacity-40 disabled:cursor-not-allowed text-white border border-emerald-300/50 shadow-[0_6px_22px_rgba(43,102,36,0.6)] text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingVenting ? '伙伴们正在思考...' : '发送倾诉，开始圆桌讨论 ›'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= 核心：直接在森林夜空中呈现的 7位动物圆桌心声与守林人总结 ================= */}
          <AnimatePresence>
            {forestStage === 'roundtable' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 z-45 pointer-events-none flex flex-col justify-start items-center pt-14 pb-3 px-3 sm:px-6"
              >
                <div className="w-full max-w-xl pointer-events-auto">
                  <RoundtableDialogue
                    hideGatheringCircle={true}
                    selectedSpeaker={selectedCampfireSpeaker}
                    onSpeakerChange={(speaker) => setActiveSpeaker(speaker)}
                    onSessionResolved={() => {
                      setForestStage('rating-after');
                    }}
                    onSessionPaused={async () => {
                      await pauseSession();
                      handleExitCampfire();
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= 核心：直接在森林中呈现的 释怀后打分与年轮提炼 ================= */}
          <AnimatePresence>
            {forestStage === 'rating-after' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/20 backdrop-blur-xs rounded-3xl pointer-events-auto"
              >
                <div className="w-full max-w-xl mx-auto max-h-[90%] overflow-y-auto">
                  {isDistilling ? (
                    <div className="relative drop-shadow-paper-edge">
                      <div className="p-8 rounded-3xl glass-card-paper paper-rough-edge text-center space-y-4 relative">
                        <div className="absolute top-0 inset-x-0 h-24 pointer-events-none bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-3xl" />
                        <motion.div
                          animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                          className="text-4xl inline-block"
                        >
                          🍃
                        </motion.div>
                        <h3 className="text-base sm:text-lg font-bold text-[#28180E] drop-shadow-xs">
                          古树岁岁正在轻抚心事...
                        </h3>
                        <p className="text-xs text-[#6E472B] leading-relaxed font-medium">
                          伙伴们的温暖回声与你的心境转变，正在凝结成一圈崭新的年轮，刻入古树的记忆长卷中。
                        </p>
                      </div>
                    </div>
                  ) : distilledMemory ? (
                    <div className="relative drop-shadow-paper-edge">
                      <div className="p-6 sm:p-8 rounded-3xl glass-card-paper paper-rough-edge text-center space-y-5 relative">
                        <div className="absolute top-0 inset-x-0 h-28 pointer-events-none bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-3xl" />
                        <div className="relative z-10 w-14 h-14 mx-auto rounded-full bg-emerald-500/18 border border-emerald-600/30 flex items-center justify-center text-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
                          🌳
                        </div>
                        <div className="relative z-10 space-y-1.5">
                          <h3 className="text-lg sm:text-xl font-bold text-[#28180E] drop-shadow-xs">
                            🎉 一圈崭新的成长年轮已长成！
                          </h3>
                          <p className="text-xs sm:text-sm text-[#6E472B] font-medium">
                            「{distilledMemory.title}」已安全留存在你的本地设备中。
                          </p>
                        </div>

                        <div className="relative z-10 p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)] text-xs text-left space-y-1.5">
                          <span className="font-bold text-[#24611E] block text-[11px]">
                            ✨ 本次沉淀的领悟：
                          </span>
                          <p className="italic text-[#382110] font-medium">{distilledMemory.insight}</p>
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                          <PaperButton
                            variant="secondary"
                            size="md"
                            onClick={() => setShowGrowthCardModal(true)}
                            icon={<Sparkles className="w-4 h-4 text-[#24611E]" />}
                            className="w-full sm:w-auto !bg-white/50 hover:!bg-white/80 !border-white/80 !text-[#24611E] backdrop-blur-md font-bold"
                          >
                            查看立体年轮卡片
                          </PaperButton>
                          <button
                            type="button"
                            onClick={() => setIsRingsModalOpen(true)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2B6624] to-[#3E8B34] hover:from-[#21511C] hover:to-[#317329] text-white border border-emerald-300/60 shadow-[0_4px_16px_rgba(43,102,36,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <Layers className="w-4 h-4" />
                            <span>前往古树年轮画卷 ›</span>
                          </button>
                          <PaperButton
                            variant="outline"
                            size="md"
                            onClick={() => {
                              setDistilledMemory(null);
                              handleExitCampfire();
                            }}
                            className="w-full sm:w-auto !bg-white/40 hover:!bg-white/70 !border-white/70 !text-[#4A3220] backdrop-blur-md"
                          >
                            🌿 结束讨论，返回漫步
                          </PaperButton>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <MoodRating
                      title="🌱 聊到现在，心头的感觉有变化吗？"
                      subtitle="再次打个分，记录这次倾诉带给你的心境微光"
                      onSelect={(score) => handleDistillAndSave(score)}
                      onSkip={() => handleDistillAndSave(7)}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 动物角色详情弹出卡片 (探索模式下点击动物时弹出) */}
      <AnimatePresence>
        {inspectAnimal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs"
              onClick={() => setInspectAnimal(null)}
            />
            <div className="relative z-10 w-full max-w-sm perspective-stage">
              <PaperCard
                isOpen={true}
                onClose={() => setInspectAnimal(null)}
                title={ANIMALS[inspectAnimal].name}
                subtitle={ANIMALS[inspectAnimal].mindset}
                tag={ANIMALS[inspectAnimal].psychology}
              >
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-white/70 border border-[#E8DEC8]">
                    <strong>专属小游戏：</strong>
                    {ANIMALS[inspectAnimal].gameName}
                    <p className="text-[#7A583E] mt-1 leading-snug">
                      {ANIMALS[inspectAnimal].gameSummary}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E8DEC8]">
                    {profile && profile.companion !== inspectAnimal ? (
                      <button
                        onClick={async () => {
                          const id = inspectAnimal;
                          await saveUserProfile({ companion: id });
                          await loadProfile();
                        }}
                        className="text-xs text-[#38662F] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>🍃 设为倾诉首选伙伴</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#2F5927] bg-[#E5EFE3] px-2 py-0.5 rounded-full font-bold">
                        当前首选伙伴
                      </span>
                    )}
                    <div className="flex flex-wrap items-center gap-2 ml-auto">
                      <PaperButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setInspectAnimal(null)}
                      >
                        留在林间
                      </PaperButton>
                      <PaperButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const id = inspectAnimal;
                          setInspectAnimal(null);
                          handleStartVentingFlow(id);
                        }}
                        icon={<span className="text-xs">🔥</span>}
                        className="bg-[#C84630] hover:bg-[#B33B27] border-[#8C2E1D] text-white font-bold"
                      >
                        去篝火旁倾诉 ›
                      </PaperButton>
                      <PaperButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const id = inspectAnimal;
                          setInspectAnimal(null);
                          openGame(id);
                        }}
                      >
                        小游戏 ›
                      </PaperButton>
                    </div>
                  </div>
                </div>
              </PaperCard>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3D 弹出式成长年轮卡片 */}
      <AnimatePresence>
        {showGrowthCardModal && distilledMemory && (
          <GrowthCard
            memory={distilledMemory}
            onClose={() => setShowGrowthCardModal(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
