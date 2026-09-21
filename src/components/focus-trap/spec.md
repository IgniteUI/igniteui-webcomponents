# Focus trap specification

- [Focus trap specification](#focus-trap-specification)
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
      - [Collecting the focusable elements](#collecting-the-focusable-elements)
      - [Moving the focus](#moving-the-focus)
      - [Turning the trap off](#turning-the-trap-off)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Light DOM](#light-dom)
    - [Shadow DOM](#shadow-dom)
    - [Mixed content](#mixed-content)
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

The `igc-focus-trap` keeps the keyboard focus inside its content. It is an internal building block of the modal
surfaces of the library — the [dialog](../dialog/spec.md) and the edge positions of the
[navigation drawer](../nav-drawer/spec.md) — rather than a component applications compose with directly.

The component has no wiki page; this specification is written from the implementation.

```html
<igc-focus-trap>
  <button>First</button>
  <input />
  <button>Last</button>
</igc-focus-trap>
```

### Key features

- **A focusable set that crosses shadow boundaries**, so a projected component contributes its own focusable
  elements.
- **Entry points**: methods that move the focus to the first and to the last element of the set.
- **A focus-within state** the host can read.
- **A disabled state**, so that the trap can be turned off without unmounting it.

### Acceptance criteria

- The component must collect the focusable elements of its content, including those inside shadow roots.
- It must report whether the focus is currently inside it.
- It must be able to move the focus to the first and to the last focusable element.
- It must be possible to turn the trapping off.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- stay inside a modal surface while I move through it with the keyboard, instead of tabbing out into the page
  behind it.

### Developer stories

As a developer, I expect to be able to:

- keep the focus inside a modal surface without writing the traversal myself;
- have the trap see the focusable elements of the components I project into it;
- move the focus to the start or to the end of the trapped content;
- read whether the focus is currently inside the trap;
- turn the trap off while keeping the content mounted.

## Functionality

### End-user experience

Inside a trapped surface, <kbd>Tab</kbd> and <kbd>Shift</kbd> + <kbd>Tab</kbd> cycle through the content instead
of leaving it, so the surface behaves as a modal one.

### Developer experience

#### Basic initialization

The content is projected into the default slot. The trap is active unless `disabled` is set.

```html
<igc-focus-trap>
  <button>Confirm</button>
  <button>Cancel</button>
</igc-focus-trap>
```

#### Collecting the focusable elements

`focusableElements` returns the focusable content in document order, descending into shadow roots, so a projected
custom element contributes what it renders. Content-editable elements are part of the set as well.

#### Moving the focus

`focusFirstElement()` and `focusLastElement()` are the entry points a surface calls when it opens, and the ends
the traversal wraps to.

```ts
trap.focusFirstElement();
```

#### Turning the trap off

`disabled` stops the component from managing the focus of its content, without changing what is rendered.

### Localization

None applicable. The component renders no content of its own.

### Keyboard interactions

| Keys                                                | Description                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| <kbd>Tab</kbd>                                      | Moves to the next focusable element, wrapping to the first one.      |
| <kbd>Shift</kbd> + <kbd>Tab</kbd>                   | Moves to the previous focusable element, wrapping to the last one.   |

## API

### Properties and attributes

| Property            | Attribute  | Reflected | Type            | Default | Description                                                      |
| ------------------- | ---------- | --------- | --------------- | ------- | ---------------------------------------------------------------- |
| `disabled`          | `disabled` | yes       | `boolean`       | `false` | Stops the component from managing the focus of its content.       |
| `focused`           | —          | —         | `boolean`       | —       | Whether the focus is currently inside the trap. Read-only.        |
| `focusableElements` | —          | —         | `HTMLElement[]` | —       | The focusable content, shadow roots included. Read-only.          |

### Methods

| Method              | Signature    | Description                                            |
| ------------------- | ------------ | ------------------------------------------------------ |
| `focusFirstElement` | `(): void`   | Moves the focus to the first focusable element.         |
| `focusLastElement`  | `(): void`   | Moves the focus to the last focusable element.          |

### Events

None applicable.

### Slots

| Name    | Description                        |
| ------- | ---------------------------------- |
| default | The content to trap the focus in.   |

### CSS Shadow parts

None applicable.

## Test scenarios

| Suite         | File                 |
| ------------- | -------------------- |
| `Focus trap`  | `focus-trap.spec.ts` |

### Light DOM

1. The component reports the correct number of focusable elements.
2. `focused` reflects whether the focus is inside the trap.
3. `focusFirstElement()` and `focusLastElement()` focus the expected elements.

### Shadow DOM

4. The focusable elements of a projected component with a shadow root are counted.
5. `focused` reflects the focus inside a shadow root.
6. The first and the last element are focused correctly across the shadow boundary.

### Mixed content

7. A mix of light DOM, shadow DOM and content-editable elements gives the correct focusable set, and the first and
   the last element of it are focused correctly.

### Not covered by the suite

- The wrapping traversal itself — <kbd>Tab</kbd> from the last element and <kbd>Shift</kbd> + <kbd>Tab</kbd> from
  the first — is not covered directly; the suite covers the set and the entry points.
- The `disabled` state is not covered.

## Assumptions and limitations

- The component is internal. It is a building block of the modal surfaces of the library and is not part of the
  public API surface applications are expected to compose with.
- The focusable set is computed on demand rather than observed, so content added while the focus is being moved is
  picked up at the next read.
- The trap constrains the keyboard only. It does not prevent a pointer from reaching the content behind the
  surface; that is the job of the surface itself, through a native `dialog` or a backdrop.
- Nested traps are not coordinated with one another.

## Accessibility

### ARIA roles and properties

The component applies no roles or ARIA properties. The semantics of the surface — for example `role="dialog"` and
its modal state — belong to the component that uses the trap.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
