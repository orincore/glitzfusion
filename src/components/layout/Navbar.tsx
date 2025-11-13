'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn } from '@/lib/utils'
import LogoImg from '@/../public/logo/Glitzfusion logo bg rm.png'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/courses' },
  { name: 'About', href: '/about' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Admissions', href: '/admissions' },
  { name: 'Testimonials', href: '/testimonials' },
  { name: 'Careers', href: '/careers' },
  { name: 'Contact', href: '/contact' },
  { name: 'Blog', href: '/blog' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setIsOpen(false)

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'py-2' : 'py-4'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container-custom">
        <GlassPanel
          className={cn(
            'relative overflow-hidden rounded-2xl transition-all duration-300',
            isScrolled ? 'shadow-gold-glow-lg' : 'shadow-glass'
          )}
          blur="2xl"
          glow={isScrolled}
          border={false}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-gold/15 via-transparent to-primary-gold/15 opacity-70" />
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary-gold/50 to-transparent" />
          <nav className="relative flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <Link 
              href="/" 
              className="group flex items-center space-x-4 rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-black/70"
              onClick={closeMenu}
            >
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary-gold/35 blur-xl opacity-50 transition-opacity duration-300 group-hover:opacity-80" />
                  <Image
                    src={LogoImg}
                    alt="GLITZFUSION"
                    width={200}
                    height={60}
                    priority
                    className="relative h-12 w-auto object-contain drop-shadow-[0_8px_20px_rgba(212,175,55,0.45)]"
                    style={{
                      filter: 'invert(1) saturate(1.2)'
                    }}
                  />
                </div>
                <span className="sr-only">Premier Media Academy</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                    'hover:text-primary-gold focus-visible:text-primary-gold',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-black/80'
                  )}
                >
                  <span className="relative z-10">{item.name}</span>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary-gold/15"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center">
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  'lg:hidden p-2 rounded-full transition-colors duration-200',
                  'hover:bg-primary-gold/10 focus-visible:bg-primary-gold/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-black/80',
                  'touch-target'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle mobile menu"
                aria-expanded={isOpen}
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="lg:hidden overflow-hidden border-t border-white/10"
              >
                <div className="px-6 py-4 space-y-2">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={cn(
                          'block rounded-full px-4 py-3 text-base font-medium transition-colors duration-200',
                          'hover:bg-primary-gold/10 hover:text-primary-gold',
                          'focus-visible:bg-primary-gold/10 focus-visible:text-primary-gold',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-black/80',
                          'touch-target'
                        )}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>
      </div>
    </motion.header>
  )
}
