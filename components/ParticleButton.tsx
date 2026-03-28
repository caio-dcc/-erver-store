'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ParticleButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  fullWidth?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: string;
  type?: 'submit' | 'button' | 'reset';
}

export const ParticleButton = ({ children, onClick, fullWidth, size = 'md', type = 'button' }: ParticleButtonProps) => {
  const sizeStyles = {
    xs: { padding: '4px 10px', fontSize: '10px' },
    sm: { padding: '8px 16px', fontSize: '12px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '16px' },
    xl: { padding: '16px 32px', fontSize: '18px' },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      style={{
        backgroundColor: '#991b1b',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'inherit',
        ...sizeStyles[size]
      }}
    >
      {children}
    </motion.button>
  );
};
