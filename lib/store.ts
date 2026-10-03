import { create } from 'zustand';
import {
  AnimalId,
  Message,
  Session,
  TimeOfDay,
  PuppetAnimationMood,
  Speaker,
} from './types';
import { UserProfile, db, saveUserProfile } from './db';

export type ForestStage =
  | 'explore'       // 森林探索态（自由点击动物、小游戏、年轮）
  | 'onboarding'    // 首次入林引导
  | 'game'          // 进行小游戏中
  | 'gathering'     // 召集动物动画中
  | 'rating-before' // 倾诉前打分 (1-10)
  | 'input'         // 倾诉输入与动物聆听
  | 'roundtable'    // 动物圆桌发言接龙
  | 'summary'       // 古树总结
  | 'followup'      // 追问对话
  | 'rating-after'  // 释怀后打分 (1-10)
  | 'crisis';       // 危机干预模式

interface ForestState {
  // 用户 Profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  loadProfile: () => Promise<void>;

  // 主场景与环境
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  forestStage: ForestStage;
  setForestStage: (stage: ForestStage) => void;

  // 活跃小游戏状态
  activeGameAnimal: AnimalId | null;
  openGame: (animalId: AnimalId) => void;
  closeGame: () => void;
  gameContext: string[];
  addGameContext: (contextText: string) => void;
  clearGameContext: () => void;

  // 当前倾诉会话
  currentSession: Session | null;
  startNewSession: (companion: AnimalId) => void;
  setMoodBefore: (score: number) => void;
  setMoodAfter: (score: number) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  toggleMessageResonated: (messageId: string) => void;
  pauseSession: () => Promise<void>;
  resolveSession: () => Promise<void>;
  loadPausedSession: () => Promise<boolean>;

  // 动物动态反应
  animalMoods: Record<AnimalId, PuppetAnimationMood>;
  setAnimalMood: (animalId: AnimalId, mood: PuppetAnimationMood) => void;
  resetAllAnimalMoods: () => void;
}

export const useForestStore = create<ForestState>((set, get) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  loadProfile: async () => {
    let p = await db.profile.get('current_user');
    if (!p) {
      p = {
        id: 'current_user',
        nickname: '旅人',
        companion: 'bear',
        hasCompletedOnboarding: false,
        soundEnabled: false,
        createdAt: Date.now(),
      };
      await db.profile.put(p);
    }
    set({ profile: p });
  },

  timeOfDay: 'noon',
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),

  forestStage: 'explore',
  setForestStage: (forestStage) => set({ forestStage }),

  activeGameAnimal: null,
  openGame: (animalId) => set({ activeGameAnimal: animalId, forestStage: 'game' }),
  closeGame: () => set({ activeGameAnimal: null, forestStage: 'explore' }),

  gameContext: [],
  addGameContext: (contextText) =>
    set((state) => ({ gameContext: [...state.gameContext, contextText] })),
  clearGameContext: () => set({ gameContext: [] }),

  currentSession: null,
  startNewSession: (companion) => {
    const newSession: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      startedAt: Date.now(),
      status: 'open',
      companion,
      gameContext: [...get().gameContext],
      matchedMemoryIds: [],
      messages: [],
    };
    set({ currentSession: newSession, forestStage: 'gathering' });
  },

  setMoodBefore: (score) => {
    const session = get().currentSession;
    if (session) {
      const updated = { ...session, moodBefore: score };
      set({ currentSession: updated, forestStage: 'input' });
    }
  },

  setMoodAfter: (score) => {
    const session = get().currentSession;
    if (session) {
      const updated = { ...session, moodAfter: score };
      set({ currentSession: updated });
    }
  },

  addMessage: (msg) => {
    const session = get().currentSession;
    if (!session) return;
    const fullMsg: Message = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    const updated = {
      ...session,
      messages: [...session.messages, fullMsg],
    };
    set({ currentSession: updated });
    // 本地异步更新
    db.sessions.put(updated).catch(console.error);
  },

  toggleMessageResonated: (messageId) => {
    const session = get().currentSession;
    if (!session) return;
    const updatedMessages = session.messages.map((m) =>
      m.id === messageId ? { ...m, resonated: !m.resonated } : m
    );
    const updated = { ...session, messages: updatedMessages };
    set({ currentSession: updated });
    db.sessions.put(updated).catch(console.error);
  },

  pauseSession: async () => {
    const session = get().currentSession;
    if (session) {
      const updated = { ...session, status: 'paused' as const };
      await db.sessions.put(updated);
      set({ currentSession: null, forestStage: 'explore' });
    }
  },

  resolveSession: async () => {
    const session = get().currentSession;
    if (session) {
      const updated = { ...session, status: 'resolved' as const, endedAt: Date.now() };
      await db.sessions.put(updated);
      set({ currentSession: null, forestStage: 'explore', gameContext: [] });
    }
  },

  loadPausedSession: async () => {
    const paused = await db.sessions
      .where('status')
      .equals('paused')
      .reverse()
      .sortBy('startedAt');
    if (paused.length > 0) {
      set({ currentSession: paused[0], forestStage: 'followup' });
      return true;
    }
    return false;
  },

  animalMoods: {
    woodpecker: 'idle',
    bear: 'idle',
    owl: 'idle',
    fox: 'idle',
    turtle: 'idle',
    otter: 'idle',
    squirrel: 'idle',
  },
  setAnimalMood: (animalId, mood) =>
    set((state) => ({
      animalMoods: { ...state.animalMoods, [animalId]: mood },
    })),
  resetAllAnimalMoods: () =>
    set({
      animalMoods: {
        woodpecker: 'idle',
        bear: 'idle',
        owl: 'idle',
        fox: 'idle',
        turtle: 'idle',
        otter: 'idle',
        squirrel: 'idle',
      },
    }),
}));
