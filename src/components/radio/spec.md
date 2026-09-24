# Radio specification

- [Radio specification](#radio-specification)
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
      - [Grouping](#grouping)
      - [Label and label position](#label-and-label-position)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Validation](#validation)
      - [Form integration](#form-integration)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Rendering and properties](#rendering-and-properties)
    - [Interactions and events](#interactions-and-events)
    - [Form integration](#form-integration-1)
    - [defaultChecked](#defaultchecked)
    - [Group membership](#group-membership)
    - [Validation message slots](#validation-message-slots)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                      |
| ------: | ---------- | -------------------------------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                                                      |
|       2 | 2026-09-24 | Label external `label` elements and host ARIA, activate from a label click |

## Overview

The `igc-radio` component allows the end-user to select a single option from a set of options listed side by side.
It wraps a native radio input, adds a positionable label, theming and declarative validation messages, and
implements the grouping and keyboard behavior of a radio group.

Radios group by `name` and form owner. A group behaves as a single tab stop: the checked radio is the tab stop, and
the arrow keys move the selection between the members. Grouping works both inside an
[`igc-radio-group`](../radio-group/spec.md) and with plain markup.

### Key features

- **Single selection per group**: checking one radio unchecks its siblings.
- **Name-based grouping**: the group is derived from the `name` property and the form owner, and is kept in sync when
  either changes at run time.
- **Roving tab index**: a group is one tab stop; the arrow keys move and select within it.
- **Positionable label**: projected content rendered before or after the control.
- **Group-wide validation**: when any radio in a group is `required`, the group is invalid until one is checked, and
  the state is applied to every member.
- **Form integration**: the checked radio submits its value, and a form reset restores the default selection.
- **Themeable**: exposes shadow parts for the base wrapper, the control and the label.

### Acceptance criteria

- The component must render a radio control with a corresponding, positionable label.
- Only one radio in a group can be checked at a time.
- A group must be a single tab stop, and the arrow keys must move and select within it.
- Changing the `name` of a radio must move it to the matching group.
- The component must provide a way to be disabled and a way to be marked as required.
- A required radio must make its whole group invalid until a member is checked.
- The component must emit an event when its checked state changes through user interaction.
- The component must participate in form submission, reset and validation.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant.
- The component must support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- select a single option out of a set of related options.
- navigate between the options of a group with the keyboard and with the mouse.
- identify the currently focused option and the currently selected one.
- identify whether an option is disabled.
- identify the option I am selecting through a label or another visual aid.
- identify whether my selection is valid.

### Developer stories

As a developer, I expect to be able to:

- display a set of mutually exclusive options.
- name a radio, so it groups with the other radios of the same set and is identifiable in the form data.
- set the value of a radio, so I can associate a piece of information with it.
- specify which radio is checked initially.
- disable a radio, so the end-user cannot select it.
- place content between the tags of the component, so it is used as the corresponding label.
- position the label before or after the control.
- programmatically click, focus and blur a radio.
- listen for focus, blur and change events.
- mark the set as required and set a custom validation message.
- customize the appearance of the control.

## Functionality

### End-user experience

[Design hand-off - validation slots](https://www.figma.com/design/IZce3C3yRofmIqPzq634uQ/Input-Group%2C-Checkbox%2C-Radio%3A-validation-proposal?m=auto&node-id=2043-3&t=GExqKFPDIGlTcEs2-1)

Each radio renders a circular control with an optional label before or after it. Selecting a radio fills its inner
circle and clears the previously selected one in the same group. Clicking either the control or the label selects it.

The group is a single tab stop. <kbd>Tab</kbd> moves focus to the checked radio, or to the first enabled radio when
the group has no selection. The arrow keys move focus to the previous or next enabled radio and select it, wrapping
at the ends of the group. Disabled radios are skipped.

The focus ring is rendered only for keyboard interaction. Invalid styling applies after interaction or after a form
submission attempt, and is applied to the whole group.

### Developer experience

#### Basic initialization

```html
<igc-radio name="contact" value="email">Email</igc-radio>
<igc-radio name="contact" value="phone">Phone</igc-radio>
<igc-radio name="contact" value="mail">Mail</igc-radio>
```

#### Grouping

A group is every radio that shares the same `name` and the same form owner. Changing `name` at run time moves the
radio to the matching group, and its selection and tab stop are recalculated. Wrapping the radios in an
[`igc-radio-group`](../radio-group/spec.md) additionally applies a shared name, an alignment and the `radiogroup`
ARIA semantics:

```html
<igc-radio-group name="contact" value="email">
  <igc-radio value="email">Email</igc-radio>
  <igc-radio value="phone">Phone</igc-radio>
  <igc-radio value="mail">Mail</igc-radio>
</igc-radio-group>
```

#### Label and label position

```html
<igc-radio name="contact" value="email" label-position="before">Email</igc-radio>
```

#### Labeling from the light DOM

The label is normally the content projected in the default slot. The control can also take its name from a `label`
element in the light DOM, bound through `for` or by nesting, and from the `aria-labelledby` or `aria-label` of the host:

```html
<label for="express">Express delivery</label>
<igc-radio id="express" name="delivery" value="express"></igc-radio>

<span id="external">Standard delivery</span>
<igc-radio aria-labelledby="external" name="delivery" value="standard"></igc-radio>
```

An IDREF does not cross a shadow boundary, so the component resolves these sources itself and binds them to the native
input in its shadow root as element references (`ariaLabelledByElements`). The name follows the
[naming order](../input/spec.md#naming-order): the host `aria-labelledby`, then the external `label` elements, then the
slotted label, then the host `aria-label`. An external `label` replaces the slotted label, so a wrapping `label` does
not repeat the slotted text.

A click on an external `label` focuses the native input and checks the radio, as for a native radio. It emits
`igcChange` when the radio was not checked. A disabled radio ignores the click.

#### Validation

```html
<igc-radio name="contact" value="email" required>
  Email
  <span slot="value-missing">Please choose a contact method</span>
</igc-radio>
<igc-radio name="contact" value="phone">Phone</igc-radio>
```

Validation is a property of the group: when at least one member is `required`, the group is invalid until one of its
radios is checked. `checkValidity`, `reportValidity` and `setCustomValidity` apply to every member of the group, so
the invalid state and the custom message stay consistent across it. See the
[validation container specification](../validation-container/spec.md) for the message slot mechanism.

#### Form integration

```html
<form>
  <igc-radio name="contact" value="email" required>Email</igc-radio>
  <igc-radio name="contact" value="phone">Phone</igc-radio>
  <button type="submit">Submit</button>
</form>
```

- The checked radio submits its `value` under the shared `name`. A group with no selection submits nothing.
- A form reset restores the selection described by the `checked` attributes.
- A disabled radio does not submit a value.

### Localization

The component renders no built-in strings. The label, the helper text and the validation messages are provided by the
application and localized by it.

### Keyboard interactions

| Key combination                                | Result                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>                                 | Moves focus to the checked radio of the group, or to the first enabled one.          |
| <kbd>Arrow Down</kbd> / <kbd>Arrow Right</kbd> | Moves focus to the next enabled radio of the group and selects it, wrapping at the end. |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Left</kbd>    | Moves focus to the previous enabled radio of the group and selects it, wrapping at the start. |
| <kbd>Space</kbd>                               | Selects the focused radio.                                                          |

The horizontal arrow keys follow the writing direction, so they are mirrored in an RTL context.

## API

### Properties and attributes

| Property          | Attribute      | Reflected | Type                      | Default | Description                                                              |
| ----------------- | -------------- | --------- | ------------------------- | ------- | ------------------------------------------------------------------------ |
| checked           | checked        | No        | `boolean`                 | false   | The checked state of the control.                                        |
| value             | value          | No        | `string`                  | -       | The value of the control, submitted when the control is checked.         |
| labelPosition     | label-position | Yes       | `ToggleLabelPosition`     | `after` | The label position of the radio control.                                 |
| required          | required       | Yes       | `boolean`                 | false   | Makes the group of the control a required field for validation.          |
| disabled          | disabled       | Yes       | `boolean`                 | false   | The disabled state of the component.                                     |
| invalid           | invalid        | No        | `boolean`                 | false   | Sets the control into invalid state (visual state only).                 |
| name              | name           | Yes       | `string`                  | -       | The name of the control, submitted with the form data, and the identity of its group. |
| defaultChecked    | -              | No        | `boolean`                 | false   | The initial checked state, restored on a form reset.                     |
| form              | -              | No        | `HTMLFormElement \| null` | -       | Read-only. The form associated with this element.                        |
| validity          | -              | No        | `ValidityState`           | -       | Read-only. The validity state of the element.                            |
| validationMessage | -              | No        | `string`                  | -       | Read-only. The validation message of the element.                        |
| willValidate      | -              | No        | `boolean`                 | -       | Read-only. Whether the element is a candidate for constraint validation. |

### Methods

| Name              | Type signature                    | Description                                                                          |
| ----------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| click             | `(): void`                        | Simulates a click on the radio control.                                              |
| focus             | `(options?: FocusOptions): void`  | Sets focus on the radio control.                                                     |
| blur              | `(): void`                        | Removes focus from the radio control.                                                |
| checkValidity     | `(): boolean`                     | Checks the validity of the whole group and emits `invalid` when the control is invalid. |
| reportValidity    | `(): boolean`                     | Checks the validity of the whole group and shows the browser message when invalid.   |
| setCustomValidity | `(message: string): void`         | Sets a custom message on every radio of the group. Invalid while `message` is not empty. |

### Events

| Name      | Cancellable | Description                                                                |
| --------- | ----------- | -------------------------------------------------------------------------- |
| igcChange | false       | Emitted when the checked state of the control changes by user interaction. |

```typescript
interface IgcRadioChangeEventArgs {
  /** The current checked state of the control. */
  checked: boolean;
  /** The value of the control, if any. */
  value?: string;
}
```

Keyboard navigation selects the radio it moves to, so it emits the event from that radio. The component also
re-dispatches the native `focus`, `blur` and `invalid` events from the host element.

### Slots

| Name            | Description                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| (default)       | The radio label.                                                                 |
| `helper-text`   | Renders content below the control.                                               |
| `value-missing` | Renders content when the required validation fails.                              |
| `custom-error`  | Renders content when setCustomValidity(message) is set.                          |
| `invalid`       | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

| Part      | Description                     |
| --------- | ------------------------------- |
| `base`    | The radio control base wrapper. |
| `control` | The radio input control.        |
| `label`   | The radio control label.        |

## Test scenarios

The suite lives in [`radio.spec.ts`](./radio.spec.ts). It runs in a real browser through `@web/test-runner`, with
`@open-wc/testing` fixtures and assertions, and it reuses the shared harness in
[`src/internals/testing`](../../internals/testing):

| Shared helper | What it contributes |
| ------------- | ------------------- |
| `createFormAssociatedTestBed` | A `form` fixture around the control, exposing `formData`, `submit`, `reset` and `valid`. |
| `runValidationContainerTests` | Generated cases asserting that each validation slot renders for its failing constraint. |
| `simulateInput / simulateClick / simulateKeyboard` | User interaction driven without real device events. |
| `ValidityHelpers` | Assertions for validity, invalid styling and validation slot presence and content. |
| `isFocused` | Focus assertions that see through shadow roots. |

The groups below mirror the `describe` blocks of the suite.

### Rendering and properties

1. Is initialized with the proper default values.
2. Renders a radio element successfully, compared against a DOM snapshot.
3. Sets the `labelPosition` property properly.
4. Sets the `name`, `value`, `disabled` and `required` properties successfully.
5. Keeps correct focus states between light and shadow DOM.
6. Can use external elements as a label.

### Interactions and events

7. Emits `igcChange` when the radio is checked.
8. Does not emit `igcChange` for an already checked radio.
9. Emits the click event only once - the shadow root must not duplicate it.
10. Validating a single radio updates the validity state of the whole group.

### Form integration

Driven by `createFormAssociatedTestBed`.

11. Is form associated, and is not associated on submit when it is not checked.
12. Is associated on submit with the default value `on` - including when `checked` is set first - and with a passed
    value.
13. Is correctly reset on form reset, resets to a new default after a `setAttribute` call, and does not restore a
    checked state whose attribute was removed before the reset.
14. Is correctly submitted on <kbd>Enter</kbd>, and does not submit while the value is invalid.
15. Reflects the disabled state of an ancestor `fieldset`.
16. Fulfils the required and custom constraints.
17. Issue #1122 - the component validates synchronously.

### defaultChecked

18. Form integration - correct initial state, correct submission, correct reset, and preserving the pristine state of
    the siblings on a form reset.

### Group membership

19. Restores the tab stop when the checked radio is removed, and keeps the checked radio as the sole tab stop when
    another one is removed.
20. Restores the tab stop when the checked radio moves to another group, by `name` and by form owner.
21. Drops a radio that has left the group from a synchronous read, and joins the new group of a radio on a
    synchronous read.
22. Keeps the group reachable when the checked radio is disabled.
23. Derives the tab stop from the default state on a form reset.
24. Keeps same-name radios of two different forms in separate groups.
25. Moves a radio to the group of its new form owner.

### Validation message slots

Generated by `runValidationContainerTests`.

26. `value-missing` with `required`.
27. `custom-error` after `setCustomValidity`.
28. `invalid` with `required`.

### External label association

Generated by `runExternalLabelAssociationTests`.

29. An external `label` bound through `for`, and a `label` wrapping the host, name the native input through
    `ariaLabelledByElements`. A click on it focuses the input, checks the control and emits `igcChange` once.
30. A `label` added after the first render names the input once the control gets focus.
31. An axe audit passes with only an external `label`.
32. A disabled control ignores a label click, and a click on the control inside a wrapping `label` changes the state
    once.
33. The host `aria-labelledby` wins over an external `label`, the host `aria-label` names the input while no label does,
    and a change of the host `aria-label` reaches the input.

### Not covered by the suite

The arrow key navigation between radios is covered from the group side, in
[`radio-group.spec.ts`](../radio-group/radio-group.spec.ts), not in this suite. The suite runs the axe audit only in
the external label configuration.
## Accessibility

### ARIA roles and properties

- The encapsulated native `input` of type `radio` is the focusable and interactive element, so the native radio
  semantics, states and announcements apply.
- The inner input takes its name in the [naming order](../input/spec.md#naming-order): the host `aria-labelledby`, the
  external `label` elements, the projected label content, and the host `aria-label`. See
  [Labeling from the light DOM](#labeling-from-the-light-dom).
- The group is a single tab stop, following the WAI-ARIA radio group pattern; the tab index is managed on the host
  elements of the radios.
- The helper text and the validation messages are referenced through `aria-describedby`.
- Wrapping the radios in an [`igc-radio-group`](../radio-group/spec.md) adds the `radiogroup` role and an
  `aria-orientation` matching the alignment.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The label position and the
horizontal arrow navigation follow the inline direction.
