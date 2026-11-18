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
    - [Display and edit text](#display-and-edit-text-1)
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
    - [parse](#parse)
    - [isValidPartial](#isvalidpartial)
    - [round](#round)
    - [getNumberInputFormat](#getnumberinputformat)
    - [formatFormValue](#formatformvalue)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)
  - [Limitations](#limitations)

## Revision history

| Version | Date       | Notes                                          |
| ------: | ---------- | ---------------------------------------------- |
|       1 | 2026-11-17 | Initial specification, without spin buttons    |
|       2 | 2026-11-17 | Spin buttons, `hideSpinButtons`, `resourceStrings` |
|       3 | 2026-11-17 | `select()` focuses first; a `select()` before the focus keeps its selection |
|       4 | 2026-11-17 | Hover and pressed layers of the spin buttons |
|       5 | 2026-11-17 | Review fixes: values from code during an edit, the commit in range, steps finer than the format, `readOnly` during the focus, disconnect, empty bound attributes, presses of other buttons |
|       6 | 2026-11-18 | Review fixes: a same-value write keeps the edit, numeric-string bounds and step, a commit only after an edit, a reset replaces a partial text, steps never move against their direction, integer step counts, spin buttons disabled when they cannot step, Home and End to shown values, a held touch commits once, drops replace the text |

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
- A value set from code is not clamped and not rounded. A value out of range shows the invalid state.
- A value from code during an edit, from `value`, `stepUp()`, `stepDown()` or a form reset, replaces the text and is the
  new start of the edit: Escape keeps it, and the blur emits no `igcChange` for it. A write of the current value
  changes nothing, as a framework repeats it on each render. A form reset also replaces a partial text, such as `-`.
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
  - the group separators of the locale;
  - a leading plus sign, and a leading minus sign when `min` is not set or is below 0, or `validateOnly` is set. A text
    that already has a minus sign, as a value from code can give, takes more digits.
- A `.` or `,` that is not the group separator of the locale is also a decimal separator. Thus a French user can type
  `1.5`. In German, `.` is the group separator, so `1.5` is 15.
- The decimal key of the numeric keypad types the decimal separator of the locale, also when the keyboard layout
  gives another character.
- A paste that would not give the start of a number is read in the display format. If it is a number, it replaces the
  text: `$1,234.50` pasted into a dollar field gives `1234.5`. Else the field rejects it.
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
4. If the value is not the value at the start of the edit or at the last commit, the field emits `igcChange`.

A text that is not a number, such as `-`, gives the last value that the field read.

#### Range and steps

```html
<igc-number-input min="0" max="100" step="5"></igc-number-input>
```

- `step` is the increment of a step. It does not validate the value, and a step does not snap to a grid of steps:
  `7` plus `5` is `12`. The default is `1`, or `0.01` for a percent.
- The step math is decimal, so `0.1` plus `0.2` is `0.3`.
- A step from an empty field gives `0`, clamped to `min` and `max`.
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
- A click without a pointer press, as from assistive technology, steps one time.
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

### Keyboard interactions

The keys work while the field is focused and not read-only. All other keys edit the text as in a native input.

| Key combination                                     | Result                                                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| <kbd>Up</kbd> / <kbd>Down</kbd>                     | Steps the value by `step`. A held key repeats.               |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd>             | Steps the value by 10 times `step`.                          |
| <kbd>Shift</kbd> + <kbd>Up</kbd> / <kbd>Down</kbd>  | Steps the value by 10 times `step`.                          |
| <kbd>Home</kbd> / <kbd>End</kbd>                    | Sets the value to `min` / `max`, as the field shows it, when it is set; else moves the caret. |
| <kbd>Enter</kbd>                                    | Commits the value, then submits the form.                    |
| <kbd>Escape</kbd>                                   | Reverts the edit to the last committed value. The key goes on to the page only when there is nothing to revert, so a dialog still closes. |

### Mouse wheel

The wheel steps the value only while the field has focus and the pointer is on the field. A wheel down steps down.
A wheel with <kbd>Ctrl</kbd> (zoom) and a mostly horizontal scroll are left to the page.

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
| validateOnly       | validate-only | Yes       | `boolean`                  | false   | Whether a value out of range only fails validation. The user can type it, and the commit does not clamp it. |
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
| stepUp     | `n: number = 1`           | Increments the value by `n` steps. |
| stepDown   | `n: number = 1`           | Decrements the value by `n` steps. |
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

### Default state

An empty value, `null`; a text input with the spinbutton role; no `aria-valuenow`; the axe audit passes.

### Value

Numbers, numeric strings, `NaN`, `Infinity` and `-0` normalize; the `value` attribute sets the default; a value from
code is not clamped or rounded and emits no event; an empty or non-numeric bound attribute sets no bound; numeric
strings for `min`, `max` and `step`.

### Display and edit text

The swap on focus and blur; a read-only field keeps the display text; `readOnly` changes during the focus; select all
after a Tab focus; currency and percent; the value, the bounds and the display text in the ARIA attributes.

### Format

`valueFormatOptions` updates the text, and an equal object does not update the field; invalid options warn; `locale`,
an inherited `lang` and a locale change while focused; the derived `inputmode` and its override.

### Typing

`igcInput` for each new number; a trailing decimal separator stays; the filter rejects letters, a second decimal
separator, a minus sign when `min` is not negative, and a decimal separator for an integer format; a partial text keeps
the value; digits after a minus sign from code; the keypad decimal key; paste in the display format; a drop replaces
the text, also without focus; autofill without focus; composition.

### Commit

Blur and Enter round, clamp and emit `igcChange` once; no event without a change; `validateOnly` keeps an out-of-range
value; a partial text gives the last value; a value from code during an edit is the new baseline, and a write of the
current value keeps the pending change; no commit without an edit; an emptied field commits `null`; a disconnect
commits; a bound with more fraction digits gives a shown value inside it.

### Escape

Reverts the edit and emits `igcInput`; without an edit, the key is not canceled.

### Keys

Arrows, Shift, PageUp and PageDown; Home and End with and without bounds, to shown values; repeat; an empty start; the
bounds; decimal steps; the percent step; read-only; the keys of slotted content.

### Wheel

Steps only while focused; `ctrlKey` and horizontal scrolls are left to the page.

### Methods

`stepUp` and `stepDown` stay in the bounds and emit nothing; `select` focuses and selects the edit text; a `select()`
of the inner input before its focus keeps the selection (the order of Playwright `fill()`), and a caret set after the
focus stays; a step finer than the last shown digit steps by that digit; no step against the direction; integer
counts; no step while read-only or disabled.

### Validation

`required` with `0`; `min` and `max`; bounds that are not numbers; the bounds in the display format and in the locale
in the messages; the message slots.

### Form integration

The submitted string; nothing without a value; reset to the default value; the disabled ancestor; the constraints;
Enter commits before it submits; a focus and a blur keep the field pristine; a reset replaces a partial text.

### Spin buttons

Two labeled buttons out of the tab order in the suffix wrapper; the resource strings; the icon slots;
`hide-spin-buttons`; disabled at the bounds, at a bound between shown values, against a value out of range and while
read-only or disabled; the axe audit. A mouse press steps at once
and focuses the input; a held press repeats and stops on release, at the bound, on a canceled pointer, on blur and on
disconnect; a touch steps on release, without focus, and commits; a held touch commits once; a scroll does not step; a held touch does not step
again on release; a press of another button or a disabled one keeps the focus and does not step; a render that
removes the buttons stops a held press; a click without a press steps one time; a real mouse click steps one time and
keeps the focus in the input.

### External label association

The shared suite: external labels, host naming and host description.

### Hidden ancestor

The shared suite.

### Focus before the first render

The shared suite.

The parser and formatter in `number-format.spec.ts` and `number-format.property.spec.ts` have these blocks:

### parse

Empty and blank texts; texts that are not numbers; the display texts of the formats and locales; ASCII and full-width
digits; minus signs and a trailing sign; accounting parentheses; the Swiss and French group separators; `.` and `,`
as the decimal separator; foreign symbols; percent division; a negative zero; numbers out of the double range.

### isValidPartial

The start of a number; characters out of place; a minus sign that is not allowed; a decimal separator in an integer
format; the digits of the locale.

### round

The fraction digits; the rounding modes; a percent; values that are not finite.

### getNumberInputFormat

The cache; options that cannot be read back; invalid options; an invalid locale; the decimal separator; the smallest
step.

### formatFormValue

Plain ASCII decimals with no group separator and no exponent; the shortest text that reads back; no negative zero.

The property specs check that a value with no more decimals than the format shows survives both texts, that any value
rounds once and reads back from its display text, that each start of an edit text is a partial number, that any text
parses without an error, and that the form value reads back as the same number.

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
- A spin button press keeps the focus in the input. Whether a screen reader announces the new `aria-valuenow` then is
  checked before release; if it does not, a live region announces the value.
- The role is checked with screen readers before release. If VoiceOver cannot edit a spinbutton text field, the role
  changes to a text box with a role description.

### Keyboard support

See [Keyboard interactions](#keyboard-interactions).

### Right to Left support

The prefix and suffix positions, the label alignment and the helper text follow the inline direction. The edit text
keeps the bidi marks of the locale before a negative number.

## Limitations

- The value is a JavaScript `number`, so a value with more than 15 significant digits can lose precision.
- In a locale where `.` is the group separator, such as German, `1.5` reads as 15. The display text after the commit
  shows the result.
- The form value is exact down to about `1e-83`, the limit of 100 fraction digits of `Intl.NumberFormat`.
- The spin buttons have an interim layout until the design of the themes is ready.
- The spin button names are English in every locale until `igniteui-i18n-core` has the keys.
