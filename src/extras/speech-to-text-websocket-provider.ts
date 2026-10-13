import { createAbortHandle } from '#internals/abort-handler.js';
import { createTimer } from '#internals/timing.js';
import { numberInRangeInclusive } from '#internals/utils/math.js';
import { isFunction, isString } from '#internals/utils/types.js';
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

/** The settings of the WebSocket speech-to-text provider. */
export interface WebSocketSpeechToTextProviderOptions {
  /** The WebSocket endpoint that receives the audio and sends back transcripts. */
  url: string | URL;
  /** The WebSocket sub-protocols to request. */
  protocols?: string | string[];
  /**
   * The MIME type of the recorded audio. If it is not set, or the browser cannot record it, the
   * provider uses the first supported type of `audio/webm;codecs=opus`, `audio/webm`,
   * `audio/ogg;codecs=opus` and `audio/mp4`. The `start` message tells the server the type.
   */
  mimeType?: string;
  /**
   * The time in milliseconds between two audio chunks.
   * @default 250
   */
  timeslice?: number;
  /**
   * The constraints of the audio track that the provider requests from the microphone.
   * @default { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
   */
  audio?: MediaTrackConstraints;
  /**
   * The time in milliseconds that the provider waits for the `end` message after the audio
   * stops. After this time, the provider ends the session itself.
   * @default 5000
   */
  endTimeout?: number;
  /**
   * The maximum number of audio bytes in the send buffer of the socket. If the connection or the
   * server stops and the buffer becomes larger, the session ends with a `network` error.
   * @default 1048576
   */
  maxBufferedAmount?: number;
}

/**
 * A message that the provider sends to the server as a JSON text frame.
 *
 * - `start` opens a session. It contains the recognition options and the MIME type of the audio frames that follow.
 * - `stop` tells the server that no more audio follows. The server sends its last final results, then `end`.
 *
 * Between the two messages, the provider sends the `MediaRecorder` audio as binary frames, in the MIME type of
 * `start`. The frames are one continuous recording. A frame alone cannot be decoded.
 */
export type WebSocketSpeechToTextClientMessage =
  | ({ type: 'start'; mimeType: string } & SpeechToTextProviderOptions)
  | { type: 'stop' };

/**
 * A message that the server sends to the provider as a JSON text frame.
 *
 * - `result` contains an interim (`isFinal` false) or a final transcript.
 * - `activity` reports speech that has no transcript yet. It resets the silence timeout of the component.
 * - `error` reports a failure. The server can continue, or send `end`.
 * - `end` closes the session. If the connection closes before `end`, the provider reports a `network` error.
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

const DEFAULT_TIMESLICE = 250;
const DEFAULT_END_TIMEOUT = 5000;
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
 * A speech-to-text provider that records the microphone with `MediaRecorder` and sends the audio
 * to a WebSocket endpoint. The endpoint sends back transcripts.
 *
 * Use it with the speech-to-text component where the Web Speech API is not available, or to use
 * a recognition service that you control. `WebSocketSpeechToTextClientMessage` and
 * `WebSocketSpeechToTextServerMessage` describe the protocol. The repository file
 * `src/extras/speech-to-text-websocket-protocol.md` describes it in full.
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
      isFunction(globalThis.WebSocket) &&
      isFunction(globalThis.MediaRecorder) &&
      isFunction(globalThis.navigator?.mediaDevices?.getUserMedia)
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
      // Only a close by the server or the network arrives here.
      socket.addEventListener(
        'close',
        () =>
          this._fail(
            'network',
            'The connection to the speech service closed unexpectedly.'
          ),
        { signal }
      );
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

          // If the connection stops, the socket stays open and the buffer grows.
          if (socket.bufferedAmount + event.data.size > maxBufferedAmount) {
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

      recorder.start(this._options.timeslice ?? DEFAULT_TIMESLICE);
      listener.onStart();
    } catch (error) {
      // An abort during the start already removed the session.
      if (this._listener === listener) {
        this._teardown();
      }
      throw toProviderError(error);
    }
  }

  public stop(): void {
    // The last chunk comes in `dataavailable`, before the `stop` event.
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

      // `settled.abort()` removes all the listeners below.
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
    if (!isString(event.data)) {
      return;
    }

    let message: WebSocketSpeechToTextServerMessage;

    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (message?.type) {
      case 'result': {
        const { transcript, isFinal, confidence, alternatives } = message;

        // The frame is not trusted. Ignore a result without a transcript, and
        // fields of the wrong type.
        if (isString(transcript)) {
          listener.onResult({
            transcript,
            isFinal: isFinal === true,
            confidence:
              typeof confidence === 'number' &&
              numberInRangeInclusive(confidence, 0, 1)
                ? confidence
                : undefined,
            alternatives: Array.isArray(alternatives)
              ? alternatives.filter(isString)
              : undefined,
          });
        }
        break;
      }
      case 'activity':
        listener.onActivity();
        break;
      case 'error':
        listener.onError({
          code: isSpeechToTextErrorCode(message.code)
            ? message.code
            : 'unknown',
          message: isString(message.message)
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
    this._endTimer.start(this._options.endTimeout ?? DEFAULT_END_TIMEOUT);
  }

  private _fail(code: SpeechToTextErrorCode, message: string): void {
    this._listener?.onError({ code, message });
    this._finish();
  }

  private _teardown(): void {
    this._endTimer.stop();

    // Remove the listeners first, so that the `stop` and `close` events of the
    // teardown do not call the provider again.
    this._abort.abort();

    stopRecorder(this._recorder);
    stopTracks(this._stream);
    // `close()` does nothing on a socket that closes or is closed.
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

    // Without a recorder, `start()` did not resolve. It rejects instead.
    const started = this._recorder !== undefined;
    this._teardown();

    if (started) {
      listener.onEnd();
    }
  }

  //#endregion
}
