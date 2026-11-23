# QR payloads

Scanner apps turn some text formats into an action: they join a Wi-Fi network, save a contact, start a payment or add
a calendar event. These helpers build the text for `igc-qr-code`. They escape the special characters, and they throw a
`RangeError` for input that the format does not allow.

```ts
import {
  createEpcPayload,
  createEventPayload,
  createVCardPayload,
  createWifiPayload,
} from 'igniteui-webcomponents/extras/qr-payloads';

qrCode.value = createWifiPayload({ ssid: 'Guest Wi-Fi', password: 'welcome;2026' });
```

The helpers are plain functions with no dependencies. A bundle that does not import them does not contain them.

## Wi-Fi login

`createWifiPayload()` writes the `WIFI:` format that ZXing defined and phone cameras read.

```ts
createWifiPayload({ ssid: 'Guest Wi-Fi', password: 'welcome;2026' });
// WIFI:T:WPA;S:Guest Wi-Fi;P:welcome\;2026;;
```

| Option     | Type                                   | Default | Description                                                    |
| ---------- | -------------------------------------- | ------- | -------------------------------------------------------------- |
| `ssid`     | `string`                               | Required | The name of the network.                                       |
| `password` | `string`                               | Not set  | The password. Required, except for an open network.            |
| `security` | `'WPA' \| 'WEP' \| 'SAE' \| 'none'`    | `'WPA'` | `WPA` also covers WPA2, and `SAE` is WPA3.                     |
| `hidden`   | `boolean`                              | `false` | Whether the network hides its name.                            |

Enterprise (EAP) networks are not supported, because few phone cameras read them.

## Contact card

`createVCardPayload()` writes a vCard 3.0, the version that phone cameras read most reliably.

```ts
createVCardPayload({
  name: { given: 'Maria', family: 'Ivanova' },
  organization: 'Example Ltd.',
  phones: [{ value: '+1 555 0100', type: 'cell' }],
  emails: [{ value: 'maria@example.com', type: 'work' }],
});
```

| Option         | Type                                                                            | Description                                                       |
| -------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `name`         | `{ given?, family?, prefix?, suffix? }`                                         | The name. At least one part is required.                          |
| `organization` | `string`                                                                        | The company.                                                      |
| `title`        | `string`                                                                        | The job title.                                                    |
| `phones`       | `{ value: string; type?: string }[]`                                            | Phone numbers. `type` is a vCard type, such as `cell` or `work`.  |
| `emails`       | `{ value: string; type?: string }[]`                                            | Email addresses.                                                  |
| `url`          | `string`                                                                        | A website.                                                        |
| `address`      | `{ street?, locality?, region?, postalCode?, country?, type? }`                 | The postal address.                                               |
| `note`         | `string`                                                                        | A note.                                                           |

There is no photo, because the image data makes a code too large to scan.

## SEPA payment

`createEpcPayload()` writes a SEPA credit transfer in the EPC QR format, version 002 with UTF-8. Banking apps in the
euro area read it.

```ts
createEpcPayload({
  name: 'Example Charity e.V.',
  iban: 'DE89 3704 0044 0532 0130 00',
  amount: 25,
  text: 'Donation 2026',
});
```

| Option        | Type     | Limit                    | Description                                                    |
| ------------- | -------- | ------------------------ | -------------------------------------------------------------- |
| `name`        | `string` | 70 characters            | The name of the beneficiary. Required.                         |
| `iban`        | `string` | 34 characters            | The IBAN. Required. The helper removes the spaces.             |
| `bic`         | `string` | 8 or 11 characters       | The BIC. Optional in the EEA.                                  |
| `amount`      | `number` | 0.01 to 999,999,999.99   | The amount in euros, with up to 2 decimals.                    |
| `purpose`     | `string` | 4 characters             | A purpose code, such as `CHAR`.                                |
| `reference`   | `string` | 35 characters            | A structured creditor reference. Do not set it with `text`.    |
| `text`        | `string` | 140 characters           | The remittance text. Do not set it with `reference`.           |
| `information` | `string` | 70 characters            | A note to the payer.                                           |

The whole payload can have up to 331 bytes. The EPC guideline asks for error correction level M, so keep the default
`error-level` and do not add a logo to a payment code.

## Calendar event

`createEventPayload()` writes an iCalendar `VEVENT`.

```ts
createEventPayload({
  summary: 'Team meetup',
  start: new Date(2026, 11, 4, 18),
  end: new Date(2026, 11, 4, 21),
  location: 'Main hall',
});
```

| Option        | Type      | Description                                                                         |
| ------------- | --------- | ----------------------------------------------------------------------------------- |
| `summary`     | `string`  | The title.                                                                          |
| `start`       | `Date`    | The start. Required.                                                                |
| `end`         | `Date`    | The end. For an all-day event, the last day of the event.                           |
| `allDay`      | `boolean` | Whether the event takes whole days. Default `false`.                                |
| `location`    | `string`  | The place.                                                                          |
| `description` | `string`  | The details.                                                                        |

A timed event is written in UTC, so the phone shows it in its own time zone. An all-day event uses the local dates of
`start` and `end`.

## Errors

A helper throws a `RangeError` when the format does not allow the input: an empty network name, an EPC field over its
limit, an amount with 3 decimals, an invalid date and so on. It does not cut a value to fit. It does not check what a
value means, for example the checksum of an IBAN or an email address.

## Links that open an app

An email draft, a phone call, a text message or a place on a map needs no helper. `mailto:`, `tel:` and `geo:` are
URLs: encode their text parts with `encodeURIComponent()`. `SMSTO:` is a ZXing convention, not a URL, so its message
stays as it is:

| Action         | Value                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Email draft    | `` `mailto:support@example.com?subject=${encodeURIComponent(subject)}` `` |
| Phone call     | `tel:+15550100`                                                        |
| Text message   | `SMSTO:+15550100:Table 12 is ready`                                    |
| Place on a map | `geo:42.6977,23.3219`                                                  |

Readers differ in how they fill in a text message, so test such a code on the phones of the users.

The [specification](./spec.md) describes the formats and the test coverage in full.
