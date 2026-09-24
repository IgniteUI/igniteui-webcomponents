# Date time input specification

- [Date time input specification](#date-time-input-specification)
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
      - [Input format](#input-format)
      - [Display format](#display-format)
      - [Value and commit semantics](#value-and-commit-semantics)
      - [Constraint validation](#constraint-validation)
      - [Configuring spin behavior](#configuring-spin-behavior)
      - [Programmatic control](#programmatic-control)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Form integration](#form-integration)
      - [Composition inside other components](#composition-inside-other-components)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Rendering and formats](#rendering-and-formats)
    - [Uncommitted edits](#uncommitted-edits)
    - [Undo and redo](#undo-and-redo)
    - [Value and spinning](#value-and-spinning)
    - [Keyboard, wheel and pointer](#keyboard-wheel-and-pointer)
    - [Form integration](#form-integration-1)
    - [defaultValue](#defaultvalue)
    - [Validation message slots](#validation-message-slots)
    - [External label association](#external-label-association)
    - [Date part and parser unit suites](#date-part-and-parser-unit-suites)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                              |
| ------: | ---------- | -------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                              |
|       2 | 2026-09-24 | Describe the naming order and the host ARIA naming |

## Overview

The `igc-date-time-input` component is a single-line text editor for date and time values. The editable text is
driven by a mask derived from an **input format**, so the end-user always edits a predictable, positional
representation of the value (`MM/dd/yyyy`, `HH:mm:ss`, ...), while the value shown when the editor is not focused is
rendered through a separate, locale-aware **display format**.

The component is a form-associated custom element: it participates in native form submission and constraint
validation, exposes `min` and `max` constraints, and renders validation messages through dedicated slots.

Typical scenarios include:

- **Appointment and booking forms**: date and time entry with a minimum of "now" and a maximum booking horizon.
- **Filtering and reporting**: from/to date editors bound to a data source query.
- **Audit and log views**: precise timestamp entry down to the seconds part.
- **Composite editors**: the text-entry surface of `igc-date-picker` and `igc-date-range-picker`.

### Key features

- **Masked editing**: the input format is turned into a positional mask with a configurable prompt character for the
  unfilled positions.
- **Separate display format**: predefined locale styles (`short`, `medium`, `long`, `full` and their date-only and
  time-only variants) or a custom format string.
- **Locale awareness**: the default input and display formats are resolved from the active locale and follow runtime
  localization changes.
- **Deferred value commit**: typing never mutates the public `value`; the edit is committed - and `igcChange`
  emitted - when the editor is blurred.
- **Partial input completion**: an incompletely filled mask is completed from defaults on commit, and a mask that
  cannot resolve to a date clears the value.
- **Spinning**: increment or decrement the part under the caret through the keyboard, the mouse wheel, or the
  `stepUp` and `stepDown` API, with configurable per-part deltas and optional looping.
- **Undo and redo**: an internal history replaces the native undo stack, which every masked update clears.
- **Constraint validation**: `required`, `min` and `max` validators plus `setCustomValidity`, with per-error message
  slots.
- **Form association**: submits with the form, resets to `defaultValue`, and reacts to a disabled ancestor fieldset.
- **Themeable**: integrates with the theming system of the library through CSS custom properties and shadow parts.

### Acceptance criteria

- The component must derive an editable mask from the `inputFormat` property and default it from the active locale
  when the property is not set.
- The component must support a configurable `prompt` symbol for the unfilled positions of the mask, and static
  literals inside the format.
- The component must render the committed value through `displayFormat` while it is not focused, and through
  `inputFormat` while it is focused.
- The component must support the applicable properties and API of the `igc-input` element - label, placeholder,
  prefix and suffix, helper text, outlined appearance, readonly and disabled.
- The public `value` must only ever hold a committed value; intermediate editing state must not be observable
  through it.
- The component must emit `igcInput` while the user is editing, and `igcChange` only when a committed value differs
  from the value the editor was focused with.
- The component must complete partially entered dates on commit, and clear the value when the entered text cannot
  resolve to a valid date.
- The component must correctly manage and report its validation state for `required`, `min`, `max` and custom
  validity, and render the corresponding validation message slots.
- The component must participate in native form submission, reset and restore.
- The component must support spinning of the individual parts through the keyboard, the mouse wheel and the public
  API, honouring `spinDelta` and `spinLoop`.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant, using the appropriate semantic elements and ARIA attributes.
- The component must support RTL layouts without additional configuration.
- The component must handle edge cases gracefully - invalid formats, out-of-range parts, incomplete input and rapid
  interactions.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a date and time value formatted in a readable, locale-appropriate way when I am not editing it.
- see the positions I still have to fill, clearly indicated by prompt characters, when I start editing.
- see a placeholder text when the editor is empty, suggesting what I am expected to type.
- type a date and time value directly, with literals inserted for me as I go.
- paste, or drag and drop, a date from elsewhere into the editor.
- increment or decrement the part my caret is in, using the keyboard or the mouse wheel.
- insert the current date and time with a single keyboard shortcut.
- have a partially typed date completed for me instead of being rejected outright.
- undo and redo my edits.
- be told when the value I entered is required, too early, or too late.

### Developer stories

As a developer, I expect to be able to:

- define the editable mask through an `inputFormat`, and have it default to the current locale when I do not.
- use the input format as the placeholder when I have not set one.
- specify the prompt character used for the unfilled positions of the mask.
- set the `displayFormat` to one of the predefined styles, or to a custom format string.
- configure the editor as editable, readonly or disabled.
- set an initial value, and a `defaultValue` the editor resets to on form reset.
- bind the value as a `Date` object or as an ISO string.
- rely on `value` reflecting only committed values, so a two-way binding never clobbers a half-typed mask.
- observe the value as it is being typed through `igcInput`, and the committed value through `igcChange`.
- set `min` and `max` values which control the validity of the editor.
- mark the editor as `required` and provide my own messages for each validation failure.
- specify the step by which each part is spun, and whether spinning wraps around at the boundaries.
- expect the editor to complete partially entered dates and to clear invalid input on commit.
- submit the value as part of a native form and have it reset correctly.

## Functionality

A date time input is a text field where the user sets and edits a date and time value, controlled and filtered by a
mask derived from the input format. Label, placeholder, helper text, prefix and suffix content and the validation
visual states follow the conventions of the other input-like components of the library.

### End-user experience

**Visual structure**

- A single-line text field with an optional floating or static label, depending on the theme in use.
- Optional `prefix` and `suffix` content - typically icons or spin buttons - rendered on either side of the text.
- Optional helper text below the field, replaced by the relevant validation message when the editor is invalid.
- The placeholder, when not explicitly set, is the input format itself (for example `MM/dd/yyyy`), so an empty
  editor advertises what it expects.

**Editing**

- **Unfocused**: the committed value is rendered through `displayFormat`, so it can be considerably more verbose
  than what the user types, for example `Sunday, July 17, 2022`.
- **On focus**: the text flips to the input format. An empty editor shows the empty mask (`__/__/____`) and selects
  it, so typing immediately starts filling the first part.
- **While typing**: only the mask positions accept input; literals are skipped over automatically and unfilled
  positions keep showing the prompt character.
- **On blur**: the edit is committed. A partially filled mask is completed from defaults - year `2000`, month
  January, day `1`, zeroed time parts - and a mask that cannot resolve to a valid date, for example `02/30/2023`,
  clears the value.

**Spinning**

- **Keyboard**: <kbd>Arrow Up</kbd> and <kbd>Arrow Down</kbd> increment and decrement the part the caret is in,
  keeping the caret in place.
- **Mouse wheel**: while the editor is focused, scrolling spins the part under the caret; the page does not scroll.
- **Boundaries**: with `spinLoop` enabled - the default - a part wraps around at its boundary, so minutes go from
  `59` to `00`; otherwise it clamps at the boundary.

**Feedback and accessibility**

- **Focus indicator**: the field shows the focus styling of the theme; the inner native input is the focus target.
- **Screen readers**: the editor is a native text input with an associated label, so its value, label, description
  and invalid state are announced natively.
- **Validation**: the invalid state is applied after the editor has been interacted with, and the matching
  validation message slot replaces the helper text.

### Developer experience

#### Basic initialization

The simplest editor requires no configuration at all - the input format, display format and placeholder are all
derived from the active locale:

```html
<igc-date-time-input label="Appointment"></igc-date-time-input>
```

Add content around the text through the `prefix`, `suffix` and `helper-text` slots:

```html
<igc-date-time-input label="Appointment" outlined>
  <igc-icon slot="prefix" name="calendar"></igc-icon>
  <span slot="helper-text">Pick a date and a time</span>
</igc-date-time-input>
```

#### Input format

The `inputFormat` property is the mask the end-user edits. Every supported format character contributes an editable
position; anything else is treated as a literal and skipped over while typing.

| Format | Description                                                                |
| :----: | :------------------------------------------------------------------------- |
|  `d`   | Day of the month, single position.                                         |
|  `dd`  | Day of the month with an explicitly set leading zero.                      |
|  `M`   | Month, single position.                                                    |
|  `MM`  | Month with an explicitly set leading zero.                                 |
|  `yy`  | Short (two digit) year format. Values below `50` resolve to the 2000s.     |
| `yyyy` | Full year format. Any year format other than `yy` is normalized to `yyyy`. |
|  `h`   | Hours in 12-hour format, single position.                                  |
|  `hh`  | Hours in 12-hour format with an explicitly set leading zero.               |
|  `H`   | Hours in 24-hour format, single position.                                  |
|  `HH`  | Hours in 24-hour format with an explicitly set leading zero.               |
|  `m`   | Minutes, single position.                                                  |
|  `mm`  | Minutes with an explicitly set leading zero.                               |
|  `s`   | Seconds, single position.                                                  |
|  `ss`  | Seconds with an explicitly set leading zero.                               |
|  `t`   | AM/PM section for 12-hour format.                                          |
|  `tt`  | AM/PM section for 12-hour format.                                          |

```html
<!-- Date only -->
<igc-date-time-input input-format="dd.MM.yyyy"></igc-date-time-input>

<!-- Time only, with seconds -->
<igc-date-time-input input-format="HH:mm:ss"></igc-date-time-input>

<!-- Date and 12-hour time -->
<igc-date-time-input input-format="MM/dd/yyyy hh:mm tt"></igc-date-time-input>
```

Setting `prompt` changes the character used for the positions that are not filled in yet:

```html
<igc-date-time-input input-format="dd/MM/yyyy" prompt="*"></igc-date-time-input>
```

Which parts the format contains also determines how `min` and `max` are compared: a time-only editor is validated on
its time portion only, and a date-only editor on its date portion only. `hasDateParts()` and `hasTimeParts()` report
what the current format holds.

#### Display format

While the editor is not focused, the committed value is rendered through `displayFormat`. It accepts one of the
predefined styles below - all examples are given in the `en-US` locale - or a custom format string. When
`displayFormat` is not set, it falls back to `inputFormat`, and then to the default date-time format of the locale.

|    Option    | Example                                                           |
| :----------: | :---------------------------------------------------------------- |
|   `short`    | 7/17/22, 12:00 AM                                                 |
|   `medium`   | Jul 17, 2022, 12:00:00 AM                                         |
|    `long`    | July 17, 2022 at 12:00:00 AM GMT+3                                |
|    `full`    | Sunday, July 17, 2022 at 12:00:00 AM Eastern European Summer Time |
| `shortDate`  | 7/17/22                                                           |
| `mediumDate` | Jul 17, 2022                                                      |
|  `longDate`  | July 17, 2022                                                     |
|  `fullDate`  | Sunday, July 17, 2022                                             |
| `shortTime`  | 12:00 AM                                                          |
| `mediumTime` | 12:00:00 AM                                                       |
|  `longTime`  | 12:00:00 AM GMT+3                                                 |
|  `fullTime`  | 12:00:00 AM Eastern European Summer Time                          |

A custom display format is built from the following symbols:

| Type         | Format  | Description    | Example |
| :----------- | :-----: | :------------- | :------ |
| Day of month |   `d`   | Minimum digits | 7, 17   |
|              |  `dd`   | Zero padded    | 07, 17  |
| Month        |   `M`   | Minimum digits | 3, 10   |
|              |  `MM`   | Zero padded    | 03, 10  |
|              |  `MMM`  | Abbreviated    | Oct     |
|              | `MMMM`  | Wide           | October |
|              | `MMMMM` | Narrow         | O       |
| Year         |   `y`   | Numeric        | 2022    |
|              |  `yy`   | Two digit      | 22      |
|              |  `yyy`  | Numeric        | 2022    |
|              | `yyyy`  | Numeric        | 2022    |
| Hour 1-12    |   `h`   | Minimum digits | 1, 12   |
|              |  `hh`   | Zero padded    | 01, 12  |
| Hour 0-23    |   `H`   | Minimum digits | 1, 23   |
|              |  `HH`   | Zero padded    | 01, 23  |
| Minute       |   `m`   | Minimum digits | 1, 59   |
|              |  `mm`   | Zero padded    | 01, 59  |
| Second       |   `s`   | Minimum digits | 1, 59   |
|              |  `ss`   | Zero padded    | 01, 59  |
| Time period  |   `t`   | Abbreviated    | AM, PM  |
|              |  `tt`   | Abbreviated    | AM, PM  |
|              |  `ttt`  | Short          | noon    |
|              | `tttt`  | Long           | noon    |
|              | `ttttt` | Narrow         | n       |

> [!NOTE]
> Many locales use the same time period string irrespective of the format specified. The time period also only has
> an effect when a 12-hour clock is used.

```html
<igc-date-time-input
  locale="fr"
  input-format="dd/MM/yyyy"
  display-format="fullDate"
></igc-date-time-input>
```

#### Value and commit semantics

The public `value` only ever holds a **committed** value. While the user is typing, the intermediate state lives in
the masked text; the parsed result reaches `value` - together with an `igcChange` event - when the edit is committed
on blur.

```typescript
const input = document.querySelector('igc-date-time-input')!;

// Observe the value as it is being typed - the detail is an ISO string, or
// `undefined` while the mask is still incomplete.
input.addEventListener('igcInput', ({ detail }) => {
  console.log('typing:', detail);
});

// Observe committed values only. Fired on blur, and only when the committed
// value differs from the one the editor was focused with.
input.addEventListener('igcChange', ({ detail }) => {
  console.log('committed:', detail); // Date | null
});
```

This is what makes the component safe to two-way bind: a host re-rendering with the value it last received from
`igcChange` does not reset a half-typed mask. Assigning a genuinely different value while the user is typing still
wins and replaces the mask.

The value accepts a `Date`, an ISO string, or `null`:

```html
<igc-date-time-input value="2026-08-07T14:30:00"></igc-date-time-input>
```

```typescript
input.value = new Date(2026, 7, 7, 14, 30);
input.value = '2026-08-07T14:30:00';
input.value = null; // clears the editor
```

Commit is lenient by design:

- A **partially filled** mask is completed from defaults - year `2000`, month January, day `1` and zeroed time parts
  - so typing `07/__/____` commits as July 1st, 2000.
- A mask that resolves to an **invalid** date - `02/30/2023`, `13/01/2023` - commits as `null`.
- `clear()` empties the mask and sets the value to `null`.

#### Constraint validation

`min` and `max` bound the valid range; `required` makes an empty editor invalid. Both accept a `Date` or an ISO
string. Validation messages are rendered through the per-error slots, replacing the helper text while the editor is
invalid. See the [validation container specification](../validation-container/spec.md) for the mechanism.

```html
<igc-date-time-input
  label="Delivery slot"
  required
  min="2026-08-01T09:00:00"
  max="2026-08-31T18:00:00"
  input-format="dd/MM/yyyy HH:mm"
>
  <span slot="helper-text">Working hours in August only</span>
  <span slot="value-missing">Please pick a delivery slot</span>
  <span slot="range-underflow">The slot is before the delivery window</span>
  <span slot="range-overflow">The slot is after the delivery window</span>
</igc-date-time-input>
```

Custom constraints are applied through `setCustomValidity`, and reported through the `custom-error` slot:

```typescript
input.addEventListener('igcChange', ({ detail }) => {
  const isWeekend = detail ? [0, 6].includes(detail.getDay()) : false;
  input.setCustomValidity(isWeekend ? 'Weekends are not available' : '');
});
```

#### Configuring spin behavior

`spinDelta` sets a per-part step; every part defaults to `1`. `spinLoop` - enabled by default - controls whether a
part wraps around at its boundary or clamps to it.

```typescript
input.spinDelta = { date: 7, minutes: 15 };
input.spinLoop = false;
```

```typescript
interface DatePartDeltas {
  date?: number;
  month?: number;
  year?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}
```

#### Programmatic control

```typescript
import { DatePart } from 'igniteui-webcomponents';

input.stepUp(DatePart.Date);          // one day forward
input.stepDown(DatePart.Minutes, 15); // fifteen minutes back
input.clear();                        // empty the mask and the value

input.select();
input.setSelectionRange(0, 2);
input.setRangeText('12', 0, 2, 'select');
```

Calling `stepUp` or `stepDown` on an empty editor initializes the value first. With no part argument, the part under
the caret is spun.

#### Labeling from the light DOM

Besides the `label` property, the editor can be labelled by a `label` element in the light DOM, either through `for`
or by nesting it:

```html
<label for="external">Appointment</label>
<igc-date-time-input id="external"></igc-date-time-input>
```

An IDREF does not cross a shadow boundary, so the association is resolved through `ElementInternals` and projected
onto the native input as an element reference (`ariaLabelledByElements`). Clicking the external label focuses the
editor.

The same channel carries the ARIA of a composite host: [`igc-date-picker`](../date-picker/spec.md) and
[`igc-date-range-picker`](../date-range-picker/spec.md) project their `role`, `aria-haspopup`, `aria-expanded`,
`aria-controls` and their own labels onto the native input of the date time input they wrap.

The name follows the [naming order](../input/spec.md#naming-order), so the host `aria-labelledby` and `aria-label` also
name the control.

#### Form integration

```html
<form>
  <igc-date-time-input name="appointment" label="Appointment" required></igc-date-time-input>
  <button type="submit">Book</button>
</form>
```

- The value is submitted under `name`.
- A form reset restores `defaultValue`, which is taken from the `value` attribute.
- An invalid editor blocks submission, and pressing <kbd>Enter</kbd> submits the owning form only when it is valid.

#### Composition inside other components

The component is the text-entry surface of [`igc-date-picker`](../date-picker/spec.md) and of
[`igc-date-range-picker`](../date-range-picker/spec.md). Those hosts own the popover, the calendar and the ARIA
semantics, and they forward their format, locale and constraint properties to the editor.

### Localization

The component has no static text of its own, so nothing needs to be translated. Everything locale-dependent is
derived from the active locale:

- `inputFormat` defaults to the date-time input pattern of the locale, so the order of the day, month and year parts
  follows the locale.
- `placeholder` defaults to the resolved input format.
- `displayFormat` falls back to the default date-time format of the locale, and the predefined styles as well as the
  month, weekday and time period names are rendered through the data of the locale.

The `locale` property overrides the locale for a single editor; when it is not set, the editor follows the global
locale of the library. A runtime change of the global locale or of the localization resources re-resolves the
default mask and re-renders the displayed value.

```html
<igc-date-time-input locale="ja"></igc-date-time-input>
```

Validation messages are provided by the application through the validation message slots, and are therefore
localized by the application.

### Keyboard interactions

| Key combination                                                       | Result                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Right</kbd>                        | Moves the caret one position to the left or right.                                         |
| <kbd>Home</kbd> / <kbd>End</kbd>                                      | Moves the caret to the beginning or the end of the editor.                                 |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Arrow Left</kbd>              | Moves the caret to the beginning of the current date/time section, or of the previous one. |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Arrow Right</kbd>             | Moves the caret to the end of the current date/time section, or of the next one.           |
| <kbd>Arrow Up</kbd>                                                   | Increments the part the caret is in.                                                       |
| <kbd>Arrow Down</kbd>                                                 | Decrements the part the caret is in.                                                       |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>;</kbd>                       | Sets the current date and time as the value of the editor.                                 |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>Cmd</kbd> + <kbd>Z</kbd>        | Undoes the last edit step.                                                                 |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redoes the last undone step.                                                  |
| <kbd>Enter</kbd>                                                      | Submits the owning form, if any and if the editor is valid.                                |

All of the above are no-ops while the editor is `readonly`. Modified arrow presses other than the ones listed - for
example <kbd>Alt</kbd> + <kbd>Arrow Up</kbd> - are ignored, so they stay available to composing components.

## API

### Properties and attributes

| Property          | Attribute      | Reflected | Type                        | Default           | Description                                                                 |
| ----------------- | -------------- | --------- | --------------------------- | ----------------- | --------------------------------------------------------------------------- |
| value             | value          | No        | `Date \| null`              | -                 | The committed value of the input. Accepts a `Date`, an ISO string or `null`. |
| inputFormat       | input-format   | No        | `string`                    | from the locale   | The date format to apply on the input.                                      |
| displayFormat     | display-format | No        | `string`                    | `inputFormat`     | Format to display the value in when not editing.                            |
| min               | min            | No        | `Date \| null`              | -                 | The minimum value required for the input to remain valid.                   |
| max               | max            | No        | `Date \| null`              | -                 | The maximum value required for the input to remain valid.                   |
| prompt            | prompt         | No        | `string`                    | `_`               | The prompt symbol for the unfilled parts of the mask pattern.               |
| spinDelta         | -              | No        | `DatePartDeltas \| undefined` | all parts `1`   | Delta values used to increment or decrement each part on step actions.      |
| spinLoop          | spin-loop      | No        | `boolean`                   | true              | Whether to loop over the currently spun segment.                            |
| label             | label          | No        | `string`                    | -                 | The label for the control.                                                  |
| placeholder       | placeholder    | No        | `string`                    | the input format  | The placeholder text of the control.                                        |
| outlined          | outlined       | Yes       | `boolean`                   | false             | Whether the control will have outlined appearance.                          |
| readOnly          | readonly       | Yes       | `boolean`                   | false             | Makes the control a readonly field.                                         |
| required          | required       | Yes       | `boolean`                   | false             | Makes the component a required field for validation.                        |
| disabled          | disabled       | Yes       | `boolean`                   | false             | The disabled state of the component.                                        |
| invalid           | invalid        | No        | `boolean`                   | false             | Sets the control into invalid state (visual state only).                    |
| name              | name           | Yes       | `string`                    | -                 | The name of the control, submitted with the form data.                      |
| locale            | locale         | No        | `string`                    | the global locale | The locale used to format the display value and resolve the resource strings. |
| mask              | mask           | No        | `string`                    | from the format   | The mask pattern of the component. Inherited; set `inputFormat` instead.    |
| defaultValue      | -              | No        | `Date \| null`              | -                 | The initial value of the control, restored on a form reset.                 |
| form              | -              | No        | `HTMLFormElement \| null`   | -                 | Read-only. The form associated with this element.                           |
| validity          | -              | No        | `ValidityState`             | -                 | Read-only. The validity state of the element.                               |
| validationMessage | -              | No        | `string`                    | -                 | Read-only. The validation message of the element.                           |
| willValidate      | -              | No        | `boolean`                   | -                 | Read-only. Whether the element is a candidate for constraint validation.    |

### Methods

| Name              | Type signature                                                                               | Description                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| stepUp            | `(datePart?: DatePart, delta?: number): void`                                                  | Increments a date/time portion.                                    |
| stepDown          | `(datePart?: DatePart, delta?: number): void`                                                  | Decrements a date/time portion.                                    |
| clear             | `(): void`                                                                                     | Clears the input element of user input.                            |
| hasDateParts      | `(): boolean`                                                                                  | Whether the current format holds a day, month or year part.        |
| hasTimeParts      | `(): boolean`                                                                                  | Whether the current format holds an hours, minutes or seconds part. |
| select            | `(): void`                                                                                     | Selects all the text inside the input.                             |
| setSelectionRange | `(start?: number, end?: number, direction?: SelectionRangeDirection): void`                   | Sets the text selection range of the control.                      |
| setRangeText      | `(replacement: string, start?: number, end?: number, selectMode?: RangeTextSelectMode): void` | Replaces the selected text and re-applies the mask.                |
| focus             | `(options?: FocusOptions): void`                                                               | Sets focus on the control.                                         |
| blur              | `(): void`                                                                                     | Removes focus from the control.                                    |
| checkValidity     | `(): boolean`                                                                                   | Checks validity and emits `invalid` when the control is invalid.   |
| reportValidity    | `(): boolean`                                                                                   | Checks validity and shows the browser message when invalid.        |
| setCustomValidity | `(message: string): void`                                                                       | Sets a custom message. Invalid while `message` is not empty.       |

```typescript
enum DatePart {
  Month = 'month',
  Year = 'year',
  Date = 'date',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
  AmPm = 'amPm',
}
```

### Events

| Name      | Cancellable | Detail                | Description                                                |
| --------- | ----------- | --------------------- | ---------------------------------------------------------- |
| igcInput  | false       | `string \| undefined` | Emitted while the user edits. The detail is the typed date as an ISO string, or `undefined` while the mask is incomplete. |
| igcChange | false       | `Date \| null`        | Emitted on blur, when the committed value differs from the one the editor was focused with. |

### Slots

| Name              | Description                                                                      |
| ----------------- | --------------------------------------------------------------------------------- |
| `prefix`          | Renders content before the input.                                                |
| `suffix`          | Renders content after input.                                                     |
| `helper-text`     | Renders content below the input.                                                 |
| `value-missing`   | Renders content when the required validation fails.                              |
| `range-overflow`  | Renders content when the max validation fails.                                   |
| `range-underflow` | Renders content when the min validation fails.                                   |
| `custom-error`    | Renders content when setCustomValidity(message) is set.                          |
| `invalid`         | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

| Part          | Description                                          |
| ------------- | ---------------------------------------------------- |
| `container`   | The main wrapper that holds all main input elements. |
| `input`       | The native input element.                            |
| `label`       | The native label element.                            |
| `prefix`      | The prefix wrapper.                                  |
| `suffix`      | The suffix wrapper.                                  |
| `helper-text` | The helper text wrapper.                             |

## Test scenarios

The component is covered by three suites in this directory, all running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`date-time-input.spec.ts`](./date-time-input.spec.ts) | The component: formats, editing, spinning, validation and form integration. |
| [`date-part.spec.ts`](./date-part.spec.ts) | The date part classes on their own. |
| [`datetime-mask-parser.spec.ts`](./datetime-mask-parser.spec.ts) | The date-time mask parser on its own. |

The component suite additionally reuses `createFormAssociatedTestBed`, `runValidationContainerTests`,
`runExternalLabelAssociationTests`, the `simulate*` helpers and `ValidityHelpers` from
[`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### Rendering and formats

1. Sets the default values correctly.
2. Updates `inputFormat` according to the locale, with and without a value, including through the localization API.
3. Uses `inputFormat` when no `displayFormat` is defined - issue #1114 - and uses `displayFormat` when it is.
4. Updates the mask according to the `inputFormat` on focus when a value is set - issue #1320.
5. Switches correctly between the predefined date formats.

### Uncommitted edits

Grouped as `Uncommitted edits - issue #1346` in the suite.

6. Does not mutate `value` while typing, neither partially nor fully.
7. Exposes the typed date through `igcInput` while `value` stays put.
8. Re-applying an equal value while typing does not reset the mask.
9. Emits a single `igcChange` on blur, carrying the committed value.
10. A genuinely different value assigned while typing still wins.
11. Emptying the mask commits an empty value, not a date filled from the defaults.
12. Emits `igcChange` on blur after an incomplete mask has been parsed - issue #1695.

### Undo and redo

13. Restores the mask without committing the value, and commits the restored draft on blur.
14. Redoes a restored draft.
15. Emits no `igcChange` when undone back to the value the editor was focused with.
16. Keeps consecutive spins as separate steps.
17. Emits `igcInput` when a step is restored.
18. Does nothing while read-only, and drops the history when the input format changes.

### Value and spinning

19. Sets the value through the attribute, the property, a string property binding, and a time-only portion.
20. `clear` empties the editor.
21. `stepUp` and `stepDown` initialize a new date when the value is empty, and spin correctly otherwise.
22. Respects `spinDelta` and `spinLoop`.
23. `setRangeText` replaces the range and re-applies the mask.
24. Non-filled parts get their default value on blur; an invalid date sets a `null` value on blur; a complete input
    commits its value.

### Keyboard, wheel and pointer

25. <kbd>Arrow Up</kbd> and <kbd>Arrow Down</kbd> spin the focused part, and are a no-op while read-only.
26. <kbd>Alt</kbd> + arrow presses are a no-op.
27. The caret does not move away from the focused part when `stepUp` or `stepDown` are invoked.
28. <kbd>Arrow Left</kbd> and <kbd>Arrow Right</kbd> navigate to the beginning and the end of a date section.
29. <kbd>Ctrl</kbd> + <kbd>;</kbd> sets the current date.
30. The mouse wheel spins the part under the caret, and is a no-op without focus and while read-only.
31. No change event is emitted while read-only.
32. Drag enter, drag leave with and without focus, and drop behavior.

### Form integration

Driven by `createFormAssociatedTestBed`.

33. Is form associated, and is not associated on submit without a value.
34. Is associated on submit.
35. Is correctly reset on form reset, and resets to the new default after a `setAttribute` call.
36. Is correctly submitted on <kbd>Enter</kbd>, and does not submit while the value is invalid.
37. Reflects the disabled state of an ancestor `fieldset`.
38. Fulfils the required, min, max - both as dates and as string property bindings - and custom constraints.

### defaultValue

39. Form integration - correct initial state, correct submission and correct reset.
40. Validation - fails and passes required validation, and fails and passes the min and max validation.

### Validation message slots

Generated by `runValidationContainerTests`.

41. `value-missing`, `range-underflow`, `range-overflow`, `custom-error` and `invalid` render for their matching
    constraint.

### External label association

Generated by `runExternalLabelAssociationTests`.

42. An external `label` bound through `for`, and a `label` wrapping the host, are projected onto the native input as
    `ariaLabelledByElements`, and clicking it focuses the control. A `label` added after the first render names the
    control from the first focus, an axe audit passes with only an external `label`, and the host `aria-labelledby` and
    `aria-label` follow the [naming order](../input/spec.md#naming-order).

### Date part and parser unit suites

43. [`date-part.spec.ts`](./date-part.spec.ts) covers the part classes: the factory for every part type, `getValue`
    formatting per token, `validate` ranges - including the day validated against its month and year context - and
    `spin` for every part, with leap year adjustment, looping and clamping.
44. [`datetime-mask-parser.spec.ts`](./datetime-mask-parser.spec.ts) covers the parser that turns a format into a
    mask and back.

## Assumptions and limitations

- The component does not expose a `type` attribute, since the underlying element is always an input of type `text`.
- The `value` is a local `Date`; time zones are not modelled. A display format including a time zone renders the
  time zone of the runtime.
- The input format is positional. Variable-width tokens that are valid in a display format - `MMM`, `MMMM`, `ttt` -
  are not supported as input format tokens.
- Any year token other than `yy` is normalized to `yyyy` for editing purposes.
- Two-digit years below `50` resolve to the 2000s; `50` and above resolve to the 1900s.
- A single-character token - `d`, `M`, `h` - yields a single editable position; use the doubled token when a
  zero-padded, two-position section is required.
- The `mask` and `prompt` members are inherited from the shared masked editor behavior. Only `prompt` is supported
  here; `inputFormat` is the supported way of setting the pattern.
- Only one date and time value is edited per component; ranges are covered by
  [`igc-date-range-picker`](../date-range-picker/spec.md).

## Accessibility

### ARIA roles and properties

- The encapsulated native `input` is the focusable and interactive element; the host delegates focus to it.
- The `label` attribute renders a native `label` element bound to the input, which provides an accessible name. An
  external light DOM `label` is projected onto the input as an element reference.
- The helper text and the validation messages are referenced through `aria-describedby`.
- The required, disabled and read-only states come from the native attributes on the inner input.
- A composite host that wraps the editor projects its own role and ARIA state onto the native input, so assistive
  technology reports from the element that actually receives focus.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
