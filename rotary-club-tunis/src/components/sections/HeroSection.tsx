"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CLUB_STATISTICS } from '@/lib/constants'

interface HeroSectionProps {
  primaryCTA?: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  backgroundImage?: string
}

export function HeroSection({
  primaryCTA = {
    text: "Rejoignez-nous",
    href: "#join"
  },
  secondaryCTA = {
    text: "En savoir plus",
    href: "#about"
  },
  backgroundImage = "/images/rotary-hero-bg.jpg"
}: HeroSectionProps) {
  const t = useTranslations('hero')
  const tCommon = useTranslations('common')

  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  // Map statistics with translation keys
  const stats = CLUB_STATISTICS.map(stat => ({
    number: stat.number,
    label: t(`stats.${stat.key}Label`)
  }))

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/90" />

        {/* Loading placeholder */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/80">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="font-secondary">
                {tCommon('loading')}
              </p>
            </div>
          </div>
        )}

        {/* Error fallback */}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/80">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🏛️</div>
              <p className="font-secondary">
                Background image not available
              </p>
            </div>
          </div>
        ) : (
          <Image
            src={backgroundImage}
            alt="Rotary Club Tunis Doyen"
            fill
            className="object-cover"
            priority
            onLoadingComplete={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false)
              setImageError(true)
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight font-primary">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-accent font-semibold font-primary">
              {t('subtitle')}
            </p>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-secondary">
            {t('description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="btn-primary text-lg px-8 py-4 min-w-[200px]"
              asChild
            >
              <a href={primaryCTA.href}>
                {t('primaryCTA')}
              </a>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="btn-secondary text-lg px-8 py-4 min-w-[200px]"
              asChild
            >
              <a href={secondaryCTA.href}>
                {t('secondaryCTA')}
              </a>
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-white/80 font-secondary">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rotary International Logo/Branding */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-white/60 font-secondary">
              {t('rotaryNetwork')}
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
