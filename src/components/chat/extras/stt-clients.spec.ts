import { expect } from '@open-wc/testing';
import { fake, useFakeTimers } from 'sinon';
import { BaseSttClient } from './stt-client-base.js';
import { WebSpeechSttClient } from './stt-client-webspeech.js';

const SILENCE_TIMEOUT = 4000;
const GRACE_PERIOD = 1000;

// Minimal concrete implementation of BaseSttClient for testing.
class ConcreteClient extends BaseSttClient {
  async start(): Promise<void> {
    if (this.isRecording) return;
    this.isRecording = true;
    this.resetSilenceTimer();
    this.restartGracePeriod();
  }

  stop(): void {
    this.clearSilenceTimer();
    this.clearSilenceGraceTimer();
    if (this.isCountdownRunning) {
      this.onStartCountdown(null);
      this.isCountdownRunning = false;
    }
    this.isRecording = false;
    this.onFinishedTranscribing(this.isAutoFinished ? 'auto' : 'manual');
    this.isAutoFinished = false;
  }
}

// Minimal mock of the browser SpeechRecognition API.
class MockRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onresult: ((event: any) => void) | undefined;
  onerror: (() => void) | undefined;
  start = fake();
  stop = fake();
}

function makeWebSpeechClient(
  opts: {
    onPulse?: () => void;
    onCountdown?: (ms: number | null) => void;
    onTranscript?: (text: string) => void;
    onStopInProgress?: () => void;
    onFinished?: (f: 'auto' | 'manual') => void;
  } = {}
) {
  const noop = () => {};
  return new WebSpeechSttClient(
    opts.onPulse ?? noop,
    opts.onCountdown ?? noop,
    opts.onTranscript ?? noop,
    opts.onStopInProgress ?? noop,
    opts.onFinished ?? noop
  );
}

describe('BaseSttClient', () => {
  const noop = () => {};
  let clock: ReturnType<typeof useFakeTimers>;

  beforeEach(() => {
    clock = useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('initializes with isRecording set to false', () => {
    const client = new ConcreteClient(noop, noop, noop, noop, noop);
    expect(client.isRecording).to.be.false;
  });

  it('auto-stops and fires onFinishedTranscribing("auto") after silence timeout', async () => {
    const onFinished = fake();
    const client = new ConcreteClient(noop, noop, noop, noop, onFinished);
    await client.start();

    clock.tick(SILENCE_TIMEOUT + 100);

    expect(onFinished.calledOnce).to.be.true;
    expect(onFinished.firstCall.args[0]).to.equal('auto');
  });

  it('stop() prevents auto-stop and fires onFinishedTranscribing("manual")', async () => {
    const onFinished = fake();
    const client = new ConcreteClient(noop, noop, noop, noop, onFinished);
    await client.start();

    client.stop();
    clock.tick(SILENCE_TIMEOUT + 100);

    // Called exactly once by stop(), not again by the timer.
    expect(onFinished.callCount).to.equal(1);
    expect(onFinished.firstCall.args[0]).to.equal('manual');
  });

  it('fires onStartCountdown after the grace period', async () => {
    const onCountdown = fake();
    const client = new ConcreteClient(noop, onCountdown, noop, noop, noop);
    await client.start();

    clock.tick(GRACE_PERIOD + 100);

    expect(onCountdown.calledWith(SILENCE_TIMEOUT - GRACE_PERIOD)).to.be.true;
  });

  it('stop() resets the countdown when it is running', async () => {
    const onCountdown = fake();
    const client = new ConcreteClient(noop, onCountdown, noop, noop, noop);
    await client.start();

    clock.tick(GRACE_PERIOD + 100);
    client.stop();

    expect(onCountdown.calledWith(null)).to.be.true;
  });

  it('start() is a no-op when already recording', async () => {
    const client = new ConcreteClient(noop, noop, noop, noop, noop);
    await client.start();
    const firstIsRecording = client.isRecording;
    await client.start();

    expect(firstIsRecording).to.be.true;
    expect(client.isRecording).to.be.true;
  });
});

describe('WebSpeechSttClient', () => {
  let clock: ReturnType<typeof useFakeTimers>;
  let recognition!: MockRecognition;

  beforeEach(() => {
    clock = useFakeTimers();
    recognition = new MockRecognition();
    (window as any).SpeechRecognition = class extends MockRecognition {
      constructor() {
        super();
        recognition = this;
      }
    };
    delete (window as any).webkitSpeechRecognition;
  });

  afterEach(() => {
    clock.restore();
    delete (window as any).SpeechRecognition;
  });

  it('start() creates a recognition instance with correct settings', async () => {
    const client = makeWebSpeechClient();
    await client.start('de-DE');

    expect(client.isRecording).to.be.true;
    expect(recognition.continuous).to.be.true;
    expect(recognition.interimResults).to.be.true;
    expect(recognition.lang).to.equal('de-DE');
    expect(recognition.start.calledOnce).to.be.true;
  });

  it('start() is a no-op when already recording', async () => {
    const client = makeWebSpeechClient();
    await client.start();
    await client.start();

    expect(recognition.start.calledOnce).to.be.true;
  });

  it('start() throws when SpeechRecognition is not available', async () => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    const client = makeWebSpeechClient();

    try {
      await client.start();
      expect.fail('Expected an error to be thrown');
    } catch (e) {
      expect((e as Error).message).to.include('not supported');
    }
  });

  it('stop() clears recording state and fires onFinishedTranscribing("manual")', async () => {
    const onFinished = fake();
    const client = makeWebSpeechClient({ onFinished });
    await client.start();

    client.stop();

    expect(client.isRecording).to.be.false;
    expect(recognition.stop.calledOnce).to.be.true;
    expect(onFinished.calledWith('manual')).to.be.true;
  });

  it('stop() is a no-op when not recording', () => {
    const onFinished = fake();
    const client = makeWebSpeechClient({ onFinished });

    client.stop();

    expect(onFinished.called).to.be.false;
    expect(recognition.stop.called).to.be.false;
  });

  it('onresult handler updates transcript and fires onPulseSignal', async () => {
    const onTranscript = fake();
    const onPulse = fake();
    const client = makeWebSpeechClient({ onTranscript, onPulse });
    await client.start();

    recognition.onresult!({ results: [[{ transcript: 'hello world' }]] });

    expect(onTranscript.calledWith('hello world')).to.be.true;
    expect(onPulse.calledOnce).to.be.true;
  });

  it('onresult handler concatenates transcripts from multiple results', async () => {
    const onTranscript = fake();
    const client = makeWebSpeechClient({ onTranscript });
    await client.start();

    recognition.onresult!({
      results: [[{ transcript: 'hello ' }], [{ transcript: 'world' }]],
    });

    expect(onTranscript.lastCall.args[0]).to.equal('hello world');
  });

  it('onerror handler stops the client', async () => {
    const onFinished = fake();
    const client = makeWebSpeechClient({ onFinished });
    await client.start();

    recognition.onerror!();

    expect(client.isRecording).to.be.false;
    expect(onFinished.called).to.be.true;
  });

  it('auto-stops after silence timeout with onFinishedTranscribing("auto")', async () => {
    const onFinished = fake();
    const client = makeWebSpeechClient({ onFinished });
    await client.start();

    clock.tick(SILENCE_TIMEOUT + 100);

    expect(onFinished.calledWith('auto')).to.be.true;
  });

  it('stop() resets countdown when it is running', async () => {
    const onCountdown = fake();
    const client = makeWebSpeechClient({ onCountdown });
    await client.start();

    clock.tick(GRACE_PERIOD + 100);
    expect(onCountdown.calledWith(SILENCE_TIMEOUT - GRACE_PERIOD)).to.be.true;

    client.stop();
    expect(onCountdown.calledWith(null)).to.be.true;
  });

  it('falls back to webkitSpeechRecognition when SpeechRecognition is absent', async () => {
    delete (window as any).SpeechRecognition;
    (window as any).webkitSpeechRecognition = class extends MockRecognition {
      constructor() {
        super();
        recognition = this;
      }
    };

    const client = makeWebSpeechClient();
    await client.start();

    expect(recognition.start.calledOnce).to.be.true;
    expect(client.isRecording).to.be.true;
  });
});
