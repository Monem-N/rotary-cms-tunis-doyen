import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const locale = (await requestLocale) || 'fr'; // Default to French if undefined

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
