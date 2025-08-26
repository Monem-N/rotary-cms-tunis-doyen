"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EventsSectionProps {
  locale?: 'fr' | 'ar' | 'en'
}

export function EventsSection({ locale = 'fr' }: EventsSectionProps) {

  // Events content based on locale
  const getEventsContent = () => {
    switch (locale) {
      case 'ar':
        return {
          title: "الفعاليات",
          subtitle: "انضم إلى فعالياتنا القادمة",
          viewAll: "عرض الكل",
          events: [
            {
              title: "جمع التبرعات لمكافحة الجوع",
              date: "15 ديسمبر 2024",
              time: "14:00",
              location: "ساحة الشهداء",
              type: "مجتمعي",
              description: "فعالية سنوية لجمع التبرعات لمكافحة الجوع في تونس"
            },
            {
              title: "لقاء شباب روتاري",
              date: "22 ديسمبر 2024",
              time: "18:00",
              location: "فندق لايكو",
              type: "شباب",
              description: "لقاء مع شباب روتاري لمناقشة المشاريع المستقبلية"
            },
            {
              title: "المؤتمر السنوي",
              date: "5 يناير 2025",
              time: "09:00",
              location: "قصر المؤتمرات",
              type: "رسمي",
              description: "المؤتمر السنوي لنادي روتاري تونس دوايان"
            }
          ]
        }
      case 'en':
        return {
          title: "Events",
          subtitle: "Join our upcoming events",
          viewAll: "View All",
          events: [
            {
              title: "Fundraising for Hunger Relief",
              date: "December 15, 2024",
              time: "2:00 PM",
              location: "Martyrs Square",
              type: "Community",
              description: "Annual fundraising event to combat hunger in Tunisia"
            },
            {
              title: "Rotary Youth Meeting",
              date: "December 22, 2024",
              time: "6:00 PM",
              location: "Hotel Laico",
              type: "Youth",
              description: "Meeting with Rotary youth to discuss future projects"
            },
            {
              title: "Annual Conference",
              date: "January 5, 2025",
              time: "9:00 AM",
              location: "Conference Palace",
              type: "Official",
              description: "Annual conference of Rotary Club Tunis Doyen"
            }
          ]
        }
      default: // French
        return {
          title: "Événements",
          subtitle: "Rejoignez nos prochains événements",
          viewAll: "Voir tout",
          events: [
            {
              title: "Collecte de fonds contre la faim",
              date: "15 décembre 2024",
              time: "14h00",
              location: "Place des Martyrs",
              type: "Communautaire",
              description: "Événement annuel de collecte de fonds pour combattre la faim en Tunisie"
            },
            {
              title: "Rencontre jeunesse Rotary",
              date: "22 décembre 2024",
              time: "18h00",
              location: "Hôtel Laico",
              type: "Jeunesse",
              description: "Rencontre avec la jeunesse Rotary pour discuter des projets futurs"
            },
            {
              title: "Conférence annuelle",
              date: "5 janvier 2025",
              time: "09h00",
              location: "Palais des congrès",
              type: "Officiel",
              description: "Conférence annuelle du Rotary Club Tunis Doyen"
            }
          ]
        }
    }
  }

  const content = getEventsContent()

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'مجتمعي':
      case 'communautaire':
      case 'community':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'شباب':
      case 'jeunesse':
      case 'youth':
        return 'bg-accent/10 text-accent border-accent/20'
      case 'رسمي':
      case 'officiel':
      case 'official':
        return 'bg-secondary/10 text-secondary border-secondary/20'
      default:
        return 'bg-muted/10 text-muted border-muted/20'
    }
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">

          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-primary">
              {content.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {content.subtitle}
            </p>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {content.events.map((event, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-background">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getEventTypeColor(event.type)}`}
                    >
                      {event.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">📅</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary">🕐</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary">📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>

                  {/* Action Button */}
                  <Button className="w-full btn-primary">
                    {locale === 'ar' ? 'التفاصيل' : locale === 'en' ? 'Details' : 'Détails'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Events */}
          <div className="text-center">
            <Button size="lg" variant="outline" className="btn-secondary">
              {content.viewAll}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
