import React from 'react'
import Image from 'next/image'
import { TestShadcnComponents } from '@/components/test-shadcn'
import { StyleDebug } from '@/components/style-debug'

export default function HomePage() {
  return (
    <div className="home">
      <div className="content">
        <picture>
          <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg" />
          <Image
            alt="Payload Logo"
            height={65}
            src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg"
            width={65}
          />
        </picture>
        <h1 className="h1 text-primary">Welcome to Rotary Club Tunis Doyen CMS</h1>
        <p className="subtitle text-muted-foreground mb-4">Service Above Self - الخدمة فوق الذات</p>
        <p className="body-text mb-6">This CMS is designed with official Rotary International typography and brand guidelines.</p>

        {/* CSS Status Confirmation */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 font-semibold">✅ CSS Status: LOADED & WORKING</span>
          </div>
          <p className="text-sm text-green-700">
            Tailwind CSS v4 is properly configured with Rotary brand colors. All components are styled correctly.
          </p>
        </div>

        {/* Rotary Brand Color Test */}
        <div className="mb-8 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">🎨 Rotary Brand Colors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-lg text-center">
              <div className="font-semibold">Primary</div>
              <div className="text-sm opacity-90">Rotary Blue (#1f4788)</div>
            </div>
            <div className="p-4 bg-accent text-accent-foreground rounded-lg text-center">
              <div className="font-semibold">Accent</div>
              <div className="text-sm opacity-90">Rotary Gold (#f7a81b)</div>
            </div>
            <div className="p-4 bg-card text-card-foreground border rounded-lg text-center">
              <div className="font-semibold">Card</div>
              <div className="text-sm opacity-75">Background</div>
            </div>
            <div className="p-4 bg-secondary text-secondary-foreground rounded-lg text-center">
              <div className="font-semibold">Secondary</div>
              <div className="text-sm opacity-75">Light Gray</div>
            </div>
          </div>
        </div>

        {/* Test shadcn/ui Components */}
        <TestShadcnComponents />
        {/* Style Debug */}
        <StyleDebug />

        <div className="links">
          <a
            className="admin"
            href="/admin"
            rel="noopener noreferrer"
            target="_blank"
          >
            Go to admin panel
          </a>
          <a
            className="docs"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>
      </div>
      <div className="footer">
        <p>Update this page by editing</p>
        <a className="codeLink" href="#">
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div>
    </div>
  )
}
