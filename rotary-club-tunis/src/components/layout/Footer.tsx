"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FooterProps {
  locale?: 'fr' | 'ar' | 'en'
}

export function Footer({ locale = 'fr' }: FooterProps) {

  // Footer content based on locale
  const getFooterContent = () => {
    switch (locale) {
      case 'ar':
        return {
          description: "نحن جزء من شبكة روتاري الدولية، ملتزمون بالخدمة الإنسانية والتطوع المجتمعي في تونس وخارجها.",
          quickLinks: "روابط سريعة",
          contact: "اتصل بنا",
          followUs: "تابعنا",
          copyright: "© 2024 Rotary Club Tunis Doyen. جميع الحقوق محفوظة.",
          links: [
            { href: '#about', label: 'من نحن' },
            { href: '#events', label: 'الفعاليات' },
            { href: '#articles', label: 'المقالات' },
            { href: '/admin', label: 'الإدارة' }
          ]
        }
      case 'en':
        return {
          description: "We are part of the Rotary International network, committed to humanitarian service and community volunteering in Tunisia and beyond.",
          quickLinks: "Quick Links",
          contact: "Contact Us",
          followUs: "Follow Us",
          copyright: "© 2024 Rotary Club Tunis Doyen. All rights reserved.",
          links: [
            { href: '#about', label: 'About Us' },
            { href: '#events', label: 'Events' },
            { href: '#articles', label: 'Articles' },
            { href: '/admin', label: 'Admin' }
          ]
        }
      default: // French
        return {
          description: "Nous faisons partie du réseau Rotary International, engagés dans le service humanitaire et le bénévolat communautaire en Tunisie et ailleurs.",
          quickLinks: "Liens rapides",
          contact: "Contactez-nous",
          followUs: "Suivez-nous",
          copyright: "© 2024 Rotary Club Tunis Doyen. Tous droits réservés.",
          links: [
            { href: '#about', label: 'À propos' },
            { href: '#events', label: 'Événements' },
            { href: '#articles', label: 'Articles' },
            { href: '/admin', label: 'Administration' }
          ]
        }
    }
  }

  const content = getFooterContent()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl">
                Rotary Tunis {locale === 'ar' ? 'دوايان' : 'Doyen'}
              </span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              {content.description}
            </p>
            <div className="flex space-x-4">
              {/* Social Media Links */}
              <Button variant="secondary" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{content.quickLinks}</h3>
            <ul className="space-y-2">
              {content.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-white transition-colors text-sm"
                    {...(link.href.startsWith('/admin') && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{content.contact}</h3>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <p>📍 Hôtel Laico Tunis</p>
              <p>📞 +216 XX XXX XXX</p>
              <p>📧 contact@rotary-tunis-doyen.org</p>
              <p>🕒 Réunions: Mardi 19h30</p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{content.followUs}</h3>
            <p className="text-primary-foreground/80 text-sm">
              {locale === 'ar' ? 'اشترك في نشرتنا الإخبارية للبقاء على اطلاع بأحدث الأخبار والفعاليات' :
               locale === 'en' ? 'Subscribe to our newsletter to stay updated with the latest news and events' :
               'Abonnez-vous à notre newsletter pour rester informé des dernières nouvelles et événements'}
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder={locale === 'ar' ? 'بريدك الإلكتروني' : locale === 'en' ? 'Your email address' : 'Votre adresse email'}
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button variant="secondary" size="sm" className="w-full">
                {locale === 'ar' ? 'اشتراك' : locale === 'en' ? 'Subscribe' : 'S\'abonner'}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-foreground/60 text-sm">
              {content.copyright}
            </p>
            <div className="flex items-center space-x-6 text-sm text-primary-foreground/60">
              <Link href="#" className="hover:text-white transition-colors">
                {locale === 'ar' ? 'سياسة الخصوصية' : locale === 'en' ? 'Privacy Policy' : 'Politique de confidentialité'}
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                {locale === 'ar' ? 'الشروط والأحكام' : locale === 'en' ? 'Terms of Service' : 'Conditions d\'utilisation'}
              </Link>
              <div className="flex items-center space-x-2">
                <span>🇹🇳</span>
                <span className="text-xs">
                  {locale === 'ar' ? 'تونس' : locale === 'en' ? 'Tunisia' : 'Tunisie'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
