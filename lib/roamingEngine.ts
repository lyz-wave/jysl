/**
 * 解忧森林 · 动物自主自由漫游与生物力学引擎 (Animal Autonomous Roaming Engine)
 * 实现动物在自身生态领地内的自然自由走动、步态弹跳、水流巡游、树干攀爬与朝向自适应翻转
 * 严格遵循真实物理生态：树干固定在树上，啄木鸟左右侧交替啄击；横枝固定，猫头鹰横枝踱步；熊等比例纵深缩放
 */

import { AnimalId, PuppetAnimationMood } from './types';

export interface AnimalHabitatZone {
  id: AnimalId;
  name: string;
  minXRatio: number;
  maxXRatio: number;
  speed: number; // 移速 (px/s)
  defaultFacing: 1 | -1; // 默认朝向 (1 为右, -1 为左)
  anchorType: 'ground' | 'branch' | 'trunk' | 'water' | 'slope' | 'stone';
  // 地形高度计算函数
  getY: (x: number, W: number, H: number, treeX: number, treeY: number) => number;
  movingMood: PuppetAnimationMood;
  idleMood: PuppetAnimationMood;
  walkingTitle: string;
  idleTitle: string;
}

export interface AnimalRoamState {
  id: AnimalId;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 1 | -1;
  isMoving: boolean;
  pauseTimer: number;
  stepCycle: number;
  bodyBob: number;
  rotOffset: number;
  scaleY: number;
  depthScale: number; // 等比例纵深缩放因子 (宽与高同等缩放，杜绝压扁变形)
  mood: PuppetAnimationMood;
  statusText: string;
  trunkSide?: 'left' | 'right'; // 啄木鸟专属：树干左侧 / 右侧
  sideStayTimer?: number;        // 啄木鸟在当前侧驻留啄击计时
}

/**
 * 7 只动物的专属生态领地定义（空间完全错开，杜绝遮挡）
 */
export const ANIMAL_HABITATS: Record<AnimalId, AnimalHabitatZone> = {
  // 1. 笃笃 (Woodpecker): 攀爬在古树主干两侧，固定树干上左侧啄一会、右侧啄一会，绝不与松鼠重叠
  woodpecker: {
    id: 'woodpecker',
    name: '笃笃',
    minXRatio: 0.38,
    maxXRatio: 0.50,
    speed: 36,
    defaultFacing: -1, // 左侧时面向右侧树干
    anchorType: 'trunk',
    getY: (x, W, H, treeX, treeY) => {
      // 树干上方区间: treeY - 75 ~ treeY - 20
      return treeY - 50;
    },
    movingMood: 'peck',
    idleMood: 'peck',
    walkingTitle: '换边攀跳中',
    idleTitle: '树干左侧·叩诊树皮',
  },

  // 2. 墨墨 (Owl): 稳居高处主横枝，横枝固定在古树上，墨墨在横枝上小步横挪踱步俯瞰
  owl: {
    id: 'owl',
    name: '墨墨',
    minXRatio: 0.51,
    maxXRatio: 0.60,
    speed: 15,
    defaultFacing: 1,
    anchorType: 'branch',
    getY: (x, W, H, treeX, treeY) => {
      // 沿横枝平缓顶部微弧度表面挪移 (固定古树横枝顶部)
      const dx = x - treeX;
      return treeY - 60 + Math.pow((dx - 130) / 80, 2) * 6;
    },
    movingMood: 'thinking',
    idleMood: 'nod',
    walkingTitle: '横枝信步中',
    idleTitle: '横枝稳立·理清事实',
  },

  // 3. 跳跳 (Squirrel): 活跃在古树根脚草甸地面，飞速窜跳奔跑，欢喜嗅探与捧坚果
  squirrel: {
    id: 'squirrel',
    name: '跳跳',
    minXRatio: 0.38,
    maxXRatio: 0.54,
    speed: 48,
    defaultFacing: 1,
    anchorType: 'ground',
    getY: (x, W, H) => {
      // 古树根脚前方草甸地面基准高度
      return H * 0.66;
    },
    movingMood: 'excited',
    idleMood: 'playful',
    walkingTitle: '草地窜跳中',
    idleTitle: '树根草丛·欢喜捧果',
  },

  // 4. 团团 (Bear): 左侧古树根部开阔草甸，慢悠悠踱步，往后走时等比例缩小形成真实纵深感
  bear: {
    id: 'bear',
    name: '团团',
    minXRatio: 0.22,
    maxXRatio: 0.38,
    speed: 18,
    defaultFacing: 1,
    anchorType: 'ground',
    getY: (x, W, H) => {
      // 草甸地表基准高度
      return H * 0.62;
    },
    movingMood: 'gentle',
    idleMood: 'hug',
    walkingTitle: '草甸踱步中',
    idleTitle: '树根草甸·沉稳盘坐',
  },

  // 5. 阿橘 (Fox): 右侧开阔花草缓坡，轻快漫游小跑
  fox: {
    id: 'fox',
    name: '阿橘',
    minXRatio: 0.70,
    maxXRatio: 0.86,
    speed: 32,
    defaultFacing: -1, // 默认面向中央森林
    anchorType: 'slope',
    getY: (x, W, H) => {
      // 花草斜坡地表，向右侧微倾
      const norm = (x - W * 0.70) / (W * 0.16);
      return H * 0.67 + norm * 14;
    },
    movingMood: 'playful',
    idleMood: 'gentle',
    walkingTitle: '草坡漫步中',
    idleTitle: '花草斜坡·轻盈立足',
  },

  // 6. 慢慢 (Turtle): 溪流左岸平坦苔藓巨石台，超慢速笃定爬行
  turtle: {
    id: 'turtle',
    name: '慢慢',
    minXRatio: 0.16,
    maxXRatio: 0.25,
    speed: 8,
    defaultFacing: 1,
    anchorType: 'stone',
    getY: (x, W, H) => {
      // 河岸岩石平坦上表面
      return H * 0.74;
    },
    movingMood: 'calm',
    idleMood: 'breathe',
    walkingTitle: '石滩慢行中',
    idleTitle: '河岸磐石·安然沉息',
  },

  // 7. 漂漂 (Duck): 清澈小溪深水流道，沿溪流航道顺流逆流巡游
  otter: {
    id: 'otter',
    name: '漂漂',
    minXRatio: 0.47,
    maxXRatio: 0.63,
    speed: 26,
    defaultFacing: 1,
    anchorType: 'water',
    getY: (x, W, H) => {
      // 沿溪流向下游缓缓下倾航道
      const norm = (x - W * 0.47) / (W * 0.16);
      return H * 0.74 + norm * (H * 0.07);
    },
    movingMood: 'paddle',
    idleMood: 'paddle',
    walkingTitle: '顺流巡游中',
    idleTitle: '清澈溪流·浮水随波',
  },
};

/**
 * 初始化所有动物的初始漫步状态
 */
export function initializeAnimalRoamStates(W: number, H: number): Record<AnimalId, AnimalRoamState> {
  const treeX = W * 0.44;
  const treeY = H * 0.48;

  const states = {} as Record<AnimalId, AnimalRoamState>;

  (Object.keys(ANIMAL_HABITATS) as AnimalId[]).forEach((id) => {
    const habitat = ANIMAL_HABITATS[id];
    let startX = W * ((habitat.minXRatio + habitat.maxXRatio) * 0.5);
    let startY = habitat.getY(startX, W, H, treeX, treeY);
    let facing = habitat.defaultFacing;
    let trunkSide: 'left' | 'right' | undefined;
    let sideStayTimer: number | undefined;
    let depthScale = 1.0;

    if (id === 'woodpecker') {
      trunkSide = 'left';
      startX = Math.round(treeX - 80);
      startY = Math.round(treeY - 50);
      facing = -1; // 树干左侧，喙朝右(+X)紧抵树皮
      sideStayTimer = 6.5;
      depthScale = 0.96;
    } else if (id === 'owl') {
      startX = Math.round(treeX + 130);
      startY = Math.round(treeY - 60);
      facing = 1;
      depthScale = 0.95;
    } else if (id === 'bear') {
      startX = Math.round(W * 0.28);
      startY = Math.round(H * 0.63);
      facing = 1;
      depthScale = 0.96;
    } else if (id === 'fox') {
      depthScale = 0.95;
    } else if (id === 'turtle') {
      depthScale = 0.96;
    } else if (id === 'otter') {
      depthScale = 0.96;
    } else if (id === 'squirrel') {
      startX = Math.round(treeX + 45);
      startY = Math.round(H * 0.66);
      depthScale = 0.94;
    }

    states[id] = {
      id,
      x: startX,
      y: startY,
      targetX: startX,
      targetY: startY,
      facing,
      isMoving: false,
      pauseTimer: 1.5 + Math.random() * 2.5,
      stepCycle: Math.random() * 10,
      bodyBob: 0,
      rotOffset: 0,
      scaleY: 1,
      depthScale,
      mood: habitat.idleMood,
      statusText: habitat.idleTitle,
      trunkSide,
      sideStayTimer,
    };
  });

  return states;
}

/**
 * 单帧步进物理漫步与生物力学更新
 */
export function updateAnimalRoam(
  prev: Record<AnimalId, AnimalRoamState>,
  dt: number,
  W: number,
  H: number
): Record<AnimalId, AnimalRoamState> {
  const treeX = W * 0.44;
  const treeY = H * 0.48;
  const next = { ...prev };

  (Object.keys(ANIMAL_HABITATS) as AnimalId[]).forEach((id) => {
    const habitat = ANIMAL_HABITATS[id];
    const s = { ...next[id] };
    const minX = W * habitat.minXRatio;
    const maxX = W * habitat.maxXRatio;

    // ==========================================
    // 1. 笃笃 (Woodpecker): 树干左右两侧交替攀爬啄击
    // ==========================================
    if (id === 'woodpecker') {
      const leftTrunkX = Math.round(treeX - 80);
      const rightTrunkX = Math.round(treeX + 78);

      if (s.isMoving) {
        const dx = s.targetX - s.x;
        const dy = s.targetY - s.y;
        const dist = Math.hypot(dx, dy);
        s.stepCycle += dt * 14;

        if (dist < 4) {
          s.x = s.targetX;
          s.y = s.targetY;
          s.isMoving = false;
          s.facing = s.trunkSide === 'left' ? -1 : 1;
          s.pauseTimer = 1.8 + Math.random() * 1.5;
          s.mood = 'peck';
          s.statusText = s.trunkSide === 'left' ? '树干左侧·专注啄击' : '树干右侧·清脆啄击';
          s.bodyBob = 0;
        } else {
          // 横穿跳跃移速稍快，同侧纵向小跳更灵动
          const isCrossHop = Math.abs(dx) > 12;
          const speed = isCrossHop ? 65 : 28;
          const step = Math.min(dist, speed * dt);
          s.x += (dx / dist) * step;
          s.y += (dy / dist) * step;
          // 跳跃抛物线弧度
          s.bodyBob = -Math.abs(Math.sin(s.stepCycle * 2.2)) * (isCrossHop ? 7 : 4);
          s.mood = isCrossHop ? 'excited' : 'peck';
          s.statusText = isCrossHop ? '换边攀跳中' : '树干小跳';
        }
      } else {
        // 在当前侧专注啄木与叩诊
        s.sideStayTimer = (s.sideStayTimer ?? 6.5) - dt;
        s.pauseTimer -= dt;
        s.stepCycle += dt * 5.2;

        // 节奏感清脆啄击身体反作用力微弹
        s.bodyBob = -Math.abs(Math.sin(s.stepCycle * 3.2)) * 3.2;
        s.mood = 'peck';

        // 1. 同侧上下小幅攀跳移动
        if (s.pauseTimer <= 0) {
          s.targetY = Math.round(treeY - 75 + Math.random() * 55);
          s.targetX = s.trunkSide === 'left' ? leftTrunkX : rightTrunkX;
          s.isMoving = true;
          s.pauseTimer = 2.2 + Math.random() * 2.0;
        }

        // 2. 驻留时间结束：由左去右，或由右去左！
        if (s.sideStayTimer <= 0) {
          const newSide = s.trunkSide === 'left' ? 'right' : 'left';
          s.trunkSide = newSide;
          s.sideStayTimer = 6.5 + Math.random() * 4.5; // 在新一侧持续啄 6.5~11 秒
          s.targetX = newSide === 'left' ? leftTrunkX : rightTrunkX;
          s.targetY = Math.round(treeY - 70 + Math.random() * 50);
          s.isMoving = true;
          s.facing = newSide === 'left' ? -1 : 1;
          s.statusText = '换边攀跳中';
        }
      }

      s.depthScale = 0.96;
      next[id] = s;
      return;
    }

    // ==========================================
    // 2. 墨墨 (Owl): 横枝固定，墨墨在横枝上横挪信步
    // ==========================================
    if (id === 'owl') {
      const minBranchX = Math.round(treeX + 85);
      const maxBranchX = Math.round(treeX + 185);
      const getOwlY = (x: number) => treeY - 60 + Math.pow((x - (treeX + 130)) / 80, 2) * 6;

      if (s.isMoving) {
        const dx = s.targetX - s.x;
        const dist = Math.abs(dx);
        s.stepCycle += dt * (habitat.speed * 0.25);

        if (dist < 3) {
          s.x = s.targetX;
          s.y = getOwlY(s.x);
          s.isMoving = false;
          s.bodyBob = 0;
          s.rotOffset = 0;
          s.pauseTimer = 3.5 + Math.random() * 4.5;
          s.mood = Math.random() > 0.5 ? 'nod' : 'thinking';
          s.statusText = '横枝稳立·理清事实';
        } else {
          const dir = Math.sign(dx) as 1 | -1;
          s.facing = dir;
          s.x += dir * Math.min(dist, habitat.speed * dt);
          s.y = getOwlY(s.x);
          s.mood = 'thinking';
          s.statusText = '横枝信步中';
          s.bodyBob = Math.sin(s.stepCycle * 4) * 1.2;
        }
      } else {
        s.pauseTimer -= dt;
        s.stepCycle += dt * 1.2;
        s.y = getOwlY(s.x);
        s.bodyBob = Math.sin(s.stepCycle * 1.4) * 0.6;
        s.rotOffset = Math.sin(s.stepCycle * 0.8) * 1.0;

        if (s.pauseTimer <= 0) {
          let candX = minBranchX + Math.random() * (maxBranchX - minBranchX);
          if (Math.abs(candX - s.x) < 32) {
            candX = s.x < (minBranchX + maxBranchX) * 0.5 ? maxBranchX - Math.random() * 15 : minBranchX + Math.random() * 15;
          }
          s.targetX = Math.round(candX);
          s.targetY = getOwlY(s.targetX);
          s.facing = Math.sign(s.targetX - s.x) as 1 | -1 || s.facing;
          s.isMoving = true;
          s.mood = 'thinking';
          s.statusText = '横枝信步中';
        }
      }

      s.depthScale = 0.95;
      next[id] = s;
      return;
    }

    // ==========================================
    // 3. 团团 (Bear): 左侧草甸踱步，纵深等比例缩放 (绝不压扁)
    // ==========================================
    if (id === 'bear') {
      const bearMinX = Math.round(W * 0.22);
      const bearMaxX = Math.round(W * 0.38);
      const bearMinY = Math.round(H * 0.58); // 远端（近树根）
      const bearMaxY = Math.round(H * 0.66); // 近端（前景草甸）

      if (s.isMoving) {
        const dx = s.targetX - s.x;
        const dy = s.targetY - s.y;
        const dist = Math.hypot(dx, dy);
        s.stepCycle += dt * (habitat.speed * 0.22);

        if (dist < 4) {
          s.x = s.targetX;
          s.y = s.targetY;
          s.isMoving = false;
          s.bodyBob = 0;
          s.rotOffset = 0;
          s.pauseTimer = 3.5 + Math.random() * 4.5;
          s.mood = habitat.idleMood;
          s.statusText = habitat.idleTitle;
        } else {
          if (Math.abs(dx) > 2) {
            s.facing = Math.sign(dx) as 1 | -1;
          }
          const step = Math.min(dist, habitat.speed * dt);
          s.x += (dx / dist) * step;
          s.y += (dy / dist) * step;
          s.mood = habitat.movingMood;
          s.statusText = habitat.walkingTitle;
          // 大熊沉稳晃动步态
          s.bodyBob = Math.sin(s.stepCycle * 2.8) * 1.6;
          s.rotOffset = Math.sin(s.stepCycle * 2.8) * 2.2;
        }
      } else {
        s.pauseTimer -= dt;
        s.stepCycle += dt * 1.2;
        s.rotOffset = Math.sin(s.stepCycle * 0.7) * 1.2;
        s.bodyBob = Math.sin(s.stepCycle * 1.4) * 0.8;

        if (s.pauseTimer <= 0) {
          // 在草甸的 (X, Y) 2.5D 平面内自然选点
          let candX = bearMinX + Math.random() * (bearMaxX - bearMinX);
          let candY = bearMinY + Math.random() * (bearMaxY - bearMinY);
          if (Math.abs(candX - s.x) < (bearMaxX - bearMinX) * 0.3) {
            candX = s.x < (bearMinX + bearMaxX) * 0.5 ? bearMaxX - Math.random() * 15 : bearMinX + Math.random() * 15;
          }
          s.targetX = Math.round(candX);
          s.targetY = Math.round(candY);
          s.facing = Math.sign(s.targetX - s.x) as 1 | -1 || s.facing;
          s.isMoving = true;
          s.mood = habitat.movingMood;
          s.statusText = habitat.walkingTitle;
        }
      }

      // 核心：基于 Y 坐标的等比例纵深缩放 (在后面靠近树根时等比例缩小，到前面时等比例放大)
      const progress = Math.max(0, Math.min(1, (s.y - bearMinY) / (bearMaxY - bearMinY)));
      // 0.86 (远景) ~ 1.06 (近景)，保持宽高绝对等比，熊体始终圆润敦实
      s.depthScale = 0.86 + 0.20 * progress;
      s.scaleY = 1; // 严禁单独修改 scaleY 造成任何压扁

      next[id] = s;
      return;
    }

    // ==========================================
    // 4. 跳跳 (Squirrel): 在古树根脚草甸地面敏捷窜跑、抱坚果嗅探
    // ==========================================
    if (id === 'squirrel') {
      const sqMinX = Math.round(W * 0.38);
      const sqMaxX = Math.round(W * 0.54);
      const sqMinY = Math.round(H * 0.63);
      const sqMaxY = Math.round(H * 0.70);

      if (s.isMoving) {
        const dx = s.targetX - s.x;
        const dy = s.targetY - s.y;
        const dist = Math.hypot(dx, dy);
        s.stepCycle += dt * (habitat.speed * 0.28);

        if (dist < 5) {
          s.x = s.targetX;
          s.y = s.targetY;
          s.isMoving = false;
          s.bodyBob = 0;
          s.rotOffset = 0;
          s.pauseTimer = 2.0 + Math.random() * 3.5;
          s.mood = 'playful';
          s.statusText = '草丛嗅探·欢喜捧果';
        } else {
          if (Math.abs(dx) > 2) {
            s.facing = Math.sign(dx) as 1 | -1;
          }
          const step = Math.min(dist, habitat.speed * dt);
          s.x += (dx / dist) * step;
          s.y += (dy / dist) * step;
          s.mood = 'excited';
          s.statusText = '草地窜跳中';
          // 松鼠敏捷高拱跳跃步态 (抛物线大起伏)
          s.bodyBob = -Math.abs(Math.sin(s.stepCycle * 7.5)) * 6.5;
          s.rotOffset = Math.sin(s.stepCycle * 7.5) * 3.0;
        }
      } else {
        s.pauseTimer -= dt;
        s.stepCycle += dt * 1.5;
        // 原地警觉轻嗅、抱着坚果小幅度微动
        s.bodyBob = Math.sin(s.stepCycle * 2.2) * 1.2;
        s.rotOffset = Math.sin(s.stepCycle * 1.5) * 1.6;

        if (s.pauseTimer <= 0) {
          let candX = sqMinX + Math.random() * (sqMaxX - sqMinX);
          let candY = sqMinY + Math.random() * (sqMaxY - sqMinY);
          if (Math.abs(candX - s.x) < (sqMaxX - sqMinX) * 0.25) {
            candX = s.x < (sqMinX + sqMaxX) * 0.5 ? sqMaxX - Math.random() * 15 : sqMinX + Math.random() * 15;
          }
          s.targetX = Math.round(candX);
          s.targetY = Math.round(candY);
          s.facing = Math.sign(s.targetX - s.x) as 1 | -1 || s.facing;
          s.isMoving = true;
          s.mood = 'excited';
          s.statusText = '草地窜跳中';
        }
      }

      // 等比例纵深缩放
      const progress = Math.max(0, Math.min(1, (s.y - sqMinY) / (sqMaxY - sqMinY)));
      s.depthScale = 0.88 + 0.18 * progress;
      s.scaleY = 1;

      next[id] = s;
      return;
    }

    // ==========================================
    // 5. 其他动物 (狐狸、乌龟、水鸭)
    // ==========================================
    if (s.isMoving) {
      const dx = s.targetX - s.x;
      const dist = Math.abs(dx);
      s.stepCycle += dt * (habitat.speed * 0.25);

      if (dist < 4) {
        s.x = s.targetX;
        s.y = habitat.getY(s.x, W, H, treeX, treeY);
        s.isMoving = false;
        s.bodyBob = 0;
        s.rotOffset = 0;
        s.pauseTimer = 3.5 + Math.random() * 4.5;
        s.mood = habitat.idleMood;
        s.statusText = habitat.idleTitle;
      } else {
        const dir = Math.sign(dx) as 1 | -1;
        s.facing = dir;
        const stepDist = Math.min(dist, habitat.speed * dt);
        s.x += dir * stepDist;
        s.y = habitat.getY(s.x, W, H, treeX, treeY);
        s.mood = habitat.movingMood;
        s.statusText = habitat.walkingTitle;

        if (id === 'fox') {
          s.bodyBob = -Math.abs(Math.sin(s.stepCycle * 6)) * 4.2;
          s.rotOffset = Math.sin(s.stepCycle * 6) * 1.5;
        } else if (id === 'turtle') {
          s.bodyBob = Math.sin(s.stepCycle * 2) * 1.0;
          s.rotOffset = Math.sin(s.stepCycle * 2) * 0.8;
        } else if (id === 'otter') {
          s.bodyBob = Math.sin(s.stepCycle * 4) * 3.8;
          s.rotOffset = Math.sin(s.stepCycle * 3) * 2.2;
        }
      }
    } else {
      s.pauseTimer -= dt;
      s.stepCycle += dt * 1.2;

      if (id === 'otter') {
        s.bodyBob = Math.sin(s.stepCycle * 2) * 3.2;
        s.rotOffset = Math.sin(s.stepCycle * 1.5) * 1.8;
      } else if (id === 'fox') {
        s.bodyBob = Math.sin(s.stepCycle * 1.6) * 1.0;
      }

      if (s.pauseTimer <= 0) {
        let candidateX = minX + Math.random() * (maxX - minX);
        if (Math.abs(candidateX - s.x) < (maxX - minX) * 0.35) {
          candidateX = s.x < (minX + maxX) * 0.5 ? maxX - Math.random() * 15 : minX + Math.random() * 15;
        }

        s.targetX = Math.round(candidateX);
        s.targetY = habitat.getY(s.targetX, W, H, treeX, treeY);
        s.facing = Math.sign(s.targetX - s.x) as 1 | -1 || habitat.defaultFacing;
        s.isMoving = true;
        s.mood = habitat.movingMood;
        s.statusText = habitat.walkingTitle;
      }
    }

    // 斜坡与水面的自然等比例纵深
    if (id === 'fox') {
      s.depthScale = 0.90 + 0.15 * Math.max(0, Math.min(1, (s.y - H * 0.65) / (H * 0.08)));
    } else if (id === 'otter') {
      s.depthScale = 0.92 + 0.14 * Math.max(0, Math.min(1, (s.y - H * 0.72) / (H * 0.08)));
    } else if (id === 'turtle') {
      s.depthScale = 0.96;
    }
    s.scaleY = 1;

    next[id] = s;
  });

  return next;
}
