const dictionaries = {
  ja: () => import('./dictionaries/ja.json').then((m) => m.default),
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  vi: () => import('./dictionaries/vi.json').then((m) => m.default),
  ku: () => import('./dictionaries/ku.json').then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;

export const LOCALES: Locale[] = ['ja', 'en', 'vi', 'ku'];

export const DEFAULT_LOCALE: Locale = 'ja';

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
