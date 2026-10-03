'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AnimalId,
  Message,
  PuppetAnimationMood,
  Speaker,
} from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import { useForestStore } from '@/lib/store';
import { GatheringCircle } from './GatheringCircle';
import { RangerSummaryCard } from './RangerSummaryCard';
import { VoiceInput } from './VoiceInput';
import { PaperButton } from '../paper/PaperButton';
import { Leaf, Heart, Send, MessageSquare, ArrowRight, Sparkles, ChevronLeft } from 'lucide-react';

interface RoundtableDialogueProps {
  onSessionResolved: () => void;
  onSessionPaused: () => void;
  hideGatheringCircle?: boolean;
  onSpeakerChange?: (speaker: Speaker | null) => void;
  selectedSpeaker?: Speaker | null;
}

export const RoundtableDialogue: React.FC<RoundtableDialogueProps> = ({
  onSessionResolved,
  onSessionPaused,
  hideGatheringCircle = false,
  onSpeakerChange,
  selectedSpeaker = null,
}) => {
  const {
    currentSession,
    timeOfDay,
    animalMoods,
    setAnimalMood,
    resetAllAnimalMoods,
    addMessage,
    toggleMessageResonated,
  } = useForestStore();

  const [activeSpeechIndex, setActiveSpeechIndex] = useState(0);
  const [displayedTextLength, setDisplayedTextLength] = useState(0);
  const [isTypingSpeech, setIsTypingSpeech] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [followupText, setFollowupText] = useState('');
  const [targetedSpeaker, setTargetedSpeaker] = useState<Speaker>('ranger');
  const [isWaitingFollowup, setIsWaitingFollowup] = useState(false);
  const followupInputRef = useRef<HTMLInputElement>(null);

  // 提取动物消息
  const animalMessages =
    currentSession?.messages.filter((m) => m.speaker !== 'user' && m.speaker !== 'tree' && m.speaker !== 'ranger') || [];
  const currentMsg = animalMessages[activeSpeechIndex];

  // 打字机出字效果
  useEffect(() => {
    if (!currentMsg) return;
    setDisplayedTextLength(0);
    setIsTypingSpeech(true);

    // 驱动当前发言动物的情绪动作
    if (currentMsg.speaker in ANIMALS) {
      setAnimalMood(currentMsg.speaker as AnimalId, currentMsg.mood || 'nod');
    }

    const fullText = currentMsg.content;
    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex += 2;
      setDisplayedTextLength(charIndex);
      if (charIndex >= fullText.length) {
        clearInterval(interval);
        setIsTypingSpeech(false);
      }
    }, 35);

    return () => {
      clearInterval(interval);
    };
  }, [currentMsg, activeSpeechIndex, setAnimalMood]);

  // 上一位动物发言
  const handlePrevSpeech = () => {
    if (activeSpeechIndex > 0) {
      setActiveSpeechIndex((i) => i - 1);
    }
  };

  // 下一位动物发言
  const handleNextSpeech = () => {
    if (activeSpeechIndex < animalMessages.length - 1) {
      setActiveSpeechIndex((i) => i + 1);
    } else {
      // 动物都说完后，展示守林人手记总结
      setShowSummary(true);
      const rangerMsg = currentSession?.messages.find(
        (m) => m.speaker === 'ranger' || m.speaker === 'tree'
      );
      if (rangerMsg) {
        setSummaryContent(rangerMsg.content);
      }
    }
  };

  // 全部直接显示
  const handleShowAll = () => {
    setActiveSpeechIndex(animalMessages.length - 1);
    setShowSummary(true);
    const rangerMsg = currentSession?.messages.find(
      (m) => m.speaker === 'ranger' || m.speaker === 'tree'
    );
    if (rangerMsg) {
      setSummaryContent(rangerMsg.content);
    }
  };

  // 发送追问
  const handleSendFollowup = async () => {
    if (!followupText.trim() || isWaitingFollowup || !currentSession) return;

    const userText = followupText.trim();
    setFollowupText('');
    setIsWaitingFollowup(true);

    // 添加用户追问记录
    addMessage({
      speaker: 'user',
      content: userText,
    });

    try {
      const res = await fetch('/api/ai/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: '旅人',
          targetSpeaker: targetedSpeaker,
          userInput: userText,
          history: currentSession.messages.map((m) => ({
            speaker: m.speaker,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.reply) {
        addMessage({
          speaker: targetedSpeaker,
          content: data.reply,
          mood: 'gentle',
        });
      }
    } catch (err) {
      console.error('Followup request failed:', err);
      addMessage({
        speaker: targetedSpeaker,
        content: '（微风吹过枝丫）风太大了没听清，能再说一次吗？',
      });
    } finally {
      setIsWaitingFollowup(false);
    }
  };

  const activeAnimalId =
    currentMsg && currentMsg.speaker in ANIMALS
      ? (currentMsg.speaker as AnimalId)
      : null;

  // 实时通知当前发言人给外部主舞台 (SceneStage)
  useEffect(() => {
    const speaker: Speaker | null = showSummary
      ? 'ranger'
      : (activeAnimalId || (currentMsg?.speaker as Speaker) || null);
    onSpeakerChange?.(speaker);
  }, [showSummary, activeAnimalId, currentMsg, onSpeakerChange]);

  // 响应外部在主舞台点击动物/守林人的联动
  useEffect(() => {
    if (!selectedSpeaker) return;
    if (selectedSpeaker === 'ranger' || selectedSpeaker === 'tree') {
      setShowSummary(true);
      setTargetedSpeaker('ranger');
    } else {
      const idx = animalMessages.findIndex((m) => m.speaker === selectedSpeaker);
      if (idx !== -1 && !showSummary) {
        setActiveSpeechIndex(idx);
      }
      setTargetedSpeaker(selectedSpeaker);
      if (showSummary) {
        followupInputRef.current?.focus();
      }
    }
  }, [selectedSpeaker, animalMessages, showSummary]);

  const getSpeakerArrowPosition = (speaker?: string) => {
    switch (speaker) {
      case 'bear':
        return 'left-[18%]';
      case 'woodpecker':
        return 'left-[28%]';
      case 'turtle':
        return 'left-[32%]';
      case 'squirrel':
        return 'left-[68%]';
      case 'owl':
        return 'left-[72%]';
      case 'fox':
        return 'left-[82%]';
      case 'otter':
      case 'ranger':
      case 'tree':
      default:
        return 'left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div className="w-full select-none">
      {/* 1. 上半部分：围坐在篝火堆旁的 7 只动物与守林人 (若外部舞台已呈现一体化篝火则隐藏) */}
      {!hideGatheringCircle && (
        <GatheringCircle
          timeOfDay={timeOfDay}
          activeSpeaker={showSummary ? 'ranger' : activeAnimalId}
          animalMoods={animalMoods}
          onAnimalClick={(speaker) => {
            if (speaker === 'ranger' || speaker === 'tree') {
              setShowSummary(true);
              setTargetedSpeaker('ranger');
            } else if (!showSummary) {
              const idx = animalMessages.findIndex((m) => m.speaker === speaker);
              if (idx !== -1) {
                setActiveSpeechIndex(idx);
              }
            } else {
              setTargetedSpeaker(speaker);
              followupInputRef.current?.focus();
            }
          }}
        />
      )}

      {/* 2. 当前动物发言气泡 (置于森林上方天空，底部气泡尖倒指下方林间当前动物) */}
      {!showSummary && currentMsg && (
        <motion.div
          key={currentMsg.id}
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="relative w-full max-w-xl mx-auto p-4 sm:p-5 rounded-[26px] text-left space-y-3 pointer-events-auto"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(250, 246, 238, 0.78) 100%)',
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow:
              '0 18px 46px -10px rgba(0, 0, 0, 0.42), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* 气泡三角指示尖 (位于卡片底部，倒三角指向下方围坐的发言动物位置) */}
          <div
            className={`absolute -bottom-2 w-4.5 h-4.5 bg-[#FAF7EE] border-b border-r border-[#8C6648]/40 rotate-45 backdrop-blur-md transition-all duration-300 shadow-xs pointer-events-none ${getSpeakerArrowPosition(
              currentMsg.speaker
            )}`}
          />

          {/* 动物头部标签与思维方式 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#24170E]">
                {currentMsg.speaker in ANIMALS
                  ? ANIMALS[currentMsg.speaker as AnimalId].name
                  : '森林声音'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E5EFE3] text-[#23481F] text-xs font-bold border border-[#38662F]/25 shadow-xs">
                {currentMsg.speaker in ANIMALS
                  ? ANIMALS[currentMsg.speaker as AnimalId].psychology
                  : ''}
              </span>
            </div>

            {/* 说到心里了 (Resonated) 按钮 */}
            <button
              onClick={() => toggleMessageResonated(currentMsg.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs ${
                currentMsg.resonated
                  ? 'bg-[#C84630] text-white shadow-[0_2px_10px_rgba(200,70,48,0.4)]'
                  : 'bg-white/80 hover:bg-white text-[#7A583E] border border-[#E8DEC8]'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  currentMsg.resonated ? 'fill-white stroke-white' : 'text-[#C84630]'
                }`}
              />
              <span>{currentMsg.resonated ? '已说到心里了' : '说到心里了'}</span>
            </button>
          </div>

          {/* 打字机发言文字内容 */}
          <p className="text-xs sm:text-sm text-[#38271C] leading-relaxed min-h-12 font-medium">
            {currentMsg.content.slice(0, displayedTextLength)}
            {isTypingSpeech && (
              <span className="inline-block w-1.5 h-3.5 bg-[#38662F] ml-0.5 animate-pulse" />
            )}
          </p>

          {/* 下方控制：发言进度、全部显示 & 下一位 */}
          <div className="pt-2 flex items-center justify-between border-t border-[#8C6648]/15">
            <div className="flex items-center gap-1.5 text-[11px] text-[#7A583E]">
              <span className="font-semibold text-[#24170E]">
                进度 {activeSpeechIndex + 1}/{animalMessages.length}
              </span>
              <span className="hidden sm:inline text-[#A08268]">· 也可直接轻点火堆旁的动物</span>
            </div>

            <div className="flex items-center gap-2">
              {activeSpeechIndex > 0 && (
                <PaperButton
                  variant="outline"
                  size="sm"
                  onClick={handlePrevSpeech}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  上一位
                </PaperButton>
              )}
              <button
                onClick={handleShowAll}
                className="text-xs text-[#7A583E] hover:text-[#2E1E14] underline cursor-pointer px-1 py-1"
              >
                全部显示
              </button>
              <PaperButton
                variant="primary"
                size="sm"
                onClick={handleNextSpeech}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                {activeSpeechIndex < animalMessages.length - 1
                  ? '下一位伙伴发言 ›'
                  : '倾听守林人总结 ›'}
              </PaperButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. 守林人整合总结卡片与追问 */}
      {showSummary && (
        <div className="w-full max-w-xl mx-auto space-y-3 max-h-[500px] sm:max-h-[560px] overflow-y-auto pr-1 pointer-events-auto select-none rounded-3xl">
          <RangerSummaryCard
            summaryText={
              summaryContent ||
              '🌿 我听到了：围坐在篝火边，听你说起心头的紧绷与迷茫，这份疲惫很真实，先烤烤火暖和一下。\n🍃 森林的声音：墨墨提醒分清事实与猜测，团团想要你先给自己一个无条件的抱抱，漂漂把烦恼当落叶放走，慢慢带你看长河。\n🌳 一个可以带走的念头：外头风雨再大，这堆篝火永远为你留着一个温暖的席位；你的价值无需用严苛的评价来衡量。\n🌱 一个小小的下一步：接过守林人手里的热茶喝一口，深呼吸三次，今晚早些歇息。\n烤着火，心里有没有稍微舒展一点？还想听谁再多说说？'
            }
            onResolved={onSessionResolved}
            onPause={onSessionPaused}
            onContinue={() => {
              followupInputRef.current?.scrollIntoView({ behavior: 'smooth' });
              followupInputRef.current?.focus();
            }}
          />

          {/* 4. 追问对话历史与输入栏 */}
          <div className="w-full space-y-2 p-3 rounded-2xl bg-[#FAF7EE]/95 backdrop-blur-md border border-[#8C6648]/30 shadow-md">
            {/* 对话历史记录列表 */}
            <div className="space-y-2 max-h-44 overflow-y-auto p-2 rounded-xl bg-white/70 border border-[#E8DEC8]">
              {(currentSession?.messages || [])
                .filter(
                  (m) =>
                    m.speaker === 'user' ||
                    (showSummary && m.createdAt > (currentSession?.startedAt || 0) + 1000)
                )
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 text-xs ${
                      msg.speaker === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-md p-2.5 rounded-2xl ${
                        msg.speaker === 'user'
                          ? 'bg-[#E5EFE3] text-[#23481F] font-bold border border-[#38662F]/30'
                          : 'bg-white text-[#4D3524] border border-[#E8DEC8]'
                      }`}
                    >
                      <span className="text-[10px] opacity-75 block mb-0.5">
                        {msg.speaker === 'user'
                          ? '你'
                          : msg.speaker === 'ranger' || msg.speaker === 'tree'
                          ? '🌲 守林人'
                          : `🐾 ${ANIMALS[msg.speaker as AnimalId]?.name}`}
                      </span>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* 指定追问对象提示 */}
            <div className="flex items-center justify-between text-xs px-1 text-[#7A583E]">
              <div className="flex items-center gap-1.5">
                <span>当前向：</span>
                <span className="font-bold text-[#38662F]">
                  {targetedSpeaker === 'ranger' || targetedSpeaker === 'tree'
                    ? '🌲 守林人'
                    : `🐾 ${ANIMALS[targetedSpeaker as AnimalId]?.name}`}
                </span>
                <span>追问（点击下方火旁的动物可切换）</span>
              </div>
              {targetedSpeaker !== 'ranger' && targetedSpeaker !== 'tree' && (
                <button
                  onClick={() => setTargetedSpeaker('ranger')}
                  className="underline text-[11px] hover:text-[#38662F] cursor-pointer"
                >
                  重置为问守林人
                </button>
              )}
            </div>

            {/* 输入框与语音输入 */}
            <div className="flex gap-2 items-center">
              <input
                ref={followupInputRef}
                type="text"
                value={followupText}
                onChange={(e) => setFollowupText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendFollowup()}
                placeholder={
                  targetedSpeaker === 'ranger' || targetedSpeaker === 'tree'
                    ? '向守林人追问，或烤着火聊聊心事...'
                    : `向 ${ANIMALS[targetedSpeaker as AnimalId]?.name} 追问...`
                }
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#D9CDB8] text-xs text-[#4D3524] shadow-inner focus:outline-none focus:border-[#38662F]"
              />

              <VoiceInput
                onTranscript={(t) => setFollowupText((prev) => prev + t)}
              />

              <PaperButton
                variant="primary"
                size="sm"
                disabled={!followupText.trim() || isWaitingFollowup}
                onClick={handleSendFollowup}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                {isWaitingFollowup ? '思索中...' : '发送'}
              </PaperButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
