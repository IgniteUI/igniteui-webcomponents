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
      - [Selection animation](#selection-animation)
      - [Removal](#removal)
      - [Focus](#focus)
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
    - [Defaults and properties](#defaults-and-properties)
    - [Accessibility tests](#accessibility-tests)
    - [Rendering](#rendering)
    - [Selection animation](#selection-animation-1)
    - [Events tests](#events-tests)
    - [Focus tests](#focus-tests)
    - [Host ARIA](#host-aria)
    - [Hidden ancestor](#hidden-ancestor)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                   |
| ------: | ---------- | ----------------------------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                                                   |
|       2 | 2026-10-01 | Delegate the focus                                                      |
|       3 | 2026-10-02 | Forward the host `aria-label`, `aria-labelledby` and `aria-describedby` |
|       4 | 2026-10-21 | API descriptions aligned with the JSDoc.                                |
|       5 | 2026-11-02 | A `focus()` call before the first render applies after the render; `focus()` and `blur()` in the API |
|       6 | 2026-11-06 | Forward the host `aria-expanded`, `aria-haspopup` and `aria-controls`   |
|       7 | 2026-11-18 | Animate a selection change by the user; a change from code shows at once or joins the running animation of the user |
|       8 | 2026-11-20 | While a change from code shows at once, all the transitions of the chip stop, also on slotted elements and over the transitions that the app sets on parts, not only those of the base and the indicator |
|       9 | 2026-11-25 | The first render shows the slotted content |
|      10 | 2026-11-27 | The `Default` test scenarios are `Defaults and properties`, as their `describe` block |

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

#### Selection animation

A selection change by the user animates the chip, as in Ignite UI for Angular:

- The `color`, `background-color`, `border-color` and `box-shadow` of the `base` part change over 0.2 s with the
  ease-in-out-quad easing (`cubic-bezier(0.455, 0.03, 0.515, 0.955)`). The hover and focus colors change the same
  way.
- On selection, the selection indicator opens to its own width over 0.12 s, then fades in over 0.12 s, 0.06 s
  later. A gap to `start` or `prefix` content opens with it.
- On deselection, the indicator fades out over 0.12 s, then closes over 0.12 s, 0.06 s later. It stays rendered
  until its exit ends. A new selection during the exit reverses it.
- The default icon and the content of the `select` slot animate the same way.

A change from code shows at once. This applies to `selected`, `selectable`, `variant`, `outlined` and `disabled`, and
to the first render. So a chip that a virtualized list reuses while it scrolls does not animate. Only a selection by
the user plays the indicator entry, so a selected chip that moves in the DOM or shows again after `display: none` does
not. The transitions turn back on in the first frame with no change from code, so the first hover or focus after the
change fades. A change from code while a selection by the user animates joins that animation, so a framework that
renders in response to `igcSelect` does not cut it. Ignite UI for Angular also animates a change from code. With
`prefers-reduced-motion: reduce`, the chip does not animate.

#### Removal

`removable` renders a remove control inside the chip, which emits `igcRemove` when it is activated. Activating it
does not emit `igcSelect`, and a disabled chip renders no remove control at all. A chip that is not removable does
not intercept the activation keys.

#### Focus

The chip delegates the focus to its action control, so `focus()` and `blur()` work on the host, and the host
matches `:focus` while the action control has the focus. A disabled chip takes no focus. A `focus()` call before
the first render applies after the render. After a removal, the chip that had the focus is gone, so the application
moves the focus, for example to the next chip with `focus()`.

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

The chip takes its resource strings from the `igniteui-i18n-core` package through the `locale` and `resourceStrings`
properties. Without an explicit `locale`, it takes its own `lang`, else the locale of the nearest ancestor that has a
`locale` (a component) or a `lang`, and then the global locale of the library.

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
| `removable`       | `removable`  | yes       | `boolean`                                                                | `false` | Whether the chip shows a remove control. A disabled chip hides it. |
| `disabled`        | `disabled`   | yes       | `boolean`                                                                | `false` | Whether the chip is disabled.                   |
| `outlined`        | `outlined`   | yes       | `boolean`                                                                | `false` | Whether the chip is outlined.                   |
| `variant`         | `variant`    | yes       | `"primary" \| "info" \| "success" \| "warning" \| "danger" \| undefined` | —       | The color variant of the chip.                  |
| `locale`          | `locale`     | no        | `string`                                                                 | —       | The locale of the resource strings.             |
| `resourceStrings` | —            | —         | `IChipResourceStrings`                                                   | —       | The resource strings of the component.          |

### Methods

| Name  | Type signature                   | Description                  |
| ----- | -------------------------------- | ---------------------------- |
| focus | `(options?: FocusOptions): void` | Sets focus on the chip.      |
| blur  | `(): void`                       | Removes focus from the chip. |

### Events

| Event       | Detail    | Cancelable | Description                                   |
| ----------- | --------- | ---------- | --------------------------------------------- |
| `igcSelect` | `boolean` | no         | Emitted when the user selects or deselects the chip. The detail is the new selected state. |
| `igcRemove` | —         | no         | Emitted when the user activates the remove control. The chip does not remove itself. |

The detail of `igcSelect` is the new `selected` state of the chip.

### Slots

| Name     | Description                                                  |
| -------- | ------------------------------------------------------------ |
| default  | Renders the label of the chip.                                |
| `start`  | Content at the start of the chip, before the prefix.           |
| `prefix` | Content before the label.                                      |
| `suffix` | Content after the label.                                      |
| `end`    | Content at the end of the chip, after the suffix.              |
| `select` | Renders content while a selectable chip is selected. It replaces the default selected icon. |
| `remove` | Renders content that replaces the default remove icon.         |

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

### Defaults and properties

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
10. The slots render in the order start, prefix, label, suffix, end.
11. A selectable chip that is not selected hides the prefix and renders no selection indicator.
12. A chip that stops being selectable removes the indicator at once.
13. In a chip that is too narrow for its label, the indicator keeps the width of its icon.
14. With reduced motion, a selection by the user starts no transitions, and a deselection removes the indicator at
    once.

### Selection animation

15. A chip that renders selected, or a selected chip that moves in the DOM or shows again, starts no transitions.
16. A change of `selected`, `variant`, `outlined` or `disabled` from code starts no transitions, and a deselection
    from code removes the indicator at once.
17. A change of `selectable` from code shows or removes the indicator at once.
18. The first hover and the first focus after the render and after a change from code fade.
19. A change from code other than `selectable` while the transitions of a selection by the user run keeps them
    running, a deselected indicator stays until they end, and a deselection from code plays the exit.
20. A selection change by the user transitions the colors of the `base` part over 200 ms with the ease-in-out-quad
    easing.
21. On a selection by the user, the indicator column opens to the width of its content over 120 ms, and the
    indicator fades in over 120 ms after 60 ms. The content is the default icon or the content of the `select` slot.
22. On a deselection by the user, the indicator fades out over 120 ms and its column closes over 120 ms after 60 ms.
    The chip removes the indicator when the transitions end. This applies to both kinds of content.
23. The gap to the `prefix` or `start` content opens and closes with the indicator column.
24. A selection during the exit keeps the same indicator element and reverses its width from the current value.

### Events tests

25. `igcRemove` is emitted when the remove control is activated, and `igcSelect` is not.
26. A chip that is not removable does not intercept the activation keys.
27. `igcSelect` is emitted from the action control.

### Focus tests

28. `focus()` moves the focus to the action control, also when the chip is removable.
29. `blur()` removes the focus.
30. A disabled chip does not take the focus.

### Host ARIA

31. The shared `runHostAriaTests` suite: the host `aria-label`, `aria-labelledby` and `aria-describedby` reach the
    target and follow a change, and an axe audit passes with a host label.
32. The shared focus suite (`runFocusBeforeRenderTests`): a `focus()` call right after the element connects focuses
    the same element as a call after the first render. `blur()`, a later `focus()` on another element and a removal
    that lasts until the render cancel the call, but a move in the same task keeps it. After the render, `focus()`
    takes the focus at once and `blur()` removes it. A `focus()` call before the render on a component with
    `disabled` set does not cancel an earlier call on another element.
33. The host `aria-expanded`, `aria-haspopup` and `aria-controls` reach the action button, also after a change and
    a removal, next to the `aria-pressed` of a selectable chip, and pass the accessibility audit.
34. An empty `aria-expanded` or `aria-haspopup` and an `aria-controls` that references no element are not forwarded.

### Hidden ancestor

35. A selected, removable and outlined chip hides at the same time as a hidden ancestor in each theme, at rest and
    after a focus or a hover.

### Not covered by the suite

- The `locale` and `resourceStrings` properties are not covered; the labels are asserted against their English
  defaults.
- In WebKit, the selection animation tests fail after the reduced-motion emulation of the suite changes, because
  the shared constructed sheets keep the earlier media result. They pass in a WebKit context that starts with
  motion.

## Assumptions and limitations

- While a change from code shows at once, the control turns off every transition in its shadow tree and on its
  slotted elements with `!important`. A transition that the app sets with `::part()` or on slotted content does not
  run in those frames either. The transitions turn on again in the first frame with no change from code.
- The chip does not lay itself out; placing several chips inline and wrapping them is the job of their container.
- A chip is not form associated and submits nothing; its selection is read from the `selected` property.
- `igcSelect` and `igcRemove` are notifications and cannot be canceled, so removal has to be carried out by the
  application.
- The chip does not remove itself from the DOM when its remove control is activated.
- A `selected` chip that is not `selectable` keeps the state but offers no affordance to change it.
- The host `aria-controls`, `aria-labelledby` and `aria-describedby` resolve when the chip renders. A referenced
  element that is added after the host attribute takes effect at the next render.
- A change from code shows at once, also when a user action elsewhere caused it, for example a "select all"
  button.
- A change of `selectable` does not animate, and it cuts a running animation of a selection by the user.
- A change from code during the animation of a selection by the user joins it, also when it rebinds the chip to
  another record, for example when the application sorts the selected chips first after `igcSelect`. The colors
  then animate from the previous record, and a selected chip that the list moves plays the indicator entry again.
- While code changes chips in each frame, for example during a scroll, the transitions of all the chips it changed
  stay off. A hover on one of them does not fade until a frame passes with no change from code.
- A change from code does not animate outside a scroll either, unlike in Ignite UI for Angular. A list that rebinds
  its rows by position, for example after a sort or a filter, shows another record in the same chip, and an
  animation would start from the state of the previous record.
- A theme change fades the colors of the chips.
- The Bootstrap focus ring is an outline and does not fade. The Bootstrap chip of Ignite UI for Angular draws it
  with `box-shadow`, which fades.

## Accessibility

### ARIA roles and properties

- The action control of a selectable chip exposes its state through `aria-pressed`.
- The remove control is a button with a localized label, rendered outside the action control so that the two are
  separate targets for both the pointer and assistive technology.
- The selection indicator is kept out of the accessible name, so that the name is the label of the chip alone.
- The host `aria-label`, `aria-labelledby` and `aria-describedby` name and describe the action button.
- A host `aria-expanded`, `aria-haspopup` and `aria-controls` reach the action button, so a chip that opens a menu or
  a filter panel exposes its state. `aria-controls` goes by element reference.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
