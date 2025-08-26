"use client"

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Globe } from 'lucide-react'

interface NavigationProps {
  locale?: 'fr' | 'ar' | 'en'
}

export function Navigation({ locale = 'fr' }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLAnchorElement>(null)
  const lastFocusableRef = useRef<HTMLAnchorElement>(null)

  // Navigation items based on locale
  const getNavigationItems = () => {
    switch (locale) {
      case 'ar':
        return [
          { href: '#about', label: 'من نحن' },
          { href: '#events', label: 'الفعاليات' },
          { href: '#articles', label: 'المقالات' },
          { href: '#contact', label: 'اتصل بنا' },
          { href: '/admin', label: 'الإدارة', external: true }
        ]
      case 'en':
        return [
          { href: '#about', label: 'About' },
          { href: '#events', label: 'Events' },
          { href: '#articles', label: 'Articles' },
          { href: '#contact', label: 'Contact' },
          { href: '/admin', label: 'Admin', external: true }
        ]
      default: // French
        return [
          { href: '#about', label: 'À propos' },
          { href: '#events', label: 'Événements' },
          { href: '#articles', label: 'Articles' },
          { href: '#contact', label: 'Contact' },
          { href: '/admin', label: 'Administration', external: true }
        ]
    }
  }

  const navigationItems = getNavigationItems()

  // Focus trap for mobile menu
  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Focus first item when menu opens
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus()
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false)
          return
        }

        if (e.key === 'Tab') {
          const focusableElements = menuRef.current?.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )

          if (!focusableElements) return

          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              lastElement.focus()
              e.preventDefault()
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              firstElement.focus()
              e.preventDefault()
            }
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-primary text-lg">
              {locale === 'ar' ? 'دوايان' : 'Doyen'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.slice(0, -1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="hidden md:flex items-center space-x-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <div className="flex space-x-1">
                <Link
                  href="/fr"
                  className={`px-2 py-1 text-xs rounded ${locale === 'fr' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  FR
                </Link>
                <Link
                  href="/ar"
                  className={`px-2 py-1 text-xs rounded ${locale === 'ar' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  AR
                </Link>
                <Link
                  href="/en"
                  className={`px-2 py-1 text-xs rounded ${locale === 'en' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  EN
                </Link>
              </div>
            </div>

            {/* Admin Link */}
            <Button asChild variant="outline" size="sm" className="hidden md:flex">
              <Link href="/admin" target="_blank" rel="noopener noreferrer">
                {locale === 'ar' ? 'الإدارة' : locale === 'en' ? 'Admin' : 'Admin'}
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className="md:hidden bg-white border-t border-border shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            aria-describedby="mobile-menu-description"
          >
            <div className="container mx-auto px-6 py-4">
              <div className="flex flex-col space-y-4">
                {/* Screen reader announcement */}
                <div id="mobile-menu-title" className="sr-only">
                  {locale === 'ar' ? 'قائمة التنقل' : locale === 'en' ? 'Navigation Menu' : 'Menu de navigation'}
                </div>
                <div id="mobile-menu-description" className="sr-only">
                  {locale === 'ar' ? 'استخدم Tab للتنقل و Escape للإغلاق' : locale === 'en' ? 'Use Tab to navigate and Escape to close' : 'Utilisez Tab pour naviguer et Escape pour fermer'}
                </div>

                {/* Mobile Navigation */}
                {navigationItems.map((item, index) => (
                  <Link
                    key={item.href}
                    ref={index === 0 ? firstFocusableRef : index === navigationItems.length - 1 ? lastFocusableRef : null}
                    href={item.href}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    onClick={() => setIsOpen(false)}
                    {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Mobile Language Switcher */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    {locale === 'ar' ? 'اللغة' : locale === 'en' ? 'Language' : 'Langue'}
                  </p>
                  <div className="flex space-x-2">
                    <Link
                      href="/fr"
                      className={`px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${locale === 'fr' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Français
                    </Link>
                    <Link
                      href="/ar"
                      className={`px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${locale === 'ar' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      العربية
                    </Link>
                    <Link
                      href="/en"
                      className={`px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${locale === 'en' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      English
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
