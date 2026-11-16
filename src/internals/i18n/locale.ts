import { getCurrentI18n } from 'igniteui-i18n-core';
import { getOrInsertComputed } from '../utils/objects.js';

/** The size limit of a per-locale cache, because a locale can come from user input. */
const MAX_CACHED_LOCALES = 64;

/**
 * Returns `locale` when it is a valid language tag, else the global locale.
 * `Intl` throws on an invalid tag, and in older core versions the formatter
 * fallback lags behind the global locale during a locale change event.
 */
export function resolveLocale(locale: string): string {
  try {
    Intl.getCanonicalLocales(locale);
    return locale;
  } catch {
    return getCurrentI18n();
  }
}

/**
 * Returns the cached result of `create` for `locale`. `create` gets the
 * resolved locale, see {@link resolveLocale}.
 */
export function getOrCreateForLocale<V>(
  cache: Map<string, V>,
  locale: string,
  create: (locale: string) => V
): V {
  // The global locale is part of the key, because an invalid tag resolves to it.
  return getOrInsertComputed(cache, `${locale}|${getCurrentI18n()}`, () => {
    if (cache.size >= MAX_CACHED_LOCALES) {
      cache.clear();
    }
    return create(resolveLocale(locale));
  });
}
