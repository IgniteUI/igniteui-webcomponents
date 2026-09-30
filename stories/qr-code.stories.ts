import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  defineComponents,
  IgcButtonComponent,
  IgcInputComponent,
  IgcQrCodeComponent,
  IgcSelectComponent,
  IgcSwitchComponent,
  type QrCodeExportFormat,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcInputComponent,
  IgcQrCodeComponent,
  IgcSelectComponent,
  IgcSwitchComponent
);

// region default
const metadata: Meta<IgcQrCodeComponent> = {
  title: 'QrCode',
  component: 'igc-qr-code',
  parameters: {
    docs: {
      description: {
        component:
          '\nGenerates a QR code based on the provided value and options.\nThe component renders an SVG representation of the QR code, which can be customized using various properties.',
      },
    },
  },
  argTypes: {
    value: {
      type: 'string',
      description:
        'The value to be encoded in the QR code. This can be any string, such as a URL, text, or other data.\nWhen this property is set, the component will generate a QR code representing the provided value.',
      control: 'text',
    },
    version: {
      type: 'number',
      description:
        'The version of the QR code to generate, which determines the size and data capacity of the QR code.\nValid values are integers from 1 to 40, where each version corresponds to a specific module size and data capacity.\n\nIf not specified, the component will automatically select the smallest version that can accommodate the provided value.',
      control: 'number',
    },
    errorLevel: {
      type: { name: 'enum', value: ['L', 'M', 'Q', 'H'] },
      description:
        "The error correction level for the QR code, which determines the QR code's ability to be read if it is partially obscured or damaged.\nValid values are 'L', 'M', 'Q', and 'H', where 'L' provides the lowest level of error correction and 'H' provides the highest level.\n\nWhen the level is not set, the code uses 'M'. A logo that is larger than the safe area of 'M'\nraises the level to the smallest level that holds the logo. To restore this behavior, set\n`undefined` or remove the attribute.",
      options: ['L', 'M', 'Q', 'H'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'M' } },
    },
    size: {
      type: 'number',
      description:
        'The size of the QR code in pixels. This determines the width and height of the generated QR code. The default value is 128 pixels.',
      control: 'number',
      table: { defaultValue: { summary: '128' } },
    },
    margin: {
      type: 'number',
      description:
        'The margin (quiet zone) around the QR code, expressed as a number of QR code modules rather\nthan pixels. This is the blank border area surrounding the code, which helps ensure that it\ncan be properly scanned.',
      control: 'number',
      table: { defaultValue: { summary: '4' } },
    },
    logoSrc: {
      type: 'string',
      description:
        'The source URL of an optional logo image to be displayed at the center of the QR code. The logo can help with branding and recognition.\nIf provided, the component will attempt to render the logo within the QR code while maintaining scannability.',
      control: 'text',
    },
    logoSize: {
      type: 'number',
      description:
        "The size of the logo, as a ratio of the maximum area that can safely be obscured by a logo\nwhile the QR code remains scannable (up to 9% of the code's area, at the highest error\ncorrection level). The value should be a number between 0 and 1, where 0 means no logo and 1\nmeans the logo will cover the full safe area (not the entire QR code).\nThe default value is 0.4, meaning the logo covers 40% of that safe area (~3.6% of the QR code).\n\nWhen `error-level` is not set and the logo is larger than the safe area of level 'M', the\ncomponent uses the smallest error correction level that holds the logo.",
      control: 'number',
      table: { defaultValue: { summary: '0.4' } },
    },
    logoMargin: {
      type: 'number',
      description:
        "The margin around the logo in pixels. This is the whitespace area surrounding the logo within the QR code,\nwhich helps ensure that the logo does not interfere with the QR code's scannability.",
      control: 'number',
    },
    dotStyle: {
      type: { name: 'enum', value: ['square', 'circle', 'rounded'] },
      description:
        "The style of the data modules (dots) in the QR code, and of the inner dot of each finder-pattern\ncorner. This can be 'square', 'circle', or 'rounded'.",
      options: ['square', 'circle', 'rounded'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'square' } },
    },
    squareStyle: {
      type: { name: 'enum', value: ['square', 'circle', 'rounded'] },
      description:
        "The style of the corner squares in the QR code. This can be 'square', 'circle', or 'rounded'.",
      options: ['square', 'circle', 'rounded'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'square' } },
    },
  },
  args: {
    errorLevel: 'M',
    size: 128,
    margin: 4,
    logoSize: 0.4,
    dotStyle: 'square',
    squareStyle: 'square',
  },
};

export default metadata;

interface IgcQrCodeArgs {
  /**
   * The value to be encoded in the QR code. This can be any string, such as a URL, text, or other data.
   * When this property is set, the component will generate a QR code representing the provided value.
   */
  value: string;
  /**
   * The version of the QR code to generate, which determines the size and data capacity of the QR code.
   * Valid values are integers from 1 to 40, where each version corresponds to a specific module size and data capacity.
   *
   * If not specified, the component will automatically select the smallest version that can accommodate the provided value.
   */
  version: number;
  /**
   * The error correction level for the QR code, which determines the QR code's ability to be read if it is partially obscured or damaged.
   * Valid values are 'L', 'M', 'Q', and 'H', where 'L' provides the lowest level of error correction and 'H' provides the highest level.
   *
   * When the level is not set, the code uses 'M'. A logo that is larger than the safe area of 'M'
   * raises the level to the smallest level that holds the logo. To restore this behavior, set
   * `undefined` or remove the attribute.
   */
  errorLevel: 'L' | 'M' | 'Q' | 'H';
  /** The size of the QR code in pixels. This determines the width and height of the generated QR code. The default value is 128 pixels. */
  size: number;
  /**
   * The margin (quiet zone) around the QR code, expressed as a number of QR code modules rather
   * than pixels. This is the blank border area surrounding the code, which helps ensure that it
   * can be properly scanned.
   */
  margin: number;
  /**
   * The source URL of an optional logo image to be displayed at the center of the QR code. The logo can help with branding and recognition.
   * If provided, the component will attempt to render the logo within the QR code while maintaining scannability.
   */
  logoSrc: string;
  /**
   * The size of the logo, as a ratio of the maximum area that can safely be obscured by a logo
   * while the QR code remains scannable (up to 9% of the code's area, at the highest error
   * correction level). The value should be a number between 0 and 1, where 0 means no logo and 1
   * means the logo will cover the full safe area (not the entire QR code).
   * The default value is 0.4, meaning the logo covers 40% of that safe area (~3.6% of the QR code).
   *
   * When `error-level` is not set and the logo is larger than the safe area of level 'M', the
   * component uses the smallest error correction level that holds the logo.
   */
  logoSize: number;
  /**
   * The margin around the logo in pixels. This is the whitespace area surrounding the logo within the QR code,
   * which helps ensure that the logo does not interfere with the QR code's scannability.
   */
  logoMargin: number;
  /**
   * The style of the data modules (dots) in the QR code, and of the inner dot of each finder-pattern
   * corner. This can be 'square', 'circle', or 'rounded'.
   */
  dotStyle: 'square' | 'circle' | 'rounded';
  /** The style of the corner squares in the QR code. This can be 'square', 'circle', or 'rounded'. */
  squareStyle: 'square' | 'circle' | 'rounded';
}
type Story = StoryObj<IgcQrCodeArgs>;

// endregion

const productUrl =
  'https://www.infragistics.com/products/ignite-ui-web-components';

const samples = html`
  <style>
    .qr-samples {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      gap: 2rem;
    }

    .qr-samples figure {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }

    .qr-samples figcaption {
      max-width: 12rem;
      text-align: center;
    }
  </style>
`;

/** Makes a square logo with a short text as an SVG data URI. */
function logo(background: string, color: string, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${background}"/><text x="32" y="43" fill="${color}" font-family="sans-serif" font-size="28" font-weight="700" text-anchor="middle">${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A fully interactive QR code. Use the controls panel to change the encoded `value`, the `size`, the quiet-zone `margin`, the error correction level, the shapes and the logo.',
      },
    },
  },
  args: {
    value: productUrl,
  },
};

export const Shapes: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`dot-style` sets the shape of the data modules and of the inner dot of each corner. `square-style` sets the shape of the outer corner squares. The table shows all nine combinations for the same value.',
      },
    },
  },
  render: () => {
    const shapes = ['square', 'circle', 'rounded'] as const;

    return html`
      <div style="overflow-x: auto">
        <table style="border-spacing: 1.5rem 1rem; text-align: center">
          <thead>
            <tr>
              <td></td>
              ${shapes.map(
                (shape) => html`<th scope="col">dot-style="${shape}"</th>`
              )}
            </tr>
          </thead>
          <tbody>
            ${shapes.map(
              (square) => html`
                <tr>
                  <th scope="row">square-style="${square}"</th>
                  ${shapes.map(
                    (dot) => html`
                      <td>
                        <igc-qr-code
                          value=${productUrl}
                          size="112"
                          dot-style=${dot}
                          square-style=${square}
                        ></igc-qr-code>
                      </td>
                    `
                  )}
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  },
};

export const Colors: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'CSS custom properties set the colors. `--ig-qr-code-dark-color` colors the data modules and, by default, the corners. `--ig-qr-code-corner-square-color` and `--ig-qr-code-corner-dot-color` override the two parts of the corners. The colors do not follow the light and dark theme variants, because a code that inverts itself can stop to scan. Keep a strong contrast between the modules and the background: some older readers cannot scan an inverted code, and most readers cannot scan a code with low contrast.',
      },
    },
  },
  render: () => {
    const variants = [
      {
        caption: 'Brand colors',
        style:
          '--ig-qr-code-dark-color: #0b3d91; --ig-qr-code-background: #eaf2ff;',
      },
      {
        caption: 'Accent corners',
        style:
          '--ig-qr-code-dark-color: #1f2937; --ig-qr-code-corner-square-color: #e63946; --ig-qr-code-corner-dot-color: #457b9d;',
      },
      {
        caption: 'Inverted, for a dark print',
        style:
          '--ig-qr-code-dark-color: #f8fafc; --ig-qr-code-background: #0f172a;',
      },
      {
        caption: 'Low contrast, hard to scan',
        style:
          '--ig-qr-code-dark-color: #c7ccd4; --ig-qr-code-background: #ffffff;',
      },
    ];

    return html`
      ${samples}
      <div class="qr-samples">
        ${variants.map(
          ({ caption, style }) => html`
            <figure>
              <igc-qr-code
                value=${productUrl}
                size="160"
                dot-style="rounded"
                style=${style}
              ></igc-qr-code>
              <figcaption>${caption}</figcaption>
            </figure>
          `
        )}
      </div>
    `;
  },
};

export const ErrorCorrection: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`error-level` sets how much of the code a reader can restore when the code is dirty, torn or covered. A higher level adds modules, so the code of the same value becomes denser. Turn on the switch to put a sticker over each code, and then try to scan the codes with a phone. Levels `Q` and `H` usually still scan.',
      },
    },
  },
  render: () => {
    const levels = [
      ['L', 'about 7%'],
      ['M', 'about 15%'],
      ['Q', 'about 25%'],
      ['H', 'about 30%'],
    ] as const;

    const cover = (event: Event) => {
      const toggle = event.currentTarget as IgcSwitchComponent;
      toggle.nextElementSibling?.classList.toggle('covered', toggle.checked);
    };

    return html`
      ${samples}
      <style>
        .qr-code-frame {
          position: relative;
          line-height: 0;
        }

        .qr-code-frame::after {
          content: '';
          position: absolute;
          inset-block-start: 52%;
          inset-inline-start: 50%;
          width: 30%;
          aspect-ratio: 1;
          border-radius: 8px;
          background: #f9c74f;
          rotate: 8deg;
          visibility: hidden;
        }

        .covered .qr-code-frame::after {
          visibility: visible;
        }
      </style>

      <igc-switch @igcChange=${cover}>Cover part of each code</igc-switch>
      <div class="qr-samples" style="margin-block-start: 1.5rem">
        ${levels.map(
          ([level, recovery]) => html`
            <figure>
              <div class="qr-code-frame">
                <igc-qr-code
                  value=${productUrl}
                  size="160"
                  error-level=${level}
                ></igc-qr-code>
              </div>
              <figcaption>
                <strong>${level}</strong>: restores ${recovery} of the code
              </figcaption>
            </figure>
          `
        )}
      </div>
    `;
  },
};

export const WithLogo: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`logo-src` puts an image at the center of the code and removes the modules under it. `logo-size` is a ratio of the area that the error correction level can restore, not of the full code: `1` covers 9% of the code at level `H`. `logo-margin` adds whitespace around the logo, in pixels. Without `error-level`, the code uses level `M`, and a logo larger than the safe area of `M` raises the level to the smallest one that holds it, as in the first two codes. An explicit level caps the logo to the area of that level, so the logo in the last code shrinks. A logo source must be an image: a `javascript:` URL or a data URI of another type is ignored.',
      },
    },
  },
  render: () => {
    const variants: {
      caption: string;
      logo: string;
      size: number;
      level?: 'L' | 'H';
      margin?: number;
      style: string;
    }[] = [
      {
        caption: 'Default logo size, no error-level: level M',
        logo: logo('#6f4e37', '#fff8e7', 'BC'),
        size: 0.4,
        style:
          '--ig-qr-code-dark-color: #3b2a20; --ig-qr-code-background: #fff8e7;',
      },
      {
        caption: 'logo-size 0.75 and a 4px margin, no error-level: level H',
        logo: logo('#0b3d91', '#ffffff', 'GO'),
        size: 0.75,
        margin: 4,
        style: '--ig-qr-code-dark-color: #0b3d91;',
      },
      {
        caption: 'logo-size 1, level H: 9% of the code',
        logo: logo('#2a9d8f', '#ffffff', 'ECO'),
        size: 1,
        level: 'H',
        margin: 6,
        style: '--ig-qr-code-dark-color: #1d6f65;',
      },
      {
        caption: 'logo-size 1, level L: 2.25% of the code',
        logo: logo('#2a9d8f', '#ffffff', 'ECO'),
        size: 1,
        level: 'L',
        margin: 6,
        style: '--ig-qr-code-dark-color: #1d6f65;',
      },
    ];

    return html`
      ${samples}
      <div class="qr-samples">
        ${variants.map(
          (variant) => html`
            <figure>
              <igc-qr-code
                value=${productUrl}
                size="200"
                dot-style="circle"
                square-style="rounded"
                error-level=${ifDefined(variant.level)}
                logo-src=${variant.logo}
                logo-size=${variant.size}
                .logoMargin=${variant.margin}
                style=${variant.style}
              ></igc-qr-code>
              <figcaption>${variant.caption}</figcaption>
            </figure>
          `
        )}
      </div>
    `;
  },
};

type Payload = 'url' | 'wifi' | 'contact' | 'text';

/** Escapes the special characters of a `WIFI:` string field. */
function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

/** Escapes the special characters of a vCard text value. */
function escapeVCard(value: string): string {
  return value.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');
}

const payloads: Record<
  Payload,
  { label: string; encode: (fields: Record<string, string>) => string }
> = {
  url: { label: 'Website link', encode: (f) => f.url },
  wifi: {
    label: 'Wi-Fi network',
    encode: (f) =>
      `WIFI:T:WPA;S:${escapeWifi(f.ssid)};P:${escapeWifi(f.password)};;`,
  },
  contact: {
    label: 'Contact card',
    encode: (f) =>
      [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCard(f.last)};${escapeVCard(f.first)}`,
        `FN:${escapeVCard(`${f.first} ${f.last}`.trim())}`,
        `TEL:${escapeVCard(f.phone)}`,
        `EMAIL:${escapeVCard(f.email)}`,
        'END:VCARD',
      ].join('\n'),
  },
  text: { label: 'Plain text', encode: (f) => f.text },
};

export const Generator: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A QR code generator. The content type decides how the fields are encoded: a URL, a `WIFI:` string that a phone uses to join the network, a vCard that a phone saves as a contact, or plain text. The code updates on each keystroke, and `aria-label` gives the code a name that describes its content. The encoded payload shows under the code.',
      },
    },
  },
  render: () => {
    const update = (event: Event) => {
      const root = (event.currentTarget as HTMLElement).closest<HTMLElement>(
        '.qr-generator'
      )!;
      const type = root.querySelector('igc-select')!.value as Payload;
      const qr = root.querySelector('igc-qr-code')!;
      const fields = Object.fromEntries(
        Array.from(root.querySelectorAll('igc-input'), (input) => [
          input.name,
          input.value,
        ])
      );

      for (const group of root.querySelectorAll<HTMLElement>('[data-type]')) {
        group.hidden = group.dataset.type !== type;
      }

      qr.value = payloads[type].encode(fields);
      qr.ariaLabel = `${payloads[type].label} QR code`;
      root.querySelector('pre')!.textContent = qr.value;
    };

    const download = async (event: Event) => {
      const root = (event.currentTarget as HTMLElement).closest(
        '.qr-generator'
      )!;
      const status = root.querySelector('[role="status"]')!;

      try {
        const file = await root
          .querySelector('igc-qr-code')!
          .toImage({ fileName: 'qr-code', scale: 2, download: true });
        status.textContent = `Downloaded ${file.name}.`;
      } catch (error) {
        status.textContent = `The download failed: ${(error as Error).message}`;
      }
    };

    return html`
      <style>
        .qr-generator {
          display: flex;
          flex-wrap: wrap;
          align-items: start;
          gap: 2rem 3rem;
        }

        .qr-generator .fields,
        .qr-generator [data-type] {
          display: grid;
          gap: 1rem;
          width: min(100%, 20rem);
        }

        .qr-generator [hidden] {
          display: none;
        }

        .qr-generator figure {
          display: grid;
          gap: 1rem;
          margin: 0;
        }

        .qr-generator pre {
          max-width: 20rem;
          margin: 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
      </style>

      <div class="qr-generator">
        <div class="fields">
          <igc-select label="Content" value="url" @igcChange=${update}>
            ${Object.entries(payloads).map(
              ([value, { label }]) =>
                html`<igc-select-item value=${value}>${label}</igc-select-item>`
            )}
          </igc-select>

          <div data-type="url">
            <igc-input
              name="url"
              type="url"
              label="URL"
              value=${productUrl}
              @igcInput=${update}
            ></igc-input>
          </div>

          <div data-type="wifi" hidden>
            <igc-input
              name="ssid"
              label="Network name"
              value="Guest Wi-Fi"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="password"
              label="Password"
              value="welcome;2026"
              @igcInput=${update}
            ></igc-input>
          </div>

          <div data-type="contact" hidden>
            <igc-input
              name="first"
              label="First name"
              value="Maria"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="last"
              label="Last name"
              value="Ivanova"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="phone"
              type="tel"
              label="Phone"
              value="+1 555 0100"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="email"
              type="email"
              label="Email"
              value="maria@example.com"
              @igcInput=${update}
            ></igc-input>
          </div>

          <div data-type="text" hidden>
            <igc-input
              name="text"
              label="Text"
              value="Meet at gate 4 at 10:00."
              @igcInput=${update}
            ></igc-input>
          </div>

          <igc-button @click=${download}>Download PNG</igc-button>
          <span role="status"></span>
        </div>

        <figure>
          <igc-qr-code
            value=${productUrl}
            aria-label="Website link QR code"
            size="220"
            error-level="Q"
            dot-style="rounded"
            square-style="rounded"
          ></igc-qr-code>
          <figcaption><pre>${productUrl}</pre></figcaption>
        </figure>
      </div>
    `;
  },
};

export const Tickets: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Event tickets. Without `version`, the component picks the smallest version that holds the value, so a longer ticket code gets more and smaller modules. A fixed `version` gives all tickets the same grid, which suits printed layouts. Turn off the switch to compare. The ticket is white, so `margin="2"` is enough quiet zone here. Use the default of 4 modules on a busy background.',
      },
    },
  },
  render: () => {
    const tickets = [
      { code: 'FC26-7', holder: 'Alex Kim', seat: 'General admission' },
      { code: 'FC26-0042-B', holder: 'Sam Rivera', seat: 'Row B, seat 12' },
      {
        code: 'FC26-VIP-000123-EAST-GATE',
        holder: 'Jordan Lee',
        seat: 'VIP lounge, east gate',
      },
    ];

    const pin = (event: Event) => {
      const toggle = event.currentTarget as IgcSwitchComponent;

      for (const qr of toggle.parentElement!.querySelectorAll('igc-qr-code')) {
        qr.version = toggle.checked ? 3 : undefined;
      }
    };

    return html`
      <style>
        .tickets {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-block-start: 1.5rem;
        }

        .ticket {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #d0d5dd;
          border-radius: 12px;
          background: #ffffff;
          color: #101828;
        }

        .ticket dl {
          display: grid;
          gap: 0.25rem;
          margin: 0;
          padding-inline-end: 1rem;
          border-inline-end: 2px dashed #d0d5dd;
        }

        .ticket dt {
          font-size: 0.75rem;
          color: #475467;
        }

        .ticket dd {
          margin: 0 0 0.5rem;
        }
      </style>

      <div>
        <igc-switch checked @igcChange=${pin}>Pin version 3</igc-switch>
        <div class="tickets">
          ${tickets.map(
            ({ code, holder, seat }) => html`
              <article class="ticket" aria-label="Ticket ${code}">
                <dl>
                  <dt>Event</dt>
                  <dd>Frontend Conf 2026</dd>
                  <dt>Holder</dt>
                  <dd>${holder}</dd>
                  <dt>Seat</dt>
                  <dd>${seat}</dd>
                </dl>
                <igc-qr-code
                  value=${code}
                  aria-label="Check-in code ${code}"
                  version="3"
                  margin="2"
                  size="120"
                ></igc-qr-code>
              </article>
            `
          )}
        </div>
      </div>
    `;
  },
};

export const Export: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`toImage()` exports the code as a `png`, `jpeg`, `webp` or `svg` file. `scale` multiplies `size`, so a scale of 4 gives a 1024 pixel image of this code for print. `download: true` opens the download dialog, and without it the returned `File` goes to the clipboard, as the "Copy PNG" button does. `toBlob()` returns an SVG blob with the colors and the logo inlined, so the blob looks the same outside the component. The preview shows that blob in an `img` element.',
      },
    },
  },
  render: () => {
    let previewUrl = '';

    const context = (event: Event) => {
      const root = (event.currentTarget as HTMLElement).closest('.qr-export')!;
      return {
        qr: root.querySelector('igc-qr-code')!,
        status: root.querySelector('[role="status"]')!,
        preview: root.querySelector('img')!,
      };
    };

    const run = async (event: Event, action: () => Promise<string>) => {
      const { status } = context(event);

      try {
        status.textContent = await action();
      } catch (error) {
        status.textContent = `The export failed: ${(error as Error).message}`;
      }
    };

    const download =
      (format: QrCodeExportFormat, scale: number) => (event: Event) =>
        run(event, async () => {
          const file = await context(event).qr.toImage({
            fileName: `ignite-ui-qr-${scale}x`,
            format,
            scale,
            download: true,
          });
          return `Downloaded ${file.name} (${file.type}).`;
        });

    const copy = (event: Event) =>
      run(event, async () => {
        const file = await context(event).qr.toImage({ scale: 2 });
        await navigator.clipboard.write([
          new ClipboardItem({ [file.type]: file }),
        ]);
        return 'Copied a PNG image to the clipboard.';
      });

    const preview = (event: Event) =>
      run(event, async () => {
        const { qr, preview } = context(event);
        const blob = await qr.toBlob();

        URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(blob);
        preview.src = previewUrl;
        preview.hidden = false;
        return `Created an SVG blob of ${blob.size} bytes.`;
      });

    return html`
      <div
        class="qr-export"
        style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;"
      >
        <div style="display: flex; flex-wrap: wrap; gap: 2rem;">
          <igc-qr-code
            value=${productUrl}
            size="256"
            dot-style="rounded"
            square-style="rounded"
            error-level="H"
            logo-src=${logo('#0b3d91', '#ffffff', 'IG')}
            logo-size="0.75"
            logo-margin="6"
            style="--ig-qr-code-dark-color: #0b3d91;"
          ></igc-qr-code>
          <img alt="Preview of the SVG blob" width="256" height="256" hidden />
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <igc-button @click=${download('svg', 1)}>Download SVG</igc-button>
          <igc-button @click=${download('png', 1)}>
            Download PNG (1x)
          </igc-button>
          <igc-button @click=${download('png', 4)}>
            Download PNG (4x)
          </igc-button>
          <igc-button @click=${download('jpeg', 2)}>
            Download JPEG (2x)
          </igc-button>
          <igc-button @click=${download('webp', 2)}>
            Download WebP (2x)
          </igc-button>
          <igc-button variant="outlined" @click=${copy}>Copy PNG</igc-button>
          <igc-button variant="outlined" @click=${preview}>
            Preview SVG blob
          </igc-button>
        </div>
        <span role="status"></span>
      </div>
    `;
  },
};
