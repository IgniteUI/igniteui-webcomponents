# File input specification

- [File input specification](#file-input-specification)
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
      - [Restricting and multiplying the selection](#restricting-and-multiplying-the-selection)
      - [Selecting a folder](#selecting-a-folder)
      - [Reading the selected files](#reading-the-selected-files)
      - [Customizing the button and the empty text](#customizing-the-button-and-the-empty-text)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Validation](#validation)
      - [Form integration](#form-integration)
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
    - [Properties](#properties)
    - [File type layout](#file-type-layout)
    - [Events](#events-1)
    - [Form integration](#form-integration-1)
    - [Validation message slots](#validation-message-slots)
    - [External label association](#external-label-association)
    - [Host ARIA](#host-aria)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Known limitations](#known-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                              |
| ------: | ---------- | -------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                              |
|       2 | 2026-09-24 | Describe the naming order and the host ARIA naming |
|       3 | 2026-10-02 | Focus after form checks; `invalid` only on checks  |
|       4 | 2026-10-02 | Forward the host `aria-describedby`                |
|       5 | 2026-10-20 | Add `directory`; a label click opens the picker    |
|       6 | 2026-10-20 | `value = ''` also clears the form value            |
|       7 | 2026-10-21 | API descriptions aligned with the JSDoc.           |
|       8 | 2026-10-23 | The file input makes a stacking context, so the z-index of the input and the container does not compete with the layers of the page |

## Overview

The `igc-file-input` component provides an interactive way for end-users to select files for upload. It builds on the
same input shell as [`igc-input`](../input/spec.md) - label, prefix, suffix, helper text, theming and validation
messages - and replaces the editable area with a browse button and the list of selected file names.

The component is form-associated and submits the selected `FileList` with the form.

### Key features

- **Single or multiple selection**, through the `multiple` property.
- **Type filtering**, through the `accept` property.
- **Folder selection**, through the `directory` property. The selection holds every file in the folder and its
  subfolders.
- **File names display**: the names of the selected files are rendered inside the field, and a localized
  "No file chosen" text is shown when the selection is empty.
- **Customizable chrome**: the browse button text and the empty-selection text can be replaced through slots.
- **Cancel awareness**: an `igcCancel` event is emitted when the end-user dismisses the file picker dialog.
- **Localization**: the built-in button and placeholder strings resolve through the library resource strings.
- **Validation**: supports the `required` constraint and custom errors, with declarative message slots.

### Acceptance criteria

- The component must render a native file input and a button that opens the platform file picker.
- It must display the names of the selected files, or a placeholder text when no file is selected.
- It must support restricting the selection by file type and allowing more than one file.
- It must support selecting a folder, and keep the path of each file relative to that folder.
- It must expose the selected files as a `FileList`.
- It must emit a change event when the selection changes, and a cancel event when the picker is dismissed.
- The `value` property must be read-only, mirroring the native file input, and accept only an empty string to clear.
- It must participate in form submission, reset and validation as a form-associated custom element.
- The built-in texts must be localizable and overridable through slots.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and fully keyboard operable.
- The component must support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- select files from my device, so I can upload them to the application.
- see which files I have selected.
- select several files at once when the application allows it.
- select a folder, so I can upload all of its files at once.
- see a clear focus indicator, so I know that the file field is focused.
- read a label, so I can identify what the field is for.
- read helper text and validation messages about my selection.
- see that the field is required before I try to submit the form.
- dismiss the file picker without changing my previous selection.

### Developer stories

As a developer, I expect to be able to:

- add a file input, so end-users can upload files in my application.
- set a **name**, so the field is identifiable in the form data.
- set **multiple**, so end-users can select more than one file.
- set **accept**, so the selection is restricted to the file types I support.
- set **directory**, so end-users can select a folder, and I can rebuild its structure from the relative paths.
- set **required**, so the field becomes mandatory.
- set the field as **disabled**, so it cannot be interacted with.
- access the selected **files**, so I can process or upload them.
- set **autofocus**, so the field is focused on initial page load.
- add a **label**, a **placeholder**, **prefix**/**suffix** content and **helper text**.
- customize the browse button text and the "no file chosen" text through slots.
- handle the case where the end-user cancels the file selection dialog.
- clear the selection programmatically.

## Functionality

### End-user experience

[Design hand-off - validation slots](https://www.figma.com/design/IZce3C3yRofmIqPzq634uQ/Input-Group%2C-Checkbox%2C-Radio%3A-validation-proposal?m=auto&node-id=2043-3&t=GExqKFPDIGlTcEs2-1)

The control renders as a single-line field containing a flat button and, next to it, the names of the currently
selected files. Activating the button - by click or from the keyboard - opens the platform file picker. After a
selection is made, the field shows the file names, comma-separated; a file with no name is listed as `unnamed`.
When nothing is selected, the field shows the placeholder text, which defaults to the localized "No file chosen".
After a folder selection, the field shows the name of the folder, not the names of its files.

Dismissing the picker without choosing a file leaves the previous selection intact and marks the control as touched,
so a required field that is still empty shows its error message.

### Developer experience

#### Basic initialization

```html
<igc-file-input label="Attachment" name="attachment"></igc-file-input>
```

#### Restricting and multiplying the selection

```html
<igc-file-input label="Images" accept="image/png, image/jpeg" multiple></igc-file-input>
```

#### Selecting a folder

```html
<igc-file-input label="Photo folder" directory></igc-file-input>
```

```ts
input.addEventListener('igcChange', ({ detail }) => {
  for (const file of detail) {
    // "photos/2025/beach.jpg"
    console.log(file.webkitRelativePath);
  }
});
```

- The platform picker selects a folder instead of files. The selection is flat: one `File` for each file in the
  folder and its subfolders. The `webkitRelativePath` of each file starts with the name of the selected folder.
- `accept` does not filter the files of a folder, so check their types in the `igcChange` handler.
- A folder with no files gives an empty selection and an `igcChange` event.
- The form value holds the same `File` objects as the native input, so a multipart form submission sends the same
  file names. In Chromium, the file name is the relative path.

#### Reading the selected files

```ts
const input = document.querySelector('igc-file-input')!;

input.addEventListener('igcChange', ({ detail }) => {
  for (const file of detail) {
    console.log(file.name, file.size);
  }
});

// Equivalent, at any time:
const files = input.files;

// Clearing the selection:
input.value = '';
```

`value` mirrors the native file input: it returns the name of the first selected file and it can only be assigned an
empty string, which clears the selection and the form value, and updates the validity. Any other assignment is
ignored.

#### Customizing the button and the empty text

```html
<igc-file-input label="Attachment">
  <span slot="file-selector-text">Choose a file</span>
  <span slot="file-missing-text">Nothing selected yet</span>
</igc-file-input>
```

#### Labeling from the light DOM

Besides the `label` property, the control can be labelled by a `label` element in the light DOM, either through
`for` or by nesting it:

```html
<label for="external">External label</label>
<igc-file-input id="external"></igc-file-input>

<label>
  External label
  <igc-file-input></igc-file-input>
</label>
```

An IDREF does not cross a shadow boundary, so the association cannot be expressed with an `aria-labelledby`
attribute on the inner native editor. The component resolves its labels through `ElementInternals` and projects them
onto the editor as **element references** (`ariaLabelledByElements`), which do resolve into ancestor tree scopes.
Clicking the external label focuses the native input and opens the file picker, as for a native file input.

Because a reflected relation blanks its content attribute, assert such a relation by identity
(`input.ariaLabelledByElements[0] === label`) rather than by reading the attribute.

The name follows the [naming order](../input/spec.md#naming-order), so the host `aria-labelledby` and `aria-label` also
name the control.

#### Validation

```html
<igc-file-input label="Attachment" required>
  <span slot="helper-text">PDF documents only</span>
  <span slot="value-missing">Please attach a document</span>
</igc-file-input>
```

The component applies the `required` validator, and supports custom errors through `setCustomValidity`. See the
[validation container specification](../validation-container/spec.md) for the full mechanism.

#### Form integration

```html
<form enctype="multipart/form-data">
  <igc-file-input name="attachment" label="Attachment" required></igc-file-input>
  <button type="submit">Upload</button>
</form>
```

- The selected `FileList` is submitted under `name`.
- A file input has no default selection, so a form reset always clears it. The `value` attribute never contributes a
  default value.
- A disabled control does not submit a value.

As for a native control, a failed submit or `form.reportValidity()` moves the focus to the first invalid control of
the form, and `reportValidity()` moves it to the control when it is invalid. `form.checkValidity()` and
`checkValidity()` do not move the focus. The `invalid` event comes only from these checks and from a failed submit,
not while the user edits the control.

### Localization

The component renders two built-in strings, resolved through the library i18n mechanism:

| Resource string             | Default value    | Usage                                       |
| --------------------------- | ---------------- | ------------------------------------------- |
| `file_input_upload_button`  | `Browse`         | The label of the browse button.             |
| `file_input_placeholder`    | `No file chosen` | Shown when no file is selected.             |

Both can be overridden per instance through the `locale` and `resourceStrings` properties, or replaced entirely with
the `file-selector-text` and `file-missing-text` slots. A `placeholder` value takes precedence over the localized
empty text.

### Keyboard interactions

The component delegates focus to the inner native file input.

| Key combination                     | Result                                          |
| ----------------------------------- | ----------------------------------------------- |
| <kbd>Tab</kbd>                      | Moves focus to the control, and away from it.   |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Opens the platform file picker dialog.          |

The browse button is excluded from the tab order, so the control is a single tab stop.

## API

### Properties and attributes

| Property          | Attribute    | Reflected | Type                        | Default | Description                                                                          |
| ----------------- | ------------ | --------- | --------------------------- | ------- | ------------------------------------------------------------------------------------ |
| value             | value        | No        | `string`                    | `''`    | The value of the control: the name of the first selected file, as the native file input gives it. As for the native file input, only an empty string can be set. It clears the selection. |
| files             | -            | No        | `FileList`                  | -       | Read-only. The list of selected files.                                               |
| multiple          | multiple     | Yes       | `boolean`                   | false   | Whether the control allows the user to select more than one file.                    |
| accept            | accept       | No        | `string`                    | `''`    | The file types the control accepts, as a comma-separated list.                       |
| directory         | directory    | No        | `boolean`                   | false   | Whether the user selects a folder instead of files. The selection then holds every file in the folder and its subfolders, and the `webkitRelativePath` of each file gives its path from the folder. |
| label             | label        | No        | `string`                    | -       | The label for the control.                                                           |
| placeholder       | placeholder  | No        | `string`                    | -       | The text shown when no file is chosen.                                               |
| outlined          | outlined     | Yes       | `boolean`                   | false   | Whether the control has an outlined appearance.                                      |
| required          | required     | Yes       | `boolean`                   | false   | Whether the control is required. A required control that has no value, or is not checked, fails validation.                                 |
| disabled          | disabled     | Yes       | `boolean`                   | false   | Whether the control is disabled. A disabled control is not validated, and the form does not submit its value.                                                 |
| invalid           | invalid      | No        | `boolean`                   | false   | Whether the control shows the invalid state. It changes only the visual state, not the validity.                             |
| name              | name         | Yes       | `string`                    | -       | The name of the control, submitted with the form data.                               |
| autofocus         | autofocus    | No        | `boolean`                   | false   | Whether the control receives focus automatically.                                    |
| locale            | locale       | No        | `string`                    | -       | The locale for the resource strings. Falls back to the inherited locale, then the global one.                |
| resourceStrings   | -            | No        | `IFileInputResourceStrings` | EN      | The texts of the component. The strings that you set replace the strings of the current locale. Reading returns all the strings, with your strings over the locale strings.                                               |
| form              | -            | No        | `HTMLFormElement \| null`   | -       | Read-only. The form that the control is associated with, or `null`.                                    |
| validity          | -            | No        | `ValidityState`             | -       | Read-only. The validity state of the control.                                        |
| validationMessage | -            | No        | `string`                    | -       | Read-only. The validation message of the control. It is empty when the control is valid.                                    |
| willValidate      | -            | No        | `boolean`                   | -       | Read-only. Whether the control is a candidate for constraint validation.             |

### Methods

| Name              | Type signature                   | Description                                                             |
| ----------------- | -------------------------------- | ----------------------------------------------------------------------- |
| focus             | `(options?: FocusOptions): void` | Sets focus on the control.                                              |
| blur              | `(): void`                       | Removes focus from the control.                                         |
| checkValidity     | `(): boolean`                    | Checks validity and emits `invalid` when the control is invalid. Returns `true` when the control is valid.        |
| reportValidity    | `(): boolean`                    | Checks validity. As for a native control, an invalid control emits `invalid` and takes the focus. It shows its own validation messages, not the message of the browser. Returns `true` when the control is valid. |
| setCustomValidity | `(message: string): void`        | Sets a custom validation message. The control is invalid while the message is not empty. An empty string removes the custom error.            |

### Events

| Name      | Cancellable | Detail     | Description                                                 |
| --------- | ----------- | ---------- | ----------------------------------------------------------- |
| igcChange | false       | `FileList` | Emitted when the selection of the control changes.          |
| igcCancel | false       | `FileList` | Emitted when the file picker dialog of the control is canceled. |

### Slots

| Name                 | Description                                                                      |
| -------------------- | --------------------------------------------------------------------------------- |
| `prefix`             | Renders content before the input.                                                |
| `suffix`             | Renders content after the input.                                                 |
| `helper-text`        | Renders content below the input.                                                 |
| `file-selector-text` | Renders content for the browse button.                                           |
| `file-missing-text`  | Renders content when no file is chosen.                                          |
| `value-missing`      | Renders content when the required validation fails.                              |
| `custom-error`       | Renders content when a custom message is set with `setCustomValidity()`.         |
| `invalid`            | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

| Part                   | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `container`            | The main wrapper that holds all main input elements. |
| `input`                | The native input element.                            |
| `label`                | The native label element.                            |
| `file-names`           | The file names wrapper.                              |
| `file-selector-button` | The browse button wrapper.                           |
| `prefix`               | The prefix wrapper.                                  |
| `suffix`               | The suffix wrapper.                                  |
| `helper-text`          | The helper text wrapper.                             |
| `prefixed`             | Added to the container and the input when an element that is not hidden is in the prefix slot. |
| `suffixed`             | Added to the container and the input when an element that is not hidden is in the suffix slot. |
| `filled`               | Added to the container and the input when the control has a value. |
| `labelled`             | Added to the container in the material theme when the control has a label. |
| `start`                | The wrapper of the prefix in the material theme.     |
| `notch`                | The wrapper of the label in the material theme.      |
| `filler`               | The outline segment between the notch and the end in the material theme. |
| `end`                  | The wrapper of the suffix in the material theme.     |
| `file-parts`           | The wrapper of the browse button and the file names. |

### CSS custom states

| State        | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `ig-invalid` | Set while the control shows its invalid state, that is while `invalid` returns `true`. |

### CSS custom properties

| Property                | Description                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ig-helper-min-lines` | The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`. |

## Test scenarios

The suite lives in [`file-input.spec.ts`](./file-input.spec.ts). It runs in a real browser through `@web/test-runner`, with
`@open-wc/testing` fixtures and assertions, and it reuses the shared harness in
[`src/internals/testing`](../../internals/testing):

| Shared helper | What it contributes |
| ------------- | ------------------- |
| `createFormAssociatedTestBed` | A `form` fixture around the control, exposing `formData`, `submit`, `reset` and `valid`. |
| `runValidationContainerTests` | Generated cases asserting that each validation slot renders for its failing constraint. |
| `runExternalLabelAssociationTests` | External `label` association through `for`, by nesting and after the first render, click-to-focus, an axe audit, and the host ARIA naming. |
| `simulateFileUpload` | Assigns a `FileList` to the native input and fires the matching events. |
| `ValidityHelpers` | Assertions for validity, invalid styling and validation slot presence and content. |

The groups below mirror the `describe` blocks of the suite.

### Properties

1. Sets the `multiple` property.
2. Sets the `accept` property.
3. Sets the `directory` property on the native input, from the property and from the attribute.
4. Returns the uploaded files through `files`.
5. Shows the placeholder text when no file is selected.
6. Shows the folder name, not the file names, for a folder selection, and keeps the `webkitRelativePath` of each file.
7. Resets the file selection when an empty string is assigned to `value`.

### File type layout

8. Renders the publicly documented parts - the browse button and the file names wrapper.
9. Renders the slotted `file-selector-text` and `file-missing-text` contents.
10. Truncates overflowing file names with an ellipsis instead of growing the control, in each of the four themes.

### Events

11. Emits `igcChange` when a file is selected.
12. Emits `igcCancel` when the picker dialog is dismissed.
13. Updates the invalid visual state on blur once the control has been interacted with.

### Form integration

Driven by `createFormAssociatedTestBed`.

14. Correct initial state.
15. Is form associated.
16. Is not associated on submit when no file is selected.
17. Is associated on submit once files are selected.
18. Is correctly reset on form reset.
19. Clears the form value and the validity when an empty string is assigned to `value`.
20. Ignores the `value` attribute as a default on form reset.
21. Reflects the disabled state of an ancestor `fieldset`.
22. Fulfils the required constraint.

### Validation message slots

Generated by `runValidationContainerTests`.

23. `value-missing` with `required`.
24. `custom-error` after `setCustomValidity`.

### External label association

Generated by `runExternalLabelAssociationTests`.

25. An external `label` bound through `for`, and a `label` wrapping the host, are projected onto the native input as
    `ariaLabelledByElements`, and clicking it focuses the control. A `label` added after the first render names the
    control from the first focus, an axe audit passes with only an external `label`, and the host `aria-labelledby` and
    `aria-label` follow the [naming order](../input/spec.md#naming-order).

### Host ARIA

26. The shared host description suite: the host `aria-describedby` describes the native control after the helper
    text, and follows a change and a removal.

### Not covered by the suite

The focus after the form checks and the `invalid` event rules come from the form-associated mixin. The
[input suite](../input/spec.md#form-validity-checks) covers them.

The specs build folder files with a test helper, so the suite does not check a real folder selection or the multipart
file names. A Chromium 156 probe confirmed that the multipart file name of each file is its relative path, both for a native input and for the
form value of the component.

The following documented behaviors have no dedicated case yet: the `locale` and `resourceStrings` localization
properties, the `outlined` and `autofocus` properties, and an axe audit of the component.
## Known limitations

- The selected files cannot be set programmatically. This follows the native file input, which only allows the
  end-user to change the selection; the control can only be cleared.
- File contents are not read or previewed by the component; the application decides what to do with the `FileList`.
- Chrome for Android before 132 and Safari on iOS before 18.4 do not support a folder selection, and Firefox for
  Android 141 gives an empty `webkitRelativePath`. When a browser gives no relative paths, the control shows the file
  names.
- Server-rendered markup does not put the native input in folder mode. The mode applies after hydration.

## Accessibility

### ARIA roles and properties

- The encapsulated native file `input` is the focusable and interactive element; the host delegates focus to it.
- The `label` attribute renders a native `label` element bound to the input, which provides an accessible name.
- An external `label` in the light DOM, associated through `for` or by nesting, is resolved through
  `ElementInternals` and projected onto the native input as an element reference. Clicking that label focuses the
  control and opens the file picker, as for a native file input.
- The browse button is a presentational affordance with `tabindex="-1"`, so it never becomes a second tab stop; the
  native input remains the single accessible control.
- The helper text and the validation messages are referenced through `aria-describedby`.
- A host `aria-describedby` describes the native control after the helper text, by element reference.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The browse button and the
file names follow the inline direction.
