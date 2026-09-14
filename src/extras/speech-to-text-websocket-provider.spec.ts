import { aTimeout, expect, nextFrame } from '@open-wc/testing';
import { type SinonStub, spy, stub } from 'sinon';
import { expectRejection } from '#internals/testing/helpers.spec.js';
import { SpeechToTextProviderError } from '../components/speech-to-text/provider-error.js';
import { createListener } from '../components/speech-to-text/testing.spec.js';
import type { SpeechToTextProviderOptions } from '../components/speech-to-text/types.js';
import { WebSocketSpeechToTextProvider } from './speech-to-text-websocket-provider.js';

class MockSocket extends EventTarget {
  public static readonly CONNECTING = 0;
  public static readonly OPEN = 1;
  public static readonly CLOSING = 2;
  public static readonly CLOSED = 3;
  public static instances: MockSocket[] = [];

  public readyState = MockSocket.CONNECTING;
  public binaryType = 'blob';
  public readonly sent: unknown[] = [];

  constructor(
    public readonly url: string | URL,
    public readonly protocols?: string | string[]
  ) {
    super();
    MockSocket.instances.push(this);
  }

  public send(data: unknown): void {
    this.sent.push(data);
  }

  public close(): void {
    if (this.readyState === MockSocket.CLOSED) {
      return;
    }
    this.readyState = MockSocket.CLOSED;
    this.dispatchEvent(new Event('close'));
  }

  public open(): void {
    this.readyState = MockSocket.OPEN;
    this.dispatchEvent(new Event('open'));
  }

  public fail(): void {
    this.dispatchEvent(new Event('error'));
  }

  public message(data: unknown): void {
    this.dispatchEvent(new MessageEvent('message', { data }));
  }

  public get json(): Array<Record<string, unknown>> {
    return this.sent
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => JSON.parse(entry));
  }
}

class MockRecorder extends EventTarget {
  public static supported = new Set(['audio/webm;codecs=opus', 'audio/webm']);
  public static instances: MockRecorder[] = [];

  public static isTypeSupported(type: string): boolean {
    return MockRecorder.supported.has(type);
  }

  public state: RecordingState = 'inactive';
  public timeslice?: number;
  public readonly mimeType: string;

  constructor(
    public readonly stream: MediaStream,
    options?: MediaRecorderOptions
  ) {
    super();
    this.mimeType = options?.mimeType ?? '';
    MockRecorder.instances.push(this);
  }

  public start(timeslice?: number): void {
    this.state = 'recording';
    this.timeslice = timeslice;
  }

  public stop(): void {
    this.state = 'inactive';
    this.dispatchEvent(new Event('stop'));
  }

  public data(size: number): void {
    this.dispatchEvent(
      Object.assign(new Event('dataavailable'), {
        data: new Blob([new Uint8Array(size)]),
      })
    );
  }
}

const OPTIONS: SpeechToTextProviderOptions = {
  lang: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 1,
};

describe('WebSocketSpeechToTextProvider', () => {
  const scope = globalThis as unknown as {
    WebSocket: unknown;
    MediaRecorder: unknown;
  };
  let originalSocket: unknown;
  let originalRecorder: unknown;
  let getUserMedia: SinonStub;
  let tracks: Array<{ stop: ReturnType<typeof spy> }>;

  let provider: WebSocketSpeechToTextProvider;
  let listener: ReturnType<typeof createListener>;

  const socket = () => MockSocket.instances.at(-1)!;
  const recorder = () => MockRecorder.instances.at(-1)!;

  async function startProvider(
    options: Partial<SpeechToTextProviderOptions> = {}
  ) {
    const pending = provider.start({ ...OPTIONS, ...options }, listener);
    // Let `getUserMedia` resolve and the socket get created.
    await nextFrame();
    socket().open();
    await pending;
  }

  beforeEach(() => {
    originalSocket = scope.WebSocket;
    originalRecorder = scope.MediaRecorder;
    scope.WebSocket = MockSocket;
    scope.MediaRecorder = MockRecorder;
    MockSocket.instances = [];
    MockRecorder.instances = [];

    tracks = [{ stop: spy() }];
    getUserMedia = stub(navigator.mediaDevices, 'getUserMedia').resolves({
      getTracks: () => tracks,
    } as unknown as MediaStream);

    provider = new WebSocketSpeechToTextProvider({
      url: 'wss://example.com/stt',
    });
    listener = createListener();
  });

  afterEach(() => {
    scope.WebSocket = originalSocket;
    scope.MediaRecorder = originalRecorder;
    getUserMedia.restore();
  });

  it('is supported when WebSockets, MediaRecorder and microphone capture exist', () => {
    expect(WebSocketSpeechToTextProvider.isSupported).to.be.true;
    expect(provider.isSupported).to.be.true;
  });

  it('is not supported without MediaRecorder', async () => {
    scope.MediaRecorder = undefined;

    expect(provider.isSupported).to.be.false;

    const error = await expectRejection(
      provider.start(OPTIONS, listener),
      SpeechToTextProviderError
    );
    expect(error.code).to.equal('not-supported');
  });

  it('captures the microphone, connects and announces the session', async () => {
    await startProvider();

    expect(getUserMedia).calledOnceWith({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    expect(socket().url).to.equal('wss://example.com/stt');
    expect(socket().binaryType).to.equal('arraybuffer');

    expect(recorder().mimeType).to.equal('audio/webm;codecs=opus');
    expect(recorder().state).to.equal('recording');
    expect(recorder().timeslice).to.equal(250);

    expect(socket().json).to.deep.equal([
      {
        type: 'start',
        lang: 'en-US',
        continuous: true,
        interimResults: true,
        maxAlternatives: 1,
        mimeType: 'audio/webm;codecs=opus',
      },
    ]);
    expect(listener.onStart).calledOnce;
  });

  it('honors the configured protocols, constraints, MIME type and timeslice', async () => {
    provider = new WebSocketSpeechToTextProvider({
      url: 'wss://example.com/stt',
      protocols: ['stt.v1'],
      audio: { channelCount: 2 },
      mimeType: 'audio/webm',
      timeslice: 100,
    });
    await startProvider();

    expect(getUserMedia).calledOnceWith({ audio: { channelCount: 2 } });
    expect(socket().protocols).to.deep.equal(['stt.v1']);
    expect(recorder().mimeType).to.equal('audio/webm');
    expect(recorder().timeslice).to.equal(100);
  });

  it('falls back to a supported MIME type', async () => {
    provider = new WebSocketSpeechToTextProvider({
      url: 'wss://example.com/stt',
      mimeType: 'audio/flac',
    });
    await startProvider();

    expect(recorder().mimeType).to.equal('audio/webm;codecs=opus');
  });

  it('forwards non-empty audio chunks as binary frames', async () => {
    await startProvider();

    recorder().data(0);
    recorder().data(16);

    const frames = socket().sent.filter((entry) => entry instanceof Blob);
    expect(frames).to.have.lengthOf(1);
    expect((frames[0] as Blob).size).to.equal(16);
  });

  it('maps server results', async () => {
    await startProvider();

    socket().message(
      JSON.stringify({ type: 'result', transcript: 'hel', isFinal: false })
    );
    socket().message(
      JSON.stringify({
        type: 'result',
        transcript: 'hello',
        isFinal: true,
        confidence: 0.8,
        alternatives: ['hallo'],
      })
    );

    expect(listener.onResult).calledTwice;
    expect(listener.onResult.firstCall.args[0]).to.deep.equal({
      transcript: 'hel',
      isFinal: false,
      confidence: undefined,
      alternatives: undefined,
    });
    expect(listener.onResult.secondCall.args[0]).to.deep.equal({
      transcript: 'hello',
      isFinal: true,
      confidence: 0.8,
      alternatives: ['hallo'],
    });
  });

  it('maps server errors and ignores malformed frames', async () => {
    await startProvider();

    socket().message('not json');
    socket().message(JSON.stringify({ type: 'error', code: 'no-speech' }));
    socket().message(
      JSON.stringify({ type: 'error', code: 'bogus', message: 'Oops' })
    );
    socket().message(new ArrayBuffer(4));

    expect(listener.onError).calledTwice;
    expect(listener.onError.firstCall.args[0]).to.deep.equal({
      code: 'no-speech',
      message: 'The speech service reported an error.',
    });
    expect(listener.onError.secondCall.args[0]).to.deep.equal({
      code: 'unknown',
      message: 'Oops',
    });
    expect(listener.onEnd).not.called;
  });

  it('ends the session on the `end` message and releases the microphone', async () => {
    await startProvider();

    socket().message(JSON.stringify({ type: 'end' }));

    expect(listener.onEnd).calledOnce;
    expect(tracks[0].stop).calledOnce;
    expect(socket().readyState).to.equal(MockSocket.CLOSED);
  });

  it('ends the session when the socket closes', async () => {
    await startProvider();

    socket().close();

    expect(listener.onEnd).calledOnce;
    expect(tracks[0].stop).calledOnce;
  });

  it('reports a socket error as `network` and ends', async () => {
    await startProvider();

    socket().fail();

    expect(listener.onError).calledOnceWith({
      code: 'network',
      message: 'The connection to the speech service failed.',
    });
    expect(listener.onEnd).calledOnce;
  });

  it('stops the recorder, sends `stop` and waits for the server to end', async () => {
    await startProvider();

    provider.stop();

    expect(recorder().state).to.equal('inactive');
    expect(tracks[0].stop).calledOnce;
    expect(socket().json.at(-1)).to.deep.equal({ type: 'stop' });
    expect(listener.onEnd).not.called;

    socket().message(
      JSON.stringify({ type: 'result', transcript: 'bye', isFinal: true })
    );
    socket().message(JSON.stringify({ type: 'end' }));

    expect(listener.onResult).calledOnce;
    expect(listener.onEnd).calledOnce;
  });

  it('ends locally when the server does not answer the `stop` in time', async () => {
    provider = new WebSocketSpeechToTextProvider({
      url: 'wss://example.com/stt',
      endTimeout: 20,
    });
    await startProvider();

    provider.stop();
    provider.stop();
    await aTimeout(40);

    expect(listener.onEnd).calledOnce;
    expect(socket().readyState).to.equal(MockSocket.CLOSED);
  });

  it('aborts immediately', async () => {
    await startProvider();

    provider.abort();

    expect(listener.onEnd).calledOnce;
    expect(recorder().state).to.equal('inactive');
    expect(tracks[0].stop).calledOnce;
    expect(socket().readyState).to.equal(MockSocket.CLOSED);
    expect(socket().json.map((message) => message.type)).to.deep.equal([
      'start',
    ]);
  });

  it('rejects when microphone access is denied', async () => {
    getUserMedia.rejects(
      new DOMException('Permission denied', 'NotAllowedError')
    );

    const error = await expectRejection(
      provider.start(OPTIONS, listener),
      SpeechToTextProviderError
    );

    expect(error.code).to.equal('not-allowed');
    expect(error.message).to.equal('Permission denied');
    expect(MockSocket.instances).to.be.empty;
    expect(listener.onStart).not.called;
  });

  it('rejects when no microphone is available', async () => {
    getUserMedia.rejects(new DOMException('No device', 'NotFoundError'));

    const error = await expectRejection(
      provider.start(OPTIONS, listener),
      SpeechToTextProviderError
    );
    expect(error.code).to.equal('audio-capture');
  });

  it('rejects when the connection fails and releases the microphone', async () => {
    const pending = provider.start(OPTIONS, listener);
    await nextFrame();
    socket().fail();

    const error = await expectRejection(pending, SpeechToTextProviderError);
    expect(error.code).to.equal('network');
    expect(tracks[0].stop).calledOnce;
    expect(MockRecorder.instances).to.be.empty;
  });

  it('rejects a second start while running', async () => {
    await startProvider();

    const error = await expectRejection(
      provider.start(OPTIONS, listener),
      SpeechToTextProviderError
    );
    expect(error.code).to.equal('unknown');
  });

  it('can start again after a session ended', async () => {
    await startProvider();
    provider.abort();

    listener = createListener();
    await startProvider();

    expect(MockSocket.instances).to.have.lengthOf(2);
    expect(listener.onStart).calledOnce;
  });

  it('does nothing on stop() and abort() when idle', () => {
    provider.stop();
    provider.abort();

    expect(listener.onEnd).not.called;
  });
});
