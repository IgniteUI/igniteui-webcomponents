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
  - [Test scenarios](#test-scenarios)
    - [Common suite](#common-suite)
    - [Single input suite](#single-input-suite)
    - [Two inputs suite](#two-inputs-suite)
    - [Form integration suites](#form-integration-suites)
    - [Predefined ranges area](#predefined-ranges-area)
    - [Range mask parser](#range-mask-parser)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

## Overview

The `igc-date-range-picker` includes a text input and a calendar pop-up, letting end-users select a start and an end
date. The calendar opens either in a popover anchored to the field (**dropdown** mode) or in a modal dialog
(**dialog** mode).

The picker has two display modes for the value: a **single input**, which renders both dates in one non-editable
field, and **two inputs**, which renders separate, editable start and end editors. The value is a
`DateRangeValue` - `{ start: Date | null, end: Date | null }`.

The component composes [`igc-calendar`](../calendar/spec.md) in range selection mode and
[`igc-date-time-input`](../date-time-input/spec.md) for the editable surfaces, and it is a form-associated custom
element.

### Key features

- **Two value display modes**: a single read-only field, or two editable inputs with a separator.
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

- let users specify a date range either by typing it in two inputs, for the start and the end value, or by picking a
  range through its calendar component.
- display the range as a single, read-only input field showing both dates, or as two editable inputs.
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

- In single input mode, one read-only field renders both dates separated by the localized separator, with a calendar
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
- Typing a date selects it in the calendar and brings its month into view.
- In single input mode the field is read-only; the range can only be changed through the calendar or the chips.

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
<!-- One read-only field rendering both dates (default) -->
<igc-date-range-picker label="Reporting period"></igc-date-range-picker>

<!-- Two editable fields -->
<igc-date-range-picker use-two-inputs label-start="From" label-end="To"></igc-date-range-picker>
```

`useTwoInputs` makes the editors editable in dropdown mode. In single input mode the field is always read-only, and
the range is changed through the calendar or the range chips.

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
Current Month, Last 30 Days and Year to Date, and its labels come from the resource strings.

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
end fails. In two inputs mode both editors reflect the invalid state.

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
labels through `ElementInternals` and projects them - together with its own `role`, `aria-haspopup`,
`aria-expanded` and `aria-controls` - onto the native input of the editor it wraps, as element references. Clicking
the external label focuses the editor.

#### Form integration

```html
<form>
  <igc-date-range-picker name="period" required></igc-date-range-picker>
  <button type="submit">Report</button>
</form>
```

- The range is submitted under `name`.
- A form reset restores `defaultValue`.
- An invalid picker blocks submission.

### Behaviors

**Clearing the inputs.** On losing focus, `igcChange` is emitted with `{ start: null, end: null }`, in both display
modes. While the control is `readOnly`, clicking the clear icon does not clear the value.

**Selecting from the calendar.** In dropdown mode, activating the first date emits `igcChange` with
`{ start: date, end: date }`, and activating the second emits it again with `{ start, end }`. In dialog mode,
`igcChange` is emitted when Done is pressed, or when the dialog is dismissed by an outside click.

**Input values during selection.** In both modes the inputs reflect the selection immediately. In dialog mode,
pressing Cancel reverts them.

**Typing one end.** With both inputs empty, typing the start date emits `igcInput` with
`{ start: date, end: null }`, and on blur `igcChange` with the same detail. The typed date is selected in the
calendar.

**Validation.** In two inputs mode both editors reflect the form state, so an invalid picker renders both as
invalid. `min` and `max` are checked against both ends of the range.

**Range chips.** In dropdown mode, activating a chip closes the picker. In dialog mode the dialog stays open.

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
week start; `resourceStrings` overrides individual strings. Validation messages come from the application through the
message slots.

### Keyboard interactions

As long as focus is within any part of the picker:

| Key combination   | Result                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| <kbd>Escape</kbd> | If the picker is shown, closes it and returns focus to the input part. Otherwise it is a no-op.  |

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

When focus is within the calendar, the [keyboard interactions of the calendar](../calendar/spec.md#keyboard-interactions)
apply.

## API

### Properties and attributes

| Property               | Attribute                  | Reflected | Type                        | Default           | Description                                                              |
| ---------------------- | -------------------------- | --------- | --------------------------- | ----------------- | ------------------------------------------------------------------------ |
| value                  | value                      | No        | `DateRangeValue \| null`    | -                 | The value of the picker.                                                 |
| useTwoInputs           | use-two-inputs             | Yes       | `boolean`                   | false             | Use two inputs to display the range. Makes them editable in dropdown mode. |
| usePredefinedRanges    | usePredefinedRanges        | Yes       | `boolean`                   | false             | Whether to show chips with predefined ranges.                            |
| customRanges           | -                          | No        | `CustomDateRange[]`         | `[]`              | Renders chips with custom ranges based on the elements of the array.     |
| mode                   | mode                       | No        | `PickerMode`                | `dropdown`        | Whether the calendar opens in a dropdown or a modal dialog.              |
| open                   | open                       | Yes       | `boolean`                   | false             | The open state of the component.                                         |
| label                  | label                      | No        | `string`                    | -                 | The label of the picker.                                                 |
| labelStart             | label-start                | No        | `string`                    | `''`              | The label of the start input.                                            |
| labelEnd               | label-end                  | No        | `string`                    | `''`              | The label of the end input.                                              |
| placeholder            | placeholder                | No        | `string`                    | -                 | The placeholder of the single input.                                     |
| placeholderStart       | placeholder-start          | No        | `string`                    | `''`              | The placeholder of the start input.                                      |
| placeholderEnd         | placeholder-end            | No        | `string`                    | `''`              | The placeholder of the end input.                                        |
| inputFormat            | input-format               | No        | `string`                    | from the locale   | The date format to apply on the inputs.                                  |
| displayFormat          | display-format             | No        | `string`                    | `inputFormat`     | Format to display the value in when not editing.                         |
| prompt                 | prompt                     | No        | `string`                    | `_`               | The prompt symbol to use for unfilled parts of the mask.                 |
| min                    | min                        | No        | `Date \| null`              | -                 | The minimum value required for the picker to remain valid.               |
| max                    | max                        | No        | `Date \| null`              | -                 | The maximum value required for the picker to remain valid.               |
| disabledDates          | -                          | No        | `DateRangeDescriptor[]`     | `[]`              | The disabled dates of the picker.                                        |
| specialDates           | -                          | No        | `DateRangeDescriptor[]`     | -                 | The special dates of the picker.                                         |
| activeDate             | active-date                | No        | `Date`                      | derived           | The date shown in the calendar and highlighted.                          |
| visibleMonths          | visible-months             | No        | `number`                    | 2                 | The number of months displayed in the calendar.                          |
| orientation            | orientation                | No        | `ContentOrientation`        | `horizontal`      | The orientation of the multiple months in the days view.                 |
| headerOrientation      | header-orientation         | Yes       | `CalendarHeaderOrientation` | `horizontal`      | The orientation of the calendar header. Dialog mode only.                |
| hideHeader             | hide-header                | Yes       | `boolean`                   | false             | Whether the calendar hides its header. Dialog mode only.                 |
| hideOutsideDays        | hide-outside-days          | Yes       | `boolean`                   | false             | Controls the visibility of the dates outside the current month.          |
| showWeekNumbers        | show-week-numbers          | Yes       | `boolean`                   | false             | Whether to show the number of the week in the calendar.                  |
| weekStart              | week-start                 | No        | `WeekDays`                  | from the locale   | The start day of the week for the calendar.                              |
| keepOpenOnSelect       | keep-open-on-select        | Yes       | `boolean`                   | false             | Keeps the picker open after a selection.                                 |
| keepOpenOnOutsideClick | keep-open-on-outside-click | Yes       | `boolean`                   | false             | Keeps the picker open when the user clicks outside of it.                |
| scrollStrategy         | scroll-strategy            | No        | `PopoverScrollStrategy`     | `hide`            | The behavior of the component when a parent container scrolls.           |
| nonEditable            | non-editable               | Yes       | `boolean`                   | false             | Whether to allow typing in the inputs.                                   |
| readOnly               | readonly                   | Yes       | `boolean`                   | false             | Makes the control a readonly field.                                      |
| outlined               | outlined                   | Yes       | `boolean`                   | false             | Whether the control will have outlined appearance.                       |
| required               | required                   | Yes       | `boolean`                   | false             | Makes the component a required field for validation.                     |
| disabled               | disabled                   | Yes       | `boolean`                   | false             | The disabled state of the component.                                     |
| invalid                | invalid                    | No        | `boolean`                   | false             | Sets the control into invalid state (visual state only).                 |
| name                   | name                       | Yes       | `string`                    | -                 | The name of the control, submitted with the form data.                   |
| locale                 | locale                     | No        | `string`                    | the global locale | The locale used to format the value and resolve the resource strings.    |
| resourceStrings        | -                          | No        | range picker and calendar strings | EN          | The resource strings of the date range picker.                           |
| defaultValue           | -                          | No        | `DateRangeValue \| null`    | -                 | The initial value of the control, restored on a form reset.              |
| form                   | -                          | No        | `HTMLFormElement \| null`   | -                 | Read-only. The form associated with this element.                        |
| validity               | -                          | No        | `ValidityState`             | -                 | Read-only. The validity state of the element.                            |
| validationMessage      | -                          | No        | `string`                    | -                 | Read-only. The validation message of the element.                        |
| willValidate           | -                          | No        | `boolean`                   | -                 | Read-only. Whether the element is a candidate for constraint validation. |

### Methods

| Name              | Type signature                              | Description                                                      |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| show              | `(): Promise<boolean>`                      | Shows the component.                                             |
| hide              | `(): Promise<boolean>`                      | Hides the component.                                             |
| toggle            | `(): Promise<boolean>`                      | Toggles the open state of the component.                         |
| select            | `(value: DateRangeValue \| null): void`     | Selects a date range value in the picker.                        |
| clear             | `(): void`                                  | Clears the editors of the picker of any user input.              |
| checkValidity     | `(): boolean`                               | Checks validity and emits `invalid` when the control is invalid. |
| reportValidity    | `(): boolean`                               | Checks validity and shows the browser message when invalid.      |
| setCustomValidity | `(message: string): void`                   | Sets a custom message. Invalid while `message` is not empty.     |

### Events

| Name       | Cancellable | Detail                   | Description                                          |
| ---------- | ----------- | ------------------------ | ---------------------------------------------------- |
| igcOpening | true        | -                        | Emitted just before the calendar popover is shown.    |
| igcOpened  | false       | -                        | Emitted after the calendar popover is shown.          |
| igcClosing | true        | -                        | Emitted just before the calendar popover is hidden.   |
| igcClosed  | false       | -                        | Emitted after the calendar popover is hidden.         |
| igcChange  | false       | `DateRangeValue \| null` | Emitted when the user modifies and commits the value. |
| igcInput   | false       | `DateRangeValue \| null` | Emitted when the user types in the element.           |

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
| `title`                    | Renders content in the calendar title.                                           |
| `header-date`              | Renders content instead of the current range in the calendar header.             |
| `clear-icon`               | Renders a clear icon template.                                                   |
| `clear-icon-start`         | Renders a clear icon template for the start input (two inputs).                  |
| `clear-icon-end`           | Renders a clear icon template for the end input (two inputs).                    |
| `calendar-icon`            | Renders the icon/content for the calendar picker.                                |
| `calendar-icon-start`      | Renders the icon/content for the start input (two inputs).                       |
| `calendar-icon-end`        | Renders the icon/content for the end input (two inputs).                         |
| `calendar-icon-open`       | Renders the icon/content for the picker in open state.                           |
| `calendar-icon-open-start` | Renders the open state icon/content for the start input (two inputs).            |
| `calendar-icon-open-end`   | Renders the open state icon/content for the end input (two inputs).              |
| `actions`                  | Renders content in the action part of the picker in open state.                  |
| `bad-input`                | Renders content when the value is in the disabledDates ranges.                   |
| `value-missing`            | Renders content when the required validation fails.                              |
| `range-overflow`           | Renders content when the max validation fails.                                   |
| `range-underflow`          | Renders content when the min validation fails.                                   |
| `custom-error`             | Renders content when setCustomValidity(message) is set.                          |
| `invalid`                  | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

On top of the input and calendar parts it re-exports, the picker exposes:

| Part                                                                     | Description                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| `separator`                                                              | The separator element between the two inputs.           |
| `ranges`                                                                 | The wrapper that renders the custom and predefined ranges. |
| `label`                                                                  | The label wrapper above the target input.               |
| `calendar-icon` / `calendar-icon-start` / `calendar-icon-end`            | The calendar icon wrappers for the closed state.        |
| `calendar-icon-open` / `calendar-icon-open-start` / `calendar-icon-open-end` | The calendar icon wrappers for the open state.      |
| `clear-icon` / `clear-icon-start` / `clear-icon-end`                     | The clear icon wrappers.                                |

## Test scenarios

The component is covered by seven suites in this directory, all running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`date-range-picker.common.spec.ts`](./date-range-picker.common.spec.ts) | Behavior shared by both display modes. |
| [`date-range-picker-single.spec.ts`](./date-range-picker-single.spec.ts) | The single input mode. |
| [`date-range-picker-two-inputs.spec.ts`](./date-range-picker-two-inputs.spec.ts) | The two inputs mode. |
| [`date-range-picker-single.form.spec.ts`](./date-range-picker-single.form.spec.ts) | Form integration for the single input mode. |
| [`date-range-picker-two-inputs.form.spec.ts`](./date-range-picker-two-inputs.form.spec.ts) | Form integration for the two inputs mode. |
| [`predefined-ranges-area.spec.ts`](./predefined-ranges-area.spec.ts) | The internal range chips component. |
| [`date-range-mask-parser.spec.ts`](./date-range-mask-parser.spec.ts) | The range mask parser on its own. |

The suites reuse `createFormAssociatedTestBed`, `runValidationContainerTests`,
`runExternalLabelAssociationTests` and the `simulate*` helpers from
[`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### Common suite

1. Rendering and initialization of the shared structure.
2. Properties, including localization - formats, resource strings and the separator.
3. Methods - `show`, `hide`, `toggle`, `select` and `clear`.
4. Interactions - selection through the calendar, keyboard navigation, and interactions with the show icon.
5. Readonly state, in dropdown and in dialog mode.
6. Predefined ranges - the built-in chips and the custom ranges.
7. Locale week start - the calendar derives its week start from the locale when `week-start` is not set.

### Single input suite

8. Rendering and initialization, including the accessibility audit.
9. Properties and localization.
10. Scroll strategy - the `scroll`, `hide` and `close` behaviors of the anchored calendar.
11. Methods.
12. Interactions - selection through the calendar, interactions with the input and the open and clear buttons, and
    the readonly state.
13. Undo and redo of the masked range text.
14. Slots.

### Two inputs suite

15. Rendering and initialization, including the accessibility audit.
16. Properties and localization.
17. Methods.
18. Interactions - selection through the calendar, interactions with the inputs and the open and clear buttons, and
    the readonly state.
19. Slots.

### Form integration suites

Each display mode has its own form suite, with the same groups.

20. Form associated - submission, reset and the disabled ancestor state.
21. Initial validation - the component does not enter an invalid state merely by being rendered or toggled.
22. `defaultValue` - initial state, submission, reset and validation.
23. Validation message slots, generated by `runValidationContainerTests`.

### Predefined ranges area

24. The internal `igc-predefined-ranges-area` renders the built-in and the custom chips and emits its selection.

### Range mask parser

25. Initialization, range parsing, range formatting, part queries, spinning, prompt updates and mask updates.

## Assumptions and limitations

- Typing in single input mode is not supported; the field is read-only and the range is changed through the
  calendar or the range chips.
- The two editors are rendered by the component and configured through properties such as `labelStart` and
  `labelEnd`. Slotting `igc-date-time-input` elements as the editors was evaluated and discarded.
- The value holds local `Date` objects; time zones are not modelled.
- `min`, `max` and `disabledDates` restrict the calendar and drive validation, but they do not prevent an
  out-of-range date from being typed in; such a value invalidates the component instead.
- `hideHeader`, `headerOrientation` and the `title` slot are only in effect in dialog mode.

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

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The order of the two
inputs and of the separator follows the inline direction.
