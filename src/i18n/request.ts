import { getRequestConfig } from 'next-intl/server'

import { getUserLocale } from './service'

export default getRequestConfig(async () => {
  // Static for now, we'll change this later

  const locale = (await getUserLocale()) ?? 'en'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
