import { getFormatter } from './localization/intl-formatters.js';

// Types

type DatePartInfo = {
  type: DateParts;
  start: number;
  end: number;
  value: string;
};

enum DateParts {
  Day = 'day',
  Month = 'month',
  Year = 'year',
  Date = 'date',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
  Microseconds = 'microseconds',
  AmPm = 'amPm',
  Literal = 'literal',
}

export enum DatePart {
  Month = 'month',
  Year = 'year',
  Date = 'date',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
  Microseconds = 'microseconds',
  AmPm = 'amPm',
}

// Internal mapping

const TokensMap = new Map(
  Object.entries({
    Y: DateParts.Year,
    y: DateParts.Year,
    M: DateParts.Month,
    D: DateParts.Date,
    d: DateParts.Date,
    H: DateParts.Hours,
    h: DateParts.Hours,
    m: DateParts.Minutes,
    s: DateParts.Seconds,
    S: DateParts.Microseconds,
    T: DateParts.AmPm,
    t: DateParts.AmPm,
    a: DateParts.AmPm,
  })
);

const TokensToOptions = new Map(
  Object.entries({
    [DateParts.Year]: 'year',
    [DateParts.Month]: 'month',
    [DateParts.Date]: 'day',
    [DateParts.Hours]: 'hour',
    [DateParts.Minutes]: 'minute',
    [DateParts.Seconds]: 'second',
    [DateParts.Microseconds]: 'fractionalSecondDigits',
    [DateParts.AmPm]: 'dayPeriod',
  })
);

const TokensToValues = new Map(
  Object.entries({
    y: 'numeric',
    yy: '2-digit',
    yyy: 'numeric',
    yyyy: 'numeric',
    Y: 'numeric',
    YY: '2-digit',
    YYY: 'numeric',
    YYYY: 'numeric',
    M: 'numeric',
    MM: '2-digit',
    MMM: 'short',
    MMMM: 'long',
    MMMMM: 'narrow',
    d: 'numeric',
    dd: '2-digit',
    D: 'numeric',
    DD: '2-digit',
    h: 'numeric',
    hh: '2-digit',
    H: 'numeric',
    HH: '2-digit',
    m: 'numeric',
    mm: '2-digit',
    s: 'numeric',
    ss: '2-digit',
    S: 1,
    SS: 2,
    SSS: 3,
  })
);

export function parseToDateParts(format: string) {
  const parts: DatePartInfo[] = [];
  const tokens = Array.from(format).entries();
  let part!: DatePartInfo;

  for (const [pos, token] of tokens) {
    const type = TokensMap.get(token) ?? DateParts.Literal;
    if (part && part.type === type) {
      part.value += token;
      part.end += token.length;
      continue;
    }

    part = { type, start: pos, end: pos + token.length, value: token };
    parts.push(part);
  }

  return parts;
}

export function formatterFromParts(parts: DatePartInfo[], locale = 'en') {
  const options: Intl.DateTimeFormatOptions = {};

  for (const part of parts) {
    const option = TokensToOptions.get(part.type);
    const value = TokensToValues.get(part.value);

    if (option && value) {
      options[option] = value;
    }
  }

  return getFormatter(locale, options);
}

type FormatDateOptions = {
  format: string;
  locale?: string;
};

export function formatDate(
  date: Date,
  config: FormatDateOptions = {
    format: 'yyyy/MM/dd',
    locale: 'en',
  }
) {
  const parts = parseToDateParts(config.format);

  const formattedParts = formatterFromParts(parts, config.locale).formatToParts(
    date
  );

  const formatted = new Map(
    formattedParts.map((each) => [each.type, each.value])
  );

  const result: string[] = [];

  // console.log(Array.from(formatted.entries()));
  // console.log(parts);

  for (const part of parts) {
    if (part.type === DateParts.Literal) {
      result.push(part.value);
      continue;
    }

    if (
      part.type === DateParts.Microseconds &&
      formatted.get('fractionalSecond')
    ) {
      result.push(formatted.get('fractionalSecond')!);
      continue;
    }

    const type = TokensToOptions.get(part.type) ?? part.type;

    if (formatted.has(type)) {
      result.push(formatted.get(type)!);
    }
  }

  return result.join('');
}

// TODO: Try to unify the Intl options keys to the internal types to skip intermediate map creation
// TODO: All the rest... :)
