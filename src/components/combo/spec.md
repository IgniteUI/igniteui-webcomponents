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
      - [Select all](#select-all)
      - [Filtering](#filtering)
      - [Grouping](#grouping)
      - [Confirm mode](#confirm-mode)
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
    - [Header and footer slots](#header-and-footer-slots)
    - [Close trigger](#close-trigger)
    - [Scroll strategy tests](#scroll-strategy-tests)
    - [Theming](#theming)
    - [ARIA](#aria)
    - [Host ARIA](#host-aria)
    - [Remote data](#remote-data-1)
    - [Placeholders and loading](#placeholders-and-loading)
    - [Select all methods](#select-all-methods)
    - [Select-all option](#select-all-option)
    - [Group selection](#group-selection)
    - [Confirm mode](#confirm-mode-1)
    - [Form integration tests](#form-integration-tests)
    - [defaultValue](#defaultvalue)
    - [Validation message slots](#validation-message-slots)
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
|      10 | 2026-10-26 | The inner events stay inside; Tab moves through the slot content; `igcClosing` and `igcClosed` report the close `trigger` |
|      11 | 2026-10-27 | Remote data: `filteringOptions.mode`, `igcSearchInput`, `igcDataRequest`, `totalItemCount` placeholders and `loading`; a new `data` keeps the selection |
|      12 | 2026-10-27 | Select all (`selectAllItems()`, `deselectAllItems()`, `showSelectAll`) and group selection (`groupSelection`); these options count in `aria-posinset` and `aria-setsize`, and the group headers have no `group` role |
|      13 | 2026-10-27 | Confirm mode (`selectionCommit`): a pending selection, `igcPendingChange`, the `commit` change type, and Cancel and Apply |
|      14 | 2026-10-27 | The focus moves to the main input when the list closes around it; `igcChange.newValue` has the order of `value` |
|      15 | 2026-10-28 | Text in STE; `aria-activedescendant` is on the listbox; the character keys filter only in single selection; the test scenarios follow the spec files |

## Overview

The `igc-combo` shows a list of options. The user selects one or more of them. Unlike
[`igc-select`](../select/spec.md), the combo shows its options in a virtualized list, so the list can hold thousands
of options.

The combo binds to an array of objects, not to child elements. It filters the options while the user types, and groups
them by a key. The application can set templates for the items and the group headers. It is a form-associated custom
element with `required` and custom validation.

### Key features

- **Data binding**: an array of objects, with a value key, a display key and a group key.
- **Virtualized list**: thousands of options without a performance cost.
- **Single and multiple selection**: checkboxes in the list, and a summary of the selection in the input.
- **Select all and group selection**: one option selects all the items that the list shows, or the items of a group.
- **Confirm mode**: the user changes a pending selection, and applies it with one change event.
- **Filtering**: configurable case sensitivity and diacritics matching. The application can disable the filtering, or
  filter on its server.
- **Remote data**: page requests, placeholders for the items to load, and a loading state.
- **Grouping** by a key, with a sort direction and a locale-aware comparison.
- **Templates** for the items and the group headers.
- **Localization** of the built-in strings.
- **Form association and validation**, with validation message slots.

### Acceptance criteria

- The combo must bind to an array of objects and show its options from configurable keys.
- It must let the user select one or more options, and give the selected values and the selected records.
- It must filter the list while the user types, with configurable case sensitivity and diacritics matching.
- It must group the options by a key, with a configurable sort direction.
- It must virtualize the list, so a large data source stays responsive.
- It must let the application load the options from a server, one page at a time.
- It must let the application hold the changes of the user until the user applies them.
- It must let the application set templates for the items and the group headers.
- It must take part in form submission, reset and validation, and show the validation message slots.
- It must give full keyboard support to open the list, filter, move through the options and select.
- It must use the theming mechanism of the library.
- It must obey WAI-ARIA and support RTL layouts without more configuration.

## User stories

### End-user stories

As an end user, I want to:

- open the list of options and see the options in their groups.
- type to make the list shorter.
- select one or more options, and see my selection in the field.
- clear my selection with one action.
- move through the options with the arrow keys, <kbd>Home</kbd> and <kbd>End</kbd>.
- select and deselect the active option with <kbd>Space</kbd>.
- select all the options that the list shows, or all the options of a group, with one action.
- confirm a set of changes with <kbd>Enter</kbd> or Apply, or drop them with <kbd>Escape</kbd> or Cancel.
- scroll through a long remote list and see which options still load.
- close the list with <kbd>Escape</kbd> and keep my selection.
- know when the field is required and empty.

### Developer stories

As a developer, I want to:

- bind the combo to an array of objects and select the value, display and group keys.
- switch between single and multiple selection.
- configure or disable the filtering, with case sensitivity and diacritics.
- sort the groups in ascending or descending order, or keep the order of the data.
- set templates for the items and the group headers.
- select and deselect options from code, by record or by value.
- read the selection as values and as the records of the data source.
- load the options from a server one page at a time, and keep the selection across the pages and the searches.
- localize the built-in strings.
- make the control required and give my own validation messages.
- get an event when the selection changes, and on each open and close, with the user action that closes the list.
- hold the changes of the user while the list is open, and apply them with one change event.

## Functionality

### End-user experience

[Design hand-off](https://www.figma.com/file/kJxlQPb78W2C4S2g0gDjbs/Combo-Design-Handoff?node-id=97%3A2157&t=yuCAZ9GzeuDDtmdS-1)

[End-to-end user experience prototype](https://www.figma.com/proto/kJxlQPb78W2C4S2g0gDjbs/Combo-Design-Handoff?node-id=1%3A3209&scaling=min-zoom&page-id=0%3A1&starting-point-node-id=1%3A3209&show-proto-sidebar=1)

The anchor looks like an input. It shows the selection, a clear icon and a toggle icon. The open list shows the
options under their group headers. In multiple selection, each option has a checkbox, and a search input above the
list filters the options. In single selection, the main input filters the options. When no option matches, the list
shows the empty message.

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

| Key          | Purpose                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| `valueKey`   | The field of a record that `value` and the selection methods use.                  |
| `displayKey` | The field of a record that the list and the input show. Without it, `valueKey`.    |
| `groupKey`   | The field of a record that groups the options.                                     |

Without a `valueKey`, `value` contains the records.

#### Single and multiple selection

```html
<igc-combo single-select></igc-combo>
```

Multiple selection is the default. The items have checkboxes, and the input shows the text of all the selected items.
`single-select` permits one selection, and the main input filters the options.

```typescript
combo.select(['sof', 'plv']); // by value
combo.select(); // all the items of `data`
combo.deselect(['sof']);
combo.deselect(); // all the selected items

combo.value; // ComboValue<T>[]: the values
combo.selection; // T[]: the records of the data source
```

The selection methods send no `igcChange`. In single selection, `select()` without an argument clears the selection. A
user action sends one cancelable `igcChange` before the selection changes. For the confirm mode, see
[Confirm mode](#confirm-mode).

#### Select all

`selectAllItems()` and `deselectAllItems()` act on the items that the list shows, after the filter. They send no
`igcChange`. With `ignoreFilter`, they act on all the items.

In multiple selection, `show-select-all` adds a "Select all" option at the top of the list:

- A click or Space on it selects the items that the list shows. When all of them are selected, it deselects them. One
  `igcChange` reports the items that change.
- Its checkbox is checked when all the shown items are selected, and indeterminate when only some of them are.
- It is the first option in `aria-posinset` and `aria-setsize`. The list shows it only while the list shows items.
- With `totalItemCount`, it acts only on the loaded items.

```html
<igc-combo show-select-all></igc-combo>
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

`caseSensitiveIcon` shows a toggle for case-sensitive filtering in the search input. `disableFiltering` stops the
filtering, and in multiple selection it also hides the search input.

A set of `singleSelect` or `disableFiltering` to its current value keeps the search text. So a framework that sets
each property on each render does not clear the text. To filter on a server, see [Remote data](#remote-data).

#### Grouping

With a `groupKey`, the combo groups the options by that field. The items without a value in that field go into an
`Other` group. `groupSorting` sets the order of the groups: `asc` (the default), `desc`, or `none` for the order of
`data`. The comparison uses the collation of `locale`, also after a change of the global locale.

In multiple selection, `group-selection` makes each group header an option. It works as the select-all option for the
shown items of its group. The header keeps its text style, and the arrow keys and Home stop on it.

```html
<igc-combo group-key="country" group-selection></igc-combo>
```

#### Confirm mode

In multiple selection, `selection-commit="confirm"` holds the changes of the user while the list is open.

- **Pending selection.** The list opens with a copy of the selection. A click, Space, the select-all option and a
  group header option change only this copy, and each change sends a cancelable `igcPendingChange`. `value`, the form
  value, the input text and `selection` do not change.
- **Apply.** Enter applies the pending selection, also in the search input and without an active option. It sends one
  cancelable `igcChange` of the `commit` type, with the items that it selects or deselects, and then closes the list.
  A canceled `igcChange` keeps the list open with the pending selection. A canceled `igcClosing` keeps the list open
  with the applied selection.
- **Drop.** All other closes drop the pending selection. The clear icon clears `value` at once, and the pending
  selection with it.
- **Buttons.** While the list is open, the footer shows Cancel and Apply, and Tab reaches them after the list. Apply
  works as Enter. Cancel drops the pending selection, also when an `igcClosing` handler keeps the list open. They
  close the list with the `apply` and `cancel` triggers. In Indigo, Cancel is `outlined` and Apply is `contained`. In
  the other themes, both are `flat`. Content in the `footer` slot replaces them.
- **Methods.** While the pending selection exists, `select()`, `deselect()`, `selectAllItems()` and
  `deselectAllItems()` change it. So the app controls in the header and footer slots also stage changes. A new `value`
  replaces the pending selection. `pendingValue` gives its values, `commitSelection()` applies it, and
  `cancelSelection()` puts `value` back into it. These methods send no events and do not close the list. So an app
  that binds `value` through `igcChange` must read `value` after `commitSelection()`.

An app footer can use these methods in place of the built-in buttons:

```html
<igc-combo selection-commit="confirm">
  <div slot="footer">
    <igc-button id="apply">Apply</igc-button>
  </div>
</igc-combo>
```

```typescript
apply.addEventListener('click', () => {
  combo.commitSelection();
  combo.hide();
});
```

#### Templating

```typescript
combo.itemTemplate = ({ item }) => html`<b>${item.name}</b> - ${item.country}`;
combo.groupHeaderTemplate = (group) => html`<i>${group.key}</i>`;
```

The item template gets the record. The group header template gets the group `key`, which is `Other` for the items
without a group value. Its `item` property is deprecated.

#### Validation

```html
<igc-combo label="City" required>
  <span slot="value-missing">Please pick a city</span>
</igc-combo>
```

For the message slots, see the [validation container specification](../validation-container/spec.md).

#### Labeling from the light DOM

A `label` element in the light DOM can also label the control, through `for` or as a parent. An IDREF does not cross a
shadow boundary. So the combo gets its labels through `ElementInternals`, and sets them on the native input of its
anchor as element references. It also sets its `role`, `aria-haspopup`, `aria-expanded` and `aria-controls` there.

The name follows the [naming order](../input/spec.md#naming-order), so the host `aria-labelledby` and `aria-label`
also name the control. The text of the selection status names the input only when no `label` element, `label` property
or host ARIA names it.

#### Form integration

```html
<form>
  <igc-combo name="city" required></igc-combo>
  <button type="submit">Submit</button>
</form>
```

- The form submits the selection under `name`.
- A form reset restores `defaultValue`, and removes the invalid styles of the control and its input.
- An invalid control stops the submission.

As for a native control, a failed submit or `form.reportValidity()` moves the focus to the first invalid control of
the form. `reportValidity()` moves the focus to the control when it is invalid. `form.checkValidity()` and
`checkValidity()` do not move the focus. The `invalid` event comes only from these checks and from a failed submit,
not while the user edits the control.

#### Remote data

The combo can show a large remote source one page at a time. With `filteringOptions.mode` set to `remote`, the combo
does not filter the options. It keeps the search input and reports the text. The application sets `data` to the
results of the server:

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

**Search text.** `igcSearchInput` comes in both modes:
- on each change of the text in the search input, or in the main input of single selection, also a clear;
- with an empty text, when a selection in single selection, a blur with no selection or the clear button clears the
  text.

It does not come when a property change clears the text (`singleSelect`, `disableFiltering`), or with
`disableFiltering`.

In remote mode, the search input has no case-sensitive icon. In single selection, a text in the main input activates
no option of the old results. So Enter does not select an option that the server did not return for the text.

**Page requests.** In remote mode, `igcDataRequest` comes when the open list shows one of the last five options of
`data`.
- `startIndex` is `data.length`, also with groups. `count` is the number of items to append.
- It comes again only after a change of the length of `data`, a new first record, a new search text or a new opening.
  So a source with no more items gets one request for each opening.
- An empty `data` gets no request, because the application loads the first page of a search.
- An answer is stale when `data.length` is not equal to its `startIndex`, for example after a new search.
  **Selection.** A new `data` keeps the selection. A selected item that the new `data` does not hold stays in `value`,
  in `selection` and in the input text. A later page or search that holds it shows it as selected again. `select()`
  selects an object that `data` does not hold as it is. So the application can select the records of a saved filter
  before their page loads. With `valueKey`, the combo finds an object by its key first. Without an argument,
  `select()` selects all the items of `data` and keeps the other selected items.

**Placeholders.** `totalItemCount` is the number of all the results, when the server knows it. In remote mode, the
list adds a placeholder option after the groups for each result that a non-empty `data` does not hold. So the
scrollbar shows the full list. An empty `data` shows the empty message, because the application loads the first page.

- A placeholder is the skeleton of an item: the box of the checkbox in multiple selection, and a bar where the text
  starts. A wave moves across the bar, except with reduced motion.
- It has the `placeholder` part and the accessible name "Loading". It is disabled and counts in `aria-setsize`.
- The keyboard can move to it, but Enter and Space do nothing on it. A click does not select it or close the list, and
  the selection methods skip it.
- `igcDataRequest` also comes when the list shows a placeholder, for example after End or a fast scroll. Its `count`
  covers the shown placeholders, up to `totalItemCount`. No request comes when `data` holds `totalItemCount` items.
- A total that is not a finite number counts as unknown.
- `data` grows only at its end, so a jump far into the placeholders requests all the items up to the jump.

**Loading.** `loading` shows a spinner, an indeterminate `igc-circular-progress` named "Loading", in place of the
toggle icon.

- The spinner also shows while the list is closed, for example during a search in single selection.
- It covers the box of the toggle icon, so the width of the input does not change.
- An empty list shows "Loading" in place of the empty message.
- Content in the `loading` slot replaces the spinner. The slot is in the input, so a click on it toggles the list, as
  on the toggle icon. Tab does not reach it while the list is open.
- The busy state shows in the field, not in the list, so the list does not move.

`bindComboDataSource()` from `igniteui-webcomponents/extras` does this flow with the public API. See the `RemoteData`
story.

### Localization

The combo shows built-in strings from the i18n mechanism of the library. `locale` and `resourceStrings` change them
for one instance:

| Resource string                   | Default (`en`)      | Usage                                                                                 |
| --------------------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| `combo_empty_message`             | The list is empty   | The text of an empty list.                                                            |
| `combo_filter_search_placeholder` | Enter a Search Term | The placeholder of the search input.                                                  |
| `combo_clearItems_placeholder`    | Clear Selection     | The label of the clear icon.                                                          |
| `combo_aria_label_options`        | Selected options    | The accessible name of the selection.                                                 |
| `combo_aria_label_no_options`     | No options selected | The accessible name of an empty selection.                                            |
| `combo_loading`                   | Loading             | The accessible name of the spinner and of the placeholders, and the text of an empty list while loading. |
| `combo_select_all`                | Select all          | The text of the select-all option.                                                    |
| `combo_cancel`                    | Cancel              | The text of the Cancel button of the confirm mode.                                    |
| `combo_apply`                     | Apply               | The text of the Apply button of the confirm mode.                                     |

### Keyboard interactions

These keys apply while the combo has the focus.

While the list is closed:

| Keys                                                            | Result                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| <kbd>Arrow Down</kbd> / <kbd>Alt</kbd> + <kbd>Arrow Down</kbd> | Opens the list.                                         |
| A character key                                                 | In single selection, opens the list and filters it.    |
| <kbd>Escape</kbd>                                               | Clears the value. The combo keeps the focus.            |

While the list is open:

| Keys                                                | Result |
| --------------------------------------------------- | ------ |
| <kbd>Arrow Down</kbd>                               | Activates the next option. At the last option, it does nothing. |
| <kbd>Arrow Up</kbd>                                 | Activates the previous option. From the first option, it moves the focus to the search input, or closes the list when the search input does not show. |
| <kbd>Space</kbd>                                    | Selects or deselects the active option. On the select-all option, or on a group header of `groupSelection`, it selects the shown items, or deselects them when all of them are selected. |
| <kbd>Enter</kbd>                                    | On an active option, closes the list, and in single selection first selects the option. In confirm mode, it first applies the pending selection, also from the search input and without an active option, and a canceled `igcChange` keeps the list open. On a placeholder, it does nothing. |
| <kbd>Home</kbd> / <kbd>End</kbd>                    | Activates the first or the last option. |
| <kbd>Escape</kbd>                                   | Closes the list. The combo keeps the focus. In confirm mode, it drops the pending selection. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>  | Moves through the search input (the main input in single selection), the header content, the list, the empty content and the footer content. In confirm mode, the footer content is Cancel and Apply. Past the first or the last stop, or without focusable slot content, it closes the list and moves the focus on. |

In multiple selection, the search input filters the list while it has the focus.

## API

### Properties and attributes

| Property               | Attribute                  | Reflected | Type                                | Default           | Description                                                     |
| ---------------------- | -------------------------- | --------- | ----------------------------------- | ----------------- | ---------------------------------------------------------------- |
| data                   | -                          | No        | `T[]`                               | `[]`              | The data source used to generate the list of options. A new data source keeps the selection, also the selected items that it does not hold. |
| value                  | value                      | No        | `ComboValue<T>[]`                   | `[]`              | The values of the selected items. With a `valueKey`, each value is that field of an item. Without it, each value is the item itself. |
| selection              | -                          | No        | `T[]`                               | `[]`              | Read-only. The current selection as records of the data source. |
| pendingValue           | -                          | No        | `ComboValue<T>[]`                   | `[]`              | Read-only. The values of the pending selection in the confirm mode of `selectionCommit`, which Enter, the Apply button or `commitSelection()` applies. Without a pending selection, the same as `value`. |
| valueKey               | value-key                  | No        | `Keys<T> \| undefined`              | -                 | The key in the data source used when selecting items.           |
| displayKey             | display-key                | No        | `Keys<T> \| undefined`              | -                 | The key in the data source used to display items in the list. Falls back to `valueKey`. |
| groupKey               | group-key                  | No        | `Keys<T> \| string \| undefined`    | -                 | The key in the data source used to group items in the list.     |
| groupSorting           | group-sorting              | No        | `'asc' \| 'desc' \| 'none'`         | `asc`             | The sort order of the groups, by their group value. With `none`, the groups keep the order of the data source. |
| singleSelect           | single-select              | Yes       | `boolean`                           | false             | Whether only one item can be selected. In this mode, the main input filters the list of options. |
| filteringOptions       | filtering-options          | No        | `FilteringOptions<T>`               | -                 | Configures the filtering of the combo.                          |
| disableFiltering       | disable-filtering          | No        | `boolean`                           | false             | Whether the filtering of the list of options is disabled. In multiple selection mode, it also hides the search input. |
| caseSensitiveIcon      | case-sensitive-icon        | No        | `boolean`                           | false             | Whether the search input shows the icon that toggles case-sensitive filtering. |
| disableClear           | disable-clear              | No        | `boolean`                           | false             | Whether the clear button is hidden.                             |
| totalItemCount         | total-item-count           | No        | `number \| undefined`               | -                 | The number of all the items of a remote source, when the source knows it. In remote filtering mode, the list shows a placeholder for each item that `data` does not hold yet. |
| loading                | loading                    | Yes       | `boolean`                           | false             | Whether the combo loads options. A spinner, which the `loading` slot can replace, then takes the place of the toggle icon, and an empty list shows a loading message instead of the empty message. |
| showSelectAll          | show-select-all            | No        | `boolean`                           | false             | Whether the list starts with an option that selects all the items that it shows, or deselects them when all of them are selected. Only in multiple selection mode. |
| groupSelection         | group-selection            | No        | `boolean`                           | false             | Whether a group header is an option that selects the items of its group that the list shows, or deselects them when all of them are selected. Only in multiple selection mode with `groupKey`. |
| selectionCommit        | selection-commit           | No        | `'immediate' \| 'confirm'`          | `immediate`       | When the user's changes of the selection apply in multiple selection mode. With `confirm`, they change a pending selection while the list is open, and Enter or the Apply button applies it with one `igcChange`. Any other close drops it. While it exists, the selection methods change it too. |
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
| commitSelection   | `(): void`                             | Applies the pending selection of the confirm mode to `value`. It does not emit `igcChange` or close the list. |
| cancelSelection   | `(): void`                             | Puts `value` back as the pending selection of the confirm mode. It does not close the list. |
| focus             | `(options?: FocusOptions): void`       | Sets focus on the component.                                                     |
| blur              | `(): void`                             | Removes focus from the component.                                                |
| checkValidity     | `(): boolean`                          | Checks validity and emits `invalid` when the control is invalid. Returns `true` when the control is valid.                 |
| reportValidity    | `(): boolean`                          | Checks validity. As for a native control, an invalid control emits `invalid` and takes the focus. It shows its own validation messages, not the message of the browser. Returns `true` when the control is valid.          |
| setCustomValidity | `(message: string): void`              | Sets a custom validation message. The control is invalid while the message is not empty. An empty string removes the custom error.                     |

### Events

| Name       | Cancellable | Description                                       |
| ---------- | ----------- | ------------------------------------------------- |
| igcChange  | true        | Emitted before the user changes the selection, or applies the pending selection of the confirm mode (`type: 'commit'`). Cancel the event to keep the selection. `newValue` is the `value` after the change, in the same order: the selected values first, then the new ones. |
| igcPendingChange | true  | Emitted in the confirm mode of `selectionCommit` before the user changes the pending selection. Cancel the event to keep the pending selection. The detail is the `igcChange` detail for the pending selection. |
| igcOpening | true        | Emitted before the user opens the list of options. Cancelable. |
| igcOpened  | false       | Emitted after the list of options opens on a user action. |
| igcClosing | true        | Emitted before the user closes the list of options. Cancelable. The `trigger` of the detail is the user action that closes the list. |
| igcClosed  | false       | Emitted after the list of options closes on a user action. The `trigger` of the detail is the user action that closes the list. |
| igcSearchInput | false   | Emitted when the user changes the text of the search input, or of the main input in single selection mode, and when a selection, a blur or the clear button clears the text. |
| igcDataRequest | false   | Emitted in remote filtering mode when the user scrolls near the end of the options, or to a placeholder of `totalItemCount`. Append the requested items to `data`. It is not emitted again until the length of `data` or the search text changes. |

```typescript
interface IgcComboChangeEventArgs<T> {
  newValue: ComboValue<T>[];
  items: T[];
  // `commit`: the items that the pending selection selects or deselects.
  type: 'selection' | 'deselection' | 'addition' | 'commit';
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
  | 'selection' // an item click in single selection
  | 'apply' // the Apply button of the confirm mode
  | 'cancel'; // the Cancel button of the confirm mode
```
The open events have an empty `detail`. `hide()`, `toggle()` and a change of `open` send no events. To stage a
selection, see [Confirm mode](#confirm-mode). When the list closes while it has the focus, also on `hide()` from a
footer button, the focus moves to the main input. The closed list cannot keep the focus.

### Slots

| Name            | Description                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| `prefix`        | Renders content before the input of the combo.                                   |
| `suffix`        | Renders content after the input of the combo.                                    |
| `header`        | Renders a container before the list of options.                                  |
| `footer`        | Renders a container after the list of options. In the confirm mode of `selectionCommit`, its default content is Cancel and Apply. |
| `empty`         | Renders content when the list has no items or data.                              |
| `loading`       | Renders content that replaces the default spinner while `loading` is set. It is in the input, so a click on it toggles the list, as on the toggle icon. |
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
| `active`             | Added to the item part when the item is active, to the group-header part when the header is an active option of `groupSelection`, and to the case-icon part while case-sensitive filtering is on. |
| `selected`           | Added to the item part when the item is selected, and to the group-header part of `groupSelection` when all the shown items of the group are selected. |
| `checkbox`           | The checkbox of each item in the list.                         |
| `checkbox-indicator` | The checkbox indicator of each item in the list.               |
| `checked`            | Added to the checkbox and checkbox-indicator parts when the checkbox is checked. |
| `indeterminate`      | Added to the checkbox and checkbox-indicator parts of the select-all option, or of a group header of `groupSelection`, while only some of its shown items are selected. |
| `select-all`         | Added to the item part of the select-all option.               |
| `header` / `footer`  | The containers holding the header and footer content.          |
| `actions`            | The container of the Cancel and Apply buttons of the confirm mode. |
| `cancel-button`      | The Cancel button of the confirm mode.                         |
| `apply-button`       | The Apply button of the confirm mode.                          |
| `empty`              | The container holding the empty content.                       |
| `loading`            | The indeterminate circular progress that replaces the toggle icon while `loading` is set. It has the color of the text. |
| `placeholder`        | Added to the item part of each item to load, which `totalItemCount` adds. Its skeleton has the color of the text. |

### CSS custom states

| State        | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `ig-invalid` | Set while the control shows its invalid state, that is while `invalid` returns `true`. |

### CSS custom properties

| Property                | Description                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ig-helper-min-lines` | The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`. |

## Test scenarios

The suite runs in a real browser through `@web/test-runner`, with `@open-wc/testing` fixtures and assertions. It has
four files, and the groups below follow them in this order:

- [`combo.spec.ts`](./combo.spec.ts): the component, the header and footer slots, the close trigger, the scroll
  strategy, theming, ARIA, and the shared suites for the external label and the host ARIA.
- [`combo-remote.spec.ts`](./combo-remote.spec.ts): remote data, placeholders and loading.
- [`combo-selection.spec.ts`](./combo-selection.spec.ts): the select-all methods and option, group selection and the
  confirm mode.
- [`combo-form.spec.ts`](./combo-form.spec.ts): form integration, `defaultValue` and the validation message slots.

The files share their data and helpers through
[`src/internals/testing/combo.spec.ts`](../../internals/testing/combo.spec.ts). They also use
`createFormAssociatedTestBed`, `runValidationContainerTests`, `runExternalLabelAssociationTests`,
`runAriaProjectionTests` and the `simulate*` helpers from [`src/internals/testing`](../../internals/testing). The unit
specs in [`controllers`](./controllers) test the data state, the data requests and the selection model without a
browser fixture.

### Component

1. Rendering, the default state and the accessibility audit.
2. Data binding through `data`, `valueKey`, `displayKey` and `groupKey`, also when the `data` array changes in place.
3. Single and multiple selection, with `select` and `deselect` with and without arguments.
4. `value` and `selection` give the values and the records.
5. Filtering, with case sensitivity, diacritics matching and `disableFiltering`. A set of `singleSelect` or
   `disableFiltering` to its current value keeps the search text and the filter.
6. Grouping, the `Other` group for the items without a group value, and the sort directions.
7. The item and group header templates. The group header template gets the group `key` with its own type, also for
   number keys and the `Other` group. A template that reads the deprecated `item` still renders.
8. The empty message and the `empty` slot.
9. Localization through `locale` and `resourceStrings`.
10. Open, close and the keyboard navigation of the list, also Arrow Down at the end of the matches.
11. The clear icon and `disableClear`.
12. `igcChange` gives the new value, the items and the change type, and a cancel keeps the selection.
13. The `igcChange` of the search input, and the `igcStateChange` and `igcDataRequest` events of the list, stay inside
    the combo.

### Header and footer slots

14. Tab moves from the search input to the header content, the list and the footer content, and Shift+Tab moves back.
    With an empty list, Tab reaches the content of the `empty` slot. The accessibility audit passes with focusable
    slot content.
15. Tab from the last footer control and Shift+Tab from the search input close the list and move the focus out of the
    combo. In single selection, the main input starts the order, and Tab selects the active item when it leaves.
    `hide()` from a footer control, or `open` set to `false` with the focus in the search input, moves the focus to
    the main input. A focus outside the list stays where it is.
16. Without focusable slot content, Tab from the search input closes the list and moves the focus on.
17. Tab moves out of a stop inside another stop. It does not stop on a host that delegates the focus or on a control
    with `visibility: hidden`. A slotted control that handles Tab keeps it.

### Close trigger

18. `igcClosing` and `igcClosed` report the same `trigger` one time for each of these actions: Enter in the list and
    in the main input, Escape, Tab and Shift+Tab, Arrow Up in each input and at the first item, a click outside, a
    click on the input, an item click in single selection, and a scroll with the `close` strategy. A second close
    while one is in progress does not change the trigger, and a close after a canceled close reports its own trigger.
19. The open events have an empty `detail`, and `hide()` sends no events.

### Scroll strategy tests

20. `hide`, `scroll` and `close` work as specified while an ancestor scrolls.

### Theming

21. The list keeps its stylesheet in the shadow root when the theme changes.

### ARIA

22. The anchor, the list, the items and the group headers have their roles and states, and the selection summary is
    announced.

### Host ARIA

23. The shared host description suite: the host `aria-describedby` describes the native control after the helper text,
    and follows a change and a removal.

### Remote data

24. The mode comes from the `filtering-options` attribute. In remote mode, the search input and the main input do not
    filter the options. A change back to `local` filters them.
25. `igcSearchInput` reports each change of the search text in both modes, and of the main input in single selection,
    also when the text is cleared. It reports an empty text when a selection or a blur clears the text, and a blur
    also clears the search input. It does not come on a property change or with `disableFiltering`. The `igcInput` of
    the inputs stays inside the combo. In remote mode, the case-sensitive icon hides, and an input in single selection
    activates no option.
26. The repro of issue 2519: a search that replaces `data` keeps the selected items in `value`, `selection` and the
    input text. A later selection adds to them, and the first page shows them as selected again with its own records.
27. `deselect()` removes a selected item that `data` does not hold. `select()` selects an object that `data` does not
    hold, with and without `valueKey`. `select()` without an argument keeps the other selected items, and selects each
    value one time, also before a new `data` syncs.
28. `igcDataRequest` comes near the end of `data` with `startIndex` equal to `data.length`, also with groups. It does
    not come again until `data` grows. A new search, a new `data` without a search with a page of the same length, and
    a new opening each get their own request. It does not come in local mode, while the list is closed, or with an
    empty `data`.

### Placeholders and loading

29. In remote mode, `totalItemCount` adds placeholder options after the groups. They count in `aria-setsize`, take the
    next positions, are disabled, have the name "Loading", and pass the accessibility audit. Local mode, an empty
    `data` and a total that is not a finite number show no placeholders.
30. `igcDataRequest` covers the shown placeholders, for example after End, and does not go past `totalItemCount`. It
    stops when `data` holds `totalItemCount` items, and comes again when the total no longer stops it. Space, a click
    and `selectAllItems()` do not select a placeholder. In single selection, Enter or a click on a placeholder does
    not close the list.
31. `loading` shows the named spinner over the hidden toggle icon, and "Loading" in an empty list. The toggle width
    does not change, and the list does not move. It passes the accessibility audit. The `loading` slot replaces the
    spinner. The spinner and the skeletons get their colors from the `loading` and `placeholder` parts.

### Select all methods

32. `selectAllItems()` and `deselectAllItems()` change only the items that the filtered list shows, also right after a
    change of `data` or of the search text. They send no `igcChange`, and change nothing when the list shows no items.
    With `ignoreFilter`, they act on all the items. In single selection, `selectAllItems()` does nothing and
    `deselectAllItems()` deselects a shown item.

### Select-all option

33. The option comes first in multiple selection, before the group headers, with the "Select all" text and
    `aria-selected`. It is the first option in `aria-posinset` and `aria-setsize`, and it passes the accessibility
    audit. It does not show in single selection or while the list shows no items.
34. A click selects the shown items, and a second click deselects them, with one `igcChange` each. When only some
    shown items are selected, the option is not selected, and its checkbox is indeterminate with the `indeterminate`
    part. A click then selects only the other shown items. A canceled `igcChange` keeps the selection. A new `value`
    while the list is open updates the option and the items.
35. Home reaches the option, Space toggles it, and Arrow Up from it moves to the search input. A change of
    `showSelectAll` clears the active option. A click on an item without a value selects only that item.
36. With `totalItemCount` in remote mode, the option does not change the requests or the positions of the
    placeholders. The selection methods select only the loaded items.

### Group selection

37. In multiple selection, the group headers are options with a checkbox and `aria-selected`. They count in
    `aria-posinset` and `aria-setsize`, and the accessibility audit passes. In single selection, they are headers
    again, and the items take their positions back.
38. A click on a header selects the shown items of its group, and a second click deselects them, with one `igcChange`
    each. The list stays open. With some of them selected, the checkbox is indeterminate with the `indeterminate`
    part, and a click selects only the others.
39. Home and the arrow keys stop on the headers, Space toggles them, and Enter closes the list. A click on the
    select-all option also selects the headers. When group selection goes off, an active header stops being active.

### Confirm mode

40. A click and Space change the pending selection with `igcPendingChange`. The list and `pendingValue` show it, and
    `value`, `selection` and the input text keep the selection. A canceled `igcPendingChange` keeps the pending
    selection.
41. Enter applies the pending selection with one `igcChange` of the `commit` type with the changed items. Then it
    closes the list with the `enter` trigger. This also occurs in the search input and without an active option.
    Without a change, it closes the list with no `igcChange`. A canceled `igcChange` keeps the list open with the
    pending selection. A handler that changes `newValue` does not change `value`.
42. Escape, a click on the input, `hide()` and `open` set to `false` drop the pending selection, with no `igcChange`.
43. From the moment the list opens, the selection methods change the pending selection, also with an item that `data`
    does not hold. From the moment the list closes, they change the value. `commitSelection()` applies the pending
    selection with no events and keeps the list open. `cancelSelection()` and a new `value` replace it, and the same
    `value` keeps it.
44. The clear icon clears `value` and the pending selection with one `igcChange`. A new `data` keeps the pending
    selection by value, and adds the values of `value` that it gives a record. A value without a record stays in
    `value` until a commit, and `select()` gives it a record in the input text. The select-all option and the group
    header options change the pending selection. In single selection, each change applies at once.
45. The footer shows Cancel and Apply with the `combo_cancel` and `combo_apply` texts, and the accessibility audit
    passes. Footer content replaces them, and the immediate mode and single selection do not show them.
46. Apply applies the pending selection with one `igcChange`, closes the list with the `apply` trigger, and moves the
    focus to the main input. A canceled `igcChange` keeps the list open. Cancel drops the pending selection and closes
    the list with the `cancel` trigger.
47. Tab moves from the list to Cancel and Apply, and Tab from Apply closes the list.

### Form integration tests

48. The combo is form associated, submits its selection, and resets with the form, also the input of single selection.
49. It shows the disabled state of an ancestor `fieldset`.
50. It obeys the required and custom constraints, and passes the accessibility audit while a submit fails on the
    required constraint.

The form-associated mixin gives the focus after the form checks and the rules of the `invalid` event. The
[input suite](../input/spec.md#form-validity-checks) tests them.

### defaultValue

51. Form integration in single selection, in multiple selection, and with data that comes late.
52. Validation against the default value.

### Validation message slots

`runValidationContainerTests` makes these tests.

53. The `value-missing`, `custom-error` and `invalid` slots show for their state.

## Assumptions and limitations

- The options come from the `data` array. The combo does not support child item elements.
- The combo has no public property to add a custom value from the input, but the change event type has an `addition`
  kind.
- The list is virtualized, so an option that the list does not show has no DOM node. Use the data records, not the
  item elements.
- Without a `valueKey`, `value` contains whole records, not primitive values.
- A user change sets `value` from the selected records, also a commit of the confirm mode. So a value that has no
  record in `data` leaves `value`. The `resolve` option of `bindComboDataSource()` gives such values their records.
- `singleSelect` overrides `selectionCommit`: in single selection, each change applies at once. A change of
  `selectionCommit` or `singleSelect` while the list is open drops the pending selection.

## Accessibility

### ARIA roles and properties

- The native input of the anchor has the `combobox` role, `aria-haspopup`, `aria-expanded` and `aria-controls`, as
  element references. The listbox has `aria-activedescendant`, because it has the focus during list navigation.
- The list has the `listbox` role, and the items have the `option` role with `aria-selected`.
- The group headers have no role. With `groupSelection`, they are options.
- The select-all option is selected while all the shown items are selected. A group header option is selected while
  all the shown items of its group are selected. They have no `aria-checked`, because a listbox uses only one of
  `aria-selected` and `aria-checked` for all its options. So their mixed state shows only on their checkbox.
- In confirm mode, the selected state of the options is the pending selection, and the input shows `value`.
- A placeholder of `totalItemCount` is a disabled option with the name "Loading".
- While `loading` is set, a `progressbar` with the name "Loading" replaces the toggle icon. The listbox has no
  `aria-busy`, so a screen reader continues to read the loaded options while the next page loads.
- A label from the resource strings announces the selection, also when it is empty.
- `aria-describedby` refers to the helper text and the validation messages.
- An external light DOM `label` goes to the native input of the anchor as an element reference.
- A host `aria-describedby` describes the native control after the helper text, by element reference.
- The native input has no `aria-disabled`. Its native `disabled` state is enough.

### Keyboard support

See [Keyboard interactions](#keyboard-interactions).

### Right to Left support

The combo works in a right-to-left context without more configuration.
