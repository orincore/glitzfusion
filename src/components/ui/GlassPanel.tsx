'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'heavy' | 'light'
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  border?: boolean
  glow?: boolean
  highlight?: boolean
  children: React.ReactNode
}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ 
    variant = 'default', 
    blur = 'xl', 
    border = true, 
    glow = false,
    highlight = true,
    className,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'relative overflow-hidden rounded-2xl'
    
    const variantClasses = {
      default: 'bg-glass-dark',
      heavy: 'bg-glass-dark-heavy',
      light: 'bg-glass-light'
    }
    
    const blurClasses = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
      '2xl': 'backdrop-blur-2xl'
    }
    
    const borderClasses = border ? 'border border-white/10 dark:border-white/10 light:border-black/10' : ''
    const glowClasses = glow ? 'shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-500' : ''
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          blurClasses[blur],
          borderClasses,
          glowClasses,
          className
        )}
        {...props}
      >
        {children}
        
        {highlight && (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit]">
            <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)] opacity-40" />
            <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_bottom,rgba(253,215,146,0.12),transparent_70%)] mix-blend-screen" />
            <div className="absolute -inset-px rounded-[inherit] bg-[conic-gradient(from_140deg,rgba(255,255,255,0.4)_0deg,transparent_120deg,rgba(255,215,128,0.35)_240deg,transparent_320deg)] opacity-0 transition-opacity duration-500 ease-out group-hover/glass:opacity-60" />
            {border && (
              <div className="absolute inset-[1px] rounded-[inherit] border border-white/8 opacity-50 mix-blend-screen" />
            )}
            <div className="absolute inset-0 opacity-[0.025]" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '6px 6px'
            }} />
          </div>
        )}
      </motion.div>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'

export { GlassPanel, type GlassPanelProps }
