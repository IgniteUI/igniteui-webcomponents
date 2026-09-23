# Calendar specification

- [Calendar specification](#calendar-specification)
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
      - [Selection modes](#selection-modes)
      - [The active date](#the-active-date)
      - [Multiple months](#multiple-months)
      - [Week numbers](#week-numbers)
      - [Disabled and special dates](#disabled-and-special-dates)
      - [Header and slots](#header-and-slots)
      - [Formatting](#formatting)
    - [Calendar views](#calendar-views)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Rendering](#rendering)
    - [Locale](#locale)
    - [Interactions](#interactions)
    - [Selection model](#selection-model)
    - [Keyboard navigation](#keyboard-navigation)
    - [Year and month views](#year-and-month-views)
    - [Helpers](#helpers)
    - [Not covered by the suites](#not-covered-by-the-suites)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |
|       2 | 2026-09-23 | Remove the default slot, which the calendar does not render |

## Overview

The `igc-calendar` component lets end-users select a date value in a variety of ways: a single date, several
individual dates, or a range of dates. It renders one of three views - days, months or years - with a header that
shows the current selection and a navigation area for moving through time.

The component is the date surface shared by the pickers of the library: [`igc-date-picker`](../date-picker/spec.md)
and [`igc-date-range-picker`](../date-range-picker/spec.md) render an `igc-calendar` inside their popover.

### Key features

- **Three selection modes**: `single`, `multiple` and `range`.
- **Three views**: days, months and years, switchable from the navigation area or through `activeView`.
- **Multiple months**: render several months side by side or stacked, for range selection across months.
- **Week numbers**, computed according to ISO 8601.
- **Disabled and special dates**, described declaratively through range descriptors.
- **Locale aware**: the week start, the field order of the header date and the order of the navigation buttons all
  follow the locale, and the month and weekday formats are configurable.
- **Active date navigation**: a single tab stop per view with full arrow key navigation, following the WAI-ARIA
  grid pattern.
- **Themeable**: an extensive set of shadow parts covering every cell state.

### Acceptance criteria

- The component must display date information and support single, multiple and range selection.
- Multiple and range selection must work across more than one displayed month.
- The number of displayed months and their orientation must be configurable.
- The component must support showing and hiding week numbers, computed per ISO 8601.
- The component must support disabling dates and marking dates as special, through range descriptors.
- The dates that do not belong to the active month must be hideable, and are always hidden when more than one month
  is displayed.
- The header must be configurable - hidden, horizontally or vertically oriented, with a replaceable title and date.
- The component must provide localization and date formatting capabilities.
- The active date and the selection must be settable programmatically.
- The component must provide full keyboard navigation with a minimal number of tab stops.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant.
- The component must support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- get a usable calendar layout on desktop, tablet and phone environments.
- select and navigate to different dates and months in a touch-only environment.
- select a range of dates, to define a multi-day selection.
- have the dates formatted and displayed according to my locale.
- switch between the days, months and years views to navigate quickly.
- see which dates are disabled, such as past dates, single dates or holidays.
- keep track of the week numbers, shown as the first column of the days view.
- navigate and select entirely from the keyboard.

### Developer stories

As a developer, I expect to be able to:

- implement single, multiple and range date selection.
- provide localization and formatting for the displayed dates.
- disable dates, and mark dates as special, by passing `DateRangeDescriptor` collections.
- change the view date and the selected dates programmatically.
- configure the number of months visible in the days view, so a multi-month selection is one operation.
- specify a vertical or horizontal orientation for the displayed months.
- hide the dates that do not belong to the current month.
- show or hide the week numbers.
- show or hide the header, change its title, and change its orientation.
- specify the first day of the week, or let the locale decide it.
- be notified when the selection changes.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/file/6M8cbmxScEGL2pje8lVQgR/Calendar%2C-Date-Picker%2C-Time-Picker?type=design&node-id=2535-1988&mode=design)

The calendar renders a header with the current selection, a navigation row with the month and year buttons and the
previous and next arrows, and the active view below it. In the days view the dates are laid out in a grid of weeks,
optionally preceded by a week number column. Dates outside the active month are rendered inactive, or hidden.

Selecting a date in `single` mode replaces the selection. In `multiple` mode each activated date is added to or
removed from the selection. In `range` mode the first activated date starts the range, the dates under the pointer
preview the range as it is being drawn, and the second activated date completes it; activating the start again
clears the range.

Disabled dates are rendered as disabled and cannot be selected, but arrow key navigation still passes over them.
The header is shown for the single and multiple modes; with `multiple` selection the header is always hidden.

### Developer experience

#### Basic initialization

```html
<igc-calendar></igc-calendar>
```

#### Selection modes

```html
<igc-calendar selection="single" value="2026-09-21"></igc-calendar>
<igc-calendar selection="multiple" values="2026-09-21,2026-09-23"></igc-calendar>
<igc-calendar selection="range" values="2026-09-21,2026-09-28"></igc-calendar>
```

`value` carries the selection in `single` mode; `values` carries it in `multiple` and `range` mode. Both accept
`Date` objects and ISO strings, and both are converted on assignment.

#### The active date

`activeDate` is the date in view and the one that carries focus. Its initial resolution is:

- an explicitly set `activeDate` always wins, regardless of any value set;
- with no `activeDate` and no value, it defaults to the current date;
- with no `activeDate` but with a value, it is derived from the value - the value itself in `single` mode, the first
  date of the collection in `multiple` mode, and the start of the range in `range` mode.

#### Multiple months

```html
<igc-calendar visible-months="2" orientation="horizontal" selection="range"></igc-calendar>
```

With more than one visible month, the dates outside each rendered month are always hidden, and the navigation moves
the whole set of months.

#### Week numbers

```html
<igc-calendar show-week-numbers></igc-calendar>
```

The first week of the year is determined according to [ISO 8601](https://en.wikipedia.org/wiki/ISO_week_date#First_week).

#### Disabled and special dates

```ts
import { DateRangeType } from 'igniteui-webcomponents';

calendar.disabledDates = [
  { type: DateRangeType.Before, dateRange: [new Date(2026, 8, 1)] },
  { type: DateRangeType.Weekends },
];

calendar.specialDates = [
  { type: DateRangeType.Specific, dateRange: [new Date(2026, 8, 24)] },
];
```

```typescript
enum DateRangeType {
  After = 0,
  Before = 1,
  Between = 2,
  Specific = 3,
  Weekdays = 4,
  Weekends = 5,
}

interface DateRangeDescriptor {
  type: DateRangeType;
  dateRange?: Date[];
}
```

`After` and `Before` use the first date of `dateRange`, `Between` uses the first and the last, `Specific` matches
every listed date, and `Weekdays` and `Weekends` need no dates at all. Descriptors accumulate, and overlapping
ranges are supported.

#### Header and slots

```html
<igc-calendar header-orientation="vertical">
  <span slot="title">Pick a delivery date</span>
</igc-calendar>
```

The `title` slot replaces the header title, and the `header-date` slot replaces the rendered date or range.
`hide-header` removes the header entirely.

#### Formatting

```ts
calendar.formatOptions = { month: 'short', weekday: 'long' };
```

`formatOptions` controls how the months and the weekdays are rendered in the views. It defaults to
`{ month: 'long', weekday: 'narrow' }`.

### Calendar views

The calendar composes three internal view components. They are not part of the public API and are not exported, but
they define the structure and the parts that the calendar re-exports:

| View              | Responsibility                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `igc-days-view`   | Renders the weeks of a month as a grid, with the week numbers, the weekday labels and the date cells. Carries the selection, the disabled and special dates, the range preview and `weekDayFormat`. |
| `igc-months-view` | Renders the twelve months of a year in rows of three, formatted through `monthFormat` and the locale. |
| `igc-years-view`  | Renders a page of years in rows of three; the page size is `yearsPerPage`, which defaults to 15. |

Each view exposes a `focusActiveDate` method and keeps a single tab stop. The days view emits
`igcActiveDateChange` and `igcRangePreviewDateChange`, and the month and year views emit an `igcChange` carrying the
activated date; the calendar consumes these internally and surfaces a single public `igcChange`.

### Localization

The rendered strings and formats resolve through the library i18n mechanism and the `Intl` APIs:

- `locale` selects the locale for the month names, the weekday labels and the header date, and falls back to the
  global locale of the library.
- `resourceStrings` overrides the calendar resource strings, such as the labels of the navigation buttons.
- The first day of the week is derived from the locale when `weekStart` is not set, falling back to Sunday in
  engines without `Intl.Locale.prototype.getWeekInfo()`. An explicit `weekStart` always wins.
- The header date is rendered in the field order of the locale, and the month and year navigation buttons are
  ordered per locale.

### Keyboard interactions

The component follows the active element navigation pattern, which keeps the tab stops to a minimum: the navigation
buttons and the active date. With more than one visible month, the navigation buttons of each view add tab stops.

When the calendar is focused:

| Key combination                        | Result                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| <kbd>Page Up</kbd>                     | Moves to the previous month(s) in view.                                             |
| <kbd>Page Down</kbd>                   | Moves to the next month(s) in view.                                                 |
| <kbd>Shift</kbd> + <kbd>Page Up</kbd>  | Moves to the previous year.                                                         |
| <kbd>Shift</kbd> + <kbd>Page Down</kbd>| Moves to the next year.                                                             |
| <kbd>Home</kbd>                        | Focuses the first day of the month in view, or of the earliest month when several are shown. |
| <kbd>End</kbd>                         | Focuses the last day of the month in view, or of the latest month when several are shown. |

When a date cell is focused:

| Key combination                                                              | Result                                                            |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Right</kbd>                               | Moves to the previous or next day.                                |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Down</kbd>                                  | Moves to the same weekday of the previous or next week.           |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                                          | Selects the focused date.                                         |

Navigating past the first or last rendered day moves into the neighbouring month; with several months in view, the
set shifts by one month and focus stays in the edge view. Disabled dates are passed over rather than skipped, and
navigation stays put when every date in the direction of travel is disabled. Week numbers and weekday labels are
not reachable with the arrow keys.

In the months and years views the arrow keys move by one cell horizontally and by one row vertically,
<kbd>Home</kbd> and <kbd>End</kbd> move to the first and last cell, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> move
by a year or by a page of years, and <kbd>Enter</kbd> or <kbd>Space</kbd> activates the cell.

## API

### Properties and attributes

| Property         | Attribute          | Reflected | Type                                                     | Default                                 | Description                                                                 |
| ---------------- | ------------------ | --------- | -------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| value            | value              | No        | `Date \| null`                                           | -                                       | The current value of the calendar, used when selection is `single`.         |
| values           | values             | No        | `Date[]`                                                 | `[]`                                    | The current values, used when selection is `multiple` or `range`.           |
| activeDate       | active-date        | No        | `Date`                                                   | the current date                        | The date shown in view and highlighted.                                     |
| selection        | selection          | No        | `CalendarSelection`                                      | `single`                                | The type of selection in the component.                                     |
| activeView       | active-view        | No        | `CalendarActiveView`                                     | `days`                                  | The current active view of the component.                                   |
| visibleMonths    | visible-months     | No        | `number`                                                 | 1                                       | The number of months displayed in the days view.                            |
| orientation      | orientation        | No        | `ContentOrientation`                                     | `horizontal`                            | The orientation of the months when more than one is shown.                  |
| headerOrientation| header-orientation | Yes       | `CalendarHeaderOrientation`                              | `horizontal`                            | The orientation of the calendar header.                                     |
| hideHeader       | hide-header        | Yes       | `boolean`                                                | false                                   | Whether to render the calendar header. Always hidden for `multiple`.        |
| hideOutsideDays  | hide-outside-days  | Yes       | `boolean`                                                | false                                   | Whether to hide the dates that do not belong to the active month.           |
| showWeekNumbers  | show-week-numbers  | Yes       | `boolean`                                                | false                                   | Whether to show the week numbers.                                           |
| weekStart        | week-start         | No        | `WeekDays`                                               | from the locale                         | The first day of the week.                                                  |
| formatOptions    | -                  | No        | `Pick<Intl.DateTimeFormatOptions, 'month' \| 'weekday'>` | `{ month: 'long', weekday: 'narrow' }`  | The options used to format the months and the weekdays.                     |
| disabledDates    | -                  | No        | `DateRangeDescriptor[] \| undefined`                     | -                                       | The disabled dates of the component.                                        |
| specialDates     | -                  | No        | `DateRangeDescriptor[] \| undefined`                     | -                                       | The special dates of the component.                                         |
| locale           | locale             | No        | `string`                                                 | the global locale                       | The locale for the resource strings and the date formatting.                |
| resourceStrings  | -                  | No        | `IgcCalendarResourceStrings`                             | EN                                      | The resource strings for localization.                                      |

`value`, `values` and `activeDate` accept `Date` objects and ISO date strings, including through their attributes.

### Methods

None applicable. The component is driven entirely through its properties.

### Events

| Name      | Cancellable | Detail            | Description                            |
| --------- | ----------- | ----------------- | -------------------------------------- |
| igcChange | false       | `Date \| Date[]`  | Emitted when the calendar changes its value. The detail is a single `Date` in `single` selection and a `Date[]` in `multiple` and `range` selection. |

### Slots

| Name          | Description                                                            |
| ------------- | ----------------------------------------------------------------------- |
| `title`       | Renders the title of the calendar header.                              |
| `header-date` | Renders content instead of the current date/range in the calendar header. |

### CSS Shadow parts

| Part                  | Description                                                                 |
| --------------------- | ---------------------------------------------------------------------------- |
| `header`              | The header element of the calendar.                                         |
| `header-title`        | The header title element of the calendar.                                   |
| `header-date`         | The header date element of the calendar.                                    |
| `content`             | The content element which contains the views and navigation elements.       |
| `content-vertical`    | The content element in vertical orientation.                                |
| `navigation`          | The navigation container element of the calendar.                           |
| `months-navigation`   | The months navigation button element of the calendar.                       |
| `years-navigation`    | The years navigation button element of the calendar.                        |
| `years-range`         | The years range element of the calendar.                                    |
| `navigation-buttons`  | The navigation buttons container of the calendar.                           |
| `navigation-button`   | Previous/next navigation button of the calendar.                            |
| `days-view-container` | The days view container element of the calendar.                            |
| `days-view`           | Days view element of the calendar.                                          |
| `months-view`         | The months view element of the calendar.                                    |
| `years-view`          | The years view element of the calendar.                                     |
| `days-row`            | Days row element of the calendar.                                           |
| `months-row`          | Months row element of the calendar.                                         |
| `years-row`           | Years row element of the calendar.                                          |
| `label`               | Week header label element of the calendar.                                  |
| `label-inner`         | Week header label inner element of the calendar.                            |
| `week-number`         | Week number element of the calendar.                                        |
| `week-number-inner`   | Week number inner element of the calendar.                                  |
| `date`                | Date element of the calendar.                                               |
| `date-inner`          | Date inner element of the calendar.                                         |
| `month`               | Month element of the calendar.                                              |
| `month-inner`         | Month inner element of the calendar.                                        |
| `year`                | Year element of the calendar.                                               |
| `year-inner`          | Year inner element of the calendar.                                         |
| `first`               | The first selected date element in range selection. Also applies to the week numbers header cell. |
| `last`                | The last selected date element in range selection. Also applies to the week number of the last rendered week. |
| `inactive`            | Inactive date element of the calendar.                                      |
| `hidden`              | Hidden date element of the calendar.                                        |
| `weekend`             | Weekend date element of the calendar.                                       |
| `range`               | Range selected element of the calendar.                                     |
| `special`             | Special date element of the calendar.                                       |
| `disabled`            | Disabled date element of the calendar.                                      |
| `single`              | Single selected date element of the calendar.                               |
| `preview`             | Range selection preview date element of the calendar.                       |
| `selected`            | Indicates selected state. Applies to date, month and year elements.         |
| `current`             | Indicates current state. Applies to date, month and year elements.          |

## Test scenarios

The calendar is covered by six suites in this directory, all running in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`calendar-rendering.spec.ts`](./calendar-rendering.spec.ts) | DOM, public API and locale-driven rendering. |
| [`calendar.interaction.spec.ts`](./calendar.interaction.spec.ts) | Pointer interaction, selection and disabled dates. |
| [`calendar-keyboard-navigation.spec.ts`](./calendar-keyboard-navigation.spec.ts) | Keyboard navigation in all three views. |
| [`selection.spec.ts`](./selection.spec.ts) | The selection model, independent of the DOM. |
| [`year-month-views.spec.ts`](./year-month-views.spec.ts) | The months and years views on their own. |
| [`helpers.spec.ts`](./helpers.spec.ts) | The date range descriptor helpers. |

The groups below mirror the `describe` blocks of those suites.

### Rendering

1. Passes the a11y audit, including issue #1636 - a week of hidden days.
2. Renders the calendar successfully, compared against a DOM snapshot.
3. Renders the `title` and `header-date` slots.
4. Enables `hideOutsideDays`.
5. Applies the vertical orientation part.
6. Enables and disables `hideHeader`, and changes the header orientation.
7. Displays more than one month.
8. Exposes a single live region for the active period, and a single tab stop with more than one visible month.
9. Renders the correct active view.
10. Renders the header container based on the selection mode.
11. Renders the week numbers, including issue #2035 - correct ISO 8601 week numbering.
12. Renders the weekday labels based on `weekStart`, and aligns the days grid with the initial `week-start` and when
    `weekStart` changes at run time.
13. Reacts to `weekDayFormat` and `monthFormat`.
14. Accepts the active date through an attribute.
15. Resolves the initial active date - an explicit `activeDate` wins for single and range selection; the current
    date is used when nothing is set; otherwise it is derived from the value for single, range and multiple
    selection.
16. Issue #1278.

### Locale

17. Derives the week start from the locale when `week-start` is not set, and prefers an explicit `week-start`.
18. Re-aligns the days grid when the locale changes at run time.
19. Falls back to Sunday in engines without `Intl.Locale.prototype.getWeekInfo()`.
20. Renders the header date in the field order of the locale.
21. Orders the month and year navigation buttons per locale.

### Interactions

22. Is accessible (axe audit).
23. Sets `value` and `values` through attributes and through string property bindings.
24. Clicking the previous and next buttons navigates in the days, months and years views.
25. Single selection, including a date outside the current month, and issue #1443.
26. Multiple selection.
27. Starting and cancelling a range selection, and starting and completing one.
28. Emits `igcActiveDateChange` when the active date is selected, and `igcRangePreviewDateChange` during a range
    preview.
29. Switches to the month of the activated navigation button.
30. Moves focus along when a date outside the rendered month is selected, and keeps it in place otherwise.
31. Disables dates for every `DateRangeType` - Before, After, Between, Specific, Weekdays and Weekends - including
    equal boundaries, an inverted range, overlapping ranges and multiple descriptors.
32. Does not select disabled dates in range selection, and creates no range when the selection is `multiple`.

### Selection model

33. Single - selects a date, does not change when the selected date is activated again, and leaves the dates of the
    other modes alone.
34. Multiple - adds a date keeping the collection sorted, removes an already selected date, and does not mutate the
    input.
35. Range - starts a range from one date, expands it over every covered date, handles a backwards selection, clears
    on re-activating the start, restarts from a completed range, and leaves disabled dates out.
36. Disabled dates are never selected, while the dates around them are.

### Keyboard navigation

37. Focus is retained when switching to the months and to the years view.
38. Days view - is accessible; <kbd>Page Up</kbd>, <kbd>Page Down</kbd> and their <kbd>Shift</kbd> variants move by
    month and by year; the arrow keys move by day and by week; <kbd>Home</kbd> and <kbd>End</kbd> move to the start
    and the end of the month; <kbd>Enter</kbd> and <kbd>Space</kbd> select.
39. Days view - skips disabled dates, stays put when every date in the direction of travel is disabled, and when
    both weekdays and weekends are disabled.
40. Months view - is accessible; <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Page Up</kbd>, <kbd>Page Down</kbd> and the
    arrow keys navigate by month and by row; <kbd>Enter</kbd> and <kbd>Space</kbd> select.
41. Years view - is accessible; <kbd>Home</kbd>, <kbd>End</kbd> and the arrow keys navigate by year and by row;
    <kbd>Page Up</kbd> and <kbd>Page Down</kbd> move by `yearsPerPage`; <kbd>Enter</kbd> and <kbd>Space</kbd> select.

### Year and month views

42. Months view - passes the a11y audit, renders twelve months in rows of three, renders the expected parts and ARIA
    state on a cell, marks the current month, exposes a single tab stop, follows `monthFormat` and `locale`, and
    emits `igcChange` with the activated month.
43. Years view - passes the a11y audit, renders a page of years in rows of three, renders the expected parts and
    ARIA state on a cell, marks the current year, follows `yearsPerPage`, and emits `igcChange` with the activated
    year.

### Helpers

44. The `DateRangeDescriptor` helpers resolve the After, Before, Between, Specific, Weekday and Weekends types.

### Not covered by the suites

There is no dedicated case for `specialDates` rendering, or for the `resourceStrings` override; the locale group
covers the formatting side only.

## Assumptions and limitations

- The calendar is not a form-associated element. Use [`igc-date-picker`](../date-picker/spec.md) or
  [`igc-date-range-picker`](../date-range-picker/spec.md) to participate in a form.
- The component has no time component; it selects dates only.
- With more than one visible month, the dates outside each rendered month are always hidden, regardless of
  `hideOutsideDays`.

## Accessibility

### ARIA roles and properties

- Each view is a grid of cells following the WAI-ARIA grid pattern, with a single tab stop on the active cell.
- The calendar exposes a single live region that announces the active period, so navigating between months, years or
  pages of years is announced once rather than per view.
- Date, month and year cells carry their selected and current state, and disabled cells are announced as disabled.
- The navigation buttons have accessible names resolved from the resource strings.
- Week numbers and weekday labels are presentational and are not reachable with the arrow keys.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The grid direction, the
order of the navigation buttons and the horizontal arrow navigation follow the inline direction.
