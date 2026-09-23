# Button specification

- [Button specification](#button-specification)
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
      - [Rendering as an anchor](#rendering-as-an-anchor)
      - [Form integration](#form-integration)
      - [Invoker commands](#invoker-commands)
      - [The icon button](#the-icon-button)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Button component](#button-component)
    - [Link button](#link-button)
    - [Events tests](#events-tests)
    - [Invoker Commands API](#invoker-commands-api)
    - [Form integration tests](#form-integration-tests)
    - [Icon button tests](#icon-button-tests)
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

The directory holds the two button components of the library, which share the same base:

- `igc-button` — a button with projected content, rendering a native `<button>` or an `<a>`.
- `igc-icon-button` — a button that shows a single icon from the icon registry.

Both render a native element underneath, take part in form submission and can act as invokers of the Invoker
Commands API.

```html
<igc-button variant="contained">OK</igc-button>
<igc-icon-button name="close" collection="material"></igc-icon-button>
```

### Key features

- **Button or anchor** from the same element: setting `href` renders an `<a>` with the full anchor semantics.
- **Visual variants**: contained, outlined and flat, plus `fab` for the regular button.
- **Form association**: a `submit` or a `reset` button drives the form it belongs to.
- **Invoker commands**: `command` and `commandfor` operate a popover, a native dialog or a component of the
  library without a line of script.
- **Prefix and suffix slots** on the regular button for icons and other decoration.
- **A disabled state** that is both visual and behavioral.

### Acceptance criteria

- The component must act as a button or as an anchor, depending on its configuration.
- It must support the visual variants of the supported design systems.
- It must support projected content, and sizing through the theming mechanism.
- It must show distinct states — focused, disabled and the rest — according to the active theme.
- A `submit` or `reset` button must perform the form action of the form it is associated with.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must follow the WAI-ARIA guidelines and be operable with a pointer and with the keyboard.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- click a button that performs an action;
- click a button that takes me to a URL;
- see the state of the button — disabled, focused and so on — clearly;
- operate the button with a pointer and with the keyboard alike.

### Developer stories

As a developer, I expect to be able to:

- initialize the component as a button or as an anchor;
- set a variant that controls how the button looks;
- control the disabled state;
- set the type of a button, so that it submits or resets a form;
- set the anchor attributes — `href`, `download`, `target` and `rel` — when it is a link;
- project content into the slots for the cases where extra visual indication is needed;
- have the button open, close or toggle another element declaratively;
- render an icon-only button from the icon registry.

## Functionality

### End-user experience

The button renders its content inside a native control that takes the styling of the active theme. The wiki page
of the component carries a design hand-off heading with no link behind it.

### Developer experience

#### Basic initialization

```html
<igc-button>OK</igc-button>
<igc-button variant="flat">Cancel</igc-button>
<igc-button variant="fab"><igc-icon slot="prefix" name="add"></igc-icon></igc-button>
```

#### Rendering as an anchor

Setting `href` renders an `<a>` instead of a `<button>`. `download`, `target` and `rel` apply then, and `type` is
ignored. With `target="_blank"`, setting `rel="noopener noreferrer"` is strongly recommended.

```html
<igc-button variant="outlined" href="https://example.com" target="_blank" rel="noopener noreferrer">
  Open in a new tab
</igc-button>
```

#### Form integration

The button is a form-associated custom element. `form` resolves the form it belongs to, through the closest
ancestor `<form>` or the `form` attribute, and a `submit` or `reset` type performs that action. The button follows
the disabled state of an ancestor fieldset. `click()` simulates a click, including the form action.

```html
<form>
  <igc-button type="submit">Submit</igc-button>
  <igc-button type="reset" variant="flat">Reset</igc-button>
</form>
```

#### Invoker commands

`command` and `commandfor` make the button an invoker: `commandfor` is the id of the target, and `command` is what
to do with it. The built-in commands operate a native popover and a native `dialog`; the components of the library
accept `--show`, `--hide` and `--toggle`. A custom command starts with two dashes.
`commandForElement` resolves the target, accepts an element reference, and picks up a target appended after the
first render.

```html
<igc-button command="--toggle" commandfor="drawer">Toggle</igc-button>
<igc-nav-drawer id="drawer">…</igc-nav-drawer>
```

#### The icon button

`igc-icon-button` shows one icon, named by `name` and `collection` from the [icon registry](../icon/spec.md).
`mirrored` flips the icon in a right-to-left context. It shares the type, the anchor and the form behavior of the
regular button, and offers the contained, outlined and flat variants.

```html
<igc-icon-button name="menu" collection="material" variant="flat"></igc-icon-button>
```

### Localization

The components have no resource strings. The label of a button comes from its projected content, and an icon
button is named through its `aria-label`.

### Keyboard interactions

| Keys                                | Description                                                            |
| ----------------------------------- | ---------------------------------------------------------------------- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves the focus to and from the button.                 |
| <kbd>Enter</kbd>                    | Activates the button, or follows the link when it is an anchor.          |
| <kbd>Space</kbd>                    | Activates the button.                                                    |

The behavior is the native one of the rendered `<button>` or `<a>`.

## API

### Properties and attributes

Shared by `igc-button` and `igc-icon-button`:

| Property            | Attribute    | Reflected | Type                                             | Default     | Description                                            |
| ------------------- | ------------ | --------- | ------------------------------------------------ | ----------- | ------------------------------------------------------ |
| `disabled`          | `disabled`   | yes       | `boolean`                                        | `false`     | Disables the button.                                    |
| `type`              | `type`       | yes       | `"button" \| "submit" \| "reset"`                | `button`    | The behavior of the button; ignored while `href` is set. |
| `href`              | `href`       | no        | `string \| undefined`                            | —           | Renders the component as an anchor to this URL.          |
| `download`          | `download`   | no        | `string \| undefined`                            | —           | Downloads the target instead of navigating to it.        |
| `target`            | `target`     | no        | `"_blank" \| "_parent" \| "_self" \| "_top"`     | —           | Where to open the linked document.                       |
| `rel`               | `rel`        | no        | `string \| undefined`                            | —           | The relationship to the linked document.                 |
| `command`           | `command`    | yes       | `string \| undefined`                            | —           | The command to invoke on the target.                     |
| `commandfor`        | `commandfor` | no        | `string \| null`                                 | —           | The id of the command target.                            |
| `commandForElement` | —            | —         | `Element \| null`                                | —           | The resolved command target.                             |
| `form`              | —            | —         | `HTMLFormElement \| null`                        | —           | The associated form. Read-only.                          |

`igc-button` adds:

| Property  | Attribute | Reflected | Type                                              | Default     | Description                     |
| --------- | --------- | --------- | ------------------------------------------------- | ----------- | ------------------------------- |
| `variant` | `variant` | yes       | `"contained" \| "outlined" \| "flat" \| "fab"`    | `contained` | The visual variant of the button. |

`igc-icon-button` adds:

| Property     | Attribute    | Reflected | Type                                      | Default     | Description                                   |
| ------------ | ------------ | --------- | ----------------------------------------- | ----------- | --------------------------------------------- |
| `name`       | `name`       | no        | `string \| undefined`                     | —           | The name of the icon to show.                  |
| `collection` | `collection` | no        | `string \| undefined`                     | —           | The collection the icon belongs to.            |
| `mirrored`   | `mirrored`   | no        | `boolean`                                 | `false`     | Mirrors the icon in a right-to-left context.   |
| `variant`    | `variant`    | yes       | `"contained" \| "outlined" \| "flat"`     | `contained` | The visual variant of the button.              |

### Methods

| Method  | Signature  | Description                                                                    |
| ------- | ---------- | ------------------------------------------------------------------------------ |
| `click` | `(): void` | Simulates a click, triggering the handler and any associated form action.       |

### Events

None of their own. The components emit the native events of the rendered `<button>` or `<a>`.

### Slots

| Component         | Name     | Description                                     |
| ----------------- | -------- | ----------------------------------------------- |
| `igc-button`      | default  | The label of the button.                         |
| `igc-button`      | `prefix` | Content before the label.                        |
| `igc-button`      | `suffix` | Content after the label.                         |

`igc-icon-button` takes no projected content; its icon comes from the registry.

### CSS Shadow parts

| Component         | Part     | Description                                      |
| ----------------- | -------- | ------------------------------------------------ |
| `igc-button`      | `base`   | The native button or anchor element.              |
| `igc-icon-button` | `base`   | The wrapping element of the icon button.          |
| `igc-icon-button` | `icon`   | The icon element.                                 |

## Test scenarios

| Suite                  | File                  |
| ---------------------- | --------------------- |
| `Button tests`         | `button.spec.ts`      |
| `IconButton component` | `icon-button.spec.ts` |

### Button component

1. The component is initialized with its default values and passes the accessibility audit.
2. The `disabled`, `variant` and `type` properties are reflected.
3. The shadow DOM structure is correct.

### Link button

4. A button with an `href` is initialized with its default values and passes the accessibility audit.
5. The `disabled` and `variant` properties are reflected, and so are the link properties.
6. The shadow DOM structure of the anchor is correct.

### Events tests

7. The focus states are correct across the light and the shadow DOM.

### Invoker Commands API

8. The `command` attribute is reflected onto the native button and follows a change of the property.
9. `commandForElement` resolves from a string id and accepts an element reference, and `commandfor` resolves a
   target appended after the first render.
10. A native popover is shown, hidden and toggled on repeated clicks.
11. A native dialog is opened as modal and closed.

### Form integration tests

12. The button is form associated, and submits and resets the form it belongs to.
13. It follows the disabled state of an ancestor.

### Icon button tests

14. The component renders a native button, and an anchor when `href` is set.
15. It is created with its default values.
16. The `name`, `collection`, `mirrored`, `href`, `rel`, `target`, `download` and `disabled` properties are
    applied.
17. Every anchor-specific property is applied to the wrapped base element.

### Not covered by the suite

- The `prefix` and `suffix` slots of the regular button are not covered.
- The `fab` variant is not asserted separately from the other variants.
- Custom `--`-prefixed commands on components of the library are covered by the suites of those components rather
  than here.

## Assumptions and limitations

- `type` and the form behavior are ignored while the component renders as an anchor.
- The components emit no custom events; the native events of the rendered element are what an application listens
  for.
- `igc-icon-button` takes no projected content, so its icon must exist in the registry.
- The size of a button comes from the theming mechanism rather than from a property.
- An icon button carries no text, so it needs an `aria-label` of its own.

## Accessibility

### ARIA roles and properties

- The component renders a native `<button>` or `<a>`, so the role, the disabled semantics and the keyboard
  behavior are the native ones.
- The `aria-label` of the host is forwarded to the rendered element, which is how an icon button gets its name.
- An anchor rendered as a disabled button exposes `role="button"` together with `aria-disabled`, since a native
  anchor has no disabled state.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The icon of an icon
button is mirrored when `mirrored` is set.
