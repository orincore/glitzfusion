'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Client-side only component to prevent hydration mismatch
const ClientOnlySparkles = ({ count = 50, color = '#FFFFFF', size = 6, className = '' }) => {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SparklesBackground
      count={count}
      color={color}
      size={size}
      className={className}
      prefersReducedMotion={!!prefersReducedMotion}
    />
  );
};

interface SparkleProps {
  size?: number;
  color?: string;
  left: string;
  top: string;
  delay: number;
  duration: number;
  opacity: number;
  blur: number;
  intensity: number;
  floatY: number;
  floatX: number;
}

const Sparkle = ({
  size = 6,
  color = '#FFD700',
  left,
  top,
  delay,
  duration,
  opacity,
  blur,
  intensity,
  floatY,
  floatX,
}: SparkleProps) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left,
        top,
        opacity,
        background: `radial-gradient(circle, ${color} 0%, ${color} ${intensity * 30}%, rgba(255,255,255,0.8) 60%, transparent 100%)`,
        borderRadius: '50%',
        boxShadow: `
          0 0 ${size * 1.6}px ${size * 0.4}px ${color}${Math.round(intensity * 90).toString(16)},
          0 0 ${size * 3.2}px ${size * 0.8}px rgba(255,255,255,0.25)
        `,
        filter: `blur(${blur}px) brightness(${1.1 + intensity * 0.6})`,
        willChange: 'transform, opacity',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, opacity * 1.4, opacity * 0.9, opacity * 1.3, 0],
        scale: [0.6, 1.1, 0.85, 1.2, 0.6],
        x: [0, floatX, -floatX * 0.5, floatX * 0.3, 0],
        y: [0, -floatY * 0.6, floatY * 0.2, -floatY, 0],
        rotate: [0, 120, 240, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        times: [0, 0.2, 0.5, 0.8, 1],
      }}
    />
  );
};

const SparklesBackground = ({
  count = 50,
  color = '#FFFFFF',
  size = 6,
  className = '',
  prefersReducedMotion,
}: {
  count?: number
  color?: string
  size?: number
  className?: string
  prefersReducedMotion: boolean
}) => {
  const [sparkles, setSparkles] = useState<Array<{
    id: string;
    left: string;
    top: string;
    delay: number;
    duration: number;
    opacity: number;
    blur: number;
    intensity: number;
    floatY: number;
    floatX: number;
    size: number;
  }>>([]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setSparkles([]);
      return;
    }

    const newSparkles = Array.from({ length: count }).map((_, i) => {
      const variant = Math.random() > 0.45 ? 'medium' : 'small';
      const sparkleSize = variant === 'medium' ? size * (1.8 + Math.random() * 1.2) : size * (0.7 + Math.random() * 0.6);
      const intensity = 0.45 + Math.random() * 0.55;

      return {
        id: `sparkle-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 8, // 6-14 seconds for smooth transitions
        opacity: 0.4 + Math.random() * 0.5,
        blur: Math.random() * 0.8,
        intensity,
        floatY: 8 + Math.random() * 22,
        floatX: (Math.random() - 0.5) * 10,
        size: sparkleSize,
      };
    });

    setSparkles(newSparkles);
  }, [count, prefersReducedMotion, size]);

  return (
    <div className={`overflow-hidden pointer-events-none ${className}`}>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          size={sparkle.size}
          color={color}
          left={sparkle.left}
          top={sparkle.top}
          delay={sparkle.delay}
          duration={sparkle.duration}
          opacity={sparkle.opacity}
          blur={sparkle.blur}
          intensity={sparkle.intensity}
          floatY={sparkle.floatY}
          floatX={sparkle.floatX}
        />
      ))}
    </div>
  );
}

interface SparklesContainerProps {
  children: React.ReactNode;
  className?: string;
  sparklesCount?: number;
  color?: string;
}

function SparklesContainer({ children, className = '', sparklesCount = 15, color = '#FFD700' }: SparklesContainerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060606] via-[#050207]/96 to-[#020103]/99 z-0" />
      <ClientOnlySparkles count={sparklesCount} color={color} className="absolute inset-0 z-10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.025),transparent_62%)] z-20" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(40,32,68,0.35),transparent_50%,rgba(10,10,10,0.45)_88%)] mix-blend-multiply z-20" />
      <div className="relative z-30">
        {children}
      </div>
    </div>
  );
}

export { SparklesContainer, ClientOnlySparkles as SparklesBackground };
