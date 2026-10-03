'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimalId } from '@/lib/types';
import { ANIMALS } from '@/lib/animals';

interface GameModalProps {
  animalId: AnimalId;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const GameModal: React.FC<GameModalProps> = ({
  animalId,
  isOpen,
  onClose,
  children,
}) => {
  const animal = ANIMALS[animalId];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2C1D13]/40 backdrop-blur-xs"
          />

          {/* 立体书弹起式卡片主框 */}
          <motion.div
            initial={{ opacity: 0, rotateX: 65, y: 50, scale: 0.94 }}
            animate={{
              opacity: 1,
              rotateX: 0,
              y: 0,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24,
                mass: 0.8,
              },
            }}
            exit={{
              opacity: 0,
              rotateX: 50,
              y: 40,
              scale: 0.95,
              transition: { duration: 0.2 },
            }}
            style={{ transformOrigin: 'bottom center' }}
            className="relative w-full max-w-lg bg-[#FAF7EE] text-[#4D3524] rounded-3xl p-5 sm:p-7 border-2 border-[#E8DEC8] shadow-[0_20px_50px_rgba(45,30,20,0.22)] paper-rough-edge z-10 my-auto"
          >
            {/* 纸张边缘手撕折痕线 */}
            <div className="absolute inset-2 border border-dashed border-[#D9CDB8]/60 rounded-2xl pointer-events-none" />

            {/* 顶部标题栏 */}
            <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[#E8DEC8]/80">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">
                  {animalId === 'woodpecker' && '🌲'}
                  {animalId === 'bear' && '🐻'}
                  {animalId === 'owl' && '🦉'}
                  {animalId === 'fox' && '🦊'}
                  {animalId === 'turtle' && '🐢'}
                  {animalId === 'otter' && '🦆'}
                  {animalId === 'squirrel' && '🐿️'}
                </span>
                <div>
                  <h3 className="font-bold text-lg text-[#3B2D25] flex items-center gap-2">
                    <span>{animal.gameName}</span>
                    <span className="text-xs font-normal text-[#7A583E]">
                      与 {animal.name}
                    </span>
                  </h3>
                  <p className="text-xs text-[#38662F] font-semibold">
                    {animal.psychology}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EFE8DE] hover:bg-[#E2D8CC] text-[#7A583E] text-sm transition-colors active:scale-95 cursor-pointer shadow-xs"
              >
                ✕
              </button>
            </div>

            {/* 小游戏核心交互内容容器 */}
            <div className="relative z-10">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
