'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ANIMALS } from '@/lib/animals';
import { AnimalId, PuppetAnimationMood, PuppetPart } from '@/lib/types';

interface PuppetRendererProps {
  animalId: AnimalId;
  mood?: PuppetAnimationMood;
  scale?: number;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  shadowOffset?: { x: number; y: number };
}

export const PuppetRenderer: React.FC<PuppetRendererProps> = ({
  animalId,
  mood = 'idle',
  scale = 1.0,
  interactive = true,
  onClick,
  className = '',
  shadowOffset = { x: 5, y: 10 },
}) => {
  const animal = ANIMALS[animalId];
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  if (!animal) return null;

  // 根据当前 mood 计算大幅度、高区分度的关节旋转与位移动画
  const getPartTransform = (part: PuppetPart) => {
    const isHead = part.id === 'head';
    const isWing = part.id === 'wing' || part.id === 'wingLeft' || part.id === 'wingRight';
    const isTail = part.id === 'tail';
    const isArm = part.id === 'armLeft' || part.id === 'armRight';
    const isBeak = part.id === 'beak';
    const isLeftArmOrWing = part.id === 'armLeft' || part.id === 'wingLeft';

    // 1. 敲树洞特有动作 (peck - 笃笃专属高频啄木)
    if (mood === 'peck') {
      if (isHead) {
        return {
          rotate: [20, -38, 15, -35, 10, -32, 0],
          x: [4, -14, 3, -12, 2, -10, 0],
          y: [-6, 6, -4, 5, -2, 4, 0],
          transition: { duration: 0.65, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isBeak) {
        return {
          rotate: [15, -30, 10, -25, 0],
          transition: { duration: 0.65, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isTail) {
        return {
          rotate: [-4, 18, -2, 16, 0], // 尾巴紧抵树皮抗冲撞
          transition: { duration: 0.65, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isWing) {
        return {
          rotate: [-5, 12, -3, 10, 0],
          transition: { duration: 0.65, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
    }

    // 2. 温暖熊抱特有动作 (hug - 团团专属大开合张臂环抱)
    if (mood === 'hug') {
      if (isArm) {
        const openDir = isLeftArmOrWing ? -55 : 55;
        const closeDir = isLeftArmOrWing ? 36 : -36;
        return {
          rotate: [0, openDir, closeDir, openDir, 0],
          scale: [1, 1.1, 1.05, 1.1, 1],
          transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isHead) {
        return {
          rotate: [0, 8, -6, 8, 0],
          y: [0, 4, -2, 4, 0],
          transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
    }

    // 3. 漂漂小野鸭专属动作 (paddle - 浮水探首戏水与翘尾抖落水珠)
    if (mood === 'paddle') {
      if (isHead) {
        return {
          rotate: [-18, 28, -12, 22, 0],
          y: [-4, 8, -2, 6, 0],
          transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isTail) {
        return {
          rotate: [-25, 25, -18, 18, 0],
          transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isWing) {
        return {
          rotate: [-12, 16, -8, 12, 0],
          transition: { duration: 1.0, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (part.id === 'waterRipples') {
        return {
          x: [-8, 8, -5, 5, 0],
          transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
    }

    // 3. 点头肯定 (nod - 大幅度深沉颔首赞同)
    if (mood === 'nod') {
      if (isHead) {
        return {
          rotate: [0, 24, -4, 20, 0],
          y: [0, 8, -2, 6, 0],
          transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isTail) {
        return {
          rotate: [0, -6, 0, -4, 0],
          transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
    }

    // 4. 受惊微弹 (surprised - 大幅度后仰弹起)
    if (mood === 'surprised') {
      if (isHead) {
        return {
          rotate: -20,
          y: -10,
          transition: { type: 'spring' as const, stiffness: 450, damping: 10 },
        };
      }
      if (isWing || isArm) {
        const dir = isLeftArmOrWing ? -38 : 38;
        return {
          rotate: dir,
          scale: 1.12,
          transition: { type: 'spring' as const, stiffness: 400, damping: 10 },
        };
      }
      if (isTail) {
        return {
          rotate: 26,
          transition: { type: 'spring' as const, stiffness: 400, damping: 12 },
        };
      }
    }

    // 5. 温柔关怀 (gentle - 慢速深情依偎偏头)
    if (mood === 'gentle') {
      if (isHead) {
        return {
          rotate: [0, 16, 4, 14, 0],
          x: [0, 4, 1, 3, 0],
          transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isArm || isWing) {
        const dir = isLeftArmOrWing ? 18 : -18;
        return {
          rotate: [0, dir, 0],
          transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
    }

    // 6. 灵动俏皮 (playful - 大幅度欢快摇摆摇尾)
    if (mood === 'playful') {
      if (isTail) {
        return {
          rotate: [-24, 24, -18, 18, 0],
          transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isHead) {
        return {
          rotate: [-14, 16, -10, 12, 0],
          y: [0, -6, 0, -4, 0],
          transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
      if (isWing || isArm) {
        const dir = isLeftArmOrWing ? -22 : 22;
        return {
          rotate: [0, dir, -dir * 0.5, 0],
          transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const },
        };
      }
    }

    // 7. 深入思考 (thinking - 沉思偏头轻点)
    if (mood === 'thinking') {
      if (isHead) {
        return {
          rotate: 22,
          x: 4,
          y: -2,
          transition: { type: 'spring' as const, stiffness: 220, damping: 18 },
        };
      }
      if (isArm || isWing) {
        const dir = isLeftArmOrWing ? 24 : -12;
        return {
          rotate: dir,
          transition: { type: 'spring' as const, stiffness: 220, damping: 18 },
        };
      }
    }

    // 8. 默认待机与呼吸 (idle / breathe - 12fps 节奏感定格呼吸)
    if (isHead) {
      return {
        rotate: [0, -4, 1, 5, 0],
        transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    if (isTail) {
      return {
        rotate: [0, 8, -4, 10, 0],
        transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    if (isWing) {
      return {
        rotate: [0, -6, 2, 4, 0],
        transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    if (isArm) {
      const dir = isLeftArmOrWing ? -8 : 8;
      return {
        rotate: [0, dir, 0, -dir * 0.4, 0],
        transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }

    return {};
  };

  // 身体受情绪驱动的整体起伏与跃动
  const getBodyMotion = () => {
    if (mood === 'surprised') {
      return {
        y: [0, -22, -18],
        scaleX: [1, 0.92, 1],
        scaleY: [1, 1.08, 1],
        transition: { type: 'spring' as const, stiffness: 450, damping: 12 },
      };
    }
    if (mood === 'peck') {
      return {
        x: [0, -5, 0, -4, 0],
        rotate: [0, -5, 0, -3, 0],
        transition: { duration: 0.65, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    if (mood === 'paddle') {
      return {
        y: [0, -8, 2, -6, 0],
        rotate: [-3, 5, -2, 4, 0],
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    if (mood === 'playful') {
      return {
        y: [0, -10, 0, -6, 0],
        scaleY: [1, 1.05, 1, 1.03, 1],
        transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    if (mood === 'nod') {
      return {
        y: [0, 4, 0, 3, 0],
        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    // 常规呼吸
    return {
      scaleY: [1, 1.04, 1],
      scaleX: [1, 0.985, 1],
      transition: {
        duration: 3.2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    };
  };

  return (
    <motion.div
      className={`relative inline-block select-none ${className} ${
        interactive ? 'cursor-pointer' : ''
      }`}
      style={{
        width: 200 * scale * animal.defaultScale,
        height: 240 * scale * animal.defaultScale,
      }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      whileHover={interactive ? { scale: 1.06, y: -4 } : {}}
      whileTap={interactive ? { scale: 0.95, y: 2 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      <svg
        viewBox={animal.viewBox}
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 金属两脚钉拟真质感：立体高光边缘 + 哑光金色轴芯 */}
          <radialGradient id={`brass-pin-grad-${animal.id}`} cx="32%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFF8D1" />
            <stop offset="35%" stopColor="#E2BD44" />
            <stop offset="80%" stopColor="#9C7820" />
            <stop offset="100%" stopColor="#543E0C" />
          </radialGradient>

          {/* 纸雕手作切边微投影滤镜（柔化纸片边缘层叠感） */}
          <filter id={`paper-cut-shadow-${animal.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.18
                      0 0 0 0 0.12
                      0 0 0 0 0.08
                      0 0 0 0.35 0"
            />
          </filter>
        </defs>

        {/* 1. 纸偶底层偏移阴影（低成本高性能层间投射） */}
        <g
          transform={`translate(${shadowOffset.x}, ${shadowOffset.y})`}
          opacity={0.28}
          fill="#2B1A0E"
        >
          {animal.parts.map((part) => (
            <path key={`shadow-${part.id}`} d={part.svgPath} />
          ))}
        </g>

        {/* 2. 纸偶身体主体与关节系统 */}
        <motion.g
          animate={getBodyMotion()}
          style={{ transformOrigin: 'bottom center' }}
        >
          {animal.parts
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((part) => {
              const transformAnim = getPartTransform(part);
              const pin = part.pinCoord || part.pivot;

              return (
                <motion.g
                  key={part.id}
                  style={{
                    transformOrigin: `${part.pivot.x}px ${part.pivot.y}px`,
                  }}
                  animate={transformAnim}
                >
                  {/* 部件本体纸片：手剪质感边缘轮廓与双层描边 */}
                  <path
                    d={part.svgPath}
                    fill={part.fill}
                    stroke={part.stroke || 'rgba(0,0,0,0.15)'}
                    strokeWidth={part.strokeWidth || 1.8}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* 部件镂空与贴花（传统剪纸镂空花纹/第二纸层） */}
                  {part.cutoutPaths?.map((cutout, idx) => (
                    <path
                      key={`${part.id}-cutout-${idx}`}
                      d={cutout}
                      fill={part.fill === animal.colors.primary ? animal.colors.secondary : animal.colors.accent}
                      stroke={part.stroke || 'rgba(0,0,0,0.1)'}
                      strokeWidth={1}
                      strokeLinejoin="round"
                      opacity={0.96}
                    />
                  ))}

                  {/* 金属两脚钉（Split Pin）拟真紧固件：外圈金属垫片 + 内部两脚扣槽 */}
                  {part.hasSplitPin && (
                    <g transform={`translate(${pin.x}, ${pin.y})`} className="pointer-events-none">
                      {/* 金属垫圈深色背影 */}
                      <circle r="4.8" fill="rgba(0,0,0,0.3)" cy="0.8" />
                      {/* 铜质两脚钉主体圆帽 */}
                      <circle
                        r="4.2"
                        fill={`url(#brass-pin-grad-${animal.id})`}
                        stroke="#4A360A"
                        strokeWidth="0.9"
                      />
                      {/* 铆钉装订开口暗槽线 */}
                      <line
                        x1="-2.4"
                        y1="0"
                        x2="2.4"
                        y2="0"
                        stroke="#2B1F04"
                        strokeWidth="0.9"
                        strokeLinecap="round"
                      />
                    </g>
                  )}
                </motion.g>
              );
            })}
        </motion.g>
      </svg>
    </motion.div>
  );
};
