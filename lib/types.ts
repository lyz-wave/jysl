export type AnimalId =
  | 'woodpecker' // 笃笃 - 情绪标注
  | 'owl'        // 墨墨 - CBT 认知行为
  | 'fox'        // 阿橘 - 认知重构
  | 'bear'       // 团团 - 自我关怀
  | 'turtle'     // 慢慢 - 10-10-10 + 正念
  | 'otter'      // 漂漂 - 小野鸭 (ACT 认知解离)
  | 'squirrel';  // 跳跳 - 行为激活拆小步

export type Speaker = AnimalId | 'ranger' | 'tree' | 'user';

export type TimeOfDay = 'dawn' | 'noon' | 'dusk' | 'night';

export type PuppetAnimationMood =
  | 'idle'
  | 'breathe'
  | 'nod'
  | 'gentle'
  | 'playful'
  | 'thinking'
  | 'excited'
  | 'surprised'
  | 'calm'
  | 'peck'
  | 'hug'
  | 'paddle';

// 纸偶部件关节结构定义
export interface PuppetPart {
  id: string;
  name: string;
  svgPath: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  zIndex: number;
  pivot: { x: number; y: number }; // 旋转关节点
  hasSplitPin?: boolean;          // 是否画出金属两脚钉
  pinCoord?: { x: number; y: number };
  cutoutPaths?: string[];         // 传统剪纸镂空形状
  defaultRotation?: number;
  transformOrigin?: string;
}

export interface AnimalDefinition {
  id: AnimalId;
  name: string;
  title: string;
  mindset: string;
  psychology: string;
  tone: string;
  gameName: string;
  gameSummary: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    belly?: string;
    details?: string;
  };
  viewBox: string;
  defaultScale: number;
  parts: PuppetPart[];
}

// 倾诉与对话
export interface Message {
  id: string;
  speaker: Speaker;
  content: string;
  resonated?: boolean;
  createdAt: number;
  mood?: PuppetAnimationMood;
}

export interface Session {
  id: string;
  startedAt: number;
  endedAt?: number;
  status: 'open' | 'resolved' | 'paused';
  companion: AnimalId;
  moodBefore?: number;
  moodAfter?: number;
  gameContext: string[];
  matchedMemoryIds: string[];
  messages: Message[];
}

export type FixedTheme =
  | '工作压力'
  | '职场人际'
  | '亲密关系'
  | '家庭'
  | '友情'
  | '自我价值'
  | '学业考试'
  | '健康'
  | '金钱'
  | '未来迷茫'
  | '失去与离别'
  | '孤独'
  | '其他';

export interface Memory {
  id: string;
  sessionId: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  summary: string;
  emotions: string[];
  themes: FixedTheme[];
  coreBelief: string;
  shift: { from: string; to: string };
  insight: string;
  action?: string;
  helpfulAnimals: AnimalId[];
  moodBefore?: number;
  moodAfter?: number;
}

export interface SafetyCheckResult {
  level: 'none' | 'concern' | 'crisis';
  reason?: string;
  suggestHotline?: boolean;
}
