# Chip specification

- [Chip specification](#chip-specification)
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
      - [Selection](#selection)
      - [Removal](#removal)
      - [The content slots](#the-content-slots)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Default](#default)
    - [Accessibility tests](#accessibility-tests)
    - [Rendering](#rendering)
    - [Events tests](#events-tests)
    - [Not covered by the suite](#not-covered-by-the-suite)
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

The `igc-chip` is a compact element that lets people enter information, make a selection, filter content or
trigger an action. Several chips are usually shown together, inline, wrapping to the next line when they overflow.

```html
<igc-chip selectable removable variant="success">Filter</igc-chip>
```

### Key features

- **Selectable**, toggling on activation and reporting the change.
- **Removable**, with a dedicated remove control that carries its own label.
- **Style variants**: primary, info, success, warning and danger, plus an outlined look.
- **Rich content** through slots at the start, before, after and at the end of the label, plus the selection and
  the removal indicators.
- **A disabled state** that stops both the selection and the removal.

### Acceptance criteria

- The chip must let people enter information, make selections, filter content or trigger actions.
- It must be interactive and toggle its selection on activation.
- It must be able to hold an icon, a logo or an image alongside its label.
- A chip must be able to render a remove control.
- Several chips must lay out inline and wrap to the next line when they overflow.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- select several chips to narrow down what I am looking at;
- use a chip to trigger an action, such as saving or sharing something;
- turn what I typed into a chip, and remove a chip I no longer want.

### Developer stories

As a developer, I expect to be able to:

- offer a way to enter information, make a selection, filter content or trigger an action;
- build the different kinds of chips — assist, filter, input and suggestion — out of the same element;
- customize the content of a chip, including icons and images;
- be notified when a chip is selected and when it is removed;
- localize the labels of the selection and the removal controls.

## Functionality

### End-user experience

The chip is a slightly rounded container, filled or outlined depending on the background, which toggles its
selection on activation. The wiki page of the component carries no design hand-off link.

### Developer experience

#### Basic initialization

```html
<igc-chip>Label</igc-chip>
<igc-chip variant="danger" outlined>Overdue</igc-chip>
```

#### Selection

`selectable` makes the chip toggle its `selected` state on activation, and `igcSelect` is emitted synchronously
with the new state in its detail, before the selection animation runs. A chip that is `selected` but not
`selectable` keeps its state without the selection affordance.

#### Removal

`removable` renders a remove control inside the chip, which emits `igcRemove` when it is activated. Activating it
does not emit `igcSelect`, and a disabled chip renders no remove control at all. A chip that is not removable does
not intercept the activation keys.

#### The content slots

Beyond the default slot holding the label, content can be placed at the `start` and the `end` of the chip, and as
a `prefix` and a `suffix` around the label. The `select` and `remove` slots override the two indicators.

```html
<igc-chip selectable removable>
  <igc-avatar slot="start" initials="JD"></igc-avatar>
  Jane Doe
  <igc-icon slot="remove" name="close"></igc-icon>
</igc-chip>
```

### Localization

The chip takes its resource strings from the `igniteui-i18n-core` package through the `locale` and
`resourceStrings` properties. Without an explicit `locale`, it falls back to the global locale of the library.

| Key           | Default English value | Used for                                |
| ------------- | --------------------- | --------------------------------------- |
| `chip_remove` | remove chip           | The label of the remove control.         |
| `chip_select` | select chip           | The label of the selection control.      |

### Keyboard interactions

| Keys                                | Context          | Description                                              |
| ----------------------------------- | ---------------- | -------------------------------------------------------- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | anywhere | Moves between the chip and its remove control. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | chip             | Toggles the selection of a selectable chip.               |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | remove control   | Removes the chip.                                         |

## API

### Properties and attributes

| Property          | Attribute    | Reflected | Type                                                                     | Default | Description                                    |
| ----------------- | ------------ | --------- | ------------------------------------------------------------------------ | ------- | ---------------------------------------------- |
| `selectable`      | `selectable` | yes       | `boolean`                                                                | `false` | Whether the chip can be selected.               |
| `selected`        | `selected`   | yes       | `boolean`                                                                | `false` | Whether the chip is selected.                   |
| `removable`       | `removable`  | yes       | `boolean`                                                                | `false` | Whether the chip renders a remove control.      |
| `disabled`        | `disabled`   | yes       | `boolean`                                                                | `false` | Whether the chip is disabled.                   |
| `outlined`        | `outlined`   | yes       | `boolean`                                                                | `false` | Whether the chip is outlined.                   |
| `variant`         | `variant`    | yes       | `"primary" \| "info" \| "success" \| "warning" \| "danger" \| undefined` | —       | The color variant of the chip.                  |
| `locale`          | `locale`     | no        | `string`                                                                 | —       | The locale of the resource strings.             |
| `resourceStrings` | —            | —         | `IChipResourceStrings`                                                   | —       | The resource strings of the component.          |

### Methods

None applicable.

### Events

| Event       | Detail    | Cancelable | Description                                   |
| ----------- | --------- | ---------- | --------------------------------------------- |
| `igcSelect` | `boolean` | no         | The chip was selected or deselected.          |
| `igcRemove` | —         | no         | The remove control of the chip was activated. |

The detail of `igcSelect` is the new `selected` state of the chip.

### Slots

| Name     | Description                                                  |
| -------- | ------------------------------------------------------------ |
| default  | The label of the chip.                                        |
| `start`  | Content at the start of the chip, before the prefix.           |
| `prefix` | Content before the label.                                      |
| `suffix` | Content after the label.                                      |
| `end`    | Content at the end of the chip, after the suffix.              |
| `select` | The indicator rendered while the chip is selected.             |
| `remove` | The content of the remove control.                             |

### CSS Shadow parts

| Part      | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `base`    | The wrapper of the chip.                                           |
| `action`  | The selection control, wrapping the content of the chip.            |
| `content` | The wrapper around the default slot.                                |
| `prefix`  | The prefix container.                                               |
| `suffix`  | The suffix container.                                               |
| `remove`  | The container of the remove control.                                |

## Test scenarios

| Suite  | File          |
| ------ | ------------- |
| `Chip` | `chip.spec.ts` |

### Default

1. The component passes the accessibility audit and is initialized with its default values.
2. The `variant`, `disabled`, `outlined`, `selectable`, `removable` and `selected` properties are applied.

### Accessibility tests

3. The chip passes the accessibility audit in every interactive state.
4. The remove control is kept outside the action control, so the two are separate targets.
5. The state icon does not leak into the accessible name of the chip.
6. The selection state is exposed through `aria-pressed`.

### Rendering

7. The prefix stays hidden for a chip that is selected but not selectable.
8. The suffix stays hidden when only the remove control is rendered.
9. A disabled chip renders no remove control.

### Events tests

10. `igcRemove` is emitted when the remove control is activated, and `igcSelect` is not.
11. A chip that is not removable does not intercept the activation keys.
12. `igcSelect` is emitted from the action control.

### Not covered by the suite

- The `start`, `end` and `select` slots are not covered.
- The `locale` and `resourceStrings` properties are not covered; the labels are asserted against their English
  defaults.

## Assumptions and limitations

- The chip does not lay itself out; placing several chips inline and wrapping them is the job of their container.
- A chip is not form associated and submits nothing; its selection is read from the `selected` property.
- `igcSelect` and `igcRemove` are notifications and cannot be canceled, so removal has to be carried out by the
  application.
- The chip does not remove itself from the DOM when its remove control is activated.
- A `selected` chip that is not `selectable` keeps the state but offers no affordance to change it.

## Accessibility

### ARIA roles and properties

- The action control of a selectable chip exposes its state through `aria-pressed`.
- The remove control is a button with a localized label, rendered outside the action control so that the two are
  separate targets for both the pointer and assistive technology.
- The selection indicator is kept out of the accessible name, so that the name is the label of the chip alone.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
