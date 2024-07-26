type DateTimeFormatterConfig = {
  [name: string]: Intl.DateTimeFormatOptions;
};

const _cache = new Map<string, Intl.DateTimeFormat>();

function stringifyOptions(options: Intl.DateTimeFormatOptions) {
  return Object.entries(options)
    .map(([k, v]) => `${k}:${v}`)
    .join('::');
}

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}#${stringifyOptions(options)}`;

  if (!_cache.has(key)) {
    _cache.set(key, new Intl.DateTimeFormat(locale, options));
  }

  return _cache.get(key)!;
}

class DateTimeFormatters<T extends DateTimeFormatterConfig> {
  private _formatters = new Map<keyof T, Intl.DateTimeFormat>();

  private _update(configuration: T) {
    for (const [key, value] of Object.entries(configuration)) {
      this._formatters.set(key, getFormatter(this._locale, value));
    }
  }

  constructor(
    private _locale: string,
    private _configuration: T
  ) {
    this._update(_configuration);
  }

  public get(name: keyof T) {
    return this._formatters.get(name)!;
  }

  public get configuration() {
    return { ...this._configuration };
  }

  public get locale() {
    return this._locale;
  }

  public set locale(value: string) {
    this._locale = value;
    this._update(this._configuration);
  }

  public update(configuration: Partial<T>) {
    this._update(Object.assign(this._configuration, configuration));
  }
}

export function createDateTimeFormatters<T extends DateTimeFormatterConfig>(
  locale: string,
  configuration: T
) {
  return new DateTimeFormatters(locale, configuration);
}
