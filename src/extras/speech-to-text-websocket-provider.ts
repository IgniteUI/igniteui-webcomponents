import { createAbortHandle } from '#internals/abort-handler.js';
import { createTimer } from '#internals/timing.js';
import {
  isSpeechToTextErrorCode,
  SpeechToTextProviderError,
} from '../components/speech-to-text/provider-error.js';
import type {
  SpeechToTextErrorCode,
  SpeechToTextProvider,
  SpeechToTextProviderListener,
  SpeechToTextProviderOptions,
} from '../components/speech-to-text/types.js';

/**
 * Configuration of the WebSocket speech-to-text provider.
 */
export interface WebSocketSpeechToTextProviderOptions {
  /** The WebSocket endpoint that receives the audio and answers with transcripts. */
  url: string | URL;
  /** WebSocket sub-protocols to request. */
  protocols?: string | string[];
  /**
   * The MIME type the audio is recorded in. When omitted, or when the browser cannot record it,
   * the first supported type among `audio/webm;codecs=opus`, `audio/webm`, `audio/ogg;codecs=opus`
   * and `audio/mp4` is used. The negotiated type is sent to the server in the `start` message.
   */
  mimeType?: string;
  /**
   * How often, in milliseconds, an audio chunk is sent.
   * @default 250
   */
  timeslice?: number;
  /**
   * Constraints of the audio track requested from the microphone.
   * @default { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
   */
  audio?: MediaTrackConstraints;
  /**
   * How long, in milliseconds, to wait for the `end` message of the server after the audio stopped
   * before the session is ended locally.
   * @default 5000
   */
  endTimeout?: number;
  /**
   * The maximum number of bytes of audio the browser may hold in the send buffer of the socket.
   * When the connection or the server stalls and the buffer grows past this limit, the session
   * ends with a `network` error instead of buffering audio for the rest of the session.
   * @default 1048576
   */
  maxBufferedAmount?: number;
}

/**
 * A message the provider sends to the server as a JSON text frame.
 *
 * - `start` opens a session and carries the recognition options and the MIME type of the audio frames that follow.
 * - `stop` announces that no more audio follows; the server should flush its final results and answer with `end`.
 *
 * Audio is sent between the two as binary frames in the announced MIME type, as produced by `MediaRecorder`.
 * The frames form one continuous recording; they are not independently decodable.
 */
export type WebSocketSpeechToTextClientMessage =
  | ({ type: 'start'; mimeType: string } & SpeechToTextProviderOptions)
  | { type: 'stop' };

/**
 * A message the server sends to the provider as a JSON text frame.
 *
 * - `result` carries an interim (`isFinal` false) or final transcript.
 * - `activity` reports detected speech that has no transcript yet; it resets the silence timeout of the component.
 * - `error` reports a failure; the server may continue or follow with `end`.
 * - `end` closes the session. The provider also ends the session when the socket closes.
 */
export type WebSocketSpeechToTextServerMessage =
  | {
      type: 'result';
      transcript: string;
      isFinal?: boolean;
      confidence?: number;
      alternatives?: string[];
    }
  | { type: 'activity' }
  | { type: 'error'; code?: SpeechToTextErrorCode; message?: string }
  | { type: 'end' };

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

const DEFAULT_MAX_BUFFERED_AMOUNT = 1024 * 1024;

const DEFAULT_AUDIO: MediaTrackConstraints = {
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

function resolveMimeType(preferred?: string): string {
  const candidates = preferred
    ? [preferred, ...MIME_CANDIDATES]
    : MIME_CANDIDATES;
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

function stopTracks(stream?: MediaStream): void {
  for (const track of stream?.getTracks() ?? []) {
    track.stop();
  }
}

function stopRecorder(recorder?: MediaRecorder): void {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
  }
}

function toProviderError(error: unknown): SpeechToTextProviderError {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return new SpeechToTextProviderError('not-allowed', error.message);
      case 'NotFoundError':
      case 'NotReadableError':
      case 'OverconstrainedError':
        return new SpeechToTextProviderError('audio-capture', error.message);
    }
  }

  return SpeechToTextProviderError.from(error);
}

/**
 * A speech-to-text provider that records the microphone with `MediaRecorder` and streams the
 * audio to a WebSocket endpoint, which answers with transcripts.
 *
 * Use it with the speech-to-text component where the Web Speech API is not available, or where
 * recognition should run through a service you control. The wire protocol is described by
 * `WebSocketSpeechToTextClientMessage` and `WebSocketSpeechToTextServerMessage`, and in
 * `src/extras/speech-to-text-websocket-protocol.md` in the repository.
 *
 * @example
 * ```ts
 * import { WebSocketSpeechToTextProvider } from 'igniteui-webcomponents/extras';
 *
 * const element = document.querySelector('igc-speech-to-text');
 * element.provider = new WebSocketSpeechToTextProvider({ url: 'wss://example.com/transcribe' });
 * ```
 */
export class WebSocketSpeechToTextProvider implements SpeechToTextProvider {
  /** Whether WebSockets, `MediaRecorder` and microphone capture are available in the current environment. */
  public static get isSupported(): boolean {
    return (
      typeof WebSocket === 'function' &&
      typeof MediaRecorder === 'function' &&
      typeof globalThis.navigator?.mediaDevices?.getUserMedia === 'function'
    );
  }

  private readonly _options: WebSocketSpeechToTextProviderOptions;
  private readonly _abort = createAbortHandle();
  private readonly _endTimer = createTimer(() => this._finish());

  private _socket?: WebSocket;
  private _recorder?: MediaRecorder;
  private _stream?: MediaStream;
  private _listener?: SpeechToTextProviderListener;

  constructor(options: WebSocketSpeechToTextProviderOptions) {
    this._options = options;
  }

  public get isSupported(): boolean {
    return WebSocketSpeechToTextProvider.isSupported;
  }

  public async start(
    options: SpeechToTextProviderOptions,
    listener: SpeechToTextProviderListener
  ): Promise<void> {
    if (this._listener) {
      throw new SpeechToTextProviderError(
        'unknown',
        'A recognition session is already running.'
      );
    }

    if (!this.isSupported) {
      throw new SpeechToTextProviderError(
        'not-supported',
        'Microphone capture or WebSockets are not available in this browser.'
      );
    }

    this._listener = listener;
    const { signal } = this._abort;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: this._options.audio ?? DEFAULT_AUDIO,
      });

      if (signal.aborted) {
        stopTracks(stream);
        throw new SpeechToTextProviderError('aborted', 'Aborted.');
      }

      this._stream = stream;

      const socket = await this._connect(signal);
      this._socket = socket;

      const mimeType = resolveMimeType(this._options.mimeType);
      const maxBufferedAmount =
        this._options.maxBufferedAmount ?? DEFAULT_MAX_BUFFERED_AMOUNT;
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      this._recorder = recorder;

      socket.addEventListener(
        'message',
        (event) => this._handleMessage(event, listener),
        { signal }
      );
      socket.addEventListener('close', () => this._finish(), { signal });
      socket.addEventListener(
        'error',
        () =>
          this._fail('network', 'The connection to the speech service failed.'),
        { signal }
      );

      recorder.addEventListener(
        'dataavailable',
        (event) => {
          if (event.data.size === 0 || socket.readyState !== WebSocket.OPEN) {
            return;
          }

          // A stalled connection keeps the socket open while the send buffer grows.
          if (socket.bufferedAmount > maxBufferedAmount) {
            this._fail(
              'network',
              'The connection to the speech service stalled.'
            );
            return;
          }

          socket.send(event.data);
        },
        { signal }
      );
      recorder.addEventListener('stop', () => this._handleRecorderStop(), {
        signal,
      });
      recorder.addEventListener(
        'error',
        () => this._fail('audio-capture', 'Recording the microphone failed.'),
        { signal }
      );

      this._send({
        type: 'start',
        ...options,
        mimeType: recorder.mimeType || mimeType,
      });

      recorder.start(this._options.timeslice ?? 250);
      listener.onStart();
    } catch (error) {
      // An abort while starting has already torn the session down.
      if (this._listener === listener) {
        this._teardown();
      }
      throw toProviderError(error);
    }
  }

  public stop(): void {
    // The final chunk arrives through `dataavailable` before `stop` fires.
    stopRecorder(this._recorder);
  }

  public abort(): void {
    this._finish();
  }

  //#region Internal API

  private _connect(signal: AbortSignal): Promise<WebSocket> {
    return new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(this._options.url, this._options.protocols);
      socket.binaryType = 'arraybuffer';

      // Settling the promise detaches every listener below.
      const settled = new AbortController();
      const options = { signal: settled.signal };

      const fail = () => {
        settled.abort();
        reject(
          new SpeechToTextProviderError(
            'network',
            'Could not connect to the speech service.'
          )
        );
      };

      socket.addEventListener(
        'open',
        () => {
          settled.abort();
          resolve(socket);
        },
        options
      );
      socket.addEventListener('error', fail, options);
      socket.addEventListener('close', fail, options);
      signal.addEventListener(
        'abort',
        () => {
          settled.abort();
          socket.close();
          reject(new SpeechToTextProviderError('aborted', 'Aborted.'));
        },
        options
      );
    });
  }

  private _send(message: WebSocketSpeechToTextClientMessage): void {
    if (this._socket?.readyState === WebSocket.OPEN) {
      this._socket.send(JSON.stringify(message));
    }
  }

  private _handleMessage(
    event: MessageEvent,
    listener: SpeechToTextProviderListener
  ): void {
    if (typeof event.data !== 'string') {
      return;
    }

    let message: WebSocketSpeechToTextServerMessage;

    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (message?.type) {
      case 'result':
        // A malformed result from the server must not throw inside the socket handler.
        if (typeof message.transcript === 'string') {
          listener.onResult({
            transcript: message.transcript,
            isFinal: Boolean(message.isFinal),
            confidence: message.confidence,
            alternatives: message.alternatives,
          });
        }
        break;
      case 'activity':
        listener.onActivity();
        break;
      case 'error':
        listener.onError({
          code: isSpeechToTextErrorCode(message.code)
            ? message.code
            : 'unknown',
          message:
            typeof message.message === 'string'
              ? message.message
              : 'The speech service reported an error.',
        });
        break;
      case 'end':
        this._finish();
        break;
    }
  }

  private _handleRecorderStop(): void {
    stopTracks(this._stream);
    this._send({ type: 'stop' });
    this._endTimer.start(this._options.endTimeout ?? 5000);
  }

  private _fail(code: SpeechToTextErrorCode, message: string): void {
    this._listener?.onError({ code, message });
    this._finish();
  }

  private _teardown(): void {
    this._endTimer.stop();

    // Detach every listener before tearing down, so the teardown itself does
    // not re-enter through `stop` / `close` events.
    this._abort.abort();

    stopRecorder(this._recorder);
    stopTracks(this._stream);
    // `close()` is a no-op on a socket that is already closing or closed.
    this._socket?.close();

    this._recorder = undefined;
    this._stream = undefined;
    this._socket = undefined;
    this._listener = undefined;
  }

  private _finish(): void {
    const listener = this._listener;

    if (!listener) {
      return;
    }

    // The recorder exists only once `start()` has announced the session.
    const started = this._recorder !== undefined;
    this._teardown();

    if (started) {
      listener.onEnd();
    }
  }

  //#endregion
}
