import { getUserLocale } from '@/services/base/locale';
import {getRequestConfig} from 'next-intl/server';
export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  console.log('Locale:', locale);
  return {
    locale,
    messages: (await import(`./../messages/${locale}.json`)).default
  };
});
