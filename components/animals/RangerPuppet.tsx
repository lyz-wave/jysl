'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PuppetAnimationMood } from '@/lib/types';

interface RangerPuppetProps {
  mood?: PuppetAnimationMood;
  scale?: number;
  className?: string;
  isSpeaking?: boolean;
}

export const RangerPuppet: React.FC<RangerPuppetProps> = ({
  mood = 'idle',
  scale = 1.0,
  className = '',
  isSpeaking = false,
}) => {
  // 守林人动作计算
  const getHeadTransform = () => {
    if (isSpeaking || mood === 'nod') {
      return {
        rotate: [0, 8, -2, 6, 0],
        y: [0, 3, -1, 2, 0],
        transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    if (mood === 'gentle') {
      return {
        rotate: [0, 6, 0],
        transition: { duration: 3.0, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    return {
      rotate: [0, -2, 1, 3, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const },
    };
  };

  const getLanternTransform = () => {
    return {
      rotate: [-3, 4, -2, 3, -3],
      transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
    };
  };

  return (
    <motion.div
      animate={{
        scaleY: [1, 1.025, 1],
      }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      className={`relative inline-block select-none ${className}`}
      style={{
        width: 140 * scale,
        height: 190 * scale,
        transformOrigin: 'bottom center',
      }}
    >
      <svg
        viewBox="0 0 160 220"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 两脚钉金属渐变 */}
          <radialGradient id="ranger-pin-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#634B0F" />
          </radialGradient>
        </defs>

        {/* 1. 守林人长袍与双腿底座 */}
        <g id="ranger-legs-cloak">
          {/* 深褐裤腿与皮靴 */}
          <path
            d="M60,180 L52,210 L70,212 L72,185 Z M98,185 L100,212 L118,210 L110,180 Z"
            fill="#3E2C1F"
            stroke="#281A11"
            strokeWidth="1.5"
          />
          {/* 苔藓绿风衣下摆 */}
          <path
            d="M48,110 C40,140 45,185 85,188 C125,185 130,140 122,110 Z"
            fill="#3B5838"
            stroke="#263A24"
            strokeWidth="2"
          />
          {/* 围裙/马甲暖米白内衬 */}
          <path
            d="M68,110 L70,175 L100,175 L102,110 Z"
            fill="#FAF4EB"
            stroke="#D9CBB8"
            strokeWidth="1.2"
          />
          {/* 皮质腰带与金属扣 */}
          <rect x="52" y="140" width="66" height="8" fill="#5A3A22" rx="2" />
          <rect x="80" y="138" width="10" height="12" fill="#D4AF37" stroke="#4A301A" rx="1.5" />
        </g>

        {/* 2. 守林人右手提马灯与手杖 */}
        <motion.g
          animate={getLanternTransform()}
          style={{ transformOrigin: '125px 120px' }}
        >
          {/* 木质手杖 */}
          <line x1="125" y1="95" x2="135" y2="215" stroke="#68452B" strokeWidth="4.5" strokeLinecap="round" />
          {/* 右手臂 */}
          <path
            d="M108,105 C120,110 132,118 128,138 C122,142 112,130 108,120 Z"
            fill="#476843"
            stroke="#263A24"
            strokeWidth="1.8"
          />
          {/* 悬挂的黄铜纸灯笼 */}
          <g transform="translate(138, 140)">
            <line x1="0" y1="-8" x2="0" y2="2" stroke="#5A401A" strokeWidth="1.2" />
            <rect x="-9" y="2" width="18" height="22" rx="3" fill="#D4AF37" stroke="#5A401A" strokeWidth="1.2" />
            <circle cx="0" cy="13" r="6" fill="#FFF3A8" />
            <circle cx="0" cy="13" r="10" fill="#FFE27A" opacity="0.35" />
          </g>
          {/* 右肩两脚钉 */}
          <circle cx="108" cy="106" r="3.2" fill="url(#ranger-pin-grad)" stroke="#3D2B09" strokeWidth="0.7" />
        </motion.g>

        {/* 3. 守林人左手臂（托着温暖热茶杯或手记） */}
        <g id="ranger-left-arm">
          <path
            d="M62,105 C48,110 38,125 45,145 C52,150 60,135 65,120 Z"
            fill="#476843"
            stroke="#263A24"
            strokeWidth="1.8"
          />
          {/* 木茶杯 */}
          <rect x="36" y="136" width="12" height="15" rx="2" fill="#8C5C38" stroke="#4A301A" />
          {/* 杯中袅袅热气纸片 */}
          <path d="M40,132 Q44,124 40,118 M44,130 Q48,122 44,116" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          {/* 左肩两脚钉 */}
          <circle cx="62" cy="106" r="3.2" fill="url(#ranger-pin-grad)" stroke="#3D2B09" strokeWidth="0.7" />
        </g>

        {/* 4. 守林人头部（带关节旋转）：宽檐纸帽、温和笑脸与白胡子 */}
        <motion.g
          animate={getHeadTransform()}
          style={{ transformOrigin: '85px 95px' }}
        >
          {/* 围巾 */}
          <path
            d="M65,95 C75,102 95,102 105,95 C100,108 70,108 65,95 Z"
            fill="#C84630"
            stroke="#8A2C1C"
            strokeWidth="1.5"
          />
          {/* 脖子两脚钉 */}
          <circle cx="85" cy="98" r="3.2" fill="url(#ranger-pin-grad)" stroke="#3D2B09" strokeWidth="0.7" />

          {/* 脸部纸片（温润肤色） */}
          <ellipse cx="85" cy="74" rx="20" ry="22" fill="#F4DECD" stroke="#4A3222" strokeWidth="1.5" />

          {/* 弯弯慈祥笑眼与眼角鱼尾纹 */}
          <path d="M72,68 Q78,63 82,68 M88,68 Q92,63 98,68" stroke="#4A3222" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M68,69 L65,68 M102,69 L105,68" stroke="#7A583E" strokeWidth="1" strokeLinecap="round" />

          {/* 圆圆小鼻头与粉红面颊 */}
          <circle cx="85" cy="73" r="3.5" fill="#E8B79B" />
          <circle cx="72" cy="74" r="4.5" fill="#EE9C82" opacity="0.5" />
          <circle cx="98" cy="74" r="4.5" fill="#EE9C82" opacity="0.5" />

          {/* 白花花的可爱手剪胡须 */}
          <path
            d="M74,78 C70,92 78,102 85,104 C92,102 100,92 96,78 C90,82 80,82 74,78 Z"
            fill="#FAF7EE"
            stroke="#D9CBB8"
            strokeWidth="1.5"
          />

          {/* 守林人宽檐呢帽（墨绿纸帽 + 棕色帽带） */}
          <path
            d="M52,58 C52,54 118,54 118,58 L114,64 L56,64 Z"
            fill="#2D462B"
            stroke="#1D2E1C"
            strokeWidth="1.5"
          />
          <path
            d="M62,56 C60,35 110,35 108,56 Z"
            fill="#3B5838"
            stroke="#1D2E1C"
            strokeWidth="1.5"
          />
          {/* 帽带与小绿叶插片 */}
          <rect x="62" y="52" width="46" height="4" fill="#6D4829" />
          <path d="M72,50 Q76,42 82,46 Q76,52 72,50 Z" fill="#7A9F52" stroke="#4A6B29" strokeWidth="0.8" />
        </motion.g>
      </svg>
    </motion.div>
  );
};
