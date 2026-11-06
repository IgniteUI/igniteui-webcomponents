# igc-combo

The combo lets the user select one or more options from a list. Unlike the select, it shows the options in a
virtualized list, so the list can hold thousands of options.
The combo supports custom item templates, case-sensitive filtering, grouping and binding to complex data.

```ts
import { defineComponents, IgcComboComponent } from 'igniteui-webcomponents';

defineComponents(IgcComboComponent);
```

## Properties

- `data`: `T[]`. Default: `[]`. No attribute.
  The data source used to generate the list of options. A new data source
  keeps the selection, also the selected items that it does not hold.
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the control has an outlined appearance.
- `singleSelect`: `boolean`. Default: `false`. Attribute: `single-select`, reflected.
  Whether only one item can be selected. In this mode, the main input
  filters the list of options.
- `autofocus`: `boolean`. Attribute: `autofocus`.
  Whether the control takes the focus automatically.
- `autofocusList`: `boolean`. Default: `false`. Attribute: `autofocus-list`.
  Whether the list of options, not the search input, takes the focus when
  the list opens. It has no effect in single selection mode.
- `label`: `string | undefined`. Attribute: `label`.
  The label of the control.
- `placeholder`: `string | undefined`. Attribute: `placeholder`.
  The placeholder text of the control.
- `placeholderSearch`: `string`. Attribute: `placeholder-search`.
  The placeholder text of the search input.
- `valueKey`: `Keys<T> | undefined`. Attribute: `value-key`.
  The key in the data source used when selecting items.
- `displayKey`. Attribute: `display-key`.
  The key in the data source used to display items in the list. Falls back
  to `valueKey`.
- `groupKey`: `Keys<T> | string | undefined`. Attribute: `group-key`.
  The key in the data source used to group items in the list.
- `groupSorting`: `'none' | 'asc' | 'desc'`. Default: `'asc'`. Attribute: `group-sorting`.
  The sort order of the groups, by their group value. With `none`, the
  groups keep the order of the data source.
- `filteringOptions`: `FilteringOptions<T>`. Attribute: `filtering-options`.
  An object that configures the filtering of the combo.
- `caseSensitiveIcon`: `boolean`. Default: `false`. Attribute: `case-sensitive-icon`.
  Whether the search input shows the icon that toggles case-sensitive
  filtering. In remote filtering mode, read `filteringOptions.caseSensitive`
  when you send the search to the server.
- `disableFiltering`: `boolean`. Default: `false`. Attribute: `disable-filtering`.
  Whether the filtering of the list of options is disabled. In multiple
  selection mode, it also hides the search input.
- `disableClear`: `boolean`. Default: `false`. Attribute: `disable-clear`.
  Whether the clear button is hidden.
- `totalItemCount`: `number | undefined`. Attribute: `total-item-count`.
  The number of all the items of a remote source, when the source knows it.
  In remote filtering mode, the list shows a placeholder for each item that
  `data` does not hold yet, so the scrollbar shows the full list.
- `loading`: `boolean`. Default: `false`. Attribute: `loading`, reflected.
  Whether the combo loads options. A spinner, which the `loading` slot can
  replace, then takes the place of the toggle icon, and an empty list shows
  a loading message instead of the empty message.
- `showSelectAll`: `boolean`. Default: `false`. Attribute: `show-select-all`.
  Whether the list starts with an option that selects all the items that it
  shows, or deselects them when all of them are selected. Only in multiple
  selection mode.
- `groupSelection`: `boolean`. Default: `false`. Attribute: `group-selection`.
  Whether a group header is an option that selects the items of its group
  that the list shows, or deselects them when all of them are selected.
  Only in multiple selection mode with `groupKey`.
- `selectionCommit`: `'immediate' | 'confirm'`. Default: `'immediate'`. Attribute: `selection-commit`.
  When the user's changes of the selection apply in multiple selection
  mode. With `confirm`, they change a pending selection while the list is
  open, and Enter or the Apply button applies it with one `igcChange`. Any
  other close drops it. While it exists, the selection methods change it too.
- `itemTemplate`: `ComboItemTemplate<T>`. No attribute.
  The template used for the content of each combo item.
- `groupHeaderTemplate`: `ComboGroupHeaderTemplate<T>`. No attribute.
  The template used for the content of each combo group header.
- `value`: `ComboValue<T>[]`. Attribute: `value`.
  The values of the selected items. With a `valueKey`, each value is that
  field of an item. Without it, each value is the item itself.
- `selection`: `T[]`. Read-only. No attribute.
  Returns the current selection as an array of objects as provided in the `data` source.
- `pendingValue`: `ComboValue<T>[]`. Read-only. No attribute.
  The values of the pending selection in the confirm mode of
  `selectionCommit`, which Enter, the Apply button or `commitSelection()`
  applies. Without a pending selection, the same as `value`.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<IComboResourceStrings>`. No attribute.
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
- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the component is open.
- `scrollStrategy`: `'scroll' | 'hide' | 'close'`. Default: `'hide'`. Attribute: `scroll-strategy`.
  The behavior of the component when a parent container scrolls.

  If the value is `hide`, the component hides while the anchor is fully out
  of view. `hide` is the default value.

  If the value is `scroll`, the component stays visible and anchored.

  If the value is `close`, the component closes on each scroll.

## Methods

- `focus(options?: FocusOptions): void`
  Sets focus on the component.
- `blur(): void`
  Removes focus from the component.
- `select(items?: Item<T> | Item<T>[]): void`
  Selects options in the list by reference or by `valueKey` value. It does
  not emit `igcChange`. An object that `data` does not hold is selected as
  it is. Without an argument, it selects all the items of `data`, or clears
  the selection in single selection mode.
- `deselect(items?: Item<T> | Item<T>[]): void`
  Deselects options in the list by reference or by `valueKey` value. It
  does not emit `igcChange`. Without an argument, it deselects all items.
- `selectAllItems(ignoreFilter?: boolean = false): void`
  Selects all the items that the list shows. It does not emit `igcChange`,
  and does nothing in single selection mode.
- `deselectAllItems(ignoreFilter?: boolean = false): void`
  Deselects all the items that the list shows. It does not emit `igcChange`.
- `commitSelection(): void`
  Applies the pending selection of the confirm mode to `value`. It does not
  emit `igcChange` or close the list.
- `cancelSelection(): void`
  Puts `value` back as the pending selection of the confirm mode. It does
  not close the list.
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

- `igcChange`
  Emitted before the user changes the selection, or applies the pending selection of the confirm mode (`type: 'commit'`). Cancel the event to keep the selection.
- `igcPendingChange`
  Emitted in the confirm mode of `selectionCommit` before the user changes the pending selection. Cancel the event to keep the pending selection.
- `igcOpening`
  Emitted before the user opens the list of options. Cancelable.
- `igcOpened`
  Emitted after the list of options opens on a user action.
- `igcClosing`
  Emitted before the user closes the list of options. Cancelable. The `trigger` of the detail is the user action that closes the list.
- `igcClosed`
  Emitted after the list of options closes on a user action. The `trigger` of the detail is the user action that closes the list.
- `igcSearchInput`
  Emitted when the user changes the text of the search input, or of the main input in single selection mode, and when a selection, a blur or the clear button clears the text. Also emitted with the same text when the case-sensitive icon changes the case of a search text.
- `igcDataRequest`
  Emitted in remote filtering mode when the user scrolls near the end of the options, or to a placeholder of `totalItemCount`. Append the requested items to `data`. It is not emitted again until the length of `data`, the search text or its case changes, or the list opens again.

## Slots

- `prefix`: Renders content before the input of the combo.
- `suffix`: Renders content after the input of the combo.
- `header`: Renders a container before the list of options of the combo.
- `footer`: Renders a container after the list of options of the combo. In the confirm mode of `selectionCommit`, its default content is Cancel and Apply.
- `empty`: Renders content when the combo dropdown list has no items/data.
- `loading`: Renders content that replaces the default spinner while `loading` is set. It is in the input, so a click on it toggles the list, as on the toggle icon.
- `helper-text`: Renders content below the input of the combo.
- `toggle-icon`: Renders content that replaces the default toggle icon.
- `clear-icon`: Renders content that replaces the default clear icon.
- `value-missing`: Renders content when the required validation fails.
- `custom-error`: Renders content when setCustomValidity(message) is set.
- `invalid`: Renders content when the component is in invalid state (validity.valid = false).

## CSS parts

- `label`: The encapsulated text label of the combo.
- `input`: The main input field of the combo.
- `native-input`: The native input of the main input field of the combo.
- `prefix`: The prefix wrapper of the combo.
- `suffix`: The suffix wrapper of the combo.
- `toggle-icon`: The toggle icon wrapper of the combo.
- `filled`: Added to the toggle-icon part when the combo has a value.
- `clear-icon`: The clear icon wrapper of the combo.
- `case-icon`: The case icon wrapper of the combo.
- `helper-text`: The helper text wrapper of the combo.
- `filter-input`: The wrapper of the search input.
- `search-input`: The search input field of the combo.
- `list-wrapper`: The list of options wrapper of the combo.
- `list`: The list of options box of the combo.
- `item`: Each item in the list of options.
- `group-header`: Each group header in the list of options.
- `active`: Added to the item part when the item is active, to the group-header part when the header is an active option of `groupSelection`, and to the case-icon part while case-sensitive filtering is on.
- `selected`: Added to the item part when the item is selected, and to the group-header part of `groupSelection` when all the shown items of the group are selected.
- `checkbox`: The checkbox of each item in the list.
- `checkbox-indicator`: The checkbox indicator of each item in the list.
- `checked`: Added to the checkbox and checkbox-indicator parts when the checkbox is checked.
- `indeterminate`: Added to the checkbox and checkbox-indicator parts of the select-all option, or of a group header of `groupSelection`, while only some of its shown items are selected.
- `select-all`: Added to the item part of the select-all option.
- `header`: The container holding the header content of the combo.
- `footer`: The container holding the footer content of the combo.
- `actions`: The container of the Cancel and Apply buttons of the confirm mode.
- `cancel-button`: The Cancel button of the confirm mode.
- `apply-button`: The Apply button of the confirm mode.
- `empty`: The container holding the empty content of the combo.
- `loading`: The indeterminate circular progress that replaces the toggle icon while `loading` is set. It has the color of the text.
- `placeholder`: Added to the item part of each item to load, which `totalItemCount` adds. Its skeleton has the color of the text.

## CSS custom properties

- `--ig-combo-item-indent`: The indent of the items under a group header option of `groupSelection`. Default is the indent of the tree: 12, 16 or 24 px by size, and 24 px in Indigo.
- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.
