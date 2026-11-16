# igc-file-input

A form control that lets the user select one or more files, or a folder.

```ts
import { defineComponents, IgcFileInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcFileInputComponent);
```

## Properties

- `value`: `string`. Attribute: `value`.
  The value of the control: the name of the first selected file, as the native file input gives it.
  As for the native file input, only an empty string can be set. It clears the selection.
- `multiple`: `boolean`. Default: `false`. Attribute: `multiple`, reflected.
  Whether the control allows the user to select more than one file.
- `directory`: `boolean`. Default: `false`. Attribute: `directory`.
  Whether the user selects a folder instead of files. The selection then holds
  every file in the folder and its subfolders, and the `webkitRelativePath` of
  each file gives its path from the folder.
- `accept`: `string`. Default: `''`. Attribute: `accept`.
  The file types the control accepts, as a comma-separated list.
- `autofocus`: `boolean`. Attribute: `autofocus`.
  Whether the control receives focus automatically.
- `files`: `FileList`. Read-only. No attribute.
  The list of selected files.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<IFileInputResourceStrings>`. No attribute.
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
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the control has an outlined appearance.
- `placeholder`: `string`. Attribute: `placeholder`.
  The placeholder text of the control.
- `label`: `string`. Attribute: `label`.
  The label for the control.

## Methods

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
- `select(): void`
  Selects all the text inside the input.
- `focus(options?: FocusOptions): void`
  Sets focus on the control.
- `blur(): void`
  Removes focus from the control.

## Events

- `igcChange`
  Emitted when the selection of the control changes.
- `igcCancel`
  Emitted when the control's file picker dialog is canceled.

## Slots

- `prefix`: Renders content before the input.
- `suffix`: Renders content after the input.
- `helper-text`: Renders content below the input.
- `file-selector-text`: Renders content for the browse button.
- `file-missing-text`: Renders content when no file is chosen.
- `value-missing`: Renders content when the required validation fails.
- `custom-error`: Renders content when a custom message is set with `setCustomValidity()`.
- `invalid`: Renders content when the component is in invalid state (validity.valid = false).

## CSS parts

- `container`: The main wrapper that holds all main input elements.
- `input`: The native input element.
- `label`: The native label element.
- `file-names`: The file names wrapper.
- `file-selector-button`: The browse button wrapper.
- `prefix`: The prefix wrapper.
- `suffix`: The suffix wrapper.
- `helper-text`: The helper text wrapper.
- `prefixed`: Added to the container and the input when an element that is not hidden is in the prefix slot.
- `suffixed`: Added to the container and the input when an element that is not hidden is in the suffix slot.
- `filled`: Added to the container and the input when the control has a value.
- `labelled`: Added to the container in the material theme when the control has a label.
- `start`: The wrapper of the prefix in the material theme.
- `notch`: The wrapper of the label in the material theme.
- `filler`: The outline segment between the notch and the end in the material theme.
- `end`: The wrapper of the suffix in the material theme.
- `file-parts`: The wrapper of the browse button and the file names.

## CSS custom properties

- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.
