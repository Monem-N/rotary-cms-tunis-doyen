import React from 'react'
import { Open_Sans } from 'next/font/google'
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
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body
        className={`min-h-dvh bg-background text-foreground font-sans antialiased ${openSans.variable}`}
        suppressHydrationWarning={true}
      >
        <main className="min-h-dvh">{children}</main>
      </body>
    </html>
  )
}
