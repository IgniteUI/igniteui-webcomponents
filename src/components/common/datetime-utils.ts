// type DatePartName =
//   | 'weekday'
//   | 'year'
//   | 'month'
//   | 'lmonth'
//   | 'day'
//   | 'dayPeriod'
//   | 'hour'
//   | 'lhour'
//   | 'minute'
//   | 'second';

// type DateParts = { [k in DatePartName]: string };
// type Token = { type: DatePartName | 'literal'; value: string };
// type Parser = (date: Date) => DateParts;

// type FormatterMask =
//   | 'YYYY'
//   | 'YY'
//   | 'MMMM'
//   | 'MMM'
//   | 'MM'
//   | 'DD'
//   | 'dddd'
//   | 'ddd'
//   | 'A'
//   | 'a'
//   | 'HH'
//   | 'hh'
//   | 'mm'
//   | 'ss';

// type Formatter = (tokens: DateParts, date: Date) => string;
// type Formatters = { [k in FormatterMask]: Formatter };
// type CustomFormatters = { [k: string]: Formatter };
// type FormatFunction = (
//   date: Date,
//   format: string,
//   options?: FormatOptions
// ) => string;
// type FormatOptions = {
//   locale?: string;
//   timezone?: string;
// };

// const parsers: Map<string, Parser> = new Map();
// const intlFormattersOptions = [
//   {
//     weekday: 'long',
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//   },
//   {
//     month: 'long',
//     hour: '2-digit',
//     hour12: false,
//   },
// ];

// const defaultPattern = '[YMDdAaHhms]+';

// const formatters: Formatters = {
//   YYYY: (parts) => parts.year,
//   YY: (parts) => parts.year.slice(-2),
//   MMMM: (parts) => parts.lmonth,
//   MMM: (parts) => parts.lmonth.slice(0, 3),
//   MM: (parts) => parts.month,
//   DD: (parts) => parts.day,
//   dddd: (parts) => parts.weekday,
//   ddd: (parts) => parts.weekday.slice(0, 3),
//   A: (parts) => parts.dayPeriod,
//   a: (parts) => parts.dayPeriod.toLowerCase(),
//   HH: (parts) => parts.lhour.slice(-2),
//   hh: (parts) => parts.hour,
//   mm: (parts) => parts.minute,
//   ss: (parts) => parts.second,
// };

// const createIntlFormatterWith = (
//   options: FormatOptions
// ): Intl.DateTimeFormat[] =>
//   intlFormattersOptions.map(
//     (intlFormatterOptions) =>
//       new Intl.DateTimeFormat(options.locale, {
//         ...intlFormatterOptions,
//         timeZone: options.timezone,
//       } as Intl.DateTimeFormatOptions)
//   );

// const longTokensTransformer = (token: Token) =>
//   (token.type !== 'literal'
//     ? { type: `l${token.type}`, value: token.value }
//     : token) as Token;

// const datePartsReducer = (parts: DateParts, token: Token): DateParts => {
//   parts[token.type as DatePartName] = token.value;
//   return parts;
// };

// const tokenize = (intlFormatter: Intl.DateTimeFormat, date: Date) =>
//   intlFormatter
//     .formatToParts(date)
//     .filter((token) => token.type !== 'literal') as Token[];

// const createParser = (options: FormatOptions) => {
//   const [intlFormatter, intlFormatterLong] = createIntlFormatterWith(options);

//   return function parseDateImpl(date: Date): DateParts {
//     const tokens = tokenize(intlFormatter, date);
//     const longTokens = tokenize(intlFormatterLong, date).map(
//       longTokensTransformer
//     );
//     const allTokens = [...tokens, ...longTokens];
//     return allTokens.reduce(datePartsReducer, {} as DateParts);
//   };
// };

// function parseDate(date: Date, options: FormatOptions = {}) {
//   const key = `${options.locale}${options.timezone}`;
//   let parser = parsers.get(key);
//   if (!parser) {
//     parser = createParser(options);
//     parsers.set(key, parser);
//   }

//   return parser(date);
// }

// const createCustomPattern = (customFormatters: CustomFormatters) =>
//   Object.keys(customFormatters).reduce((_, key) => `|${key}`, '');

// export function formatDate(
//   customFormatters: CustomFormatters,
//   format: string,
//   parts: DateParts,
//   date: Date
// ) {
//   const literalPattern = `\\[([^\\]]+)\\]|`;
//   const customPattern = createCustomPattern(customFormatters);
//   const patternRegexp = new RegExp(
//     `${literalPattern}${defaultPattern}${customPattern}`,
//     'g'
//   );

//   const allFormatters = { ...formatters, ...customFormatters };
//   return format.replace(
//     patternRegexp,
//     (mask: FormatterMask, literal: string) => {
//       return literal || allFormatters[mask](parts, date);
//     }
//   );
// }

// function createDateFormatter(
//   customFormatters: CustomFormatters
// ): FormatFunction {
//   return function intlFormatDate(
//     date: Date,
//     format: string,
//     options?: FormatOptions
//   ): string {
//     const tokens = parseDate(date, options);
//     const output = formatDate(customFormatters, format, tokens, date);
//     return output;
//   };
// }

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

type Month = Range<1, 13>;
type Day = Range<1, 32>;
type Hour = Range<0, 24>;
type Minute = Range<0, 60>;
type Second = Minute;

interface DateObjectParams {
  year?: number;
  month?: Month;
  day?: Day;
  hours?: Hour;
  minutes?: Minute;
  seconds?: Second;
}

export const create = {
  now: () => new Date(),
  fromMilliseconds: (ms: number) => new Date(ms),
  fromDatestring: (datestring: string) => new Date(datestring),
  fromParams: (params: DateObjectParams) => {
    const year = params.year || 2023;
    const month: Month = params?.month || 1;
    const day: Day = params?.day || 1;
    const hour: Hour = params?.hours ?? 0;
    const minute: Minute = params?.minutes ?? 0;
    const second: Second = params?.seconds ?? 0;
    return new Date(year, month - 1, day, hour, minute, second);
  },
};
