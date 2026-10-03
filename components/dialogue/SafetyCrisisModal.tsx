'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Phone, HeartHandshake } from 'lucide-react';
import { PaperButton } from '../paper/PaperButton';

interface SafetyCrisisModalProps {
  isOpen: boolean;
  onConfirmSafe: () => void;
}

export const SafetyCrisisModal: React.FC<SafetyCrisisModalProps> = ({
  isOpen,
  onConfirmSafe,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#FAF7EE] text-[#4D3524] rounded-3xl p-6 sm:p-8 border-2 border-[#C84630] shadow-2xl space-y-5 text-left paper-rough-edge"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-[#E8DEC8]">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0E8] border border-[#C84630]/30 flex items-center justify-center text-2xl shrink-0">
            <ShieldAlert className="w-6 h-6 text-[#C84630]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#8C2919]">
              森林在此刻抱住你 · 守护你的生命安全
            </h3>
            <p className="text-xs text-[#7A583E] mt-0.5">
              古树轻声说：你的痛苦非常真实，此刻请务必寻求专业的守护力量
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#4D3524] leading-relaxed">
          亲爱的旅人，森林感受到了你此刻难以承受的风暴与沉重。
          「解忧森林」无法替代专业的危机干预与心理医疗。请允许信任的家人、朋友或专业咨询热线陪伴你走过这一刻：
        </p>

        {/* 紧急热线电话名片 */}
        <div className="space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#3B2D25]">
                全国心理援助热线（24小时免费）
              </div>
              <div className="text-[11px] text-[#7A583E]">
                国家卫健委支持 · 随时倾听
              </div>
            </div>
            <a
              href="tel:12356"
              className="px-3.5 py-1.5 rounded-xl bg-[#38662F] text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" /> 拨打 12356
            </a>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#3B2D25]">
                希望 24 危机干预热线
              </div>
              <div className="text-[11px] text-[#7A583E]">
                专业自伤自杀危机干预专线
              </div>
            </div>
            <a
              href="tel:4001619995"
              className="px-3.5 py-1.5 rounded-xl bg-[#C84630] text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" /> 400-161-9995
            </a>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFF6EE] border border-[#EACBB8] text-[11px] text-[#8C4320] leading-relaxed">
            如遇不可控的人身安全威胁或身体伤害紧急情况，请务必直接拨打 <strong>110</strong> 或 <strong>120</strong>。
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <PaperButton
            variant="secondary"
            size="md"
            onClick={onConfirmSafe}
            icon={<HeartHandshake className="w-4 h-4" />}
          >
            我已知晓热线，并确认当前环境安全 ›
          </PaperButton>
        </div>
      </motion.div>
    </div>
  );
};
