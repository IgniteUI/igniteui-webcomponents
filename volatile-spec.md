# Date-picker specification

- [Date-picker specification](#date-picker-specification)
  - [Owned By](#owned-by)
    - [Requires approval from:](#requires-approval-from)
    - [Signed off by:](#signed-off-by)
    - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Developer experience](#developer-experience)
      - [Default initialization](#default-initialization)
      - [With initial value through attribute](#with-initial-value-through-attribute)
    - [Behaviors](#behaviors)
    - [Localization](#localization)
      - [Input format](#input-format)
      - [Display format](#display-format)
    - [Keyboard navigation](#keyboard-navigation)
  - [API](#api)
    - [Properties](#properties)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow Parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Automation](#automation)
      - [Rendering and initialization](#rendering-and-initialization)
      - [Attributes and properties](#attributes-and-properties)
      - [Methods](#methods-1)
      - [Interactions](#interactions)
      - [Form integration](#form-integration)
  - [Accessibility](#accessibility)
    - [ARIA](#aria)
      - [References](#references)
    - [RTL](#rtl)
  - [Assumptions and limitations](#assumptions-and-limitations)

## Owned By

**Team Name**: Astrea + Design and Web Development
**Developer name**: Bozhidara Pachilova
**Designer name**: Dilyana Dimova

### Requires approval from:

- [ ] Damyan Petev
- [ ] Svilen Dimchevski

### Signed off by:

- [ ] Simeon Simeonov
- [ ] Radoslav Mirchev

### Revision history

| Version | Author              | Date       | Notes                                           |
| ------: | ------------------- | ---------- | ----------------------------------------------- |
|       - | Radoslav Karaivanov | 2024-02-16 | Initial draft                                   |
|       - | Radoslav Karaivanov | 2024-02-21 | Updated behaviors, ARIA and automation sections |

## Overview

The `igc-datepicker` lets users select a date by either typing it in its input field or by
selecting it through a dropdown/dialog popup calendar view.

### Acceptance criteria

The `igc-datepicker` must:

- let users input a date by either typing it in or picking one through its calendar component.
- be form associated and when configured as part of a form, participate in form submission and validation.
- expose configuration properties for modifying/localizing the input and display format of the date value in the input part.
- expose configuration properties for modifying/localizing the relevant parts of its calendar component.
- have adequate keyboard support for navigation and selection.
- be WAI-ARIA compliant.

## User stories

### End-user stories

As an end-user I expect to be able to:

- type in a date value inside the component
- select a date from the calendar picker of the component
- identify and distinguish the current date, selected date, weekends, special and disabled dates
- navigate and make edits in the input part of the component using a keyboard
- navigate and make selection in the calendar picker part of the component using a keyboard
- navigate in and out of the component using only a keyboard

### Developer stories

As a developer I expect to be able to:

- set an initial value for the component and/or change the value of the component programmatically if need be
- set the interaction state of the component - make it **disabled** and/or **readonly**
- set additional properties such as **label**, **placeholder** and/or validators in order to enrich and guide the end user experience
- use the component in a standard form and have the component participate in form submission and validation
- choose whether the calendar picker would be a dropdown like experience or a dialog like experience
- control how the date value would be formatted in the input both during editing and display, by specifying a custom pattern/mask
- hide/show days outside of the current month in the calendar picker
- set the day that weeks would start in the calendar picker
- set whether to show/hide week numbers in the calendar picker
- set special/disabled dates in the calendar picker
- set the number of months rendered in the calendar picker
- set the formatting and localization of dates and elements in the calendar picker
- listen and react to user interactions through events on the component.

## Functionality

### End-user experience

> Design hand-off

### Developer experience

#### Default initialization

```html
<igc-datepicker label="Start date"></igc-datepicker>
```

#### With initial value through attribute

```html
<igc-datepicker label="..." value="2024-01-01"></igc-datepicker>
```

### Behaviors

1. When the `non-editable` attribute is set, the input part of the component is transformed into a read-only field.
   Selection is still available through the calendar picker.

2. When the `readonly` attribute is set, the input part of the component is transformed into a read-only field.
   The picker part allows navigation but no selection.

3. When there are `disabledDates` set and the component input is editable, typing in a disabled date must invalidate
   the component.

   > [!NOTE]
   > This is more of a fringe scenario as in that case making the input non-editable and allowing the user
   > to make a selection through the calendar widget is a better UX.

4. Once focus is inside the calendar subsequent keyboard navigation should trap focus inside the calendar widget until
   the user selects a date, presses <kbd>Escape</kbd> or clicks outside of the component.

5. ?? When the component is configured in **dropdown** mode, no calendar header is rendered while in **dialog** mode
   this is controlled through the `hide-header` attribute. ??

### Localization

#### Input format

The `igc-datepicker` supports specifying an input mask pattern to customize and guide the end-user typing in the
input part of the component.

**Mask tokens**

| Token  | Description                                              |
| ------ | -------------------------------------------------------- |
| `d`    | Date, will be coerced with a leading zero while editing  |
| `dd`   | Date with an explicitly set leading zero                 |
| `M`    | Month, will be coerced with a leading zero while editing |
| `MM`   | Month with an explicitly set leading zero                |
| `yy`   | Year, short format                                       |
| `yyyy` | Year, full format                                        |

> [!NOTE]
> If `inputFormat` is not explicitly set, it will default to whatever `Intl.DateTimeFormat` returns for the currently set `locale` of the component.

#### Display format

Similar to the `inputFormat`, the `displayFormat` property allows for specifying how the value of the component will be displayed in the input
while not editing. It supports a mask pattern and a few predefined formats.

**Mask tokens**

For the date value of **_2024-07-09_**:

| Token   | Description                 | Result |
| ------- | --------------------------- | ------ |
| `d`     | Day - minimum digits        | 9      |
| `dd`    | Day - zero padded           | 09     |
| `M`     | Month - minimum digits      | 7      |
| `MM`    | Month - zero padded         | 07     |
| `MMM`   | Month - Abbreviated         | Jul    |
| `MMMM`  | Month - Full                | July   |
| `MMMMM` | Month - Narrow              | J      |
| `y`     | Year - Numeric              | 2024   |
| `yy`    | Year - Two digit short form | 24     |
| `yyy`   | Year - Numeric              | 2024   |
| `yyyy`  | Year - Numeric              | 2024   |

For the predefined formats, the result depends on the `locale` of the component.

**Predefined**

For the date value of **_2024-07-09_** with locale set to 'en':

| Format   | Result                |
| -------- | --------------------- |
| `short`  | 7/9/24                |
| `medium` | Jul 9, 2024           |
| `long`   | July 9, 2024          |
| `full`   | Tuesday, July 9, 2024 |

> [!NOTE]
> If `displayFormat` is not defined, it will use the value of `inputFormat`.

### Keyboard navigation

As long as focus is within parts of the date picker component:

| Key combination   | Description                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| <kbd>Escape</kbd> | If the picker is shown closes the picker and returns focus to the input part. Otherwise it is a no-op |

When the input part of the component is focused:

| Key combination                              | Description                                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | Moves the caret one character in the desired direction                                                                                |
| <kbd>Ctrl + ArrowLeft</kbd>                  | Moves the caret to the beginning of the current input mask section or to the start of the previous one it is already at the beginning |
| <kbd>Ctrl + ArrowRight</kbd>                 | Moves the caret to the end of the current input mask section or to the end of the next one it is already at the end                   |
| <kbd>ArrowUp</kbd>                           | Increments by one step the currently "focused" part of the input mask                                                                 |
| <kbd>ArrowDown</kbd>                         | Decrements by one step the currently "focused" part of the input mask                                                                 |
| <kbd>Home</kbd>                              | Moves the caret at the beginning of the mask                                                                                          |
| <kbd>End</kbd>                               | Moves the caret at the end of the mask                                                                                                |
| <kbd>Ctrl + ;</kbd>                          | Sets the current date as the value of the component                                                                                   |
| <kbd>Alt + ArrowDown</kbd>                   | Opens the calendar dropdown ?? _Clashes with date-time-editor_                                                                        |
| <kbd>Alt + ArrowUp</kbd>                     | Closes the calendar dropdown ?? _Clashes with date-time-editor_                                                                       |

**When focus is within the calendar picker, the keyboard navigation follows the behaviors
described in [this section](https://github.com/IgniteUI/igniteui-webcomponents/wiki/Calendar-Specification#behaviors) of the calendar specification.**

## API

### Properties

| Property                 | Attribute                    | Reflected | Property Type                | Default                     | Description                                                                                         |
| ------------------------ | ---------------------------- | --------- | ---------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------- |
| `open`                   | `open`                       | Yes       | `boolean`                    | `false`                     | Whether the calendar picker is open                                                                 |
| `mode`                   | `mode`                       | No        | `'dropdown' \| 'dialog'`     | `dropdown`                  | Whether to display the calendar picker in a dropdown or a modal dialog                              |
| `keepOpenOnSelect`       | `keep-open-on-select`        | Yes       | `boolean`                    | `false`                     | Whether the calendar picker should be kept open on selection                                        |
| `keepOpenOnOutsideClick` | `keep-open-on-outside-click` | Yes       | `boolean`                    | `false`                     | Whether the calendar picker should be kept open when clicking outside of it                         |
| `value`                  | `value`                      | No        | `Date`                       | -                           | The value of the component                                                                          |
| `name`                   | `name`                       | No        | `string`                     | -                           | The name of the component                                                                           |
| `min`                    | `min`                        | No        | `Date`                       | -                           | The minimum value required for the component to remain valid                                        |
| `max`                    | `max`                        | No        | `Date`                       | -                           | The maximum value allowed for the component to remain valid                                         |
| `required`               | `required`                   | Yes       | `boolean`                    | `false`                     | Makes the component required in a form context                                                      |
| `disabled`               | `disabled`                   | Yes       | `boolean`                    | `false`                     | Disables the component                                                                              |
| `readOnly`               | `readonly`                   | Yes       | `boolean`                    | `false`                     | Makes the component readonly                                                                        |
| `nonEditable`            | `non-editable`               | Yes       | `boolean`                    | `false`                     | Whether to allow typing in the input                                                                |
| `placeholder`            | `placeholder`                | No        | `string`                     | -                           | The placeholder for the input                                                                       |
| `label`                  | `label`                      | No        | `string`                     | -                           | The label for the component                                                                         |
| `outlined`               | `outlined`                   | Yes       | `boolean`                    | `false`                     | Whether the input part will have outline appearance in the Material theme                           |
| `locale`                 | `locale`                     | No        | `string`                     | `en`                        | The locale used to display the value and used for formatting the display of the calendar dates      |
| `inputFormat`            | `input-format`               | No        | `string`                     | Default for `locale`        | Date mask pattern when editing in the input part of the component [Reference](#input-format)        |
| `displayFormat`          | `display-format`             | No        | `string`                     | `inputFormat`               | Date pattern to apply to the input value when the input is not focused [Reference](#display-format) |
| `prompt`                 | `prompt`                     | No        | `string`                     | `_`                         | The prompt character used for unfilled parts of the input mask                                      |
| `weekStart`              | `week-start`                 | No        | `typed string`               | `sunday`                    | Sets the start day of the week                                                                      |
| `showWeekNumbers`        | `show-week-numbers`          | Yes       | `boolean`                    | `false`                     | Whether to show the number of the week in the calendar days view                                    |
| `hideOutsideDays`        | `hide-outside-days`          | Yes       | `boolean`                    | `false`                     | Whether to show dates that do not belong to the current month                                       |
| ?`hideHeader`?           | `hide-header`                | No?       | `boolean`                    | `false`                     | Whether to show the calendar header                                                                 |
| ?`headerOrientation`?    | `header-orientation`         | Yes       | `'vertical' \| 'horizontal'` | `horizontal`                | Whether to align the calendar header vertically or horizontally                                     |
| `orientation`            | `orientation`                | No        | `'vertical' \| 'horizontal'` | `horizontal`                | Whether to align multiple months horizontally or vertically                                         |
| `visibleMonths`          | `visible-months`             | No        | `number`                     | `1`                         | The number of months to show in the calendar days view                                              |
| `disabledDates`          | -                            | No        | `DateRangeDescriptor[]`      | -                           | The disabled dates for the calendar picker                                                          |
| `specialDates`           | -                            | No        | `DateRangeDescriptor[]`      | -                           | The special dates for the calendar picker                                                           |
| `activeDate`             | `active-date`                | No        | `Date`                       | The current date if not set | Sets the date which is shown in view and is highlighted                                             |
| `resourceStrings`        | -                            | No        | `IgcCalendarResourceStrings` | -                           | Resource strings for localization of the calendar picker                                            |

### Methods

| Name                | Type signature                                                                                               | Description                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `show`              | `(): void`                                                                                                   | Shows the component picker                                                                               |
| `hide`              | `(): void`                                                                                                   | Hides the component picker                                                                               |
| `toggle`            | `(): void`                                                                                                   | Toggles between the open state of the picker                                                             |
| `clear`             | `(): void`                                                                                                   | Clears the input part of the component of any user input                                                 |
| `stepUp`            | `(datePart?: DatePart, delta?: number): void`                                                                | Increments the passed in date part                                                                       |
| `stepDown`          | `(datePart?: DatePart, delta?: number): void`                                                                | Decrements the passed in date part                                                                       |
| `select`            | `(): void`                                                                                                   | Selects the text in the input of the component                                                           |
| `setSelectionRange` | `(start: number, end: number, direction?: 'none' \| 'backward' \| 'forward'): void`                          | Sets the text selection range in the input of the component                                              |
| `setRangeText`      | `(replacement: string, start: number, end: number, mode?: 'select' \| 'start' \| 'end' \| 'preserve'): void` | Replaces the selected text in the input and re-applies the mask                                          |
| `setCustomValidity` | `(message: string): void`                                                                                    | Sets a custom validation message. As long as `message` is not empty, the component is considered invalid |

### Events

| Name       | Cancellable | Description                                            |
| ---------- | ----------- | ------------------------------------------------------ |
| igcOpening | Yes         | Emitted when the calendar picker is opening            |
| igcOpened  | No          | Emitted after the picker is shown                      |
| igcClosing | Yes         | Emitted when the calendar picker is closing            |
| igcClosed  | No          | Emitted when the calendar picker is closed             |
| igcChange  | No          | Emitted when the value of the component is changed     |
| ?igcInput? | No          | Emitted when typing in the input part of the component |

### Slots

| Name                 | Description                                           |
| -------------------- | ----------------------------------------------------- |
| prefix               | Renders content before the input                      |
| clear-icon           | Renders a clear icon template                         |
| calendar-icon        | Renders the icon/content for the calendar picker      |
| ?calendar-icon-open? | Renders the icon/content for the picker in open state |
| suffix               | Renders content after the input                       |
| helper-text          | Renders content below the input                       |
| title?               | Renders content for the calendar title                |

### CSS Shadow Parts

| Part | Description |
| ---- | ----------- |

## Test scenarios

### Automation

#### Rendering and initialization

1. should be successfully initialized in the DOM (defined and rendered).
2. should be successfully initialized with an initial value
3. should be successfully initialized in open state in dropdown mode
4. should be successfully initialized in open state in dialog mode
5. should render slotted elements - prefix, suffix, clear-icon, calendar-icon, helper-text, title?
6. should pass automated WAI-ARIA tests in closed state
7. should pass automated WAI-ARIA tests in open state in dropdown mode
8. should pass automated WAI-ARIA tests in open state in dialog mode

#### Attributes and properties

1. should show/hide the picker based on the value of the **open** attribute
2. should keep the picker open when **keepOpenOnOutsideClick** is enabled and a click if fired outside of the component
3. should keep the picker open when **keepOpenOnSelect** is enabled and a selection is made in the calendar picker

> [!NOTE]
> The rest of the properties/attributes should already be covered by the respective unit tests of the components
> used in the igc-datepicker.

#### Methods

1. should open the picker on calling **show()**
2. should close the picker on calling **hide()**
3. should toggle the open state of the picker on calling **toggle()**

#### Interactions

1. ?should open the calendar picker on <kbd>Alt + ArrowDown</kbd>?
2. ?should close the calendar picker on <kbd>Alt + ArrowUp</kbd>?
3. should close the picker when in open state on pressing <kbd>Escape</kbd>
4. should correctly trap keyboard navigation focus once focus is inside the calendar

#### Form integration

1. should be form associated
2. should not participate in form submission if the value is empty/invalid
3. should participate in form submission if there is a value and the value adheres to the validation constraints
4. should reset to its default value state on form reset
5. should reflect disabled ancestor state (fieldset/form)
6. should enforce required constraint
7. should enforce min value constraint
8. should enforce max value constraint
9. should invalidate the component if a disabled date is typed it in the input
10. should enforce custom constraint

## Accessibility

### ARIA

- the underlying igc-calendar should have `role="dialog"`

#### References

https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/

### RTL

The component should work in a Right-To-Left context without additional setup or configuration.

## Assumptions and limitations
