import { TimeOfDay } from './types';

export interface SceneLightingConfig {
  skyGradient: string;
  sunPosition: { x: number; y: number }; // 百分比
  sunColor: string;
  sunGlow: string;
  ambientTint: string;
  shadowOffset: { x: number; y: number };
  shadowOpacity: number;
  cutoutGlowOpacity: number;
  fireflyVisible: boolean;
  name: string;
  description: string;
}

export const TIME_OF_DAY_LIGHTING: Record<TimeOfDay, SceneLightingConfig> = {
  dawn: {
    name: '清晨 · 晨雾微光',
    description: '斜阳从左侧低处照入，晨雾未散，色调柔和泛白',
    skyGradient: 'linear-gradient(180deg, #DCE9E2 0%, #F5ECE3 60%, #FAF7EE 100%)',
    sunPosition: { x: 18, y: 38 },
    sunColor: '#FCE7A1',
    sunGlow: 'rgba(252, 231, 161, 0.45)',
    ambientTint: 'rgba(235, 243, 234, 0.25)',
    shadowOffset: { x: 16, y: 7 },
    shadowOpacity: 0.15,
    cutoutGlowOpacity: 0.3,
    fireflyVisible: false,
  },
  noon: {
    name: '正午 · 暖阳普照',
    description: '阳光自正上方洒向林间，树影直垂，明亮舒展',
    skyGradient: 'linear-gradient(180deg, #CDE5D7 0%, #E8F3E5 50%, #FAF7EE 100%)',
    sunPosition: { x: 50, y: 15 },
    sunColor: '#FDF0B5',
    sunGlow: 'rgba(253, 240, 181, 0.6)',
    ambientTint: 'rgba(255, 255, 245, 0.15)',
    shadowOffset: { x: 0, y: 12 },
    shadowOpacity: 0.22,
    cutoutGlowOpacity: 0.15,
    fireflyVisible: false,
  },
  dusk: {
    name: '黄昏 · 晚霞融金',
    description: '夕阳从右侧沉落，树影拉长，泛着朱红与琥珀暖意',
    skyGradient: 'linear-gradient(180deg, #F0C49E 0%, #F5D3B3 45%, #E9B28A 85%, #FAF7EE 100%)',
    sunPosition: { x: 82, y: 42 },
    sunColor: '#F38D5C',
    sunGlow: 'rgba(243, 141, 92, 0.65)',
    ambientTint: 'rgba(245, 170, 120, 0.28)',
    shadowOffset: { x: -18, y: 7 },
    shadowOpacity: 0.25,
    cutoutGlowOpacity: 0.6,
    fireflyVisible: true,
  },
  night: {
    name: '夜晚 · 银月荧光',
    description: '静谧深邃，树冠镂空处与萤火虫透出温润纸灯暖光',
    skyGradient: 'linear-gradient(180deg, #0F1E29 0%, #1A2F3D 50%, #253D47 100%)',
    sunPosition: { x: 75, y: 22 },
    sunColor: '#FFF8DB',
    sunGlow: 'rgba(255, 248, 219, 0.4)',
    ambientTint: 'rgba(25, 45, 65, 0.45)',
    shadowOffset: { x: 0, y: 5 },
    shadowOpacity: 0.35,
    cutoutGlowOpacity: 0.95,
    fireflyVisible: true,
  },
};

// 场景 6 层纸雕层次配置
export interface PaperSceneLayer {
  id: string;
  name: string;
  zDepth: number; // CSS translateZ px
  scale: number;  // 透视比例补偿
  svgViewBox: string;
}

export const SCENE_LAYERS: PaperSceneLayer[] = [
  { id: 'sky', name: '天空与日月云层', zDepth: -320, scale: 1.32, svgViewBox: '0 0 1200 800' },
  { id: 'mountains', name: '远山纸岭', zDepth: -220, scale: 1.22, svgViewBox: '0 0 1200 800' },
  { id: 'distant-trees', name: '远景树海与晨雾', zDepth: -120, scale: 1.12, svgViewBox: '0 0 1200 800' },
  { id: 'ancient-tree', name: '中景古树「岁岁」与林地', zDepth: 0, scale: 1.0, svgViewBox: '0 0 1200 800' },
  { id: 'clearing', name: '草地空地与纸叠小溪', zDepth: 100, scale: 0.9, svgViewBox: '0 0 1200 800' },
  { id: 'foreground', name: '近景手剪草叶与野花', zDepth: 200, scale: 0.8, svgViewBox: '0 0 1200 800' },
];

// 剪纸镂空花纹路径库（祥云、叶脉、菱形星纹）
export const CUTOUT_PATTERNS = {
  cloudA: 'M20,40 Q35,20 55,30 Q75,15 95,35 Q115,25 125,45 Q135,70 110,75 Q90,85 70,75 Q45,85 25,70 Q10,60 20,40 Z',
  leafVein: 'M10,0 L10,60 M10,15 L22,8 M10,30 L22,23 M10,45 L22,38 M10,15 L-2,8 M10,30 L-2,23 M10,45 L-2,38',
  filigreeStar: 'M15,0 L18,10 L28,15 L18,20 L15,30 L12,20 L2,15 L12,10 Z',
};
