# igc-date-picker

A date field where the user types a date or selects one in a calendar.
The calendar opens in a dropdown or in a dialog.

```ts
import { defineComponents, IgcDatePickerComponent } from 'igniteui-webcomponents';

defineComponents(IgcDatePickerComponent);
```

## Properties

- `value`: `Date | null`. Attribute: `value`.
  The value of the picker.

  Only ever holds a committed value. While the user is typing in the input, the
  intermediate state stays in the editor and is committed - together with an
  `igcChange` event - when the edit is committed on blur. Use the `igcInput` event
  to observe the value as it is being typed.
- `placeholder`: `string`. Attribute: `placeholder`.
  The placeholder text of the control.
- `selectionStart`: `number`. Read-only. No attribute.
  The offset of the start of the text selection in the input, in UTF-16
  code units. Equals `selectionEnd` when no text is selected.
- `selectionEnd`: `number`. Read-only. No attribute.
  The offset of the end of the text selection in the input, in UTF-16 code
  units.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `IgcCalendarResourceStrings & Required<IDatePickerResourceStrings> & Required<ICalendarResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.
- `required`: `boolean`. Default: `false`. Attribute: `required`, reflected.
  Whether the control is required. A required control that has no value,
  or is not checked, fails validation.
- `defaultValue`: `unknown`. No attribute.
  The default value of the control. A form reset restores the value to it.
  While the value is unchanged since the start or the last form reset, a
  new default also sets the value. The `value` attribute also sets it.
- `name`: `string`. Attribute: `name`, reflected.
  The name of the control, submitted with the form data.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`.
  Whether the control is disabled. A disabled control is not validated,
  and the form does not submit its value.
- `invalid`: `boolean`. Default: `false`. Attribute: `invalid`.
  Whether the control shows the invalid state. It changes only the visual
  state, not the validity.
- `form`: `HTMLFormElement | null`. Read-only. No attribute.
  The form that the control is associated with, or `null`.
- `validity`: `ValidityState`. Read-only. No attribute.
  The validity state of the control.
- `validationMessage`: `string`. Read-only. No attribute.
  The validation message of the control. It is empty when the control is
  valid.
- `willValidate`: `boolean`. Read-only. No attribute.
  Whether the control is a candidate for constraint validation.
- `mode`: `'dropdown' | 'dialog'`. Default: `'dropdown'`. Attribute: `mode`.
  Whether the calendar opens in a dropdown or in a modal dialog.
  In `dialog` mode, the user cannot type in the input.
- `readOnly`: `boolean`. Default: `false`. Attribute: `readonly`, reflected.
  Whether the control is read-only. The user cannot change the value or open the calendar.
- `nonEditable`: `boolean`. Default: `false`. Attribute: `non-editable`, reflected.
  Whether the user cannot type in the input. The user can still select a date in the calendar.
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the control has an outlined appearance.
- `label`: `string`. Attribute: `label`.
  The label of the picker.
- `prompt`: `string`. Default: `'_'`. Attribute: `prompt`.
  The prompt symbol to use for unfilled parts of the mask.
- `displayFormat`: `string`. Attribute: `display-format`.
  The format of the value while the input does not have focus.
  Without it, the input uses `inputFormat` when set, else the display format of the locale.
- `inputFormat`: `string`. Attribute: `input-format`.
  The date format of the input while the user edits the value.
  Without it, the input uses the input format of the locale.
- `min`: `Date | null`. Attribute: `min`.
  The minimum value required for the picker to remain valid.
  The calendar disables the dates before it.
- `max`: `Date | null`. Attribute: `max`.
  The maximum value required for the picker to remain valid.
  The calendar disables the dates after it.
- `disabledDates`: `DateRangeDescriptor[]`. Default: `[]`. No attribute.
  The date ranges that the user cannot select in the calendar.
  A value that includes one of these dates is invalid.
- `specialDates`: `DateRangeDescriptor[]`. No attribute.
  The date ranges that the calendar marks as special.
- `activeDate`: `Date`. Attribute: `active-date`.
  The date that the calendar shows and highlights.
  Without it, the calendar starts at the value, or at the current date when there is no value.
- `visibleMonths`: `number`. Default: `1`. Attribute: `visible-months`.
  The number of months displayed in the calendar.
- `headerOrientation`: `'horizontal' | 'vertical'`. Default: `'horizontal'`. Attribute: `header-orientation`, reflected.
  The orientation of the calendar header. It applies only in `dialog` mode.
- `orientation`: `'horizontal' | 'vertical'`. Default: `'horizontal'`. Attribute: `orientation`.
  The orientation of the multiple months displayed in the calendar's days view.
- `hideHeader`: `boolean`. Default: `false`. Attribute: `hide-header`, reflected.
  Whether the calendar hides its header. In `dropdown` mode, the header is always hidden.
- `hideOutsideDays`: `boolean`. Default: `false`. Attribute: `hide-outside-days`, reflected.
  Whether the calendar hides the dates that do not belong to the current month.
- `showWeekNumbers`: `boolean`. Default: `false`. Attribute: `show-week-numbers`, reflected.
  Whether the calendar shows the week numbers.
- `weekStart`: `'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'`. Attribute: `week-start`.
  The first day of the week in the calendar.
- `keepOpenOnSelect`: `boolean`. Default: `false`. Attribute: `keep-open-on-select`, reflected.
  Whether the component stays open after the user selects an item.
- `keepOpenOnOutsideClick`: `boolean`. Default: `false`. Attribute: `keep-open-on-outside-click`, reflected.
  Whether the component stays open when the user clicks outside of it.
- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the component is open.
- `scrollStrategy`: `'scroll' | 'hide' | 'close'`. Default: `'hide'`. Attribute: `scroll-strategy`.
  The behavior of the component when a parent container scrolls.

  If the value is `hide`, the component hides while the anchor is fully out
  of view. `hide` is the default value.

  If the value is `scroll`, the component stays visible and anchored.

  If the value is `close`, the component closes on each scroll.

## Methods

- `stepUp(datePart?: DatePart, delta?: number): void`
  Increments a date part by `delta`, or by 1. Without `datePart`, it changes the
  part at the cursor or a default part.
- `stepDown(datePart?: DatePart, delta?: number): void`
  Decrements a date part by `delta`, or by 1. Without `datePart`, it changes the
  part at the cursor or a default part.
- `select(): void`
  Selects the text in the input of the component.
- `setSelectionRange(start: number, end: number, direction?: SelectionRangeDirection): void`
  Sets the text selection range in the input of the component.
- `setRangeText(replacement: string, start?: number, end?: number, mode?: RangeTextSelectMode): void`
  Replaces the text from `start` to `end` in the input and re-applies the
  mask. Without `start` and `end`, replaces the selected text.
- `reportValidity(): boolean`
  Checks validity. As for a native control, an invalid control emits
  `invalid` and takes the focus. It shows its own validation messages, not
  the message of the browser. Returns `true` when the control is valid.
- `checkValidity(): boolean`
  Checks validity and emits `invalid` when the control is invalid. Returns
  `true` when the control is valid.
- `setCustomValidity(message: string): void`
  Sets a custom validation message. The control is invalid while the
  message is not empty. An empty string removes the custom error.
- `focus(options?: FocusOptions): void`
  Sets focus on the picker.
- `blur(): void`
  Removes focus from the picker.
- `clear(): void`
  Clears the value and the input text of the picker.
- `show(): Promise<boolean>`
  Opens the component. It does not emit events. The promise resolves to
  `false` when the component is already open, or when a later call replaces
  this one.
- `hide(): Promise<boolean>`
  Closes the component. It does not emit events. The promise resolves to
  `false` when the component is already closed, or when a later call
  replaces this one.
- `toggle(): Promise<boolean>`
  Opens the component when it is closed, and closes it when it is open. It
  does not emit events. The promise resolves to `true` when the state
  changes.

## Events

- `igcOpening`
  Emitted before a user interaction opens the calendar. Cancelable.
- `igcOpened`
  Emitted after a user interaction opens the calendar.
- `igcClosing`
  Emitted before a user interaction closes the calendar. Cancelable.
- `igcClosed`
  Emitted after a user interaction closes the calendar.
- `igcChange`
  Emitted when the user commits a change to the value.
- `igcInput`
  Emitted when the user types in the input.

## Slots

- `prefix`: Renders content before the input.
- `suffix`: Renders content after the input.
- `helper-text`: Renders content below the input.
- `bad-input`: Renders content when the value is in the `disabledDates` ranges.
- `value-missing`: Renders content when the required validation fails.
- `range-overflow`: Renders content when the max validation fails.
- `range-underflow`: Renders content when the min validation fails.
- `custom-error`: Renders content when a custom message is set with `setCustomValidity()`.
- `invalid`: Renders content when the component is in invalid state (validity.valid = false).
- `title`: Renders content in the calendar title. It applies only in `dialog` mode.
- `header-date`: Renders content instead of the current date in the calendar header. It applies only in `dialog` mode.
- `clear-icon`: Renders the icon of the clear button.
- `calendar-icon`: Renders the icon/content for the calendar picker.
- `calendar-icon-open`: Renders the icon/content for the picker in open state.
- `actions`: Renders content in the action part of the picker in open state.

## CSS parts

- `label`: The label wrapper that renders content above the target input.
- `container`: The main wrapper that holds all main input elements.
- `input`: The native input element.
- `prefix`: The prefix wrapper.
- `suffix`: The suffix wrapper.
- `calendar-icon`: The calendar icon wrapper for closed state.
- `calendar-icon-open`: The calendar icon wrapper for opened state.
- `clear-icon`: The clear icon wrapper.
- `actions`: The actions wrapper.
- `helper-text`: The helper-text wrapper that renders content below the target input.
- `header`: The calendar header element.
- `header-title`: The calendar header title element.
- `header-date`: The calendar header date element.
- `calendar-content`: The calendar content element which contains the views and navigation elements.
- `navigation`: The calendar navigation container element.
- `months-navigation`: The calendar months navigation button element.
- `years-navigation`: The calendar years navigation button element.
- `years-range`: The calendar years range element.
- `navigation-buttons`: The calendar navigation buttons container.
- `navigation-button`: The calendar previous/next navigation button.
- `days-view-container`: The calendar days view container element.
- `days-view`: The calendar days view element.
- `months-view`: The calendar months view element.
- `years-view`: The calendar years view element.
- `days-row`: The calendar days row element.
- `months-row`: The calendar months row element.
- `years-row`: The calendar years row element.
- `calendar-label`: The calendar week header label element.
- `calendar-label-inner`: The calendar week header label inner element.
- `week-number`: The calendar week number element.
- `week-number-inner`: The calendar week number inner element.
- `date`: The calendar date element.
- `date-inner`: The calendar date inner element.
- `first`: The calendar first selected date element in range selection.
- `last`: The calendar last selected date element in range selection.
- `inactive`: The calendar inactive date element.
- `hidden`: The calendar hidden date element.
- `weekend`: The calendar weekend date element.
- `range`: The calendar range selected element.
- `special`: The calendar special date element.
- `disabled`: The calendar disabled date element.
- `single`: The calendar single selected date element.
- `preview`: The calendar range selection preview date element.
- `month`: The calendar month element.
- `month-inner`: The calendar month inner element.
- `year`: The calendar year element.
- `year-inner`: The calendar year inner element.
- `selected`: The calendar selected state for element(s). Applies to date, month and year elements.
- `current`: The calendar current state for element(s). Applies to date, month and year elements.
- `dialog-base`: The base of the dialog in dialog mode. Style the backdrop with `::part(dialog-base)::backdrop`.
- `title`: The title of the dialog in dialog mode.
- `footer`: The footer of the dialog in dialog mode.

## CSS custom properties

- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.
