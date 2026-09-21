# Radio group specification

- [Radio group specification](#radio-group-specification)
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
      - [Behaviors](#behaviors)
      - [Default initialization](#default-initialization)
      - [Initial checked state](#initial-checked-state)
      - [Child radio component with initial checked state](#child-radio-component-with-initial-checked-state)
      - [Alignment](#alignment)
      - [Form integration](#form-integration)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Properties and attributes](#properties-and-attributes-1)
    - [Behaviors](#behaviors-1)
    - [Dynamic children](#dynamic-children)
    - [Custom states and layout](#custom-states-and-layout)
    - [ARIA](#aria)
    - [Clearing group state](#clearing-group-state)
    - [Form integration](#form-integration-1)
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

The `igc-radio-group` component unifies one or more [`igc-radio`](../radio/spec.md) components into a single group.
Besides acting as a layout and logical container for the radios, it distributes configuration to them - the shared
name, the selected value and the default selection - and provides the `radiogroup` ARIA semantics.

The group adopts radios that arrive at run time, and keeps its own custom states in sync with the state of its
children, so a group of entirely disabled radios and a group with labels placed before the controls can be styled.

### Key features

- **Shared name**: a non-empty `name` is applied to every child radio.
- **Selection by value**: setting `value` checks the radio with the matching value; reading it returns the value of
  the currently checked radio.
- **Default selection**: `defaultValue` sets the `defaultChecked` state used on a form reset.
- **Alignment**: lays the radios out vertically or horizontally.
- **Dynamic content**: radios added or removed at run time are adopted and configured.
- **ARIA semantics**: the `radiogroup` role and an orientation matching the alignment.

### Acceptance criteria

- The group must apply its `name` to all of its child radios.
- The group must check the child radio whose value matches its `value`, and report the value of the checked child.
- On the initial render, a child with an initial `checked` attribute must take precedence over the `value` of the
  group.
- The group must lay out its radios according to the `alignment` property.
- The group must adopt radios that are added to it after the initial render.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant.
- The component must support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- navigate between the radio buttons of a group with my keyboard and my mouse.
- identify the currently focused radio button in a group.
- perceive the radios as a single labelled set rather than as unrelated controls.

### Developer stories

As a developer, I expect to be able to:

- control the alignment and layout of the radios within the group.
- get and set a **name** property that is distributed to the child radios, to simplify form submission scenarios.
- get and set a **value** property, to read and drive the selection of the group.
- set a **default value**, so a form reset restores the selection I intended.
- add or remove radios at run time and have the group configure them.

## Functionality

### End-user experience

The radio group is mostly representational: it provides the layout for its radios and the grouping semantics, but no
visual chrome of its own. The keyboard and selection behavior belongs to the radios; see the
[radio specification](../radio/spec.md).

### Developer experience

#### Behaviors

- Setting a non-empty `name` property **always** overwrites the `name` of the child radios.
- On the initial render, the group does not apply its `value` to its children if any child has an initial `checked`
  attribute. This is a one-time initialization behavior.
- A `value` that matches no radio stays pending: it is applied again when radios arrive, or when the group loses its
  selection.
- Only radios that are direct children of the group are part of it. Radios nested in a wrapper element are neither
  members of the group nor laid out by it.

#### Default initialization

A radio group that sets the shared `name` attribute for its children:

```html
<label for="contact-method">Please select your preferred contact method</label>
<igc-radio-group id="contact-method" name="contact">
  <igc-radio value="email">Email</igc-radio>
  <igc-radio value="phone">Phone</igc-radio>
  <igc-radio value="mail">Mail</igc-radio>
</igc-radio-group>
```

#### Initial checked state

A vertically aligned group that sets the shared `name` and checks the radio with `email` as its value:

```html
<label for="contact-method">Please select your preferred contact method</label>
<igc-radio-group id="contact-method" alignment="vertical" name="contact" value="email">
  <igc-radio value="email">Email</igc-radio>
  <igc-radio value="phone">Phone</igc-radio>
  <igc-radio value="mail">Mail</igc-radio>
</igc-radio-group>
```

#### Child radio component with initial checked state

If a child radio has an initial `checked` state, the group skips applying its own `value`:

```html
<label for="contact-method">Please select your preferred contact method</label>
<igc-radio-group id="contact-method" name="contact" value="email">
  <igc-radio value="email">Email</igc-radio>
  <igc-radio value="phone" checked>Phone</igc-radio>
  <igc-radio value="mail">Mail</igc-radio>
</igc-radio-group>
```

Here `Phone` stays checked.

#### Alignment

```html
<igc-radio-group alignment="horizontal" name="contact">
  <igc-radio value="email">Email</igc-radio>
  <igc-radio value="phone">Phone</igc-radio>
</igc-radio-group>
```

#### Form integration

The group is not a form-associated element itself; each radio participates in the form on its own, under the shared
name. Setting `defaultValue` on the group sets the `defaultChecked` state of the matching radio, so a form reset
restores that selection.

```html
<form>
  <igc-radio-group name="contact" value="phone" .defaultValue=${'email'}>
    <igc-radio value="email">Email</igc-radio>
    <igc-radio value="phone">Phone</igc-radio>
  </igc-radio-group>
</form>
```

### Localization

None applicable. The component renders no strings of its own.

### Keyboard interactions

The keyboard navigation is handled by the [`igc-radio`](../radio/spec.md#keyboard-interactions) component itself. The
group is a single tab stop, and the arrow keys move and select within it.

## API

### Properties and attributes

| Property     | Attribute | Reflected | Type                 | Default    | Description                                                                                     |
| ------------ | --------- | --------- | -------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| alignment    | alignment | Yes       | `ContentOrientation` | `vertical` | Alignment of the radio controls inside this group.                                              |
| name         | name      | Yes       | `string`             | -          | The name applied to all radio buttons in the group.                                             |
| value        | value     | No        | `string`             | -          | The value of the group, reflecting the value of the currently checked radio. Setting it checks the matching radio. |
| defaultValue | -         | No        | `string`             | -          | The value of the radio that is checked after a form reset.                                      |

### Methods

None applicable.

### Events

None applicable. React to the `igcChange` event of the individual radios, or read the `value` of the group.

### Slots

| Name      | Description                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| (default) | The radio controls of the group. They must be direct children of the group - radios nested in a wrapper element are neither part of it, nor laid out by it. |

### CSS Shadow parts

None applicable.

The group exposes two custom states for styling: one that is active when every radio in the group is disabled, and
one that is active when any radio places its label before its control.

## Test scenarios

The suite lives in [`radio-group.spec.ts`](./radio-group.spec.ts). It runs in a real browser through `@web/test-runner`, with
`@open-wc/testing` fixtures and assertions, and it reuses the shared harness in
[`src/internals/testing`](../../internals/testing):

| Shared helper | What it contributes |
| ------------- | ------------------- |
| `simulateInput / simulateClick / simulateKeyboard` | User interaction driven without real device events. |
| `isFocused` | Focus assertions that see through shadow roots. |
| `createFormAssociatedTestBed` | A `form` fixture around the group and its radios, for the submission and reset cases. |

The groups below mirror the `describe` blocks of the suite.

### Properties and attributes

1. Is initialized with sensible default values.
2. Is accessible (axe audit).
3. Setting a `name` overwrites the names of the children.
4. Setting a `value` property is reflected in the radio children.
5. The `value` property returns the checked state of the radio children.

### Behaviors

6. Initial rendering with `name` and `value` state produces the correct state.
7. Initial rendering with a declarative `checked` state on a radio child produces the correct state - the child wins.
8. Keyboard navigation moves through the radios with the arrow keys.
9. Keyboard navigation skips disabled radios.

### Dynamic children

10. Adopts a radio added at run time.
11. A radio added at run time takes part in the single selection and in the keyboard navigation.
12. Applies `defaultValue` and a pending `value` to a radio added at run time.
13. Does not steal an active selection from the radios.
14. Drops a radio removed at run time.
15. Restores the tab stop when the checked radio is removed, and keeps the checked radio as the sole tab stop when
    another one is removed.
16. Restores the tab stop when the radio matching a pending `value` is removed.

### Custom states and layout

17. Reports the `disabled` state when every radio is disabled.
18. Does not report a group without radios as disabled.
19. Reports the `label-before` state of its radios.
20. Counts only the radios for the layout of the group.

### ARIA

21. Exposes its role as a content attribute.
22. Mirrors `alignment` in `aria-orientation`.

### Clearing group state

23. Clearing `name` clears the names of its radios.
24. Clearing `defaultValue` clears the default state of its radios.

### Form integration

25. Initial checked state through the group, through a radio attribute, and with multiple checked radios.
26. Form reset when bound through the group `value` attribute, with `defaultValue` set, and with multiple checked
    radios.
27. The required validator applies its visual state across the group.
## Assumptions and limitations

- It is recommended to avoid mutating state on both the group and its radio children. Either control the children
  through the group, or react to the changes of the individual radios.
- The group is not a form-associated element; validation and submission belong to the radios.

## Accessibility

### ARIA roles and properties

- The `igc-radio-group` has an intrinsic role of `radiogroup`, which is reflected to the host element.
- The orientation of the group is exposed and follows the `alignment` property.
- The group itself is not focusable; the keyboard behavior and the roving tab index belong to the radios.
- Label the group from the application, for example with an external `label` element referenced by `id`, or with
  `aria-label`.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.
