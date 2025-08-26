import React from 'react'
import { Open_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './styles.css'

// Load Rotary-approved fonts (free alternatives only)
// Primary font for headings and titles per Rotary International guidelines
const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
  fallback: ['Arial', 'system-ui', '-apple-system', 'sans-serif'],
})

export const metadata = {
  description: 'Rotary Club Tunis Doyen - Service Above Self',
  title: 'Rotary Club Tunis Doyen',
}

export default async function RootLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { children, params } = props
  const { locale } = await params

  // Get messages for the current locale
  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body
        className={`min-h-dvh bg-background text-foreground font-sans antialiased ${openSans.variable}`}
        suppressHydrationWarning={true}
      >
        <NextIntlClientProvider messages={messages}>
          <main className="min-h-dvh">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
