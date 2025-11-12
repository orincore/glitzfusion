'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn } from '@/lib/utils'

const socialLinks = [
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'YouTube', href: '#', icon: Youtube },
]

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
                      GLITZ FUSION
                    </div>
                  </Link>
                  <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 mb-6 leading-relaxed">
                    Premier Media Academy offering world-class training in Acting, Dancing, 
                    Photography, Filmmaking, and Modeling. Transform your passion into 
                    professional excellence.
                  </p>
                  
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="w-4 h-4 text-primary-gold" />
                      <span>info@glitzfusion.com</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-primary-gold" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <MapPin className="w-4 h-4 text-primary-gold" />
                      <span>123 Creative Arts Blvd, Los Angeles, CA</span>
                    </div>
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
                          className={cn(
                            'p-2 rounded-lg transition-colors duration-200',
                            'hover:bg-primary-gold/10 focus:bg-primary-gold/10',
                            'focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 focus:ring-offset-transparent',
                            'touch-target'
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`Follow us on ${social.name}`}
                        >
                          <Icon className="w-5 h-5 text-primary-gold" />
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
                <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                  © 2024 Glitz Fusion Academy. All rights reserved.
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
