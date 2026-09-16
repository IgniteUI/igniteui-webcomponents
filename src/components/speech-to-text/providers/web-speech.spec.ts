import { expect } from '@open-wc/testing';
import { spy } from 'sinon';
import { expectRejection } from '#internals/testing/helpers.spec.js';
import { SpeechToTextProviderError } from '../provider-error.js';
import { createListener } from '../testing.spec.js';
import type { SpeechToTextProviderOptions } from '../types.js';
import { WebSpeechProvider } from './web-speech.js';

type RecognitionScope = {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
};

class MockRecognition extends EventTarget {
  public static instances: MockRecognition[] = [];

  public lang = '';
  public continuous = false;
  public interimResults = false;
  public maxAlternatives = 1;

  public start = spy();
  public stop = spy();
  public abort = spy();

  constructor() {
    super();
    MockRecognition.instances.push(this);
  }

  public emit(type: string, init: Record<string, unknown> = {}): void {
    this.dispatchEvent(Object.assign(new Event(type), init));
  }

  public emitResult(
    resultIndex: number,
    results: Array<{
      isFinal: boolean;
      alternatives: Array<{ transcript: string; confidence: number }>;
    }>
  ): void {
    const list = results.map((result) =>
      Object.assign([...result.alternatives], { isFinal: result.isFinal })
    );
    this.emit('result', { resultIndex, results: list });
  }
}

const OPTIONS: SpeechToTextProviderOptions = {
  lang: 'en-GB',
  continuous: true,
  interimResults: true,
  maxAlternatives: 2,
};

describe('WebSpeechProvider', () => {
  const scope = globalThis as RecognitionScope;
  let originalStandard: unknown;
  let originalPrefixed: unknown;

  let provider: WebSpeechProvider;
  let listener: ReturnType<typeof createListener>;

  const latest = () => MockRecognition.instances.at(-1)!;

  async function startProvider() {
    const pending = provider.start(OPTIONS, listener);
    latest().emit('start');
    await pending;
  }

  beforeEach(() => {
    originalStandard = scope.SpeechRecognition;
    originalPrefixed = scope.webkitSpeechRecognition;
    scope.SpeechRecognition = MockRecognition;
    MockRecognition.instances = [];

    provider = new WebSpeechProvider();
    listener = createListener();
  });

  afterEach(() => {
    scope.SpeechRecognition = originalStandard;
    scope.webkitSpeechRecognition = originalPrefixed;
  });

  it('is supported when a recognition constructor exists', () => {
    expect(WebSpeechProvider.isSupported).to.be.true;
    expect(provider.isSupported).to.be.true;
  });

  it('falls back to the prefixed constructor', () => {
    scope.webkitSpeechRecognition = MockRecognition;
    scope.SpeechRecognition = undefined;

    expect(provider.isSupported).to.be.true;
  });

  it('is not supported without a recognition constructor', async () => {
    scope.SpeechRecognition = undefined;
    scope.webkitSpeechRecognition = undefined;

    expect(provider.isSupported).to.be.false;

    const error = await expectRejection(
      provider.start(OPTIONS, listener),
      SpeechToTextProviderError
    );
    expect(error.code).to.equal('not-supported');
  });

  it('configures the recognition and resolves once it starts', async () => {
    await startProvider();

    const recognition = latest();
    expect(recognition.lang).to.equal('en-GB');
    expect(recognition.continuous).to.be.true;
    expect(recognition.interimResults).to.be.true;
    expect(recognition.maxAlternatives).to.equal(2);
    expect(recognition.start).calledOnce;
    expect(listener.onStart).calledOnce;
  });

  it('adds the likely region to a language tag without one', async () => {
    for (const [lang, expected] of [
      ['en', 'en-US'],
      ['bg', 'bg-BG'],
      ['zh-Hant', 'zh-Hant-TW'],
    ]) {
      provider = new WebSpeechProvider();
      const pending = provider.start({ ...OPTIONS, lang }, listener);
      latest().emit('start');
      await pending;

      expect(latest().lang).to.equal(expected);
    }
  });

  it('passes an invalid language tag through unchanged', async () => {
    const pending = provider.start({ ...OPTIONS, lang: 'not a tag' }, listener);
    latest().emit('start');
    await pending;

    expect(latest().lang).to.equal('not a tag');
  });

  it('rejects a second start while running', async () => {
    await startProvider();

    const error = await expectRejection(
      provider.start(OPTIONS, listener),
      SpeechToTextProviderError
    );
    expect(error.code).to.equal('unknown');
    expect(MockRecognition.instances).to.have.lengthOf(1);
  });

  it('rejects when an error occurs before the start event', async () => {
    const pending = provider.start(OPTIONS, listener);
    latest().emit('error', { error: 'not-allowed', message: 'Denied' });

    const error = await expectRejection(pending, SpeechToTextProviderError);
    expect(error.code).to.equal('not-allowed');
    expect(error.message).to.equal('Denied');
    expect(listener.onStart).not.called;

    // The end event that follows is ignored.
    latest().emit('end');
    expect(listener.onEnd).not.called;
  });

  it('rejects when the recognition ends before it starts', async () => {
    const pending = provider.start(OPTIONS, listener);
    latest().emit('end');

    const error = await expectRejection(pending, SpeechToTextProviderError);
    expect(error.code).to.equal('aborted');
  });

  it('rejects when the native start throws', async () => {
    class ThrowingRecognition extends MockRecognition {
      public override start = spy(() => {
        throw new Error('busy');
      });
    }
    scope.SpeechRecognition = ThrowingRecognition;

    const error = await expectRejection(
      provider.start(OPTIONS, listener),
      SpeechToTextProviderError
    );
    expect(error.code).to.equal('unknown');
    expect(error.message).to.equal('busy');
  });

  it('maps unknown error codes to `unknown`', async () => {
    await startProvider();
    latest().emit('error', { error: 'phrases-not-supported', message: '' });

    expect(listener.onError).calledOnceWith({
      code: 'unknown',
      message: 'phrases-not-supported',
    });
  });

  it('reports errors after start and ends afterwards', async () => {
    await startProvider();

    latest().emit('error', { error: 'network', message: 'Offline' });
    expect(listener.onError).calledOnceWith({
      code: 'network',
      message: 'Offline',
    });
    expect(listener.onEnd).not.called;

    latest().emit('end');
    expect(listener.onEnd).calledOnce;
  });

  it('maps final results with confidence and alternatives', async () => {
    await startProvider();

    latest().emitResult(0, [
      {
        isFinal: true,
        alternatives: [
          { transcript: 'hello', confidence: 0.92 },
          { transcript: 'hallo', confidence: 0.4 },
        ],
      },
    ]);

    expect(listener.onResult).calledOnceWith({
      transcript: 'hello',
      isFinal: true,
      confidence: 0.92,
      alternatives: ['hallo'],
    });
    expect(listener.onActivity).not.called;
  });

  it('joins interim results into one interim transcript', async () => {
    await startProvider();

    latest().emitResult(1, [
      { isFinal: true, alternatives: [{ transcript: 'old', confidence: 1 }] },
      { isFinal: false, alternatives: [{ transcript: 'how ', confidence: 0 }] },
      { isFinal: false, alternatives: [{ transcript: 'are', confidence: 0 }] },
    ]);

    expect(listener.onResult).calledOnceWith({
      transcript: 'how are',
      isFinal: false,
    });
  });

  it('emits finals and the pending interim of one result event in order', async () => {
    await startProvider();

    latest().emitResult(0, [
      { isFinal: true, alternatives: [{ transcript: 'done', confidence: 1 }] },
      { isFinal: false, alternatives: [{ transcript: 'next', confidence: 0 }] },
    ]);

    expect(listener.onResult).calledTwice;
    expect(listener.onResult.firstCall.args[0].isFinal).to.be.true;
    expect(listener.onResult.secondCall.args[0]).to.deep.equal({
      transcript: 'next',
      isFinal: false,
    });
  });

  it('reports speech activity', async () => {
    await startProvider();
    latest().emit('speechstart');

    expect(listener.onActivity).calledOnce;
  });

  it('stops the recognition on stop()', async () => {
    await startProvider();
    provider.stop();

    expect(latest().stop).calledOnce;

    latest().emit('end');
    expect(listener.onEnd).calledOnce;
  });

  it('aborts the recognition and suppresses the resulting `aborted` error', async () => {
    await startProvider();
    provider.abort();

    expect(latest().abort).calledOnce;

    latest().emit('error', { error: 'aborted', message: '' });
    latest().emit('end');

    expect(listener.onError).not.called;
    expect(listener.onEnd).calledOnce;
  });

  it('does nothing on stop() and abort() when idle', () => {
    provider.stop();
    provider.abort();

    expect(MockRecognition.instances).to.be.empty;
  });

  it('can start again after a session ended', async () => {
    await startProvider();
    latest().emit('end');

    listener = createListener();
    await startProvider();

    expect(MockRecognition.instances).to.have.lengthOf(2);
    expect(listener.onStart).calledOnce;
  });

  it('ignores events from a finished session', async () => {
    await startProvider();
    const first = latest();
    first.emit('end');

    first.emitResult(0, [
      { isFinal: true, alternatives: [{ transcript: 'late', confidence: 1 }] },
    ]);
    first.emit('error', { error: 'network', message: '' });

    expect(listener.onResult).not.called;
    expect(listener.onError).not.called;
    expect(listener.onEnd).calledOnce;
  });
});
