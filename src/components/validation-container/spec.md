# Validation container specification

- [Validation container specification](#validation-container-specification)
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
      - [Creating a container](#creating-a-container)
      - [Validation slots](#validation-slots)
      - [The invalid slot](#the-invalid-slot)
      - [Helper text replacement](#helper-text-replacement)
      - [Pointer presses](#pointer-presses)
      - [Reserved message lines](#reserved-message-lines)
      - [Examples](#examples)
    - [Validation mapping table](#validation-mapping-table)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom properties](#css-custom-properties)
  - [Test scenarios](#test-scenarios)
    - [Rendering and projection](#rendering-and-projection)
    - [create()](#create)
    - [Pointer press](#pointer-press)
    - [Reserved message lines](#reserved-message-lines-1)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |
|       2 | 2026-10-22 | Pointer presses, reserved message lines |

## Overview

The `igc-validator` component is an **internal** element that implements the declarative validation message
mechanism shared by every form-associated component in the library. It is never registered or instantiated by
application code directly - a host control creates one inside its own shadow DOM through the static
`IgcValidationContainerComponent.create` method.

The container observes the validity state of its host, projects the error messages the developer slotted for the
failing constraints, and falls back to the host's helper text once the control is valid again. Because the logic
lives in a single element, every form-associated component in the library exposes the same slot names, the same
parts and the same behavior.

### Key features

- **Declarative error messages**: developers slot a message per validity flag; the container decides what is shown.
- **Catch-all slot**: an `invalid` slot renders whenever the host is invalid, regardless of which constraint failed.
- **Helper text swap**: slotted helper text is replaced by the active error messages while the host is invalid, and
  restored when it becomes valid. The swap only happens when error messages are actually slotted.
- **Form pipeline integration**: reacts to user interaction, form submission and form reset through internal events
  emitted by the form-associated mixins.
- **Stable clicks**: while the user presses the pointer, a message does not show or go away, so the element under
  the pointer does not move before the release.
- **Reserved message lines**: `--ig-helper-min-lines` keeps space for messages before they show.
- **SSR-safe**: renders nothing on the server and during hydration, then projects the slots on the first client update.
- **Themeable**: uses the input themes of the library and exposes shadow parts for the message, the icon and the wrapper.

### Acceptance criteria

- Provide a declarative way to define and customize validation messages based on the applied validation constraints.
- Expose a distinct slot for each category of validation error for granular control.
- Expose a catch-all slot that renders on any invalid state of the host.
- Replace slotted helper text with the slotted error message(s) while the host is invalid, and switch back when the
  host becomes valid. This must not trigger when no error messages are slotted.
- Integrate with the established validation pipeline of form-associated components, so that it works with user
  interaction, form submit and form reset.
- Integrate with the default look and feel of the library while allowing customization through shadow parts.
- Be accessible by default, without additional configuration.
- Render only the error slots whose constraint is currently failing.

## User stories

### End-user stories

As an end-user, I expect to:

- have a visual indication when a form input fails its validity constraints.
- be told why the input failed validation and what is expected of me to make it valid and submit the form.
- have the error message announced by my screen reader when it appears.

### Developer stories

As a developer, I expect to be able to:

- slot different error messages based on the active invalid flags of a component, in order to guide end-users and
  prevent the submission of invalid data.
- slot a single error message based on the invalid state of the control, regardless of which flag is set.
- do both of the above declaratively, in markup.
- have both a description (helper text) and error messages in the same component, where the errors are shown while
  the component is invalid and the description is shown again once it is valid.
- style the message, the icon and the wrapper through shadow parts exported by the host component.
- add the container to a new form-associated component with a single call inside the host template.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/design/IZce3C3yRofmIqPzq634uQ/Input-Group%2C-Checkbox%2C-Radio%3A-validation-proposal?m=auto&node-id=2043-3&t=GExqKFPDIGlTcEs2-1)

When a control becomes invalid, the area under it switches from the helper text to the error message(s) for the
failing constraints. Each message is prefixed with an error icon. When several constraints fail at the same time,
all of the corresponding slotted messages are rendered, in a stable order. The region is announced politely, so a
screen reader reads the message when it appears without interrupting the user.

### Developer experience

#### Creating a container

The host component calls the static `create` method inside its own template:

```ts
protected override render() {
  return html`
    ...
    ${IgcValidationContainerComponent.create(this)}
  `;
}
```

The call accepts an optional configuration object:

```ts
IgcValidationContainerComponent.create(host, {
  // The `id` attribute bound to the igc-validator element.
  id: 'helper-text',
  // Additional part(s) bound to the igc-validator element.
  part: 'validation',
  // Where to project the igc-validator element in more advanced DOM structures.
  slot: 'helper-text',
  // Whether the igc-validator should expose a helper-text slot.
  hasHelperText: true,
});
```

The default configuration is `{ id: 'helper-text', hasHelperText: true }`.

The returned template binds the host as the container's `target`, mirrors the host `invalid` state and re-exports
the `helper-text`, `validation-message` and `validation-icon` parts, so the host does not need to forward them.
The container hooks itself to the host and handles dynamic slot changes on its own.

#### Validation slots

The container creates one slot per failing validity flag. A message slotted into one of those slots is rendered only
when the host is in invalid state **and** the matching constraint is applied. For example, content slotted in the
`value-missing` slot of an `igc-input` is not shown unless the input has the `required` attribute and is invalid.

#### The invalid slot

Every form-associated element with a validation container also exposes an `invalid` slot. It is a catch-all for the
invalid state of the component: it renders whenever the host is invalid, regardless of which validation flag failed.
Use it when a single generic message is preferable to granular ones.

#### Helper text replacement

When both a helper text and at least one matching error message are slotted, the helper text is replaced by the error
message(s) while the host is invalid. When no error message is slotted for the current state, the helper text stays
visible.

#### Pointer presses

The `mousedown` of a press moves the focus, and a host that validates on blur can then show or hide a message. That
moves the content below the host. The browser sends `click` to the common ancestor of the `mousedown` and `mouseup`
targets, so a press on a button that moved before the release does not click the button.

While the primary button of a real pointer is down, the container does not update. It updates in the task after the
release, when the `click` of the press has gone out. Synthetic pointer events from scripts do not hold an update. A
host render in a press keeps the message slots that the host forwarded before, so a held message keeps its content,
and the host renders again after the release. The first render of the container cannot read its projected slots, so
the render after it, which can, is not held: a control that is created in a press does not show an empty line.

The press tracking lives in `#internals/pointer-press.js`: `trackPointerPress()` starts it, `isPointerPressed()`
tells whether a press is in progress, and `afterPointerPress(callback)` queues a callback for the end of the current
press. A press also ends when the window loses the focus, on a key press, or when the pointer moves with no button
down, so a release that the page does not get cannot hold the container. The release is a `MessageChannel` message,
not a timeout, so fake timers in the tests of an application do not hold it.

#### Reserved message lines

`--ig-helper-min-lines` sets the minimum number of message lines below the host: `1`, `2` or `3`. The `helper-text`
wrapper gets a minimum block size: that many lines of its text, or the size of the small error icon (`--ig-icon-size`
when it is set), whichever is larger. The wrapper keeps the margin, type style and display of its theme, so it is as
tall as a message of that many lines, and its content stays at the top. A message of more lines makes it taller.

An empty wrapper is absolutely positioned and hidden, so it takes no space. With reserved lines, it stays in the
flow, and an empty `::before` gives a grid wrapper one row, so that the minimum row height of the theme applies as it
does to a message. A container style query turns this on only for the values `1`, `2` and `3`, so other values, such
as `0px`, `-1` or `calc(0)`, keep no space. A browser without container style queries keeps no space.

The variable is inherited. The shared component styles set it to `0` on the form controls inside the shadow root of
a component, for example the input of the combo, which then reserve no space of their own. The tree item does not
adopt those styles, so it sets the variable on its checkbox. A radio group shows its message on its last radio, so it
sets the variable to `0` on its other radios.

```css
form {
  --ig-helper-min-lines: 1;
}
```

#### Examples

No slotted errors and no slotted description:

```html
<igc-input label="Input" required></igc-input>
```

Nothing extra is rendered, in either state.

Description (helper text) with no slotted errors:

```html
<igc-input label="Input" required>
  <p slot="helper-text">...</p>
</igc-input>
```

The description stays visible while the input is invalid, because there are no slotted error messages.

Description and errors:

```html
<igc-input label="Input" required>
  <p slot="helper-text">...</p>
  <p slot="value-missing">This field is required</p>
</igc-input>
```

While the input is invalid the description is replaced by the content of the matching error slot. Once the constraint
is satisfied, the description is shown again.

Multiple error slots:

```html
<igc-input label="Input" type="email" minlength="8">
  <p slot="type-mismatch">A valid email address is required</p>
  <p slot="too-short">The provided email address is too short</p>
</igc-input>
```

Multiple error slots with `required`:

```html
<igc-input label="Input" type="email" minlength="8" required>
  <p slot="value-missing">This field is required</p>
  <p slot="type-mismatch">A valid email address is required</p>
  <p slot="too-short">The provided email address is too short</p>
</igc-input>
```

Following standard browser behavior, when `valueMissing` is set in the validity state, all other states except
`customError` are discarded. Only the `value-missing` slot is shown until the constraint is satisfied.

Custom error slot:

```html
<igc-input label="Input" type="email" minlength="8" required>
  <p slot="custom-error">...</p>
  <p slot="value-missing">This field is required</p>
  <p slot="type-mismatch">A valid email address is required</p>
  <p slot="too-short">The provided email address is too short</p>
</igc-input>
```

When a custom error is set through `setCustomValidity(message)`, the state and the slot persist until the developer
calls `setCustomValidity('')`.

Catch-all slot:

```html
<igc-input label="Input" type="email" minlength="8" required>
  <p slot="invalid">The provided value does not satisfy the input constraints!</p>
</igc-input>
```

### Validation mapping table

The following table maps validity state keys to the slot names that render an error message when the associated key
is present in the validity state of the host.

| ValidityState key | Slot name          | Validator attribute/property | Library components                                                                                                                         |
| ----------------- | ------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `badInput`        | `bad-input`        | -                            | `igc-mask-input`, `igc-date-time-input`, `igc-date-picker`, `igc-date-range-picker`                                                        |
| `customError`     | `custom-error`     | -                            | All form-associated components                                                                                                             |
| `patternMismatch` | `pattern-mismatch` | `pattern`                    | All text-based `igc-input` types, `igc-textarea`                                                                                           |
| `rangeOverflow`   | `range-overflow`   | `max`                        | `igc-input[type="number"]`, `igc-date-time-input`, `igc-date-picker`, `igc-date-range-picker`                                              |
| `rangeUnderflow`  | `range-underflow`  | `min`                        | `igc-input[type="number"]`, `igc-date-time-input`, `igc-date-picker`, `igc-date-range-picker`                                              |
| `stepMismatch`    | `step-mismatch`    | `step`                       | `igc-input[type="number"]`                                                                                                                 |
| `tooLong`         | `too-long`         | `maxlength`                  | All text-based `igc-input` types, `igc-textarea`                                                                                           |
| `tooShort`        | `too-short`        | `minlength`                  | All text-based `igc-input` types, `igc-textarea`                                                                                           |
| `typeMismatch`    | `type-mismatch`    | -                            | `igc-input[type="email"]`, `igc-input[type="url"]`                                                                                         |
| `valueMissing`    | `value-missing`    | `required`                   | All form-associated components                                                                                                             |
| `!valid`          | `invalid`          | -                            | All form-associated components                                                                                                             |

The container renders the `invalid` slot first, followed by the failing constraint slots in the fixed order of the
table above, so the output is deterministic across browsers.

### Localization

None applicable. The container renders only developer-provided content; no built-in strings are exposed.

### Keyboard interactions

None applicable. The container is not focusable and has no interactive elements.

## API

### Properties and attributes

| Property | Attribute | Reflected | Type              | Default | Description                                                                 |
| -------- | --------- | --------- | ----------------- | ------- | --------------------------------------------------------------------------- |
| invalid  | invalid   | No        | `boolean`         | false   | Whether the container is in invalid state. Mirrored from the target control. |
| target   | -         | No        | `IgcFormControl`  | -       | The form control whose validity state is rendered.                          |

`target` must be set before the first update for SSR compatibility. The `create` method sets it automatically.

### Methods

| Name   | Type signature                                                                  | Description                                                                             |
| ------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| create | `(host: IgcFormControl, config?: ValidationContainerConfig): TemplateResult`    | Static. Creates the template for a validation container bound to the given host control. |

```typescript
interface ValidationContainerConfig {
  /** The id attribute for the validation container. */
  id?: string;
  /** Project the validation container to the given slot inside the host shadow DOM. */
  slot?: string;
  /** Additional part(s) that should be bound to the validation container. */
  part?: string;
  /** Whether the validation container should expose a helper-text slot. */
  hasHelperText?: boolean;
}
```

### Events

The component emits no public events. It listens for two internal events dispatched by the form-associated mixins of
its target:

| Internal event              | Effect                                            |
| --------------------------- | ------------------------------------------------- |
| `igc-form-internal-invalid` | Puts the container in invalid state and re-renders. |
| `igc-form-internal-reset`   | Clears the invalid state and re-renders.          |

### Slots

| Name               | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| `helper-text`      | Renders content below the host control. Exposed only when `hasHelperText` is `true`.    |
| `invalid`          | Renders content when the host is in invalid state, for any failing constraint.          |
| `bad-input`        | Renders content when the `badInput` validity flag is set.                               |
| `custom-error`     | Renders content when the `customError` validity flag is set.                            |
| `pattern-mismatch` | Renders content when the `patternMismatch` validity flag is set.                        |
| `range-overflow`   | Renders content when the `rangeOverflow` validity flag is set.                          |
| `range-underflow`  | Renders content when the `rangeUnderflow` validity flag is set.                         |
| `step-mismatch`    | Renders content when the `stepMismatch` validity flag is set.                           |
| `too-long`         | Renders content when the `tooLong` validity flag is set.                                |
| `too-short`        | Renders content when the `tooShort` validity flag is set.                               |
| `type-mismatch`    | Renders content when the `typeMismatch` validity flag is set.                           |
| `value-missing`    | Renders content when the `valueMissing` validity flag is set.                           |

### CSS Shadow parts

| Part                 | Description                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| `helper-text`        | The base wrapper of the container. Carries the `empty` part when nothing is projected. |
| `validation-message` | A validation error message container. Carries the `empty` part when its slot has no content. |
| `validation-icon`    | The error `igc-icon` element rendered next to a message.                      |

All three parts are re-exported by the created element, so a host component exposes them without extra configuration.

### CSS custom properties

| Property                | Description                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `--ig-helper-min-lines` | The minimum number of message lines below the host. Inherited from the host. Default is `0`. See [Reserved message lines](#reserved-message-lines). |

## Test scenarios

The suite lives in [`validation-container.spec.ts`](./validation-container.spec.ts). It runs in a real browser
through `@web/test-runner` with `@open-wc/testing` fixtures and assertions, and drives the container through a real
host control rather than in isolation, since the container is created by its host.

The container is additionally exercised from every form-associated component through
`runValidationContainerTests` in [`validity-helpers.spec.ts`](../../internals/testing/validity-helpers.spec.ts).
That runner projects a message into each slot of a control, forces the matching constraint to fail, and asserts
through `ValidityHelpers` that the control is invalid, carries the invalid styling, and that the slot exists and has
content. Components currently invoking it: `igc-input`, `igc-file-input`, `igc-mask-input`, `igc-textarea`,
`igc-checkbox`, `igc-radio`, `igc-select`, `igc-combo`, `igc-date-picker`, `igc-date-range-picker` and
`igc-date-time-input`.

The groups below mirror the `describe` blocks of the suite.

### Rendering and projection

1. The container does not render non-slotted content on error.
2. Non-slotted validation message slots do not override slotted helper text.
3. Slotted validation message slots override the slotted helper text when the host is invalid.
4. Validation messages survive a re-render after a failed form submission.
5. The container projects validation messages for a host that starts out invalid.

### create()

6. Projects a `helper-text` slot by default.
7. Does not project a `helper-text` slot when `hasHelperText` is `false`.
8. Applies the `id`, `slot` and `part` values from the configuration to the rendered element.

### Pointer press

The cases press a button below the host with a real pointer (`sendMouse`), with a rendered frame between down and up.

9. The click reaches the button when the host shows a two-line message on blur, and the message shows after the
   release.
10. The click reaches the button when the host hides a two-line message on blur.
11. A control that is created in a press has no empty message line before the release.

### Reserved message lines

12. No space is reserved by default.
13. With one and two reserved lines, the container is as tall as with a one-line and a two-line message, in each of
    the four themes.
14. Values other than `1`, `2` and `3`, such as `0.0`, `0px`, `-1`, `calc(1)` and `4`, reserve no space.
15. A one-line helper text stays at the top of two reserved lines in a checkbox.
16. In a radio group, only the last radio reserves lines.
17. A message that replaces the helper text keeps the height.
18. The form controls inside the combo, select, date picker, date range picker (both modes), color picker, chat and
    tree item reserve no space.

The press tracking has its own suite in [`pointer-press.spec.ts`](../../internals/pointer-press.spec.ts). It covers
the release after the `click`, fake timers and the end of a press on a key press.

### Not covered by the suite

There is no dedicated case for the reset path - `igc-form-internal-reset` clearing the invalid state - or for the
SSR and hydration behavior; both are exercised indirectly through the form reset cases of the host components.

The end of a press when the window loses the focus, or when the pointer moves with no button down, is not covered:
a test cannot make the browser lose a trusted release. A new press that clears the queued release of an earlier one
is not covered either, because `sendMouse` cannot start a press before that release runs. Browsers without container
style queries keep no space, and the suite runs in Chromium only.
## Accessibility

### ARIA roles and properties

- No intrinsic role is applied to the `igc-validator` element itself.
- The message wrapper carries `aria-live="polite"`, so new error messages are announced without interrupting the user.
- The error icon is decorative and carries `aria-hidden="true"`.
- An empty wrapper is hidden with `visibility: hidden`, also while it holds reserved lines, so it is not in the
  accessibility tree.
- Host components associate the container with their control, so the current message is announced as its
  description. An input-shaped host resolves the container element and projects it onto its native editor as an
  `aria-describedby` element reference, because an IDREF does not cross a shadow boundary. A host that renders
  the container in the same tree scope as its editor references it by `id` instead.

### Keyboard support

None applicable.

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
