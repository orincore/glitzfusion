'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'heavy' | 'light'
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  border?: boolean
  glow?: boolean
  children: React.ReactNode
}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ 
    variant = 'default', 
    blur = 'xl', 
    border = true, 
    glow = false,
    className,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'relative overflow-hidden'
    
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
    const glowClasses = glow ? 'shadow-gold-glow hover:shadow-gold-glow-lg transition-shadow duration-300' : ''
    
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
        
        {/* Film grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle, transparent 1px, rgba(255, 255, 255, 0.15) 1px)
              `,
              backgroundSize: '4px 4px'
            }}
          />
        </div>
      </motion.div>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'

export { GlassPanel, type GlassPanelProps }
