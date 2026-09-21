import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcIconComponent,
  IgcSpeechToTextComponent,
  IgcTextareaComponent,
  type SpeechToTextEndEventArgs,
  type SpeechToTextErrorEventArgs,
  type SpeechToTextResultEventArgs,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { WebSocketSpeechToTextProvider } from 'igniteui-webcomponents/extras';

defineComponents(
  IgcSpeechToTextComponent,
  IgcTextareaComponent,
  IgcIconComponent
);

registerIconFromText(
  'record_voice',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M360-400q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-240q33 0 56.5-23.5T440-560q0-33-23.5-56.5T360-640q-33 0-56.5 23.5T280-560q0 33 23.5 56.5T360-480Zm400 80q0-66-32-120t-88-90l52-56q72 48 116 120t44 146q0 74-44 146t-116 120l-52-56q56-36 88-90t32-120Zm-20-360 32-32-32-32 32-32q40 40 63 93t23 111q0 58-23 111t-63 93l-32-32 32-32-32-32q30-30 47-69t17-83q0-44-17-83t-47-69Z"/></svg>`
);

// region default
const metadata: Meta<IgcSpeechToTextComponent> = {
  title: 'SpeechToText',
  component: 'igc-speech-to-text',
  parameters: {
    docs: {
      description: {
        component:
          'A button that turns speech into text.\n\nPressing the button starts a recognition session; the recognized text arrives through\n`igcInterim` and `igcResult` events and the session ends with `igcEnd`. The `locale` of the\ncomponent selects the language of the speech. Recognition is delegated to a provider.\nWithout an explicit `provider`, the component uses the Web Speech API of the browser and\nrenders disabled where the API is not available.',
      },
    },
    actions: {
      handles: [
        'igcStart',
        'igcInterim',
        'igcResult',
        'igcEnd',
        'igcError',
        'igcStateChange',
      ],
    },
  },
  argTypes: {
    continuous: {
      type: 'boolean',
      description:
        'Whether the session continues after the first utterance until it is stopped.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    interimResults: {
      type: 'boolean',
      description:
        'Whether interim results are reported through `igcInterim` while an utterance is in progress.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    maxAlternatives: {
      type: 'number',
      description:
        'The maximum number of alternative transcripts a final result carries.',
      control: 'number',
      table: { defaultValue: { summary: '1' } },
    },
    silenceTimeout: {
      type: 'number',
      description:
        'The time in milliseconds without speech activity after which the session stops on its own.\nZero disables the timeout.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the component is disabled.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    variant: {
      type: { name: 'enum', value: ['contained', 'flat', 'outlined'] },
      description: 'The variant of the trigger button.',
      options: ['contained', 'flat', 'outlined'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'flat' } },
    },
    locale: {
      type: 'string',
      description:
        "The locale used to resolve the component's resource strings.\nFalls back to the global locale when not set.",
      control: 'text',
    },
  },
  args: {
    continuous: false,
    interimResults: false,
    maxAlternatives: 1,
    silenceTimeout: 0,
    disabled: false,
    variant: 'flat',
  },
};

export default metadata;

interface IgcSpeechToTextArgs {
  /** Whether the session continues after the first utterance until it is stopped. */
  continuous: boolean;
  /** Whether interim results are reported through `igcInterim` while an utterance is in progress. */
  interimResults: boolean;
  /** The maximum number of alternative transcripts a final result carries. */
  maxAlternatives: number;
  /**
   * The time in milliseconds without speech activity after which the session stops on its own.
   * Zero disables the timeout.
   */
  silenceTimeout: number;
  /** Whether the component is disabled. */
  disabled: boolean;
  /** The variant of the trigger button. */
  variant: 'contained' | 'flat' | 'outlined';
  /**
   * The locale used to resolve the component's resource strings.
   * Falls back to the global locale when not set.
   */
  locale: string;
}
type Story = StoryObj<IgcSpeechToTextArgs>;

// endregion

let finalText = '';

function getOutput(): IgcTextareaComponent | null {
  return document.querySelector<IgcTextareaComponent>('#stt-output');
}

function log(message: string): void {
  const el = document.querySelector<HTMLElement>('#stt-log');
  if (el) {
    el.textContent = `${message}\n${el.textContent ?? ''}`.slice(0, 2000);
  }
}

function handleStart(): void {
  finalText = getOutput()?.value ?? '';
  log('igcStart');
}

function handleInterim(event: CustomEvent<SpeechToTextResultEventArgs>): void {
  const output = getOutput();
  if (output) {
    output.value = `${finalText} ${event.detail.transcript}`.trim();
  }
}

function handleResult(event: CustomEvent<SpeechToTextResultEventArgs>): void {
  finalText = `${finalText} ${event.detail.transcript}`.trim();
  const output = getOutput();
  if (output) {
    output.value = finalText;
  }
  log(
    `igcResult: "${event.detail.transcript}" (confidence ${event.detail.confidence?.toFixed(2) ?? 'n/a'})`
  );
}

function handleEnd(event: CustomEvent<SpeechToTextEndEventArgs>): void {
  log(`igcEnd: reason=${event.detail.reason}`);
}

function handleError(event: CustomEvent<SpeechToTextErrorEventArgs>): void {
  log(`igcError: ${event.detail.code} - ${event.detail.message}`);
}

/** Wraps a demo in the event handlers and the transcript output shared by all stories. */
function demo(content: unknown, hint: unknown) {
  return html`
    <div
      style="display: flex; align-items: center; gap: 0.5rem"
      @igcStart=${handleStart}
      @igcInterim=${handleInterim}
      @igcResult=${handleResult}
      @igcEnd=${handleEnd}
      @igcError=${handleError}
    >
      ${content}
      <span>${hint}</span>
    </div>
    <igc-textarea
      id="stt-output"
      label="Transcript"
      rows="4"
      style="width: 32rem; max-width: 100%"
    ></igc-textarea>
    <pre
      id="stt-log"
      style="margin-top: 1rem; font-size: 0.75rem; opacity: 0.8; white-space: pre-wrap"
    ></pre>
  `;
}

export const Basic: Story = {
  args: {
    interimResults: true,
    continuous: true,
    silenceTimeout: 5000,
  },
  render: (args) =>
    demo(
      html`
        <igc-speech-to-text
          locale=${ifDefined(args.locale || undefined)}
          ?continuous=${args.continuous}
          ?interim-results=${args.interimResults}
          max-alternatives=${ifDefined(args.maxAlternatives)}
          silence-timeout=${ifDefined(args.silenceTimeout)}
          ?disabled=${args.disabled}
          variant=${ifDefined(args.variant)}
        ></igc-speech-to-text>
      `,
      'Press the microphone and speak. Press again, or wait for the silence timeout, to stop. Escape aborts.'
    ),
};

export const WebSocketGoogle: Story = {
  args: {
    interimResults: true,
    continuous: true,
    silenceTimeout: 5000,
  },
  render: (args) =>
    demo(
      html`
        <igc-speech-to-text
          .provider=${new WebSocketSpeechToTextProvider({
            url: 'ws://localhost:5238/stt',
            mimeType: 'audio/webm;codecs=opus',
          })}
          locale=${args.locale || 'en-US'}
          ?continuous=${args.continuous}
          ?interim-results=${args.interimResults}
          max-alternatives=${ifDefined(args.maxAlternatives)}
          silence-timeout=${ifDefined(args.silenceTimeout)}
          ?disabled=${args.disabled}
          variant=${ifDefined(args.variant)}
        ></igc-speech-to-text>
      `,
      'Uses the local Google Speech WebSocket server.'
    ),
};

export const CustomContent: Story = {
  args: {
    interimResults: true,
    variant: 'contained',
  },
  render: (args) =>
    demo(
      html`
        <igc-speech-to-text
          locale=${ifDefined(args.locale || undefined)}
          ?continuous=${args.continuous}
          ?interim-results=${args.interimResults}
          max-alternatives=${ifDefined(args.maxAlternatives)}
          silence-timeout=${ifDefined(args.silenceTimeout)}
          ?disabled=${args.disabled}
          variant=${ifDefined(args.variant)}
        >
          <igc-icon name="record_voice"></igc-icon>
        </igc-speech-to-text>
      `,
      'The slotted icon replaces the default microphone.'
    ),
};
