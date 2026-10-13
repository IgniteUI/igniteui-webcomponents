# Speech to text specification

- [Speech to text specification](#speech-to-text-specification)
  - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Key features](#key-features)
    - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Developer experience](#developer-experience)
      - [Basic initialization](#basic-initialization)
      - [Providers](#providers)
      - [Session lifecycle](#session-lifecycle)
      - [Events and programmatic control](#events-and-programmatic-control)
      - [Silence timeout](#silence-timeout)
      - [Custom trigger content](#custom-trigger-content)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom properties](#css-custom-properties)
    - [Custom states](#custom-states)
  - [Test scenarios](#test-scenarios)
    - [Rendering and defaults](#rendering-and-defaults)
    - [Unsupported provider](#unsupported-provider)
    - [Session lifecycle](#session-lifecycle-1)
    - [Results](#results)
    - [Errors](#errors)
    - [Silence timeout](#silence-timeout-1)
    - [User interaction](#user-interaction)
    - [Host ARIA](#host-aria)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-10-13 | Initial specification |

## Overview

The `igc-speech-to-text` is a button that turns speech into text. Pressing it starts a recognition session; the
recognized text arrives through events, and the session ends when the user presses the button again, when the
speech stops for a set time, or when the provider ends it. Recognition is delegated to a provider, so the same
component works with the Web Speech API of the browser or with a recognition service of the application.

```html
<igc-speech-to-text locale="en-US" interim-results></igc-speech-to-text>
```

### Key features

- **One-button voice input**, which toggles a recognition session.
- **Interim and final results**, through `igcInterim` and `igcResult`, and the full transcript in `igcEnd`.
- **Pluggable providers**: the Web Speech API by default, a WebSocket provider in `igniteui-webcomponents/extras`,
  and any object that implements `SpeechToTextProvider`.
- **A silence timeout**, which stops the session after a period without speech.
- **Escape aborts** the active session.
- **Status announcements** for assistive technology: listening, stopped, and a localized message for each error.
- **Custom trigger content** through the default slot.

### Acceptance criteria

- The component must start a recognition session on activation and stop it on a second activation.
- It must report interim results only when asked to, and final results always.
- It must report the end of a session with the full transcript and the reason.
- It must render disabled where its provider cannot run.
- It must let the application replace the recognition backend.
- It must announce its state changes and its errors to assistive technology, in the active locale.
- The element must be integrated with the theming mechanism of the library and be WAI-ARIA compliant.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- dictate text instead of typing it;
- see the text appear while I speak;
- stop the dictation with the same button, or let it stop when I stop speaking;
- cancel the dictation with <kbd>Escape</kbd>;
- hear from my screen reader whether the dictation listens, stopped or failed.

### Developer stories

As a developer, I expect to be able to:

- add voice input next to a text field with one element;
- receive interim and final transcripts as events;
- choose the language of the speech;
- use my own recognition service where the browser has no speech API;
- start, stop and abort a session from code;
- localize the labels and the announcements of the component.

## Functionality

### End-user experience

The component is an icon button with a microphone icon. While it listens, a ring pulses around the button; with
reduced motion the ring stays visible without the animation. Where the provider cannot run, the button is disabled
and its label explains why. There is no design hand-off link for the component.

### Developer experience

#### Basic initialization

```html
<igc-speech-to-text continuous interim-results silence-timeout="5000"></igc-speech-to-text>
```

```ts
const stt = document.querySelector('igc-speech-to-text')!;
stt.addEventListener('igcResult', ({ detail }) => console.log(detail.transcript));
stt.addEventListener('igcEnd', ({ detail }) => console.log(detail.transcript, detail.reason));
```

The `locale` of the component is the language of the speech. Without an explicit `locale`, the component uses the
global locale of the library.

#### Providers

Without a `provider`, the component uses `WebSpeechProvider`, which wraps the `SpeechRecognition` interface of the
Web Speech API. The provider adds the likely region to a language tag without one (`en` becomes `en-US`), because
the speech service of Edge fails for a tag without a region. It always requests interim results from the
recognizer, because they are the only sign of speech between the start of an utterance and its final result; when
the component does not want them, the provider reports them as activity, which resets the silence timeout.

`WebSocketSpeechToTextProvider` from `igniteui-webcomponents/extras` records the microphone with `MediaRecorder`
and streams the audio to a WebSocket endpoint. The wire protocol is described in
[speech-to-text-websocket-protocol.md](../../extras/speech-to-text-websocket-protocol.md). The provider checks the
type of each field of a `result` frame, because the frames are untrusted.

```ts
import { WebSocketSpeechToTextProvider } from 'igniteui-webcomponents/extras';

stt.provider = new WebSocketSpeechToTextProvider({ url: 'wss://example.com/transcribe' });
```

A custom provider implements `SpeechToTextProvider`:

- `start(options, listener)` resolves once the provider listens, and rejects, preferably with a
  `SpeechToTextProviderError`, when it cannot start. The component treats the session as listening when the
  provider calls `listener.onStart()` or when `start()` resolves, whichever comes first.
- An `abort()` before the provider listens should make `start()` reject. The component waits in `stopping` until
  `start()` settles. If `start()` resolves after the abort, the component aborts the provider again.
- After the provider listens, it calls `listener.onEnd()` exactly once.
- `listener.onActivity()` reports speech that has no result yet, and resets the silence timeout.

Changing `provider` while a session is active aborts the session at once. A session that `start()` opened with the
new provider in the same task is kept.

#### Session lifecycle

| State       | Meaning                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `idle`      | Nothing is captured.                                                                            |
| `starting`  | The provider is starting; the microphone permission prompt may be open.                        |
| `listening` | Audio is captured and transcribed.                                                              |
| `stopping`  | The provider delivers its remaining final results, or settles a start that was aborted.        |

A stop while `starting` aborts the session, because nothing is captured yet. A stop while `stopping` does nothing,
so a repeated stop does not discard the pending results; an abort cuts a stop short. Disabling the component,
removing it from the DOM and changing the provider abort the active session.

The `igcEnd` event is emitted only for a session that listened, and carries the reason:

| Reason     | Cause                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------- |
| `manual`   | `stop()` or `abort()` was called, or the user toggled the button or pressed Escape.      |
| `silence`  | No speech was detected for the duration of `silenceTimeout`.                              |
| `error`    | The provider reported an error and ended before it delivered another result.              |
| `provider` | The provider ended on its own, for example after a single utterance, or after it recovered from an error. |

#### Events and programmatic control

Events report what the user, the provider and the silence timeout do. A method call or a property change does not
emit an event for the state that it sets itself:

- A click on the button and <kbd>Escape</kbd> emit `igcStateChange` for each state change of the session.
- `start()`, `stop()`, `abort()`, `toggle()`, and changes of `disabled` and `provider` do not emit `igcStateChange`
  for the `starting` or `stopping` state they set. `start()` emits nothing when the component is disabled, busy, or
  its provider cannot run; read `supported` first.
- The provider callbacks emit their events in every session: `igcStateChange` for `listening` and `idle`,
  `igcStart`, `igcInterim`, `igcResult`, `igcError` and `igcEnd`. Thus a session started from code still reports its
  results and its end.

#### Silence timeout

`silenceTimeout` stops the session gracefully after the given number of milliseconds without speech activity.
Results and the activity reports of the provider restart the timeout. Zero, a negative value, or a value that is not
a finite number disables it. A value above 2147483647, the longest delay `setTimeout` accepts, is capped to that
value. `maxAlternatives` is at least 1.

#### Custom trigger content

The default slot replaces the microphone icon:

```html
<igc-speech-to-text>
  <igc-icon name="record_voice_over"></igc-icon>
</igc-speech-to-text>
```

### Localization

`igniteui-i18n-core` has no strings for the component yet, so it declares its own: `SpeechToTextResourceStringsEN`
and `ISpeechToTextResourceStrings`, exported from the package. Register a translation under the same keys with
`registerI18n()`, or set `resourceStrings` on the component.

| Key                                           | Default English value                         | Used for                                             |
| --------------------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `speech_to_text_start`                        | Start voice input                             | The label of the button while idle.                  |
| `speech_to_text_stop`                         | Stop voice input                              | The label of the button while a session is active.   |
| `speech_to_text_unsupported`                  | Voice input is not supported in this browser  | The label of the button when the provider cannot run. |
| `speech_to_text_listening`                    | Listening                                     | Announced when listening starts.                     |
| `speech_to_text_stopped`                      | Voice input stopped                           | Announced when listening stops.                      |
| `speech_to_text_error`                        | Voice input failed                            | Announced for `not-supported`, `aborted` and `unknown`. |
| `speech_to_text_error_not_allowed`            | Voice input is not allowed                    | Announced for `not-allowed` and `service-not-allowed`. |
| `speech_to_text_error_no_speech`              | No speech was detected                        | Announced for `no-speech`.                           |
| `speech_to_text_error_audio_capture`          | The microphone is not available               | Announced for `audio-capture`.                       |
| `speech_to_text_error_network`                | The speech service is not reachable           | Announced for `network`.                             |
| `speech_to_text_error_language_not_supported` | The language of the speech is not supported   | Announced for `language-not-supported`.              |

The `message` of an `igcError` comes from the provider and is not localized; the announcement uses the string of
the error code instead.

### Keyboard interactions

| Keys                                | Context                   | Description                                         |
| ----------------------------------- | ------------------------- | --------------------------------------------------- |
| <kbd>Tab</kbd>                      | anywhere                  | Moves the focus to the button.                      |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | button                    | Starts a session, or stops the active one.          |
| <kbd>Escape</kbd>                   | a session is active       | Aborts the session and discards pending results.    |

## API

### Properties and attributes

| Property          | Attribute          | Reflected | Type                                    | Default  | Description |
| ----------------- | ------------------ | --------- | --------------------------------------- | -------- | ----------- |
| `continuous`      | `continuous`       | yes       | `boolean`                               | `false`  | Whether the session continues after the first utterance until it is stopped. |
| `interimResults`  | `interim-results`  | yes       | `boolean`                               | `false`  | Whether `igcInterim` reports interim results while the user speaks. |
| `maxAlternatives` | `max-alternatives` | no        | `number`                                | `1`      | The maximum number of alternative transcripts in a final result. The minimum is 1. |
| `silenceTimeout`  | `silence-timeout`  | no        | `number`                                | `0`      | The time in milliseconds without speech after which the session stops. Zero, a negative value, or a value that is not a finite number disables the timeout. |
| `disabled`        | `disabled`         | yes       | `boolean`                               | `false`  | Whether the component is disabled. A change to `true` aborts the active session. |
| `variant`         | `variant`          | yes       | `"contained" \| "flat" \| "outlined"`   | `"flat"` | The variant of the trigger button. |
| `provider`        | —                  | —         | `SpeechToTextProvider \| undefined`     | —        | The recognition provider. The default provider uses the Web Speech API. A change of the provider aborts the active session. |
| `locale`          | `locale`           | no        | `string`                                | —        | The locale for the resource strings. Falls back to the global locale. |
| `resourceStrings` | —                  | —         | `ISpeechToTextResourceStrings`          | —        | The resource strings of the component. |
| `state`           | —                  | —         | `SpeechToTextState`                     | `"idle"` | Read-only. The lifecycle state of the component. |
| `transcript`      | —                  | —         | `string`                                | `""`     | Read-only. The final transcript of the current or the last session. |
| `supported`       | —                  | —         | `boolean`                               | —        | Read-only. Whether the active provider can run in the current environment. |

The static `IgcSpeechToTextComponent.isSupported` getter tells whether the default provider, the Web Speech API of
the browser, is available.

### Methods

| Method     | Returns         | Description |
| ---------- | --------------- | ----------- |
| `start()`  | `Promise<void>` | Starts a recognition session. Does nothing while a session is active, when the component is disabled, or when the provider cannot run in the current environment. |
| `stop()`   | `void`          | Stops the audio capture. The provider sends its remaining final results, then `igcEnd` is emitted. A session that is starting is aborted. |
| `abort()`  | `void`          | Ends the session immediately and discards the results that the provider did not send yet. |
| `toggle()` | `Promise<void>` | Starts a session when the component is idle. Stops an active session, or aborts a session that is starting. Does nothing while a session stops, so that a second stop does not discard the pending results. |

### Events

| Event            | Detail                        | Cancelable | Description |
| ---------------- | ----------------------------- | ---------- | ----------- |
| `igcStart`       | —                             | no         | Emitted when the provider starts to listen. |
| `igcInterim`     | `SpeechToTextResultEventArgs` | no         | Emitted with an interim result while the user speaks. Requires `interimResults`. |
| `igcResult`      | `SpeechToTextResultEventArgs` | no         | Emitted with each final result. |
| `igcEnd`         | `SpeechToTextEndEventArgs`    | no         | Emitted when a session that listened ends. Contains the full transcript and the reason. |
| `igcError`       | `SpeechToTextErrorEventArgs`  | no         | Emitted when the provider reports an error or cannot start. |
| `igcStateChange` | `SpeechToTextState`           | no         | Emitted when the user, the provider or the silence timeout changes the lifecycle state. Method calls and property changes do not emit it. |

### Slots

| Name    | Description                                                                 |
| ------- | --------------------------------------------------------------------------- |
| default | Custom content of the trigger button. Replaces the default microphone icon. |

### CSS Shadow parts

| Part        | Description                                                   |
| ----------- | ------------------------------------------------------------- |
| `button`    | The trigger button.                                           |
| `indicator` | The ring that pulses around the button while the component listens. |

### CSS custom properties

| Property            | Description                          |
| ------------------- | ------------------------------------ |
| `--indicator-color` | The color of the listening indicator. |

### Custom states

The host matches `:state(idle)`, `:state(starting)`, `:state(listening)` and `:state(stopping)` for the lifecycle
state, and `:state(unsupported)` when the provider cannot run.

## Test scenarios

| Suite                           | File                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Speech to text`                | [`speech-to-text.spec.ts`](./speech-to-text.spec.ts)                                                   |
| `WebSpeechProvider`             | [`providers/web-speech.spec.ts`](./providers/web-speech.spec.ts)                                       |
| `WebSocketSpeechToTextProvider` | [`speech-to-text-websocket-provider.spec.ts`](../../extras/speech-to-text-websocket-provider.spec.ts) |

The provider suites test each provider on its own:

- [`web-speech.spec.ts`](./providers/web-speech.spec.ts) covers `WebSpeechProvider` against a mock recognizer:
  support detection, the recognition options and the regional language tag, rejections before the start, error
  mapping, final, interim and activity reports, interim results reported as activity when they are not wanted,
  stop, abort and a restart.
- [`speech-to-text-websocket-provider.spec.ts`](../../extras/speech-to-text-websocket-provider.spec.ts) covers
  `WebSocketSpeechToTextProvider` against a mock socket and recorder: support detection, the `start` message, the
  audio frames and the send buffer limit, the server messages and the type checks of `result` fields, the close and
  error handling, stop, abort, rejections and a restart.

The component suite runs against a fake provider. The groups below mirror its `describe` blocks.

### Rendering and defaults

1. The component passes the accessibility audit while idle and while listening.
2. The component is initialized with its default values and the `idle` state.
3. The button renders the default microphone icon, hidden from assistive technology, and the start label.
4. `variant` is forwarded to the button, and `disabled` disables it.
5. Slotted content replaces the default icon.
6. Custom resource strings change the label of the button.

### Unsupported provider

7. An unsupported provider renders a disabled button with the unsupported label.
8. `start()` does nothing and emits no event.

### Session lifecycle

9. `start()` reaches `listening` and emits only the `listening` state change and `igcStart`.
10. A provider that resolves `start()` without `onStart()` still reaches `listening`, with one `igcStart`.
11. While listening, the button shows the stop label, the native button follows it, and the status announces
    listening.
12. The recognition options are passed to the provider: `locale` (or the global locale), `continuous`,
    `interimResults`, and `maxAlternatives`, which is at least 1.
13. `start()` is ignored while a session is active and while the component is disabled.
14. `stop()` emits the `idle` state change and `igcEnd` with the transcript, and announces the stop.
15. The component stays in `stopping` until the provider ends; a second stop does nothing, and an abort cuts the
    stop short.
16. A state change handler that stops the session prevents `igcStart`, and one that starts a new session does not
    lose the `igcEnd` of the old one.
17. `abort()` ends an active session with reason `manual`.
18. An abort while starting waits in `stopping` until the provider settles, ignores the late callbacks of the
    aborted session, and accepts a new session only afterwards.
19. A handler of the `starting` state change that aborts prevents the start of the provider, and a new session
    started after an abort is not ended by the old one.
20. A provider that starts after an abort is aborted again, and no `igcStart` or `igcEnd` is emitted.
21. A session the provider ends on its own reports reason `provider`, and the next session resets the transcript.
22. `toggle()` switches between `idle` and `listening`.
23. A provider change aborts the active session, but keeps a session that `start()` opened with the new provider in
    the same task.
24. Disabling the component aborts the active session without the `stopping` state change.
25. Removing the component from the DOM aborts the session.

### Results

26. `igcResult` is emitted for final results only, and its transcript is added to `transcript`.
27. `igcInterim` is emitted when `interimResults` is set.
28. Empty final results are left out of the transcript.

### Errors

29. A provider error emits `igcError`, announces the localized message of the network error, and the end that
    follows has reason `error`.
30. Each error code is announced with its localized string, and custom resource strings replace them.
31. A repeated error is announced again, through a new text node in the live region.
32. A result after an error makes the end reason `provider` and announces the stop.
33. A failed start emits `igcError` before the `idle` state change and no `igcEnd`, and an unknown failure maps to
    code `unknown`.

### Silence timeout

34. The session stops after the timeout with reason `silence`, and results and activity restart the timeout.
35. Zero, and a value that is not a finite number, arm no timeout.
36. A timeout above the limit of `setTimeout` is capped to the limit.
37. A change of the timeout applies while listening, and a manual stop cancels it.

### User interaction

38. A click toggles the session, and emits every state change, `igcStart` and `igcEnd`.
39. A click while starting aborts the session, and a click while stopping does nothing.
40. <kbd>Escape</kbd> aborts the session while starting and while listening, and does nothing while idle.

### Host ARIA

41. The shared `runHostAriaTests` suite, on the native button, with the start label as the fallback name: the host
    `aria-label`, `aria-labelledby` and `aria-describedby` reach the native button and follow a change, and an axe
    audit passes with a host label.

### Not covered by the suite

- Recognition in a real browser: the suites use a fake provider, a mock recognizer and a mock socket.
- The static `isSupported` getter of the component.
- The indicator animation, the reduced motion and the forced colors styles.
- What a screen reader speaks; the suite checks the live region, not the speech output.

## Assumptions and limitations

- The Web Speech API is not available in Firefox and Firefox-based browsers unless the
  `media.webspeech.recognition.enable` preference is set, so the component renders disabled there without a custom
  provider.
- Most browsers send the audio of the Web Speech API to a remote service, so recognition needs a network
  connection. Edge has had outages of that service, which show as `network` errors.
- The transcript joins the final segments with a space, which does not suit languages written without spaces.
- A provider whose `start()` never settles keeps the component in `starting`, or in `stopping` after an abort.
- With a host `aria-label` or `aria-labelledby`, the button keeps that name in every state; the live region reports
  the state changes.
- `igniteui-theming` has no schema for the component yet. `--indicator-color` defaults to the primary color, and the
  button follows the theme of the icon button.

## Accessibility

### ARIA roles and properties

- The trigger is a native button inside the icon button. Its name is the start, stop or unsupported label, or the
  host `aria-labelledby` or `aria-label` when set. The host `aria-describedby` describes it.
- The default microphone icon and the indicator are hidden from assistive technology.
- A visually hidden element with `role="status"` and `aria-live="polite"` announces when listening starts and
  stops, and a localized message for each error. A repeated message is announced again.
- The button is disabled while the component is disabled or its provider cannot run.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
