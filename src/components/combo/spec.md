# Combo specification

- [Combo specification](#combo-specification)
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
      - [Data binding keys](#data-binding-keys)
      - [Single and multiple selection](#single-and-multiple-selection)
      - [Filtering](#filtering)
      - [Grouping](#grouping)
      - [Templating](#templating)
      - [Validation](#validation)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Form integration](#form-integration)
      - [Remote data](#remote-data)
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
    - [Component](#component)
    - [ARIA](#aria)
    - [Scroll strategy tests](#scroll-strategy-tests)
    - [Theming](#theming)
    - [Form integration tests](#form-integration-tests)
    - [defaultValue](#defaultvalue)
    - [Validation message slots](#validation-message-slots)
    - [Host ARIA](#host-aria)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                                 |
| ------: | ---------- | ------------------------------------------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                                                                 |
|       2 | 2026-09-24 | Describe the naming order and the host ARIA naming                                    |
|       3 | 2026-10-01 | Correct the `igcChange` cancelability; Arrow Down at the end of the list; input reset |
|       4 | 2026-10-02 | Focus after form checks; `invalid` only on checks                                     |
|       5 | 2026-10-02 | Forward the host `aria-describedby`; no `aria-disabled` on the native input           |
|       6 | 2026-10-05 | The list keeps its stylesheet on a theme change                                       |
|       7 | 2026-10-12 | The group header template gets the group `key`; its `item` is deprecated              |
|       8 | 2026-10-21 | API descriptions aligned with the JSDoc.                                              |
|       9 | 2026-10-26 | Setting `singleSelect` or `disableFiltering` again keeps the search text              |
|      10 | 2026-10-26 | The inner `igcChange`, `igcStateChange` and `igcDataRequest` events stay inside       |
|      11 | 2026-10-26 | Tab moves through the focusable content of the header, empty and footer slots         |
|      12 | 2026-10-26 | `igcClosing` and `igcClosed` report the `trigger` that closes the list                |
|      13 | 2026-10-26 | Remote data: `igcSearchInput`, `filteringOptions.mode`, `igcDataRequest`; a new `data` keeps the selection |
|      14 | 2026-10-27 | `selectAllItems()` and `deselectAllItems()` act on the items that the list shows      |

## Overview

The `igc-combo` provides a list of options from which the end-user makes a selection. In contrast to
[`igc-select`](../select/spec.md), it renders its options in a virtualized list, so it can show thousands of options
at once, and it supports selecting more than one of them.

The component binds to an array of objects rather than to projected items, filters the options as the end-user
types, groups them by a key, and lets the application template both the items and the group headers. It is a
form-associated custom element with `required` and custom validation.

### Key features

- **Complex data binding**: an array of objects with a value key, a display key and a group key.
- **Virtualized list**: thousands of options render without a performance cost.
- **Single and multiple selection**, with checkboxes and a selection summary in the input.
- **Filtering**: case sensitivity and diacritics matching are configurable, and filtering can be disabled.
- **Grouping** by a key, with configurable sort direction and a locale aware comparison.
- **Templating** of each item and each group header.
- **Localization** of the built-in strings through the library resource strings.
- **Form association and validation**, with declarative validation message slots.

### Acceptance criteria

- The component must bind to an array of objects and render its options from configurable keys.
- It must support selecting one or many options, and expose both the raw values and the selected records.
- It must filter the list as the end-user types, with configurable case sensitivity and diacritics matching.
- It must group the options by a key, with a configurable sort direction.
- It must render its options virtualized, so large data sources stay responsive.
- It must let the application template the items and the group headers.
- It must participate in form submission, reset and validation, and render the validation message slots.
- It must provide full keyboard support for opening, filtering, navigating and selecting.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- open a list of options and see them grouped where that applies.
- type to narrow the list down to the options I am looking for.
- select one or several options, and see what I have selected in the field.
- clear my selection with a single action.
- move through the options with the arrow keys and with <kbd>Home</kbd> and <kbd>End</kbd>.
- select and deselect the active option with <kbd>Space</kbd>.
- close the list with <kbd>Escape</kbd> without losing my selection.
- be told when the field is required and left empty.

### Developer stories

As a developer, I expect to be able to:

- bind the component to an array of objects and pick the value, display and group keys.
- switch between single and multiple selection.
- configure or disable the filtering, including case sensitivity and diacritics.
- sort the groups ascending or descending.
- template the items and the group headers.
- select and deselect options programmatically, by reference or by value key.
- read the selection both as values and as the original records.
- localize the built-in strings of the component.
- mark the control as required and provide my own validation messages.
- be notified when the selection changes, and on each open and close transition.

## Functionality

### End-user experience

[Design hand-off](https://www.figma.com/file/kJxlQPb78W2C4S2g0gDjbs/Combo-Design-Handoff?node-id=97%3A2157&t=yuCAZ9GzeuDDtmdS-1)

[End-to-end user experience prototype](https://www.figma.com/proto/kJxlQPb78W2C4S2g0gDjbs/Combo-Design-Handoff?node-id=1%3A3209&scaling=min-zoom&page-id=0%3A1&starting-point-node-id=1%3A3209&show-proto-sidebar=1)

The anchor renders like an input with the current selection, a clear icon and a toggle icon. Opening the list shows
the options, each with a checkbox in multiple selection mode, grouped under their headers. A search input filters
the list; in single selection mode the filtering happens in the main input instead. An empty result renders the
empty message.

### Developer experience

#### Basic initialization

```html
<igc-combo label="City" name="city"></igc-combo>
```

```typescript
const combo = document.querySelector('igc-combo')!;

combo.data = [
  { id: 'sof', name: 'Sofia', country: 'Bulgaria' },
  { id: 'plv', name: 'Plovdiv', country: 'Bulgaria' },
  { id: 'nyc', name: 'New York', country: 'United States' },
];
combo.valueKey = 'id';
combo.displayKey = 'name';
combo.groupKey = 'country';
```

#### Data binding keys

| Key          | Purpose                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| `valueKey`   | The key used when selecting items and when reporting `value`.                    |
| `displayKey` | The key rendered in the list and in the input.                                   |
| `groupKey`   | The key the options are grouped by.                                              |

Without a `valueKey`, the selection is reported as the records themselves.

#### Single and multiple selection

```html
<igc-combo single-select></igc-combo>
```

Multiple selection is the default: items carry checkboxes and the input summarizes the selection. `single-select`
switches to one selection and moves the filtering into the main input.

```typescript
combo.select(['sof', 'plv']);  // by value key
combo.select();                // everything
combo.deselect(['sof']);
combo.deselect();              // everything

combo.value;      // ComboValue<T>[] - the values
combo.selection;  // T[] - the records from the data source
```

#### Filtering

```typescript
combo.filteringOptions = {
  filterKey: 'name',
  caseSensitive: false,
  matchDiacritics: false,
};
```

```html
<igc-combo case-sensitive-icon></igc-combo>
<igc-combo disable-filtering></igc-combo>
```

`caseSensitiveIcon` renders a toggle in the filtering input, and `disableFiltering` removes the filtering entirely.

Setting `singleSelect` or `disableFiltering` to its current value keeps the search text, so a framework that sets
each property on each render does not clear it.

#### Grouping

When a group key is set, the options are grouped by it. Items whose group key resolves to `null` or `undefined` are
aggregated into an `Other` group. `groupSorting` controls the direction - `asc` by default, `desc`, or `none` - and
the comparison uses the collation of `locale`, also after a change of the global locale.

#### Templating

```typescript
combo.itemTemplate = ({ item }) => html`<b>${item.name}</b> - ${item.country}`;
combo.groupHeaderTemplate = (group) => html`<i>${group.key}</i>`;
```

#### Validation

```html
<igc-combo label="City" required>
  <span slot="value-missing">Please pick a city</span>
</igc-combo>
```

See the [validation container specification](../validation-container/spec.md) for the message slot mechanism.

#### Labeling from the light DOM

Besides the `label` property, the control can be labelled by a `label` element in the light DOM, through `for` or by
nesting it. An IDREF does not cross a shadow boundary, so the combo resolves its labels through `ElementInternals`
and projects them - together with its `role`, `aria-haspopup`, `aria-expanded`, `aria-controls` and
`aria-activedescendant` - onto the native input of its anchor, as element references.

The name follows the [naming order](../input/spec.md#naming-order), so the host `aria-labelledby` and `aria-label` also
name the control. The selection status text names the input only while no `label` element, `label` property or host ARIA
names it.

#### Form integration

```html
<form>
  <igc-combo name="city" required></igc-combo>
  <button type="submit">Submit</button>
</form>
```

- The selection is submitted under `name`.
- A form reset restores `defaultValue` and clears the invalid styles of the control and its input.
- An invalid control blocks submission.

As for a native control, a failed submit or `form.reportValidity()` moves the focus to the first invalid control of
the form, and `reportValidity()` moves it to the control when it is invalid. `form.checkValidity()` and
`checkValidity()` do not move the focus. The `invalid` event comes only from these checks and from a failed submit,
not while the user edits the control.

#### Remote data

A combo can show a large remote data source one page at a time. With `filteringOptions.mode` set to `remote`, the
combo does not filter the options. It keeps the search input and reports the text, and the application sets `data` to
the results of the server:

```typescript
combo.filteringOptions = { mode: 'remote' };

combo.addEventListener('igcOpening', () => {
  if (!combo.data.length) load(searchText, 0);
});

combo.addEventListener('igcSearchInput', ({ detail }) => {
  searchText = detail.searchText;
  load(searchText, 0); // replaces `data` with the first page; debounce it
});

combo.addEventListener('igcDataRequest', ({ detail }) => {
  load(searchText, detail.startIndex, detail.count); // appends to `data`
});
```

- `igcSearchInput` comes on each change of the text of the search input, and of the main input in single selection,
  also when the user clears the text. It also comes, with an empty text, when a user action clears the text: a
  selection in single selection mode, a blur with nothing selected, or the clear button. It does not come when a
  property change clears the text (`singleSelect`, `disableFiltering`), or with `disableFiltering`. It comes in both
  modes.
- In remote mode, `igcDataRequest` comes when the open list renders one of the last five options of `data`. Its
  `startIndex` is `data.length`, also with grouping, and `count` is the number of items to append. It does not come
  again until the length of `data` changes, a new `data` replaces the first record, a new search text comes, or the
  list opens again, so a source with no more items gets one request per opening. An empty `data` gets no request: the first page of a search is the job
  of the application. An answer is stale when `data.length` no longer equals its `startIndex`, for example after a
  new search.
- A new `data` keeps the selection. A selected item that the new data does not hold stays in `value`, in `selection`
  and in the text of the input, and a later page or search that holds it again shows it checked. `select()` selects an
  object that `data` does not hold as it is, so the application can select the records of a saved filter before
  their page loads. With `valueKey`, an object resolves by its key first. Without an argument, `select()` selects all
  the items of `data` and keeps the other selected items.
- In remote mode, the search input has no case-sensitive icon, and in single selection the input activates no option
  of the old results, so Enter does not select an option that the server did not return for the text.

`bindComboDataSource()` from `igniteui-webcomponents/extras` implements this flow on the public API. See the
`RemoteData` story.

### Localization

The component renders several built-in strings, resolved through the library i18n mechanism and overridable per
instance through `locale` and `resourceStrings`:

| Resource string                     | Default (`en`)          | Usage                                       |
| ----------------------------------- | ----------------------- | ------------------------------------------- |
| `combo_empty_message`               | The list is empty       | Shown when the list has no items.           |
| `combo_filter_search_placeholder`   | Enter a Search Term     | The placeholder of the search input.        |
| `combo_clearItems_placeholder`      | Clear Selection         | The label of the clear action.              |
| `combo_aria_label_options`          | Selected options        | The accessible name of the selection.       |
| `combo_aria_label_no_options`       | No options selected     | The accessible name of an empty selection.  |

### Keyboard interactions

The component must be focused for any of the following to apply.

While the list of options is **not** visible:

| Key combination                             | Result                                              |
| ------------------------------------------- | ---------------------------------------------------- |
| <kbd>Arrow Down</kbd> / <kbd>Alt</kbd> + <kbd>Arrow Down</kbd> | Opens the list of options.        |
| Any character key                           | Opens the list and starts filtering.                |
| <kbd>Escape</kbd>                           | Clears the value. The combo stays focused.          |

While the list of options **is** visible:

| Key combination                             | Result                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| <kbd>Arrow Down</kbd>                       | Activates the next option; at the last option it does nothing.                |
| <kbd>Arrow Up</kbd>                         | Activates the previous option; from the first option it returns to the input. |
| <kbd>Space</kbd>                            | Selects or deselects the active option.                                       |
| <kbd>Enter</kbd>                            | Selects the active option in single selection mode, and closes the list in all modes. |
| <kbd>Home</kbd> / <kbd>End</kbd>            | Activates the first or the last option.                                       |
| <kbd>Escape</kbd>                           | Closes the list. The combo stays focused.                                     |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves through the search input (the main input in single selection), the header content, the list, the empty content and the footer content. Past either end, or without focusable slot content, closes the list and moves the focus on. |

Typing while the component is focused filters the list down to the closest matches.

## API

### Properties and attributes

| Property               | Attribute                  | Reflected | Type                                | Default           | Description                                                     |
| ---------------------- | -------------------------- | --------- | ----------------------------------- | ----------------- | ---------------------------------------------------------------- |
| data                   | -                          | No        | `T[]`                               | `[]`              | The data source used to generate the list of options. A new data source keeps the selection, also the selected items that it does not hold. |
| value                  | value                      | No        | `ComboValue<T>[]`                   | `[]`              | The values of the selected items. With a `valueKey`, each value is that field of an item. Without it, each value is the item itself. |
| selection              | -                          | No        | `T[]`                               | `[]`              | Read-only. The current selection as records of the data source. |
| valueKey               | value-key                  | No        | `Keys<T> \| undefined`              | -                 | The key in the data source used when selecting items.           |
| displayKey             | display-key                | No        | `Keys<T> \| undefined`              | -                 | The key in the data source used to display items in the list. Falls back to `valueKey`. |
| groupKey               | group-key                  | No        | `Keys<T> \| string \| undefined`    | -                 | The key in the data source used to group items in the list.     |
| groupSorting           | group-sorting              | No        | `'asc' \| 'desc' \| 'none'`         | `asc`             | The sort order of the groups, by their group value. With `none`, the groups keep the order of the data source. |
| singleSelect           | single-select              | Yes       | `boolean`                           | false             | Whether only one item can be selected. In this mode, the main input filters the list of options. |
| filteringOptions       | filtering-options          | No        | `FilteringOptions<T>`               | -                 | Configures the filtering of the combo.                          |
| disableFiltering       | disable-filtering          | No        | `boolean`                           | false             | Whether the filtering of the list of options is disabled. In multiple selection mode, it also hides the search input. |
| caseSensitiveIcon      | case-sensitive-icon        | No        | `boolean`                           | false             | Whether the search input shows the icon that toggles case-sensitive filtering. |
| disableClear           | disable-clear              | No        | `boolean`                           | false             | Whether the clear button is hidden.                             |
| itemTemplate           | -                          | No        | `ComboItemTemplate<T>`              | -                 | The template for the content of each combo item.                |
| groupHeaderTemplate    | -                          | No        | `ComboGroupHeaderTemplate<T>`       | -                 | The template for the content of each group header.              |
| open                   | open                       | Yes       | `boolean`                           | false             | Whether the component is open.                                |
| label                  | label                      | No        | `string \| undefined`               | -                 | The label of the control.                                       |
| placeholder            | placeholder                | No        | `string \| undefined`               | -                 | The placeholder text of the control.                            |
| placeholderSearch      | placeholder-search         | No        | `string`                            | from the resources | The placeholder text of the search input.                      |
| outlined               | outlined                   | Yes       | `boolean`                           | false             | Whether the control has an outlined appearance.                 |
| autofocus              | autofocus                  | No        | `boolean`                           | false             | Whether the control takes the focus automatically.              |
| autofocusList          | autofocus-list             | No        | `boolean`                           | false             | Whether the list of options, not the search input, takes the focus when the list opens. It has no effect in single selection mode. |
| scrollStrategy         | scroll-strategy            | No        | `PopoverScrollStrategy`             | `hide`            | The behavior of the component when a parent container scrolls.  |
| required               | required                   | Yes       | `boolean`                           | false             | Whether the control is required. A required control that has no value, or is not checked, fails validation.            |
| disabled               | disabled                   | Yes       | `boolean`                           | false             | Whether the control is disabled. A disabled control is not validated, and the form does not submit its value.                            |
| invalid                | invalid                    | No        | `boolean`                           | false             | Whether the control shows the invalid state. It changes only the visual state, not the validity.        |
| name                   | name                       | Yes       | `string`                            | -                 | The name of the control, submitted with the form data.          |
| locale                 | locale                     | No        | `string`                            | the inherited or global locale | The locale of the resource strings and of the group sort order. |
| resourceStrings        | -                          | No        | `IComboResourceStrings`             | EN                | The texts of the component. The strings that you set replace the strings of the current locale. Reading returns all the strings, with your strings over the locale strings.                          |
| defaultValue           | -                          | No        | `ComboValue<T>[]`                   | -                 | The default value of the control. A form reset restores the value to it. While the value is unchanged since the start or the last form reset, a new default also sets the value. The `value` attribute also sets it.     |
| form                   | -                          | No        | `HTMLFormElement \| null`           | -                 | Read-only. The form that the control is associated with, or `null`.               |
| validity               | -                          | No        | `ValidityState`                     | -                 | Read-only. The validity state of the control.                   |
| validationMessage      | -                          | No        | `string`                            | -                 | Read-only. The validation message of the control. It is empty when the control is valid.               |
| willValidate           | -                          | No        | `boolean`                           | -                 | Read-only. Whether the element is a candidate for validation.   |

```typescript
interface FilteringOptions<T extends object> {
  /** The key in the data source used when filtering the list of options. */
  filterKey: Keys<T> | undefined;
  /** Determines whether the filtering operation should be case sensitive. */
  caseSensitive?: boolean;
  /** When true, the filter distinguishes between accented letters and their base letters. */
  matchDiacritics?: boolean;
  /**
   * Where the filtering runs. With `remote`, the combo does not filter the
   * options: the application sets `data` on `igcSearchInput`, and appends to
   * it on `igcDataRequest`. Default is `local`.
   */
  mode?: 'local' | 'remote';
}

type ComboItemTemplate<T extends object> = (props: { item: T }) => TemplateResult;

type ComboGroupHeaderTemplate<T extends object> = (props: {
  /** The value that the items of the group share in the `groupKey` field, or `Other`. */
  key: unknown;
  /**
   * A record made for the header, not a data item.
   * @deprecated since 7.5.0. Use the `key` property instead.
   */
  item: T;
}) => TemplateResult;
```

### Methods

| Name              | Type signature                         | Description                                                                      |
| ----------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| show              | `(): Promise<boolean>`                 | Opens the component. It does not emit events. The promise resolves to `false` when the component is already open, or when a later call replaces this one.                                                             |
| hide              | `(): Promise<boolean>`                 | Closes the component. It does not emit events. The promise resolves to `false` when the component is already closed, or when a later call replaces this one.                                                             |
| toggle            | `(): Promise<boolean>`                 | Opens the component when it is closed, and closes it when it is open. It does not emit events. The promise resolves to `true` when the state changes.                                         |
| select            | `(items?: Item<T> \| Item<T>[]): void` | Selects options in the list by reference or by `valueKey` value. It does not emit `igcChange`. An object that `data` does not hold is selected as it is. Without an argument, it selects all the items of `data`, or clears the selection in single selection mode. |
| deselect          | `(items?: Item<T> \| Item<T>[]): void` | Deselects options in the list by reference or by `valueKey` value. It does not emit `igcChange`. Without an argument, it deselects all items. |
| selectAllItems    | `(ignoreFilter?: boolean): void`       | Selects all the items that the list shows. It does not emit `igcChange`, and does nothing in single selection mode. With `ignoreFilter`, it selects all the items of `data`. |
| deselectAllItems  | `(ignoreFilter?: boolean): void`       | Deselects all the items that the list shows. It does not emit `igcChange`. With `ignoreFilter`, it deselects all the items. |
| focus             | `(options?: FocusOptions): void`       | Sets focus on the component.                                                     |
| blur              | `(): void`                             | Removes focus from the component.                                                |
| checkValidity     | `(): boolean`                          | Checks validity and emits `invalid` when the control is invalid. Returns `true` when the control is valid.                 |
| reportValidity    | `(): boolean`                          | Checks validity. As for a native control, an invalid control emits `invalid` and takes the focus. It shows its own validation messages, not the message of the browser. Returns `true` when the control is valid.          |
| setCustomValidity | `(message: string): void`              | Sets a custom validation message. The control is invalid while the message is not empty. An empty string removes the custom error.                     |

### Events

| Name       | Cancellable | Description                                       |
| ---------- | ----------- | ------------------------------------------------- |
| igcChange  | true        | Emitted before the user changes the selection. Cancel the event to keep the selection. |
| igcOpening | true        | Emitted before the user opens the list of options. Cancelable. |
| igcOpened  | false       | Emitted after the list of options opens on a user action. |
| igcClosing | true        | Emitted before the user closes the list of options. Cancelable. The `trigger` of the detail is the user action that closes the list. |
| igcClosed  | false       | Emitted after the list of options closes on a user action. The `trigger` of the detail is the user action that closes the list. |
| igcSearchInput | false   | Emitted when the user changes the text of the search input, or of the main input in single selection mode, and when a selection, a blur or the clear button clears the text. |
| igcDataRequest | false   | Emitted in remote filtering mode when the user scrolls near the end of the options. Append the requested items to `data`. It is not emitted again until the length of `data` or the search text changes. |

```typescript
interface IgcComboChangeEventArgs<T> {
  newValue: ComboValue<T>[];
  items: T[];
  type: 'selection' | 'deselection' | 'addition';
}

interface IgcComboClosingEventArgs {
  trigger: ComboCloseTrigger;
}

interface IgcComboSearchInputEventArgs {
  searchText: string;
}

interface VirtualScrollDataRequest {
  startIndex: number; // `data.length`
  count: number;
}

type ComboCloseTrigger =
  | 'enter' // Enter in the list or the main input
  | 'escape' // Escape
  | 'tab' // Tab or Shift+Tab out of the combo
  | 'arrow-up' // Arrow Up in an input, or at the first item without the search input
  | 'outside-click' // a click outside the combo
  | 'scroll' // a scroll of a container with the `close` scroll strategy
  | 'toggle' // a click on the input
  | 'selection'; // an item click in single selection
```

The open events keep an empty `detail`. `hide()`, `toggle()` and a change of `open` emit no events. An app that
stages a selection in its own footer can save `value` on `igcOpening`, commit on its Apply button or on the `enter`
trigger, and put the saved value back on the other triggers of `igcClosed`.

### Slots

| Name            | Description                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| `prefix`        | Renders content before the input of the combo.                                   |
| `suffix`        | Renders content after the input of the combo.                                    |
| `header`        | Renders a container before the list of options.                                  |
| `footer`        | Renders a container after the list of options.                                   |
| `empty`         | Renders content when the list has no items or data.                              |
| `helper-text`   | Renders content below the input.                                                 |
| `toggle-icon`   | Renders content that replaces the default toggle icon.                           |
| `clear-icon`    | Renders content that replaces the default clear icon.                            |
| `value-missing` | Renders content when the required validation fails.                              |
| `custom-error`  | Renders content when setCustomValidity(message) is set.                          |
| `invalid`       | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

| Part                 | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `label`              | The encapsulated text label of the combo.                      |
| `input`              | The main input field of the combo.                             |
| `native-input`       | The native input of the main input field.                      |
| `prefix` / `suffix`  | The prefix and suffix wrappers.                                |
| `toggle-icon`        | The toggle icon wrapper.                                       |
| `filled`             | Added to the toggle-icon part when the combo has a value.      |
| `clear-icon`         | The clear icon wrapper.                                        |
| `case-icon`          | The case icon wrapper.                                         |
| `helper-text`        | The helper text wrapper.                                       |
| `filter-input`       | The wrapper of the search input.                               |
| `search-input`       | The search input field.                                        |
| `list-wrapper`       | The list of options wrapper.                                   |
| `list`               | The list of options box.                                       |
| `item`               | Each item in the list of options.                              |
| `group-header`       | Each group header in the list of options.                      |
| `active`             | Added to the item part when the item is active, and to the case-icon part while case-sensitive filtering is on. |
| `selected`           | Added to the item part when the item is selected.              |
| `checkbox`           | The checkbox of each item in the list.                         |
| `checkbox-indicator` | The checkbox indicator of each item in the list.               |
| `checked`            | Added to the checkbox and checkbox-indicator parts when the checkbox is checked. |
| `header` / `footer`  | The containers holding the header and footer content.          |
| `empty`              | The container holding the empty content.                       |

### CSS custom states

| State        | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `ig-invalid` | Set while the control shows its invalid state, that is while `invalid` returns `true`. |

### CSS custom properties

| Property                | Description                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ig-helper-min-lines` | The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`. |

## Test scenarios

The suite lives in [`combo.spec.ts`](./combo.spec.ts) and runs in a real browser through `@web/test-runner` with
`@open-wc/testing` fixtures and assertions. It reuses `createFormAssociatedTestBed`,
`runValidationContainerTests`, `runExternalLabelAssociationTests`, `runAriaProjectionTests` and the `simulate*`
helpers from [`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### Component

1. Rendering, the default state and the accessibility audit.
2. Data binding through `data`, `valueKey`, `displayKey` and `groupKey`, also when the `data` array changes in place.
3. Single and multiple selection, including `select` and `deselect` with and without arguments.
4. `value` and `selection` report the values and the records.
5. Filtering, including case sensitivity, diacritics matching and `disableFiltering`. Setting `singleSelect` or
   `disableFiltering` again to its value keeps the search text and the filter.
6. Grouping, the `Other` group for unresolved keys, and the sort directions.
7. Item and group header templating. The group header template gets the group `key` with its own type, also for
   number keys and the `Other` group, and a template that reads the deprecated `item` still renders.
8. The empty message and the `empty` slot.
9. Localization through `locale` and `resourceStrings`.
10. Opening, closing and the keyboard navigation of the list, including Arrow Down at the end of the matches.
11. The clear action and `disableClear`.
12. `igcChange` carries the new value, the items and the change type, and a cancel keeps the selection.
13. The `igcChange` of the search input and the `igcStateChange` and `igcDataRequest` events of the list do not
    leave the combo.

### ARIA

14. The anchor, the list, the items and the group headers expose their roles and states, and the selection summary
    is announced.

### Scroll strategy tests

15. `hide`, `scroll` and `close` behave as specified while an ancestor scrolls.

### Theming

16. The list keeps its stylesheet in the shadow root when the theme changes.

### Form integration tests

17. Is form associated, submits its selection, and is reset with the form, including the single-selection input.
18. Reflects the disabled state of an ancestor `fieldset`.
19. Fulfils the required and custom constraints.

The focus after the form checks and the `invalid` event rules come from the form-associated mixin. The
[input suite](../input/spec.md#form-validity-checks) covers them.

### defaultValue

20. Form integration in single selection mode, in multiple selection mode, and with data that arrives late.
21. Validation against the default value.

### Validation message slots

Generated by `runValidationContainerTests`.

22. The `value-missing`, `custom-error` and `invalid` slots render for their matching state.

### Host ARIA

23. The shared host description suite: the host `aria-describedby` describes the native control after the helper
    text, and follows a change and a removal.

### Header and footer slots

24. Tab moves from the search input to the header content, the list and the footer content, and Shift+Tab moves
    back. With an empty list, Tab reaches the content of the `empty` slot. The accessibility audit passes with
    focusable slot content.
25. Tab from the last footer control and Shift+Tab from the search input close the list and move the focus out of
    the combo. In single selection, the main input starts the order, and Tab selects the active item when it leaves.
26. Without focusable slot content, Tab from the search input closes the list and moves the focus on.
27. Tab moves out of a stop inside another stop, does not stop on a host that delegates the focus or on a control
    with `visibility: hidden`, and leaves a Tab that a slotted control handles to that control.

### Close trigger

28. `igcClosing` and `igcClosed` report the same `trigger` once for Enter in the list and in the main input, Escape,
    Tab and Shift+Tab, Arrow Up in each input and at the first item, a click outside, a click on the input, an item
    click in single selection, and a scroll with the `close` strategy. A second close while one is in progress does
    not change the trigger, and a close after a canceled one reports its own trigger.
29. The open events keep an empty `detail`, and `hide()` emits no events.

### Remote data

30. The mode comes from the `filtering-options` attribute. In remote mode, the search input and the main input do not
    filter the options; switching back to `local` filters them.
31. `igcSearchInput` reports each change of the search text, in both modes, and of the main input in single selection,
    also when it is cleared, and an empty text when a selection or a blur clears it; a blur also clears the search
    input. It does not come on a property change or with `disableFiltering`. The `igcInput` of the inputs does not
    leave the combo. In remote mode, the case-sensitive icon hides and an input in single selection activates no
    option.
32. The repro of issue 2519: a search that replaces `data` keeps the selected items in `value`, `selection` and the
    input text, a later selection adds to them, and the first page shows them checked again with its own records.
33. `deselect()` removes a selected item that `data` does not hold; `select()` selects an object that `data` does not
    hold, with and without `valueKey`; `select()` without an argument keeps the other selected items, and selects
    each value one time also before a new `data` syncs.
34. `igcDataRequest` comes near the end of `data` with `startIndex` equal to `data.length`, also with grouping. It
    does not repeat until `data` grows, and a new search, or a new `data` without a search, with a page of the same
    length gets its own request, and so does a new opening. It does not come in local mode, while the list is
    closed, or with an empty `data`.

### Select all methods

35. `selectAllItems()` and `deselectAllItems()` change only the items that the filtered list shows, also right after
    a change of `data` or of the search text, emit no `igcChange`, and change nothing when the list shows no items. With `ignoreFilter`, they act on all the items. In
    single selection, `selectAllItems()` does nothing and `deselectAllItems()` deselects a shown item.

## Assumptions and limitations

- The options come from the `data` array; projected item elements are not supported.
- Adding custom values from the input is not exposed as a public property, although the change event type allows for
  an `addition` kind.
- The list is virtualized, so an option that is not rendered has no DOM node; work with the data records rather than
  with the item elements.
- Without a `valueKey`, the selection is reported as whole records rather than as primitive values.

## Accessibility

### ARIA roles and properties

- The anchor exposes a `combobox` role with `aria-haspopup`, the expanded state, the relation to the list and the
  active descendant, all projected onto its native input as element references.
- The list has a `listbox` role, the items an `option` role with their selected state, and the group headers a
  `group` role.
- The current selection is announced through a label resolved from the resource strings, which also covers the empty
  case.
- The helper text and the validation messages are referenced through `aria-describedby`.
- An external light DOM `label` is projected onto the native input of the anchor as an element reference.
- A host `aria-describedby` describes the native control after the helper text, by element reference.
- The native input has no `aria-disabled`. Its native `disabled` state is enough.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
