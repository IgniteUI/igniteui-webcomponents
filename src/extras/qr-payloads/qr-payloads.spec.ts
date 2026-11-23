import { expect } from '@open-wc/testing';

import { createDate } from '#internals/date/model.js';
import {
  prepareQrDecoder,
  readQrMatrix,
} from '#internals/testing/qr-decoder.spec.js';
import { generateQRCodeMatrix } from '../../components/qr-code/model/matrix.js';
import {
  createEpcPayload,
  createEventPayload,
  createVCardPayload,
  createWifiPayload,
} from './qr-payloads.js';

const crlf = (...lines: string[]) => lines.join('\r\n');

describe('QR payloads', () => {
  describe('Wi-Fi', () => {
    it('builds a WPA payload by default', () => {
      expect(createWifiPayload({ ssid: 'Home', password: 'secret' })).to.equal(
        'WIFI:T:WPA;S:Home;P:secret;;'
      );
    });

    it('writes the security type and a hidden network', () => {
      expect(
        createWifiPayload({
          ssid: 'Lab',
          password: 'k3y',
          security: 'SAE',
          hidden: true,
        })
      ).to.equal('WIFI:T:SAE;S:Lab;P:k3y;H:true;;');
      expect(
        createWifiPayload({ ssid: 'Old', password: 'abc', security: 'WEP' })
      ).to.equal('WIFI:T:WEP;S:Old;P:abc;;');
    });

    it('writes an open network without a password', () => {
      expect(
        createWifiPayload({ ssid: 'Cafe', password: 'x', security: 'none' })
      ).to.equal('WIFI:T:nopass;S:Cafe;;');
    });

    it('escapes the special characters without quotes', () => {
      expect(
        createWifiPayload({ ssid: 'a;b,c:d"e\\f', password: '"12345678"' })
      ).to.equal(String.raw`WIFI:T:WPA;S:a\;b\,c\:d\"e\\f;P:\"12345678\";;`);
    });

    it('throws for an empty SSID or a missing password', () => {
      expect(() => createWifiPayload({ ssid: '', password: 'x' })).to.throw(
        RangeError
      );
      expect(() => createWifiPayload({ ssid: 'Home' })).to.throw(RangeError);
      expect(() =>
        createWifiPayload({ ssid: 'Home', password: '', security: 'WEP' })
      ).to.throw(RangeError);
    });
  });

  describe('vCard', () => {
    it('builds a vCard 3.0 with CRLF line ends', () => {
      expect(
        createVCardPayload({
          name: { given: 'Maria', family: 'Ivanova', prefix: 'Dr.' },
          organization: 'Infragistics',
          title: 'Engineer',
          phones: [{ value: '+1 555 0100', type: 'cell' }],
          emails: [
            { value: 'maria@example.com', type: 'work' },
            { value: 'maria@home.example' },
          ],
          url: 'https://example.com/?a=1,b=2;c',
          address: {
            street: '1 Main St',
            locality: 'Springfield',
            postalCode: '12345',
            country: 'USA',
            type: 'work',
          },
          note: 'Met at the expo',
        })
      ).to.equal(
        crlf(
          'BEGIN:VCARD',
          'VERSION:3.0',
          'N:Ivanova;Maria;;Dr.;',
          'FN:Dr. Maria Ivanova',
          'ORG:Infragistics',
          'TITLE:Engineer',
          'TEL;TYPE=cell:+1 555 0100',
          'EMAIL;TYPE=work:maria@example.com',
          'EMAIL:maria@home.example',
          'URL:https://example.com/?a=1,b=2;c',
          'ADR;TYPE=work:;;1 Main St;Springfield;;12345;USA',
          'NOTE:Met at the expo',
          'END:VCARD'
        )
      );
    });

    it('leaves out the fields that are not set', () => {
      expect(createVCardPayload({ name: { family: 'Lee' } })).to.equal(
        crlf('BEGIN:VCARD', 'VERSION:3.0', 'N:Lee;;;;', 'FN:Lee', 'END:VCARD')
      );
    });

    it('escapes the text values and their line breaks', () => {
      const card = createVCardPayload({
        name: { given: 'A;B', family: 'C,D' },
        organization: 'R&D\\Labs',
        note: 'Line 1\r\nLine 2\nLine 3',
      });

      expect(card).to.contain(String.raw`N:C\,D;A\;B;;;`);
      expect(card).to.contain(String.raw`FN:A\;B C\,D`);
      expect(card).to.contain(String.raw`ORG:R&D\\Labs`);
      expect(card).to.contain(String.raw`NOTE:Line 1\nLine 2\nLine 3`);
    });

    it('throws for an empty name, a bad type and a line break in a raw value', () => {
      expect(() => createVCardPayload({ name: {} })).to.throw(RangeError);
      expect(() =>
        createVCardPayload({
          name: { given: 'A' },
          phones: [{ value: '1', type: 'cell;x' }],
        })
      ).to.throw(RangeError);
      expect(() =>
        createVCardPayload({
          name: { given: 'A' },
          phones: [{ value: '1\n2' }],
        })
      ).to.throw(RangeError);
      expect(() =>
        createVCardPayload({ name: { given: 'A' }, url: 'https://a\r\nb' })
      ).to.throw(RangeError);
    });
  });

  describe('EPC', () => {
    it('builds a version 002 payload in UTF-8', () => {
      expect(
        createEpcPayload({
          name: 'Red Cross of Belgium',
          iban: 'BE72 0000 0000 1616',
          bic: 'BPOT BEB1',
          amount: 1,
          purpose: 'CHAR',
          text: 'Urgency fund',
          information: 'Sample EPC QR code',
        })
      ).to.equal(
        [
          'BCD',
          '002',
          '1',
          'SCT',
          'BPOTBEB1',
          'Red Cross of Belgium',
          'BE72000000001616',
          'EUR1.00',
          'CHAR',
          '',
          'Urgency fund',
          'Sample EPC QR code',
        ].join('\n')
      );
    });

    it('keeps the empty fields as empty lines', () => {
      expect(
        createEpcPayload({ name: 'Shop', iban: 'DE02120300000000202051' })
      ).to.equal(
        // The amount, purpose, reference, text and information lines are empty.
        [
          'BCD',
          '002',
          '1',
          'SCT',
          '',
          'Shop',
          'DE02120300000000202051',
          '',
          '',
          '',
          '',
          '',
        ].join('\n')
      );
    });

    it('writes the amount in euros with 2 decimals', () => {
      const amount = (value: number) =>
        createEpcPayload({ name: 'A', iban: 'X', amount: value }).split(
          '\n'
        )[7];

      expect(amount(12.3)).to.equal('EUR12.30');
      expect(amount(0.1 + 0.2)).to.equal('EUR0.30');
      expect(amount(0.01)).to.equal('EUR0.01');
      expect(amount(134_217_782.86)).to.equal('EUR134217782.86');
      expect(amount(999_999_999.99)).to.equal('EUR999999999.99');
    });

    it('throws for an amount out of range or with more than 2 decimals', () => {
      for (const amount of [0, 0.001, 12.345, 1e9, -5, Number.NaN]) {
        expect(
          () => createEpcPayload({ name: 'A', iban: 'X', amount }),
          String(amount)
        ).to.throw(RangeError);
      }
    });

    it('throws for a field over its limit or with a line break', () => {
      const base = { name: 'A', iban: 'X' };

      for (const options of [
        { ...base, name: '' },
        { ...base, iban: ' ' },
        { ...base, name: 'n'.repeat(71) },
        { ...base, iban: 'I'.repeat(35) },
        { ...base, bic: 'ABCDEFGHI' },
        { ...base, purpose: 'ABCDE' },
        { ...base, reference: 'r'.repeat(36) },
        { ...base, text: 't'.repeat(141) },
        { ...base, information: 'i'.repeat(71) },
        { ...base, text: 'two\nlines' },
        { ...base, reference: 'RF18', text: 'and a text' },
      ]) {
        expect(
          () => createEpcPayload(options),
          JSON.stringify(options)
        ).to.throw(RangeError);
      }
    });

    it('counts the limits in characters and the payload in bytes', () => {
      // 70 characters of 2 bytes each fit the name limit.
      expect(() =>
        createEpcPayload({ name: 'ä'.repeat(70), iban: 'X' })
      ).not.to.throw();
      // 140 + 70 + 70 characters of 2 bytes each are over 331 bytes.
      expect(() =>
        createEpcPayload({
          name: 'ä'.repeat(70),
          iban: 'X',
          text: 'ä'.repeat(140),
          information: 'ä'.repeat(70),
        })
      ).to.throw(RangeError);
    });
  });

  describe('Calendar event', () => {
    it('writes a timed event in UTC', () => {
      expect(
        createEventPayload({
          summary: 'Launch',
          start: new Date(Date.UTC(2026, 11, 24, 18, 0, 0)),
          end: new Date(Date.UTC(2026, 11, 24, 19, 30, 5)),
          location: 'Hall 2',
          description: 'Doors open at 17:30',
        })
      ).to.equal(
        crlf(
          'BEGIN:VEVENT',
          'SUMMARY:Launch',
          'DTSTART:20261224T180000Z',
          'DTEND:20261224T193005Z',
          'LOCATION:Hall 2',
          'DESCRIPTION:Doors open at 17:30',
          'END:VEVENT'
        )
      );
    });

    it('writes an all-day event with the local dates and an exclusive end', () => {
      expect(
        createEventPayload({
          start: new Date(2026, 11, 30),
          end: new Date(2026, 11, 31, 23, 59),
          allDay: true,
        })
      ).to.equal(
        crlf(
          'BEGIN:VEVENT',
          'DTSTART;VALUE=DATE:20261230',
          'DTEND;VALUE=DATE:20270101',
          'END:VEVENT'
        )
      );
    });

    it('writes a year below 100 with 4 digits', () => {
      expect(
        createEventPayload({ start: createDate(50), allDay: true })
      ).to.contain('DTSTART;VALUE=DATE:00500101');
    });

    it('escapes the text values', () => {
      expect(
        createEventPayload({
          summary: 'Party; bring snacks, drinks',
          start: new Date(Date.UTC(2026, 0, 1)),
          description: 'A\\B\nC',
        })
      )
        .to.contain(String.raw`SUMMARY:Party\; bring snacks\, drinks`)
        .and.to.contain(String.raw`DESCRIPTION:A\\B\nC`);
    });

    it('throws for an invalid date or a year over 9999', () => {
      expect(() =>
        createEventPayload({ start: new Date(Number.NaN) })
      ).to.throw(RangeError);
      expect(() =>
        createEventPayload({
          start: new Date(2026, 0, 1),
          end: new Date(Date.UTC(10_000, 0, 1)),
        })
      ).to.throw(RangeError);
    });
  });

  describe('Scanning', () => {
    before(prepareQrDecoder);

    it('gives a decoder each payload back', async () => {
      const encoder = new TextEncoder();

      for (const payload of [
        createWifiPayload({ ssid: 'Guest; Wi-Fi', password: 'welcome:2026' }),
        createVCardPayload({
          name: { given: 'Mária', family: 'Ivanova' },
          phones: [{ value: '+1 555 0100' }],
          note: 'Two\nlines',
        }),
        createEpcPayload({
          name: 'Red Cross of Belgium',
          iban: 'BE72000000001616',
          amount: 1,
          text: 'Urgency fund',
        }),
        createEventPayload({
          summary: 'Launch, part 2',
          start: new Date(Date.UTC(2026, 11, 24, 18)),
        }),
      ]) {
        const { matrix } = generateQRCodeMatrix(payload, 'M');
        expect(await readQrMatrix(matrix), payload).to.deep.equal(
          encoder.encode(payload)
        );
      }
    });
  });
});
