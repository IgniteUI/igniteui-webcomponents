# Speech-to-text WebSocket protocol

This document describes the wire protocol between `WebSocketSpeechToTextProvider`
(exported from `igniteui-webcomponents/extras`) and a speech recognition service.
Implement the server side of this protocol to use `igc-speech-to-text` with a
recognition engine you control, or in browsers without the Web Speech API.

The provider captures the microphone with `MediaRecorder` and streams the encoded
audio over one WebSocket connection per recognition session. The server decodes the
audio, runs recognition and streams transcripts back.

## Transport

- One WebSocket connection per session. The provider opens the connection when a
  session starts and closes it when the session ends.
- Control messages are text frames that carry one JSON object each.
- Audio is sent as binary frames. The server never sends binary frames.
- The provider requests the WebSocket sub-protocols passed in its `protocols` option,
  if any. The protocol itself does not require a sub-protocol.

## Session lifecycle

```
Client                                    Server
  |-- WebSocket connect ------------------->|
  |<-- connection open ---------------------|
  |-- text: { "type": "start", ... } ------>|
  |-- binary: audio chunk ----------------->|
  |-- binary: audio chunk ----------------->|
  |<-- text: { "type": "result", "isFinal": false, ... }
  |-- binary: audio chunk ----------------->|
  |<-- text: { "type": "result", "isFinal": true, ... }
  |   ...                                   |
  |-- binary: last audio chunk ------------>|
  |-- text: { "type": "stop" } ------------>|
  |<-- text: { "type": "result", "isFinal": true, ... }   (flushed finals)
  |<-- text: { "type": "end" } -------------|
  |-- WebSocket close --------------------->|
```

1. The provider connects, then sends `start` as the first message.
2. Audio chunks follow as binary frames, one every `timeslice` milliseconds
   (250 by default), for as long as the microphone is recording.
3. The server sends `result` messages whenever it has an interim or a final transcript.
   It may send `activity` and `error` messages at any time.
4. When the user stops the session, the provider stops the recorder, sends the last
   audio chunk, then sends `stop`. No audio follows `stop`.
5. The server flushes its remaining final results and answers with `end`.
6. The provider closes the connection. If the server does not send `end` within
   `endTimeout` milliseconds (5000 by default) after `stop`, the provider ends the
   session locally and closes the connection.

If the connection fails, or if the server closes it before it sends `end`, the provider
reports a `network` error and ends the session. When the user aborts, the provider closes
the connection without sending `stop`; treat a connection closed before `stop` as an
aborted session.

## Client messages

### `start`

Sent once, before any audio. Carries the recognition options of the component and the
MIME type of the audio frames that follow.

```json
{
  "type": "start",
  "lang": "en-US",
  "continuous": true,
  "interimResults": true,
  "maxAlternatives": 1,
  "mimeType": "audio/webm;codecs=opus"
}
```

| Field             | Type    | Description |
| ----------------- | ------- | ----------- |
| `type`            | string  | Always `"start"`. |
| `lang`            | string  | BCP 47 language tag of the speech. Comes from the `locale` of the component and may lack a region (`"en"`). |
| `continuous`      | boolean | `true`: keep recognizing until `stop`. `false`: the server should send `end` after the first final result. |
| `interimResults`  | boolean | Whether the client wants `result` messages with `isFinal: false`. |
| `maxAlternatives` | number  | Maximum number of transcripts per final result, including the best one. At least 1. |
| `mimeType`        | string  | MIME type of the binary audio frames, as reported by `MediaRecorder`. Empty when the browser did not report one. |

### Audio frames

Binary frames contain the output of `MediaRecorder` in the announced `mimeType`. The
provider tries, in order, the `mimeType` from its options, then `audio/webm;codecs=opus`,
`audio/webm`, `audio/ogg;codecs=opus` and `audio/mp4`, and uses the first one the browser
supports.

The frames form one continuous container stream, not independent files. The container
header is in the first frame only, and a frame boundary does not align with a codec
frame. Feed the frames to a streaming decoder in order (for example a WebM or Ogg
demuxer followed by an Opus decoder) and resample the output to the rate the recognition
engine expects. Empty frames are not sent.

### `stop`

Sent after the last audio frame when the user stops the session. The server should flush
its final results and then send `end`.

```json
{ "type": "stop" }
```

## Server messages

### `result`

An interim or final transcript. Interim results describe the utterance in progress and
are replaced by later results for the same utterance. Final results are appended to the
transcript of the session by the component.

```json
{
  "type": "result",
  "transcript": "hello world",
  "isFinal": true,
  "confidence": 0.92,
  "alternatives": ["hello word"]
}
```

| Field          | Type     | Required | Description |
| -------------- | -------- | -------- | ----------- |
| `type`         | string   | yes      | Always `"result"`. |
| `transcript`   | string   | yes      | The recognized text. |
| `isFinal`      | boolean  | no       | `true` for a final result. Defaults to `false`. |
| `confidence`   | number   | no       | Confidence in `transcript`, between 0 and 1. |
| `alternatives` | string[] | no       | Other transcripts for the same utterance, most likely first, excluding `transcript`. Send at most `maxAlternatives - 1` entries. |

Do not send interim results when `interimResults` is `false`; the component drops them.

### `activity`

Reports that speech is detected in the audio before a transcript is available. The
component resets its `silenceTimeout` on every `result` and `activity` message. Send
`activity` while the user is speaking, for example from the voice activity detection of
the recognition engine, so that a long utterance is not stopped as silence. This matters
most when `interimResults` is `false` or when transcripts arrive with a delay.

```json
{ "type": "activity" }
```

### `error`

Reports a failure. The server may continue the session after a recoverable error, or
follow with `end`. The component emits the error as an `igcError` event.

```json
{ "type": "error", "code": "no-speech", "message": "No speech was detected." }
```

| Field     | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `type`    | string | yes      | Always `"error"`. |
| `code`    | string | no       | One of the codes below. Any other value maps to `unknown`. |
| `message` | string | no       | Human-readable description. A default message is used when omitted. |

Error codes, mirroring the Web Speech API:

| Code                     | Meaning |
| ------------------------ | ------- |
| `no-speech`              | No speech was detected. |
| `audio-capture`          | The audio could not be decoded or processed. |
| `network`                | The recognition backend could not be reached. |
| `aborted`                | The session was aborted by the server. |
| `language-not-supported` | The requested `lang` is not supported. |
| `service-not-allowed`    | The client is not allowed to use the service. |
| `not-allowed`            | The request was rejected, for example because of missing authorization. |
| `not-supported`          | The service cannot serve the session, for example because it does not support the announced `mimeType`. |
| `unknown`                | Any other failure. |

### `end`

Ends the session. Send it after the flushed final results that follow `stop`, after the
first final result when `continuous` is `false`, or after an unrecoverable `error`. The
provider closes the connection when it receives `end`; no further messages are processed.

```json
{ "type": "end" }
```

## Handling rules for servers

- Ignore binary frames received before `start` and text frames that are not valid JSON.
- Treat a connection closed before `stop` as an abort. Discard pending results.
- Send `end` exactly once, and send nothing after it. Close the connection only after
  `end`; the provider reports an earlier close as a `network` error.
- Keep `result` messages ordered. The component appends final transcripts in arrival order.
- Consume audio frames as they arrive; see the client rules below for a stalled connection.
- Authentication is outside this protocol. Use the WebSocket URL, sub-protocols or
  cookies as your service requires.

## Handling rules for the client

For reference, the provider behaves as follows:

- Drops audio frames while the socket is not open.
- Ignores text frames that are not valid JSON or have an unknown `type`, and `result`
  messages whose `transcript` is not a string. An `error` whose `message` is not a
  string is reported with a default message.
- Ends the session with a `network` error when the send buffer of the socket grows past
  `maxBufferedAmount` bytes (1 MiB by default), which happens when the connection or the
  server stops consuming audio while the socket stays open.
- Releases the microphone as soon as recording stops, before `stop` is sent.
