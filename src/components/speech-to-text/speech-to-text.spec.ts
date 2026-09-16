import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { getCurrentI18n } from 'igniteui-i18n-core';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import { escapeKey } from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { IgcSpeechToTextResourceStringsEN } from '#internals/i18n/EN/speech-to-text.resources.js';
import {
  simulateClick,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { SpeechToTextProviderError } from './provider-error.js';
import IgcSpeechToTextComponent from './speech-to-text.js';
import type {
  SpeechToTextErrorCode,
  SpeechToTextProvider,
  SpeechToTextProviderListener,
  SpeechToTextProviderOptions,
  SpeechToTextResultEventArgs,
} from './types.js';

class FakeProvider implements SpeechToTextProvider {
  public isSupported = true;
  public listener?: SpeechToTextProviderListener;
  public options?: SpeechToTextProviderOptions;
  public startError?: unknown;
  public autoStart = true;
  public endOnStop = true;
  public startCalls = 0;
  public stopCalls = 0;
  public abortCalls = 0;

  public async start(
    options: SpeechToTextProviderOptions,
    listener: SpeechToTextProviderListener
  ): Promise<void> {
    this.startCalls++;
    this.options = options;
    this.listener = listener;

    if (this.startError) {
      throw this.startError;
    }

    if (this.autoStart) {
      listener.onStart();
    }
  }

  public stop(): void {
    this.stopCalls++;
    if (this.endOnStop) {
      this.listener?.onEnd();
    }
  }

  public abort(): void {
    this.abortCalls++;
    this.listener?.onEnd();
  }

  public final(
    transcript: string,
    extra: Partial<SpeechToTextResultEventArgs> = {}
  ): void {
    this.listener?.onResult({ transcript, isFinal: true, ...extra });
  }

  public interim(transcript: string): void {
    this.listener?.onResult({ transcript, isFinal: false });
  }

  public error(code: SpeechToTextErrorCode, message: string): void {
    this.listener?.onError({ code, message });
  }

  public end(): void {
    this.listener?.onEnd();
  }
}

describe('Speech to text', () => {
  before(() => {
    defineComponents(IgcSpeechToTextComponent);
  });

  let el: IgcSpeechToTextComponent;
  let provider: FakeProvider;

  const strings = IgcSpeechToTextResourceStringsEN;

  const getButton = () =>
    el.renderRoot.querySelector(IgcIconButtonComponent.tagName)!;
  const getStatus = () => el.renderRoot.querySelector('igc-visually-hidden')!;
  const getStates = () =>
    ['idle', 'starting', 'listening', 'stopping', 'unsupported'].filter(
      (name) => el.matches(`:state(${name})`)
    );

  async function createFixture(
    template = html`<igc-speech-to-text></igc-speech-to-text>`
  ) {
    el = await fixture<IgcSpeechToTextComponent>(template);
    provider = new FakeProvider();
    el.provider = provider;
    await elementUpdated(el);
  }

  async function startListening() {
    await el.start();
    await elementUpdated(el);
  }

  describe('Rendering and defaults', () => {
    beforeEach(async () => {
      await createFixture();
    });

    it('passes the a11y audit while idle', async () => {
      await expect(el).shadowDom.to.be.accessible();
      await expect(el).to.be.accessible();
    });

    it('passes the a11y audit while listening', async () => {
      await startListening();

      await expect(el).shadowDom.to.be.accessible();
      await expect(el).to.be.accessible();
    });

    it('is initialized with the proper default values', () => {
      expect(el.continuous).to.be.false;
      expect(el.interimResults).to.be.false;
      expect(el.maxAlternatives).to.equal(1);
      expect(el.silenceTimeout).to.equal(0);
      expect(el.disabled).to.be.false;
      expect(el.variant).to.equal('flat');
      expect(el.state).to.equal('idle');
      expect(el.transcript).to.equal('');
      expect(el.supported).to.be.true;
      expect(getStates()).to.deep.equal(['idle']);
    });

    it('renders the default microphone icon button', () => {
      const button = getButton();
      const icon = button.querySelector('slot > igc-icon')!;

      expect(icon.getAttribute('name')).to.equal('mic');
      expect(icon.getAttribute('aria-hidden')).to.equal('true');
      expect(button.variant).to.equal('flat');
      expect(button.getAttribute('aria-label')).to.equal(
        strings.speechToTextStart
      );
      expect(button.disabled).to.be.false;
    });

    it('forwards the variant to the button', async () => {
      el.variant = 'outlined';
      await elementUpdated(el);

      expect(getButton().variant).to.equal('outlined');
    });

    it('replaces the default icon with slotted content', async () => {
      await createFixture(
        html`<igc-speech-to-text><span>Talk</span></igc-speech-to-text>`
      );
      const slot = getButton().querySelector('slot')!;

      expect(slot.assignedElements({ flatten: true })).to.deep.equal([
        el.querySelector('span'),
      ]);
    });

    it('disables the button when disabled', async () => {
      el.disabled = true;
      await elementUpdated(el);

      expect(getButton().disabled).to.be.true;
    });

    it('applies custom resource strings', async () => {
      el.resourceStrings = { ...strings, speechToTextStart: 'Talk to me' };
      await elementUpdated(el);

      expect(getButton().getAttribute('aria-label')).to.equal('Talk to me');
    });
  });

  describe('Unsupported provider', () => {
    beforeEach(async () => {
      await createFixture();
      provider.isSupported = false;
      el.requestUpdate();
      await elementUpdated(el);
    });

    it('renders a disabled button with an explanation', () => {
      expect(el.supported).to.be.false;
      expect(getButton().disabled).to.be.true;
      expect(getButton().getAttribute('aria-label')).to.equal(
        strings.speechToTextUnsupported
      );
    });

    it('emits `igcError` with `not-supported` on start()', async () => {
      const eventSpy = spy(el, 'emitEvent');
      await el.start();

      expect(el.state).to.equal('idle');
      expect(provider.startCalls).to.equal(0);
      expect(eventSpy).calledOnceWith('igcError', {
        detail: {
          code: 'not-supported',
          message: strings.speechToTextUnsupported,
        },
      });
    });
  });

  describe('Session lifecycle', () => {
    beforeEach(async () => {
      await createFixture();
    });

    it('starts a session and reports the state transitions', async () => {
      const eventSpy = spy(el, 'emitEvent');
      await startListening();

      expect(provider.startCalls).to.equal(1);
      expect(el.state).to.equal('listening');
      expect(getStates()).to.deep.equal(['listening']);
      expect(eventSpy.getCalls().map((call) => call.args)).to.deep.equal([
        ['igcStateChange', { detail: 'starting' }],
        ['igcStateChange', { detail: 'listening' }],
        ['igcStart'],
      ]);
    });

    it('swaps the button label and announces while listening', async () => {
      await startListening();

      expect(getButton().getAttribute('aria-label')).to.equal(
        strings.speechToTextStop
      );
      expect(getStatus().textContent?.trim()).to.equal(
        strings.speechToTextListening
      );
    });

    it('updates the accessible name of the native button', async () => {
      const button = getButton();
      const native = button.renderRoot.querySelector('[part~="base"]')!;

      expect(native.getAttribute('aria-label')).to.equal(
        strings.speechToTextStart
      );

      await startListening();
      await elementUpdated(button);

      expect(native.getAttribute('aria-label')).to.equal(
        strings.speechToTextStop
      );
    });

    it('passes the recognition options to the provider', async () => {
      el.locale = 'bg-BG';
      el.continuous = true;
      el.interimResults = true;
      el.maxAlternatives = 3;
      await startListening();

      expect(provider.options).to.deep.equal({
        lang: 'bg-BG',
        continuous: true,
        interimResults: true,
        maxAlternatives: 3,
      });
    });

    it('sanitizes `maxAlternatives`', async () => {
      el.maxAlternatives = 0;
      await startListening();

      expect(provider.options?.maxAlternatives).to.equal(1);
    });

    it('uses the global locale when none is set', async () => {
      await startListening();

      expect(el.locale).to.equal(getCurrentI18n());
      expect(provider.options?.lang).to.equal(getCurrentI18n());
    });

    it('ignores start() while a session is active', async () => {
      await startListening();
      await el.start();

      expect(provider.startCalls).to.equal(1);
    });

    it('ignores start() while disabled', async () => {
      el.disabled = true;
      await startListening();

      expect(provider.startCalls).to.equal(0);
      expect(el.state).to.equal('idle');
    });

    it('stops manually and emits `igcEnd` with the transcript', async () => {
      await startListening();
      provider.final(' hello ');
      provider.final('world');

      const eventSpy = spy(el, 'emitEvent');
      el.stop();
      await elementUpdated(el);

      expect(provider.stopCalls).to.equal(1);
      expect(el.state).to.equal('idle');
      expect(el.transcript).to.equal('hello world');
      expect(eventSpy.getCalls().map((call) => call.args)).to.deep.equal([
        ['igcStateChange', { detail: 'stopping' }],
        ['igcStateChange', { detail: 'idle' }],
        ['igcEnd', { detail: { transcript: 'hello world', reason: 'manual' } }],
      ]);
      expect(getStatus().textContent?.trim()).to.equal(
        strings.speechToTextStopped
      );
    });

    it('stays in `stopping` until the provider ends', async () => {
      provider.endOnStop = false;
      await startListening();

      el.stop();
      await elementUpdated(el);
      expect(el.state).to.equal('stopping');
      expect(getStates()).to.deep.equal(['stopping']);

      el.stop();
      expect(provider.stopCalls).to.equal(1);

      provider.end();
      expect(el.state).to.equal('idle');
    });

    it('aborts a session that is stopping', async () => {
      provider.endOnStop = false;
      await startListening();
      el.stop();
      expect(el.state).to.equal('stopping');

      el.abort();

      expect(provider.abortCalls).to.equal(1);
      expect(el.state).to.equal('idle');
    });

    it('emits `igcStart` only while the session is still active', async () => {
      const eventSpy = spy(el, 'emitEvent');
      el.addEventListener('igcStateChange', ({ detail }) => {
        if (detail === 'listening') {
          el.stop();
        }
      });

      await startListening();

      expect(el.state).to.equal('idle');
      expect(eventSpy).calledWith('igcEnd');
      expect(eventSpy).not.calledWith('igcStart');
    });

    it('reports the ended session when a new one starts from the state change handler', async () => {
      await startListening();
      provider.final('first');

      const eventSpy = spy(el, 'emitEvent');
      el.addEventListener('igcStateChange', ({ detail }) => {
        if (detail === 'idle' && provider.startCalls === 1) {
          el.start();
        }
      });

      el.stop();

      expect(el.state).to.equal('listening');
      expect(el.transcript).to.equal('');
      expect(eventSpy).calledWith('igcEnd', {
        detail: { transcript: 'first', reason: 'manual' },
      });
    });

    it('aborts an active session', async () => {
      await startListening();
      const eventSpy = spy(el, 'emitEvent');

      el.abort();

      expect(provider.abortCalls).to.equal(1);
      expect(el.state).to.equal('idle');
      expect(eventSpy).calledWith('igcEnd', {
        detail: { transcript: '', reason: 'manual' },
      });
    });

    it('aborts a pending start and ignores its late callbacks', async () => {
      provider.autoStart = false;
      const eventSpy = spy(el, 'emitEvent');

      const pending = el.start();
      expect(el.state).to.equal('starting');

      el.abort();
      await pending;

      expect(provider.abortCalls).to.equal(1);
      expect(el.state).to.equal('idle');

      // The provider reports a late start for the aborted session.
      provider.listener?.onStart();
      expect(el.state).to.equal('idle');
      expect(eventSpy).not.calledWith('igcStart');
      expect(eventSpy).not.calledWith('igcEnd');
    });

    it('does not start the provider when the state change handler aborts', async () => {
      el.addEventListener('igcStateChange', ({ detail }) => {
        if (detail === 'starting') {
          el.abort();
        }
      });

      await startListening();

      expect(provider.startCalls).to.equal(0);
      expect(provider.abortCalls).to.equal(1);
      expect(el.state).to.equal('idle');
    });

    it('aborts the pending start before a new session starts from the state change handler', async () => {
      provider.autoStart = false;
      el.addEventListener('igcStateChange', ({ detail }) => {
        if (detail === 'idle' && provider.startCalls === 1) {
          el.start();
        }
      });

      const first = el.start();
      el.abort();
      await first;

      expect(provider.abortCalls).to.equal(1);
      expect(provider.startCalls).to.equal(2);
      // The abort of the first session must not end the second one.
      expect(el.state).to.equal('starting');
    });

    it('reports a session the provider ended on its own', async () => {
      await startListening();
      const eventSpy = spy(el, 'emitEvent');

      provider.final('done');
      provider.end();

      expect(eventSpy).calledWith('igcEnd', {
        detail: { transcript: 'done', reason: 'provider' },
      });
    });

    it('resets the transcript on the next session', async () => {
      await startListening();
      provider.final('first');
      el.stop();
      expect(el.transcript).to.equal('first');

      await startListening();
      expect(el.transcript).to.equal('');
    });

    it('toggles between idle and listening', async () => {
      await el.toggle();
      expect(el.state).to.equal('listening');

      await el.toggle();
      expect(el.state).to.equal('idle');
    });

    it('aborts the session when the provider changes', async () => {
      await startListening();

      el.provider = new FakeProvider();
      await elementUpdated(el);

      expect(provider.abortCalls).to.equal(1);
      expect(el.state).to.equal('idle');
    });

    it('aborts the session when removed from the DOM', async () => {
      await startListening();

      el.remove();

      expect(provider.abortCalls).to.equal(1);
      expect(el.state).to.equal('idle');
    });
  });

  describe('Results', () => {
    beforeEach(async () => {
      await createFixture();
    });

    it('emits `igcResult` for final results only', async () => {
      await startListening();
      const eventSpy = spy(el, 'emitEvent');

      provider.interim('hel');
      provider.final('hello', { confidence: 0.9, alternatives: ['hallo'] });

      expect(eventSpy).calledOnceWith('igcResult', {
        detail: {
          transcript: 'hello',
          isFinal: true,
          confidence: 0.9,
          alternatives: ['hallo'],
        },
      });
      expect(el.transcript).to.equal('hello');
    });

    it('emits `igcInterim` when interim results are enabled', async () => {
      el.interimResults = true;
      await startListening();
      const eventSpy = spy(el, 'emitEvent');

      provider.interim('hel');

      expect(eventSpy).calledOnceWith('igcInterim', {
        detail: { transcript: 'hel', isFinal: false },
      });
      expect(el.transcript).to.equal('');
    });

    it('skips empty final results in the transcript', async () => {
      await startListening();

      provider.final('   ');
      provider.final('ok');

      expect(el.transcript).to.equal('ok');
    });
  });

  describe('Errors', () => {
    beforeEach(async () => {
      await createFixture();
    });

    it('reports provider errors and ends with reason `error`', async () => {
      await startListening();
      const eventSpy = spy(el, 'emitEvent');

      provider.error('network', 'Connection lost');
      expect(eventSpy).calledWith('igcError', {
        detail: { code: 'network', message: 'Connection lost' },
      });
      expect(el.state).to.equal('listening');

      provider.end();
      await elementUpdated(el);

      expect(el.state).to.equal('idle');
      expect(eventSpy).calledWith('igcEnd', {
        detail: { transcript: '', reason: 'error' },
      });
      expect(getStatus().textContent?.trim()).to.equal(
        `${strings.speechToTextError}: Connection lost`
      );
    });

    it('reports a failed start without emitting `igcEnd`', async () => {
      provider.startError = new SpeechToTextProviderError(
        'not-allowed',
        'Permission denied'
      );
      const eventSpy = spy(el, 'emitEvent');

      await startListening();

      expect(el.state).to.equal('idle');
      expect(eventSpy).calledWith('igcError', {
        detail: { code: 'not-allowed', message: 'Permission denied' },
      });
      expect(eventSpy).not.calledWith('igcStart');
      expect(eventSpy).not.calledWith('igcEnd');
    });

    it('reports a failed start before the state changes to idle', async () => {
      provider.startError = new SpeechToTextProviderError(
        'not-allowed',
        'Permission denied'
      );
      const states: string[] = [];
      el.addEventListener('igcError', () => states.push(el.state));
      el.addEventListener('igcStateChange', ({ detail }) => {
        if (detail === 'idle' && provider.startCalls === 1) {
          provider.startError = undefined;
          el.start();
        }
      });

      await startListening();

      expect(states).to.deep.equal(['starting']);
      expect(el.state).to.equal('listening');
    });

    it('maps unknown start failures to `unknown`', async () => {
      provider.startError = new Error('boom');
      const eventSpy = spy(el, 'emitEvent');

      await startListening();

      expect(eventSpy).calledWith('igcError', {
        detail: { code: 'unknown', message: 'boom' },
      });
    });
  });

  describe('Silence timeout', () => {
    let clock: SinonFakeTimers;

    beforeEach(async () => {
      await createFixture();
      clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => {
      clock.restore();
    });

    it('stops the session after the timeout with reason `silence`', async () => {
      el.silenceTimeout = 1000;
      await startListening();
      const eventSpy = spy(el, 'emitEvent');

      clock.tick(999);
      expect(el.state).to.equal('listening');

      clock.tick(1);
      expect(provider.stopCalls).to.equal(1);
      expect(eventSpy).calledWith('igcEnd', {
        detail: { transcript: '', reason: 'silence' },
      });
    });

    it('resets the timeout on results and activity', async () => {
      el.silenceTimeout = 1000;
      await startListening();

      clock.tick(800);
      provider.interim('a');
      clock.tick(800);
      provider.listener?.onActivity();
      clock.tick(800);
      expect(el.state).to.equal('listening');

      clock.tick(200);
      expect(el.state).to.equal('idle');
    });

    it('does not arm a timeout when zero', async () => {
      await startListening();

      clock.tick(60_000);
      expect(el.state).to.equal('listening');
    });

    it('applies changes of the timeout while listening', async () => {
      await startListening();

      el.silenceTimeout = 1000;
      await elementUpdated(el);
      clock.tick(999);
      expect(el.state).to.equal('listening');

      el.silenceTimeout = 0;
      await elementUpdated(el);
      clock.tick(60_000);
      expect(el.state).to.equal('listening');
    });

    it('cancels the timeout on manual stop', async () => {
      el.silenceTimeout = 1000;
      await startListening();
      el.stop();

      const eventSpy = spy(el, 'emitEvent');
      clock.tick(1000);

      expect(eventSpy.callCount).to.equal(0);
    });
  });

  describe('User interaction', () => {
    beforeEach(async () => {
      await createFixture();
    });

    it('toggles the session on click', async () => {
      simulateClick(getButton());
      await nextFrame();
      expect(el.state).to.equal('listening');

      simulateClick(getButton());
      await nextFrame();
      expect(el.state).to.equal('idle');
    });

    it('aborts on click while starting', async () => {
      provider.autoStart = false;
      simulateClick(getButton());
      await nextFrame();
      expect(el.state).to.equal('starting');

      simulateClick(getButton());
      await nextFrame();
      expect(provider.stopCalls).to.equal(0);
      expect(provider.abortCalls).to.equal(1);
      expect(el.state).to.equal('idle');
    });

    it('ignores clicks while stopping', async () => {
      provider.endOnStop = false;
      await startListening();
      simulateClick(getButton());
      await nextFrame();
      expect(el.state).to.equal('stopping');

      simulateClick(getButton());
      await nextFrame();
      expect(provider.stopCalls).to.equal(1);
      expect(provider.abortCalls).to.equal(0);
      expect(el.state).to.equal('stopping');
    });

    it('aborts on Escape while starting', async () => {
      provider.autoStart = false;
      const pending = el.start();
      expect(el.state).to.equal('starting');

      simulateKeyboard(el, escapeKey);
      await pending;

      expect(provider.abortCalls).to.equal(1);
      expect(el.state).to.equal('idle');
    });

    it('aborts on Escape while listening', async () => {
      simulateKeyboard(el, escapeKey);
      expect(provider.abortCalls).to.equal(0);

      await startListening();
      simulateKeyboard(el, escapeKey);

      expect(provider.abortCalls).to.equal(1);
      expect(el.state).to.equal('idle');
    });
  });
});
