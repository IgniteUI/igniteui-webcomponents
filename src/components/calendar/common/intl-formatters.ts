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

type DateTimeFormatterConfig = {
  [name: string]: Intl.DateTimeFormatOptions;
};

class DateTimeFormatters<T extends DateTimeFormatterConfig> {
  private _formatters = new Map<keyof T, Intl.DateTimeFormat>();

  private _update(config: T) {
    for (const [key, value] of Object.entries(config)) {
      this._formatters.set(key, getFormatter(this._locale, value));
    }
  }

  constructor(
    private _locale: string,
    private _config: T
  ) {
    this._update(_config);
  }

  public getFormatter(name: keyof T) {
    return this._formatters.get(name)!;
  }

  public getConfig<U extends keyof T>(name: U) {
    return this._config[name];
  }

  public get config() {
    return { ...this._config };
  }

  public get locale() {
    return this._locale;
  }

  public set locale(value: string) {
    this._locale = value;
    this._update(this._config);
  }

  public update(config: Partial<T>) {
    Object.assign(this._config, config);
    this._update(this._config);
  }
}

export function createDateTimeFormatters<T extends DateTimeFormatterConfig>(
  locale: string,
  config: T
) {
  return new DateTimeFormatters(locale, config);
}
