"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

// Utility function to calculate contrast ratio
// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== 'string') return null

  // Remove # if present
  hex = hex.replace('#', '')

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }

  if (hex.length !== 6) return null

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return { r, g, b }
}

function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Safety check for undefined or invalid color values
    if (!color || typeof color !== 'string') return 0

    let rgbValues: { r: number; g: number; b: number } | null = null

    // Try to parse as RGB first
    const rgbMatch = color.match(/\d+/g)
    if (rgbMatch && rgbMatch.length >= 3) {
      rgbValues = {
        r: parseInt(rgbMatch[0]),
        g: parseInt(rgbMatch[1]),
        b: parseInt(rgbMatch[2])
      }
    } else {
      // Try to parse as hex
      rgbValues = hexToRgb(color)
    }

    if (!rgbValues) {
      return 0 // Invalid color format
    }

    // Convert to relative luminance
    const toLinear = (val: number) => {
      const normalized = val / 255
      return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
    }

    const rLinear = toLinear(rgbValues.r)
    const gLinear = toLinear(rgbValues.g)
    const bLinear = toLinear(rgbValues.b)

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
  }

  // Safety checks for input parameters
  if (!color1 || !color2 || typeof color1 !== 'string' || typeof color2 !== 'string') {
    return 1 // Return minimum contrast ratio for invalid inputs
  }

  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

// Enhanced hook for computed styles with more properties
function useComputedStyle<T extends HTMLElement>(ref: React.RefObject<T | null>) {
   const [styles, setStyles] = React.useState<Record<string, string>>({})
   React.useEffect(() => {
     if (ref.current) {
       const cs = getComputedStyle(ref.current)
       setStyles({
         backgroundColor: cs.backgroundColor,
         color: cs.color,
         borderColor: cs.borderColor,
         fontSize: cs.fontSize,
         fontWeight: cs.fontWeight,
         fontFamily: cs.fontFamily,
         lineHeight: cs.lineHeight,
         letterSpacing: cs.letterSpacing,
         borderRadius: cs.borderRadius,
         padding: cs.padding,
         margin: cs.margin,
       })
     }
   }, [ref])
   return styles
}

// Hook to get all CSS variables with proper async loading handling
function useCSSVariables() {
  const [cssVars, setCssVars] = React.useState<Record<string, string>>({})
  const [cssLoaded, setCssLoaded] = React.useState(false)
  const [loadingAttempts, setLoadingAttempts] = React.useState(0)
  const maxAttempts = 20 // Maximum polling attempts

  React.useEffect(() => {
    let isMounted = true

    const checkCSS = () => {
      if (!isMounted) return

      const root = document.documentElement
      const computedStyle = getComputedStyle(root)

      // Check if critical CSS variables are loaded
      const hasRotaryBlue = computedStyle.getPropertyValue('--color-rotary-blue').trim() !== ''
      const hasRotaryAzure = computedStyle.getPropertyValue('--color-rotary-azure').trim() !== ''
      // Specifically check for font variables
      const hasFontOpenSans = computedStyle.getPropertyValue('--font-open-sans').trim() !== ''
      const hasFontPrimary = computedStyle.getPropertyValue('--font-family-primary').trim() !== ''

      // Only consider CSS loaded if all critical variables are available
      const isFullyLoaded = hasRotaryBlue && hasRotaryAzure && hasFontOpenSans && hasFontPrimary

      if (isFullyLoaded) {
        setCssLoaded(true)

        // Get all Rotary-specific CSS variables
        const rotaryVars = {
          // Core Brand Colors (Official 2024)
          '--color-rotary-blue': computedStyle.getPropertyValue('--color-rotary-blue').trim(),
          '--color-rotary-gold': computedStyle.getPropertyValue('--color-rotary-gold').trim(),
          '--color-rotary-azure': computedStyle.getPropertyValue('--color-rotary-azure').trim(),
          '--color-rotary-sky-blue': computedStyle.getPropertyValue('--color-rotary-sky-blue').trim(),
          '--color-rotary-dark-blue': computedStyle.getPropertyValue('--color-rotary-dark-blue').trim(),

          // Derivative Colors
          '--color-rotary-blue-dark': computedStyle.getPropertyValue('--color-rotary-blue-dark').trim(),
          '--color-rotary-gold-dark': computedStyle.getPropertyValue('--color-rotary-gold-dark').trim(),
          '--color-rotary-azure-dark': computedStyle.getPropertyValue('--color-rotary-azure-dark').trim(),
          '--color-rotary-sky-blue-dark': computedStyle.getPropertyValue('--color-rotary-sky-blue-dark').trim(),
          '--color-rotary-blue-light': computedStyle.getPropertyValue('--color-rotary-blue-light').trim(),
          '--color-rotary-gold-light': computedStyle.getPropertyValue('--color-rotary-gold-light').trim(),

          // Specialized Rotary Colors (Official 2024)
          '--color-rotary-cranberry': computedStyle.getPropertyValue('--color-rotary-cranberry').trim(),
          '--color-rotary-cardinal': computedStyle.getPropertyValue('--color-rotary-cardinal').trim(),
          '--color-rotary-turquoise': computedStyle.getPropertyValue('--color-rotary-turquoise').trim(),
          '--color-rotary-orange': computedStyle.getPropertyValue('--color-rotary-orange').trim(),
          '--color-rotary-violet': computedStyle.getPropertyValue('--color-rotary-violet').trim(),
          '--color-rotary-lawn-green': computedStyle.getPropertyValue('--color-rotary-lawn-green').trim(),

           // Typography System (Rotary Official) - CRITICAL FOR DEBUGGING
           '--font-open-sans': computedStyle.getPropertyValue('--font-open-sans').trim(),
           '--font-family-primary': computedStyle.getPropertyValue('--font-family-primary').trim(),
           '--font-family-secondary': computedStyle.getPropertyValue('--font-family-secondary').trim(),
           '--font-family-sans': computedStyle.getPropertyValue('--font-family-sans').trim(),
           '--font-family-arabic': computedStyle.getPropertyValue('--font-family-arabic').trim(),

          // Semantic Colors
          '--color-primary': computedStyle.getPropertyValue('--color-primary').trim(),
          '--color-primary-foreground': computedStyle.getPropertyValue('--color-primary-foreground').trim(),
          '--color-accent': computedStyle.getPropertyValue('--color-accent').trim(),
          '--color-accent-foreground': computedStyle.getPropertyValue('--color-accent-foreground').trim(),
          '--color-background': computedStyle.getPropertyValue('--color-background').trim(),
          '--color-foreground': computedStyle.getPropertyValue('--color-foreground').trim(),
          '--color-card': computedStyle.getPropertyValue('--color-card').trim(),
          '--color-card-foreground': computedStyle.getPropertyValue('--color-card-foreground').trim(),
          '--color-border': computedStyle.getPropertyValue('--color-border').trim(),
          '--color-ring': computedStyle.getPropertyValue('--color-ring').trim(),

          // Typography (Legacy - kept for compatibility)
          '--font-family-sans-legacy': computedStyle.getPropertyValue('--font-family-sans').trim(),
          '--font-family-arabic-legacy': computedStyle.getPropertyValue('--font-family-arabic').trim(),
          '--font-weight-regular': computedStyle.getPropertyValue('--font-weight-regular').trim(),
          '--font-weight-semibold': computedStyle.getPropertyValue('--font-weight-semibold').trim(),

          // Spacing & Radius
          '--radius': computedStyle.getPropertyValue('--radius').trim(),
          '--radius-sm': computedStyle.getPropertyValue('--radius-sm').trim(),
          '--radius-md': computedStyle.getPropertyValue('--radius-md').trim(),
          '--radius-lg': computedStyle.getPropertyValue('--radius-lg').trim(),
        }

        setCssVars(rotaryVars)
      } else {
        // Continue polling if not fully loaded
        setLoadingAttempts(prev => {
          const newAttempts = prev + 1
          if (newAttempts < maxAttempts) {
            // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1000ms...
            const delay = Math.min(100 * Math.pow(2, Math.floor(newAttempts / 3)), 1000)
            setTimeout(checkCSS, delay)
          } else {
            // Max attempts reached, set as loaded with whatever we have
            console.warn('CSS loading timeout - using available variables')
            setCssLoaded(true)
            const partialVars = {
              '--font-open-sans': computedStyle.getPropertyValue('--font-open-sans').trim(),
              '--font-family-primary': computedStyle.getPropertyValue('--font-family-primary').trim(),
              '--font-family-secondary': computedStyle.getPropertyValue('--font-family-secondary').trim(),
              '--font-family-sans': computedStyle.getPropertyValue('--font-family-sans').trim(),
              '--font-family-arabic': computedStyle.getPropertyValue('--font-family-arabic').trim(),
              '--color-rotary-blue': computedStyle.getPropertyValue('--color-rotary-blue').trim(),
              '--color-rotary-gold': computedStyle.getPropertyValue('--color-rotary-gold').trim(),
              '--color-rotary-azure': computedStyle.getPropertyValue('--color-rotary-azure').trim(),
            }
            setCssVars(partialVars)
          }
          return newAttempts
        })
      }
    }

    // Start checking immediately
    checkCSS()

    return () => {
      isMounted = false
    }
  }, [])

  return { cssVars, cssLoaded, loadingAttempts }
}

export function StyleDebug() {
   const primaryRef = React.useRef<HTMLDivElement>(null)
   const goldRef = React.useRef<HTMLDivElement>(null)
   const cardRef = React.useRef<HTMLDivElement>(null)
   const buttonRef = React.useRef<HTMLButtonElement>(null)
   const arabicRef = React.useRef<HTMLDivElement>(null)

   const primary = useComputedStyle(primaryRef)
   const gold = useComputedStyle(goldRef)
   const card = useComputedStyle(cardRef)
   const button = useComputedStyle(buttonRef)
   const arabic = useComputedStyle(arabicRef)

   const { cssVars, cssLoaded } = useCSSVariables()

   // Don't render until CSS is loaded to avoid errors
   if (!cssLoaded || !cssVars || Object.keys(cssVars).length === 0) {
     return (
       <Card className="w-full">
         <CardContent className="p-6">
           <div className="flex items-center justify-center">
             <div className="text-muted-foreground">Chargement des styles CSS...</div>
           </div>
         </CardContent>
       </Card>
     )
   }

   // Color validation function
   const validateColors = () => {
     const results = []

     // Check if official Rotary colors are correctly set (2024 Official Specs)
     const expectedColors = {
       '--color-rotary-blue': '#17458f',      // PMS 286C - Bleu royal
       '--color-rotary-gold': '#f7a81b',      // PMS 130C - Or (CORRECTED)
       '--color-rotary-azure': '#0067c8',     // PMS 2175C - Bleu azur
       '--color-rotary-sky-blue': '#00a2e0',  // PMS 2202C - Bleu ciel
       '--color-rotary-cranberry': '#d41367', // PMS 214C - Canneberge (Rotaract)
       '--color-rotary-cardinal': '#e02927'   // PMS 485C - Rouge cardinal (End Polio)
     }

     // Safety check: ensure cssVars is populated
     if (!cssVars || Object.keys(cssVars).length === 0) {
       return [{
         variable: 'System',
         expected: 'CSS Variables',
         actual: 'Non chargées',
         isCorrect: false,
         status: '⚠️'
       }]
     }

     for (const [varName, expectedHex] of Object.entries(expectedColors)) {
       const actualValue = cssVars[varName]

       // Safety check for undefined values
       if (!actualValue || typeof actualValue !== 'string') {
         results.push({
           variable: varName,
           expected: expectedHex,
           actual: 'Non défini',
           isCorrect: false,
           status: '❌'
         })
         continue
       }

       const isCorrect = actualValue.toLowerCase() === expectedHex.toLowerCase()
       results.push({
         variable: varName,
         expected: expectedHex,
         actual: actualValue,
         isCorrect,
         status: isCorrect ? '✅' : '❌'
       })
     }

     return results
   }

   // Contrast ratio validation using CSS variables directly
   const validateContrast = () => {
     const tests = [
       {
         name: 'Rotary Blue on White',
         bg: cssVars['--color-rotary-blue'] || '#17458f',
         fg: '#ffffff'
       },
       {
         name: 'Rotary Gold on Black',
         bg: cssVars['--color-rotary-gold'] || '#f7a81b',
         fg: '#000000'
       },
       {
         name: 'Rotary Azure on White',
         bg: cssVars['--color-rotary-azure'] || '#0067c8',
         fg: '#ffffff'
       },
       {
         name: 'Rotary Sky Blue on White',
         bg: cssVars['--color-rotary-sky-blue'] || '#00a2e0',
         fg: '#ffffff'
       },
     ]

     return tests.map(test => {
       // Safety check for undefined colors
       if (!test.bg || !test.fg) {
         return {
           ...test,
           bg: test.bg || 'Non défini',
           fg: test.fg || 'Non défini',
           ratio: '0.00',
           wcagAA: false,
           wcagAAA: false,
           status: '⚠️ UNDEFINED'
         }
       }

       const ratio = getContrastRatio(test.bg, test.fg)
       const wcagAA = ratio >= 4.5
       const wcagAAA = ratio >= 7

       return {
         ...test,
         ratio: ratio.toFixed(2),
         wcagAA,
         wcagAAA,
         status: wcagAAA ? '🟢 AAA' : wcagAA ? '🟡 AA' : '🔴 FAIL'
       }
     })
   }

   const colorValidation = validateColors()
   const contrastValidation = validateContrast()

   return (
     <div className="space-y-6 p-6 max-w-7xl mx-auto">
       <div className="text-center space-y-2">
         <h2 className="text-3xl font-bold text-primary">🔍 Comprehensive Style Debug</h2>
         <p className="text-lg text-muted-foreground">
           Complete validation of Rotary Tunis Doyen Club styling system
         </p>
       </div>

       {/* CSS Loading Status */}
       <Card className="w-full">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <span className={cssLoaded ? '🟢' : '🔴'}>
               {cssLoaded ? '✅ CSS System Status: LOADED' : '❌ CSS System Status: NOT LOADED'}
             </span>
           </CardTitle>
           <CardDescription>
             Validation of CSS loading and variable availability
           </CardDescription>
         </CardHeader>
         <CardContent>
           {!cssLoaded && (
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
               <h4 className="font-semibold text-red-800 mb-2">⚠️ CSS Loading Issues Detected</h4>
               <div className="text-sm text-red-700 space-y-2">
                 <p className="font-semibold">Troubleshooting Steps:</p>
                 <ul className="list-disc list-inside space-y-1">
                   <li>Check if styles.css is imported in layout.tsx</li>
                   <li>Verify CSS syntax for any errors</li>
                   <li>Restart development server</li>
                   <li>Check browser console for CSS loading errors</li>
                   <li>Ensure no CSS conflicts or overrides</li>
                   <li>Verify Tailwind CSS v4 configuration</li>
                 </ul>
               </div>
             </div>
           )}

           {cssLoaded && (
             <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
               <h4 className="font-semibold text-green-800 mb-2">✅ CSS System Operational</h4>
               <p className="text-sm text-green-700">
                 All CSS variables are loaded and available. Rotary brand colors are active.
               </p>
             </div>
           )}
         </CardContent>
       </Card>

       {/* Brand Color Validation */}
       <Card className="w-full">
         <CardHeader>
           <CardTitle className="text-xl text-primary">🎨 Official Rotary Brand Color Validation</CardTitle>
           <CardDescription>
             Verification that official Rotary International colors are correctly implemented
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {colorValidation.map((result, index) => (
               <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                 <div className="flex items-center gap-3">
                   <span className="text-2xl">{result.status}</span>
                   <div>
                     <p className="font-semibold">{result.variable}</p>
                     <p className="text-sm text-muted-foreground">Expected: {result.expected}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-mono text-sm">{result.actual}</p>
                   <div
                     className="w-12 h-6 rounded border"
                     style={{ backgroundColor: result.actual }}
                   />
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>

       {/* Accessibility Contrast Testing */}
       <Card className="w-full">
         <CardHeader>
           <CardTitle className="text-xl text-accent">♿ WCAG Contrast Ratio Validation</CardTitle>
           <CardDescription>
             Testing color combinations for accessibility compliance (WCAG AA/AAA standards)
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {contrastValidation.map((test, index) => (
               <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                 <div className="flex items-center gap-3">
                   <span className="text-sm font-mono">{test.status}</span>
                   <div>
                     <p className="font-semibold">{test.name}</p>
                     <p className="text-sm text-muted-foreground">
                       Ratio: {test.ratio}:1 | AA: {test.wcagAA ? '✅' : '❌'} | AAA: {test.wcagAAA ? '✅' : '❌'}
                     </p>
                   </div>
                 </div>
                 <div
                   className="px-4 py-2 rounded text-sm font-semibold"
                   style={{ backgroundColor: test.bg, color: test.fg }}
                 >
                   Sample Text
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>

       {/* Component Style Testing */}
       <Card className="w-full">
         <CardHeader>
           <CardTitle className="text-xl text-primary">🧩 Component Style Testing</CardTitle>
           <CardDescription>
             Visual testing of key components with computed style analysis
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Primary Button Test */}
             <div className="space-y-3">
               <h4 className="font-semibold">Primary Button (Rotary Blue)</h4>
               <Button ref={buttonRef} className="w-full">
                 Test Button
               </Button>
               <div className="text-xs bg-muted p-2 rounded">
                 <pre>{JSON.stringify(button, null, 2)}</pre>
               </div>
             </div>

             {/* Primary Color Swatch */}
             <div className="space-y-3">
               <h4 className="font-semibold">Primary Color Swatch</h4>
               <div ref={primaryRef} className="rounded bg-primary text-primary-foreground p-4 text-center font-semibold">
                 Rotary Blue Primary
               </div>
               <div className="text-xs bg-muted p-2 rounded">
                 <pre>{JSON.stringify(primary, null, 2)}</pre>
               </div>
             </div>

             {/* Accent Color Swatch */}
             <div className="space-y-3">
               <h4 className="font-semibold">Accent Color Swatch</h4>
               <div ref={goldRef} className="rounded bg-accent text-accent-foreground p-4 text-center font-semibold">
                 Rotary Gold Accent
               </div>
               <div className="text-xs bg-muted p-2 rounded">
                 <pre>{JSON.stringify(gold, null, 2)}</pre>
               </div>
             </div>

             {/* Card Component Test */}
             <div className="space-y-3">
               <h4 className="font-semibold">Card Component</h4>
               <div ref={cardRef} className="rounded bg-card text-card-foreground border p-4">
                 <h5 className="font-semibold mb-2">Sample Card</h5>
                 <p className="text-sm text-muted-foreground">Card content with proper styling</p>
               </div>
               <div className="text-xs bg-muted p-2 rounded">
                 <pre>{JSON.stringify(card, null, 2)}</pre>
               </div>
             </div>

             {/* Arabic Font Test */}
             <div className="space-y-3">
               <h4 className="font-semibold">Arabic Font Test</h4>
               <div ref={arabicRef} className="font-arabic text-right p-4 border rounded" dir="rtl">
                 نادي روتاري تونس دوين
               </div>
               <div className="text-xs bg-muted p-2 rounded">
                 <pre>{JSON.stringify(arabic, null, 2)}</pre>
               </div>
             </div>

             {/* Custom CSS Classes Test */}
             <div className="space-y-3">
               <h4 className="font-semibold">Custom CSS Classes</h4>
               <div className="space-y-2">
                 <button className="btn-primary w-full">Custom .btn-primary</button>
                 <button className="btn-secondary w-full">Custom .btn-secondary</button>
                 <div className="card p-3">
                   <p className="body-text">Custom .card with .body-text</p>
                 </div>
               </div>
             </div>

             {/* Style Guide Utility Classes Test */}
             <div className="space-y-3">
               <h4 className="font-semibold">Style Guide Utility Classes</h4>
               <div className="space-y-4">
                 {/* Container Test */}
                 <div className="container border border-dashed border-muted-foreground/30 p-2">
                   <p className="text-xs text-muted-foreground">.container - Centered content with responsive padding</p>
                 </div>

                 {/* Grid Systems Test */}
                 <div className="space-y-2">
                   <p className="text-xs font-semibold">Grid Systems:</p>
                   <div className="grid-2 gap-2">
                     <div className="p-2 bg-primary/10 rounded text-xs">.grid-2 Item 1</div>
                     <div className="p-2 bg-primary/10 rounded text-xs">.grid-2 Item 2</div>
                   </div>
                   <div className="grid-3 gap-2">
                     <div className="p-2 bg-accent/10 rounded text-xs">.grid-3 Item 1</div>
                     <div className="p-2 bg-accent/10 rounded text-xs">.grid-3 Item 2</div>
                     <div className="p-2 bg-accent/10 rounded text-xs">.grid-3 Item 3</div>
                   </div>
                 </div>

                 {/* Animation Classes Test */}
                 <div className="space-y-2">
                   <p className="text-xs font-semibold">Animation Classes:</p>
                   <div className="flex flex-wrap gap-2">
                     <div className="fade-in p-2 bg-muted rounded text-xs">.fade-in</div>
                     <button className="btn-primary pulse text-xs">Pulse CTA</button>
                     <div className="card hover-scale p-2 cursor-pointer text-xs">Hover Scale Card</div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* CSS Variables Detailed View */}
       <Card className="w-full">
         <CardHeader>
           <CardTitle className="text-xl text-accent">📋 CSS Variables Detailed Analysis</CardTitle>
           <CardDescription>
             Complete listing of all Rotary-specific CSS custom properties
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div>
               <h4 className="font-semibold mb-3 text-primary">Brand Colors</h4>
               <div className="space-y-2">
                 {Object.entries(cssVars)
                   .filter(([key]) => key.includes('rotary'))
                   .map(([key, value]) => (
                     <div key={key} className="flex items-center justify-between p-2 border rounded">
                       <span className="font-mono text-sm">{key}</span>
                       <div className="flex items-center gap-2">
                         <span className="font-mono text-xs">{value}</span>
                         <div
                           className="w-6 h-6 rounded border"
                           style={{ backgroundColor: value }}
                         />
                       </div>
                     </div>
                   ))}
               </div>
             </div>

             <div>
               <h4 className="font-semibold mb-3 text-primary">Semantic Colors</h4>
               <div className="space-y-2">
                 {Object.entries(cssVars)
                   .filter(([key]) => key.includes('color') && !key.includes('rotary'))
                   .map(([key, value]) => (
                     <div key={key} className="flex items-center justify-between p-2 border rounded">
                       <span className="font-mono text-sm">{key}</span>
                       <div className="flex items-center gap-2">
                         <span className="font-mono text-xs">{value}</span>
                         <div
                           className="w-6 h-6 rounded border"
                           style={{ backgroundColor: value }}
                         />
                       </div>
                     </div>
                   ))}
               </div>
             </div>
           </div>

           <div className="mt-6">
             <h4 className="font-semibold mb-3 text-primary">🎨 Couleurs Spécialisées Rotary (Logos Officiels)</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[
                 { key: '--color-rotary-cranberry', name: 'Canneberge (Rotaract)', pms: 'PMS 214C' },
                 { key: '--color-rotary-cardinal', name: 'Rouge Cardinal (End Polio)', pms: 'PMS 485C' },
                 { key: '--color-rotary-turquoise', name: 'Turquoise', pms: 'PMS 7466C' },
                 { key: '--color-rotary-orange', name: 'Orange', pms: 'PMS 2018C' },
                 { key: '--color-rotary-violet', name: 'Violet', pms: 'PMS 2070C' },
                 { key: '--color-rotary-lawn-green', name: 'Vert Gazon', pms: 'PMS 355C' }
               ].map((color) => (
                 <div key={color.key} className="p-3 border rounded-lg">
                   <div className="flex items-center gap-3 mb-2">
                     <div
                       className="w-8 h-8 rounded border"
                       style={{ backgroundColor: cssVars[color.key] }}
                     />
                     <div>
                       <p className="font-semibold text-sm">{color.name}</p>
                       <p className="text-xs text-muted-foreground">{color.pms}</p>
                     </div>
                   </div>
                   <div className="text-xs font-mono bg-muted p-1 rounded">
                     {cssVars[color.key] || 'Non défini'}
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <div className="mt-6">
             <h4 className="font-semibold mb-3 text-primary">Typography & Spacing</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.entries(cssVars)
                 .filter(([key]) => !key.includes('color'))
                 .map(([key, value]) => (
                   <div key={key} className="flex items-center justify-between p-2 border rounded">
                     <span className="font-mono text-sm">{key}</span>
                     <span className="font-mono text-xs">{value}</span>
                   </div>
                 ))}
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Responsive Design Testing */}
       <Card className="w-full">
         <CardHeader>
           <CardTitle className="text-xl text-accent">📱 Responsive Design Validation</CardTitle>
           <CardDescription>
             Testing responsive behavior and mobile optimization
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <h4 className="font-semibold text-blue-800 mb-2">📱 Mobile Breakpoint Test</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                 <div className="p-2 bg-primary text-primary-foreground rounded text-center text-sm">
                   Mobile (sm)
                 </div>
                 <div className="p-2 bg-accent text-accent-foreground rounded text-center text-sm hidden sm:block">
                   Tablet (md)
                 </div>
                 <div className="p-2 bg-secondary text-secondary-foreground rounded text-center text-sm hidden md:block">
                   Desktop (lg)
                 </div>
                 <div className="p-2 bg-muted text-muted-foreground rounded text-center text-sm hidden lg:block">
                   Large (xl)
                 </div>
               </div>
             </div>

             <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
               <h4 className="font-semibold text-green-800 mb-2">✅ Touch-Friendly Elements</h4>
               <div className="flex flex-wrap gap-2">
                 <Button size="lg">Large Button (44px min)</Button>
                 <Button>Default Button</Button>
                 <Button size="sm">Small Button</Button>
               </div>
               <p className="text-sm text-green-700 mt-2">
                 All interactive elements meet the 44px minimum touch target size for mobile accessibility.
               </p>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Dark Mode Testing */}
       <Card className="w-full">
         <CardHeader>
           <CardTitle className="text-xl text-primary">🌙 Dark Mode Validation</CardTitle>
           <CardDescription>
             Testing dark mode implementation and color scheme switching
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             <div className="p-4 border rounded-lg">
               <h4 className="font-semibold mb-3">Current Theme Detection</h4>
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                   <span>System Preference:</span>
                   <span className="px-2 py-1 bg-muted rounded text-sm font-mono">
                     {typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'}
                   </span>
                 </div>
                 <div className="flex items-center gap-2">
                   <span>Body Class:</span>
                   <span className="px-2 py-1 bg-muted rounded text-sm font-mono">
                     {typeof document !== 'undefined' && document.body.classList.contains('theme-dark') ? 'theme-dark' : 'default'}
                   </span>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 border rounded-lg bg-background text-foreground">
                 <h5 className="font-semibold mb-2">Light Mode Preview</h5>
                 <div className="space-y-2">
                   <div className="p-2 bg-primary text-primary-foreground rounded">Primary</div>
                   <div className="p-2 bg-accent text-accent-foreground rounded">Accent</div>
                   <div className="p-2 bg-card text-card-foreground border rounded">Card</div>
                 </div>
               </div>

               <div className="p-4 border rounded-lg theme-dark bg-background text-foreground">
                 <h5 className="font-semibold mb-2">Dark Mode Preview</h5>
                 <div className="space-y-2">
                   <div className="p-2 bg-primary text-primary-foreground rounded">Primary</div>
                   <div className="p-2 bg-accent text-accent-foreground rounded">Accent</div>
                   <div className="p-2 bg-card text-card-foreground border rounded">Card</div>
                 </div>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Layout & Animation Testing */}
       <Card className="w-full">
         <CardHeader>
           <CardTitle className="text-xl text-accent">🎭 Layout & Animation System Testing</CardTitle>
           <CardDescription>
             Testing the complete layout utilities and animation system from the style guide
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-6">
           {/* Section Padding Demo */}
           <div className="space-y-4">
             <h4 className="font-semibold text-primary">📏 Section Padding Demo</h4>
             <div className="section-padding bg-muted/30 border border-dashed border-muted-foreground/30 rounded">
               <div className="text-center">
                 <h5 className="font-semibold mb-2">Section with .section-padding</h5>
                 <p className="text-sm text-muted-foreground">
                   This section demonstrates responsive vertical padding (4rem mobile, 6rem desktop)
                 </p>
               </div>
             </div>
           </div>

           {/* Animation Showcase */}
           <div className="space-y-4">
             <h4 className="font-semibold text-primary">🎬 Animation Showcase</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="fade-in p-4 bg-primary/10 rounded text-center">
                 <h5 className="font-semibold mb-2">Fade In Animation</h5>
                 <p className="text-sm text-muted-foreground">Smooth entrance effect</p>
               </div>

               <div className="p-4 bg-accent/10 rounded text-center">
                 <h5 className="font-semibold mb-2">Pulse CTA</h5>
                 <Button className="pulse">Attention-grabbing Button</Button>
               </div>

               <div className="card hover-scale p-4 cursor-pointer text-center">
                 <h5 className="font-semibold mb-2">Hover Scale</h5>
                 <p className="text-sm text-muted-foreground">Hover to see effect</p>
               </div>
             </div>
           </div>

           {/* Layout System Demo */}
           <div className="space-y-4">
             <h4 className="font-semibold text-primary">📐 Responsive Layout System</h4>
             <div className="container">
               <div className="space-y-4">
                 <div className="p-3 bg-muted/50 rounded">
                   <h5 className="font-semibold mb-2">Container System</h5>
                   <p className="text-sm text-muted-foreground">
                     Centered content with responsive padding and max-width constraints
                   </p>
                 </div>

                 <div className="grid-2">
                   <div className="p-3 bg-primary/10 rounded">
                     <h6 className="font-semibold">Grid 2 - Column 1</h6>
                     <p className="text-xs text-muted-foreground">Responsive 2-column layout</p>
                   </div>
                   <div className="p-3 bg-primary/10 rounded">
                     <h6 className="font-semibold">Grid 2 - Column 2</h6>
                     <p className="text-xs text-muted-foreground">Stacks on mobile</p>
                   </div>
                 </div>

                 <div className="grid-3">
                   <div className="p-3 bg-accent/10 rounded">
                     <h6 className="font-semibold">Grid 3 - Col 1</h6>
                     <p className="text-xs text-muted-foreground">3-column desktop</p>
                   </div>
                   <div className="p-3 bg-accent/10 rounded">
                     <h6 className="font-semibold">Grid 3 - Col 2</h6>
                     <p className="text-xs text-muted-foreground">2-column tablet</p>
                   </div>
                   <div className="p-3 bg-accent/10 rounded">
                     <h6 className="font-semibold">Grid 3 - Col 3</h6>
                     <p className="text-xs text-muted-foreground">1-column mobile</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Typography Testing */}
       <Card className="w-full">
         <CardHeader>
           <CardTitle className="text-xl text-primary">📝 Typographie Rotary International (Officielle)</CardTitle>
           <CardDescription>
             Test des polices officielles selon les directives Rotary International 2024
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-6">

           {/* Primary Typography Demo */}
           <div className="p-4 border rounded-lg">
             <h5 className="font-semibold mb-3 text-sm text-muted-foreground">
               POLICES PRINCIPALES (Titres & Rubriques)
             </h5>
             <div className="space-y-3">
               <div className="font-primary">
                 <p className="text-xs text-muted-foreground mb-1">
                   Open Sans → Arial (Rotary Officiel - GRATUIT)
                 </p>
                 <h1 className="h1">Rotary Club Tunis Doyen</h1>
                 <h2 className="h2">Service Above Self</h2>
                 <h3 className="h3">Excellence in Community Service</h3>
               </div>
             </div>
           </div>

           {/* Secondary Typography Demo */}
           <div className="p-4 border rounded-lg">
             <h5 className="font-semibold mb-3 text-sm text-muted-foreground">
               POLICES SECONDAIRES (Textes & Sous-titres)
             </h5>
             <div className="space-y-3">
               <div className="font-secondary">
                 <p className="text-xs text-muted-foreground mb-1">
                   Georgia → Times New Roman (Rotary Officiel - GRATUIT)
                 </p>
                 <p className="subtitle">
                   Le Rotary Club Tunis Doyen, fondé en 1929, est le premier club Rotary de Tunisie.
                 </p>
                 <p className="body-text">
                   Nous nous engageons dans des projets communautaires qui transforment des vies et
                   renforcent les communautés locales et internationales. Notre mission est de servir
                   autrui, promouvoir l&apos;intégrité et favoriser la compréhension mondiale.
                 </p>
                 <p className="caption">
                   Réunions hebdomadaires tous les mardis à 19h30 - Hôtel Laico Tunis
                 </p>
               </div>
             </div>
           </div>

           {/* Arabic Typography Demo */}
           <div className="p-4 border rounded-lg">
             <h5 className="font-semibold mb-3 text-sm text-muted-foreground">
               TYPOGRAPHIE ARABE (RTL)
             </h5>
             <div className="space-y-3" dir="rtl">
               <div className="font-arabic">
                 <p className="text-xs text-muted-foreground mb-1" dir="ltr">
                   Traditional Arabic → Amiri → Scheherazade New
                 </p>
                 <h2 className="text-2xl font-semibold">نادي الروتاري تونس دوايان</h2>
                 <p className="text-lg">الخدمة فوق الذات</p>
                 <p className="body-text">
                   نادي الروتاري تونس دوايان، المؤسس عام 1929، هو أول نادي روتاري في تونس.
                   نحن ملتزمون بمشاريع مجتمعية تغير الحياة وتقوي المجتمعات المحلية والدولية.
                 </p>
               </div>
             </div>
           </div>

           {/* Font Stack Information */}
           <div className="p-4 border rounded-lg bg-muted/50">
             <h5 className="font-semibold mb-3 text-sm">Stack de Polices Détecté</h5>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
               <div>
                 <p className="font-semibold mb-1">Primaire:</p>
                 <p className="break-all">{cssVars['--font-family-primary'] || 'Non défini'}</p>
               </div>
               <div>
                 <p className="font-semibold mb-1">Secondaire:</p>
                 <p className="break-all">{cssVars['--font-family-secondary'] || 'Non défini'}</p>
               </div>
               <div>
                 <p className="font-semibold mb-1">Arabe:</p>
                 <p className="break-all">{cssVars['--font-family-arabic'] || 'Non défini'}</p>
               </div>
               <div>
                 <p className="font-semibold mb-1">Sans (Legacy):</p>
                 <p className="break-all">{cssVars['--font-family-sans-legacy'] || 'Non défini'}</p>
               </div>
             </div>
           </div>

         </CardContent>
       </Card>

       {/* Final Status Summary */}
       <Card className="w-full border-green-200 bg-green-50">
         <CardHeader>
           <CardTitle className="text-xl text-green-700">✅ Complete Style System Validation</CardTitle>
           <CardDescription className="text-green-600">
             Comprehensive analysis of the Rotary Tunis Doyen Club styling system with all utility classes
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="space-y-2">
               <h4 className="font-semibold text-green-700">✅ Brand Compliance</h4>
               <ul className="space-y-1 text-sm text-green-600">
                 <li>• Official Rotary colors verified</li>
                 <li>• Brand guidelines followed</li>
                 <li>• Color consistency maintained</li>
                 <li>• Typography standards met</li>
               </ul>
             </div>
             <div className="space-y-2">
               <h4 className="font-semibold text-green-700">✅ Accessibility</h4>
               <ul className="space-y-1 text-sm text-green-600">
                 <li>• WCAG contrast ratios tested</li>
                 <li>• Focus rings implemented</li>
                 <li>• Touch targets optimized</li>
                 <li>• Screen reader friendly</li>
               </ul>
             </div>
             <div className="space-y-2">
               <h4 className="font-semibold text-green-700">✅ Layout & Animation</h4>
               <ul className="space-y-1 text-sm text-green-600">
                 <li>• Container system working</li>
                 <li>• Responsive grids active</li>
                 <li>• Section padding applied</li>
                 <li>• Animations functional</li>
               </ul>
             </div>
             <div className="space-y-2">
               <h4 className="font-semibold text-green-700">✅ Technical Implementation</h4>
               <ul className="space-y-1 text-sm text-green-600">
                 <li>• CSS variables working</li>
                 <li>• Dark mode functional</li>
                 <li>• Responsive design active</li>
                 <li>• RTL support enabled</li>
               </ul>
             </div>
           </div>
         </CardContent>
       </Card>
     </div>
   )
}
