'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { gsap } from 'gsap';

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  parallaxOn?: boolean;
}

const TargetCursor: React.FC<TargetCursorProps> = ({
  targetSelector = '.cursor-target',
  spinDuration = 3,
  hideDefaultCursor = true,
  hoverDuration = 0.3,
  parallaxOn = true
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const spinTl = useRef<gsap.core.Timeline | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef<{ x: number; y: number }[] | null>(null);
  const tickerFnRef = useRef<(() => void) | null>(null);
  const activeStrengthRef = useRef({ current: 0 });

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
  }, []);

  const constants = useMemo(() => ({ borderWidth: 3, cornerSize: 12 }), []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    if (hideDefaultCursor) {
        const style = document.createElement('style');
        style.id = 'hide-cursor-style-v6';
        style.innerHTML = `* { cursor: none !important; }`;
        document.head.appendChild(style);
    }

    const cursor = cursorRef.current;
    
    let activeTarget: Element | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

    // Direct Mouse Tracking (NO Portal Lag)
    let mouseX = 0, mouseY = 0;
    const moveHandler = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };
    window.addEventListener('mousemove', moveHandler, { passive: true });

    const createSpinTimeline = () => {
      const inner = cursor.querySelector('.cursor-inner-container');
      if (!inner) return;
      if (spinTl.current) spinTl.current.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(inner, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };

    createSpinTimeline();

    const tickerFn = () => {
      if (!cursor) return;
      
      // Update main cursor position using hardware-accelerated transform
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      const corners = cursor.querySelectorAll<HTMLDivElement>('.target-cursor-corner');
      const dot = cursor.querySelector<HTMLDivElement>('.cursor-dot');
      if (!corners.length) return;

      // Detect Hover/Selection for Snap
      const hoverTarget = document.querySelector(`${targetSelector}:hover`);
      const selectedTarget = document.querySelector(`${targetSelector}.selected-target`);
      const target = hoverTarget || selectedTarget;

      if (target) {
        if (activeTarget !== target) {
            activeTarget = target;
            const isAlly = target.classList.contains('ally-target');
            const targetColor = isAlly ? '#22c55e' : '#ef4444';
            
            Array.from(corners).forEach(corner => {
                corner.style.borderColor = targetColor;
                corner.style.boxShadow = `0 0 15px ${targetColor}`;
            });
            if (dot) {
                dot.style.backgroundColor = targetColor;
                dot.style.boxShadow = `0 0 20px ${targetColor}, 0 0 40px ${targetColor}`;
            }
            
            const inner = cursor.querySelector('.cursor-inner-container');
            if (inner) {
              spinTl.current?.pause();
              gsap.to(inner, { rotation: 0, duration: 0.2 });
            }
        }

        const rect = target.getBoundingClientRect();
        const { borderWidth, cornerSize } = constants;
        targetCornerPositionsRef.current = [
            { x: rect.left - borderWidth, y: rect.top - borderWidth },
            { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
            { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
            { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
        ];
        
        isActiveRef.current = true;
        gsap.to(activeStrengthRef.current, { current: 1, duration: hoverDuration, ease: 'power2.out' });
      } else {
        if (isActiveRef.current) {
            isActiveRef.current = false;
            targetCornerPositionsRef.current = null;
            gsap.to(activeStrengthRef.current, { current: 0, duration: 0.3, ease: 'power2.out' });
            activeTarget = null;
            
            if (dot) {
                dot.style.backgroundColor = '#fff';
                dot.style.boxShadow = '0 0 15px #fff, 0 0 30px #fff';
            }

            if (!resumeTimeout) {
                resumeTimeout = setTimeout(() => {
                    if (!isActiveRef.current && spinTl.current) spinTl.current.play();
                    resumeTimeout = null;
                }, 100);
            }
        }
      }

      // Smooth corner interpolation relative to cursor center
      Array.from(corners).forEach((corner, i) => {
          const { cornerSize } = constants;
          const idlePositions = [
              { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
              { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
              { x: cornerSize * 0.5, y: cornerSize * 0.5 },
              { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];

          let targetX, targetY;
          if (targetCornerPositionsRef.current) {
              targetX = targetCornerPositionsRef.current[i].x - mouseX;
              targetY = targetCornerPositionsRef.current[i].y - mouseY;
          } else {
              targetX = idlePositions[i].x;
              targetY = idlePositions[i].y;
          }

          const currentX = (gsap.getProperty(corner, 'x') as number) || 0;
          const currentY = (gsap.getProperty(corner, 'y') as number) || 0;

          gsap.set(corner, {
              x: currentX + (targetX - currentX) * 0.25,
              y: currentY + (targetY - currentY) * 0.25
          });
      });
    };

    tickerFnRef.current = tickerFn;
    gsap.ticker.add(tickerFn);

    return () => {
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
      window.removeEventListener('mousemove', moveHandler);
      const styleEl = document.getElementById('hide-cursor-style-v6');
      if (styleEl) styleEl.remove();
    };
  }, [targetSelector, spinDuration, constants, hideDefaultCursor, isMobile, hoverDuration]);

  if (isMobile) return null;

  return (
    <div
      ref={cursorRef}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        willChange: 'transform',
        width: '0px',
        height: '0px',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="cursor-inner-container relative flex items-center justify-center">
        {/* Central Neon Dot */}
        <div
            ref={dotRef}
            className="cursor-dot"
            style={{ 
                width: 10, 
                height: 10, 
                borderRadius: '100%',
                backgroundColor: '#fff',
                boxShadow: '0 0 15px #fff, 0 0 30px #fff',
                transition: 'background-color 0.2s, box-shadow 0.2s'
            }}
        />

        {/* 4 RECTANGULAR CORNERS */}
        {[
            "border-r-0 border-b-0 -translate-x-[150%] -translate-y-[150%]", // TL
            "border-l-0 border-b-0 translate-x-1/2 -translate-y-[150%]",   // TR
            "border-l-0 border-t-0 translate-x-1/2 translate-y-1/2",       // BR
            "border-r-0 border-t-0 -translate-x-[150%] translate-y-1/2"    // BL
        ].map((cls, i) => (
            <div
                key={i}
                className={`target-cursor-corner absolute top-1/2 left-1/2 w-4 h-4 border-[4px] border-white ${cls}`}
                style={{ willChange: 'transform', transition: 'border-color 0.2s, box-shadow 0.2s' }}
            />
        ))}
      </div>
    </div>
  );
};

export default TargetCursor;
