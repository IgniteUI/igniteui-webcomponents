# Date range picker specification

- [Date range picker specification](#date-range-picker-specification)
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
      - [Value type](#value-type)
      - [Basic initialization](#basic-initialization)
      - [Single input and two inputs](#single-input-and-two-inputs)
      - [Picker mode](#picker-mode)
      - [Predefined and custom ranges](#predefined-and-custom-ranges)
      - [Display and input formats](#display-and-input-formats)
      - [Constraint validation](#constraint-validation)
      - [The active date](#the-active-date)
      - [Slots and templating](#slots-and-templating)
      - [Programmatic control](#programmatic-control)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Form integration](#form-integration)
    - [Behaviors](#behaviors)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom states](#css-custom-states)
    - [CSS custom properties](#css-custom-properties)
  - [Test scenarios](#test-scenarios)
    - [Rendering and initialization](#rendering-and-initialization)
    - [Common properties](#common-properties)
    - [Value rules](#value-rules)
    - [Value state motion](#value-state-motion)
    - [Locale week start](#locale-week-start)
    - [Validation messages](#validation-messages)
    - [Each layout](#each-layout)
    - [Single input properties](#single-input-properties)
    - [Single input localization](#single-input-localization)
    - [Scroll strategy](#scroll-strategy)
    - [Single input methods](#single-input-methods)
    - [Single input interactions](#single-input-interactions)
    - [Single input slots](#single-input-slots)
    - [Two inputs rendering and initialization](#two-inputs-rendering-and-initialization)
    - [Two inputs properties](#two-inputs-properties)
    - [Two inputs localization](#two-inputs-localization)
    - [Validity of the editors](#validity-of-the-editors)
    - [Two inputs interactions](#two-inputs-interactions)
    - [Two inputs slots](#two-inputs-slots)
    - [Form integration in each layout](#form-integration-in-each-layout)
    - [Single input form integration](#single-input-form-integration)
    - [Two inputs form integration](#two-inputs-form-integration)
    - [Predefined ranges area](#predefined-ranges-area)
    - [Range mask parser - Parser initialization](#range-mask-parser---parser-initialization)
    - [Range mask parser - Date Range Parsing](#range-mask-parser---date-range-parsing)
    - [Range mask parser - Date Range Formatting](#range-mask-parser---date-range-formatting)
    - [Range mask parser - Part Queries](#range-mask-parser---part-queries)
    - [Range mask parser - Range part spinning](#range-mask-parser---range-part-spinning)
    - [Range mask parser - Prompt Updates](#range-mask-parser---prompt-updates)
    - [Range mask parser - Mask Updates](#range-mask-parser---mask-updates)
    - [Range mask parser properties - Parsing and formatting](#range-mask-parser-properties---parsing-and-formatting)
    - [Range mask parser properties - Part editing](#range-mask-parser-properties---part-editing)
    - [Range value shape](#range-value-shape)
    - [Range value shape properties](#range-value-shape-properties)
    - [Range editors](#range-editors)
    - [Host ARIA](#host-aria)
    - [Disabled popup](#disabled-popup)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                     |
| ------: | ---------- | ------------------------------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                                                     |
|       2 | 2026-09-23 | Expose the `ranges` part and add it to the test scenarios                 |
|       3 | 2026-09-24 | Describe the naming order and the host ARIA naming                        |
|       4 | 2026-09-28 | Add the property-based range mask parser suite                            |
|       5 | 2026-09-28 | Validate a value and bounds set before the first render                   |
|       6 | 2026-10-02 | Focus after form checks; `invalid` only on checks                         |
|       7 | 2026-10-02 | Forward the host `aria-describedby`; expose `required` as `aria-required` |
|       8 | 2026-10-14 | An editor commit marks the picker touched; a reset resets the editors     |
|       9 | 2026-10-21 | API descriptions aligned with the JSDoc.                                  |
|      10 | 2026-10-21 | A value set from code, also with `select()`, is not reported on Done      |
|      11 | 2026-10-23 | The date range input makes a stacking context, so the z-index of the input and the container does not compete with the layers of the page |
|      12 | 2026-10-26 | Last 7 Days selects 7 days, counting today; the built-in ranges use the date of the click |
|      13 | 2026-10-28 | The picker projects only `aria-haspopup`, `aria-required` and labels onto the editor |
|      14 | 2026-10-29 | The `overlay` part is removed; the dialog backdrop is the native `::backdrop` of `dialog-base` |
|      15 | 2026-11-02 | A `focus()` call before the first render applies after the render; `focus()` and `blur()` in the API |
|      16 | 2026-11-04 | In dialog mode, an open and a close play the animations of the dialog; a canceled `igcClosing` keeps the dialog open |
|      17 | 2026-11-05 | Done and Cancel change the range only when the close goes on; Done emits `igcChange` after `igcClosing` |
|      18 | 2026-11-06 | A closed picker does not cancel <kbd>Escape</kbd> |
|      19 | 2026-11-11 | <kbd>Enter</kbd> submits as in a native form, after the `keypress`; <kbd>Enter</kbd> in slotted content does not submit a second time |
|      20 | 2026-11-18 | A clear is reported on blur in dialog and non-editable mode, also after an open and a close; a range chip keeps the dropdown open with `keepOpenOnSelect`; a range that `hide()` leaves unconfirmed stays unconfirmed |
|      21 | 2026-11-18 | The editors show only the invalid state of the picker, and report the validity of the picker also while it is pristine |
|      22 | 2026-11-18 | The single input spins each end like a date-time input; a spin in a typed end keeps the text of the other end; an empty end takes today without a step; <kbd>Ctrl</kbd> + arrow stops at each part edge; the single input is editable in dropdown mode, as the code does |
|      23 | 2026-11-18 | Add the strict and the lenient value parse to the range mask parser property suite |
|      24 | 2026-11-18 | An empty range is `null`; reversed ends are swapped on every write; the ends keep their time; a clear is reported when the focus leaves the picker; a value write brings the range into view unless `activeDate` is set, and a render no longer moves the calendar back to `activeDate` |
|      25 | 2026-11-19 | In single input mode, typing or a spin brings the end at the caret into view, as the focused editor does with two inputs; the input and change events of slotted content no longer change the value; an editor that a layout change removes commits nothing; add the range editors suite; the scenarios of both layouts run once per layout in the common suite and in one form suite |
|      26 | 2026-11-19 | A change of `name` renames the submitted `-start` and `-end` entries at once |
|      27 | 2026-11-20 | A form reset discards the text typed in the editors that is not committed, so the next blur does not commit it; a reset that empties the value shows the empty mask in the focused editor |
|      28 | 2026-11-20 | The ends of a range accept an ISO string with a signed six digit year; the value shape properties use any valid date |
|      29 | 2026-11-23 | A disabled picker stays closed and disabling discards a draft; the shared disabled popup suite |
|      30 | 2026-11-20 | A range that the user picks animates the inputs; a value from code, also from an `igcChange` handler, shows at once |
|      31 | 2026-11-27 | Test scenarios mirror the `describe` blocks: one group per block of the common, single input, two inputs and form suites, and `Range mask parser - …` groups per parser block; the whole-suite groups go to the suite list |
|      31 | 2026-11-25 | While the user types, an incomplete or invalid end keeps the end that the calendar selects, and a blank end drops out, in both layouts; the calendar shows the value again when the edit ends, and with two inputs a new range from code keeps the edit of an end whose date stays; a complete range parses strictly when the separator holds the prompt |
|      32 | 2026-11-25 | `name` and `readOnly` update their attributes at once |
|      33 | 2026-11-25 | The first render shows the slotted content |
|      34 | 2026-11-27 | The focused single input shows every digit of a year past 9999 or before year 1, for each end; the calendar stays in the years 1 to 9999 |

## Overview

The `igc-date-range-picker` includes a text input and a calendar pop-up, letting end-users select a start and an end
date. The calendar opens either in a popover anchored to the field (**dropdown** mode) or in a modal dialog
(**dialog** mode).

The picker has two display modes for the value: a **single input**, which renders both dates in one field, and
**two inputs**, which renders separate start and end editors. In dropdown mode both modes are editable. The value is a
`DateRangeValue` - `{ start: Date | null, end: Date | null }` - or `null` when the range is empty.

The component composes [`igc-calendar`](../calendar/spec.md) in range selection mode and
[`igc-date-time-input`](../date-time-input/spec.md) for the editable surfaces, and it is a form-associated custom
element.

### Key features

- **Two value display modes**: a single field with both dates, or two inputs with a separator.
- **Two presentation modes**: an anchored dropdown or a modal dialog with Done and Cancel actions.
- **Range selection**: the composed calendar runs in range mode and shows two months by default.
- **Predefined ranges**: a set of built-in range chips - last 7 days, current month, last 30 days, year to date -
  and application-defined custom ranges.
- **Constraint validation**: `required`, `min`, `max` and `disabledDates`, evaluated against both ends of the range.
- **Locale awareness**: input and display formats, calendar strings, the separator and the action buttons all
  resolve from the active locale.
- **Form association**: submits with the form, resets to `defaultValue`, and reacts to a disabled ancestor fieldset.
- **Rich templating**: per-input icons and slots, a calendar title, a header date, a separator and an action area.

### Acceptance criteria

The `igc-date-range-picker` must:

- let users specify a date range either by typing it, in one input or in two inputs for the start and the end value,
  or by picking a range through its calendar component.
- display the range as a single input field showing both dates, or as two inputs.
- have dropdown and dialog modes for opening the calendar.
- open the calendar by clicking a toggle icon in dropdown mode, and by clicking the toggle icon or the input in
  dialog mode.
- be form associated and, when configured as part of a form, participate in form submission and validation.
- support navigating and editing the input parts with a keyboard.
- support navigating and selecting in the calendar with a keyboard.
- support navigating in and out of the component with a keyboard alone.
- inform the end-user whether the entered dates are valid and within the configured range.
- let the end-user select a range by activating one of a set of predefined range chips.
- be integrated and themeable with the theming mechanism of the library.
- be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- select a start and an end date by drawing a range in a calendar.
- type the start and the end date directly when the picker exposes two inputs.
- pick a common range - the last 7 days, the current month - with a single click.
- see both dates rendered in a readable, locale-appropriate format.
- clear the whole range with a single click.
- confirm or cancel my selection when the calendar is presented as a dialog.
- be told when the range I entered is required, incomplete, or outside the allowed window.

### Developer stories

As a developer, I expect to be able to:

- bind a `{ start, end }` value, as an object or through a JSON attribute.
- choose between the single input and the two inputs presentation.
- present the calendar as a dropdown or as a modal dialog.
- offer the built-in predefined ranges, and define my own custom ranges.
- set the input and the display format for both editors at once.
- set `min`, `max` and `disabledDates` which drive both the calendar and the validity.
- label the two editors separately, and place separate icons and content around each.
- open, close and toggle the picker programmatically, and select a range programmatically.
- submit the range as part of a native form and have it reset correctly.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/design/yflYezgkYi5MRpslW3TXye/Date-Range-Picker?m=auto&node-id=0-1&t=uWyhd8xkwvOvpyyT-1)

[End-to-end user experience prototype](https://www.figma.com/proto/yflYezgkYi5MRpslW3TXye/Date-Range-Picker?node-id=2110-34626&t=ARtBKtihhvmG85KO-1)

**Visual structure**

- In single input mode, one field renders both dates separated by the localized separator, with a calendar
  icon that toggles the picker and a clear icon while there is a value.
- In two inputs mode, two editable fields are rendered with the separator between them, each with its own label,
  placeholder, calendar icon and clear icon.
- The calendar surface renders two months by default, in range selection mode. In dialog mode it also renders a
  header and the Cancel and Done actions.
- The predefined and custom range chips, when enabled, are rendered above the calendar.

**Selecting**

- Drawing a range in the calendar fills the start on the first activated date and the end on the second.
- In dropdown mode the inputs reflect each selection immediately, and `igcChange` is emitted on each of the two
  activations.
- In dialog mode the inputs also reflect the selection immediately, but the value is committed - and `igcChange`
  emitted - only when Done is pressed or the dialog is dismissed by clicking outside. Cancel reverts the values.
- Activating a range chip in dropdown mode applies the range and closes the picker; in dialog mode the dialog stays
  open.

**Typing**

- In two inputs mode, each editor behaves as an [`igc-date-time-input`](../date-time-input/spec.md): a mask derived
  from the input format, deferred commit on blur, and spinning of the part under the caret.
- Typing a date selects it in the calendar and brings its month into view. The date is the one in the focused editor
  with two inputs, and the end at the caret in single input mode. While that date is incomplete, or while the caret is
  in the separator, the start comes into view, or the end when there is no start.
- Each end of the calendar selection follows its typed date on its own. While a typed end is incomplete or invalid,
  the calendar keeps the end that it selects, and a blank end drops out of the selection. The value does not change
  until the edit is committed.
- In single input mode the field is editable in dropdown mode and read-only in dialog mode. Each end spins like a
  date-time input, with the same step rules and the day of the start date as the default part. A spin while you
  type reads the typed text of its end and keeps the text of the other end, also a `stepUp` or `stepDown` from code,
  which commits the value at once. An empty range spins to today at both
  ends, and an empty end to today, both without a step.

**Motion.** A range that the user picks or types animates the inputs, such as the Material label that moves up. A value
from code shows at once, also a value that an `igcChange` handler sets. The common suite covers a calendar pick and a
handler value; the [date-time input](../date-time-input/spec.md) suite covers a typed value and a value from code.

### Developer experience

#### Value type

```typescript
interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}
```

#### Basic initialization

```html
<igc-date-range-picker label-start="Start date" label-end="End date"></igc-date-range-picker>
```

With an initial value through the attribute, as JSON:

```html
<igc-date-range-picker
  value='{"start":"2025-04-13T21:00:00.000Z","end":"2025-04-14T21:00:00.000Z"}'
></igc-date-range-picker>
```

#### Single input and two inputs

```html
<!-- One field rendering both dates (default) -->
<igc-date-range-picker label="Reporting period"></igc-date-range-picker>

<!-- Two editable fields -->
<igc-date-range-picker use-two-inputs label-start="From" label-end="To"></igc-date-range-picker>
```

`useTwoInputs` renders a start and an end editor. In dropdown mode the user can type in either layout; in dialog mode,
and with `nonEditable` or `readOnly`, the editors are read-only and the range is changed through the calendar or the
range chips. A change of `useTwoInputs` or `mode` drops the text that the user types in the editors it replaces. An
editor that the change removes commits nothing, also when it loses the focus before the next render.

#### Picker mode

```html
<igc-date-range-picker mode="dropdown"></igc-date-range-picker>
<igc-date-range-picker mode="dialog"></igc-date-range-picker>
```

In dialog mode the calendar is presented modally with Cancel and Done actions, and the value is committed only on
Done or on dismissing the dialog.

#### Predefined and custom ranges

```html
<igc-date-range-picker usePredefinedRanges></igc-date-range-picker>
```

```typescript
interface CustomDateRange {
  label: string;
  dateRange: DateRangeValue;
}

picker.customRanges = [
  {
    label: 'This quarter',
    dateRange: { start: new Date(2026, 6, 1), end: new Date(2026, 8, 30) },
  },
];
```

The chips are rendered by an internal `igc-predefined-ranges-area` component. The built-in set is Last 7 Days,
Current Month, Last 30 Days and Year to Date, and its labels come from the resource strings. Last 7 Days and
Last 30 Days end today and count today as one of their days. The ranges use the date of the click.

#### Display and input formats

```html
<igc-date-range-picker display-format="yyyy-MM-dd" input-format="yyyy-MM-dd"></igc-date-range-picker>
```

Both formats apply to both editors. For the supported tokens see the
[input format](../date-time-input/spec.md#input-format) and
[display format](../date-time-input/spec.md#display-format) sections of the date time input.

#### Constraint validation

`min` and `max` bound the valid window, `disabledDates` excludes individual dates or ranges, and `required` makes an
empty picker invalid. Both ends of the range are checked against `min` and `max`; the control is invalid when either
end fails. The editors show the invalid state of the picker, and no invalid state of their own. So in two inputs mode,
an editor does not show the invalid styles when the focus moves from it to the other editor before the picker is
invalid.

```html
<igc-date-range-picker required min="2026-01-01" max="2026-12-31">
  <span slot="value-missing">Please pick a reporting period</span>
  <span slot="range-underflow">The period starts before the allowed window</span>
  <span slot="range-overflow">The period ends after the allowed window</span>
  <span slot="invalid">Please select another range</span>
</igc-date-range-picker>
```

See the [validation container specification](../validation-container/spec.md) for the message slot mechanism.

#### The active date

- The calendar active date is the `activeDate` property of the picker, when it is set.
- With no `activeDate` and no value, the internal active date of the calendar is used, which defaults to the current
  date.
- With a value assigned, the first defined date of the range becomes the active date:

```text
{ start: startDate, end: null }      -> active date is startDate
{ start: startDate, end: endDate }   -> active date is startDate
{ start: null, end: endDate }        -> active date is endDate
```

- Without `activeDate`, each change of the value brings its first defined date into view, also a change from code
  while the calendar is open. A date in a month that the calendar shows keeps the months in view. With `activeDate`
  set, a change of the value does not move the calendar, and the user can navigate away from `activeDate`.
- An open by the user, from the calendar icon, a click on the input in dialog mode or <kbd>Alt</kbd> +
  <kbd>Arrow Down</kbd>, shows `activeDate`, else the first defined date of the range, else the current active date,
  in the first month.
- While typing, the active date follows the last modified date. Clearing both values by typing leaves the active
  date at the last one assigned.

#### Slots and templating

```html
<igc-date-range-picker label="..." mode="dialog" display-format="yyyy/MM/dd">
  <p slot="title">Select a reporting period</p>
  <span slot="separator">&rarr;</span>
  <igc-icon slot="calendar-icon" name="calendar"></igc-icon>
  <p slot="invalid">Please, select another range</p>
</igc-date-range-picker>
```

In two inputs mode the prefix, suffix, calendar icon and clear icon slots and parts exist in `-start` and `-end`
variants, so each editor can be templated separately.

#### Programmatic control

```typescript
const picker = document.querySelector('igc-date-range-picker')!;

await picker.show();
await picker.hide();
await picker.toggle();

picker.select({ start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) });
picker.clear();
```

#### Labeling from the light DOM

Besides the `label`, `labelStart` and `labelEnd` properties, the picker can be labelled by a `label` element in the
light DOM, through `for` or by nesting it. An IDREF does not cross a shadow boundary, so the picker resolves its
labels through `ElementInternals` and projects them - together with its own `aria-haspopup` and `aria-required` -
onto the native input of the editor it wraps, as element references. Clicking
the external label focuses the editor.

The name follows the [naming order](../input/spec.md#naming-order), so the host `aria-labelledby` and `aria-label` also
name the control.

#### Form integration

```html
<form>
  <igc-date-range-picker name="period" required></igc-date-range-picker>
  <button type="submit">Report</button>
</form>
```

- The range is submitted under `name`. A change of `name` renames the entries at once.
- A form reset restores `defaultValue` and clears the touched and invalid state of the editors. It also discards the
  text typed in the editors that is not committed yet, so the next blur does not commit it over the restored value.
- An invalid picker blocks submission.
- <kbd>Enter</kbd> in an editor submits the owning form when the picker is valid. The picker counts as one text field,
  also with two inputs, and <kbd>Enter</kbd> submits as in a native text field (see the
  [input specification](../input/spec.md#form-integration)): through the default button, or from the only text field
  of a form with no submit button. A `keydown` or `keypress` listener that calls `preventDefault()` stops the
  submission. <kbd>Enter</kbd> in the content of the `prefix` and `suffix` slots belongs to that content, so the picker
  does not submit for it.

As for a native control, a failed submit or `form.reportValidity()` moves the focus to the first invalid control of
the form, and `reportValidity()` moves it to the control when it is invalid. `form.checkValidity()` and
`checkValidity()` do not move the focus. The `invalid` event comes only from these checks and from a failed submit,
not while the user edits the control.

### Behaviors

**One form of the value.** Every write normalizes the range: from code, from the `value` attribute, as the default,
from the editors, from the calendar and from a range chip. A range with no dates is `null`, also before a value is
set. Reversed ends are swapped, compared by time, so `{ start: June 10, end: June 1 }` reads back as
`{ start: June 1, end: June 10 }`. The ends keep their time. The `igcInput` detail is normalized the same way, while
the editors keep the text as typed.

**Clearing the inputs.** A clear through the clear icon is reported with `igcChange` one time, with `null`, when the
focus leaves the picker, or when Done or an outside click closes the dialog, also when the picker opens and closes in
between. A move of the focus to the other input does not report it. While the control is `readOnly`, clicking the
clear icon does not clear the value.

**Selecting from the calendar.** In dropdown mode, activating the first date emits `igcChange` with
`{ start: date, end: date }`, and activating the second emits it again with `{ start, end }`. Activating the start
again clears the range and emits `null`. In dialog mode, `igcChange` is emitted when Done is pressed, or when the
dialog is dismissed by an outside click.

**Input values during selection.** In both modes the inputs reflect the selection immediately. In dialog mode,
pressing Cancel reverts them.

**Typing one end.** With both inputs empty, typing the start date emits `igcInput` with
`{ start: date, end: null }`, and on blur `igcChange` with the same detail. The typed date is selected in the
calendar.

**Validation.** In two inputs mode both editors reflect the form state, so an invalid picker renders both as
invalid. `min` and `max` are checked against both ends of the range. A value that an editor commits marks the picker
as touched, so an invalid value shows its invalid styles at once, also when the focus stays in the picker.

**Range chips.** In dropdown mode, activating a chip closes the picker, unless `keepOpenOnSelect` is set. In dialog
mode the dialog stays open.

**Opening and closing the dialog.** The dialog fades in on an open, and `igcOpened` follows the entrance. Cancel,
Done, <kbd>Escape</kbd> and an outside click play the exit animation of the dialog, and `open` stays `true` until it
ends; the calendar and the range chips ignore a selection then, and Done, Cancel and <kbd>Escape</kbd> do nothing.
Done, Cancel, <kbd>Escape</kbd> and an outside click emit `igcClosing` first, and commit or restore the range only
when the close goes on. So a canceled `igcClosing` keeps the dialog open with the selected range, and Done emits
`igcClosing`, `igcChange` and `igcClosed` in this order. A `hide()` after a canceled close does not commit or
restore: the selected range stays the value, with no `igcChange`. The date picker suite covers the shared behavior.

**Readonly.** Keyboard navigation, toggling the calendar and clearing through the clear icon are all disabled, and
the calendar and clear icons appear visually disabled.

### Localization

The following strings are localizable, on top of the calendar resource strings:

| Key                                | Default (`en`) | Usage                                   |
| ---------------------------------- | -------------- | --------------------------------------- |
| `date_range_picker_date_separator` | to             | The separator between the two dates.    |
| `date_range_picker_done_button`    | Done           | The confirm action in dialog mode.      |
| `date_range_picker_cancel_button`  | Cancel         | The cancel action in dialog mode.       |
| `date_range_picker_last7Days`      | Last 7 Days    | A predefined range chip.                |
| `date_range_picker_currentMonth`   | Current Month  | A predefined range chip.                |
| `date_range_picker_last30Days`     | Last 30 Days   | A predefined range chip.                |
| `date_range_picker_yearToDate`     | Year to Date   | A predefined range chip.                |

`locale` overrides the locale for a single picker and drives the input format, the display format and the calendar
week start; `resourceStrings` overrides individual strings, and the picker gives the calendar strings to its calendar.
Validation messages come from the application through the message slots.

### Keyboard interactions

As long as focus is within any part of the picker:

| Key combination   | Result                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| <kbd>Escape</kbd> | If the picker is shown, closes it and returns focus to the input part. Otherwise it is a no-op and does not cancel the key. |

When an input part is focused:

| Key combination                                           | Result                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Right</kbd>            | Moves the caret one position in the given direction.                          |
| <kbd>Ctrl</kbd> + <kbd>Arrow Left</kbd>                   | Moves the caret to the beginning of the current mask section, or the previous one. |
| <kbd>Ctrl</kbd> + <kbd>Arrow Right</kbd>                  | Moves the caret to the end of the current mask section, or the next one.      |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Down</kbd>               | Increments or decrements the focused part of the mask.                        |
| <kbd>Home</kbd> / <kbd>End</kbd>                          | Moves the caret to the beginning or the end of the mask.                      |
| <kbd>Ctrl</kbd> + <kbd>;</kbd>                            | Sets the current date as the value of the focused editor.                     |
| <kbd>Alt</kbd> + <kbd>Arrow Down</kbd>                    | Opens the calendar.                                                           |
| <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>                      | Closes the calendar.                                                          |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Undoes and redoes the masked edit.                                  |
| <kbd>Enter</kbd>                                          | Submits the owning form as a native text field does, if the picker is valid.  |

When focus is within the calendar, the [keyboard interactions of the calendar](../calendar/spec.md#keyboard-interactions)
apply.

## API

### Properties and attributes

| Property               | Attribute                  | Reflected | Type                        | Default           | Description                                                              |
| ---------------------- | -------------------------- | --------- | --------------------------- | ----------------- | ------------------------------------------------------------------------ |
| value                  | value                      | No        | `DateRangeValue \| null`    | -                 | The value of the picker: a range with a `start` and an `end` date, or `null` when the range is empty. |
| useTwoInputs           | use-two-inputs             | Yes       | `boolean`                   | false             | Whether the picker shows the start and the end date in two separate inputs. |
| usePredefinedRanges    | use-predefined-ranges      | Yes       | `boolean`                   | false             | Whether the picker shows chips with predefined ranges.                   |
| customRanges           | -                          | No        | `CustomDateRange[]`         | `[]`              | The custom date ranges that the picker shows as chips. A click on a chip selects its range. |
| mode                   | mode                       | No        | `PickerMode`                | `dropdown`        | Whether the calendar opens in a dropdown or in a modal dialog. In `dialog` mode, the user cannot type in the input. |
| open                   | open                       | Yes       | `boolean`                   | false             | Whether the component is open. A disabled form control stays closed.   |
| label                  | label                      | No        | `string`                    | -                 | The label of the picker.                                                 |
| labelStart             | label-start                | No        | `string`                    | `''`              | The label of the start input.                                            |
| labelEnd               | label-end                  | No        | `string`                    | `''`              | The label of the end input.                                              |
| placeholder            | placeholder                | No        | `string`                    | -                 | The placeholder of the single input.                                     |
| placeholderStart       | placeholder-start          | No        | `string`                    | `''`              | The placeholder of the start input.                                      |
| placeholderEnd         | placeholder-end            | No        | `string`                    | `''`              | The placeholder of the end input.                                        |
| inputFormat            | input-format               | No        | `string`                    | from the locale   | The date format of the input while the user edits the value. Without it, the input uses the input format of the locale. |
| displayFormat          | display-format             | No        | `string`                    | -               | The format of the value while the input does not have focus. Without it, the input uses `inputFormat` when set, else the display format of the locale. |
| prompt                 | prompt                     | No        | `string`                    | `_`               | The prompt symbol to use for unfilled parts of the mask.                 |
| min                    | min                        | No        | `Date \| null`              | -                 | The minimum value required for the picker to remain valid. The calendar disables the dates before it. |
| max                    | max                        | No        | `Date \| null`              | -                 | The maximum value required for the picker to remain valid. The calendar disables the dates after it. |
| disabledDates          | -                          | No        | `DateRangeDescriptor[]`     | `[]`              | The date ranges that the user cannot select in the calendar. A value that includes one of these dates is invalid. |
| specialDates           | -                          | No        | `DateRangeDescriptor[]`     | -                 | The date ranges that the calendar marks as special.                      |
| activeDate             | active-date                | No        | `Date`                      | derived           | The date that the calendar shows and highlights. Without it, the calendar starts at the value, or at the current date when there is no value. |
| visibleMonths          | visible-months             | No        | `number`                    | 2                 | The number of months displayed in the calendar: 1 or 2.                  |
| orientation            | orientation                | No        | `ContentOrientation`        | `horizontal`      | The orientation of the multiple months in the days view.                 |
| headerOrientation      | header-orientation         | Yes       | `CalendarHeaderOrientation` | `horizontal`      | The orientation of the calendar header. It applies only in `dialog` mode. |
| hideHeader             | hide-header                | Yes       | `boolean`                   | false             | Whether the calendar hides its header. In `dropdown` mode, the header is always hidden. |
| hideOutsideDays        | hide-outside-days          | Yes       | `boolean`                   | false             | Whether the calendar hides the dates that do not belong to the current month. |
| showWeekNumbers        | show-week-numbers          | Yes       | `boolean`                   | false             | Whether the calendar shows the week numbers.                             |
| weekStart              | week-start                 | No        | `WeekDays`                  | from the locale   | The first day of the week in the calendar.                               |
| keepOpenOnSelect       | keep-open-on-select        | Yes       | `boolean`                   | false             | Keeps the dropdown open after a selection. A selection never closes the dialog.        |
| keepOpenOnOutsideClick | keep-open-on-outside-click | Yes       | `boolean`                   | false             | Whether the component stays open when the user clicks outside of it.                |
| scrollStrategy         | scroll-strategy            | No        | `PopoverScrollStrategy`     | `hide`            | The behavior of the component when a parent container scrolls.           |
| nonEditable            | non-editable               | Yes       | `boolean`                   | false             | Whether the user cannot type in the input. The user can still select a date in the calendar. |
| readOnly               | readonly                   | Yes       | `boolean`                   | false             | Whether the control is read-only. The user cannot change the value or open the calendar. |
| outlined               | outlined                   | Yes       | `boolean`                   | false             | Whether the control has an outlined appearance.                          |
| required               | required                   | Yes       | `boolean`                   | false             | Whether the control is required. A required control that has no value, or is not checked, fails validation.                     |
| disabled               | disabled                   | Yes       | `boolean`                   | false             | Whether the control is disabled. A disabled control is not validated, and the form does not submit its value.                                     |
| invalid                | invalid                    | No        | `boolean`                   | false             | Whether the control shows the invalid state. It changes only the visual state, not the validity.                 |
| name                   | name                       | Yes       | `string`                    | -                 | The name of the control, submitted with the form data.                   |
| locale                 | locale                     | No        | `string`                    | the inherited or global locale | The locale used to format the value and resolve the resource strings.    |
| resourceStrings        | -                          | No        | range picker and calendar strings | EN          | The resource strings of the date range picker.                           |
| defaultValue           | -                          | No        | `DateRangeValue \| null`    | -                 | The default value of the control. A form reset restores the value to it. While the value is unchanged since the start or the last form reset, a new default also sets the value. The `value` attribute also sets it.              |
| form                   | -                          | No        | `HTMLFormElement \| null`   | -                 | Read-only. The form that the control is associated with, or `null`.                        |
| validity               | -                          | No        | `ValidityState`             | -                 | Read-only. The validity state of the control.                            |
| validationMessage      | -                          | No        | `string`                    | -                 | Read-only. The validation message of the control. It is empty when the control is valid.                        |
| willValidate           | -                          | No        | `boolean`                   | -                 | Read-only. Whether the control is a candidate for constraint validation. |

### Methods

| Name              | Type signature                          | Description                                                             |
| ----------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| focus             | `(options?: FocusOptions): void`        | Sets focus on the picker.                                               |
| blur              | `(): void`                              | Removes focus from the picker.                                          |
| show              | `(): Promise<boolean>`                  | Opens the component. It does not emit events. The promise resolves to `false` when the component is already open or is a disabled form control, or when a later call replaces this one.                      |
| hide              | `(): Promise<boolean>`                  | Closes the component. It does not emit events. The promise resolves to `false` when the component is already closed, or when a later call replaces this one.                                                    |
| toggle            | `(): Promise<boolean>`                  | Opens the component when it is closed, and closes it when it is open. It does not emit events. The promise resolves to `true` when the state changes.                                |
| select            | `(value: DateRangeValue \| null): void` | Sets the value of the picker to `value`. It does not emit events.       |
| clear             | `(): void`                              | Clears the value and the input text of the picker.                      |
| checkValidity     | `(): boolean`                           | Checks validity and emits `invalid` when the control is invalid. Returns `true` when the control is valid.        |
| reportValidity    | `(): boolean`                           | Checks validity. As for a native control, an invalid control emits `invalid` and takes the focus. It shows its own validation messages, not the message of the browser. Returns `true` when the control is valid. |
| setCustomValidity | `(message: string): void`               | Sets a custom validation message. The control is invalid while the message is not empty. An empty string removes the custom error.            |

### Events

| Name       | Cancellable | Detail                   | Description                                          |
| ---------- | ----------- | ------------------------ | ---------------------------------------------------- |
| igcOpening | true        | -                        | Emitted before a user interaction opens the calendar. Cancelable. |
| igcOpened  | false       | -                        | Emitted after a user interaction opens the calendar. |
| igcClosing | true        | -                        | Emitted before a user interaction closes the calendar. Cancelable. |
| igcClosed  | false       | -                        | Emitted after a user interaction closes the calendar. |
| igcChange  | false       | `DateRangeValue \| null` | Emitted when the user commits a change to the value. |
| igcInput   | false       | `DateRangeValue \| null` | Emitted when the user types in an input.             |

The picker handles the `igcInput` and `igcChange` events of its editors only. The same events from content in the
`prefix` and `suffix` slots and their `-start` and `-end` forms go on to the application and do not change the value.

### Slots

| Name                       | Description                                                                      |
| -------------------------- | --------------------------------------------------------------------------------- |
| `prefix`                   | Renders content before the input (single input).                                 |
| `prefix-start`             | Renders content before the start input (two inputs).                             |
| `prefix-end`               | Renders content before the end input (two inputs).                               |
| `suffix`                   | Renders content after the input (single input).                                  |
| `suffix-start`             | Renders content after the start input (two inputs).                              |
| `suffix-end`               | Renders content after the end input (two inputs).                                |
| `separator`                | Renders the separator element between the two inputs.                            |
| `helper-text`              | Renders content below the input.                                                 |
| `title`                    | Renders content in the calendar title. It applies only in `dialog` mode.         |
| `header-date`              | Renders content instead of the current range in the calendar header. It applies only in `dialog` mode. |
| `clear-icon`               | Renders the icon of the clear button.                                            |
| `clear-icon-start`         | Renders the icon of the clear button for the start input (two inputs).           |
| `clear-icon-end`           | Renders the icon of the clear button for the end input (two inputs).             |
| `calendar-icon`            | Renders the icon/content for the calendar picker.                                |
| `calendar-icon-start`      | Renders the icon/content for the start input (two inputs).                       |
| `calendar-icon-end`        | Renders the icon/content for the end input (two inputs).                         |
| `calendar-icon-open`       | Renders the icon/content for the picker in open state.                           |
| `calendar-icon-open-start` | Renders the open state icon/content for the start input (two inputs).            |
| `calendar-icon-open-end`   | Renders the open state icon/content for the end input (two inputs).              |
| `actions`                  | Renders content in the action part of the picker in open state.                  |
| `bad-input`                | Renders content when the range includes a date in the `disabledDates` ranges.    |
| `value-missing`            | Renders content when the required validation fails.                              |
| `range-overflow`           | Renders content when the max validation fails.                                   |
| `range-underflow`          | Renders content when the min validation fails.                                   |
| `custom-error`             | Renders content when a custom message is set with `setCustomValidity()`.         |
| `invalid`                  | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

On top of the input and calendar parts it re-exports, the picker exposes:

| Part                                                                     | Description                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| `inputs`                                                                 | The wrapper of the start input, the separator and the end input (two inputs). |
| `separator`                                                              | The separator element between the two inputs.           |
| `ranges`                                                                 | The wrapper that renders the custom and predefined ranges. |
| `label`                                                                  | The label wrapper above the target input.               |
| `calendar-icon` / `calendar-icon-start` / `calendar-icon-end`            | The calendar icon wrappers for the closed state.        |
| `calendar-icon-open` / `calendar-icon-open-start` / `calendar-icon-open-end` | The calendar icon wrappers for the open state.      |
| `clear-icon` / `clear-icon-start` / `clear-icon-end`                     | The clear icon wrappers.                                |
| `dialog-base`                                                            | The base of the dialog in dialog mode. Style the backdrop with `::part(dialog-base)::backdrop`. |
| `title`                                                                  | The title of the dialog in dialog mode.                 |
| `footer`                                                                 | The footer of the dialog in dialog mode, which holds the Cancel and Done buttons. |

### CSS custom states

| State        | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `ig-invalid` | Set while the control shows its invalid state, that is while `invalid` returns `true`. |

### CSS custom properties

| Property                | Description                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ig-helper-min-lines` | The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`. |

## Test scenarios

The component is covered by ten suites in this directory, all running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`date-range-picker.common.spec.ts`](./date-range-picker.common.spec.ts) | Behavior shared by both display modes, also run in each layout. |
| [`date-range-picker-single.spec.ts`](./date-range-picker-single.spec.ts) | The single input mode. |
| [`date-range-picker-two-inputs.spec.ts`](./date-range-picker-two-inputs.spec.ts) | The two inputs mode. |
| [`date-range-picker.form.spec.ts`](./date-range-picker.form.spec.ts) | Form integration, in each layout and for each layout. |
| [`predefined-ranges-area.spec.ts`](./predefined-ranges-area.spec.ts) | The internal range chips component. |
| [`date-range-mask-parser.spec.ts`](./date-range-mask-parser.spec.ts) | Range mask parser: the range mask parser on its own. |
| [`date-range-mask-parser.property.spec.ts`](./date-range-mask-parser.property.spec.ts) | Range mask parser properties: property-based (fuzz) tests for the range mask parser. |
| [`range-shape.spec.ts`](./range-shape.spec.ts) | The rules of the range value, without a DOM. |
| [`range-shape.property.spec.ts`](./range-shape.property.spec.ts) | Property-based tests of the rules of the range value. |
| [`range-editors.spec.ts`](./range-editors.spec.ts) | The editors of each layout, with the editors but without the picker. |

[`date-range-picker.utils.spec.ts`](./date-range-picker.utils.spec.ts) holds the helpers that the picker suites share,
and has no tests of its own.

The suites reuse `createFormAssociatedTestBed`, `runValidationContainerTests`,
`runExternalLabelAssociationTests` and the `simulate*` helpers from
[`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks. The common, single
input and two inputs suites run with reduced motion, so the dialog does not fade.

The focus after the form checks and the `invalid` event rules come from the form-associated mixin. The
[input suite](../input/spec.md#form-validity-checks) covers them.

### Rendering and initialization

1. Accepts a value and bounds set before the first render.
2. Is initialized in the open state, in dropdown and in dialog mode.
3. Renders the clear icon as soon as a start or an end date is defined.
4. Exposes the `ranges` part of the predefined ranges area, and renders outlined and contained dialog buttons in the
   indigo theme.

### Common properties

5. Properties - `visibleMonths` as a property and as an attribute, `keepOpenOnOutsideClick`, and `keepOpenOnSelect`,
   which `mode` does not change. A switch to two inputs and back keeps the calendar selection and the input values,
   and the properties of the calendar are set.
6. Localization - formats, resource strings and the separator, and the strings of the calendar and of the predefined
   ranges area.
7. Methods - `show`, `hide` and `toggle` open and close the picker and emit no events.
8. Interactions - selection through the calendar, keyboard navigation, and interactions with the show icon. A value
   set from code while the dialog is open, also with `select()`, is not reported when Done commits. After a canceled
   close on an outside click or on Done, Cancel restores the range; after a canceled close on Cancel, Done commits it.
   Done emits `igcChange` after `igcClosing`. <kbd>Escape</kbd> restores the range as the close starts, so
   Done or a reopen during the exit keeps it. A `show()` during the exit of Done, then Cancel, keeps the range of
   Done. Done, Cancel and <kbd>Escape</kbd> do nothing during the exit of `hide()`. After `hide()` and a new open,
   Cancel restores the range from before the selection and Done reports the selection. Disabling the picker, also
   after `hide()`, restores the range from before the selection and reports nothing.
   A clear is reported on blur in dialog and non-editable mode, in both layouts, and one time after an open and a
   close with Cancel, Done or an outside click.
9. Readonly state - a selection does not change the value. In dropdown and in dialog mode, a calendar icon click or a
   keyboard shortcut does not open the picker, and the toggle icon does not clear the value.
10. Predefined ranges - the built-in chips and the custom ranges, a chip during the exit of the dialog, and a chip
    that keeps the dropdown open with `keepOpenOnSelect`.

### Value rules

11. The value and the default are `null` without a value, and an empty range is stored as `null`.
    Reversed ends set from code, as an attribute and as the default are swapped, and the time of the ends set as an
    attribute stays. A custom chip with reversed ends commits and reports the range in order. A value in the first
    month set while the second month is active keeps the months in view, a value set from code brings its first
    defined date into view, and an open without a value shows the current active date in the first month. With
    `activeDate` set, a pick in the second month keeps the months in view, and a new `activeDate` still moves the
    calendar.

### Value state motion

12. A range picked from the calendar marks the input as a user change.
13. A value that an `igcChange` handler sets ends the user change, so the input shows it at once.

### Locale week start

14. The calendar derives its week start from the locale when `week-start` is not set, and follows a change and a
    removal of `weekStart`.

### Validation messages

15. The validation message shows its dates as the picker displays them: the disabled date message shows the range
    with the localized separator, and the min message shows the bound.

### Each layout

The same scenarios run for the single input and for two inputs.

16. Rendering and initialization - the accessibility audit, and the title slot only in dialog mode.
17. Properties - the value as an attribute, through a mode change and with `nonEditable`.
18. Methods - `clear()` and `select()`.
19. Selection via the calendar - in dropdown and in dialog mode, with Done, an outside click, Cancel and
    <kbd>Escape</kbd>.
20. Interactions with the inputs and the open and clear buttons - a click on the input, and the clear icon with and
    without a render before the blur; the keyboard toggle; the input and change events of slotted content, which the
    picker leaves alone; an edit that a layout change drops.
21. Readonly state - a click on the input and on the clear icon of a read-only picker.

### Single input properties

22. The `required`, `disabled`, `placeholder` and `outlined` properties go to the range input.

### Single input localization

23. Each predefined display format goes to the range input, and the masked value follows the locale.
24. The default placeholder is the input format, and the mask follows the display format, for both ends (like
    `dd/MM/yyyy - dd/MM/yyyy`). Without `displayFormat`, the input format is used for display, also when it is set
    initially. Without `inputFormat`, the default mask comes from the locale.
25. A focus targets the last date part of the end by default.

### Scroll strategy

26. The `close` behavior closes the calendar on scroll and emits `igcClosing` and `igcClosed`. The behavior comes from
    the picker base class, so one end-to-end case covers it.

### Single input methods

27. `stepUp` and `stepDown` of the range input update its value at once, also while it is focused and empty.
    The default part is the day of the start date, a part that the format does not show still spins, and an empty
    end takes today without a step. A value set from code while the input is focused is not reported on blur.
28. A spin that narrows the start year keeps it selected, and nothing steps while the cursor is in the separator.

### Single input interactions

29. Interactions with the input and the open and clear buttons. A closed picker does not cancel
    <kbd>Escape</kbd>. <kbd>Ctrl</kbd> + arrow stops at each part edge, also without separators. Arrow keys and `stepUp`
    in a range with one typed end spin that end and keep the text of the other end. Typing or a spin in the end brings
    the end into view; an edit with the caret in the separator brings the start into view. The calendar selects a
    complete typed end, keeps the selected end while the typed end is incomplete, also a start typed after the end,
    and drops a blank end.
30. Undo and redo of the masked range text.

### Single input slots

31. In dialog mode, the `prefix`, `suffix`, `title`, `header-date`, `helper-text`, `calendar-icon`,
    `calendar-icon-open`, `clear-icon` and `actions` slots render their content.

### Two inputs rendering and initialization

32. Is initialized with a value.

### Two inputs properties

33. `disabled`, `displayFormat`, `inputFormat` and `outlined` go to both date-time inputs, and `labelStart`,
    `labelEnd`, `placeholderStart` and `placeholderEnd` go to the matching input.

### Two inputs localization

34. Each predefined display format goes to both date-time inputs.

### Validity of the editors

35. The editors report the validity of the picker, also while it is pristine, and show only the invalid state of the
    picker.

### Two inputs interactions

36. Selection through the calendar, interactions with the inputs and the open and clear buttons, and the readonly
    state. An editor commit keeps the time of both ends. A typed end before the start is swapped in the `igcInput`
    detail and in the calendar, while the editors keep the typed order. A clear through the icon is reported one
    time, when the focus leaves the picker, and not when the focus moves to the other input. The calendar keeps the
    selected start while the typed start is incomplete and drops a blank one; a move of the focus to the other input
    shows the value again, also when the commit keeps the value; a new range from code keeps the edit of an end whose
    date stays, as its editor does.

### Two inputs slots

37. The `prefix-start`, `prefix-end`, `suffix-start`, `suffix-end`, `title`, `header-date`, `helper-text`,
    `calendar-icon-start`, `calendar-icon-end`, `calendar-icon-open-start`, `calendar-icon-open-end`,
    `clear-icon-start`, `clear-icon-end`, `actions` and `separator` slots render their content.

### Form integration in each layout

The groups run in each layout:

38. Form associated - submission, also under a changed `name`, reset and the disabled ancestor state. A reset during an
    edit discards the typed text, with and without a default, and the next blur keeps the restored value. A reset
    that empties the value shows the empty mask in the focused editor, and a reset that keeps the value drops the typed
    calendar selection. <kbd>Enter</kbd> submits when the range is valid, and a real <kbd>Enter</kbd> submits once.
    Each editor shows the invalid state of the picker.
39. Initial validation - a click on the calendar icon does not make a required picker invalid.
40. `defaultValue` - initial state, submission, reset and validation.
41. Validation message slots, generated by `runValidationContainerTests`.

### Single input form integration

42. A partial range below `min` reports the required message, and the editor shows the invalid state of the picker at
    once.

### Two inputs form integration

43. The validity follows a switch between the layouts; a value that the start editor commits marks the picker as
    touched, so an out-of-range start shows the invalid state without a blur; a reset clears the invalid styles of an
    editor that was touched, and keeps the default range in the editors.

### Predefined ranges area

44. The internal `igc-predefined-ranges-area` renders the built-in and the custom chips and emits its selection.
    Built-in range dates: the day count and a click after midnight.

### Range mask parser - Parser initialization

45. Creates a parser with the default format and separator, and with a custom format, separator and prompt
    character. A separator literal keeps its letters and mask flags, and the year of the date format widens while a
    `y` in the separator does not. A complete range parses strictly when the separator holds the prompt. The range
    parts carry their positions.

### Range mask parser - Date Range Parsing

46. Parses a complete range, a range with only the start date and a range with only the end date, and gives `null`
    for the empty mask and for an empty string.

### Range mask parser - Date Range Formatting

47. Formats a complete range, a range with only the start date or only the end date, and a `null` range.
48. Each end widens its year part for a year past 9999 alone, and a spin into the year range narrows it.

### Range mask parser - Part Queries

49. Gives the part at a cursor position and names the part at the caret by its end. The default part is the day,
    else the hours, of the start date.

### Range mask parser - Range part spinning

50. Spins the month of the start date and the day of the end date. A spin of a `null` value takes the seed at both
    ends.

### Range mask parser - Prompt Updates

51. A changed prompt formats and parses both dates. A prompt that collides with a mask flag is ignored, and the
    constructor applies the same prompt rules.

### Range mask parser - Mask Updates

52. A mask update rebuilds the parts.

### Range mask parser properties - Parsing and formatting

53. For generated formats, separators and dates: the round-trip, each side parsed like a single date, the layout
    around the separator after a mask change, and no throw or invalid date for any string. A strict value parse
    gives a range only when both ends are complete; a lenient one parses each end as typed, and gives `null` when
    neither end is a valid date or the mask is blank. An edit parse gives each complete end, the end of the previous
    range while an end is incomplete, and no end while it is blank.

### Range mask parser properties - Part editing

54. Each end spins like a single date, also from its text while the text of the other end stays; an empty range
    takes the seed at both ends; the part at the caret and the default part name their end.

### Range value shape

55. Without a DOM: an empty range is `null`; a range in order stays the same object; reversed ends swap, by time also
    on the same day; a missing end becomes `null`. The form value transformers normalize a value, a default value and
    an attribute string, and compare ranges by their dates. The calendar dates of a range, a range in one day, a
    partial range and no range, and the ends of a reversed range in order; the range of a calendar selection; a
    complete range.

### Range value shape properties

56. For generated ranges: the normalize step is idempotent, gives `null` only for an empty range and the ends in order
    of time otherwise, and keeps each date with its time. A complete range goes to the calendar and back unchanged,
    and a calendar selection comes back as its first and last date, which closes the picker when there is more than one.
    An attribute string is normalized like the range of its dates, for any valid dates, also ones with a signed six
    digit year.

### Range editors

57. For each layout: the editors, the start editor first, and none in a root without them; the range of the editors;
    the typed range and the typed date during an edit of the start, while the committed range stays; the focus on the
    start editor after a pick, which selects its text only with two inputs. The edit is the range of the editors
    without an edit; during an edit of the start it keeps the typed order, the start of the previous range while the
    start is incomplete, and no start while it is blank. In the single input, the end at the
    caret, also at the edge of a part and nothing in the separator, gives the typed date; with two inputs, each
    editor gives its own date.

### Host ARIA

58. The shared host description suite: the host `aria-describedby` describes the native control after the helper
    text, and follows a change and a removal. `required` sets `aria-required` on each editor.
59. The shared focus suite (`runFocusBeforeRenderTests`): a `focus()` call right after the element connects focuses
    the same element as a call after the first render. `blur()`, a later `focus()` on another element and a removal
    that lasts until the render cancel the call, but a move in the same task keeps it. After the render, `focus()`
    takes the focus at once and `blur()` removes it. A `focus()` call before the render on a component with
    `disabled` set does not cancel an earlier call on another element. The suite runs for one input and for two
    inputs.

### Disabled popup

60. The shared runner `runDisabledPopupTests`.

## Assumptions and limitations

- In dialog mode the editors are read-only, in both layouts; the range is changed through the calendar or the range
  chips.
- The two editors are rendered by the component and configured through properties such as `labelStart` and
  `labelEnd`. Slotting `igc-date-time-input` elements as the editors was evaluated and discarded.
- The value holds local `Date` objects; time zones are not modelled.
- `min`, `max` and `disabledDates` restrict the calendar and drive validation, but they do not prevent an
  out-of-range date from being typed in; such a value invalidates the component instead.
- `hideHeader`, `headerOrientation` and the `title` slot are only in effect in dialog mode.
- In dialog mode, `hide()`, `toggle()` and a change of `open` do not commit or restore the selected range, also after
  a canceled `igcClosing`. An application that cancels the close, for example to ask for a confirmation, restores the
  range itself, through `value`. The selected range stays unconfirmed: after a new open, Done reports it and Cancel or
  <kbd>Escape</kbd> restores the range from before it.
- `clear()` acts like the clear icon: the picker reports the clear with `igcChange`, although it is a method call.

## Accessibility

### ARIA roles and properties

- Each input part is a native text input with an associated label; the host delegates focus to it.
- The picker projects `aria-haspopup`, its expanded state and the relation to the calendar surface onto the native
  input of the editor, as element references, because an IDREF does not cross a shadow boundary.
- The calendar surface is exposed as a dialog labelled by the picker.
- In dropdown mode the calendar is wrapped in a focus trap; in dialog mode the dialog provides the modal semantics.
- The helper text and the validation messages are referenced through `aria-describedby`, and in two inputs mode the
  invalid state is reflected on both editors.
- Within the calendar, the ARIA of the [calendar specification](../calendar/spec.md#aria-roles-and-properties)
  applies.
- A host `aria-describedby` describes the native control after the helper text, by element reference. With two
  inputs, the end editor gets only the host description: the helper text describes the start editor.
- `required` is exposed as `aria-required` on the native input of each editor, also with two inputs.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The order of the two
inputs and of the separator follows the inline direction.
