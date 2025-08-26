"use client"

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CLUB_STATISTICS } from '@/lib/constants'

export function AboutSection() {
  const t = useTranslations('about')
  const tCommon = useTranslations('common')

  // Use centralized statistics for consistency
  const stats = CLUB_STATISTICS.map(stat => ({
    number: stat.number,
    label: t(`stats.${stat.key}Label`)
  }))

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">

          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-primary">
              {t('title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">

            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('description')}
                </p>
                <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground">
                  &ldquo;{t('missionText')}&rdquo;
                </blockquote>
              </div>

              {/* Values */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('values')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(t('valuesList') as unknown as string[]).map((value: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <Button size="lg" className="btn-primary">
                {t('ctaText') || tCommon('submit')}
              </Button>
            </div>

            {/* Right Content - Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-2">
                    <div className="text-3xl md:text-4xl font-bold text-primary">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <CardTitle className="text-lg">
                  {t('features.humanitarian.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('features.humanitarian.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <CardTitle className="text-lg">
                  {t('features.friendship.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('features.friendship.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <CardTitle className="text-lg">
                  {t('features.excellence.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('features.excellence.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
