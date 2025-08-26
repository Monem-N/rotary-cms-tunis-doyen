"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ArticlesSectionProps {
  locale?: 'fr' | 'ar' | 'en'
}

export function ArticlesSection({ locale = 'fr' }: ArticlesSectionProps) {

  // Articles content based on locale
  const getArticlesContent = () => {
    switch (locale) {
      case 'ar':
        return {
          title: "المقالات",
          subtitle: "آخر الأخبار والمقالات من نادي روتاري تونس دوايان",
          viewAll: "عرض الكل",
          readMore: "اقرأ المزيد",
          articles: [
            {
              title: "مشروع مكافحة الجوع: تأثيرنا المحلي",
              excerpt: "اكتشف كيف ساهم مشروعنا الأخير في توزيع 500 وجبة يومية للأسر المحتاجة في تونس",
              date: "10 ديسمبر 2024",
              category: "مشاريع",
              readTime: "5 دقائق",
              image: "/images/article-1.jpg"
            },
            {
              title: "شراكتنا مع منظمة الصحة العالمية",
              excerpt: "تعاون مثمر مع منظمة الصحة العالمية لمكافحة الأمراض المعدية في شمال أفريقيا",
              date: "5 ديسمبر 2024",
              category: "شراكات",
              readTime: "8 دقائق",
              image: "/images/article-2.jpg"
            },
            {
              title: "برنامج الشباب: بناء قادة المستقبل",
              excerpt: "كيف يساهم برنامجنا للشباب في تنمية المهارات القيادية لدى الجيل الجديد",
              date: "28 نوفمبر 2024",
              category: "تعليم",
              readTime: "6 دقائق",
              image: "/images/article-3.jpg"
            }
          ]
        }
      case 'en':
        return {
          title: "Articles",
          subtitle: "Latest news and articles from Rotary Club Tunis Doyen",
          viewAll: "View All",
          readMore: "Read More",
          articles: [
            {
              title: "Hunger Relief Project: Our Local Impact",
              excerpt: "Discover how our recent project contributed to distributing 500 daily meals to needy families in Tunisia",
              date: "December 10, 2024",
              category: "Projects",
              readTime: "5 min read",
              image: "/images/article-1.jpg"
            },
            {
              title: "Our Partnership with the World Health Organization",
              excerpt: "Fruitful collaboration with the World Health Organization to combat infectious diseases in North Africa",
              date: "December 5, 2024",
              category: "Partnerships",
              readTime: "8 min read",
              image: "/images/article-2.jpg"
            },
            {
              title: "Youth Program: Building Future Leaders",
              excerpt: "How our youth program contributes to developing leadership skills in the new generation",
              date: "November 28, 2024",
              category: "Education",
              readTime: "6 min read",
              image: "/images/article-3.jpg"
            }
          ]
        }
      default: // French
        return {
          title: "Articles",
          subtitle: "Dernières nouvelles et articles du Rotary Club Tunis Doyen",
          viewAll: "Voir tout",
          readMore: "Lire plus",
          articles: [
            {
              title: "Projet de lutte contre la faim : Notre impact local",
              excerpt: "Découvrez comment notre récent projet a contribué à la distribution de 500 repas quotidiens aux familles nécessiteuses en Tunisie",
              date: "10 décembre 2024",
              category: "Projets",
              readTime: "5 min de lecture",
              image: "/images/article-1.jpg"
            },
            {
              title: "Notre partenariat avec l'Organisation mondiale de la Santé",
              excerpt: "Collaboration fructueuse avec l'Organisation mondiale de la Santé pour combattre les maladies infectieuses en Afrique du Nord",
              date: "5 décembre 2024",
              category: "Partenariats",
              readTime: "8 min de lecture",
              image: "/images/article-2.jpg"
            },
            {
              title: "Programme jeunesse : Former les leaders de demain",
              excerpt: "Comment notre programme jeunesse contribue au développement des compétences en leadership de la nouvelle génération",
              date: "28 novembre 2024",
              category: "Éducation",
              readTime: "6 min de lecture",
              image: "/images/article-3.jpg"
            }
          ]
        }
    }
  }

  const content = getArticlesContent()

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'مشاريع':
      case 'projets':
      case 'projects':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'شراكات':
      case 'partenariats':
      case 'partnerships':
        return 'bg-accent/10 text-accent border-accent/20'
      case 'تعليم':
      case 'éducation':
      case 'education':
        return 'bg-secondary/10 text-secondary border-secondary/20'
      default:
        return 'bg-muted/10 text-muted border-muted/20'
    }
  }

  return (
    <section className="py-20 bg-background">
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

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {content.articles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Article Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-4xl">📰</span>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(article.category)}`}
                    >
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{article.readTime}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Excerpt */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>📅 {article.date}</span>
                  </div>

                  {/* Read More Button */}
                  <Button variant="outline" size="sm" className="w-full">
                    {content.readMore}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Articles */}
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
