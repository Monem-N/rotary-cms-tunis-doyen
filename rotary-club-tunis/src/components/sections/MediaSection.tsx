import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MediaSectionProps {
  locale?: 'fr' | 'ar' | 'en'
}

export function MediaSection({ locale = 'fr' }: MediaSectionProps) {
  // Media content based on locale
  const getMediaContent = () => {
    switch (locale) {
      case 'ar':
        return {
          title: "مكتبة الوسائط",
          subtitle: "استكشف صور وفيديوهات فعالياتنا ومشاريعنا",
          viewAll: "عرض الكل",
          media: [
            {
              title: "مشروع مكافحة الجوع 2024",
              description: "صور من توزيع الوجبات اليومية للأسر المحتاجة",
              date: "10 ديسمبر 2024",
              type: "صورة",
              category: "مشاريع",
              readTime: "5 دقائق",
              image: "/images/media-1.jpg"
            },
            {
              title: "مؤتمر شباب روتاري 2024",
              description: "لحظات من المؤتمر السنوي لشباب روتاري تونس",
              date: "5 ديسمبر 2024",
              type: "فيديو",
              category: "شباب",
              readTime: "8 دقائق",
              image: "/images/media-2.jpg"
            },
            {
              title: "شراكتنا مع منظمة الصحة العالمية",
              description: "صور من فعاليات التوعية الصحية في المناطق الريفية",
              date: "28 نوفمبر 2024",
              type: "صورة",
              category: "شراكات",
              readTime: "6 دقائق",
              image: "/images/media-3.jpg"
            }
          ]
        }
      case 'en':
        return {
          title: "Media Library",
          subtitle: "Explore photos and videos from our events and projects",
          viewAll: "View All",
          media: [
            {
              title: "Hunger Relief Project 2024",
              description: "Photos from daily meal distribution to needy families",
              date: "December 10, 2024",
              type: "Photo",
              category: "Projects",
              readTime: "5 min read",
              image: "/images/media-1.jpg"
            },
            {
              title: "Rotary Youth Conference 2024",
              description: "Moments from the annual Rotary Youth Conference in Tunisia",
              date: "December 5, 2024",
              type: "Video",
              category: "Youth",
              readTime: "8 min read",
              image: "/images/media-2.jpg"
            },
            {
              title: "Our Partnership with WHO",
              description: "Photos from health awareness events in rural areas",
              date: "November 28, 2024",
              type: "Photo",
              category: "Partnerships",
              readTime: "6 min read",
              image: "/images/media-3.jpg"
            }
          ]
        }
      default: // French
        return {
          title: "Médiathèque",
          subtitle: "Découvrez les photos et vidéos de nos événements et projets",
          viewAll: "Voir tout",
          media: [
            {
              title: "Projet de lutte contre la faim 2024",
              description: "Photos de la distribution quotidienne de repas aux familles nécessiteuses",
              date: "10 décembre 2024",
              type: "Photo",
              category: "Projets",
              readTime: "5 min de lecture",
              image: "/images/media-1.jpg"
            },
            {
              title: "Conférence jeunesse Rotary 2024",
              description: "Moments de la conférence annuelle de la jeunesse Rotary en Tunisie",
              date: "5 décembre 2024",
              type: "Vidéo",
              category: "Jeunesse",
              readTime: "8 min de lecture",
              image: "/images/media-2.jpg"
            },
            {
              title: "Notre partenariat avec l'OMS",
              description: "Photos des événements de sensibilisation santé dans les zones rurales",
              date: "28 novembre 2024",
              type: "Photo",
              category: "Partenariats",
              readTime: "6 min de lecture",
              image: "/images/media-3.jpg"
            }
          ]
        }
    }
  }

  const content = getMediaContent()

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'مشاريع':
      case 'projets':
      case 'projects':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'شباب':
      case 'jeunesse':
      case 'youth':
        return 'bg-accent/10 text-accent border-accent/20'
      case 'شراكات':
      case 'partenariats':
      case 'partnerships':
        return 'bg-secondary/10 text-secondary border-secondary/20'
      default:
        return 'bg-muted/10 text-muted border-muted/20'
    }
  }

  const getMediaTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'صورة':
      case 'photo':
        return '🖼️'
      case 'فيديو':
      case 'vidéo':
      case 'video':
        return '🎥'
      default:
        return '📁'
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

          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {content.media.map((media, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Media Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-4xl">{getMediaTypeIcon(media.type)}</span>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(media.category)}`}
                    >
                      {media.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{media.readTime}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">
                    {media.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {media.description}
                  </p>

                  {/* Media Meta */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>📅 {media.date}</span>
                    <span>{getMediaTypeIcon(media.type)} {media.type}</span>
                  </div>

                  {/* View Button */}
                  <Button variant="outline" size="sm" className="w-full">
                    {locale === 'ar' ? 'عرض' : locale === 'en' ? 'View' : 'Voir'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Media */}
          <div className="text-center">
            <Button size="lg" className="btn-primary">
              {content.viewAll}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}