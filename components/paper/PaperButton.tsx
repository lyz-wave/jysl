'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface PaperButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'vermilion' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const PaperButton: React.FC<PaperButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-2xl gap-2 font-medium',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 font-bold',
  };

  const variantStyles = {
    primary:
      'bg-[#4A7C39] hover:bg-[#3D6B2E] text-white border border-[#2D5220] shadow-[0_4px_0_#2A4E1E]',
    secondary:
      'bg-[#FAF7EE] hover:bg-[#F3ECE0] text-[#4D3524] border-2 border-[#D9CDB8] shadow-[0_4px_0_#C5B79F]',
    vermilion:
      'bg-[#C84630] hover:bg-[#B33B26] text-white border border-[#8C2919] shadow-[0_4px_0_#752012]',
    outline:
      'bg-transparent hover:bg-[#FAF7EE]/50 text-[#4D3524] border-2 border-dashed border-[#B8A78F] shadow-none hover:shadow-[0_2px_0_#B8A78F]',
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { y: 3, boxShadow: '0 1px 0 rgba(0,0,0,0.2)' }}
      whileHover={disabled ? {} : { y: -1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center cursor-pointer select-none transition-colors active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
