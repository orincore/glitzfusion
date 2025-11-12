'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn } from '@/lib/utils'
import { useAbout } from '@/hooks/useAbout'

const quickLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Courses', href: '/courses' },
  { name: 'Admissions', href: '/admissions' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
]

const courseLinks = [
  { name: 'Acting Classes', href: '/courses/acting' },
  { name: 'Dance Academy', href: '/courses/dance' },
  { name: 'Photography', href: '/courses/photography' },
  { name: 'Filmmaking', href: '/courses/filmmaking' },
  { name: 'Modeling', href: '/courses/modeling' },
]

export function Footer() {
  const { content, loading } = useAbout()

  // Create dynamic social links from database content
  const socialLinks = [
    { 
      name: 'Instagram', 
      href: content.socialInstagram || '#', 
      icon: Instagram,
      show: !!content.socialInstagram 
    },
    { 
      name: 'Facebook', 
      href: content.socialFacebook || '#', 
      icon: Facebook,
      show: !!content.socialFacebook 
    },
    { 
      name: 'Twitter', 
      href: content.socialTwitter || '#', 
      icon: Twitter,
      show: !!content.socialTwitter 
    },
    { 
      name: 'YouTube', 
      href: content.socialYoutube || '#', 
      icon: Youtube,
      show: !!content.socialYoutube 
    },
  ].filter(link => link.show) // Only show links that have URLs

  return (
    <footer className="relative mt-20">
      {/* Curved top border */}
      <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
            className="fill-glass-dark/80 dark:fill-glass-dark/80 light:fill-white/90"
          />
        </svg>
      </div>
      
      {/* Full width footer content */}
      <div className="w-full bg-glass-dark/80 dark:bg-glass-dark/80 light:bg-white/90 backdrop-blur-xl pt-20">
        <div className="container-custom">
          <div className="px-8 py-12">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link href="/" className="inline-block mb-4">
                    <div className="text-2xl font-display font-bold text-gradient-gold">
                      GLITZFUSION
                    </div>
                  </Link>
                  <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 mb-6 leading-relaxed">
                    Premier Media Academy offering world-class training in Acting, Dancing, 
                    Photography, Filmmaking, and Modeling. Transform your passion into 
                    professional excellence.
                  </p>
                  
                  {/* Contact Info */}
                  <div className="space-y-3">
                    {content.contactEmail && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Mail className="w-4 h-4 text-primary-gold" />
                        <a 
                          href={`mailto:${content.contactEmail}`}
                          className="hover:text-primary-gold transition-colors"
                        >
                          {content.contactEmail}
                        </a>
                      </div>
                    )}
                    {content.contactPhone && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Phone className="w-4 h-4 text-primary-gold" />
                        <a 
                          href={`tel:${content.contactPhone}`}
                          className="hover:text-primary-gold transition-colors"
                        >
                          {content.contactPhone}
                        </a>
                      </div>
                    )}
                    {content.contactAddress && (
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="w-4 h-4 text-primary-gold" />
                        <span>{content.contactAddress}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Quick Links */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-semibold text-primary-gold mb-4">
                    Quick Links
                  </h3>
                  <ul className="space-y-2">
                    {quickLinks.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className={cn(
                            'text-sm transition-colors duration-200',
                            'hover:text-primary-gold focus:text-primary-gold',
                            'focus:outline-none'
                          )}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Courses */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-semibold text-primary-gold mb-4">
                    Our Courses
                  </h3>
                  <ul className="space-y-2">
                    {courseLinks.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className={cn(
                            'text-sm transition-colors duration-200',
                            'hover:text-primary-gold focus:text-primary-gold',
                            'focus:outline-none'
                          )}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Social & Newsletter */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-semibold text-primary-gold mb-4">
                    Connect With Us
                  </h3>
                  
                  {/* Social Links */}
                  <div className="flex space-x-4 mb-6">
                    {socialLinks.map((social) => {
                      const Icon = social.icon
                      return (
                        <motion.a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
                            'hover:bg-primary-gold/20 hover:text-primary-gold',
                            'focus:outline-none focus:bg-primary-gold/20 focus:text-primary-gold',
                            'text-gray-300 hover:scale-105 active:scale-95'
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`Follow us on ${social.name}`}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.a>
                      )
                    })}
                  </div>

                  {/* Newsletter Signup */}
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 mb-3">
                      Subscribe to our newsletter for updates and exclusive offers.
                    </p>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        suppressHydrationWarning
                        className={cn(
                          'flex-1 px-3 py-2 text-sm rounded-lg',
                          'bg-glass-dark border border-white/10',
                          'focus:border-primary-gold focus:outline-none focus:ring-1 focus:ring-primary-gold',
                          'placeholder:text-gray-400'
                        )}
                      />
                      <motion.button
                        suppressHydrationWarning
                        className={cn(
                          'px-4 py-2 text-sm font-medium rounded-lg',
                          'bg-primary-gold text-primary-black',
                          'hover:bg-primary-gold-light focus:bg-primary-gold-light',
                          'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                          'transition-colors duration-200'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Subscribe
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="pt-8 border-t border-white/10"
            >
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 text-center">
                  <div>© 2024 GLITZFUSION Academy. All rights reserved.</div>
                  <div className="mt-1">
                    Powered by{' '}
                    <a
                      href="https://orincore.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-gold hover:text-primary-gold-light transition-colors"
                    >
                      ORINCORE Technologies
                    </a>
                  </div>
                </div>
                <div className="flex space-x-6 text-sm">
                  <Link 
                    href="/privacy" 
                    className="text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-primary-gold focus:text-primary-gold focus:outline-none transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                  <Link 
                    href="/terms" 
                    className="text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-primary-gold focus:text-primary-gold focus:outline-none transition-colors duration-200"
                  >
                    Terms of Service
                  </Link>
                  <Link 
                    href="/cookies" 
                    className="text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-primary-gold focus:text-primary-gold focus:outline-none transition-colors duration-200"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}
