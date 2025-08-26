import React from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { EventsSection } from '@/components/sections/EventsSection'
import { ArticlesSection } from '@/components/sections/ArticlesSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function HomePage() {
  return (
    <ErrorBoundary locale="fr">
      <div className="min-h-screen">
        <Navigation />

        <main>
          {/* Hero Section with Error Boundary */}
          <ErrorBoundary locale="fr">
            <HeroSection />
          </ErrorBoundary>

          {/* About Section with Error Boundary */}
          <section id="about">
            <ErrorBoundary locale="fr">
              <AboutSection />
            </ErrorBoundary>
          </section>

          {/* Events Section with Error Boundary */}
          <section id="events">
            <ErrorBoundary locale="fr">
              <EventsSection />
            </ErrorBoundary>
          </section>

          {/* Articles Section with Error Boundary */}
          <section id="articles">
            <ErrorBoundary locale="fr">
              <ArticlesSection />
            </ErrorBoundary>
          </section>

          {/* Contact Section with Error Boundary */}
          <section id="contact">
            <ErrorBoundary locale="fr">
              <ContactSection />
            </ErrorBoundary>
          </section>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  )
}
