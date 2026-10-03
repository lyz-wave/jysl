'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Monitor,
  Maximize2,
  Minimize2,
  TreePine,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  Pin,
  Eye,
  EyeOff,
  Compass,
  Check,
} from 'lucide-react';
import { useForestStore } from '@/lib/store';
import { TimeOfDay, AnimalId } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';
import { saveUserProfile } from '@/lib/db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRings: () => void;
  onOpenOnboarding: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenRings,
  onOpenOnboarding,
  isMuted,
  onToggleMute,
}) => {
  const { timeOfDay, setTimeOfDay, profile, loadProfile } = useForestStore();
  const [activeTab, setActiveTab] = useState<'time' | 'wallpaper' | 'profile' | 'rings'>('time');
  const [syncSystemTime, setSyncSystemTime] = useState(true);
  const [nicknameInput, setNicknameInput] = useState('');
  const [isTauri, setIsTauri] = useState(false);
  const [isWallpaperMode, setIsWallpaperMode] = useState(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [isClickThrough, setIsClickThrough] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedTip, setSavedTip] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      setIsTauri(true);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setNicknameInput(profile.nickname);
    }
  }, [profile]);

  // 监听真实系统时间
  useEffect(() => {
    const updateTime = () => {
      if (syncSystemTime) {
        const hours = new Date().getHours();
        let calculatedTime: TimeOfDay = 'noon';
        if (hours >= 5 && hours < 11) {
          calculatedTime = 'dawn';
        } else if (hours >= 11 && hours < 17) {
          calculatedTime = 'noon';
        } else if (hours >= 17 && hours < 20) {
          calculatedTime = 'dusk';
        } else {
          calculatedTime = 'night';
        }
        if (timeOfDay !== calculatedTime) {
          setTimeOfDay(calculatedTime);
        }
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, [syncSystemTime, timeOfDay, setTimeOfDay]);

  // 监听全屏
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const invokeTauri = async (command: string, args: Record<string, unknown> = {}) => {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke(command, args);
      } catch (err) {
        console.warn(`[Tauri] ${command} failed:`, err);
      }
    }
    return null;
  };

  const handleToggleWallpaper = async () => {
    const nextState = !isWallpaperMode;
    setIsWallpaperMode(nextState);
    if (isTauri) {
      await invokeTauri('set_wallpaper_mode', { enabled: nextState });
    } else {
      if (nextState && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!nextState && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleToggleAlwaysOnTop = async () => {
    const nextState = !isAlwaysOnTop;
    setIsAlwaysOnTop(nextState);
    if (isTauri) {
      await invokeTauri('set_always_on_top', { onTop: nextState });
    }
  };

  const handleToggleClickThrough = async () => {
    const nextState = !isClickThrough;
    setIsClickThrough(nextState);
    if (isTauri) {
      await invokeTauri('set_click_through', { ignore: nextState });
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSaveProfile = async () => {
    if (!nicknameInput.trim()) return;
    await saveUserProfile({ nickname: nicknameInput.trim() });
    await loadProfile();
    setSavedTip(true);
    setTimeout(() => setSavedTip(false), 2000);
  };

  const handleSelectCompanion = async (animalId: AnimalId) => {
    await saveUserProfile({ companion: animalId });
    await loadProfile();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/45 backdrop-blur-xs transition-all"
      />

      {/* 弹窗主体 (高质感透明液态玻璃 + 手撕多边形边缘) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="relative z-10 w-full max-w-lg drop-shadow-paper-edge flex flex-col my-auto max-h-[90vh]"
      >
        <div className="relative w-full overflow-hidden rounded-3xl glass-card-paper paper-rough-edge text-left flex flex-col max-h-[85vh]">
          {/* 顶部镜面反光扫光 */}
          <div className="absolute top-0 inset-x-0 h-28 pointer-events-none bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-3xl" />

          {/* 弹窗头部 */}
          <div className="relative z-10 p-5 sm:p-6 pb-3 border-b border-white/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/18 border border-emerald-600/30 flex items-center justify-center text-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
                ⚙️
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#28180E] drop-shadow-xs">森林设置</h3>
                <p className="text-[11px] text-[#6E472B]">光影流转 · 桌面壁纸 · 伙伴偏好</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6E472B] hover:text-[#28180E] bg-white/40 hover:bg-white/75 border border-white/70 backdrop-blur-md shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab 切换胶囊 */}
          <div className="relative z-10 px-5 sm:px-6 pt-3 flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'time', label: '🌅 晨昏光影' },
              { id: 'wallpaper', label: '🖥️ 桌面壁纸' },
              { id: 'profile', label: '🍃 旅人伙伴' },
              { id: 'rings', label: '🌳 年轮与声音' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#2B6624] text-white shadow-xs border border-emerald-300/60'
                    : 'bg-white/40 hover:bg-white/70 text-[#5C3F2B] border border-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 内容区 */}
          <div className="relative z-10 p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
            {/* Tab 1: 晨昏与光影 */}
            {activeTab === 'time' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#28180E] text-sm">自动跟随真实世界</h4>
                      <p className="text-[11px] text-[#6E472B]">
                        按当前 Mac 本地时间自动流转清晨、正午、晚霞与静谧星夜
                      </p>
                    </div>
                    <button
                      onClick={() => setSyncSystemTime(!syncSystemTime)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        syncSystemTime
                          ? 'bg-emerald-500/20 border-emerald-600/40 text-emerald-950'
                          : 'bg-stone-200/50 border-stone-300 text-stone-600'
                      }`}
                    >
                      {syncSystemTime ? '🟢 已开启' : '⚪ 已关闭'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-[#6E472B] block">手动指定当前森林时段：</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'dawn', icon: '🌅', label: '清晨破晓', tip: '05:00 - 11:00 · 晨光微明' },
                      { id: 'noon', icon: '☀️', label: '暖阳晴空', tip: '11:00 - 17:00 · 阳光明媚' },
                      { id: 'dusk', icon: '🌆', label: '晚霞余晖', tip: '17:00 - 20:00 · 橘粉晚霞' },
                      { id: 'night', icon: '🌙', label: '静谧星夜', tip: '20:00 - 05:00 · 篝火点亮' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSyncSystemTime(false);
                          setTimeOfDay(item.id as TimeOfDay);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer backdrop-blur-md ${
                          timeOfDay === item.id
                            ? 'bg-[#2B6624] text-white border-emerald-300/60 shadow-xs'
                            : 'bg-white/45 hover:bg-white/70 text-[#4D3322] border-white/70'
                        }`}
                      >
                        <div className="text-base mb-1">{item.icon}</div>
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{item.tip}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: 桌面壁纸与显示 */}
            {activeTab === 'wallpaper' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)] space-y-2">
                  <h4 className="font-bold text-[#28180E] text-sm">🖥️ 桌面壁纸与全屏常驻</h4>
                  <p className="text-[11px] text-[#6E472B] leading-relaxed">
                    将整座森林作为你的动态桌面壁纸。支持置底运行、多屏漫步，不影响你的日常桌面办公。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleToggleWallpaper}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer backdrop-blur-md flex flex-col items-center justify-center gap-1.5 ${
                      isWallpaperMode
                        ? 'bg-gradient-to-r from-[#2B6624] to-[#3E8B34] text-white border-emerald-300/60 shadow-xs'
                        : 'bg-white/45 hover:bg-white/70 text-[#4D3322] border-white/70'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                    <span className="font-bold text-xs">
                      {isWallpaperMode ? '已开启底层壁纸' : '设为底层桌面壁纸'}
                    </span>
                    <span className="text-[10px] opacity-75">置于所有窗口下方</span>
                  </button>

                  <button
                    onClick={handleToggleFullscreen}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer backdrop-blur-md flex flex-col items-center justify-center gap-1.5 ${
                      isFullscreen
                        ? 'bg-amber-600/25 border-amber-600/40 text-amber-950'
                        : 'bg-white/45 hover:bg-white/70 text-[#4D3322] border-white/70'
                    }`}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-5 h-5" />
                        <span className="font-bold text-xs">退出全屏铺满</span>
                        <span className="text-[10px] opacity-75">还原为常规窗口</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-5 h-5" />
                        <span className="font-bold text-xs">全屏铺满屏幕</span>
                        <span className="text-[10px] opacity-75">沉浸式森林视野</span>
                      </>
                    )}
                  </button>

                  {isTauri && (
                    <>
                      <button
                        onClick={handleToggleAlwaysOnTop}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer backdrop-blur-md flex flex-col items-center justify-center gap-1.5 ${
                          isAlwaysOnTop
                            ? 'bg-amber-500/25 border-amber-600/40 text-amber-950'
                            : 'bg-white/45 hover:bg-white/70 text-[#4D3322] border-white/70'
                        }`}
                      >
                        <Pin className="w-5 h-5" />
                        <span className="font-bold text-xs">
                          {isAlwaysOnTop ? '已开启窗口置顶' : '置顶浮窗挂件'}
                        </span>
                        <span className="text-[10px] opacity-75">保持在最前方便于随时倾诉</span>
                      </button>

                      <button
                        onClick={handleToggleClickThrough}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer backdrop-blur-md flex flex-col items-center justify-center gap-1.5 ${
                          isClickThrough
                            ? 'bg-rose-500/25 border-rose-600/40 text-rose-950'
                            : 'bg-white/45 hover:bg-white/70 text-[#4D3322] border-white/70'
                        }`}
                      >
                        {isClickThrough ? (
                          <>
                            <EyeOff className="w-5 h-5 text-rose-700" />
                            <span className="font-bold text-xs">已开启鼠标穿透</span>
                            <span className="text-[10px] opacity-75">点击直达桌面图标</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-5 h-5" />
                            <span className="font-bold text-xs">开启鼠标穿透</span>
                            <span className="text-[10px] opacity-75">穿透给桌面文件</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: 旅人与伙伴 */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {/* 昵称编辑 */}
                <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)] space-y-2">
                  <span className="font-bold text-[#28180E] block text-xs">你的森林旅人昵称：</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder="给自己起个温柔的名字..."
                      className="flex-1 px-3 py-2 rounded-xl bg-white/60 border border-white/80 text-xs text-[#28180E] focus:outline-none focus:bg-white/90"
                    />
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 rounded-xl bg-[#2B6624] text-white text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                    >
                      {savedTip ? <Check className="w-3.5 h-3.5" /> : '保存'}
                    </button>
                  </div>
                </div>

                {/* 7只动物选择首选伙伴 */}
                <div className="space-y-2">
                  <span className="font-bold text-[#6E472B] block">
                    首选倾诉伙伴（圆桌中将首先为你解忧）：
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.values(ANIMALS).map((animal) => {
                      const isSelected = profile?.companion === animal.id;
                      return (
                        <div
                          key={animal.id}
                          onClick={() => handleSelectCompanion(animal.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer backdrop-blur-md flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85)]'
                              : 'bg-white/45 hover:bg-white/70 border-white/70'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-[#28180E] flex items-center gap-1.5">
                              <span>{animal.name}</span>
                              <span className="text-[10px] text-[#6E472B] font-normal">
                                · {animal.psychology}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#7A583E] mt-0.5">{animal.mindset}</p>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#2B6624] text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: 年轮与声音 */}
            {activeTab === 'rings' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#28180E] text-sm">🌳 查看古树成长年轮</h4>
                      <p className="text-[11px] text-[#6E472B]">
                        浏览每一次在篝火旁沉淀下的思维破茧与心事年轮
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenRings();
                      }}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#2B6624] to-[#3E8B34] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>查看年轮长卷</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#28180E] text-sm">🔊 森林环境音与白噪音</h4>
                    <p className="text-[11px] text-[#6E472B]">
                      风吹树梢、鸟鸣清脆与篝火柴火噼啪声
                    </p>
                  </div>
                  <button
                    onClick={onToggleMute}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      !isMuted
                        ? 'bg-emerald-500/20 border-emerald-600/40 text-emerald-950'
                        : 'bg-stone-200/50 border-stone-300 text-stone-500'
                    }`}
                  >
                    {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#28180E] text-sm">🌱 新手入林引导</h4>
                    <p className="text-[11px] text-[#6E472B]">重新查看解忧森林的心理学机制与操作指引</p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOnboarding();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 text-[#3D2819] font-bold text-xs transition-all cursor-pointer"
                  >
                    重新播放
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 底部关闭 */}
          <div className="relative z-10 p-4 border-t border-white/60 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-[#FAF7EE] text-[#4A3220] border border-[#8C6648]/40 hover:bg-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              返回森林
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
