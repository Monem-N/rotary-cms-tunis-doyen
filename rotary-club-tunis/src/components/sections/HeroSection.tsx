"use client"

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  primaryCTA?: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  backgroundImage?: string
  locale?: 'fr' | 'ar' | 'en'
}

export function HeroSection({
  title = "Rotary Club Tunis Doyen",
  subtitle = "Service Above Self - الخدمة فوق الذات",
  description = "Fondé en 1929, nous sommes le premier club Rotary de Tunisie. Ensemble, nous transformons des vies et renforçons nos communautés locales et internationales.",
  primaryCTA = {
    text: "Rejoignez-nous",
    href: "#join"
  },
  secondaryCTA = {
    text: "En savoir plus",
    href: "#about"
  },
  backgroundImage = "/images/rotary-hero-bg.jpg",
  locale = 'fr'
}: HeroSectionProps) {

  // Content based on locale
  const getLocalizedContent = () => {
    switch (locale) {
      case 'ar':
        return {
          title: "نادي الروتاري تونس دوايان",
          subtitle: "الخدمة فوق الذات - Service Above Self",
          description: "تأسس عام 1929، نحن أول نادي روتاري في تونس. معاً، نحن نغير الحياة ونعزز مجتمعاتنا المحلية والدولية.",
          primaryCTA: "انضم إلينا",
          secondaryCTA: "اعرف المزيد",
          stats: [
            { number: "95+", label: "سنة من الخدمة" },
            { number: "500+", label: "مشروع مجتمعي" },
            { number: "1000+", label: "متطوع" }
          ]
        }
      case 'en':
        return {
          title: "Rotary Club Tunis Doyen",
          subtitle: "Service Above Self",
          description: "Founded in 1929, we are Tunisia's first Rotary Club. Together, we transform lives and strengthen our local and international communities.",
          primaryCTA: "Join Us",
          secondaryCTA: "Learn More",
          stats: [
            { number: "95+", label: "Years of Service" },
            { number: "500+", label: "Community Projects" },
            { number: "1000+", label: "Volunteers" }
          ]
        }
      default: // French
        return {
          title: "Rotary Club Tunis Doyen",
          subtitle: "Service Above Self - الخدمة فوق الذات",
          description: "Fondé en 1929, nous sommes le premier club Rotary de Tunisie. Ensemble, nous transformons des vies et renforçons nos communautés locales et internationales.",
          primaryCTA: "Rejoignez-nous",
          secondaryCTA: "En savoir plus",
          stats: [
            { number: "95+", label: "Années de service" },
            { number: "500+", label: "Projets communautaires" },
            { number: "1000+", label: "Bénévoles" }
          ]
        }
    }
  }

  const content = getLocalizedContent()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/90" />
        <Image
          src={backgroundImage}
          alt="Rotary Club Tunis Doyen"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight ${locale === 'ar' ? 'font-arabic' : 'font-primary'}`}>
              {content.title}
            </h1>
            <p className={`text-xl md:text-2xl text-accent font-semibold ${locale === 'ar' ? 'font-arabic' : 'font-primary'}`}>
              {content.subtitle}
            </p>
          </div>

          {/* Description */}
          <p className={`text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed ${locale === 'ar' ? 'font-arabic' : 'font-secondary'}`}>
            {content.description}
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
            <Button
              size="lg"
              className="btn-primary text-lg px-8 py-4 min-w-[200px]"
              asChild
            >
              <a href={primaryCTA.href}>
                {content.primaryCTA}
              </a>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="btn-secondary text-lg px-8 py-4 min-w-[200px]"
              asChild
            >
              <a href={secondaryCTA.href}>
                {content.secondaryCTA}
              </a>
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {content.stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                    {stat.number}
                  </div>
                  <div className={`text-sm text-white/80 ${locale === 'ar' ? 'font-arabic' : 'font-secondary'}`}>
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rotary International Logo/Branding */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className={`text-sm text-white/60 ${locale === 'ar' ? 'font-arabic' : 'font-secondary'}`}>
              {locale === 'ar' ? 'جزء من شبكة روتاري الدولية' : locale === 'en' ? 'Part of the Rotary International Network' : 'Partie du réseau Rotary International'}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
