"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ContactSectionProps {
  locale?: 'fr' | 'ar' | 'en'
}

export function ContactSection({ locale = 'fr' }: ContactSectionProps) {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  // Contact content based on locale
  const getContactContent = () => {
    switch (locale) {
      case 'ar':
        return {
          title: "اتصل بنا",
          subtitle: "تواصل مع نادي روتاري تونس دوايان",
          formTitle: "أرسل رسالة",
          nameLabel: "الاسم الكامل",
          namePlaceholder: "أدخل اسمك الكامل",
          emailLabel: "البريد الإلكتروني",
          emailPlaceholder: "your.email@example.com",
          phoneLabel: "رقم الهاتف",
          phonePlaceholder: "+216 XX XXX XXX",
          subjectLabel: "الموضوع",
          subjectPlaceholder: "اختر موضوع الرسالة",
          messageLabel: "الرسالة",
          messagePlaceholder: "اكتب رسالتك هنا...",
          submitButton: "إرسال الرسالة",
          contactInfo: "معلومات الاتصال",
          address: "العنوان",
          meetingTime: "أوقات الاجتماعات",
          email: "البريد الإلكتروني",
          phone: "الهاتف",
          subjects: [
            { value: "membership", label: "طلب عضوية" },
            { value: "volunteer", label: "التطوع" },
            { value: "partnership", label: "الشراكة" },
            { value: "donation", label: "التبرعات" },
            { value: "general", label: "استفسار عام" }
          ]
        }
      case 'en':
        return {
          title: "Contact Us",
          subtitle: "Get in touch with Rotary Club Tunis Doyen",
          formTitle: "Send a Message",
          nameLabel: "Full Name",
          namePlaceholder: "Enter your full name",
          emailLabel: "Email Address",
          emailPlaceholder: "your.email@example.com",
          phoneLabel: "Phone Number",
          phonePlaceholder: "+216 XX XXX XXX",
          subjectLabel: "Subject",
          subjectPlaceholder: "Select message subject",
          messageLabel: "Message",
          messagePlaceholder: "Write your message here...",
          submitButton: "Send Message",
          contactInfo: "Contact Information",
          address: "Address",
          meetingTime: "Meeting Times",
          email: "Email",
          phone: "Phone",
          subjects: [
            { value: "membership", label: "Membership Inquiry" },
            { value: "volunteer", label: "Volunteer Opportunities" },
            { value: "partnership", label: "Partnership" },
            { value: "donation", label: "Donations" },
            { value: "general", label: "General Inquiry" }
          ]
        }
      default: // French
        return {
          title: "Contactez-nous",
          subtitle: "Entrez en contact avec Rotary Club Tunis Doyen",
          formTitle: "Envoyer un message",
          nameLabel: "Nom complet",
          namePlaceholder: "Entrez votre nom complet",
          emailLabel: "Adresse email",
          emailPlaceholder: "votre.email@example.com",
          phoneLabel: "Numéro de téléphone",
          phonePlaceholder: "+216 XX XXX XXX",
          subjectLabel: "Sujet",
          subjectPlaceholder: "Sélectionnez le sujet du message",
          messageLabel: "Message",
          messagePlaceholder: "Écrivez votre message ici...",
          submitButton: "Envoyer le message",
          contactInfo: "Informations de contact",
          address: "Adresse",
          meetingTime: "Heures de réunion",
          email: "Email",
          phone: "Téléphone",
          subjects: [
            { value: "membership", label: "Demande d'adhésion" },
            { value: "volunteer", label: "Bénévolat" },
            { value: "partnership", label: "Partenariat" },
            { value: "donation", label: "Dons" },
            { value: "general", label: "Demande générale" }
          ]
        }
    }
  }

  const content = getContactContent()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">

          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              {content.title}
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              {content.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact Form */}
            <Card className="bg-white text-foreground">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  {content.formTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{content.nameLabel}</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder={content.namePlaceholder}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{content.emailLabel}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={content.emailPlaceholder}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{content.phoneLabel}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={content.phonePlaceholder}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{content.subjectLabel}</Label>
                      <Select onValueChange={(value) => handleInputChange('subject', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={content.subjectPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {content.subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{content.messageLabel}</Label>
                    <textarea
                      id="message"
                      placeholder={content.messagePlaceholder}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full btn-primary">
                    {content.submitButton}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">{content.contactInfo}</h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📍</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{content.address}</h4>
                      <p className="text-primary-foreground/80">
                        Hôtel Laico Tunis<br />
                        Avenue Mohamed V<br />
                        Tunis, Tunisie
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🕐</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{content.meetingTime}</h4>
                      <p className="text-primary-foreground/80">
                        {locale === 'ar' ? 'كل يوم ثلاثاء - 19h30' :
                         locale === 'en' ? 'Every Tuesday - 7:30 PM' :
                         'Tous les mardis - 19h30'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{content.email}</h4>
                      <p className="text-primary-foreground/80">
                        contact@rotary-tunis-doyen.org
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📞</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{content.phone}</h4>
                      <p className="text-primary-foreground/80">
                        +216 XX XXX XXX
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white/10 rounded-lg p-6">
                <div className="aspect-video bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground/60">
                    {locale === 'ar' ? 'خريطة الموقع' :
                     locale === 'en' ? 'Location Map' :
                     'Carte du lieu'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
