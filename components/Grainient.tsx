'use client';

import React from 'react';
import { Box } from '@mantine/core';

const Grainient: React.FC = () => {
  return (
    <Box
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #050505, #0a0a0a)',
      }}
    >
      {/* CSS Noise Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: '-200%',
          width: '400%',
          height: '400%',
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: 'noise 0.2s infinite alternate',
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes noise {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(-2%, 1%); }
          30% { transform: translate(1%, -2%); }
          40% { transform: translate(-1%, 3%); }
          50% { transform: translate(-2%, 1%); }
          60% { transform: translate(1%, -2%); }
          70% { transform: translate(2%, 1%); }
          80% { transform: translate(-2%, -1%); }
          90% { transform: translate(1%, 2%); }
          100% { transform: translate(1%, -1%); }
        }
      `}} />
    </Box>
  );
};

export default Grainient;
