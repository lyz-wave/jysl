import Dexie, { Table } from 'dexie';
import { Session, Memory, AnimalId } from './types';

export interface UserProfile {
  id: string;
  nickname: string;
  companion: AnimalId;
  hasCompletedOnboarding: boolean;
  soundEnabled: boolean;
  createdAt: number;
}

export class ForestDatabase extends Dexie {
  sessions!: Table<Session, string>;
  memories!: Table<Memory, string>;
  profile!: Table<UserProfile, string>;

  constructor() {
    super('ForestOfSolaceDB');
    this.version(1).stores({
      sessions: 'id, startedAt, endedAt, status, companion',
      memories: 'id, sessionId, date, title, *themes, *emotions, *helpfulAnimals',
      profile: 'id',
    });
  }
}

export const db = new ForestDatabase();

// 辅助方法：获取或创建默认用户 Profile
export async function getUserProfile(): Promise<UserProfile | undefined> {
  return await db.profile.get('current_user');
}

export async function saveUserProfile(
  profile: Partial<UserProfile>
): Promise<void> {
  const existing = await getUserProfile();
  if (existing) {
    await db.profile.update('current_user', profile);
  } else {
    await db.profile.put({
      id: 'current_user',
      nickname: profile.nickname || '旅人',
      companion: profile.companion || 'bear',
      hasCompletedOnboarding: profile.hasCompletedOnboarding ?? false,
      soundEnabled: profile.soundEnabled ?? false,
      createdAt: Date.now(),
      ...profile,
    });
  }
}
