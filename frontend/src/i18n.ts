import ru from './locales/ru.json';

type Locale = 'ru';

const locales = {
  ru,
};

let currentLocale: Locale = 'ru';

export const setLocale = (locale: Locale) => {
  currentLocale = locale;
};

export const getLocale = () => currentLocale;

export const t = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: any = locales[currentLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  if (params) {
    return Object.entries(params).reduce(
      (str, [paramKey, paramValue]) => str.replace(`{${paramKey}}`, String(paramValue)),
      value
    );
  }
  
  return value;
};

export default t;
