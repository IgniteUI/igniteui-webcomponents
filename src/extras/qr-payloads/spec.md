# QR payloads specification

- [QR payloads specification](#qr-payloads-specification)
  - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Key features](#key-features)
    - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Developer experience](#developer-experience)
      - [Wi-Fi login](#wi-fi-login)
      - [Contact card](#contact-card)
      - [SEPA payment](#sepa-payment)
      - [Calendar event](#calendar-event)
      - [Errors](#errors)
      - [Links that open an app](#links-that-open-an-app)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Functions](#functions)
    - [Types](#types)
  - [Test scenarios](#test-scenarios)
    - [Wi-Fi](#wi-fi)
    - [vCard](#vcard)
    - [EPC](#epc)
    - [Calendar event](#calendar-event-1)
    - [Scanning](#scanning)
    - [QR payloads properties](#qr-payloads-properties)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-11-23 | Initial specification |

## Overview

`igniteui-webcomponents/extras/qr-payloads` builds the text of a QR code in a format that a scanner app turns into an
action: a Wi-Fi login, a contact card, a SEPA credit transfer or a calendar event. The application sets the text as
the `value` of an [`igc-qr-code`](../../components/qr-code/spec.md). The helpers are plain functions with no
dependencies, in an entry point of their own, so a bundle that does not import them does not contain them.

### Key features

- **Four formats**: `WIFI:`, vCard 3.0, EPC QR version 002 and an iCalendar `VEVENT`.
- **Escaping** of the special characters of each format.
- **Strict input**: a `RangeError` for input that the format does not allow, never a silent cut.
- **No dependencies** and no network request.

### Acceptance criteria

- Each helper must return the text of its format for valid input, with the special characters escaped.
- Each helper must throw a `RangeError` for input that its format does not allow, and must not change a value to make
  it fit.
- A helper must not check what a value means, such as the checksum of an IBAN or the address of an email.
- A decoder must read each payload back from its code unchanged.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- scan a code and join a Wi-Fi network without typing its password;
- scan a code and save a contact with its name, phone numbers and addresses;
- scan a code on an invoice and get a payment form that my banking app fills in;
- scan a code and add an event to my calendar at the correct time in my time zone.

### Developer stories

As a developer, I expect to be able to:

- build these codes without learning their formats;
- trust that a special character in a name or a password does not break the code;
- get an error at once for input that would make a code that a scanner rejects.

## Functionality

### End-user experience

None applicable. The helpers return text. The end-user sees the code that `igc-qr-code` renders from it, and the action
of the scanner app.

### Developer experience

#### Wi-Fi login

`createWifiPayload()` writes the `WIFI:` format that ZXing defined and phone cameras read:

```text
WIFI:T:<type>;S:<ssid>;P:<password>;H:true;;
```

- `T` is `WPA` (also WPA2, the default), `WEP`, `SAE` (WPA3) or `nopass` for `security: 'none'`.
- An open network has no `P` field, and the helper ignores `password` for it.
- `H:true` marks a hidden network. A visible network has no `H` field.
- The helper escapes `\`, `;`, `,`, `:` and `"` with a backslash. It does not put quotes around a value, because
  readers differ in how they read quotes.

#### Contact card

`createVCardPayload()` writes a vCard 3.0 (RFC 2426) with CRLF line ends, in this order: `BEGIN`, `VERSION`, `N`, `FN`,
`ORG`, `TITLE`, one `TEL` for each phone, one `EMAIL` for each email address, `URL`, `ADR`, `NOTE` and `END`. A field
that is not set has no line.

- `N` holds the family name, the given name, an empty additional name, the prefix and the suffix. `FN` joins the
  prefix, the given name, the family name and the suffix with spaces.
- A text value escapes `\`, `,` and `;` with a backslash, and writes a line break as `\n`.
- A phone number and a URL are not text values in vCard 3.0, so they are not escaped.
- A `type` becomes a `TYPE` parameter, for example `TEL;TYPE=cell`.
- `ADR` holds an empty post office box, an empty extended address, the street, the locality, the region, the postal
  code and the country.
- The lines are not folded at 75 octets: folding is optional, and it adds bytes to the code.

#### SEPA payment

`createEpcPayload()` writes a SEPA credit transfer in the EPC QR format (EPC069-12), with LF line ends:

| Line | Content                                     |
| ---: | ------------------------------------------- |
|    1 | `BCD`                                       |
|    2 | `002`, the version with an optional BIC     |
|    3 | `1`, the UTF-8 character set                |
|    4 | `SCT`                                       |
|    5 | The BIC, or empty                           |
|    6 | The name of the beneficiary                 |
|    7 | The IBAN                                    |
|    8 | The amount, such as `EUR25.00`, or empty    |
|    9 | The purpose code, or empty                  |
|   10 | The structured reference, or empty          |
|   11 | The remittance text, or empty               |
|   12 | The information to the payer, or empty      |

- The helper removes the spaces of the IBAN and the BIC.
- It writes the amount with 2 decimals. It accepts a sum that floating point makes inexact, such as `0.1 + 0.2`.
- It keeps the empty lines, so the payload always has 12 lines.
- The length limits count characters (code points), and the whole payload can have up to 331 bytes: the byte
  capacity of a version 13 code at level M.
- The EPC guideline asks for error correction level M. The application keeps the default `error-level` of the code and
  does not add a logo. The helper cannot check this.

#### Calendar event

`createEventPayload()` writes an iCalendar `VEVENT` (RFC 5545) with CRLF line ends, in this order: `BEGIN`, `SUMMARY`,
`DTSTART`, `DTEND`, `LOCATION`, `DESCRIPTION` and `END`. It has no `VCALENDAR` wrapper and no `UID` or `DTSTAMP`,
because scanner apps read the event without them, and they add bytes.

- A timed event is in UTC, such as `DTSTART:20261224T180000Z`, so the phone shows it in its own time zone and the
  code does not depend on time zone data.
- An all-day event uses the local dates of `start` and `end`, such as `DTSTART;VALUE=DATE:20261224`. `end` is the last
  day of the event, and the helper writes the day after it, because the end date of the format is exclusive.
- A text value escapes `\`, `;` and `,` with a backslash, and writes a line break as `\n`.
- The lines are not folded.

#### Errors

A helper throws a `RangeError` when:

- **Wi-Fi**: `ssid` is empty, or `password` is empty for a secured network;
- **vCard**: the name has no part, a `type` has a character other than a letter, a digit or a hyphen, or a phone
  number or the URL has a line break;
- **EPC**: `name` or the IBAN is empty, a field is longer than its limit or has a line break, the BIC does not have 8
  or 11 characters, the amount is out of range or has more than 2 decimals, both `reference` and `text` are set, or
  the payload is over 331 bytes;
- **Calendar event**: `start` or `end` is not a valid date, or its year is not from 0 to 9999.

#### Links that open an app

An email draft, a phone call, a text message and a place on a map need no helper. The
[README](./README.md#links-that-open-an-app) gives the recipes: the `mailto:`, `tel:` and `geo:` URLs, and the `SMSTO:`
convention of ZXing, whose message is not percent-encoded.

### Localization

None applicable. The helpers write the text that the application gives them. The formats have no localized words.

### Keyboard interactions

None applicable.

## API

### Functions

| Function             | Signature                                       | Description                                             |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `createWifiPayload`  | `(options: WifiPayloadOptions) => string`       | Returns a `WIFI:` payload, the format that ZXing defined and phone cameras read. |
| `createVCardPayload` | `(options: VCardPayloadOptions) => string`      | Returns a contact card in the vCard 3.0 format (RFC 2426). |
| `createEpcPayload`   | `(options: EpcPayloadOptions) => string`        | Returns a SEPA credit transfer in the EPC QR format, version 002 with UTF-8 (EPC069-12). |
| `createEventPayload` | `(options: EventPayloadOptions) => string`      | Returns a calendar event as an iCalendar `VEVENT` (RFC 5545), without the `VCALENDAR` wrapper. |

### Types

Each function takes one options interface: `WifiPayloadOptions`, `VCardPayloadOptions` (with `VCardContact` and
`VCardAddress`), `EpcPayloadOptions` and `EventPayloadOptions`. The [README](./README.md) lists their options,
defaults and limits.

## Test scenarios

| Suite                    | File                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| `QR payloads`            | [`qr-payloads.spec.ts`](./qr-payloads.spec.ts)                   |
| `QR payloads properties` | [`qr-payloads.property.spec.ts`](./qr-payloads.property.spec.ts) |

### Wi-Fi

1. The payload is WPA by default.
2. It writes the security type and a hidden network.
3. It writes an open network without a password.
4. It escapes `\ ; , : "` without quotes.
5. It throws for an empty SSID and for a secured network without a password.

### vCard

6. The payload is a vCard 3.0 with CRLF line ends, with all the fields in order.
7. It leaves out the fields that are not set.
8. It escapes the text values and their line breaks.
9. It throws for an empty name, a type that is not a vCard token, and a line break in a phone number or a URL.

### EPC

10. The payload is version 002 in UTF-8, with the spaces of the IBAN and the BIC removed.
11. It keeps the empty fields as empty lines.
12. It writes the amount in euros with 2 decimals, also for `0.1 + 0.2` and for an amount over 2^27 euros.
13. It throws for an amount out of range or with more than 2 decimals.
14. It throws for an empty name or IBAN, a field over its limit or with a line break, a BIC that does not have 8 or 11
    characters, and both a reference and a text.
15. It counts the limits in characters and the payload in bytes.

### Calendar event

16. A timed event is in UTC.
17. An all-day event uses the local dates and an exclusive end, also across the end of a year.
18. A year below 100 has 4 digits.
19. It escapes the text values.
20. It throws for an invalid date and for a year over 9999.

### Scanning

A decoder (zxing-cpp, from the `zxing-wasm` package) reads the code of each payload.

21. A decoder reads each payload back unchanged, with special characters, non-ASCII text and line breaks.

### QR payloads properties

22. A Wi-Fi payload gives back any SSID and password, and the hidden flag, through an independent reader of its
    escapes.
23. A vCard keeps each value on its own line, and gives back any organization and note through an independent reader
    of the TEXT escapes.
24. An EPC payload writes any amount in whole cents, up to 999,999,999.99 euros, exactly.
25. A timed event writes its UTC time, and an all-day event writes its local date and the next day as its end, for any
    date from year 1 to 9999.

### Not covered by the suite

- A scan with the camera of a phone, and the action that the phone takes for each format.
- A banking app that reads the EPC payload.

## Assumptions and limitations

- The `WIFI:` format has no formal specification. The helper follows the ZXing description, which phone cameras read.
- WPA2-Enterprise (EAP) networks are not supported: few phone cameras read their fields.
- The contact card has no photo, because the image data makes a code too large to scan.
- vCard 4.0 is not written: a public Apple forum report says that the iOS reader garbles non-ASCII text in it.
- The calendar event has no `VCALENDAR` wrapper, `UID` or `DTSTAMP`, which RFC 5545 asks for. Scanner apps read the
  event without them.
- The helpers check the format, not the meaning. A wrong IBAN or an end before the start makes a valid code.

## Accessibility

The helpers return text and have no user interface. The default accessible name of `igc-qr-code` is
`QR code: <value>`, so a screen reader would read the whole payload, a Wi-Fi password included. Give the code an
`aria-label` that says what it does, such as `Wi-Fi login for Guest Wi-Fi`.

### ARIA roles and properties

None applicable.

### Keyboard support

None applicable.

### Right to Left support

None applicable. The formats store the text in logical order, and the code reads the same in any direction.
