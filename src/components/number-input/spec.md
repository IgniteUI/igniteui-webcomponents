# Number input specification

- [Number input specification](#number-input-specification)
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
      - [Value](#value)
      - [Format](#format)
      - [Display text and edit text](#display-text-and-edit-text)
      - [Typing and pasting](#typing-and-pasting)
      - [Commit](#commit)
      - [Range and steps](#range-and-steps)
      - [Spin buttons](#spin-buttons)
      - [Constraint validation](#constraint-validation)
      - [Form integration](#form-integration)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
    - [Mouse wheel](#mouse-wheel)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom states](#css-custom-states)
  - [Test scenarios](#test-scenarios)
    - [Default state](#default-state)
    - [Value](#value-1)
    - [Display and edit text](#display-and-edit-text)
    - [Format](#format-1)
    - [Typing](#typing)
    - [Commit](#commit-1)
    - [Escape](#escape)
    - [Keys](#keys)
    - [Wheel](#wheel)
    - [Methods](#methods-1)
    - [Validation](#validation)
    - [Form integration](#form-integration-1)
    - [Spin buttons](#spin-buttons-1)
    - [External label association](#external-label-association)
    - [Hidden ancestor](#hidden-ancestor)
    - [Focus before the first render](#focus-before-the-first-render)
    - [Number input format](#number-input-format)
    - [Number input format properties](#number-input-format-properties)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                          |
| ------: | ---------- | ---------------------------------------------- |
|       1 | 2026-11-17 | Initial specification, without spin buttons    |
|       2 | 2026-11-17 | Spin buttons, `hideSpinButtons`, `resourceStrings` |
|       3 | 2026-11-17 | `select()` focuses first; a `select()` before the focus keeps its selection |
|       4 | 2026-11-17 | Hover and pressed layers of the spin buttons |
|       5 | 2026-11-17 | Review fixes: values from code during an edit, the commit in range, steps finer than the format, `readOnly` during the focus, disconnect, empty bound attributes, presses of other buttons |
|       6 | 2026-11-18 | Review fixes: a same-value write keeps the edit, numeric-string bounds and step, a commit only after an edit, a reset replaces a partial text, steps never move against their direction, integer step counts, spin buttons disabled when they cannot step, Home and End to shown values, a held touch commits once, drops replace the text |
|       7 | 2026-11-19 | Form write origins: `igcChange` compares with the reported value of the form module; a write from code of the current value keeps the field pristine; a step that fails validation shows the invalid state at once; the step rules move to `NumberInputFormat.spin` |
|       8 | 2026-11-19 | Review fixes: a paste into typed text is read alone; a typed space counts only as a group separator of the locale; the wheel also steps over the spin buttons; `defaultValue` is typed `number \| null` and `stepUp`/`stepDown` take `n?: number`; `validateOnly` is not reflected; the specification describes the code as it is: accessibility, limitations, numbered test scenarios |

## Overview

The `igc-number-input` component is a single-line field for a number. It shows the value formatted for the locale,
reads what the user types in the locale, and steps the value with the keys, the spin buttons and the mouse wheel. It
has the shell of the other inputs: a label, a placeholder, prefix and suffix content, helper text, validation messages
and the themes.

The inner control is a native `<input type="text">`, not `type="number"`. A native number input cannot show a
formatted value, does not read the decimal separator of the locale in all browsers, and changes the value on a wheel
scroll of the page.

The component is form-associated: it takes part in form submission, reset and constraint validation through
`ElementInternals`.

### Key features

- **A number value**: `value` is a `number` or `null`. The form submits a plain decimal string.
- **Intl formatting**: currency, percent, unit, fraction digits, rounding mode, grouping and sign display, through
  `valueFormatOptions`.
- **Locale parsing**: the digits of the locale numbering system and ASCII digits, the separators of the locale,
  full-width characters, and pasted text in the display format.
- **Commit on blur and Enter**: the value rounds to the shown fraction digits and clamps to `min` and `max`.
- **Steps**: the arrow keys, PageUp and PageDown, Shift with the arrow keys, Home and End, the mouse wheel, and
  spin buttons that repeat while held.
- **Validation**: `required`, `min` and `max`, with one message slot for each flag.

### Acceptance criteria

- The component must show the display text without focus and the edit text with focus.
- It must read each text that it shows, in each supported locale.
- It must reject typed characters that cannot be part of a number.
- It must emit `igcInput` when the user changes the value and `igcChange` when the user commits a changed value.
- It must take part in form submission, reset and validation as a form-associated custom element.
- It must expose the `spinbutton` role with the value, the bounds and the formatted text.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- type a number in the format of my language, with my decimal separator.
- read the value with group separators and its currency, percent or unit when I do not edit it.
- paste a number that I copied from a document or from another field.
- change the value in steps with the arrow keys, the spin buttons and the mouse wheel.
- undo my edit with <kbd>Escape</kbd>.

### Developer stories

As a developer, I expect to be able to:

- read and set the value as a number, and get `null` for an empty field.
- format the value as a currency, a percent or a unit, with the fraction digits I want.
- limit the value with **min** and **max**, and set the **step**.
- let the user type a value out of range and show a message instead, through **validateOnly**.
- set the **locale**, or let the field take it from the page.
- submit the value with a form, as a plain decimal string.

## Functionality

### End-user experience

Without focus, the field shows the value in the full format, for example `$1,234.50`. When the field gets focus, it
shows the same number without group separators and without symbols, for example `1234.5`, so that the user edits
only digits. When focus enters with the Tab key, all the text is selected.

While the user types, the field keeps the text as typed. It does not format it again until the user commits it with
<kbd>Enter</kbd> or by leaving the field. Thus the caret does not jump, and the native undo works.

There is no Figma design yet. The field takes the input themes, and the spin buttons take the suffix tokens of each
input theme.

### Developer experience

#### Basic initialization

```html
<igc-number-input label="Quantity" name="quantity" min="1" max="99"></igc-number-input>
```

#### Value

```ts
const input = document.querySelector('igc-number-input')!;

input.value = 1234.5;
input.value = null; // empty
```

- `value` is a `number` or `null`. An empty field is `null`.
- `NaN`, `Infinity` and `-Infinity` become `null`. A negative zero becomes `0`.
- The `value` attribute is read with `Number()`, not in the locale: `value="1234.5"`. It also sets `defaultValue`.
- A numeric string set from code is read the same way, so `input.value = '5'` gives `5`.
- A value set from code is not clamped and not rounded. A value out of range fails validation. As in the other form
  controls, the field shows the invalid state after the user changes the value or leaves the field.
- A value from code during an edit, from `value`, `stepUp()`, `stepDown()` or a form reset, replaces the text and is the
  new reported value: Escape keeps it, and the blur emits no `igcChange` for it. A write of the current value changes
  nothing, as a framework repeats it on each render: the field stays pristine, and a pending `igcChange` stays. A form
  reset also replaces a partial text, such as `-`.
- `min`, `max` and `step` read a numeric string as a number, as frameworks can set them. An empty or non-numeric bound
  sets no bound, as for a native input.

#### Format

```ts
input.valueFormatOptions = { style: 'currency', currency: 'EUR' };
input.valueFormatOptions = { style: 'percent', maximumFractionDigits: 1 };
input.valueFormatOptions = { style: 'unit', unit: 'kilometer-per-hour' };
input.valueFormatOptions = { maximumFractionDigits: 0 }; // integers
```

`valueFormatOptions` takes the options of `Intl.NumberFormat` that the field can read back:

| Option                  | Values                                                         |
| ----------------------- | -------------------------------------------------------------- |
| `style`                 | `decimal` (default), `currency`, `percent`, `unit`             |
| `currency`              | an ISO 4217 code, required for `currency`                      |
| `currencyDisplay`       | `symbol` (default), `narrowSymbol`, `code`, `name`             |
| `currencySign`          | `standard` (default), `accounting`: a negative in parentheses  |
| `unit`                  | a unit of `Intl.NumberFormat`, required for `unit`             |
| `unitDisplay`           | `short` (default), `narrow`, `long`                            |
| `minimumFractionDigits` | 0 to 100                                                       |
| `maximumFractionDigits` | 0 to 100                                                       |
| `roundingMode`          | the rounding modes of `Intl.NumberFormat`, `halfExpand` (default) |
| `useGrouping`           | `boolean`                                                      |
| `signDisplay`           | `auto` (default), `always`, `exceptZero`, `negative`           |

- Other options are ignored. `notation` (compact, scientific) cannot be read back.
- Without `maximumFractionDigits`, a currency keeps the digits of the currency, and the other styles show up to 20
  fraction digits, so the field does not round a value that the developer did not ask to round.
- A `percent` value is a fraction: `0.25` shows as `25%`, and the default step is `0.01`.
- Invalid options, such as `currency` without a code, fall back to the default format with a console warning.
- An object equal to the current one does not update the field, so a framework that sets the property on each render
  costs nothing.

#### Display text and edit text

| Locale and options                              | Value  | Display text | Edit text |
| ----------------------------------------------- | ------ | ------------ | --------- |
| `en`                                            | 1234.5 | 1,234.5      | 1234.5    |
| `en`, `{ style: 'currency', currency: 'USD' }`  | 1234.5 | $1,234.50    | 1234.5    |
| `en`, `{ style: 'percent', maximumFractionDigits: 1 }` | 0.255 | 25.5% | 25.5      |
| `de`                                            | 1234.5 | 1.234,5      | 1234,5    |
| `ar-EG`                                         | 1234.5 | ١٬٢٣٤٫٥      | ١٢٣٤٫٥    |

The edit text keeps the bidi marks before a negative number, so the minus sign stays in place in a right-to-left
locale.

When `readOnly` changes while the field has focus, the edit starts or ends as on a focus or a blur. A disconnect ends
the edit as a blur does, also in browsers that send no blur then.

#### Typing and pasting

- The field rejects a typed character that cannot be part of a number. It accepts:
  - the digits of the locale numbering system and ASCII digits;
  - one decimal separator, when the format has fraction digits;
  - the group separators of the locale. A space counts only where the locale groups digits with a space, as French
    does, and only between digits before the decimal separator;
  - a leading plus sign, and a leading minus sign when `min` is not set or is below 0, or `validateOnly` is set. A text
    that already has a minus sign, as a value from code can give, takes more digits.
- A `.` or `,` that is not the group separator of the locale is also a decimal separator. Thus a French user can type
  `1.5`. In German, `.` is the group separator, so `1.5` is 15.
- The decimal key of the numeric keypad types the decimal separator of the locale, also when the keyboard layout
  gives another character.
- A paste that would not give the start of a number is read alone, in the display format. If it is a number, it
  replaces the whole text: `$1,234.50` pasted into a dollar field gives `1234.5`, also after typed digits. Else the
  field rejects it. A pasted negative number follows the minus sign rule above.
- A drop lands at the pointer, not at the selection, so it is read in the same way and always replaces the text. A
  field without focus commits it.
- An IME composition runs as usual. When it ends, the field keeps the result only if it is the start of a number.
  Full-width digits are accepted.
- Each change of the text that gives another number sets `value` and emits `igcInput`. A text that is not a number
  yet, such as `-`, keeps the last value.

#### Commit

The field commits an edit on <kbd>Enter</kbd> and when it loses focus. Without an edit, a value from code stays as it
is, also out of range or with more fraction digits than the format shows, and no `igcChange` goes out:

1. The value clamps to `min` and `max`, unless `validateOnly` is set.
2. The value rounds to the fraction digits of the format, with its `roundingMode`. Thus the value is what the user
   sees. A bound between two shown values gives the nearest shown value inside it: with `max="9.95"` and one fraction
   digit, `15` commits as `9.9`.
3. The field shows the committed value. An unchanged value is not written again, so a focus and a blur keep the field
   pristine, and a new `defaultValue` still sets the value.
4. If the value differs from the reported value, the value of the last `igcChange` or the last value set from code,
   the field emits `igcChange`.

A text that is not a number, such as `-`, gives the last value that the field read.

#### Range and steps

```html
<igc-number-input min="0" max="100" step="5"></igc-number-input>
```

- `step` is the increment of a step. It does not validate the value, and a step does not snap to a grid of steps:
  `7` plus `5` is `12`. The default is `1`, or `0.01` for a percent.
- The step math is decimal, so `0.1` plus `0.2` is `0.3`.
- A step from an empty field gives the seed, `0` fit into `min` and `max`, without a step.
- A step always stays in `[min, max]`, also with `validateOnly`. A step never moves the value against its direction:
  from a value above `max`, an increment does nothing.
- A step result rounds to the fraction digits of the format, within `min` and `max` as for the commit.
- A step finer than the last shown digit steps by that digit, so that each step changes the text: with no fraction
  digits, `step="0.5"` steps by `1`.
- `stepUp(n)` and `stepDown(n)` step from code. They emit no event. They read `n` as an integer, as the native methods
  do, so `stepUp(0.5)` does nothing.
- A read-only or disabled field does not step.

#### Spin buttons

```html
<igc-number-input label="Guests" min="1" max="12"></igc-number-input>
<igc-number-input label="Rate" hide-spin-buttons></igc-number-input>
```

- Two stacked buttons at the end of the field, after the suffix content, step the value up and down. The
  `hide-spin-buttons` attribute removes them. The keys and the wheel still step.
- The buttons are not in the tab order. The keyboard steps the value from the field.
- A mouse or pen press steps at once and moves the focus to the input, not to the button. The step emits `igcInput`,
  and the blur commits it with `igcChange`. A press of another mouse button does not step, and does not move the
  focus either.
- A touch press does not move the focus, so that no virtual keyboard opens. It steps on release, so that a scroll that
  starts on a button does not step. Each step emits `igcInput`; a field without focus commits the steps of the press
  once, at its end, with `igcChange`.
- A held press repeats the step after 400 ms, then every 60 ms, until the release, a canceled pointer, the blur, the
  bound or a render that removes the buttons. A held touch does not step again on release.
- A click without a pointer press, as from assistive technology, steps one time. The buttons set
  `touch-action: manipulation`, so the click of a tap comes within the press, without a double-tap delay, and a tap
  steps one time.
- A long press or a right-click on a button opens no context menu.
- A button is disabled when it cannot step: at its bound, also a bound between two shown values, against a value out of
  range, and while the field is read-only or disabled.
- The `increment-icon` and `decrement-icon` slots replace the icons.
- The buttons render inside the suffix wrapper, so the container has the `suffixed` part while they show.
- The buttons take the colors of the suffix from the input theme, also in dark mode. An enabled button shows a layer
  of its text color while the mouse is over it (8%) and while it is pressed (16%). A touch shows only the pressed
  layer.

#### Constraint validation

| Flag              | Condition                          | Slot              |
| ----------------- | ---------------------------------- | ----------------- |
| `valueMissing`    | `required` and the value is `null` | `value-missing`   |
| `rangeUnderflow`  | the value is below `min`           | `range-underflow` |
| `rangeOverflow`   | the value is above `max`           | `range-overflow`  |
| `customError`     | `setCustomValidity()` set a message | `custom-error`   |

- A value of `0` is a value: it does not fail `required`.
- The messages show `min` and `max` in the display format of the field, for example "$10.00".
- Without `validateOnly`, a committed value is always in range. A value typed out of range is invalid until the commit
  clamps it.
- A change from the user that fails validation shows the invalid state at once. This includes a step as the first
  change, for example while a custom error is set.

#### Form integration

```html
<form>
  <igc-number-input name="amount" value="10" required></igc-number-input>
</form>
```

- The form submits the value under `name` as a plain decimal string: ASCII digits, a `.` decimal separator, no group
  separators and no exponent, such as `1234.5` or `0.0000001`. An empty field submits nothing.
- A form reset restores `defaultValue`, which the `value` attribute sets.
- <kbd>Enter</kbd> commits the value first, then submits the form as a native text field does. See the
  [input specification](../input/spec.md#form-integration) for the implicit submission rules.

### Localization

- The locale is the own `locale`, else the own `lang`, else the `locale` or `lang` of the nearest ancestor, else the
  global locale.
- The display text, the edit text, the parser and the validation messages follow the locale.
- A locale change while the field is focused formats the edit text again.
- An invalid locale tag falls back to the global locale.
- The accessible names of the spin buttons come from the resource strings `number_input_increment` ("Increase value")
  and `number_input_decrement` ("Decrease value"). Set `resourceStrings` to replace them. Until `igniteui-i18n-core`
  has the keys, the strings are English in every locale.
- The package exports `INumberInputResourceStrings` and `NumberInputResourceStringsEN`. When `igniteui-i18n-core` has
  the keys, the package exports them from there under the same names, so no rename follows.

### Keyboard interactions

The keys work while the field is focused and not read-only. All other keys edit the text as in a native input.

| Key combination                                     | Result                                                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| <kbd>Up</kbd> / <kbd>Down</kbd>                     | Steps the value by `step`. A held key repeats.               |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd>             | Steps the value by 10 times `step`.                          |
| <kbd>Shift</kbd> + <kbd>Up</kbd> / <kbd>Down</kbd>  | Steps the value by 10 times `step`.                          |
| <kbd>Home</kbd> / <kbd>End</kbd>                    | Sets the value to `min` / `max`, as the field shows it, when it is set; else moves the caret. |
| <kbd>Enter</kbd>                                    | Commits the value, then submits the form.                    |
| <kbd>Escape</kbd>                                   | Reverts the edit to the reported value. The key goes on to the page only when there is nothing to revert, so a dialog still closes. |

### Mouse wheel

The wheel steps the value only while the field has focus and the pointer is on the input or on the spin buttons. A
wheel down steps down. A wheel over the prefix and suffix content goes to that content. A wheel with <kbd>Ctrl</kbd>
(zoom) and a mostly horizontal scroll are left to the page.

## API

### Properties and attributes

| Property           | Attribute     | Reflected | Type                       | Default | Description |
| ------------------ | ------------- | --------- | -------------------------- | ------- | ----------- |
| value              | value         | No        | `number \| null`           | `null`  | The value of the control, or `null` when it is empty. |
| min                | min           | No        | `number \| undefined`      | -       | The minimum value of the control. |
| max                | max           | No        | `number \| undefined`      | -       | The maximum value of the control. |
| step               | step          | No        | `number \| undefined`      | -       | The amount by which a step changes the value. Default is `1`, or `0.01` for a percent. |
| valueFormatOptions | -             | No        | `NumberInputFormatOptions` | -       | The format of the value. |
| locale             | locale        | No        | `string`                   | -       | The locale that formats and reads the value. |
| validateOnly       | validate-only | No        | `boolean`                  | false   | Whether a value out of range only fails validation. The user can type it, and the commit does not clamp it. |
| hideSpinButtons    | hide-spin-buttons | No    | `boolean`                  | false   | Whether the spin buttons are hidden. The keys and the mouse wheel still step the value. |
| resourceStrings    | -             | No        | `INumberInputResourceStrings` | -    | The texts of the component: the names of the spin buttons. |
| label              | label         | No        | `string`                   | -       | The label of the control. |
| placeholder        | placeholder   | No        | `string`                   | -       | The placeholder text of the control. |
| outlined           | outlined      | Yes       | `boolean`                  | false   | Whether the control has an outlined appearance. |
| readOnly           | readonly      | Yes       | `boolean`                  | false   | Whether the control is read-only. |
| required           | required      | Yes       | `boolean`                  | false   | Whether the control is required. |
| disabled           | disabled      | Yes       | `boolean`                  | false   | Whether the control is disabled. |
| invalid            | invalid       | No        | `boolean`                  | false   | Whether the control shows the invalid state. |
| name               | name          | Yes       | `string`                   | -       | The name of the control, submitted with the form data. |
| autofocus          | autofocus     | No        | `boolean`                  | false   | Whether the control receives focus automatically. |
| autocomplete       | autocomplete  | No        | `string`                   | -       | A hint for the browser on how to autofill the control. |
| inputMode          | inputmode     | No        | `string`                   | -       | The virtual keyboard. Default is `numeric` for an integer format without negative values, else `decimal`. |
| defaultValue       | -             | No        | `number \| null`           | `null`  | The default value of the control. A form reset restores the value to it. |

### Methods

| Name       | Parameters                | Description |
| ---------- | ------------------------- | ----------- |
| stepUp     | `n?: number`              | Increments the value by `n` steps, 1 by default. |
| stepDown   | `n?: number`              | Decrements the value by `n` steps, 1 by default. |
| select     | -                         | Focuses the control and selects all the text of the control. |
| focus      | `options?: FocusOptions`  | Sets focus on the control. |
| blur       | -                         | Removes focus from the control. |
| checkValidity, reportValidity, setCustomValidity | | As for the other form controls. |

### Events

| Name      | Cancelable | Description |
| --------- | ---------- | ----------- |
| igcInput  | No         | Emitted when the user changes the value. The detail is the new value. |
| igcChange | No         | Emitted when the user commits a changed value. The detail is the committed value. |

### Slots

| Name            | Description |
| --------------- | ----------- |
| prefix          | Renders content before the input. |
| suffix          | Renders content after the input. |
| helper-text     | Renders content below the input. |
| increment-icon  | Renders the icon of the increment button. |
| decrement-icon  | Renders the icon of the decrement button. |
| value-missing   | Renders content when the required validation fails. |
| range-overflow  | Renders content when the max validation fails. |
| range-underflow | Renders content when the min validation fails. |
| custom-error    | Renders content when a custom message is set with `setCustomValidity()`. |
| invalid         | Renders content when the component is in invalid state. |

### CSS Shadow parts

The parts of `igc-input`: `container`, `input`, `label`, `prefix`, `suffix`, `helper-text`, the `prefixed`, `suffixed`
and `filled` flags, and the material `start`, `notch`, `filler` and `end`. The `suffixed` flag is also set while the
spin buttons show. The spin buttons add:

| Name         | Description |
| ------------ | ----------- |
| spin-buttons | The wrapper of the spin buttons, at the end of the suffix wrapper. |
| increment    | The button that increments the value. |
| decrement    | The button that decrements the value. |

### CSS custom states

| Name       | Description |
| ---------- | ----------- |
| ig-invalid | Set while the control shows its invalid state. |

## Test scenarios

The suite has three files. [`number-input.spec.ts`](./number-input.spec.ts) runs the component in a real browser
through `@web/test-runner`, with `@open-wc/testing` fixtures and assertions.
[`number-format.spec.ts`](./number-format.spec.ts) tests the formatter and the parser without a DOM, and
[`number-format.property.spec.ts`](./number-format.property.spec.ts) checks their properties with fast-check. The
suite reuses the shared harness in [`src/internals/testing`](../../internals/testing):

| Shared helper | What it contributes |
| ------------- | ------------------- |
| `createFormAssociatedTestBed` | A `form` fixture around the control, exposing `formData`, `submit`, `reset` and `valid`. |
| `runValidationContainerTests` | Generated cases asserting that each validation slot renders for its failing constraint. |
| `runExternalLabelAssociationTests` | The external label, host naming and host description suite. |
| `runHiddenAncestorTests` | The hidden ancestor suite. |
| `runFocusBeforeRenderTests` | The focus before the first render suite. |
| `simulateBeforeInput / simulateCancelableKeydown / simulateWheel / simulatePointerDown / simulateClick` | Events that report whether a listener canceled them. |
| `ValidityHelpers` | Assertions for validity and the invalid styles. |
| `fc`, `orderedPair` | fast-check with the suite settings (`FC_SEED`, `FC_NUM_RUNS`), and ordered bounds. |

The groups below mirror the `describe` blocks of the suite.

### Default state

1. Passes the a11y audit.
2. Is empty, as a text field with the spinbutton role.

### Value

3. Reads numeric strings for min, max and step, as frameworks set them.
4. Sets no bound for an empty or non-numeric min and max attribute.
5. Normalizes the values that are not finite numbers.
6. Reads the value attribute with Number(), and takes it as the default.
7. Does not clamp, round or emit for a value from code.

### Display and edit text

8. Starts and ends the edit when readOnly changes during the focus.
9. Shows the display text without focus, and the edit text with focus.
10. Edits a currency and a percent without their symbols.
11. Selects all the text after a focus with Tab.
12. Exposes the value, the bounds and the display text.

### Format

13. Updates the text, and skips an update for an equal object.
14. Uses the default format for invalid options and warns.
15. Uses the locale, an inherited lang, and formats the edit text again on a change.
16. Derives the virtual keyboard, and takes an override.

### Typing

17. Takes digits after a minus sign from code when min is not negative.
18. Sets the value and emits igcInput for each new number.
19. Keeps a typed trailing decimal separator.
20. Rejects characters that cannot be part of a number.
21. Takes a typed space only as a group separator of the locale.
22. Rejects a minus sign when min is not negative.
23. Rejects a decimal separator for a format without fraction digits.
24. Keeps the last value while the text is not a number yet.
25. Types the decimal separator of the locale with the keypad key.
26. Replaces the text with a pasted number in the display format.
27. Reads a paste into existing text alone, and replaces the text.
28. Rejects a pasted negative number when min is not negative.
29. Takes an autofill without focus as a committed value.
30. Leaves the text of a composition to its end.
31. Keeps a composition that gives a number, and reverts one that does not.
32. Replaces the text with a dropped number, and rejects other drops.
33. Commits a number dropped on the control without focus.

### Commit

34. Rounds and clamps on blur, and emits igcChange once.
35. Commits on Enter and keeps the focus.
36. Emits nothing for a focus and a blur without a change.
37. Keeps a value out of range with validateOnly.
38. Gives the last value for a text that is not a number.
39. Takes a value from code during an edit as the new reported value.
40. Commits an edit when the control disconnects.
41. Commits a shown value inside a bound with more fraction digits.
42. Commits an emptied field as null.
43. Keeps a pending igcChange when code writes the current value.
44. Reports the clamp of a value from code after an edit of the text only.
45. Keeps a value from code after a focus, Enter and a blur without an edit.

### Escape

46. Reverts the edit and emits igcInput.
47. Leaves the key to the page when there is nothing to revert.
48. Reverts the text when only the text changed.
49. Shows the committed text on Enter when the value does not change.

### Keys

50. Steps with the arrow keys, and emits igcInput only.
51. Steps 10 times with PageUp, PageDown and Shift.
52. Goes to min and max with Home and End, or moves the caret without them.
53. Repeats a held key.
54. Steps from an empty value to 0 within the bounds.
55. Stays in the bounds, also with validateOnly.
56. Adds decimal steps without a floating-point error.
57. Steps a percent by 1% by default.
58. Does not step while read-only.
59. Ignores the keys of the prefix and suffix content.
60. Goes to the bounds as the field shows them with Home and End.

### Wheel

61. Steps while the control is focused.
62. Steps for a wheel over the spin buttons while focused.
63. Leaves the wheel to the page without focus, with Ctrl, or for a horizontal scroll.

### Methods

64. Steps with stepUp and stepDown, within the bounds and without events.
65. Focuses and selects all the edit text with select.
66. Keeps the selection of a select() before the focus.
67. Keeps a caret that is set after the focus.
68. Does not step while read-only or disabled.
69. Steps by the last shown digit when the step is finer.
70. Does not step against its direction, and reads n as an integer.

### Validation

The last case runs `runValidationContainerTests` for `value-missing`, `range-overflow`, `range-underflow`,
`custom-error` and `invalid`.

71. Takes 0 as a value for required.
72. Checks min and max, and ignores bounds that are not numbers.
73. Shows the bounds in the display format in the messages.
74. Shows the messages in the locale.
75. Styles a user step that fails validation at once.
76. Styles a spin button click without focus that fails validation at once.
77. Renders the message slots.

### Form integration

Driven by `createFormAssociatedTestBed`.

78. Submits nothing without a value.
79. Submits a plain decimal string.
80. Restores the default value on reset.
81. Reflects the disabled state of an ancestor.
82. Fulfils the required, min and max constraints.
83. Commits on Enter before it submits.
84. Stays pristine after a focus and a blur without an edit.
85. Stays pristine after a write from code of the current value.
86. Replaces a partial edit text on a reset to the same value.

### Spin buttons

#### Rendering

87. Renders two labeled buttons out of the tab order in the suffix wrapper.
88. Takes the labels from the resource strings.
89. Renders custom icons from the icon slots.
90. Hides the buttons with hide-spin-buttons.
91. Disables a button at its bound, and both while read-only or disabled.
92. Passes the a11y audit.

93. Disables a button that cannot step, also for a bound between shown values.

#### Pointer

94. Steps at once on a mouse press and focuses the input, not the button.
95. Repeats a held press after 400 ms every 60 ms, and stops on release.
96. Stops a held press at the bound.
97. Stops a held press on a canceled pointer and on blur.
98. Steps a touch on release, without focus, and commits it.
99. Does not step a touch that becomes a scroll.
100. Commits a held touch once, at its end.
101. Repeats a held touch without a step on release.
102. Keeps the focus in the input, and does not step, on a press of another button or a disabled one.
103. Steps one time for a click without a press, as from assistive technology.
104. Opens no context menu on a long press or a right-click.
105. Stops a held press when a render removes the buttons.
106. Stops a held press when the control disconnects.

107. Steps one time on a real mouse click and keeps the focus in the input.

### External label association

The shared suite (`runExternalLabelAssociationTests`): external labels, host naming and host description.

### Hidden ancestor

The shared suite (`runHiddenAncestorTests`).

### Focus before the first render

The shared suite (`runFocusBeforeRenderTests`).

### Number input format

#### Display and edit text

108. Shows the group separators, and edits the value without them.
109. Edits a currency amount without the currency symbol.
110. Edits a percent as its value times 100.
111. Uses the separators of the locale.
112. Uses the digits of the locale numbering system.
113. Keeps the bidi marks before a negative number in the edit text.
114. Returns an empty text for null.
115. Does not show a negative zero.
116. Does not round a value without a maximum number of fraction digits.
117. Keeps the fraction digits of the currency.

#### parse

118. Returns null for an empty text.
119. Returns NaN for a text that is not a number.
120. Reads the display text of each format.
121. Reads ASCII digits in every locale.
122. Reads full-width characters.
123. Reads the U+2212 minus sign and a trailing sign.
124. Reads a negative amount in parentheses.
125. Reads an apostrophe as the Swiss group separator.
126. Reads any space as the French group separator.
127. Reads `.` or `,` as the decimal separator when it is not a group separator.
128. Reads a number with no integer digits or no fraction digits.
129. Rejects the symbols of another format.
130. Divides a percent by 100 without a floating-point error.
131. Returns zero for a negative zero.
132. Returns NaN for a number out of the double range.

#### isValidPartial

133. Accepts the start of a number.
134. Rejects a character out of place.
135. Accepts a space only as a group separator of the locale.
136. Rejects a minus sign when negative numbers are not allowed.
137. Rejects a decimal separator when the format has no fraction digits.
138. Accepts the edit text in the digits of the locale.

#### round

139. Rounds to the maximum number of fraction digits.
140. Follows the rounding mode.
141. Rounds a percent at the digits it shows.

#### spin

142. Steps by `step`, else by 1, or 0.01 for a percent.
143. Steps by the last shown digit when `step` is finer.
144. Stops at the bounds on a shown value.
145. Gives an empty value the seed: 0, fit into the bounds, without a step.
146. Does not move a value against the direction of the step.
147. Keeps the value for a count of 0.

#### getNumberInputFormat

148. Gives the value change of one unit in the last shown digit.
149. Returns the same format for the same locale and options.
150. Ignores options that the input cannot parse back.
151. Uses the default format for invalid options and warns.
152. Uses the global locale for an invalid locale.
153. Has the decimal separator of the locale.

#### formatFormValue

154. Returns plain ASCII digits with no group separator and no exponent.
155. Returns the shortest text that reads back as the same number.
156. Does not return a negative zero.

### Number input format properties

157. Keeps a value that has no more decimals than the format shows.
158. Rounds any value once, as close as the format shows it, and reads its display text back.
159. Accepts each start of an edit text as a partial number.
160. Parses any text without throwing, and returns null only for a blank text.
161. Fits a value into its bounds, on a shown value when the bounds allow one.

#### spin

162. Never moves a value against the direction of the step.
163. Stays in range from an empty value or a value in range, on a shown value.
164. Spins an empty value to 0, fit into the bounds.

165. Formats a form value that reads back as the same number.

### Not covered by the suite

- Real touch devices. The touch cases use synthetic pointer events. A tap was checked by hand with Playwright touch
  emulation in Chromium, Firefox and WebKit: each tap steps one time.
- Screen reader output. See [Assumptions and limitations](#assumptions-and-limitations).
- The layout of the spin buttons in each theme, size, variant and direction. It was checked with screenshots.

## Assumptions and limitations

- The value is a JavaScript `number`, so a value with more than 15 significant digits can lose precision.
- In a locale where `.` is the group separator, such as German, `1.5` reads as 15. The display text after the commit
  shows the result.
- The form value is exact down to about `1e-83`, the limit of 100 fraction digits of `Intl.NumberFormat`.
- No screen reader has checked the `spinbutton` role or a spin button press yet. A press keeps the focus in the
  input and changes `aria-valuenow` and `aria-valuetext`; no live region announces the value. If a screen reader does
  not announce it, a live region follows, and if VoiceOver cannot edit a spinbutton text field, the role changes.
- The spin buttons have no per-theme design. They take the suffix tokens of each input theme until the design team
  gives a design, and igniteui-theming has no number input schema.
- The spin button names are English in every locale until `igniteui-i18n-core` has the keys. See
  [Localization](#localization).
- The component has its own `required`, `min` and `max` validators. The shared validators treat `null` as a value and
  `0` as no value, and they show the bounds as plain numbers. The messages here show the bounds in the display format.

## Accessibility

### ARIA roles and properties

- The native input has `role="spinbutton"`, as the [APG spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/)
  describes.
- `aria-valuenow` is the value. It is left out while the value is `null`.
- `aria-valuemin` and `aria-valuemax` are `min` and `max` when they are set.
- `aria-valuetext` is the display text, so a screen reader reads `$1,234.50`, not `1234.5`.
- `aria-required` reflects `required`, and `aria-invalid` is `true` while the control shows its invalid state.
- The naming order, the external labels and the helper text work as in the other inputs. See the
  [input specification](../input/spec.md#naming-order).
- The spin buttons are native buttons with a localized `aria-label` and `aria-controls` that points to the input. They
  are not in the tab order, as the APG pattern says, but they stay in the accessibility tree, so that touch screen
  reader users can activate them.
- A spin button press keeps the focus in the input and changes `aria-valuenow` and `aria-valuetext`. No live region
  announces the value. See [Assumptions and limitations](#assumptions-and-limitations).

### Keyboard support

See [Keyboard interactions](#keyboard-interactions).

### Right to Left support

The prefix and suffix positions, the label alignment and the helper text follow the inline direction. The edit text
keeps the bidi marks of the locale before a negative number.
