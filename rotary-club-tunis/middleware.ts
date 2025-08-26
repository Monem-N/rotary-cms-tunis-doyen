import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['fr', 'ar', 'en'],

  // Used when no locale matches
  defaultLocale: 'fr',

  // Automatically detect the user's locale based on:
  // 1. The `Accept-Language` header
  // 2. The locale in the pathname
  localeDetection: true,

  // Prefix all routes with the locale (e.g. /fr/about, /ar/about, /en/about)
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  // Exclude API routes, Next.js internals, and static assets
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
