# Date picker specification

- [Date picker specification](#date-picker-specification)
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
      - [Picker mode](#picker-mode)
      - [Input and display format](#input-and-display-format)
      - [Value and commit semantics](#value-and-commit-semantics)
      - [Interaction states](#interaction-states)
      - [Constraint validation](#constraint-validation)
      - [Configuring the calendar](#configuring-the-calendar)
      - [Scroll strategy](#scroll-strategy)
      - [Slots and templating](#slots-and-templating)
      - [Programmatic control](#programmatic-control)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
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
    - [Rendering and initialization](#rendering-and-initialization)
    - [Attributes and properties](#attributes-and-properties)
    - [Scroll strategy tests](#scroll-strategy-tests)
    - [Methods tests](#methods-tests)
    - [Uncommitted edits](#uncommitted-edits)
    - [Interactions](#interactions)
    - [Readonly state](#readonly-state)
    - [Form integration tests](#form-integration-tests)
    - [Validation message slots](#validation-message-slots)
    - [ARIA projection and external labels](#aria-projection-and-external-labels)
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

The `igc-date-picker` is a composite editor for a single date value. The date can be typed into a masked text field
or selected from a calendar that is presented either as a **dropdown** anchored to the field, or as a **modal
dialog**.

The component composes [`igc-date-time-input`](../date-time-input/spec.md) for the text-entry surface and
[`igc-calendar`](../calendar/spec.md) for the selection surface, and surfaces the relevant configuration of both
through a single, flat API. It is a form-associated custom element: it participates in native form submission and
constraint validation, exposes `min`, `max` and `disabledDates` constraints, and renders validation messages through
dedicated slots.

Typical scenarios include:

- **Booking and scheduling forms**: a date field with a minimum of today and a maximum booking horizon.
- **Filtering and reporting**: from/to date editors bound to a data source query.
- **Registration forms**: a date of birth field where typing is faster than navigating a calendar.
- **Availability calendars**: unavailable dates rendered as disabled and holidays highlighted as special dates.

### Key features

- **Two presentation modes**: a lightweight dropdown anchored to the input, or a modal dialog with a calendar header
  and an action area.
- **Masked text entry**: the date can be typed through the input format of the underlying date time input.
- **Separate display format**: predefined locale styles or a custom format string.
- **Locale awareness**: the input format, the display format and all calendar strings are resolved from the active
  locale.
- **Deferred value commit**: typing never mutates the public `value`; the edit is committed - and `igcChange`
  emitted - when the editor is blurred.
- **Non-editable and readonly modes**: selection can be restricted to the calendar only, or the whole component can
  be frozen.
- **Constraint validation**: `required`, `min`, `max` and `disabledDates` validators plus `setCustomValidity`, with
  per-error message slots.
- **Full calendar configuration**: week start, week numbers, outside days, multiple visible months, orientation,
  special and disabled dates, and the active date.
- **Scroll strategies**: the dropdown can stay anchored, hide, or close when an ancestor scrolls.
- **Form association**: submits with the form, resets to `defaultValue`, and reacts to a disabled ancestor fieldset.
- **Rich templating**: clear and calendar icons, prefix and suffix content, calendar title, header date and an
  action area.
- **Themeable**: integrates with the theming system of the library and re-exports the shadow parts of the calendar
  it composes.

### Acceptance criteria

The `igc-date-picker` must:

- let users input a date by either typing it in or picking one through its calendar component.
- be form associated and, when configured as part of a form, participate in form submission, reset and validation.
- expose configuration properties for modifying and localizing the input and display format of the date value.
- expose configuration properties for modifying and localizing the relevant parts of its calendar component.
- present the calendar either as a dropdown or as a modal dialog, based on the `mode` property.
- keep the public `value` free of intermediate editing state and emit `igcChange` only for committed values.
- support restricting input to calendar selection only (`non-editable`), as well as freezing the whole component
  (`readonly`).
- render dates outside the `min`/`max` range and inside `disabledDates` as disabled in the calendar, and invalidate
  the component when such a date is typed in.
- correctly manage and report its validation state and render the corresponding validation message slots.
- have adequate keyboard support for navigation and selection.
- be integrated and themeable with the theming mechanism of the library.
- be WAI-ARIA compliant.
- support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- type a date directly into the field, with the literals inserted for me as I go.
- open a calendar and pick a date with the pointer or the keyboard.
- see the currently selected date highlighted when the calendar opens.
- see which dates are unavailable, and be prevented from selecting them.
- clear the value with a single click.
- read the value in a familiar, locale-appropriate format when I am not editing it.
- close the calendar with <kbd>Escape</kbd> and return to the field.
- be told when the value is required, too early, too late, or unavailable.

### Developer stories

As a developer, I expect to be able to:

- present the calendar as a dropdown or as a modal dialog.
- define the editable mask through an `inputFormat`, and have it default to the current locale.
- set the `displayFormat` to a predefined style or to a custom format string.
- set an initial value and a `defaultValue` the picker resets to on form reset.
- bind the value as a `Date` object or as an ISO string.
- rely on `value` reflecting only committed values.
- set `min`, `max` and `disabledDates` which control both the calendar and the validity.
- mark the picker as `required` and provide my own messages for each validation failure.
- configure the composed calendar - week start, week numbers, outside days, visible months and orientation.
- restrict editing to the calendar, or freeze the component entirely.
- template the calendar and clear icons, the calendar title, the header date and an action area.
- open, close and toggle the picker programmatically, and be notified of those transitions.
- submit the value as part of a native form and have it reset correctly.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/file/6M8cbmxScEGL2pje8lVQgR/Calendar%2C-Date-Picker%2C-Time-Picker?type=design&node-id=2535-1988&mode=design)

**Visual structure**

- A single-line text field with an optional floating or static label, depending on the theme in use.
- A calendar icon rendered in the `prefix` position, which toggles the picker.
- A clear icon rendered in the `suffix` position, present only while there is a value.
- Optional `prefix` and `suffix` content rendered on either side of the text.
- Optional helper text below the field, replaced by the relevant validation message when the component is invalid.
- The calendar surface, rendered either in a popover anchored to the field (**dropdown** mode) or in a modal dialog
  (**dialog** mode). In dialog mode the calendar renders a header and, when action content is provided, a footer.

**Opening and closing**

- Clicking the calendar icon toggles the picker in both modes.
- Clicking the input opens the picker in **dialog** mode only; in dropdown mode the input is an editable field and a
  click positions the caret instead.
- Clicking the label opens the picker in **dialog** mode only.
- <kbd>Alt</kbd> + <kbd>Arrow Down</kbd> opens the picker; <kbd>Alt</kbd> + <kbd>Arrow Up</kbd> and
  <kbd>Escape</kbd> close it and return focus to the input.
- Clicking outside the component closes the picker, unless `keepOpenOnOutsideClick` is set.
- Selecting a date closes the picker and returns focus to the input, unless `keepOpenOnSelect` is set.

**Selecting**

- When the picker is opened, focus is moved inside the calendar. If there is a selected value, its calendar element
  is focused; otherwise the current active date is focused.
- Once focus is inside the calendar, subsequent keyboard navigation is trapped there until the user selects a date,
  presses <kbd>Escape</kbd>, or clicks outside the component.
- Dates outside the `min`/`max` range and dates inside `disabledDates` are rendered as disabled and cannot be
  selected.
- Selecting a date commits it immediately and emits `igcChange`.

**Typing**

- **Unfocused**: the committed value is rendered through `displayFormat`, so it can be considerably more verbose
  than what the user types, for example `Tuesday, July 9, 2024`.
- **On focus**: the text flips to the input format. An empty editor shows the empty mask and selects it.
- **While typing**: only the mask positions accept input and literals are skipped over automatically. The calendar
  view follows along - typing a date in another month brings that month into view.
- **On blur**: the edit is committed and `igcChange` is emitted if the committed value differs from the one the
  editor was focused with. A mask that cannot resolve to a valid date clears the value.

**Feedback and accessibility**

- **Focus indicator**: the field shows the focus styling of the theme; the inner native input is the focus target.
- **Screen readers**: the input is a native text input with an associated label and `aria-haspopup="dialog"`; the
  calendar surface is exposed as a dialog labelled by the input.
- **Validation**: the invalid state is applied after the component has been interacted with, and the matching
  validation message slot replaces the helper text. Opening the picker through the calendar icon does not, by
  itself, mark a required picker invalid.

### Developer experience

#### Basic initialization

```html
<igc-date-picker label="Delivery date"></igc-date-picker>
```

#### Picker mode

The `mode` property selects the presentation of the calendar surface:

```html
<!-- Anchored popover, editable input (default) -->
<igc-date-picker mode="dropdown"></igc-date-picker>

<!-- Modal dialog, read-only input -->
<igc-date-picker mode="dialog"></igc-date-picker>
```

The two modes differ in more than presentation:

- In **dialog** mode the input part is always read-only, and clicking anywhere on it - or on the label - opens the
  dialog.
- In **dropdown** mode no calendar header is rendered. In **dialog** mode the header is rendered unless
  `hide-header` is set, and its orientation is controlled through `header-orientation`.
- In **dialog** mode content projected in the `title`, `header-date` and `actions` slots is rendered in the dialog;
  the `title` and `header-date` slots have no effect in dropdown mode.
- In **dropdown** mode the calendar is wrapped in a focus trap. In **dialog** mode focus trapping and the modal
  overlay are provided by the dialog itself, and `keepOpenOnOutsideClick` maps onto its outside-click behavior.

#### Input and display format

`inputFormat` is the positional mask the end-user edits, and `displayFormat` is how a committed value is rendered
while the editor is not focused. Both are forwarded to the composed date time input; see its
[input format](../date-time-input/spec.md#input-format) and
[display format](../date-time-input/spec.md#display-format) sections for the supported tokens and predefined styles.

```html
<igc-date-picker input-format="dd/MM/yyyy" display-format="fullDate"></igc-date-picker>
```

#### Value and commit semantics

The public `value` only ever holds a committed value. While the user is typing, the intermediate state stays in the
editor; the parsed result reaches `value` - together with an `igcChange` event - when the edit is committed on blur.
Selecting a date in the calendar commits immediately.

```typescript
picker.addEventListener('igcInput', ({ detail }) => console.log('typing:', detail));
picker.addEventListener('igcChange', ({ detail }) => console.log('committed:', detail));
```

The value accepts a `Date`, an ISO string, or `null`. An invalid `Date` object is rejected rather than applied.

#### Interaction states

| State                   | Input part                     | Calendar picker                | Clear icon |
| ----------------------- | ------------------------------ | ------------------------------ | ---------- |
| Default (dropdown mode) | Editable                       | Can be toggled and selected in | Active     |
| `mode="dialog"`         | Read-only, click opens dialog  | Can be toggled and selected in | Active     |
| `non-editable`          | Read-only, click does not open | Can be toggled and selected in | Active     |
| `readonly`              | Read-only                      | Cannot be toggled or opened    | Inactive   |
| `disabled`              | Disabled                       | Cannot be toggled or opened    | Inactive   |

- With `non-editable`, the input part becomes a read-only field. Selection is still available through the calendar,
  and no `igcInput` events are emitted.
- With `readonly`, the input part becomes read-only, the keyboard shortcuts and the toggling of the calendar are
  disabled, and so is clearing the value. The calendar and clear icons appear visually disabled. If the picker is
  opened programmatically while readonly, a selection made in the calendar is reverted.
- `disabled` removes the component from the tab order and from form submission entirely.

#### Constraint validation

`min` and `max` bound the valid range, `disabledDates` excludes individual dates or date ranges, and `required`
makes an empty picker invalid. `min`, `max` and `disabledDates` are also applied to the calendar, which renders the
corresponding dates as disabled so they cannot be selected. Validation messages are rendered through the per-error
slots, replacing the helper text while the component is invalid. See the
[validation container specification](../validation-container/spec.md) for the mechanism.

```html
<igc-date-picker label="Delivery date" required min="2024-08-01" max="2024-08-31">
  <span slot="helper-text">August only</span>
  <span slot="value-missing">Please pick a delivery date</span>
  <span slot="range-underflow">The date is before the delivery window</span>
  <span slot="range-overflow">The date is after the delivery window</span>
  <span slot="bad-input">This date is not available</span>
</igc-date-picker>
```

```typescript
picker.disabledDates = [
  { type: DateRangeType.Specific, dateRange: [new Date(2024, 7, 15)] },
  { type: DateRangeType.Weekends, dateRange: [] },
];
```

When the input is editable, typing a date that falls inside `disabledDates` invalidates the component and is
reported through the `bad-input` slot.

> [!NOTE]
> This is more of a fringe scenario: making the input non-editable and letting the end-user select through the
> calendar is the better user experience.

Custom constraints are applied through `setCustomValidity`, and reported through the `custom-error` slot.

#### Configuring the calendar

The calendar-related configuration is surfaced directly on the picker and forwarded to the composed calendar:

```html
<igc-date-picker
  week-start="monday"
  show-week-numbers
  hide-outside-days
  visible-months="2"
  orientation="horizontal"
  active-date="2024-07-01"
></igc-date-picker>
```

```typescript
picker.specialDates = [
  { type: DateRangeType.Specific, dateRange: [new Date(2024, 11, 24)] },
];
```

`activeDate` sets the date that is brought into view and highlighted. When it is not set, the picker opens on the
selected value, and on the current date when there is no value either.

#### Scroll strategy

In dropdown mode, `scrollStrategy` controls what happens to the anchored calendar when an ancestor scrolls:

| Value              | Behavior                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| `hide` (default)   | The calendar hides while the anchor is fully out of view.                 |
| `scroll`           | The calendar stays visible and anchored to the field.                     |
| `close`            | The calendar closes on each scroll.                                       |

`close` has no effect in dialog mode, where the surface is modal.

#### Slots and templating

```html
<igc-date-picker label="..." mode="dialog" display-format="yyyy/MM/dd">
  <igc-icon slot="calendar-icon" name="calendar"></igc-icon>
  <igc-icon slot="calendar-icon-open" name="calendar_open"></igc-icon>
  <igc-icon slot="clear-icon" name="clear"></igc-icon>
  <span slot="prefix">from</span>
  <span slot="helper-text">Pick a start date</span>
  <p slot="title">Select a start date</p>
  <igc-button slot="actions">Set today</igc-button>
</igc-date-picker>
```

#### Programmatic control

```typescript
const picker = document.querySelector('igc-date-picker')!;

// Picker state. All three are asynchronous and resolve with whether the state changed.
await picker.show();
await picker.hide();
await picker.toggle();

// Editing
picker.stepUp(DatePart.Date);
picker.stepDown(DatePart.Month, 3);
picker.clear();
picker.select();
picker.setSelectionRange(0, 2);
picker.setRangeText('12', 0, 2);
```

The state methods do not emit the `igcOpening`, `igcOpened`, `igcClosing` or `igcClosed` events; those are reserved
for user-driven transitions.

#### Labeling from the light DOM

Besides the `label` property, the picker can be labelled by a `label` element in the light DOM, through `for` or by
nesting it:

```html
<label for="external">Delivery date</label>
<igc-date-picker id="external"></igc-date-picker>
```

An IDREF does not cross a shadow boundary, so the picker resolves its labels through `ElementInternals` and projects
them - together with its own `role`, `aria-haspopup`, `aria-expanded` and `aria-controls` - onto the native input of
the date time input it wraps, as element references. Clicking the external label focuses the editor.

#### Form integration

```html
<form>
  <igc-date-picker name="delivery" label="Delivery date" required></igc-date-picker>
  <button type="submit">Book</button>
</form>
```

- The value is submitted under `name`.
- A form reset restores `defaultValue`, taken from the `value` attribute, and clears the invalid styles of the inner
  editor.
- An invalid picker blocks submission; pressing <kbd>Enter</kbd> submits the owning form only when it is valid.

### Localization

Everything locale-dependent is derived from the active locale:

- `inputFormat` defaults to the date input pattern of the locale, so the order of the day, month and year parts
  follows the locale.
- `placeholder` defaults to the resolved input format.
- `displayFormat` falls back to `inputFormat` and then to the default format of the locale; the predefined styles as
  well as the month and weekday names are rendered through the data of the locale.
- The calendar strings - month and weekday names, the navigation and selection labels - come from the localization
  resources.
- The calendar week start is derived from the locale when `week-start` is not set.

The `locale` property overrides the locale for a single picker; when it is not set, the picker follows the global
locale of the library. A runtime change of the global locale or of the localization resources re-resolves the
default format and re-renders both the input and the calendar.

```html
<igc-date-picker locale="ja"></igc-date-picker>
```

The `resourceStrings` property overrides individual strings for a single picker. It accepts the calendar resource
strings as well as the own strings of the picker, used for the title of the calendar icon and the label of the
dialog:

| Key                       | Default (`en`) |
| ------------------------- | -------------- |
| `date_picker_choose_date` | Choose date    |
| `date_picker_change_date` | Change date    |
| `calendar_select_date`    | Select date    |

Validation messages are provided by the application through the validation message slots, and are therefore
localized by the application.

### Keyboard interactions

As long as focus is within any part of the date picker:

| Key combination   | Result                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| <kbd>Escape</kbd> | If the picker is shown, closes it and returns focus to the input part. Otherwise it is a no-op.        |

When the input part of the component is focused:

| Key combination                                           | Result                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Right</kbd>            | Moves the caret one position to the left or right.                            |
| <kbd>Home</kbd> / <kbd>End</kbd>                          | Moves the caret to the beginning or the end of the mask.                      |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Arrow Left</kbd>  | Moves the caret to the beginning of the current date section, or the previous one. |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Arrow Right</kbd> | Moves the caret to the end of the current date section, or the next one.      |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Down</kbd>               | Increments or decrements the date part the caret is in.                       |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>;</kbd>           | Sets the current date as the value of the component.                          |
| <kbd>Alt</kbd> + <kbd>Arrow Down</kbd>                    | Opens the calendar picker.                                                    |
| <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>                      | Closes the calendar picker and returns focus to the input part.               |
| <kbd>Enter</kbd>                                          | Submits the owning form, if any and if the picker is valid.                   |

All of the above are no-ops while the component is `readonly` or `disabled`; the editing subset is additionally a
no-op while the component is `non-editable` or in **dialog** mode.

When focus is within the calendar, the keyboard navigation follows the
[keyboard interactions of the calendar](../calendar/spec.md#keyboard-interactions).

## API

### Properties and attributes

| Property               | Attribute                  | Reflected | Type                          | Default           | Description                                                              |
| ---------------------- | -------------------------- | --------- | ----------------------------- | ----------------- | ------------------------------------------------------------------------ |
| value                  | value                      | No        | `Date \| null`                | -                 | The committed value of the picker.                                       |
| mode                   | mode                       | No        | `PickerMode`                  | `dropdown`        | Whether the calendar opens in a dropdown or a modal dialog.              |
| open                   | open                       | Yes       | `boolean`                     | false             | The open state of the component.                                         |
| label                  | label                      | No        | `string`                      | -                 | The label of the picker.                                                 |
| placeholder            | placeholder                | No        | `string`                      | the input format  | The placeholder text of the control.                                     |
| inputFormat            | input-format               | No        | `string`                      | from the locale   | The date format to apply on the input.                                   |
| displayFormat          | display-format             | No        | `string`                      | `inputFormat`     | Format to display the value in when not editing.                         |
| prompt                 | prompt                     | No        | `string`                      | `_`               | The prompt symbol to use for unfilled parts of the mask.                 |
| min                    | min                        | No        | `Date \| null`                | -                 | The minimum value required for the picker to remain valid.               |
| max                    | max                        | No        | `Date \| null`                | -                 | The maximum value required for the picker to remain valid.               |
| disabledDates          | -                          | No        | `DateRangeDescriptor[]`       | `[]`              | The disabled dates of the picker.                                        |
| specialDates           | -                          | No        | `DateRangeDescriptor[]`       | -                 | The special dates of the picker.                                         |
| activeDate             | active-date                | No        | `Date`                        | the current date  | The date shown in the calendar and highlighted.                          |
| visibleMonths          | visible-months             | No        | `number`                      | 1                 | The number of months displayed in the calendar.                          |
| orientation            | orientation                | No        | `ContentOrientation`          | `horizontal`      | The orientation of the multiple months in the days view.                 |
| headerOrientation      | header-orientation         | Yes       | `CalendarHeaderOrientation`   | `horizontal`      | The orientation of the calendar header. Dialog mode only.                |
| hideHeader             | hide-header                | Yes       | `boolean`                     | false             | Whether the calendar hides its header. Dialog mode only.                 |
| hideOutsideDays        | hide-outside-days          | Yes       | `boolean`                     | false             | Controls the visibility of the dates outside the current month.          |
| showWeekNumbers        | show-week-numbers          | Yes       | `boolean`                     | false             | Whether to show the number of the week in the calendar.                  |
| weekStart              | week-start                 | No        | `WeekDays`                    | from the locale   | The start day of the week for the calendar.                              |
| keepOpenOnSelect       | keep-open-on-select        | Yes       | `boolean`                     | false             | Keeps the picker open after the user selects a date.                     |
| keepOpenOnOutsideClick | keep-open-on-outside-click | Yes       | `boolean`                     | false             | Keeps the picker open when the user clicks outside of it.                |
| scrollStrategy         | scroll-strategy            | No        | `PopoverScrollStrategy`       | `hide`            | The behavior of the component when a parent container scrolls.           |
| nonEditable            | non-editable               | Yes       | `boolean`                     | false             | Whether to allow typing in the input.                                    |
| readOnly               | readonly                   | Yes       | `boolean`                     | false             | Makes the control a readonly field.                                      |
| outlined               | outlined                   | Yes       | `boolean`                     | false             | Whether the control will have outlined appearance.                       |
| required               | required                   | Yes       | `boolean`                     | false             | Makes the component a required field for validation.                     |
| disabled               | disabled                   | Yes       | `boolean`                     | false             | The disabled state of the component.                                     |
| invalid                | invalid                    | No        | `boolean`                     | false             | Sets the control into invalid state (visual state only).                 |
| name                   | name                       | Yes       | `string`                      | -                 | The name of the control, submitted with the form data.                   |
| locale                 | locale                     | No        | `string`                      | the global locale | The locale used to format the value and resolve the resource strings.    |
| resourceStrings        | -                          | No        | calendar and picker strings   | EN                | The resource strings for localization.                                   |
| defaultValue           | -                          | No        | `Date \| null`                | -                 | The initial value of the control, restored on a form reset.              |
| form                   | -                          | No        | `HTMLFormElement \| null`     | -                 | Read-only. The form associated with this element.                        |
| validity               | -                          | No        | `ValidityState`               | -                 | Read-only. The validity state of the element.                            |
| validationMessage      | -                          | No        | `string`                      | -                 | Read-only. The validation message of the element.                        |
| willValidate           | -                          | No        | `boolean`                     | -                 | Read-only. Whether the element is a candidate for constraint validation. |

### Methods

| Name              | Type signature                                                                              | Description                                                      |
| ----------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| show              | `(): Promise<boolean>`                                                                       | Shows the component.                                             |
| hide              | `(): Promise<boolean>`                                                                       | Hides the component.                                             |
| toggle            | `(): Promise<boolean>`                                                                       | Toggles the open state of the component.                         |
| clear             | `(): void`                                                                                   | Clears the editor of the picker of any user input.               |
| stepUp            | `(datePart?: DatePart, delta?: number): void`                                                | Increments the passed in date part.                              |
| stepDown          | `(datePart?: DatePart, delta?: number): void`                                                | Decrements the passed in date part.                              |
| select            | `(): void`                                                                                   | Selects the text in the input of the component.                  |
| setSelectionRange | `(start: number, end: number, direction?: SelectionRangeDirection): void`                   | Sets the text selection range in the input of the component.     |
| setRangeText      | `(replacement: string, start: number, end: number, mode?: RangeTextSelectMode): void`        | Replaces the selected text and re-applies the mask.              |
| checkValidity     | `(): boolean`                                                                                 | Checks validity and emits `invalid` when the control is invalid. |
| reportValidity    | `(): boolean`                                                                                 | Checks validity and shows the browser message when invalid.      |
| setCustomValidity | `(message: string): void`                                                                     | Sets a custom message. Invalid while `message` is not empty.     |

### Events

| Name       | Cancellable | Detail                | Description                                          |
| ---------- | ----------- | --------------------- | ---------------------------------------------------- |
| igcOpening | true        | -                     | Emitted just before the calendar popover is shown.    |
| igcOpened  | false       | -                     | Emitted after the calendar popover is shown.          |
| igcClosing | true        | -                     | Emitted just before the calendar popover is hidden.   |
| igcClosed  | false       | -                     | Emitted after the calendar popover is hidden.         |
| igcChange  | false       | `Date \| null`        | Emitted when the user modifies and commits the value. |
| igcInput   | false       | `string \| undefined` | Emitted when the user types in the element.           |

### Slots

| Name                 | Description                                                                      |
| -------------------- | --------------------------------------------------------------------------------- |
| `prefix`             | Renders content before the input.                                                |
| `suffix`             | Renders content after the input.                                                 |
| `helper-text`        | Renders content below the input.                                                 |
| `title`              | Renders content in the calendar title. Dialog mode only.                         |
| `header-date`        | Renders content instead of the current date in the calendar header. Dialog mode only. |
| `clear-icon`         | Renders a clear icon template.                                                   |
| `calendar-icon`      | Renders the icon/content for the calendar picker.                                |
| `calendar-icon-open` | Renders the icon/content for the picker in open state.                           |
| `actions`            | Renders content in the action part of the picker in open state.                  |
| `bad-input`          | Renders content when the value is in the disabledDates ranges.                   |
| `value-missing`      | Renders content when the required validation fails.                              |
| `range-overflow`     | Renders content when the max validation fails.                                   |
| `range-underflow`    | Renders content when the min validation fails.                                   |
| `custom-error`       | Renders content when setCustomValidity(message) is set.                          |
| `invalid`            | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

The picker exposes its own parts and re-exports the parts of the calendar it composes.

| Part                                                                | Description                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| `label`                                                             | The label wrapper that renders content above the input. |
| `container`                                                         | The main wrapper that holds all main input elements.    |
| `input`                                                             | The native input element.                               |
| `prefix` / `suffix`                                                 | The prefix and suffix wrappers.                         |
| `calendar-icon` / `calendar-icon-open`                              | The calendar icon wrappers for closed and open state.   |
| `clear-icon`                                                        | The clear icon wrapper.                                 |
| `actions`                                                           | The actions wrapper.                                    |
| `helper-text`                                                       | The helper text wrapper below the input.                |
| `header` / `header-title` / `header-date`                           | The calendar header elements.                           |
| `calendar-content`                                                  | The calendar content element with the views and navigation. |
| `navigation` / `navigation-buttons` / `navigation-button`           | The calendar navigation container and buttons.          |
| `months-navigation` / `years-navigation` / `years-range`            | The calendar month, year and years range navigation.    |
| `days-view-container` / `days-view` / `months-view` / `years-view`  | The calendar view elements.                             |
| `days-row` / `calendar-label`                                       | The calendar days row and week header label.            |
| `week-number` / `week-number-inner`                                 | The calendar week number elements.                      |
| `date` / `date-inner` / `month` / `month-inner` / `year` / `year-inner` | The calendar cell elements.                         |
| `first` / `last` / `inactive` / `hidden` / `weekend` / `range` / `special` / `disabled` / `single` / `preview` | The calendar cell states. |
| `selected` / `current`                                              | The selected and current state of a date, month or year. |

## Test scenarios

The component is covered by two suites in this directory, both running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`date-picker.spec.ts`](./date-picker.spec.ts) | Rendering, properties, interaction, methods and ARIA. |
| [`date-picker-form.spec.ts`](./date-picker-form.spec.ts) | Form association, validation and the message slots. |

They reuse `createFormAssociatedTestBed`, `runValidationContainerTests`, `runExternalLabelAssociationTests`,
`runAriaProjectionTests` and the `simulate*` helpers from [`src/internals/testing`](../../internals/testing). The
groups below mirror the `describe` blocks.

### Rendering and initialization

1. Is defined.
2. Is accessible in the closed state, in the open dropdown state and in the open dialog state.
3. Labels the native input with a label set after the first render.
4. Renders the slotted `prefix`, `suffix`, `clear-icon`, `calendar-icon`, `calendar-icon-open`, `helper-text`,
   `title`, `header-date` and `actions` content.
5. Does not render the `title` slot content in dropdown mode.
6. Is successfully initialized with a value, and with a string property binding - issue #1467.
7. Does not set an invalid `Date` object as a value, through the attribute or through a property binding.
8. Is successfully initialized in the open state, in dropdown and in dialog mode.

### Attributes and properties

9. Sets the value through the attribute.
10. Shows and hides the picker based on the `open` attribute.
11. Sets the prompt character.
12. Does not close the calendar after a selection when `keepOpenOnSelect` is set.
13. Does not close the calendar on an outside click when `keepOpenOnOutsideClick` is set.
14. With `nonEditable`, the value changes only through calendar selection and not through the input.
15. With `readOnly`, the value changes neither through selection nor through typing.
16. Sets the properties of the composed calendar and of the composed input correctly.
17. Renders the label correctly for non-material themes.
18. Active date - defaults to the current date, falls back to the value when only the value is set, and is settable.
19. Localization - sets `inputFormat` and `displayFormat`, applies the predefined display formats, defaults
    `inputFormat` from `Intl.DateTimeFormat` for the locale, and uses the locale format for `displayFormat` when it
    is not defined.
20. Sets the underlying input into readonly mode in dialog mode.
21. Derives the calendar week start from the locale when `week-start` is not set.

### Scroll strategy tests

22. The `scroll` behavior keeps the calendar anchored.
23. The `close` behavior closes the calendar on scroll.
24. The `close` behavior is ignored in dialog mode.

### Methods tests

25. `show`, `hide` and `toggle` open and close the picker without emitting events.
26. `clear` clears the input.
27. `stepUp` and `stepDown` are delegated to the composed date time input.
28. `select`, `setSelectionRange` and `setRangeText` act on the input, and `setRangeText` re-applies the mask.

### Uncommitted edits

Grouped as `Uncommitted edits - issue #1346` in the suite.

29. Does not mutate `value` while typing in the input.
30. Survives a host re-applying the bound value mid-edit.

### Interactions

31. <kbd>Escape</kbd> closes an open picker.
32. <kbd>Alt</kbd> + <kbd>Arrow Down</kbd> opens and <kbd>Alt</kbd> + <kbd>Arrow Up</kbd> closes the picker, in both
    modes.
33. `igcInput` is emitted according to the `nonEditable` property.
34. Clicking the calendar icon opens the picker in both modes.
35. Clicking the input opens the picker in dialog mode only; clicking the label likewise.
36. Clicking the clear icon does not open the picker, in either mode.
37. The calendar view follows the typed value, switching to another month.
38. Issue #1710, and issue #1884 - `igcChange` is emitted in dialog mode after clearing the value and losing focus.

### Readonly state

39. Dropdown mode - the picker does not open on a calendar icon click or a keyboard shortcut, and the value is not
    cleared by clicking the clear icon.
40. Dialog mode - the dialog does not open on a calendar icon, label or input click, nor on a keyboard shortcut, and
    the value is not cleared by clicking the clear icon.

### Form integration tests

41. Clicking the calendar toggle part does not put the component in an invalid state.
42. Is form associated, and does not participate in submission with an empty or invalid value.
43. Participates in submission when the value adheres to the constraints.
44. Resets to its default value on form reset, resets to a new default after a `setAttribute` call, and clears the
    invalid styles of the inner editor on reset.
45. Submits on <kbd>Enter</kbd> when valid, and does not when invalid.
46. Reflects the disabled state of an ancestor `fieldset` or form.
47. Enforces the required, min, max - as dates and as string properties - and custom constraints.
48. Invalidates the component when a disabled date is typed in the input.
49. Validates synchronously.
50. `defaultValue` - correct initial state, submission and reset; and validation for required, min, max and the
    range constraints.

### Validation message slots

Generated by `runValidationContainerTests`.

51. Each validation slot renders for its failing constraint.
52. The projected messages are rendered on the first failed submission.

### ARIA projection and external labels

Generated by `runExternalLabelAssociationTests` and `runAriaProjectionTests`.

53. An external `label` bound through `for`, and a `label` wrapping the host, are projected onto the native input as
    element references, and clicking it focuses the control.
54. The host semantics - role, `aria-haspopup`, `aria-expanded` and the relations - land on the native input of the
    composed editor.

## Assumptions and limitations

- Only a single date value is edited per component; ranges are covered by
  [`igc-date-range-picker`](../date-range-picker/spec.md) and time-only editing by
  [`igc-date-time-input`](../date-time-input/spec.md).
- The `value` is a local `Date`; time zones are not modelled.
- Although the input part is an `igc-date-time-input`, the picker is a date-only editor. Time tokens in the input
  format are not part of the supported configuration.
- The input format is positional. Variable-width tokens that are valid in a display format - `MMM`, `MMMM` - are not
  supported as input format tokens.
- Two-digit years below `50` resolve to the 2000s; `50` and above resolve to the 1900s.
- `min`, `max` and `disabledDates` restrict the calendar and drive validation, but they do not prevent an
  out-of-range date from being typed in; such a value invalidates the component instead.
- `hideHeader`, `headerOrientation`, and the `title` and `header-date` slots are only in effect in **dialog** mode.

## Accessibility

### ARIA roles and properties

- The input part is a native text input with an associated label; the host delegates focus to it.
- The picker projects `aria-haspopup="dialog"`, its expanded state and the relation to the calendar surface onto
  that native input, as element references, because an IDREF does not cross a shadow boundary.
- The calendar surface is exposed as a dialog labelled by the input.
- In dropdown mode the calendar is wrapped in a focus trap; in dialog mode the dialog provides the modal semantics
  and the focus trap.
- The helper text and the validation messages are referenced through `aria-describedby`.
- Opening the picker does not, by itself, mark a required picker invalid.
- Within the calendar, the ARIA of the [calendar specification](../calendar/spec.md#aria-roles-and-properties)
  applies.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
