'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeOfDay, AnimalId, PuppetAnimationMood, Speaker } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import { PuppetRenderer } from '../animals/PuppetRenderer';
import { RangerPuppet } from '../animals/RangerPuppet';
import { BonfireCamp } from './BonfireCamp';
import {
  generateDioramaLayers,
  round1,
  clamp,
  cutScissorPath,
  circlePoints,
  starPoints,
  generatePaperGrainDataUrl,
} from '@/lib/dioramaEngine';
import {
  initializeAnimalRoamStates,
  updateAnimalRoam,
  ANIMAL_HABITATS,
  AnimalRoamState,
} from '@/lib/roamingEngine';
import { Scissors, Sun, Moon, Sparkles, Compass, Settings } from 'lucide-react';

interface AnimalPlacement {
  id: AnimalId;
  layer: 'tree' | 'clearing';
  scale: number;
  zIndex: number;
  signatureMood: PuppetAnimationMood;
  speechBubble: string;
  perchTitle: string;
}

export const FOREST_ANIMALS_PLACEMENT: Record<AnimalId, AnimalPlacement> = {
  woodpecker: {
    id: 'woodpecker',
    layer: 'tree',
    scale: 0.76,
    zIndex: 29,
    signatureMood: 'peck',
    speechBubble: '笃笃！情绪是珍贵信号，不是敌人！',
    perchTitle: '树干高处·攀跳巡查',
  },
  owl: {
    id: 'owl',
    layer: 'tree',
    scale: 0.80,
    zIndex: 27,
    signatureMood: 'thinking',
    speechBubble: '分清事实还是灾难猜测，别被想象绑架。',
    perchTitle: '高枝远端·稳健俯瞰',
  },
  squirrel: {
    id: 'squirrel',
    layer: 'tree',
    scale: 0.72,
    zIndex: 28,
    signatureMood: 'excited',
    speechBubble: '山一样的大难题，啃成小坚果就好啦！',
    perchTitle: '草甸地面·敏捷跑动',
  },
  bear: {
    id: 'bear',
    layer: 'tree',
    scale: 0.92,
    zIndex: 25,
    signatureMood: 'hug',
    speechBubble: '累了吧？先给自己一个暖烘烘的抱抱。',
    perchTitle: '树根草甸·慢悠踱步',
  },
  fox: {
    id: 'fox',
    layer: 'clearing',
    scale: 0.84,
    zIndex: 26,
    signatureMood: 'playful',
    speechBubble: '换个角度瞧瞧，翻转这面镜子别样美！',
    perchTitle: '花草斜坡·轻快漫步',
  },
  turtle: {
    id: 'turtle',
    layer: 'clearing',
    scale: 0.78,
    zIndex: 28,
    signatureMood: 'calm',
    speechBubble: '放进百年长河看，今天只是河床细沙。',
    perchTitle: '河岸平石·安然慢行',
  },
  otter: {
    id: 'otter',
    layer: 'clearing',
    scale: 0.80,
    zIndex: 26,
    signatureMood: 'paddle',
    speechBubble: '想法如落叶漂在溪流，任它顺水流走。',
    perchTitle: '清澈溪流·顺逆巡游',
  },
};

export interface AnimalPhysicalAnchor {
  x: number;
  y: number;
  perchType: 'trunk' | 'branch' | 'ledge' | 'ground' | 'slope' | 'stone' | 'water';
}

/**
 * 依据森林 9 层地形与古树几何坐标，计算动物物理真实的停歇落脚点
 */
export function computeAnimalAnchors(W: number, H: number): Record<AnimalId, AnimalPhysicalAnchor> {
  const treeX = W * 0.44;
  const treeY = H * 0.48;

  return {
    // 笃笃：紧扣于古树树干两侧，坚实尾羽与对趾足垂直咬合，左右交替啄击
    woodpecker: {
      x: Math.round(treeX - 80),
      y: Math.round(treeY - 50),
      perchType: 'trunk',
    },
    // 墨墨：双爪稳立于古树舒展横枝正上方的苔藓垫，重力垂直向下
    owl: {
      x: Math.round(treeX + 130),
      y: Math.round(treeY - 60),
      perchType: 'branch',
    },
    // 跳跳：机敏活跃在古树根脚草甸地面，怀抱坚果灵活穿梭
    squirrel: {
      x: Math.round(treeX + 45),
      y: Math.round(H * 0.66),
      perchType: 'ground',
    },
    // 团团：沉稳盘坐在古树左侧草甸根基，脚掌紧贴草坪，有地表重力暗影
    bear: {
      x: Math.round(treeX - 128),
      y: Math.round(H * 0.62),
      perchType: 'ground',
    },
    // 阿橘：四爪踏在第5层花草斜坡地表，脚下有草叶微遮与投影
    fox: {
      x: Math.round(W * 0.77),
      y: Math.round(H * 0.69),
      perchType: 'slope',
    },
    // 慢慢：腹甲平稳落在溪畔左岸突起的厚实苔藓平石上，承托沉重龟甲
    turtle: {
      x: Math.round(W * 0.22),
      y: Math.round(H * 0.74),
      perchType: 'stone',
    },
    // 漂漂：半浮于林间溪流清澈深水区，水面波纹环绕，随波浮动
    otter: {
      x: Math.round(W * 0.54),
      y: Math.round(H * 0.78),
      perchType: 'water',
    },
  };
}

interface AnimalPhysicalState {
  mood: PuppetAnimationMood;
  xOffset: number;
  yOffset: number;
  rotOffset: number;
  scaleY: number;
}

const AUTONOMOUS_THOUGHTS: Record<AnimalId, string[]> = {
  woodpecker: [
    '笃笃！每一声清脆啄击，都在倾听老树的呼吸。',
    '难受不用憋着，大声说出来就轻松了一半！',
    '坚硬的树皮下，藏着生机勃勃的春天呢。',
  ],
  owl: [
    '分清事实与灾难猜测，天空其实很晴朗。',
    '别被想象的恐惧困住，现实往往温和得多。',
    '风吹过树梢，树枝很稳，心也可以很安稳。',
  ],
  squirrel: [
    '山一样的大问题，拆成小坚果一颗颗啃！',
    '今天只藏眼前这一颗，明天的事明天再忙~',
    '小步跳跃，哪怕每次前进一点点也超棒！',
  ],
  bear: [
    '深吸一口气……先给自己一个温热的熊抱吧。',
    '阳光晒得背脊暖洋洋的，不急着赶路。',
    '允许自己疲惫，允许自己慢慢来。',
  ],
  fox: [
    '同一片树叶，逆着光看也是金灿灿的！',
    '换个角度瞧瞧，生活到处有隐藏的笑脸。',
    '跳出原来的框框，影子都能变出蝴蝶来。',
  ],
  turtle: [
    '吸气……呼气……百年长河里，今天只是一朵小浪花。',
    '走得慢没关系，河岸的青苔每一寸都有诗意。',
    '安顿当下，时间自会替我们抚平褶皱。',
  ],
  otter: [
    '想法就像水上漂落的纸叶，任它顺流漂走便是~',
    '羽毛不沾流水，心也不沾多余的挂碍。',
    '抖落水珠，扑棱一下，又是清清爽爽的一天！',
  ],
};

export interface CampfireSeatGeometry {
  x: number;
  y: number;
  facing: 1 | -1;
  scale: number;
  zIndex: number;
  perchType: 'stump' | 'stone' | 'log' | 'moss' | 'water';
}

export function computeCampfireSeats(W: number, H: number): {
  fireX: number;
  fireY: number;
  ranger: CampfireSeatGeometry;
  seats: Record<AnimalId, CampfireSeatGeometry>;
} {
  const isMobile = W < 640;
  const fireX = Math.round(W * 0.50);
  const fireY = Math.round(H * (isMobile ? 0.835 : 0.825));
  const Rx = isMobile
    ? Math.min(150, Math.max(90, Math.round(W * 0.38)))
    : Math.min(260, Math.max(160, Math.round(W * 0.26)));
  const Ry = isMobile
    ? Math.min(46, Math.max(26, Math.round(H * 0.052)))
    : Math.min(52, Math.max(34, Math.round(H * 0.058)));
  const sc = isMobile ? 0.74 : 1.0;

  return {
    fireX,
    fireY,
    ranger: {
      x: fireX,
      y: fireY - Ry - (isMobile ? 18 : 24),
      facing: 1,
      scale: 0.84 * sc,
      zIndex: 22,
      perchType: 'log',
    },
    seats: {
      woodpecker: {
        x: Math.round(fireX - Rx * 0.66),
        y: Math.round(fireY - Ry * 0.68),
        facing: 1,
        scale: 0.78 * sc,
        zIndex: 24,
        perchType: 'stump',
      },
      owl: {
        x: Math.round(fireX + Rx * 0.66),
        y: Math.round(fireY - Ry * 0.68),
        facing: -1,
        scale: 0.80 * sc,
        zIndex: 24,
        perchType: 'stone',
      },
      bear: {
        x: Math.round(fireX - Rx * 0.92),
        y: Math.round(fireY - 4),
        facing: 1,
        scale: 0.94 * sc,
        zIndex: 30,
        perchType: 'moss',
      },
      fox: {
        x: Math.round(fireX + Rx * 0.92),
        y: Math.round(fireY - 4),
        facing: -1,
        scale: 0.88 * sc,
        zIndex: 30,
        perchType: 'moss',
      },
      turtle: {
        x: Math.round(fireX - Rx * 0.62),
        y: Math.round(fireY + Ry * 0.68),
        facing: 1,
        scale: 0.84 * sc,
        zIndex: 36,
        perchType: 'stone',
      },
      squirrel: {
        x: Math.round(fireX + Rx * 0.62),
        y: Math.round(fireY + Ry * 0.68),
        facing: -1,
        scale: 0.76 * sc,
        zIndex: 36,
        perchType: 'moss',
      },
      otter: {
        x: fireX,
        y: Math.round(fireY + Ry * 0.86),
        facing: 1,
        scale: 0.80 * sc,
        zIndex: 38,
        perchType: 'moss',
      },
    },
  };
}

interface SceneStageProps {
  timeOfDay?: TimeOfDay;
  showAllAnimals?: boolean;
  selectedAnimal?: AnimalId;
  animalMood?: PuppetAnimationMood;
  animalMoods?: Partial<Record<AnimalId, PuppetAnimationMood>>;
  parallaxStrength?: number;
  autoDrift?: boolean;
  onAnimalClick?: (animalId: AnimalId) => void;
  className?: string;
  showDebugInfo?: boolean;
  campfireMode?: boolean;
  activeSpeaker?: Speaker | null;
  isUserTyping?: boolean;
  onRangerClick?: () => void;
  onStartCampfire?: () => void;
  onOpenSettings?: () => void;
  showFrame?: boolean;
}

interface LeafParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  phase: number;
  size: number;
  active: boolean;
  ambient: boolean;
}

export const SceneStage: React.FC<SceneStageProps> = ({
  timeOfDay = 'noon',
  showAllAnimals = true,
  selectedAnimal = 'bear',
  animalMood = 'idle',
  animalMoods,
  parallaxStrength = 1.0,
  autoDrift = true,
  onAnimalClick,
  className = '',
  campfireMode = false,
  activeSpeaker = null,
  isUserTyping = false,
  onRangerClick,
  onStartCampfire,
  onOpenSettings,
  showFrame = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fliesCanvasRef = useRef<HTMLCanvasElement>(null);

  // 1. 种子与尺寸状态
  const [seed, setSeed] = useState(1847);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 750 });
  const [grainUrl, setGrainUrl] = useState('');

  // 2. 交互状态
  const [hoveredAnimal, setHoveredAnimal] = useState<AnimalId | null>(null);
  const [mouseRatio, setMouseRatio] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isRecutting, setIsRecutting] = useState(false);

  // 核心：基于领地边界与真实地形的动物自主自由走动与步态引擎 (Autonomous Roaming)
  const [roamStates, setRoamStates] = useState<Record<AnimalId, AnimalRoamState>>(() =>
    initializeAnimalRoamStates(dimensions.width, dimensions.height)
  );

  const [autonomousThought, setAutonomousThought] = useState<{
    animalId: AnimalId;
    text: string;
  } | null>(null);

  // 尺寸变化时自动同步各动物坐标与地形
  useEffect(() => {
    setRoamStates((prev) => {
      const next = { ...prev };
      const treeX = dimensions.width * 0.44;
      const treeY = dimensions.height * 0.48;

      (Object.keys(ANIMAL_HABITATS) as AnimalId[]).forEach((id) => {
        const habitat = ANIMAL_HABITATS[id];
        const s = next[id];
        if (s) {
          if (id === 'woodpecker') {
            s.x = s.trunkSide === 'left' ? Math.round(treeX - 80) : Math.round(treeX + 78);
            s.targetX = s.x;
            s.y = Math.round(treeY - 50);
            s.targetY = s.y;
            return;
          }
          if (id === 'bear') {
            s.x = Math.max(dimensions.width * 0.22, Math.min(dimensions.width * 0.38, s.x));
            s.y = Math.max(dimensions.height * 0.58, Math.min(dimensions.height * 0.66, s.y));
            return;
          }
          if (id === 'squirrel') {
            s.x = Math.max(dimensions.width * 0.38, Math.min(dimensions.width * 0.54, s.x));
            s.y = Math.max(dimensions.height * 0.63, Math.min(dimensions.height * 0.70, s.y));
            return;
          }
          const minX = dimensions.width * habitat.minXRatio;
          const maxX = dimensions.width * habitat.maxXRatio;
          s.x = Math.max(minX, Math.min(maxX, s.x));
          s.y = habitat.getY(s.x, dimensions.width, dimensions.height, treeX, treeY);
          s.targetX = Math.max(minX, Math.min(maxX, s.targetX));
          s.targetY = habitat.getY(s.targetX, dimensions.width, dimensions.height, treeX, treeY);
        }
      });
      return next;
    });
  }, [dimensions.width, dimensions.height]);

  // 动物自主自由走动动画物理循环 (Continuous Locomotion & Physics Loop)
  useEffect(() => {
    if (reducedMotion) return;
    let frameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      setRoamStates((prev) => updateAnimalRoam(prev, dt, dimensions.width, dimensions.height));
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion, dimensions.width, dimensions.height]);

  // 自主微心声温情脉动 (每 18 秒森林中一只动物自发沉思浮现微气泡)
  useEffect(() => {
    const animalIds: AnimalId[] = ['woodpecker', 'owl', 'squirrel', 'bear', 'fox', 'turtle', 'otter'];
    let hideTimer: NodeJS.Timeout;

    const triggerThought = () => {
      const randomId = animalIds[Math.floor(Math.random() * animalIds.length)];
      const thoughts = AUTONOMOUS_THOUGHTS[randomId];
      const text = thoughts[Math.floor(Math.random() * thoughts.length)];
      setAutonomousThought({ animalId: randomId, text });

      hideTimer = setTimeout(() => {
        setAutonomousThought((curr) => (curr?.animalId === randomId ? null : curr));
      }, 4200);
    };

    const interval = setInterval(triggerThought, 18000);
    const initialTimer = setTimeout(triggerThought, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // 物理悬挂标牌摆角
  const tagAngleRef = useRef(-2.5);
  const tagVelocityRef = useRef(0);
  const [renderedTagAngle, setRenderedTagAngle] = useState(-2.5);

  const isNight = timeOfDay === 'night' || campfireMode;

  // 检查 prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 生成纸张真实棉麻纤维与噪点纹理
  useEffect(() => {
    try {
      const url = generatePaperGrainDataUrl();
      if (url) setGrainUrl(url);
    } catch (e) {
      console.warn('Paper grain texture error:', e);
    }
  }, []);

  // 监听容器实际尺寸更新
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.max(360, Math.round(rect.width));
      const h = Math.max(480, Math.round(rect.height));
      setDimensions({ width: w, height: h });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 视差追踪
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 ~ 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMouseRatio({ x, y });

      // 给吊牌施加轻微推力
      tagVelocityRef.current -= (e.movementX || 0) * 0.45;
    },
    [reducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    if (!reducedMotion) {
      setMouseRatio({ x: 0, y: 0 });
    }
  }, [reducedMotion]);

  // 移动端触摸滑动交互 (Touch Parallax)
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (reducedMotion || !containerRef.current || !e.touches[0]) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width - 0.5;
      const y = (touch.clientY - rect.top) / rect.height - 0.5;
      setMouseRatio({
        x: Math.max(-0.5, Math.min(0.5, x)),
        y: Math.max(-0.5, Math.min(0.5, y)),
      });
    },
    [reducedMotion]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!containerRef.current || !e.touches[0]) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      triggerLeafBurst(touch.clientX - rect.left, touch.clientY - rect.top);
    },
    []
  );

  // 移动端陀螺仪重力感应视差 (DeviceOrientation Hologram Effect)
  useEffect(() => {
    if (reducedMotion) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma: 左右倾斜 [-90, 90] => 映射为 -0.5 ~ 0.5
      const gx = (Math.max(-30, Math.min(30, e.gamma)) / 30) * 0.45;
      // beta: 前后仰角 (默认拿手机仰角在 40~50 度之间)
      const gy = (Math.max(-30, Math.min(30, e.beta - 45)) / 30) * 0.45;
      setMouseRatio((prev) => ({
        x: prev.x * 0.82 + gx * 0.18,
        y: prev.y * 0.82 + gy * 0.18,
      }));
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [reducedMotion]);

  // 自动呼吸缓动漂移
  useEffect(() => {
    if (reducedMotion || !autoDrift) return;
    let frameId: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const driftX = Math.sin(elapsed * 0.55) * 0.08;
      const driftY = Math.cos(elapsed * 0.75) * 0.05;

      setMouseRatio((prev) => ({
        x: prev.x * 0.96 + driftX * 0.04,
        y: prev.y * 0.96 + driftY * 0.04,
      }));

      // 吊牌阻尼摆动计算
      const dt = 0.016;
      const rest = -2.2 + Math.sin(elapsed * 0.7) * 0.6;
      tagVelocityRef.current +=
        (-(tagAngleRef.current - rest) * 24 - tagVelocityRef.current * 2.5) * dt;
      tagAngleRef.current += tagVelocityRef.current * dt;
      tagAngleRef.current = clamp(tagAngleRef.current, -14, 14);
      setRenderedTagAngle(tagAngleRef.current);

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion, autoDrift]);

  // ==================== 核心：程序化计算 9 层纸雕几何数据 ====================
  const dioramaData = useMemo(() => {
    return generateDioramaLayers(dimensions.width, dimensions.height, seed);
  }, [dimensions.width, dimensions.height, seed]);

  // ==================== 粒子系统：萤火虫与落叶 ====================
  // 萤火虫 Canvas 渲染
  useEffect(() => {
    const canvas = fliesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: W, height: H } = dimensions;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    const nFlies = W < 640 ? 18 : 34;
    const flies: Array<{
      x: number;
      y: number;
      angle: number;
      speed: number;
      phase: number;
      blinkRate: number;
      scale: number;
    }> = [];

    for (let i = 0; i < nFlies; i++) {
      flies.push({
        x: Math.random() * W,
        y: H * (0.45 + Math.random() * 0.5),
        angle: Math.random() * Math.PI * 2,
        speed: 12 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        blinkRate: 0.6 + Math.random() * 0.8,
        scale: 0.6 + Math.random() * 0.6,
      });
    }

    let animId: number;
    let clock = 0;

    const renderFlies = () => {
      clock += 0.016;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (const f of flies) {
        f.angle += Math.sin(clock * 0.7 + f.phase) * 0.025;
        f.x += Math.cos(f.angle) * f.speed * 0.016;
        f.y += Math.sin(f.angle) * f.speed * 0.012;

        if (f.x < -20) f.x = W + 20;
        if (f.x > W + 20) f.x = -20;
        if (f.y < H * 0.4) f.y = H * 0.95;
        if (f.y > H * 0.96) f.y = H * 0.42;

        if (isNight) {
          // 夜间：暖金色萤火光球
          const blink = Math.max(0, Math.sin(clock * f.blinkRate * 2 + f.phase)) * 0.8 + 0.2;
          const rad = (6 + blink * 8) * f.scale;
          const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
          grad.addColorStop(0, 'rgba(255, 250, 190, 0.95)');
          grad.addColorStop(0.3, 'rgba(246, 226, 120, 0.6)');
          grad.addColorStop(1, 'rgba(210, 230, 90, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(f.x, f.y, rad, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 白昼：微弱金色花粉微粒
          ctx.fillStyle = 'rgba(255, 245, 220, 0.45)';
          ctx.beginPath();
          ctx.arc(f.x, f.y, 1.2 * f.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(renderFlies);
    };

    animId = requestAnimationFrame(renderFlies);
    return () => cancelAnimationFrame(animId);
  }, [dimensions, isNight]);

  // 翻转飘落双面纸叶列表
  const [leaves, setLeaves] = useState<LeafParticle[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 1000,
      y: Math.random() * 600,
      vx: 12 + Math.random() * 16,
      vy: 18 + Math.random() * 24,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 60,
      phase: Math.random() * 6,
      size: 0.8 + Math.random() * 0.6,
      active: true,
      ambient: true,
    }));
  });

  // 点击林间触发叶片爆发喷溅
  const triggerLeafBurst = (cx: number, cy: number) => {
    setLeaves((prev) =>
      prev.map((leaf, idx) => {
        if (idx < 4) {
          return {
            ...leaf,
            x: cx,
            y: cy,
            vx: (Math.random() - 0.5) * 120,
            vy: -40 - Math.random() * 50,
            rot: Math.random() * 360,
            vr: (Math.random() - 0.5) * 120,
          };
        }
        return leaf;
      })
    );
  };

  // 重剪森林（Recut）
  const handleRecutForest = () => {
    setIsRecutting(true);
    setSeed(Math.floor(Math.random() * 1000000));
    setTimeout(() => setIsRecutting(false), 800);
  };

  const campfireSeats = useMemo(
    () => computeCampfireSeats(dimensions.width, dimensions.height),
    [dimensions.width, dimensions.height]
  );

  const isRangerSpeaking = activeSpeaker === 'ranger' || activeSpeaker === 'tree';

  // 篝火模式下的 360° 围坐动物渲染 (带有营地坐垫、朝向火堆、发言高亮光环)
  const renderCampfireAnimal = (id: AnimalId, seat: CampfireSeatGeometry) => {
    const animal = ANIMALS[id];
    const isSpeaking = activeSpeaker === id;
    const isHovered = hoveredAnimal === id;

    const mood = isUserTyping
      ? id === 'bear'
        ? 'gentle'
        : id === 'owl'
        ? 'thinking'
        : 'nod'
      : isSpeaking
      ? (animalMoods?.[id] || 'nod')
      : (animalMoods?.[id] || 'idle');

    return (
      <motion.div
        key={`campfire_${id}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          y: isSpeaking ? -14 : 0,
          scale: isSpeaking ? seat.scale * 1.14 : seat.scale,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute flex flex-col items-center cursor-pointer transition-all -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        style={{
          left: `${seat.x}px`,
          top: `${seat.y}px`,
          zIndex: isSpeaking ? 48 : seat.zIndex,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onAnimalClick?.(id);
        }}
        onMouseEnter={() => setHoveredAnimal(id)}
        onMouseLeave={() => setHoveredAnimal(null)}
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
            layoutId="campfire-speaking-glow"
            className="absolute -bottom-2 w-24 h-6 rounded-full bg-amber-400/50 blur-xs -z-10 border border-amber-500/60 animate-pulse pointer-events-none"
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
            <div className="absolute inset-x-2 top-0 h-2 bg-[#709B3E] rounded-full border border-[#4C6D27]" />
          </div>
        )}

        {/* 动物纸偶 (朝向中央篝火) */}
        <div
          style={{
            transform: `scaleX(${seat.facing})`,
            transformOrigin: 'bottom center',
          }}
        >
          <PuppetRenderer
            animalId={id}
            mood={mood}
            scale={0.76}
            interactive={true}
          />
        </div>

        {/* 动物名牌标签 */}
        <div
          className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors shadow-xs ${
            isSpeaking
              ? 'bg-[#C84630] text-white border-[#8C2E1D]'
              : 'bg-[#152B20]/90 text-[#F4EBD9] border-[#365A46]'
          }`}
        >
          {animal.name}
        </div>
      </motion.div>
    );
  };

  // ==================== 渲染林间动物角色 (支持自由走动、朝向翻转与实时伴随阴影) ====================
  const renderAnimalItem = (id: AnimalId) => {
    const p = FOREST_ANIMALS_PLACEMENT[id];
    const animal = ANIMALS[id];
    const isHovered = hoveredAnimal === id;
    const isCompanion = selectedAnimal === id;
    const roam = roamStates[id];
    const habitat = ANIMAL_HABITATS[id];

    // 交互优先级：悬停互动 > 伙伴选定 > 自主生物节律/行走姿态 > idle
    const currentMood =
      animalMoods?.[id] ||
      (isHovered
        ? p.signatureMood
        : selectedAnimal === id
        ? animalMood
        : roam?.mood || 'idle');

    // 依附点物理对齐锚点
    const baseTranslate =
      habitat.anchorType === 'water'
        ? 'translate(-50%, -72%)'
        : habitat.anchorType === 'trunk'
        ? 'translate(-50%, -50%)'
        : 'translate(-50%, -88%)';

    const currentX = roam ? roam.x : dimensions.width * 0.5;
    const currentY = roam ? roam.y : dimensions.height * 0.5;
    const facing = roam ? roam.facing : 1;
    const bodyBob = roam ? roam.bodyBob : 0;
    const rotOffset = roam ? roam.rotOffset : 0;
    const scaleY = roam ? roam.scaleY : 1;
    const depthScale = roam ? roam.depthScale : 1;

    return (
      <div
        key={id}
        className="absolute pointer-events-auto group cursor-pointer"
        style={{
          left: `${Math.round(currentX)}px`,
          top: `${Math.round(currentY)}px`,
          transform: `${baseTranslate} translate3d(0, ${bodyBob.toFixed(1)}px, 0) rotate(${rotOffset.toFixed(1)}deg)`,
          transformOrigin: habitat.anchorType === 'water' ? 'center' : 'bottom center',
          zIndex: isHovered ? 52 : Math.round(p.zIndex + (currentY > dimensions.height * 0.6 ? 2 : 0)),
        }}
        onMouseEnter={() => setHoveredAnimal(id)}
        onMouseLeave={() => setHoveredAnimal(null)}
        onClick={(e) => {
          e.stopPropagation();
          onAnimalClick?.(id);
        }}
      >
        {/* 顶部名牌与微气泡 (正向排版，绝不镜像反转) */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none transition-all duration-200 z-50">
          <motion.div
            animate={isHovered ? { scale: 1.08, y: -2 } : { scale: 1, y: 0 }}
            className={`px-2.5 py-0.5 rounded-full border shadow-sm text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
              isCompanion
                ? 'bg-[#E5EFE3] text-[#23481F] border-[#38662F]'
                : 'bg-[#FAF7EE]/95 text-[#4D3524] border-[#8C6648]/40 group-hover:bg-[#E5EFE3] group-hover:text-[#23481F] group-hover:border-[#38662F]'
            }`}
          >
            <span>{animal.name}</span>
            {isCompanion && (
              <span className="text-[9px] bg-[#38662F] text-white px-1.5 py-0.2 rounded-full">
                伙伴
              </span>
            )}
            {isHovered ? (
              <span className="text-[10px] text-[#38662F] font-normal">
                · {animal.gameName}
              </span>
            ) : (
              <span className="text-[9px] text-[#7A5B43] font-normal opacity-85">
                · {roam?.statusText || p.perchTitle}
              </span>
            )}
          </motion.div>

          {/* 悬停时弹出的微型金句提示气泡 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 3, scale: 0.95 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-white border border-[#38662F]/40 shadow-md text-[10px] text-[#3B2D25] whitespace-nowrap pointer-events-none paper-rough-edge z-50"
              >
                <span>{p.speechBubble}</span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-[#38662F]/40 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 自主心声温情浮现 (非悬停时柔和呈现) */}
          <AnimatePresence>
            {autonomousThought?.animalId === id && !isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.92 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#A3431F]/35 shadow-md text-[10px] font-medium text-[#4A3220] whitespace-nowrap pointer-events-none paper-rough-edge z-50 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#A3431F] animate-pulse" />
                <span>{autonomousThought.text}</span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FAF7EE] border-b border-r border-[#A3431F]/35 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 纸偶脚下实时伴随的地面接触阴影 / 水纹 (随漫步实时跟随，等比例随纵深缩放) */}
        {habitat.anchorType === 'ground' && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none diorama-ground-shadow"
            style={{
              width: `${Math.round((id === 'squirrel' ? 76 : 112) * depthScale)}px`,
              height: `${Math.round((id === 'squirrel' ? 16 : 24) * depthScale)}px`,
              background: 'radial-gradient(ellipse at center, rgba(20, 36, 18, 0.45) 0%, rgba(20, 36, 18, 0) 72%)',
            }}
          />
        )}
        {habitat.anchorType === 'slope' && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none diorama-ground-shadow"
            style={{
              width: `${Math.round(88 * depthScale)}px`,
              height: `${Math.round(20 * depthScale)}px`,
              background: 'radial-gradient(ellipse at center, rgba(20, 36, 18, 0.4) 0%, rgba(20, 36, 18, 0) 70%)',
            }}
          />
        )}
        {habitat.anchorType === 'branch' && id === 'owl' && (
          <div
            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full pointer-events-none diorama-ground-shadow"
            style={{
              width: `${Math.round(48 * depthScale)}px`,
              height: '6px',
              background: 'radial-gradient(ellipse at center, rgba(25, 38, 20, 0.55) 0%, rgba(25, 38, 20, 0) 75%)',
            }}
          />
        )}
        {habitat.anchorType === 'water' && (
          <div
            className="absolute top-[68%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: `${Math.round(96 * depthScale)}px`,
              height: `${Math.round(32 * depthScale)}px`,
            }}
          >
            <div className="w-full h-full rounded-full border border-[#90C5D8]/70 diorama-ripple-pulse" />
          </div>
        )}

        {/* 朝向水平翻转容器 (仅在 facing 改变时平滑过渡，绝不被每帧更新打断) */}
        <div
          style={{
            transform: `scaleX(${facing})`,
            transformOrigin: habitat.anchorType === 'water' ? 'center' : 'bottom center',
            transition: 'transform 0.22s cubic-bezier(0.34, 1.4, 0.64, 1)',
            willChange: 'transform',
          }}
        >
          {/* 纵深等比例缩放与微呼吸容器 (严格等比例 scale，确保熊与所有动物绝不被压扁) */}
          <div
            style={{
              transform: `scale(${depthScale}) scaleY(${scaleY})`,
              transformOrigin: habitat.anchorType === 'water' ? 'center' : 'bottom center',
              width: 'max-content',
              height: 'max-content',
            }}
          >
            <PuppetRenderer
              animalId={id}
              mood={currentMood}
              scale={p.scale}
              shadowOffset={{ x: 5, y: isNight ? 12 : 8 }}
              interactive={false}
            />
          </div>
        </div>
      </div>
    );
  };

  const {
    W,
    H,
    M,
    lw,
    lh,
    d1,
    d2,
    roofs,
    wins,
    cottageGlows,
    d3,
    d4,
    riverPath,
    ripples,
    glints,
    d5,
    d6,
    d7,
    tufts,
    burrow,
    mStems,
    mCaps,
    mDots,
    ferns,
    fall1,
    fall2,
    pebbles,
    d8,
    fg2,
    stalks,
    bells,
    inner,
    mat,
    frame,
    sunD,
    sunX,
    sunY,
    sunRays,
    moonD,
    cloudsConfig,
    starsConfig,
    pinStars,
  } = dioramaData;

  const stageTiltX = reducedMotion ? 0 : -mouseRatio.y * 12 * parallaxStrength;
  const stageTiltY = reducedMotion ? 0 : mouseRatio.x * 16 * parallaxStrength;

  // 视差层间位移因子
  const getParallaxStyle = (depth: number) => {
    if (reducedMotion) return {};
    const depthFactor = Math.pow(depth / 8, 1.15) * 28 * parallaxStrength;
    const px = -mouseRatio.x * depthFactor;
    const py = -mouseRatio.y * depthFactor * 0.55;
    return {
      transform: `translate3d(${round1(px)}px, ${round1(py)}px, 0)`,
      transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
    };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          triggerLeafBurst(e.clientX - rect.left, e.clientY - rect.top);
        }
      }}
      className={`relative w-full h-full overflow-hidden select-none preserve-3d perspective-stage diorama-container ${
        showFrame ? 'rounded-3xl shadow-2xl' : ''
      } ${
        isNight ? 'night' : ''
      } ${className}`}
      style={{
        background: isNight
          ? 'radial-gradient(95% 70% at 70% 20%, #3a3f8a 0%, #252a69 36%, #161a45 72%, #10132f 100%)'
          : 'radial-gradient(120% 75% at 70% 22%, #fbf3e1 0%, #f3e8d2 42%, #ecd9b4 100%)',
        transition: 'background 1.4s ease',
      }}
    >
      {/* SVG 共享滤镜与纸纹图案定义 */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <pattern
            id="dioramaGrainPat"
            patternUnits="userSpaceOnUse"
            width="160"
            height="160"
          >
            {grainUrl && (
              <image href={grainUrl} width="160" height="160" />
            )}
          </pattern>
          <radialGradient id="cottageWinGlow">
            <stop offset="0" stopColor="#ffd98a" stopOpacity="0.8" />
            <stop offset="0.45" stopColor="#ffc766" stopOpacity="0.25" />
            <stop offset="1" stopColor="#ffc766" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* 整体 2.5D 立体倾斜透视舞台 */}
      <div
        className="relative w-full h-full preserve-3d will-change-transform"
        style={{
          transform: `rotateX(${stageTiltX.toFixed(2)}deg) rotateY(${stageTiltY.toFixed(
            2
          )}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* ==================== 天空底衬与夜空针孔星芒 (Sky & Pins) ==================== */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full object-cover opacity-80" aria-hidden="true">
            <rect width="100%" height="100%" fill="url(#dioramaGrainPat)" />
          </svg>

          {/* 夜空针孔闪烁星星 */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${
              isNight ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {pinStars.map((pin, idx) => (
              <circle
                key={idx}
                cx={pin.cx}
                cy={pin.cy}
                r={pin.r}
                fill="#FFF4D6"
                className={pin.twinkle ? 'diorama-twinkle' : ''}
                style={{ animationDelay: `${pin.delay}s` }}
              />
            ))}
          </svg>
        </div>

        {/* ==================== 悬挂层：日月星云吊挂系统 (Z: -260px) ==================== */}
        <div
          className="absolute inset-0 pointer-events-none preserve-3d"
          style={getParallaxStyle(0.6)}
        >
          {/* 白昼太阳：齿轮折纸金轮 */}
          <div
            className={`diorama-hang day transition-transform duration-1000 ${
              isNight ? 'translate-y-[-180px]' : 'translate-y-0'
            }`}
            style={{
              left: `${sunX}px`,
              top: '0px',
              ['--len' as string]: `${sunY}px`,
              ['--up' as string]: '260',
            }}
          >
            <div className="diorama-swing" style={{ ['--sd' as string]: '6.5s' }}>
              <span className="diorama-string" />
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/4"
                style={{ top: `${sunY}px` }}
              >
                <svg
                  viewBox="-62 -62 124 124"
                  width={sunD}
                  height={sunD}
                  className="overflow-visible"
                >
                  <path fill="#C8642D" d={cutScissorPath(sunRays, 0.5, 5)} />
                  <path
                    fill="#D9A45B"
                    d={cutScissorPath(circlePoints(0, 0, 42, 40), 0.5, 5)}
                  />
                  <path
                    fill="#E6B772"
                    d={cutScissorPath(circlePoints(-4, -5, 29, 30), 0.4, 5)}
                  />
                  <path
                    fill="url(#dioramaGrainPat)"
                    d={cutScissorPath(circlePoints(0, 0, 42, 40), 0.1, 50)}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 夜晚月亮：温润镂空明月与暖金光晕 */}
          <div
            className={`diorama-hang nite transition-transform duration-1000 ${
              isNight ? 'translate-y-0' : 'translate-y-[-240px]'
            }`}
            style={{
              left: `${sunX - 20}px`,
              top: '0px',
              ['--len' as string]: `${sunY}px`,
              ['--up' as string]: '260',
            }}
          >
            <div className="diorama-swing" style={{ ['--sd' as string]: '5.8s' }}>
              <span className="diorama-string" />
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/4"
                style={{ top: `${sunY}px` }}
              >
                <span className="diorama-halo" />
                <svg
                  viewBox="-50 -50 100 100"
                  width={moonD}
                  height={moonD}
                  className="relative overflow-visible"
                >
                  <path
                    fill="#F5ECD6"
                    d={cutScissorPath(circlePoints(0, 0, 44, 44), 0.5, 5)}
                  />
                  <path
                    fill="#E3D4B3"
                    d={
                      cutScissorPath(circlePoints(-14, -10, 9, 14), 0.4, 3) +
                      cutScissorPath(circlePoints(12, 8, 6, 10), 0.3, 3) +
                      cutScissorPath(circlePoints(-6, 18, 5, 9), 0.3, 3)
                    }
                  />
                  <path
                    fill="url(#dioramaGrainPat)"
                    d={cutScissorPath(circlePoints(0, 0, 44, 40), 0.1, 50)}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 悬挂纸云 */}
          {cloudsConfig.map(([cx, cy, sc], i) => (
            <div
              key={i}
              className={`diorama-hang day ${isNight ? 'opacity-40' : 'opacity-90'}`}
              style={{
                left: `${W * cx}px`,
                top: '0px',
                ['--len' as string]: `${H * cy}px`,
                ['--up' as string]: '200',
              }}
            >
              <div
                className="diorama-swing"
                style={{ ['--sd' as string]: `${4.5 + i * 1.5}s` }}
              >
                <span className="diorama-string" />
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: `${H * cy}px` }}
                >
                  <svg
                    viewBox="-52 -36 104 60"
                    width={sunD * 1.2 * sc}
                    height={sunD * 0.7 * sc}
                  >
                    <path
                      fill="#FBF6EA"
                      d={
                        cutScissorPath(circlePoints(-28, 4, 16), 0.5, 5) +
                        cutScissorPath(circlePoints(-8, -8, 22), 0.5, 5) +
                        cutScissorPath(circlePoints(16, -4, 18), 0.5, 5) +
                        cutScissorPath(circlePoints(32, 6, 12), 0.5, 5)
                      }
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {/* 丝线悬挂小星星 (夜间格外清晰) */}
          {isNight &&
            starsConfig.map(([sx, sy], i) => (
              <div
                key={i}
                className="diorama-hang nite"
                style={{
                  left: `${W * sx}px`,
                  top: '0px',
                  ['--len' as string]: `${H * sy}px`,
                }}
              >
                <div
                  className="diorama-swing"
                  style={{ ['--sd' as string]: `${3.5 + i * 0.8}s` }}
                >
                  <span className="diorama-string" />
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: `${H * sy}px` }}
                  >
                    <svg viewBox="-12 -12 24 24" width={22} height={22}>
                      <path
                        fill="#E8B865"
                        d={cutScissorPath(starPoints(11, 4.6), 0.2, 3)}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* ==================== 第 1 层：远山纸峦 (L1, Z: -220px) ==================== */}
        <div
          className={`absolute inset-0 pointer-events-none diorama-cut ${
            isRecutting ? 'diorama-place' : ''
          }`}
          style={{ ...getParallaxStyle(1), ['--sh' as string]: 3 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full overflow-visible"
          >
            <path className="c-far" d={d1} />
            <path className="c-far opacity-50" fill="url(#dioramaGrainPat)" d={d1} />
          </svg>
        </div>

        {/* ==================== 第 2 层：起伏丘陵与温情木屋 (L2, Z: -170px) ==================== */}
        <div
          className={`absolute inset-0 pointer-events-none diorama-cut ${
            isRecutting ? 'diorama-place' : ''
          }`}
          style={{ ...getParallaxStyle(2), ['--sh' as string]: 3 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full overflow-visible"
          >
            <path className="c-hill" d={d2} />
            <path className="c-roof" d={roofs} />
            <path
              className="opacity-40"
              fill="url(#dioramaGrainPat)"
              d={d2 + roofs}
            />
            {cottageGlows.map((glow, i) => (
              <circle
                key={i}
                className="c-winglow"
                cx={glow.cx}
                cy={glow.cy}
                r={glow.r}
                fill="url(#cottageWinGlow)"
              />
            ))}
            <path className="c-win" d={wins} />
          </svg>
        </div>

        {/* ==================== 第 3 层：灰绿松木山脊 (L3, Z: -110px) ==================== */}
        <div
          className={`absolute inset-0 pointer-events-none diorama-cut ${
            isRecutting ? 'diorama-place' : ''
          }`}
          style={{ ...getParallaxStyle(3), ['--sh' as string]: 4 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full overflow-visible"
          >
            <path className="c-ridge" d={d3} />
            <path className="opacity-30" fill="url(#dioramaGrainPat)" d={d3} />
          </svg>
        </div>

        {/* ==================== 第 4 层：中景古树、草甸与蜿蜒溪流 (L4, Z: -20px) ==================== */}
        <div
          className={`absolute inset-0 pointer-events-none diorama-cut ${
            isRecutting ? 'diorama-place' : ''
          }`}
          style={{ ...getParallaxStyle(4), ['--sh' as string]: 4 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full overflow-visible"
          >
            {/* 草甸基底与溪流 */}
            <path className="c-meadow" d={d4} />
            <path className="c-river" d={riverPath} />
            <path className="c-ripple" d={ripples} />
            {glints.map((g, idx) => (
              <path
                key={idx}
                className="c-glint"
                d={g.d}
                style={{ animationDelay: `${g.delay}s` }}
              />
            ))}
            <path className="opacity-30" fill="url(#dioramaGrainPat)" d={d4} />

            {/* 巨大中景古树「岁岁」 (手工纸雕/多层剪纸艺术重构) */}
            <g transform={`translate(${W * 0.44}, ${H * 0.48})`}>
              {/* === 1. 远层深墨绿树冠背影 (Back Foliage Shadow) === */}
              <path
                d="M -180,-95 C -225,-175 -145,-265 -10,-250 C 80,-305 235,-255 255,-165 C 310,-100 255,-15 180,-5 C 130,35 25,25 -25,-15 C -120,-5 -165,-45 -180,-95 Z"
                fill={isNight ? '#0C2012' : '#1F3F22'}
                stroke={isNight ? '#07140B' : '#142B17'}
                strokeWidth="2.5"
              />

              {/* === 2. 扎根大地的盘根错节纸雕 (Deep Roots Anchoring into Earth) === */}
              {/* 左侧延展苍劲老根 */}
              <path
                d="M -28,110 C -48,132 -88,155 -128,172 C -96,168 -60,150 -32,132 Z"
                fill="#3A2518"
                stroke="#24160E"
                strokeWidth="2"
              />
              <path
                d="M -30,118 C -52,138 -82,156 -112,166 C -86,160 -56,144 -34,128 Z"
                fill="#4E3322"
              />
              {/* 右侧抓地老根 */}
              <path
                d="M 32,112 C 58,132 98,154 132,168 C 106,162 70,146 38,130 Z"
                fill="#3A2518"
                stroke="#24160E"
                strokeWidth="2"
              />
              <path
                d="M 34,120 C 56,138 86,154 114,162 C 92,156 64,142 38,126 Z"
                fill="#4E3322"
              />
              {/* 树根基底厚实苔藓垫与小纸花 */}
              <path
                d="M -95,160 C -78,152 -55,150 -42,156 C -55,160 -78,164 -95,160 Z"
                fill="#3D5C32"
                opacity="0.95"
              />
              <path
                d="M 45,145 C 62,140 85,146 102,154 C 84,156 62,152 45,145 Z"
                fill="#3D5C32"
                opacity="0.95"
              />

              {/* === 3. 树干基体与双层纸雕木纹 (Textured Layered Trunk) === */}
              {/* 树干外轮廓 */}
              <path
                d="M -38,160 C -32,60 -52,-10 -26,-120 C 18,-120 38,40 48,160 Z"
                fill="#4A3122"
                stroke="#2E1C12"
                strokeWidth="2.5"
              />
              {/* 树干内层受光面纸雕贴片 */}
              <path
                d="M -26,-115 C -42,-10 -25,60 -28,155 C -12,158 18,158 36,155 C 26,50 12,-10 14,-115 Z"
                fill="#593C2A"
              />
              {/* 树干真纸纹理叠层 */}
              <path
                d="M -38,160 C -32,60 -52,-10 -26,-120 C 18,-120 38,40 48,160 Z"
                fill="url(#dioramaGrainPat)"
                opacity="0.3"
              />

              {/* 树皮深浅有机木纹线条 (手刻凹槽线) */}
              <g opacity="0.8">
                <path
                  d="M -22,-95 C -18,-45 -24,20 -18,100 M 6,-90 C 14,-35 6,30 16,110 M -8,-40 C -4,15 -9,55 -6,130"
                  stroke="#28170D"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray="18,10"
                  fill="none"
                />
                <path
                  d="M -20,-92 C -16,-42 -22,22 -16,102 M 8,-88 C 16,-33 8,32 18,112"
                  stroke="#7A563D"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeDasharray="14,14"
                  fill="none"
                  opacity="0.7"
                />
              </g>

              {/* 天然木瘤年轮细节 */}
              <g transform="translate(-16, -15)">
                <ellipse cx="0" cy="0" rx="6" ry="10" fill="#3A2417" stroke="#25160E" strokeWidth="1.5" />
                <ellipse cx="0" cy="0" rx="3" ry="5" fill="#25160E" />
              </g>

              {/* === 4. 舒展主横枝与侧生繁茂小枝 (Branch for Owl with Twigs) === */}
              {/* 横枝主干 */}
              <path
                d="M 8,-50 C 65,-72 175,-66 242,-44 C 215,-24 95,-28 12,-15 Z"
                fill="#4A3122"
                stroke="#2E1C12"
                strokeWidth="2.2"
              />
              <path
                d="M 14,-46 C 68,-67 172,-62 235,-42 C 205,-28 98,-30 18,-20 Z"
                fill="#593C2A"
              />
              {/* 枝头向上舒展的嫩芽小侧枝 */}
              <path
                d="M 165,-64 C 180,-92 205,-108 225,-115 C 218,-106 195,-95 180,-62 Z"
                fill="#4A3122"
                stroke="#2E1C12"
                strokeWidth="1.5"
              />
              {/* 侧枝嫩绿小剪纸叶片 */}
              <g fill={isNight ? '#2F5C3B' : '#528C48'}>
                <path d="M 225,-115 C 235,-122 245,-120 242,-112 C 238,-108 228,-110 225,-115 Z" />
                <path d="M 218,-106 C 228,-112 236,-105 232,-98 C 226,-96 220,-102 218,-106 Z" />
              </g>

              {/* 枝头向下垂落的嫩芽小枝与挂穗 */}
              <path
                d="M 215,-40 C 226,-25 222,-10 218,-2"
                stroke="#4A3122"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="218" cy="0" rx="3" ry="5" fill="#8C532B" stroke="#4A3122" strokeWidth="1" />

              {/* 墨墨猫头鹰横枝固定厚苔藓层 (完全贴合横枝曲面，猫头鹰利爪在此稳扣) */}
              <path
                d="M 22,-50 C 70,-70 175,-65 238,-44 C 215,-38 80,-50 22,-50 Z"
                fill="#3D5C32"
                opacity="0.95"
              />
              <path
                d="M 38,-55 C 88,-70 168,-65 222,-46"
                stroke="#689654"
                strokeWidth="2.5"
                strokeDasharray="6,4"
                fill="none"
              />

              {/* 横枝下方微缠的藤蔓卷须 */}
              <path
                d="M 72,-32 Q 80,-20 88,-30 M 122,-30 Q 130,-18 138,-28"
                stroke="#45793C"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />

              {/* === 5. 解忧神木祈愿纸风铃/红绳灯笼 (Hanging Paper Lantern / Talisman) === */}
              <g transform="translate(48, -25)">
                <line x1="0" y1="0" x2="0" y2="28" stroke="#D4A759" strokeWidth="1.2" strokeDasharray="3,2" />
                <g transform="translate(0, 28)">
                  <polygon points="-5,0 5,0 4,8 -4,8" fill="#C43D27" />
                  <ellipse cx="0" cy="8" rx="6" ry="7" fill={isNight ? '#FCE392' : '#E0533C'} stroke="#9E2B17" strokeWidth="1" />
                  <line x1="0" y1="15" x2="0" y2="22" stroke="#E3B34C" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              </g>

              {/* === 6. 多层深邃暖光树洞 (The Sacred Tree Hollow with Layered Depth) === */}
              <g transform="translate(8, 52)">
                {/* 树洞外圈突出的木瘤纸雕缘 */}
                <path
                  d="M -18,-24 C -28,-12 -26,18 -15,26 C 0,32 20,28 26,14 C 30,-5 22,-22 8,-26 C -2,-28 -12,-28 -18,-24 Z"
                  fill="#3A2315"
                  stroke="#22130A"
                  strokeWidth="2"
                />
                <path
                  d="M -15,-20 C -24,-10 -22,14 -12,22 C 0,26 16,23 21,11 C 24,-4 18,-18 6,-22 Z"
                  fill="#4D311F"
                />
                {/* 树洞内层深暗底色 */}
                <ellipse cx="3" cy="2" rx="14" ry="19" fill="#180D06" />
                {/* 树洞内温润暖光 */}
                <ellipse
                  cx="3"
                  cy="4"
                  rx="11"
                  ry="15"
                  fill={isNight ? '#FCE182' : '#F5B041'}
                  opacity={isNight ? 0.95 : 0.75}
                />
                <ellipse
                  cx="3"
                  cy="6"
                  rx="7"
                  ry="10"
                  fill={isNight ? '#FFF4CC' : '#FFD980'}
                  opacity={isNight ? 0.85 : 0.65}
                />
                {/* 树洞内藏着的 2 颗小松果 */}
                <g transform="translate(0, 10)">
                  <ellipse cx="-2" cy="0" rx="3.5" ry="4.5" fill="#8C532B" stroke="#4A2810" strokeWidth="0.8" />
                  <ellipse cx="6" cy="1" rx="3" ry="4" fill="#9E5D2A" stroke="#4A2810" strokeWidth="0.8" />
                </g>
              </g>

              {/* === 7. 主树冠剪纸层 (Mid Canopy with Scissor Cut Rhythm) === */}
              <path
                d="M -160,-105 C -195,-180 -120,-245 0,-230 C 85,-280 215,-230 235,-150 C 280,-95 230,-20 165,-10 C 115,25 20,15 -25,-20 C -105,-12 -145,-50 -160,-105 Z"
                fill={isNight ? '#163820' : '#33612E'}
                stroke={isNight ? '#0D2414' : '#254722'}
                strokeWidth="2.8"
              />
              <path
                d="M -160,-105 C -195,-180 -120,-245 0,-230 C 85,-280 215,-230 235,-150 C 280,-95 230,-20 165,-10 C 115,25 20,15 -25,-20 C -105,-12 -145,-50 -160,-105 Z"
                fill="url(#dioramaGrainPat)"
                opacity="0.35"
              />

              {/* === 8. 前景嫩绿云状叶簇 (Front Leaf Clusters with Overlapping Depth) === */}
              {/* 左侧如意叶团 */}
              <path
                d="M -130,-120 C -160,-160 -115,-195 -65,-185 C -48,-150 -90,-125 -130,-120 Z"
                fill={isNight ? '#244D2F' : '#45793C'}
                opacity="0.9"
              />
              {/* 树顶如意叶团 */}
              <path
                d="M -20,-205 C 15,-240 75,-230 95,-195 C 65,-175 10,-185 -20,-205 Z"
                fill={isNight ? '#244D2F' : '#45793C'}
                opacity="0.9"
              />
              {/* 右侧如意叶团 */}
              <path
                d="M 115,-160 C 160,-195 205,-155 190,-115 C 150,-110 120,-135 115,-160 Z"
                fill={isNight ? '#244D2F' : '#45793C'}
                opacity="0.9"
              />
              {/* 左下遮映叶簇 */}
              <path
                d="M -90,-60 C -115,-90 -65,-110 -30,-85 C -45,-60 -70,-55 -90,-60 Z"
                fill={isNight ? '#2F5C3B' : '#528C48'}
                opacity="0.85"
              />

              {/* === 9. 传统剪纸精细镂空纹样 (Crescents & Star Piercings letting Sky/Light Through) === */}
              {/* 经典剪纸月牙纹镂空 */}
              <g fill={isNight ? '#FCE392' : 'rgba(255, 252, 242, 0.7)'}>
                <path d="M -65,-150 A 18 18 0 0 1 -45,-168 A 14 14 0 0 0 -65,-150" />
                <path d="M 45,-175 A 22 22 0 0 1 72,-192 A 18 18 0 0 0 45,-175" />
                <path d="M 130,-125 A 16 16 0 0 1 150,-140 A 13 13 0 0 0 130,-125" />
                <path d="M -95,-110 A 15 15 0 0 1 -78,-122 A 12 12 0 0 0 -95,-110" />
                {/* 繁星透光镂空小孔 */}
                <circle cx="-15" cy="-145" r="4.5" />
                <circle cx="85" cy="-140" r="5" />
                <circle cx="-115" cy="-140" r="4" />
                <circle cx="155" cy="-90" r="4.5" />
                <circle cx="10" cy="-105" r="4" />
                <circle cx="-38" cy="-85" r="3.5" />
              </g>
            </g>

            
          </svg>

          {/* 古树与草甸上的动物伙伴 (非篝火模式下自由漫步) */}
          {!campfireMode && (
            showAllAnimals ? (
              <>
                {renderAnimalItem('woodpecker')}
                {renderAnimalItem('owl')}
                {renderAnimalItem('squirrel')}
                {renderAnimalItem('bear')}
              </>
            ) : (
              FOREST_ANIMALS_PLACEMENT[selectedAnimal]?.layer === 'tree' &&
              renderAnimalItem(selectedAnimal)
            )
          )}
        </div>

        {/* ==================== 第 5 层：苔藓坡地与流水两岸 (L5, Z: +50px) ==================== */}
        <div
          className={`absolute inset-0 pointer-events-none diorama-cut ${
            isRecutting ? 'diorama-place' : ''
          }`}
          style={{ ...getParallaxStyle(5), ['--sh' as string]: 5 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full overflow-visible"
          >
            <path className="c-moss" d={d5} />
            <path className="opacity-30" fill="url(#dioramaGrainPat)" d={d5} />

            {/* 河岸平缓大石台 (River Boulder) */}
            <g transform={`translate(${W * 0.20}, ${H * 0.74})`}>
              <path d="M -54,4 C -50,-16 12,-22 55,-6 C 68,14 46,28 -6,26 C -42,26 -54,20 -54,4 Z" fill="#5F7565" stroke="#3D4F42" strokeWidth="2.2" />
              <path d="M -34,-8 C 4,-18 36,-12 44,-5 C 28,2 -10,0 -34,-8 Z" fill="#7A947A" opacity="0.85" />
              <ellipse cx="0" cy="-4" rx="42" ry="8" fill="rgba(20, 34, 22, 0.45)" className="diorama-ground-shadow" />
            </g>

          </svg>

          {/* 草坡与溪流里的动物伙伴 (非篝火模式下自由漫步) */}
          {!campfireMode && (
            showAllAnimals ? (
              <>
                {renderAnimalItem('fox')}
                {renderAnimalItem('turtle')}
                {renderAnimalItem('otter')}
              </>
            ) : (
              FOREST_ANIMALS_PLACEMENT[selectedAnimal]?.layer === 'clearing' &&
              renderAnimalItem(selectedAnimal)
            )
          )}



        </div>

        {/* ==================== 第 6 层：左右环抱的墨绿巨松 (L6, Z: +100px) ==================== */}
        <div
          className={`absolute inset-0 pointer-events-none diorama-cut ${
            isRecutting ? 'diorama-place' : ''
          }`}
          style={{ ...getParallaxStyle(6), ['--sh' as string]: 6 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full overflow-visible"
          >
            <path className="c-teal" d={d6} />
            <path className="opacity-35" fill="url(#dioramaGrainPat)" d={d6} />
          </svg>
        </div>

        {/* ==================== 第 7 层：暖赭林地、蘑菇、蕨草与落叶 (L7, Z: +150px) ==================== */}
        <div
          className={`absolute inset-0 pointer-events-none diorama-cut ${
            isRecutting ? 'diorama-place' : ''
          }`}
          style={{ ...getParallaxStyle(7), ['--sh' as string]: 6 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full overflow-visible"
          >
            <path className="c-ground" d={d7} />
            <path className="c-fall1" d={fall1} />
            <path className="c-fall2" d={fall2} />
            <path className="c-tuft" d={tufts} />
            <path className="c-burrow" d={burrow} />
            <path className="c-pebble" d={pebbles} />
            <path className="c-fern" d={ferns} />
            <path className="c-stem" d={mStems} />
            <path className="c-cap" d={mCaps} />
            <path className="c-dot" d={mDots} />
            <path
              className="opacity-30"
              fill="url(#dioramaGrainPat)"
              d={d7 + mStems + mCaps}
            />
          </svg>
        </div>

        {/* ==================== 前景空地营地层：林间火塘与 360° 围坐生态 (落座于 Layer 7 暖赭空地上) ==================== */}
        <div
          className={`absolute inset-0 pointer-events-none diorama-cut ${
            isRecutting ? 'diorama-place' : ''
          }`}
          style={{ ...getParallaxStyle(7.2), ['--sh' as string]: 6 }}
        >
          {/* 篝火模式下的地表透视火塘焦土与鹅卵石散布圈 */}
          {campfireMode && (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-full overflow-visible pointer-events-none"
            >
              <g transform={`translate(${campfireSeats.fireX}, ${campfireSeats.fireY})`}>
                {/* 暖赭泥土温润火塘烘托圈 */}
                <ellipse
                  cx={0}
                  cy={0}
                  rx={Math.min(260, Math.max(160, Math.round(W * 0.26))) * 1.12}
                  ry={Math.min(52, Math.max(34, Math.round(H * 0.058))) * 1.30}
                  fill="rgba(34, 18, 9, 0.40)"
                  stroke="#7A5535"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  opacity="0.65"
                />
              </g>
            </svg>
          )}

          {/* ==================== 白天非篝火模式：空地上静候点燃的质朴火塘与微光灵火 ==================== */}
          {!campfireMode && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onStartCampfire?.();
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-28 group pointer-events-auto select-none"
              style={{
                left: `${campfireSeats.fireX}px`,
                top: `${campfireSeats.fireY}px`,
              }}
              title="林间空地静卧着一圈火塘，点击点燃篝火，邀大家围坐夜谈"
            >
              {/* 地面柔和接触阴影 (暖赭空地接触影) */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-14 rounded-full bg-[#201208]/50 blur-xs -z-10 group-hover:bg-[#C8642D]/25 transition-colors" />

              {/* 纸雕质感静候火塘：鹅卵石圈 + 干燥原木柴火 */}
              <svg viewBox="-80 -40 160 80" width={160} height={80} className="overflow-visible">
                {/* 鹅卵石火塘围圈 */}
                <g fill="#73604F" stroke="#453326" strokeWidth="1.4">
                  <ellipse cx="-58" cy="5" rx="13" ry="8" />
                  <ellipse cx="-46" cy="16" rx="14" ry="8" />
                  <ellipse cx="-22" cy="22" rx="15" ry="9" />
                  <ellipse cx="6" cy="24" rx="16" ry="9" />
                  <ellipse cx="32" cy="21" rx="15" ry="9" />
                  <ellipse cx="55" cy="12" rx="14" ry="8" />
                  <ellipse cx="60" cy="-4" rx="12" ry="7" />
                  <ellipse cx="42" cy="-16" rx="13" ry="7" />
                  <ellipse cx="16" cy="-21" rx="14" ry="7" />
                  <ellipse cx="-13" cy="-22" rx="15" ry="7" />
                  <ellipse cx="-40" cy="-16" rx="13" ry="7" />
                </g>

                {/* 鹅卵石表层受光纸雕高光贴片 */}
                <g fill="#9C8770" opacity="0.6">
                  <ellipse cx="-57" cy="3" rx="9" ry="5" />
                  <ellipse cx="-45" cy="14" rx="10" ry="5" />
                  <ellipse cx="-21" cy="20" rx="11" ry="6" />
                  <ellipse cx="7" cy="22" rx="11" ry="6" />
                  <ellipse cx="33" cy="19" rx="11" ry="6" />
                  <ellipse cx="55" cy="10" rx="10" ry="5" />
                </g>

                {/* 交叉堆叠的干燥松柴原木 (Criss-crossed Pine Logs) */}
                <g>
                  {/* 底层原木 1 */}
                  <rect
                    x="-36"
                    y="-7"
                    width="72"
                    height="13"
                    rx="5"
                    transform="rotate(-18)"
                    fill="#52331C"
                    stroke="#331D0E"
                    strokeWidth="1.4"
                  />
                  <ellipse cx="30" cy="-16" rx="4.5" ry="6" fill="#805230" stroke="#331D0E" strokeWidth="1" />

                  {/* 底层原木 2 */}
                  <rect
                    x="-38"
                    y="-5"
                    width="76"
                    height="13"
                    rx="5"
                    transform="rotate(22)"
                    fill="#5E3B20"
                    stroke="#331D0E"
                    strokeWidth="1.4"
                  />
                  <ellipse cx="-32" cy="-18" rx="4.5" ry="6" fill="#8C5E38" stroke="#331D0E" strokeWidth="1" />

                  {/* 顶层原木 3 */}
                  <rect
                    x="-34"
                    y="-8"
                    width="68"
                    height="14"
                    rx="5"
                    transform="rotate(-4)"
                    fill="#6E4424"
                    stroke="#331D0E"
                    strokeWidth="1.4"
                  />
                  <ellipse cx="30" cy="-7" rx="4.5" ry="6.5" fill="#A16E43" stroke="#331D0E" strokeWidth="1" />
                </g>

                {/* 柴火木纹线条刻槽 */}
                <path
                  d="M -24,-8 L 22,-8 M -20,-4 L 18,-4 M -16,1 L 20,1"
                  stroke="#422714"
                  strokeWidth="1.1"
                  strokeDasharray="6 3"
                  opacity="0.8"
                />
              </svg>

              {/* 木堆上方引人好奇的微光火星 (Curious Breathing Ember Spark) */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                {/* 呼吸微光晕 */}
                <div className="w-10 h-10 rounded-full bg-amber-400/30 blur-xs animate-ping absolute -top-1" />
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                    scale: [1, 1.14, 1],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.75)]"
                >
                  <span className="text-xl select-none">🔥</span>
                </motion.div>

                {/* 自然融入林间的极简悬浮微徽章 (轻量宣纸胶囊) */}
                <div className="mt-0.5 px-2.5 py-0.5 rounded-full bg-[#FAF7EE]/90 group-hover:bg-white backdrop-blur-xs border border-[#8C6648]/40 group-hover:border-[#C84630] shadow-sm flex items-center gap-1.5 transition-all text-[#4A3220] group-hover:text-[#C84630] whitespace-nowrap paper-rough-edge">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[11px] font-bold">点燃篝火 · 开启夜谈</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== 篝火讨论模式：中央篝火与 360° 围坐生态 ==================== */}
          {campfireMode && (
            <>
              {/* 守林人 (12:00 正后方长凳，提灯守护全场) */}
              <motion.div
                animate={{
                  y: isRangerSpeaking ? -14 : 0,
                  scale: isRangerSpeaking ? 1.05 : 0.88,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRangerClick?.();
                }}
                className="absolute flex flex-col items-center cursor-pointer transition-all -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{
                  left: `${campfireSeats.ranger.x}px`,
                  top: `${campfireSeats.ranger.y}px`,
                  zIndex: 22,
                }}
              >
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
                {isRangerSpeaking && (
                  <div className="absolute -bottom-2 w-28 h-8 rounded-full bg-amber-400/50 blur-xs -z-10 border border-amber-500/60 animate-pulse pointer-events-none" />
                )}
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

              {/* 中央篝火与四周铺洒的暖光漫射 */}
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${campfireSeats.fireX}px`,
                  top: `${campfireSeats.fireY}px`,
                  zIndex: 26,
                }}
              >
                {/* 鹅卵石火塘基底 (与白天呼应，地表扎实接触) */}
                <svg viewBox="-80 -40 160 80" width={150} height={75} className="overflow-visible absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: '50%', top: '56%', zIndex: 22 }}>
                  <g fill="#4A392C" stroke="#2D1F16" strokeWidth="1.4">
                    <ellipse cx="-58" cy="5" rx="13" ry="8" />
                    <ellipse cx="-46" cy="16" rx="14" ry="8" />
                    <ellipse cx="-22" cy="22" rx="15" ry="9" />
                    <ellipse cx="6" cy="24" rx="16" ry="9" />
                    <ellipse cx="32" cy="21" rx="15" ry="9" />
                    <ellipse cx="55" cy="12" rx="14" ry="8" />
                    <ellipse cx="60" cy="-4" rx="12" ry="7" />
                    <ellipse cx="42" cy="-16" rx="13" ry="7" />
                    <ellipse cx="16" cy="-21" rx="14" ry="7" />
                    <ellipse cx="-13" cy="-22" rx="15" ry="7" />
                    <ellipse cx="-40" cy="-16" rx="13" ry="7" />
                  </g>
                  {/* 石圈内焦黑炭土与微红暗火 */}
                  <ellipse cx="0" cy="2" rx="36" ry="14" fill="#24140A" />
                  <ellipse cx="0" cy="2" rx="26" ry="9" fill="#6B260E" opacity="0.8" />
                </svg>

                {/* 暖色火光铺洒 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    scale: [0.96, 1.10, 0.96],
                    opacity: [0.80, 1.0, 0.80],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: '620px',
                    height: '240px',
                    background:
                      'radial-gradient(ellipse 65% 52% at 50% 50%, rgba(255, 175, 55, 0.55) 0%, rgba(240, 110, 30, 0.26) 42%, rgba(180, 65, 15, 0.08) 68%, transparent 84%)',
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative z-25"
                >
                  <BonfireCamp isNight={true} />
                </motion.div>
              </div>

              {/* 围绕篝火成圆圈的 7 只动物伙伴 (360° 真实圆环座次) */}
              {(['woodpecker', 'owl', 'bear', 'fox', 'turtle', 'squirrel', 'otter'] as AnimalId[]).map(
                (animalId) => renderCampfireAnimal(animalId, campfireSeats.seats[animalId])
              )}
            </>
          )}
        </div>

        {/* 萤火虫与花粉微粒 Canvas */}
        <canvas
          ref={fliesCanvasRef}
          className="absolute inset-0 pointer-events-none z-30"
          style={getParallaxStyle(7.4)}
        />

        {/* 飘落双面纸叶 (Tumbling Leaves) */}
        <div
          className="absolute inset-0 pointer-events-none z-30"
          style={getParallaxStyle(7.7)}
        >
          {leaves.map((leaf) => (
            <div
              key={leaf.id}
              className="diorama-leaf"
              style={{
                transform: `translate3d(${leaf.x}px, ${leaf.y}px, 0) rotate(${leaf.rot}deg) scale(${leaf.size})`,
                transition: 'transform 0.08s linear',
              }}
            >
              <svg viewBox="-10 -10 20 20" width={18} height={18}>
                <path
                  className={
                    leaf.id % 3 === 0
                      ? 'lf-a'
                      : leaf.id % 3 === 1
                      ? 'lf-b'
                      : 'lf-c'
                  }
                  d="M0 -9C5 -6 6 1 0 9C-6 1 -5 -6 0 -9Z"
                />
                <path className="lf-v" d="M0 -7V8" />
              </svg>
            </div>
          ))}
        </div>

        {/* ==================== 第 8 层：前景长草与毛地黄花串 (L8, Z: +210px) ==================== */}
        <div
          className={`absolute inset-0 pointer-events-none diorama-cut ${
            isRecutting ? 'diorama-place' : ''
          }`}
          style={{ ...getParallaxStyle(8), ['--sh' as string]: 7 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full overflow-visible"
          >
            <path className="c-fg2" d={fg2} />
            <path className="c-fg" d={d8 + stalks} />
            <path className="c-bell" d={bells} />
            <path className="c-bell2" d={inner} />
            <path
              className="opacity-30"
              fill="url(#dioramaGrainPat)"
              d={d8 + fg2 + stalks + bells}
            />
          </svg>
        </div>

        {/* ==================== 第 9 层：手工纸框与毛边卡纸衬圈 (L9, 仅在开启画框模式时显示) ==================== */}
        {showFrame && (
          <>
            <div
              className="absolute inset-0 pointer-events-none diorama-cut z-40"
              style={{ ...getParallaxStyle(2.2), ['--sh' as string]: 9 }}
            >
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-full overflow-visible"
              >
                <path className="c-mat" d={mat} />
                <path className="c-frame" d={frame} />
                <path className="opacity-25" fill="url(#dioramaGrainPat)" d={frame} />
              </svg>
            </div>

            {/* 纸雕箱体内向暗角 (Vignette) */}
            <div className="diorama-vignette z-40" />

            {/* 左上方物理悬挂式便签标牌 (Tag Pendulum) */}
            <div
              className="diorama-tag-wrap"
              style={{ transform: `rotate(${renderedTagAngle.toFixed(2)}deg)` }}
            >
              <span className="diorama-tag-string" />
              <div className="diorama-tag paper-rough-edge">
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-hidden="true"
                >
                  <rect width="100%" height="100%" fill="url(#dioramaGrainPat)" />
                </svg>
                <span className="diorama-tag-knot" />
                <span className="diorama-tag-hole" />
                <p className="m-0 text-[10px] tracking-[0.2em] uppercase font-bold text-[#A3431F]">
                  Plate XVIII · 治愈系剪纸西洋景
                </p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#3B2D25] my-1">
                  解忧<em>森林</em>
                </h2>
                <div className="w-10 h-1 mx-auto my-1.5 bg-[#5F7F5B]/30 rounded-full" />
                <p className="text-[11px] leading-relaxed text-[#5C4632] italic max-w-[20ch] mx-auto">
                  九层叠纸 · 慢流小溪 · 7只温热动物伙伴
                </p>
              </div>
            </div>
          </>
        )}

        {/* ==================== 右下角精工纸艺控制舵 (适配移动端安全区域与触控尺寸) ==================== */}
        <div className="absolute right-[calc(1rem+env(safe-area-inset-right,0px))] bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-40 flex items-center gap-2 pointer-events-auto">
          {/* 森林设置按钮 */}
          {onOpenSettings && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
              title="打开森林设置 (Settings)"
              className="px-3.5 py-2.5 rounded-2xl bg-[#FAF7EE]/90 hover:bg-white text-[#4D3524] border border-[#8C6648]/40 shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold paper-press-btn active:scale-95 touch-manipulation min-h-[38px]"
            >
              <Settings className="w-4 h-4 text-[#38662F]" />
              <span className="hidden sm:inline">设置</span>
            </button>
          )}

          {/* 重塑森林剪刀按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRecutForest();
            }}
            title="重新修剪森林图案 (Recut)"
            className="px-3.5 py-2.5 rounded-2xl bg-[#FAF7EE]/90 hover:bg-white text-[#4D3524] border border-[#8C6648]/40 shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold paper-press-btn active:scale-95 touch-manipulation min-h-[38px]"
          >
            <Scissors className="w-4 h-4 text-[#A3431F]" />
            <span className="hidden sm:inline">重剪森林</span>
          </button>
        </div>
      </div>
    </div>
  );
};
