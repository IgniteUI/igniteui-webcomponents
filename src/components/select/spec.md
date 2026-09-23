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
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

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
| open                   | open                       | Yes       | `boolean`                           | false          | The open state of the component.                                |
| label                  | label                      | No        | `string`                            | -              | The label of the control.                                       |
| placeholder            | placeholder                | No        | `string`                            | -              | The placeholder text of the control.                            |
| outlined               | outlined                   | Yes       | `boolean`                           | false          | Whether the control has an outlined appearance.                 |
| placement              | placement                  | No        | `PopoverPlacement`                  | `bottom-start` | The preferred placement of the dropdown around the input.       |
| distance               | distance                   | No        | `number`                            | 0              | The distance of the dropdown from its input.                    |
| keepOpenOnSelect       | keep-open-on-select        | Yes       | `boolean`                           | false          | Keeps the dropdown open after the user selects an item.         |
| keepOpenOnOutsideClick | keep-open-on-outside-click | Yes       | `boolean`                           | false          | Keeps the dropdown open when the user clicks outside of it.     |
| scrollStrategy         | scroll-strategy            | No        | `PopoverScrollStrategy`             | `hide`         | The behavior of the component when a parent container scrolls.  |
| required               | required                   | Yes       | `boolean`                           | false          | Makes the component a required field for validation.            |
| disabled               | disabled                   | Yes       | `boolean`                           | false          | The disabled state of the component.                            |
| invalid                | invalid                    | No        | `boolean`                           | false          | Sets the control into invalid state (visual state only).        |
| name                   | name                       | Yes       | `string`                            | -              | The name of the control, submitted with the form data.          |
| autofocus              | autofocus                  | No        | `boolean`                           | false          | Whether the control should receive focus automatically.         |
| items                  | -                          | No        | `IgcSelectItemComponent[]`          | -              | Read-only. The items of the select component.                   |
| groups                 | -                          | No        | `IgcSelectGroupComponent[]`         | -              | Read-only. The groups of the select component.                  |
| selectedItem           | -                          | No        | `IgcSelectItemComponent \| null`    | `null`         | Read-only. The selected item, or `null`.                        |
| defaultValue           | -                          | No        | `string`                            | -              | The initial value of the control, restored on a form reset.     |
| form                   | -                          | No        | `HTMLFormElement \| null`           | -              | Read-only. The form associated with this element.               |
| validity               | -                          | No        | `ValidityState`                     | -              | Read-only. The validity state of the element.                   |
| validationMessage      | -                          | No        | `string`                            | -              | Read-only. The validation message of the element.               |
| willValidate           | -                          | No        | `boolean`                           | -              | Read-only. Whether the element is a candidate for validation.   |

#### Methods

| Name              | Type signature                                                 | Description                                                      |
| ----------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| show              | `(): Promise<boolean>`                                         | Shows the component.                                             |
| hide              | `(): Promise<boolean>`                                         | Hides the component.                                             |
| toggle            | `(): Promise<boolean>`                                         | Toggles the open state of the component.                         |
| select            | `(value: string \| number): IgcSelectItemComponent \| null`    | Selects the item with the given value or index.                  |
| navigateTo        | `(value: string \| number): IgcSelectItemComponent \| null`    | Activates the item with the given value or index.                |
| clearSelection    | `(): void`                                                     | Resets the current value and selection of the component.         |
| focus             | `(options?: FocusOptions): void`                               | Sets focus on the component.                                     |
| blur              | `(): void`                                                     | Removes focus from the component.                                |
| checkValidity     | `(): boolean`                                                  | Checks validity and emits `invalid` when the control is invalid. |
| reportValidity    | `(): boolean`                                                  | Checks the validity and moves focus to the control when invalid. |
| setCustomValidity | `(message: string): void`                                      | Sets a custom message. Invalid while `message` is not empty.     |

#### Events

| Name       | Cancellable | Description                                       |
| ---------- | ----------- | ------------------------------------------------- |
| igcChange  | false       | Emitted when the selection of the control changes. |
| igcOpening | true        | Emitted just before the list of options is opened. |
| igcOpened  | false       | Emitted after the list of options is opened.      |
| igcClosing | true        | Emitted just before the list of options is closed. |
| igcClosed  | false       | Emitted after the list of options is closed.      |

#### Slots

| Name                   | Description                                                                      |
| ---------------------- | --------------------------------------------------------------------------------- |
| (default)              | Renders the list of select items.                                                |
| `prefix`               | Renders content before the input.                                                |
| `suffix`               | Renders content after input.                                                     |
| `header`               | Renders a container before the list of options.                                  |
| `footer`               | Renders a container after the list of options.                                   |
| `helper-text`          | Renders content below the input.                                                 |
| `toggle-icon`          | Renders content inside the suffix container.                                     |
| `toggle-icon-expanded` | Renders content for the toggle icon when the component is in open state.         |
| `value-missing`        | Renders content when the required validation fails.                              |
| `custom-error`         | Renders content when setCustomValidity(message) is set.                          |
| `invalid`              | Renders content when the component is in invalid state (validity.valid = false). |

#### CSS Shadow parts

| Part          | Description                                            |
| ------------- | ------------------------------------------------------ |
| `list`        | The list wrapping container for the items of the select. |
| `input`       | The encapsulated input of the select.                  |
| `label`       | The encapsulated text label of the select.             |
| `prefix`      | The prefix wrapper of the input of the select.         |
| `suffix`      | The suffix wrapper of the input of the select.         |
| `toggle-icon` | The toggle icon wrapper of the select.                 |
| `helper-text` | The helper text wrapper of the select.                 |

### igc-select-item

Represents an item in a select list.

| Property | Attribute | Reflected | Type      | Default | Description                                            |
| -------- | --------- | --------- | --------- | ------- | -------------------------------------------------------- |
| value    | value     | No        | `string`  | -       | The value of the item. Falls back to the text content. |
| selected | selected  | Yes       | `boolean` | false   | Whether the item is selected.                          |
| active   | active    | Yes       | `boolean` | false   | Whether the item is active.                            |
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
| (default) | The items belonging to this group.   |

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

### Initial selection and navigation

4. An item marked `selected` in markup becomes the initial selection.
5. Navigating from an initial selection established through each supported path continues from that item.

### Selection integrity

6. The selection stays consistent across open and close cycles and programmatic changes.
7. Selecting a disabled item is not possible.

### Asynchronously rendered items

8. Items added after the first render are picked up, and a pending value is applied to them.

### Type-ahead

9. Typing while closed selects the closest matching option.
10. Typing while open activates the closest matching option.

### Display value

11. The display value is rendered from the selected item, and falls back to the placeholder when nothing is
    selected.

### Accessibility semantics

12. The anchor, the list, the items and the groups expose their roles and states, and the component passes the
    accessibility audit.

### API tests

13. `show`, `hide` and `toggle` transition the open state.
14. `select` and `navigateTo` work by value and by index and return the item or `null`.
15. `clearSelection` resets the value and the selection.
16. `focus` and `blur` move focus to and from the component.

### Groups

17. Grouped items are reported by the group and by the select.
18. A disabled group disables all of its items.

### User interactions

19. Clicking an item selects it and closes the list, unless `keepOpenOnSelect` is set.
20. Clicking outside closes the list, unless `keepOpenOnOutsideClick` is set.
21. The keyboard interactions behave as specified with the list closed and open.

### Events tests

22. `igcChange` is emitted on a user-driven selection change.
23. `igcOpening` and `igcClosing` are emitted and can be canceled; `igcOpened` and `igcClosed` follow the transition.
24. Issue #1123.

### Scroll strategy tests

25. `hide`, `scroll` and `close` behave as specified while an ancestor scrolls.

### Form integration tests

26. Is form associated, submits its value, and does not submit when it has none.
27. Is correctly reset on form reset, including after a `setAttribute` call.
28. Reflects the disabled state of an ancestor `fieldset`.
29. Fulfils the required and custom constraints.
30. `defaultValue` - correct initial state, submission, reset and validation.

### Validation message slots

Generated by `runValidationContainerTests`.

31. The `value-missing`, `custom-error` and `invalid` slots render for their matching state.

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

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
