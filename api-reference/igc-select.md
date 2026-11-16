# igc-select

Represents a control that provides a menu of options.

```ts
import { defineComponents, IgcSelectComponent } from 'igniteui-webcomponents';

defineComponents(IgcSelectComponent);
```

## Properties

- `value`: `string | undefined`. Attribute: `value`.
  The value of the control.
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the control has an outlined appearance.
- `autofocus`: `boolean`. Attribute: `autofocus`.
  Whether the control takes the focus after its first render.
- `distance`: `number`. Default: `0`. Attribute: `distance`.
  The distance of the select dropdown from its input.
- `label`: `string`. Attribute: `label`.
  The label of the control.
- `placeholder`: `string`. Attribute: `placeholder`.
  The placeholder text of the control.
- `placement`: `'bottom' | 'top' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left' | 'right' | 'right-start' | 'right-end' | 'left-start' | 'left-end'`. Default: `'bottom-start'`. Attribute: `placement`.
  The preferred placement of the select dropdown around its input.
- `items`: `IgcSelectItemComponent[]`. Read-only. No attribute.
  Returns the items of the select component.
- `groups`: `IgcSelectGroupComponent[]`. Read-only. No attribute.
  Returns the groups of the select component.
- `selectedItem`: `IgcSelectItemComponent | null`. Read-only. No attribute.
  Returns the selected item from the dropdown or null.
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

- `focus(options?: FocusOptions): void`
  Sets focus on the component.
- `blur(): void`
  Removes focus from the component.
- `navigateTo(value: string): IgcSelectItemComponent | null`
  Navigates to the item with the specified value. If it exists, returns the found item, otherwise - null.
- `navigateTo(index: number): IgcSelectItemComponent | null`
  Navigates to the item at the specified index. If it exists, returns the found item, otherwise - null.
- `navigateTo(value: string | number): IgcSelectItemComponent | null`
  Navigates to the specified item. If it exists, returns the found item, otherwise - null.
- `select(value: string): IgcSelectItemComponent | null`
  Selects the item with the specified value. If it exists, returns the found item, otherwise - null.
- `select(index: number): IgcSelectItemComponent | null`
  Selects the item at the specified index. If it exists, returns the found item, otherwise - null.
- `select(value: string | number): IgcSelectItemComponent | null`
  Selects the specified item. If it exists, returns the found item, otherwise - null.
- `clearSelection(): void`
  Resets the current value and selection of the component.
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
  Emitted when the user selects a different item. The detail is the item.
- `igcOpening`
  Emitted before the user opens the list of options. Cancelable.
- `igcOpened`
  Emitted after the list of options opens on a user action.
- `igcClosing`
  Emitted before the user closes the list of options. Cancelable.
- `igcClosed`
  Emitted after the list of options closes on a user action.

## Slots

- default: Renders the list of select items.
- `prefix`: Renders content before the input.
- `suffix`: Renders content after the input.
- `header`: Renders a container before the list of options.
- `footer`: Renders a container after the list of options.
- `helper-text`: Renders content below the input.
- `toggle-icon`: Renders content that replaces the default toggle icon.
- `toggle-icon-expanded`: Renders content for the toggle icon when the component is in open state.
- `value-missing`: Renders content when the required validation fails.
- `custom-error`: Renders content when setCustomValidity(message) is set.
- `invalid`: Renders content when the component is in invalid state (validity.valid = false).

## CSS parts

- `base`: The popup container of the list of options.
- `list`: The list wrapping container for the items of the select.
- `input`: The encapsulated input of the select.
- `native-input`: The native input element of the encapsulated input.
- `label`: The encapsulated text label of the select.
- `prefix`: The prefix wrapper of the input of the select.
- `suffix`: The suffix wrapper of the input of the select.
- `toggle-icon`: The toggle icon wrapper of the select.
- `filled`: Added to the toggle-icon part when the select has a value.
- `helper-text`: The helper text wrapper of the select.

## CSS custom properties

- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.
