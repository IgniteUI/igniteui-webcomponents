# Select specification

This directory hosts four public components: [`igc-select`](#igc-select), [`igc-select-item`](#igc-select-item),
[`igc-select-group`](#igc-select-group) and [`igc-select-header`](#igc-select-header).

- [Select specification](#select-specification)
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
      - [Groups and headers](#groups-and-headers)
      - [Selection and the display value](#selection-and-the-display-value)
      - [Templating](#templating)
      - [Positioning and open behavior](#positioning-and-open-behavior)
      - [Validation](#validation)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Form integration](#form-integration)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-select](#igc-select)
    - [igc-select-item](#igc-select-item)
    - [igc-select-group](#igc-select-group)
    - [igc-select-header](#igc-select-header)
  - [Test scenarios](#test-scenarios)
    - [DOM](#dom)
    - [Initial selection and navigation](#initial-selection-and-navigation)
    - [Selection integrity](#selection-integrity)
    - [Asynchronously rendered items](#asynchronously-rendered-items)
    - [Type-ahead](#type-ahead)
    - [Display value](#display-value)
    - [Accessibility semantics](#accessibility-semantics)
    - [API tests](#api-tests)
    - [Groups](#groups)
    - [User interactions](#user-interactions)
    - [Events tests](#events-tests)
    - [Scroll strategy tests](#scroll-strategy-tests)
    - [Form integration tests](#form-integration-tests)
    - [Validation message slots](#validation-message-slots)
    - [Host ARIA](#host-aria)
  - [Assumptions and limitations](#assumptions-and-limitations)
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
|       5 | 2026-10-21 | API descriptions aligned with the JSDoc.           |
|       6 | 2026-10-26 | Setting the current `value` again keeps the active item |

## Overview

The `igc-select` provides a menu of options behind an input-like anchor. It renders the currently selected option as
its display value, opens a list of options in the top layer through the internal
[`igc-popover`](../popover/spec.md), and commits a single selection.

Unlike [`igc-dropdown`](../dropdown/spec.md), the select is a form-associated custom element: it submits its value,
resets with the form, and supports `required` and custom validation with declarative message slots.

### Key features

- **Input-like anchor** with a label, a placeholder, prefix and suffix content, a toggle icon and helper text.
- **Single selection** by value or index, with the display value derived from the selected item.
- **Grouping and headers**, with a whole group disabled in one step.
- **Type-ahead**: typing selects the closest matching option, or activates it while the list is open.
- **List templating**: header and footer containers around the list of options.
- **Positioning**: twelve placements, a distance from the anchor, and scroll strategies.
- **Form association and validation**, including declarative validation message slots.

### Acceptance criteria

- The component must render a menu of options and commit a single selection.
- The selected option must drive the display value of the anchor.
- Options must be groupable, with headers, and a group must be disable-able as a whole.
- The list must render above the other elements on the page.
- The component must support type-ahead selection and activation.
- The component must participate in form submission, reset and validation, and render the validation message slots.
- The component must expose full keyboard support both while the list is closed and while it is open.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see the currently selected option without opening the list.
- open the list with the pointer or from the keyboard, and see the options, grouped where that applies.
- move through the options with the arrow keys and with <kbd>Home</kbd> and <kbd>End</kbd>.
- jump to an option by typing the beginning of its text.
- commit a selection with <kbd>Enter</kbd> or a click, and close the list.
- close the list with <kbd>Escape</kbd> without changing the selection.
- see which options are unavailable, and be prevented from selecting them.
- be told when the field is required and left empty.

### Developer stories

As a developer, I expect to be able to:

- bind the control to a form through `name` and read and write its `value`.
- set and clear the selection programmatically, by value and by index.
- group the options and disable a whole group.
- render content before and after the list of options.
- customize the toggle icon for the closed and the open state.
- configure the placement, the distance and the scroll behavior of the list.
- mark the control as required and provide my own validation messages.
- be notified when the selection changes and on each open and close transition.

## Functionality

### End-user experience

[Design hand-off](https://www.figma.com/file/ZGvwW5t9020ZMVC1pLWtg5/Select-All-Themes?node-id=0%3A1)

The anchor renders like an input: a label, the display value or the placeholder, optional prefix and suffix content
and a toggle icon that reflects the open state. Activating it opens the list of options, positioned against the
anchor. The selected option is marked and the active option carries its own state. Selecting commits the value and
closes the list unless `keepOpenOnSelect` is set.

### Developer experience

#### Basic initialization

```html
<igc-select label="Country" name="country">
  <igc-select-item value="bg">Bulgaria</igc-select-item>
  <igc-select-item value="us">United States</igc-select-item>
  <igc-select-item value="jp" disabled>Japan</igc-select-item>
</igc-select>
```

#### Groups and headers

```html
<igc-select label="City">
  <igc-select-header>Europe</igc-select-header>
  <igc-select-group>
    <span slot="label">Bulgaria</span>
    <igc-select-item value="sof">Sofia</igc-select-item>
    <igc-select-item value="plv">Plovdiv</igc-select-item>
  </igc-select-group>
</igc-select>
```

A `disabled` group disables the group item and all of its children.

#### Selection and the display value

```typescript
select.value = 'bg';          // by value
select.select(1);             // by index
select.navigateTo('jp');      // activate without selecting
select.clearSelection();      // reset value and selection

const item = select.selectedItem;
```

An item without an explicit `value` falls back to its text content. The display value of the anchor is rendered from
the selected item, so it can carry rich content while the submitted value stays a plain string.

A new selection also becomes the active item. Setting `value` to the value that the select already has does not
move the active item, so a framework that sets each property on each render keeps the keyboard position in an open
list. A user selection, `select()` and `clearSelection()` move the active item, also when the selection does not
change.

#### Templating

```html
<igc-select label="Country">
  <span slot="header">Pick one</span>
  <igc-icon slot="toggle-icon" name="expand"></igc-icon>
  <igc-icon slot="toggle-icon-expanded" name="collapse"></igc-icon>
  <span slot="footer">Nothing else?</span>
  <span slot="helper-text">Where do you live?</span>
</igc-select>
```

#### Positioning and open behavior

```html
<igc-select placement="top-start" distance="4" keep-open-on-select keep-open-on-outside-click></igc-select>
```

`scrollStrategy` sets what happens while a parent container scrolls: `hide` - the default - hides the list while the
anchor is out of view, `scroll` keeps it anchored, and `close` closes it on each scroll.

#### Validation

```html
<igc-select label="Country" required>
  <span slot="value-missing">Please pick a country</span>
  <igc-select-item value="bg">Bulgaria</igc-select-item>
</igc-select>
```

See the [validation container specification](../validation-container/spec.md) for the message slot mechanism.

#### Labeling from the light DOM

Besides the `label` property, the control can be labelled by a `label` element in the light DOM, through `for` or by
nesting it. An IDREF does not cross a shadow boundary, so the select resolves its labels through `ElementInternals`
and projects them - together with its `role`, `aria-haspopup`, `aria-expanded`, `aria-controls` and
`aria-activedescendant` - onto the native input of the anchor, as element references. Clicking the external label
focuses the control.

The name follows the [naming order](../input/spec.md#naming-order), so the host `aria-labelledby` and `aria-label` also
name the control.

#### Form integration

```html
<form>
  <igc-select name="country" required>
    <igc-select-item value="bg">Bulgaria</igc-select-item>
  </igc-select>
  <button type="submit">Submit</button>
</form>
```

- The value is submitted under `name`.
- A form reset restores `defaultValue`, taken from the `value` attribute.
- An invalid control blocks submission.

As for a native control, a failed submit or `form.reportValidity()` moves the focus to the first invalid control of
the form, and `reportValidity()` moves it to the control when it is invalid. `form.checkValidity()` and
`checkValidity()` do not move the focus. The `invalid` event comes only from these checks and from a failed submit,
not while the user edits the control.

### Localization

The component renders no strings of its own. The label, the placeholder, the option content and the validation
messages come from the application.

### Keyboard interactions

The component must be focused for any of the following to apply.

While the list of options is **not** visible:

| Key combination                              | Result                                       |
| -------------------------------------------- | -------------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd>          | Opens the list of options.                   |
| <kbd>Alt</kbd> + <kbd>Arrow Up/Down</kbd>    | Toggles the list of options.                 |
| <kbd>Arrow Down</kbd> / <kbd>Arrow Right</kbd> | Selects the next option.                   |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Left</kbd>  | Selects the previous option.                 |
| <kbd>Home</kbd> / <kbd>End</kbd>             | Selects the first or the last option.        |

While the list of options **is** visible:

| Key combination                              | Result                                            |
| -------------------------------------------- | ------------------------------------------------- |
| <kbd>Enter</kbd>                             | Selects the active option and closes the list.    |
| <kbd>Alt</kbd> + <kbd>Arrow Up/Down</kbd>    | Toggles the list of options.                      |
| <kbd>Arrow Down</kbd> / <kbd>Arrow Right</kbd> | Activates the next option.                      |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Left</kbd>  | Activates the previous option.                    |
| <kbd>Home</kbd> / <kbd>End</kbd>             | Activates the first or the last option.           |
| <kbd>Escape</kbd>                            | Closes the list without changing the selection.   |

Typing while the component is focused queries the options and selects the closest match; while the list is open the
matching option is activated instead.

## API

### igc-select

#### Properties and attributes

| Property               | Attribute                  | Reflected | Type                                | Default        | Description                                                     |
| ---------------------- | -------------------------- | --------- | ----------------------------------- | -------------- | ---------------------------------------------------------------- |
| value                  | value                      | No        | `string \| undefined`               | -              | The value of the control.                                       |
| open                   | open                       | Yes       | `boolean`                           | false          | Whether the component is open.                                |
| label                  | label                      | No        | `string`                            | -              | The label of the control.                                       |
| placeholder            | placeholder                | No        | `string`                            | -              | The placeholder text of the control.                            |
| outlined               | outlined                   | Yes       | `boolean`                           | false          | Whether the control has an outlined appearance.                 |
| placement              | placement                  | No        | `PopoverPlacement`                  | `bottom-start` | The preferred placement of the dropdown around the input.       |
| distance               | distance                   | No        | `number`                            | 0              | The distance of the dropdown from its input.                    |
| keepOpenOnSelect       | keep-open-on-select        | Yes       | `boolean`                           | false          | Whether the component stays open after the user selects an item.         |
| keepOpenOnOutsideClick | keep-open-on-outside-click | Yes       | `boolean`                           | false          | Whether the component stays open when the user clicks outside of it.     |
| scrollStrategy         | scroll-strategy            | No        | `PopoverScrollStrategy`             | `hide`         | The behavior of the component when a parent container scrolls.  |
| required               | required                   | Yes       | `boolean`                           | false          | Whether the control is required. A required control that has no value, or is not checked, fails validation.            |
| disabled               | disabled                   | Yes       | `boolean`                           | false          | Whether the control is disabled. A disabled control is not validated, and the form does not submit its value.                            |
| invalid                | invalid                    | No        | `boolean`                           | false          | Whether the control shows the invalid state. It changes only the visual state, not the validity.        |
| name                   | name                       | Yes       | `string`                            | -              | The name of the control, submitted with the form data.          |
| autofocus              | autofocus                  | No        | `boolean`                           | false          | Whether the control takes the focus after its first render.     |
| items                  | -                          | No        | `IgcSelectItemComponent[]`          | -              | Read-only. The items of the select component.                   |
| groups                 | -                          | No        | `IgcSelectGroupComponent[]`         | -              | Read-only. The groups of the select component.                  |
| selectedItem           | -                          | No        | `IgcSelectItemComponent \| null`    | `null`         | Read-only. The selected item, or `null`.                        |
| defaultValue           | -                          | No        | `string`                            | -              | The default value of the control. A form reset restores the value to it. While the value is unchanged since the start or the last form reset, a new default also sets the value. The `value` attribute also sets it.     |
| form                   | -                          | No        | `HTMLFormElement \| null`           | -              | Read-only. The form that the control is associated with, or `null`.               |
| validity               | -                          | No        | `ValidityState`                     | -              | Read-only. The validity state of the control.                   |
| validationMessage      | -                          | No        | `string`                            | -              | Read-only. The validation message of the control. It is empty when the control is valid.               |
| willValidate           | -                          | No        | `boolean`                           | -              | Read-only. Whether the element is a candidate for validation.   |

#### Methods

| Name              | Type signature                                              | Description                                                             |
| ----------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| show              | `(): Promise<boolean>`                                      | Opens the component. It does not emit events. The promise resolves to `false` when the component is already open, or when a later call replaces this one.                                                    |
| hide              | `(): Promise<boolean>`                                      | Closes the component. It does not emit events. The promise resolves to `false` when the component is already closed, or when a later call replaces this one.                                                    |
| toggle            | `(): Promise<boolean>`                                      | Opens the component when it is closed, and closes it when it is open. It does not emit events. The promise resolves to `true` when the state changes.                                |
| select            | `(value: string \| number): IgcSelectItemComponent \| null` | Selects the item with the given value or index.                         |
| navigateTo        | `(value: string \| number): IgcSelectItemComponent \| null` | Activates the item with the given value or index.                       |
| clearSelection    | `(): void`                                                  | Resets the current value and selection of the component.                |
| focus             | `(options?: FocusOptions): void`                            | Sets focus on the component.                                            |
| blur              | `(): void`                                                  | Removes focus from the component.                                       |
| checkValidity     | `(): boolean`                                               | Checks validity and emits `invalid` when the control is invalid. Returns `true` when the control is valid.        |
| reportValidity    | `(): boolean`                                               | Checks validity. As for a native control, an invalid control emits `invalid` and takes the focus. It shows its own validation messages, not the message of the browser. Returns `true` when the control is valid. |
| setCustomValidity | `(message: string): void`                                   | Sets a custom validation message. The control is invalid while the message is not empty. An empty string removes the custom error.            |

#### Events

| Name       | Cancellable | Description                                       |
| ---------- | ----------- | ------------------------------------------------- |
| igcChange  | false       | Emitted when the user selects a different item. The detail is the item. |
| igcOpening | true        | Emitted before the user opens the list of options. Cancelable. |
| igcOpened  | false       | Emitted after the list of options opens on a user action. |
| igcClosing | true        | Emitted before the user closes the list of options. Cancelable. |
| igcClosed  | false       | Emitted after the list of options closes on a user action. |

#### Slots

| Name                   | Description                                                                      |
| ---------------------- | --------------------------------------------------------------------------------- |
| (default)              | Renders the list of select items.                                                |
| `prefix`               | Renders content before the input.                                                |
| `suffix`               | Renders content after the input.                                                 |
| `header`               | Renders a container before the list of options.                                  |
| `footer`               | Renders a container after the list of options.                                   |
| `helper-text`          | Renders content below the input.                                                 |
| `toggle-icon`          | Renders content that replaces the default toggle icon.                           |
| `toggle-icon-expanded` | Renders content for the toggle icon when the component is in open state.         |
| `value-missing`        | Renders content when the required validation fails.                              |
| `custom-error`         | Renders content when setCustomValidity(message) is set.                          |
| `invalid`              | Renders content when the component is in invalid state (validity.valid = false). |

#### CSS Shadow parts

| Part          | Description                                            |
| ------------- | ------------------------------------------------------ |
| `base`        | The popup container of the list of options.            |
| `list`        | The list wrapping container for the items of the select. |
| `input`       | The encapsulated input of the select.                  |
| `native-input` | The native input element of the encapsulated input.   |
| `label`       | The encapsulated text label of the select.             |
| `prefix`      | The prefix wrapper of the input of the select.         |
| `suffix`      | The suffix wrapper of the input of the select.         |
| `toggle-icon` | The toggle icon wrapper of the select.                 |
| `filled`      | Added to the toggle-icon part when the select has a value. |
| `helper-text` | The helper text wrapper of the select.                 |

#### CSS custom states

| State        | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `ig-invalid` | Set while the control shows its invalid state, that is while `invalid` returns `true`. |

#### CSS custom properties

| Property                | Description                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ig-helper-min-lines` | The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`. |

### igc-select-item

Represents an item in a select list.

| Property | Attribute | Reflected | Type      | Default | Description                                            |
| -------- | --------- | --------- | --------- | ------- | -------------------------------------------------------- |
| value    | value     | No        | `string`  | -       | The value of the item. Falls back to the text content. |
| selected | selected  | Yes       | `boolean` | false   | Whether the item is selected. It also sets `active` to the same value.                          |
| active   | active    | Yes       | `boolean` | false   | Whether the item is active. The active item is the target of keyboard navigation and the only item in the tab order. |
| disabled | disabled  | Yes       | `boolean` | false   | Whether the item is disabled.                          |

| Slot      | Description                                    |
| --------- | ---------------------------------------------- |
| (default) | Renders all content except the prefix and suffix. |
| `prefix`  | Renders content before the main content area.  |
| `suffix`  | Renders content after the main content area.   |

| Part      | Description                                  |
| --------- | -------------------------------------------- |
| `prefix`  | The prefix wrapper of the select item.       |
| `content` | The main content wrapper of the select item. |
| `suffix`  | The suffix wrapper of the select item.       |

### igc-select-group

A container for a group of select items.

| Property | Attribute | Reflected | Type                            | Default | Description                                            |
| -------- | --------- | --------- | ------------------------------- | ------- | -------------------------------------------------------- |
| disabled | disabled  | Yes       | `boolean`                       | false   | Whether the group and all its children are disabled.   |
| items    | -         | No        | `Array<IgcSelectItemComponent>` | -       | Read-only. All child select items.                     |

| Slot      | Description                          |
| --------- | ------------------------------------ |
| `label`   | Contains the label of the group.     |
| (default) | Renders the items of the group.      |

| Part    | Description               |
| ------- | ------------------------- |
| `label` | The native label element. |

### igc-select-header

Represents a header item in a select component. It renders its default slot and takes no properties.

## Test scenarios

The suite lives in [`select.spec.ts`](./select.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. It reuses `createFormAssociatedTestBed`,
`runValidationContainerTests`, `runExternalLabelAssociationTests`, `runAriaProjectionTests` and the `simulate*`
helpers from [`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### DOM

1. The default structure renders the anchor, the label, the toggle icon and the list.
2. Slotted content - prefix, suffix, header, footer, helper text and the toggle icons - is rendered.
3. `autofocus` focuses the component on the first render.
4. In forced colors, the indigo list has one frame: the border, without the theme outline.

### Initial selection and navigation

5. An item marked `selected` in markup becomes the initial selection.
6. Navigating from an initial selection established through each supported path continues from that item.

### Selection integrity

7. The selection stays consistent across open and close cycles and programmatic changes. Setting the current
   `value` again keeps the active item, while a user commit and `select()` with the selected item move it there. A
   removed active item hands the navigation back to the selected item.
8. Selecting a disabled item is not possible.

### Asynchronously rendered items

9. Items added after the first render are picked up, and a pending value is applied to them.

### Type-ahead

10. Typing while closed selects the closest matching option.
11. Typing while open activates the closest matching option.

### Display value

12. The display value is rendered from the selected item, and falls back to the placeholder when nothing is
    selected.

### Accessibility semantics

13. The anchor, the list, the items and the groups expose their roles and states, and the component passes the
    accessibility audit.

### API tests

14. `show`, `hide` and `toggle` transition the open state.
15. `select` and `navigateTo` work by value and by index and return the item or `null`.
16. `clearSelection` resets the value and the selection.
17. `focus` and `blur` move focus to and from the component, and `reportValidity()` focuses an invalid select.

### Groups

18. Grouped items are reported by the group and by the select.
19. A disabled group disables all of its items.

### User interactions

20. Clicking an item selects it and closes the list, unless `keepOpenOnSelect` is set.
21. Clicking outside closes the list, unless `keepOpenOnOutsideClick` is set.
22. The keyboard interactions behave as specified with the list closed and open.

### Events tests

23. `igcChange` is emitted on a user-driven selection change.
24. `igcOpening` and `igcClosing` are emitted and can be canceled; `igcOpened` and `igcClosed` follow the transition.
25. Issue #1123.

### Scroll strategy tests

26. `hide`, `scroll` and `close` behave as specified while an ancestor scrolls.

### Form integration tests

27. Is form associated, submits its value, and does not submit when it has none.
28. Is correctly reset on form reset, including after a `setAttribute` call.
29. Reflects the disabled state of an ancestor `fieldset`.
30. Fulfils the required and custom constraints.
31. `defaultValue` - correct initial state, submission, reset and validation.

### Validation message slots

Generated by `runValidationContainerTests`.

32. The `value-missing`, `custom-error` and `invalid` slots render for their matching state.

### Host ARIA

33. The shared host description suite: the host `aria-describedby` describes the native control after the helper
    text, and follows a change and a removal.

## Assumptions and limitations

- Only single selection is supported. For multiple selection use [`igc-combo`](../combo/spec.md).
- The anchor is not editable; the value is chosen from the list or set programmatically.
- The submitted value is always a string; an item without an explicit value submits its text content.

## Accessibility

### ARIA roles and properties

- The anchor exposes a `combobox` role with `aria-haspopup`, the expanded state, the relation to the list and the
  active descendant, all projected onto its native input as element references.
- The list of options has a `listbox` role, the items an `option` role with `aria-selected`, and the groups a
  `group` role.
- The disabled state is exposed on the anchor, and disabled items and groups are announced as disabled.
- The helper text and the validation messages are referenced through `aria-describedby`.
- An external light DOM `label` is projected onto the native input of the anchor as an element reference.
- A host `aria-describedby` describes the native control after the helper text, by element reference.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
