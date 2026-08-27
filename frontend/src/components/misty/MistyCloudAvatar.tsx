/**
 * frontend/src/components/misty/MistyCloudAvatar.tsx
 * SkyGuard AI — Misty the Cloudy Face with Interactive Cursor Eye Tracking
 * Matches cartoon cloud reference with reactive pupils, eyelashes, and sleep animations.
 */

import React, { useEffect, useRef, useState } from 'react';

interface MistyCloudAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isAwake?: boolean;
  className?: string;
  onClick?: () => void;
  showSleepZzz?: boolean;
  interactive?: boolean;
}

export const MistyCloudAvatar: React.FC<MistyCloudAvatarProps> = ({
  size = 'md',
  isAwake = true,
  className = '',
  onClick,
  showSleepZzz = true,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Size mapping
  const sizeMap = {
    sm: { width: 36, height: 26, eyeRadius: 2.2, maxOffset: 1.8 },
    md: { width: 56, height: 42, eyeRadius: 3.5, maxOffset: 3.2 },
    lg: { width: 84, height: 64, eyeRadius: 5.2, maxOffset: 4.8 },
    xl: { width: 110, height: 84, eyeRadius: 6.8, maxOffset: 6.0 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Real-time cursor tracking
  useEffect(() => {
    if (!isAwake || !interactive) {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.hypot(deltaX, deltaY);

      // Scale offset smoothly up to maxOffset
      const maxDistance = 400;
      const factor = Math.min(distance / maxDistance, 1);
      const moveAmount = currentSize.maxOffset * factor;

      setPupilOffset({
        x: Math.cos(angle) * moveAmount,
        y: Math.sin(angle) * moveAmount,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isAwake, interactive, currentSize.maxOffset]);

  // Periodic natural blinking
  useEffect(() => {
    if (!isAwake) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4500 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [isAwake]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none inline-flex items-center justify-center transition-transform duration-200 ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
      }}
      title={isAwake ? 'Misty is Awake & Listening ☁️✨' : 'Misty is Asleep 💤'}
    >
      {/* Floating Sleep Zzz Animation */}
      {!isAwake && showSleepZzz && (
        <div className="absolute -top-3 -right-2 flex flex-col items-center pointer-events-none z-20">
          <span className="text-[11px] font-bold text-sky-300 animate-bounce opacity-80" style={{ animationDuration: '2s' }}>
            z
          </span>
          <span className="text-[13px] font-extrabold text-sky-200 -mt-1 animate-pulse" style={{ animationDuration: '1.6s' }}>
            Z
          </span>
          <span className="text-[16px] font-black text-white -mt-1 animate-bounce" style={{ animationDuration: '2.4s' }}>
            Z
          </span>
        </div>
      )}

      {/* SVG Cloud Illustration */}
      <svg
        viewBox="0 0 160 120"
        className={`w-full h-full transition-all duration-200 ${
          isAwake ? 'opacity-100' : 'opacity-65 grayscale-[20%]'
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cloud Body Gradient */}
          <linearGradient id="cloudBodyGrad" x1="80" y1="10" x2="80" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e2f5ff" />
            <stop offset="100%" stopColor="#bee5fd" />
          </linearGradient>

          {/* Cloud Outer Glow / Shadow */}
          <linearGradient id="cloudUnderGrad" x1="80" y1="60" x2="80" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a2d6f9" stopOpacity="0" />
            <stop offset="100%" stopColor="#7ec4f4" stopOpacity="0.8" />
          </linearGradient>

          {/* Cheek Blush Gradient */}
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff7b93" stopOpacity={isHovered ? '0.95' : '0.8'} />
            <stop offset="100%" stopColor="#ff7b93" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Outer Dark Thick Border (Reference Match) */}
        <path
          d="M48 38 C42 22, 60 14, 76 16 C88 8, 114 10, 122 26 C136 28, 150 42, 146 58 C154 72, 146 90, 132 96 C124 104, 102 106, 92 98 C82 106, 52 108, 42 96 C30 102, 14 90, 14 74 C8 60, 20 42, 38 40 C42 38, 44 38, 48 38 Z"
          fill="#0c1a2e"
          stroke="#091424"
          strokeWidth="12"
          strokeLinejoin="round"
        />

        {/* 2. Crisp White Outer Trim Halo */}
        <path
          d="M48 38 C42 22, 60 14, 76 16 C88 8, 114 10, 122 26 C136 28, 150 42, 146 58 C154 72, 146 90, 132 96 C124 104, 102 106, 92 98 C82 106, 52 108, 42 96 C30 102, 14 90, 14 74 C8 60, 20 42, 38 40 C42 38, 44 38, 48 38 Z"
          fill="white"
          stroke="white"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* 3. Main Cyan-Blue Cloud Body */}
        <path
          d="M48 38 C42 22, 60 14, 76 16 C88 8, 114 10, 122 26 C136 28, 150 42, 146 58 C154 72, 146 90, 132 96 C124 104, 102 106, 92 98 C82 106, 52 108, 42 96 C30 102, 14 90, 14 74 C8 60, 20 42, 38 40 C42 38, 44 38, 48 38 Z"
          fill="url(#cloudBodyGrad)"
          stroke="#1e3a5f"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 4. Bottom Ambient Shadow Underneath */}
        <path
          d="M20 74 C16 88, 30 100, 42 96 C52 108, 82 106, 92 98 C102 106, 124 104, 132 96 C144 90, 150 74, 144 60 C138 78, 120 92, 92 92 C68 92, 40 88, 20 74 Z"
          fill="url(#cloudUnderGrad)"
        />

        {/* 5. Top-Left Glossy White Sheen Highlights */}
        <ellipse cx="44" cy="46" rx="5" ry="3.5" transform="rotate(-30 44 46)" fill="white" opacity="0.9" />
        <ellipse cx="50" cy="40" rx="3" ry="2" transform="rotate(-30 50 40)" fill="white" opacity="0.8" />
        <ellipse cx="26" cy="58" rx="8" ry="4" transform="rotate(-40 26 58)" fill="white" opacity="0.75" />

        {/* 6. Cute Rosy Blush Cheeks */}
        <ellipse cx="45" cy="74" rx="10" ry="6.5" fill="url(#blushGrad)" />
        <ellipse cx="115" cy="74" rx="10" ry="6.5" fill="url(#blushGrad)" />

        {/* 7. Eyebrows */}
        <path
          d="M55 45 C60 41, 68 42, 72 46"
          stroke="#091424"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M88 46 C92 42, 100 41, 105 45"
          stroke="#091424"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* 8. Happy Open Smile Mouth */}
        <g transform="translate(80, 75)">
          <path
            d="M -13 0 C -13 9, 13 9, 13 0 Z"
            fill="#091424"
            stroke="#091424"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Pink Tongue */}
          <path
            d="M -7 4 C -4 9, 4 9, 7 4 C 4 3, -4 3, -7 4 Z"
            fill="#ff7b93"
          />
        </g>

        {/* 9. EYES SECTION */}
        {isAwake && !isBlinking ? (
          <>
            {/* === LEFT EYE === */}
            <g id="left-eye">
              {/* Eye White Base */}
              <ellipse cx="62" cy="58" rx="12" ry="14" fill="white" stroke="#091424" strokeWidth="2.2" />

              {/* Eyelashes (3 Flared Lashes) */}
              <path d="M 51 52 C 46 49, 43 47, 40 48" stroke="#091424" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 49 57 C 44 57, 41 57, 38 60" stroke="#091424" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 52 64 C 47 66, 44 68, 42 72" stroke="#091424" strokeWidth="2.4" strokeLinecap="round" />

              {/* Reactive Moving Pupil & Iris */}
              <g
                style={{
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  transition: 'transform 0.06s ease-out',
                }}
              >
                {/* Black Pupil */}
                <ellipse cx="62" cy="58" rx="9" ry="11" fill="#091424" />

                {/* Big White Upper Catchlight */}
                <circle cx="59.5" cy="54" r="4.2" fill="white" />

                {/* Small White Lower Catchlight */}
                <circle cx="65.5" cy="62.5" r="2.2" fill="white" />
              </g>
            </g>

            {/* === RIGHT EYE === */}
            <g id="right-eye">
              {/* Eye White Base */}
              <ellipse cx="98" cy="58" rx="12" ry="14" fill="white" stroke="#091424" strokeWidth="2.2" />

              {/* Eyelashes (3 Flared Lashes) */}
              <path d="M 109 52 C 114 49, 117 47, 120 48" stroke="#091424" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 111 57 C 116 57, 119 57, 122 60" stroke="#091424" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 108 64 C 113 66, 116 68, 118 72" stroke="#091424" strokeWidth="2.4" strokeLinecap="round" />

              {/* Reactive Moving Pupil & Iris */}
              <g
                style={{
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  transition: 'transform 0.06s ease-out',
                }}
              >
                {/* Black Pupil */}
                <ellipse cx="98" cy="58" rx="9" ry="11" fill="#091424" />

                {/* Big White Upper Catchlight */}
                <circle cx="95.5" cy="54" r="4.2" fill="white" />

                {/* Small White Lower Catchlight */}
                <circle cx="101.5" cy="62.5" r="2.2" fill="white" />
              </g>
            </g>
          </>
        ) : (
          /* Sleeping / Blinking Closed Eyes */
          <>
            {/* Left Closed Eye (Cute Sleep Arc) */}
            <path
              d="M 50 60 Q 62 70 74 60"
              fill="none"
              stroke="#091424"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Left Lashes */}
            <path d="M 52 61 L 46 64" stroke="#091424" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 72 61 L 78 64" stroke="#091424" strokeWidth="2.2" strokeLinecap="round" />

            {/* Right Closed Eye (Cute Sleep Arc) */}
            <path
              d="M 86 60 Q 98 70 110 60"
              fill="none"
              stroke="#091424"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Right Lashes */}
            <path d="M 88 61 L 82 64" stroke="#091424" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 108 61 L 114 64" stroke="#091424" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
};
