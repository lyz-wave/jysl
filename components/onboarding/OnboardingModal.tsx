'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimalId } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import { PaperButton } from '../paper/PaperButton';
import { useForestStore } from '@/lib/store';
import { saveUserProfile } from '@/lib/db';
import { Sparkles, Shield, HeartHandshake, ArrowRight } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { profile, setProfile, setForestStage } = useForestStore();
  const [step, setStep] = useState<'mist' | 'welcome' | 'disclaimer' | 'companion'>('mist');
  const [nickname, setNickname] = useState('旅人');
  const [selectedCompanion, setSelectedCompanion] = useState<AnimalId>('bear');

  const animalsList = Object.values(ANIMALS);

  const handleFinish = async () => {
    const updated = {
      id: 'current_user',
      nickname: nickname.trim() || '旅人',
      companion: selectedCompanion,
      hasCompletedOnboarding: true,
      soundEnabled: false,
      createdAt: Date.now(),
    };
    await saveUserProfile(updated);
    setProfile(updated);
    setForestStage('explore');
  };

  if (profile?.hasCompletedOnboarding) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-[#142318]/50 backdrop-blur-xs select-none">
      <AnimatePresence mode="wait">
        {/* 1. 晨雾拉开过渡 */}
        {step === 'mist' && (
          <motion.div
            key="mist"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md p-8 rounded-3xl bg-[#FAF7EE] border-2 border-[#CCDBC8] text-center space-y-6 shadow-2xl paper-rough-edge"
          >
            <div className="text-4xl animate-bounce">🌫️</div>
            <div>
              <h2 className="text-2xl font-bold text-[#3B2D25]">
                晨雾初散，林径渐现
              </h2>
              <p className="text-xs text-[#7A583E] mt-2 leading-relaxed">
                拨开层叠的纸雕晨雾，你隐约听到林间鸟鸣与小溪潺潺...
              </p>
            </div>
            <PaperButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setStep('welcome')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              踏入解忧森林 ›
            </PaperButton>
          </motion.div>
        )}

        {/* 2. 古树欢迎与昵称输入 */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md p-7 rounded-3xl bg-[#FAF7EE] border-2 border-[#38662F] text-left space-y-5 shadow-2xl paper-rough-edge"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌳</span>
              <div>
                <h3 className="font-bold text-lg text-[#3B2D25]">
                  古树「岁岁」向你问好
                </h3>
                <span className="text-xs text-[#38662F] font-semibold">
                  森林守护者
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 border border-[#E8DEC8] text-xs text-[#4D3524] leading-relaxed space-y-2 italic">
              <p>「欢迎来到解忧森林。」</p>
              <p>「无论你在林外经历了怎样的风暴，在这里，每一声微小的烦恼都会被温柔接住。」</p>
              <p>「7只动物伙伴已经围拢过来，你想怎么称呼你呢？」</p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#5C4033] block mb-1.5">
                你的称呼 / 昵称：
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
                placeholder="例如：旅人、小叶、慢慢"
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D9CDB8] text-sm text-[#4D3524] focus:outline-none focus:border-[#38662F]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <PaperButton
                variant="primary"
                size="md"
                onClick={() => setStep('disclaimer')}
              >
                继续深入 ›
              </PaperButton>
            </div>
          </motion.div>
        )}

        {/* 3. 隐私与免责说明 */}
        {step === 'disclaimer' && (
          <motion.div
            key="disclaimer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md p-7 rounded-3xl bg-[#FAF7EE] border-2 border-[#D9C4A1] text-left space-y-4 shadow-2xl paper-rough-edge"
          >
            <div className="flex items-center gap-2.5 text-[#8C4320]">
              <Shield className="w-5 h-5 text-[#38662F]" />
              <h3 className="font-bold text-base text-[#3B2D25]">
                在开始前，有三点重要的约定：
              </h3>
            </div>

            <div className="space-y-3 text-xs text-[#5C4033] leading-relaxed">
              <div className="p-3 rounded-xl bg-white/70 border border-[#E8DEC8]">
                <strong>🌿 本地优先与绝对隐私：</strong>
                你的全部倾诉、情绪词与成长年轮数据只保存在你的当前设备（IndexedDB）上，服务端零数据留存。
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-[#E8DEC8]">
                <strong>🛡️ 治愈陪伴而非医疗：</strong>
                森林提供心理学视角的温暖陪伴，但不能替代专业心理咨询或医疗精神诊断。
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-[#E8DEC8]">
                <strong>📞 紧急求助随时开启：</strong>
                若遇紧急心理危机，请毫不犹豫寻求专业帮助，全国心理援助热线为 12356。
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep('welcome')}
                className="text-xs text-[#7A583E] underline cursor-pointer"
              >
                ‹ 上一步
              </button>
              <PaperButton
                variant="primary"
                size="md"
                onClick={() => setStep('companion')}
              >
                我已知晓并同意 ›
              </PaperButton>
            </div>
          </motion.div>
        )}

        {/* 4. 选择今日首选伙伴动物 */}
        {step === 'companion' && (
          <motion.div
            key="companion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#FAF7EE] border-2 border-[#38662F] text-left space-y-4 shadow-2xl paper-rough-edge max-h-[90vh] overflow-y-auto"
          >
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#3B2D25] flex items-center gap-2">
                <span>今天想先找哪位动物伙伴玩？</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-[#7A583E] mt-1">
                TA 将成为你今天的首选陪伴者，并在随后的圆桌倾诉中第一个开口：
              </p>
            </div>

            {/* 7 只动物卡片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {animalsList.map((a) => {
                const isSelected = selectedCompanion === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedCompanion(a.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#E5EFE3] border-[#38662F] shadow-sm font-bold scale-[1.02]'
                        : 'bg-white/80 hover:bg-white border-[#E8DEC8]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#3B2D25]">{a.name}</span>
                        <span className="text-[10px] text-[#38662F] font-semibold">
                          {a.psychology}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A583E] mt-1 leading-snug">
                        {a.mindset}
                      </p>
                    </div>

                    <div className="text-[10px] text-[#8C6648] mt-2 pt-1 border-t border-[#F0E6D8]">
                      小游戏：{a.gameName}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#E8DEC8]">
              <button
                onClick={() => setStep('disclaimer')}
                className="text-xs text-[#7A583E] underline cursor-pointer"
              >
                ‹ 上一步
              </button>
              <PaperButton
                variant="primary"
                size="md"
                onClick={handleFinish}
                icon={<HeartHandshake className="w-4 h-4" />}
              >
                结伴入林，开启森林之旅 ›
              </PaperButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
