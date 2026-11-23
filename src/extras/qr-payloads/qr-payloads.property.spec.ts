import { expect } from '@open-wc/testing';

import { createDate } from '#internals/date/model.js';
import { fc } from '#internals/testing/fast-check-setup.spec.js';
import {
  createEpcPayload,
  createEventPayload,
  createVCardPayload,
  createWifiPayload,
} from './qr-payloads.js';

const text = fc.string({ unit: 'grapheme', minLength: 1, maxLength: 40 });

/** Reads a field of a `WIFI:` payload. A `:` in a value is always escaped. */
function readWifiField(payload: string, key: string): string | undefined {
  const match = new RegExp(
    `(?:^WIFI:|;)${key}:((?:\\\\[\\s\\S]|[^\\\\;])*);`
  ).exec(payload);
  return match?.[1].replace(/\\([\s\S])/g, '$1');
}

/** Reverses the TEXT escaping of RFC 2426 and RFC 5545. */
function unescapeText(value: string): string {
  return value.replace(/\\([\s\S])/g, (_, char: string) =>
    char === 'n' ? '\n' : char
  );
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

describe('QR payloads properties', () => {
  it('gives back the SSID and the password of a Wi-Fi payload', () => {
    fc.assert(
      fc.property(text, text, fc.boolean(), (ssid, password, hidden) => {
        const payload = createWifiPayload({ ssid, password, hidden });

        expect(readWifiField(payload, 'S')).to.equal(ssid);
        expect(readWifiField(payload, 'P')).to.equal(password);
        expect(readWifiField(payload, 'H')).to.equal(
          hidden ? 'true' : undefined
        );
      })
    );
  });

  it('keeps each vCard value on its line and gives the text back', () => {
    fc.assert(
      fc.property(text, text, (organization, note) => {
        const lines = createVCardPayload({
          name: { given: 'A' },
          organization,
          note,
        }).split('\r\n');
        const value = (key: string) =>
          unescapeText(
            lines
              .find((line) => line.startsWith(`${key}:`))!
              .slice(key.length + 1)
          );

        expect(lines.every((line) => !/[\r\n]/.test(line))).to.be.true;
        expect(value('ORG')).to.equal(organization.replace(/\r\n|\r/g, '\n'));
        expect(value('NOTE')).to.equal(note.replace(/\r\n|\r/g, '\n'));
      })
    );
  });

  it('writes any amount in whole cents exactly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 99_999_999_999 }), (cents) => {
        const line = createEpcPayload({
          name: 'A',
          iban: 'X',
          amount: cents / 100,
        }).split('\n')[7];

        expect(line).to.equal(
          `EUR${Math.trunc(cents / 100)}.${pad(cents % 100)}`
        );
      })
    );
  });

  it('writes a timed event in UTC and an all-day event on its local dates', () => {
    const date = fc.date({
      min: new Date(Date.UTC(1, 0, 2)),
      max: new Date(Date.UTC(9999, 11, 30)),
      noInvalidDate: true,
    });

    fc.assert(
      fc.property(date, (start) => {
        const timed = createEventPayload({ start });
        const allDay = createEventPayload({ start, end: start, allDay: true });
        const next = createDate(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + 1
        );
        const local = (day: Date) =>
          `${pad(day.getFullYear(), 4)}${pad(day.getMonth() + 1)}${pad(day.getDate())}`;

        expect(timed).to.contain(
          `DTSTART:${pad(start.getUTCFullYear(), 4)}${pad(start.getUTCMonth() + 1)}${pad(start.getUTCDate())}T${pad(start.getUTCHours())}${pad(start.getUTCMinutes())}${pad(start.getUTCSeconds())}Z`
        );
        expect(allDay).to.contain(`DTSTART;VALUE=DATE:${local(start)}`);
        expect(allDay).to.contain(`DTEND;VALUE=DATE:${local(next)}`);
      })
    );
  });
});
