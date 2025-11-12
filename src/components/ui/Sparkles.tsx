'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Client-side only component to prevent hydration mismatch
const ClientOnlySparkles = ({ count = 50, color = '#FFFFFF', size = 6, className = '' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <SparklesBackground count={count} color={color} size={size} className={className} />;
};

interface SparkleProps {
  size?: number;
  color?: string;
  left: string;
  top: string;
  delay: number;
  duration: number;
  opacity: number;
}

const Sparkle = ({ size = 6, color = '#FFD700', left, top, delay, duration, opacity }: SparkleProps) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left,
        top,
        opacity,
        background: `radial-gradient(circle, ${color} 0%, ${color} 30%, rgba(255,255,255,0.8) 60%, transparent 100%)`,
        borderRadius: '50%',
        boxShadow: `
          0 0 ${size * 2}px ${size * 0.5}px ${color}60,
          0 0 ${size * 4}px ${size}px rgba(255,255,255,0.3)
        `,
        filter: 'brightness(1.3)',
        willChange: 'transform, opacity',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, opacity * 1.5, opacity, opacity * 1.8, 0],
        scale: [0, 0.8, 1.5, 0.6, 0],
        rotate: [0, 180, 360],
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

const SparklesBackground = ({ count = 50, color = '#FFFFFF', size = 6, className = '' }) => {
  const [sparkles, setSparkles] = useState<Array<{
    id: string;
    left: string;
    top: string;
    delay: number;
    duration: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    // Generate random sparkles with better distribution and performance optimization
    const newSparkles = Array.from({ length: count }).map((_, i) => ({
      id: `sparkle-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3, // 3-6 seconds for smoother performance
      opacity: 0.5 + Math.random() * 0.5, // 0.5-1 opacity
    }));
    
    setSparkles(newSparkles);
  }, [count]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          size={size}
          color={color}
          left={sparkle.left}
          top={sparkle.top}
          delay={sparkle.delay}
          duration={sparkle.duration}
          opacity={sparkle.opacity}
        />
      ))}
    </div>
  );
}

interface SparklesContainerProps {
  children: React.ReactNode;
  className?: string;
  sparklesCount?: number;
}

function SparklesContainer({ children, className = '', sparklesCount = 15 }: SparklesContainerProps) {
  return (
    <div className={`relative ${className}`}>
      <ClientOnlySparkles count={sparklesCount} />
      {children}
    </div>
  );
}

export { SparklesContainer, ClientOnlySparkles as SparklesBackground };
