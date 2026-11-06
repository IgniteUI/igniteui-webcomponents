# igc-calendar

A calendar that lets the user select a single date, multiple dates or a date range.

```ts
import { defineComponents, IgcCalendarComponent } from 'igniteui-webcomponents';

defineComponents(IgcCalendarComponent);
```

## Properties

- `hideOutsideDays`: `boolean`. Default: `false`. Attribute: `hide-outside-days`, reflected.
  Whether the calendar hides the dates that do not belong to the current month.
- `hideHeader`: `boolean`. Default: `false`. Attribute: `hide-header`, reflected.
  Whether the calendar hides its header.
  In `multiple` selection mode, the header is always hidden.
- `headerOrientation`: `'horizontal' | 'vertical'`. Default: `'horizontal'`. Attribute: `header-orientation`, reflected.
  The orientation of the calendar header.
- `orientation`: `'horizontal' | 'vertical'`. Default: `'horizontal'`. Attribute: `orientation`.
  The orientation of the calendar months when more than one month
  is being shown.
- `visibleMonths`: `number`. Default: `1`. Attribute: `visible-months`.
  The number of months displayed in the days view.
- `activeView`: `'days' | 'months' | 'years'`. Default: `'days'`. Attribute: `active-view`.
  The active view of the calendar: `days`, `months` or `years`.
- `formatOptions`: `Pick<Intl.DateTimeFormatOptions, 'month' | 'weekday'>`. Default: `{ month: 'long', weekday: 'narrow' }`. No attribute.
  The options used to format the months and the weekdays in the calendar views.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `IgcCalendarResourceStrings & Required<ICalendarResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.
- `value`: `Date | null`. Attribute: `value`.
  The value of the calendar in `single` selection mode.
- `values`: `Date[]`. Attribute: `values`.
  The values of the calendar in `multiple` and `range` selection modes.
- `activeDate`: `Date`. Attribute: `active-date`.
  The date that the calendar shows and highlights. It changes when the user navigates.
  Without it, the calendar starts at its value, or at the current date when there is no value.
- `selection`: `'multiple' | 'single' | 'range'`. Default: `'single'`. Attribute: `selection`.
  The selection mode of the calendar: `single`, `multiple` or `range`.
  A change after the first render clears the value and the values.
- `showWeekNumbers`: `boolean`. Default: `false`. Attribute: `show-week-numbers`, reflected.
  Whether the calendar shows the week numbers.
- `weekStart`: `'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'`. Attribute: `week-start`.
  The first day of the week.
- `specialDates`: `DateRangeDescriptor[] | undefined`. No attribute.
  The date ranges that the calendar marks as special.
- `disabledDates`: `DateRangeDescriptor[] | undefined`. No attribute.
  The date ranges that the user cannot select.

## Events

- `igcChange`
  Emitted when the user changes the value of the calendar.

## Slots

- `title`: Renders the title of the calendar header.
- `header-date`: Renders content instead of the current date/range in the calendar header.

## CSS parts

- `header`: The header element of the calendar.
- `header-title`: The header title element of the calendar.
- `header-date`: The header date element of the calendar.
- `content`: The content element which contains the views and navigation elements of the calendar.
- `content-vertical`: The content element which contains the views and navigation elements of the calendar in vertical orientation.
- `navigation`: The navigation container element of the calendar.
- `picker-dates`: The container of the month and year navigation buttons, or of the years range.
- `months-navigation`: The months navigation button element of the calendar.
- `years-navigation`: The years navigation button element of the calendar.
- `years-range`: The years range element of the calendar.
- `navigation-buttons`: The navigation buttons container of the calendar.
- `navigation-button`: Previous/next navigation button of the calendar.
- `vertical`: Added to the navigation-button part when the orientation is `vertical`.
- `days-view-container`: The days view container element of the calendar.
- `days-view`: Days view element of the calendar.
- `months-view`: The months view element of the calendar.
- `years-view`: The years view element of the calendar.
- `days-row`: Days row element of the calendar.
- `months-row`: Months row element of the calendar.
- `years-row`: Years row element of the calendar.
- `label`: Week header label element of the calendar.
- `label-inner`: Week header label inner element of the calendar.
- `week-number`: Week number element of the calendar.
- `week-number-inner`: Week number inner element of the calendar.
- `date`: Date element of the calendar.
- `date-inner`: Date inner element of the calendar.
- `first`: The first selected date element of the calendar in range selection. Also applies to the week numbers header cell.
- `last`: The last selected date element of the calendar in range selection. Also applies to the week number of the last rendered week.
- `inactive`: Inactive date element of the calendar.
- `hidden`: Hidden date element of the calendar.
- `weekend`: Weekend date element of the calendar.
- `range`: Range selected element of the calendar.
- `special`: Special date element of the calendar.
- `disabled`: Disabled date element of the calendar.
- `single`: Single selected date element of the calendar.
- `preview`: Range selection preview date element of the calendar.
- `month`: Month element of the calendar.
- `month-inner`: Month inner element of the calendar.
- `year`: Year element of the calendar.
- `year-inner`: Year inner element of the calendar.
- `selected`: Indicates selected state. Applies to date, month and year elements of the calendar.
- `current`: Indicates current state. Applies to date, month and year elements of the calendar.
