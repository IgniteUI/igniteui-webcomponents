import { isValidDate } from '#internals/date/converters.js';

/**
 * Builders for the text of QR codes that scanner apps turn into an action: a Wi-Fi login, a
 * contact card, a SEPA payment and a calendar event.
 */

export interface WifiPayloadOptions {
  /** The name of the network. */
  ssid: string;
  /** The password. Required, except for an open network, which ignores it. */
  password?: string;
  /**
   * The security of the network. `'WPA'` also covers WPA2, and `'SAE'` is WPA3.
   * @default 'WPA'
   */
  security?: 'WPA' | 'WEP' | 'SAE' | 'none';
  /** Whether the network hides its name. */
  hidden?: boolean;
}

/** A phone number or an email address of a contact card. */
export interface VCardContact {
  /** The phone number or the email address. */
  value: string;
  /** A vCard type, such as `'work'`, `'home'` or `'cell'`. */
  type?: string;
}

/** The postal address of a contact card. */
export interface VCardAddress {
  /** The street and the number. */
  street?: string;
  /** The city or the town. */
  locality?: string;
  /** The state or the province. */
  region?: string;
  postalCode?: string;
  country?: string;
  /** A vCard type, such as `'work'` or `'home'`. */
  type?: string;
}

export interface VCardPayloadOptions {
  /** The name of the contact. At least one part is required. */
  name: { given?: string; family?: string; prefix?: string; suffix?: string };
  /** The company. */
  organization?: string;
  /** The job title. */
  title?: string;
  phones?: VCardContact[];
  emails?: VCardContact[];
  /** A website. */
  url?: string;
  address?: VCardAddress;
  note?: string;
}

export interface EpcPayloadOptions {
  /** The name of the beneficiary, up to 70 characters. */
  name: string;
  /** The IBAN of the beneficiary, up to 34 characters without the spaces. */
  iban: string;
  /** The BIC of the bank, 8 or 11 characters. Optional in the EEA. */
  bic?: string;
  /** The amount in euros, from 0.01 to 999,999,999.99, with up to 2 decimals. */
  amount?: number;
  /** The purpose code, up to 4 characters, such as `'CHAR'`. */
  purpose?: string;
  /** A structured creditor reference, up to 35 characters. Not together with `text`. */
  reference?: string;
  /** The remittance text, up to 140 characters. Not together with `reference`. */
  text?: string;
  /** A note to the payer, up to 70 characters. */
  information?: string;
}

export interface EventPayloadOptions {
  /** The title of the event. */
  summary?: string;
  /** The start of the event. */
  start: Date;
  /** The end of the event. For an all-day event, its last day. */
  end?: Date;
  /** Whether the event takes whole days, on the local dates of `start` and `end`. */
  allDay?: boolean;
  /** The place of the event. */
  location?: string;
  /** The details of the event. */
  description?: string;
}

const LINE_BREAK = /[\r\n]/;
const EPC_MAX_BYTES = 331;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new RangeError(message);
  }
}

function assertSingleLine(value: string, label: string): string {
  assert(!LINE_BREAK.test(value), `The ${label} cannot hold a line break.`);
  return value;
}

function escapeWifi(value: string): string {
  return value.replace(/[\\;,:"]/g, '\\$&');
}

/** Escapes a text value of a vCard or an iCalendar event (RFC 2426, RFC 5545). */
function escapeText(value = ''): string {
  return value
    .replace(/[\\;,]/g, '\\$&')
    .replace(/\r\n|\r|\n/g, String.raw`\n`);
}

/** Returns a structured vCard value: escaped text parts joined with `;`. */
function compound(...parts: (string | undefined)[]): string {
  return parts.map((part) => escapeText(part)).join(';');
}

function textLine(key: string, value: string | undefined): string | undefined {
  return value ? `${key}:${escapeText(value)}` : undefined;
}

/** Joins the lines that have a value with CRLF. */
function joinLines(lines: (string | undefined)[]): string {
  return lines.filter(Boolean).join('\r\n');
}

function vCardKey(key: string, type: string | undefined): string {
  assert(
    !type || /^[a-z\d-]+$/i.test(type),
    `"${type}" is not a vCard type: use letters, digits and hyphens.`
  );
  return type ? `${key};TYPE=${type}` : key;
}

function epcField(label: string, value: string, max: number): string {
  assert(
    Array.from(value).length <= max,
    `The EPC ${label} has more than ${max} characters.`
  );
  return assertSingleLine(value, `EPC ${label}`);
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/**
 * Returns a `WIFI:` payload, the format that ZXing defined and phone cameras read.
 *
 * @throws {RangeError} When a value breaks a rule of the format.
 */
export function createWifiPayload({
  ssid,
  password = '',
  security = 'WPA',
  hidden = false,
}: WifiPayloadOptions): string {
  const open = security === 'none';

  assert(ssid, 'A Wi-Fi payload needs an SSID.');
  assert(open || password, `A ${security} network needs a password.`);

  return [
    `WIFI:T:${open ? 'nopass' : security};S:${escapeWifi(ssid)};`,
    open ? '' : `P:${escapeWifi(password)};`,
    hidden ? 'H:true;' : '',
    ';',
  ].join('');
}

/**
 * Returns a contact card in the vCard 3.0 format (RFC 2426).
 *
 * @throws {RangeError} When a value breaks a rule of the format.
 */
export function createVCardPayload({
  name: { given, family, prefix, suffix },
  organization,
  title,
  phones = [],
  emails = [],
  url,
  address,
  note,
}: VCardPayloadOptions): string {
  const fullName = [prefix, given, family, suffix].filter(Boolean).join(' ');

  assert(fullName, 'A vCard payload needs a name.');

  return joinLines([
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${compound(family, given, '', prefix, suffix)}`,
    textLine('FN', fullName),
    textLine('ORG', organization),
    textLine('TITLE', title),
    // A phone number and a URL are not text values, so they are not escaped.
    ...phones.map(
      ({ value, type }) =>
        `${vCardKey('TEL', type)}:${assertSingleLine(value, 'vCard phone number')}`
    ),
    ...emails.map(
      ({ value, type }) => `${vCardKey('EMAIL', type)}:${escapeText(value)}`
    ),
    url && `URL:${assertSingleLine(url, 'vCard URL')}`,
    address &&
      `${vCardKey('ADR', address.type)}:${compound(
        '',
        '',
        address.street,
        address.locality,
        address.region,
        address.postalCode,
        address.country
      )}`,
    textLine('NOTE', note),
    'END:VCARD',
  ]);
}

/**
 * Returns a SEPA credit transfer in the EPC QR format, version 002 with UTF-8 (EPC069-12). The
 * guideline asks for error correction level M, so keep the default level and do not add a logo.
 *
 * @throws {RangeError} When a value breaks a rule of the format.
 */
export function createEpcPayload({
  name,
  iban,
  bic = '',
  amount,
  purpose = '',
  reference = '',
  text = '',
  information = '',
}: EpcPayloadOptions): string {
  const compactIban = iban.replace(/\s/g, '');
  const compactBic = bic.replace(/\s/g, '');

  assert(name, 'An EPC payload needs the name of the beneficiary.');
  assert(compactIban, 'An EPC payload needs an IBAN.');
  assert(
    [0, 8, 11].includes(compactBic.length),
    'The EPC BIC must have 8 or 11 characters.'
  );
  assert(
    !(reference && text),
    'An EPC payload takes a reference or a text, not both.'
  );

  let euros = '';
  if (amount !== undefined) {
    const cents = Math.round(amount * 100);
    assert(
      Number.isFinite(amount) &&
        // The float error of `amount * 100` grows with the amount.
        Math.abs(amount * 100 - cents) <= cents * Number.EPSILON * 4 &&
        cents >= 1 &&
        cents <= 99_999_999_999,
      'The EPC amount must be from 0.01 to 999999999.99 euros, with up to 2 decimals.'
    );
    euros = `EUR${(cents / 100).toFixed(2)}`;
  }

  const payload = [
    'BCD',
    '002',
    '1',
    'SCT',
    compactBic,
    epcField('name', name, 70),
    epcField('IBAN', compactIban, 34),
    euros,
    epcField('purpose', purpose, 4),
    epcField('reference', reference, 35),
    epcField('text', text, 140),
    epcField('information', information, 70),
  ].join('\n');

  assert(
    new TextEncoder().encode(payload).length <= EPC_MAX_BYTES,
    `An EPC payload can have up to ${EPC_MAX_BYTES} bytes.`
  );
  return payload;
}

/**
 * Returns a calendar event as an iCalendar `VEVENT` (RFC 5545), without the `VCALENDAR`
 * wrapper, as scanner apps read it. A timed event is in UTC.
 *
 * @throws {RangeError} When a value breaks a rule of the format.
 */
export function createEventPayload({
  summary,
  start,
  end,
  allDay = false,
  location,
  description,
}: EventPayloadOptions): string {
  /** Returns the parameters and the value of a date property. */
  const dateValue = (value: Date, days = 0) => {
    assert(isValidDate(value), 'An event date must be a valid date.');

    // `setDate`, because `new Date(year, …)` reads the years 0-99 as 1900-1999.
    const day = new Date(value);
    day.setDate(day.getDate() + days);
    const year = allDay ? day.getFullYear() : value.getUTCFullYear();

    assert(year >= 0 && year <= 9999, 'An event year must be from 0 to 9999.');

    return allDay
      ? `;VALUE=DATE:${pad(year, 4)}${pad(day.getMonth() + 1)}${pad(day.getDate())}`
      : `:${value.toISOString().replace(/[-:]|\.\d{3}/g, '')}`;
  };

  return joinLines([
    'BEGIN:VEVENT',
    textLine('SUMMARY', summary),
    `DTSTART${dateValue(start)}`,
    // The end date of an all-day event is the day after the event.
    end && `DTEND${dateValue(end, 1)}`,
    textLine('LOCATION', location),
    textLine('DESCRIPTION', description),
    'END:VEVENT',
  ]);
}
