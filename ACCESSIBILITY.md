# Accessibility

Ignite UI for Web Components is built to be usable with a keyboard, a screen reader and other assistive technology. This document states what the library aims for, how that is verified, where the platform still limits what a Shadow DOM component can express, and how to report a problem.

## Conformance target

The components target [WCAG 2.1](https://www.w3.org/TR/WCAG21/) level AA for the parts of a page they render. Interactive components follow the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) patterns for their role, such as combobox, listbox, tablist, tree, dialog and slider, including the keyboard interaction each pattern specifies.

A component supplies its own semantics, keyboard handling, focus management and contrast within its themes. The host application remains responsible for page-level requirements, such as headings, landmarks, page titles, the text of labels it passes to a component, and the contrast of custom colors it applies through CSS custom properties.

No formal conformance report (VPAT or ACR) is published for this package.

## How accessibility is verified

**Automated audits.** Component specifications run [axe-core](https://github.com/dequelabs/axe-core) through `chai-a11y-axe` against the component's light DOM, its shadow DOM, or both, in the states they exercise. New and changed specifications audit both trees. The audits run with the default axe ruleset, which covers the WCAG 2.0 and 2.1 A and AA success criteria axe can test, the WCAG 2.2 AA rules axe ships, and its best-practice rules. A failing audit fails the test run, so a regression cannot merge.

Two things about automated audits are worth knowing:

- Automated tools detect only a portion of accessibility problems. Keyboard operability, focus order, the quality of a name or description, and screen-reader announcements need a person to verify them.
- axe does not see ARIA that the components publish through `ElementInternals`, and some of its rules check for a content attribute, so they miss a relation set through ARIA element reflection. Where a rule misreports for this reason, it is disabled for that component and the real relation is asserted directly in the specification instead. These exceptions live in `src/internals/testing/helpers.spec.ts` and are documented there.

**Storybook.** The Storybook build includes the accessibility addon, which runs axe against each story and shows the result in the panel.

**Manual verification.** Components are checked by hand with a keyboard and with screen readers, primarily NVDA with Chrome and Firefox on Windows. Manual checks cover keyboard interaction against the APG pattern, focus visibility, announcements of state changes, and behavior with reduced motion and forced-colors modes.

## Shadow DOM and the limits of the platform

The components render in Shadow DOM. This gives them style and markup encapsulation, but ARIA was designed around a single document, and some of its mechanisms do not cross a shadow boundary:

- **IDREF relations do not cross shadow roots.** Attributes such as `aria-labelledby`, `aria-describedby`, `aria-controls` and `aria-activedescendant` refer to elements by ID, and an ID inside one shadow root is not visible from another. A label element in the page cannot be referenced from an input inside a component's shadow root with an IDREF, and vice versa.
- **Composite roles are hard to split across roots.** Patterns such as a combobox that owns a listbox, or a tablist whose panels live in the page, require relations between elements that end up in different tree scopes.

Where the platform offers a way around this, the components use it:

- **`ElementInternals`.** Components attach internals and publish their role and ARIA state through it, so the host element carries the correct semantics without content attributes that a consumer could clobber. A controller in `src/internals/controllers/internals.ts` keeps that state in sync with component properties. Where a tool needs to see the role or the `aria-label` as a content attribute, it is mirrored there as well. A `role` or `aria-label` that the author sets on the host always wins.
- **ARIA element reflection.** Relations are set as element references (`ariaLabelledByElements`, `ariaDescribedByElements`, `ariaControlsElements`, `ariaActiveDescendantElement`) rather than IDREF strings. Element reflection resolves across shadow boundaries into ancestor tree scopes, which lets a composite component point at an element the page or another component owns. The projection controller in `src/internals/controllers/aria-projection.ts` carries those references to the native control inside an input-shaped component, since that is the element assistive technology lands on. One exception is deliberate: while no label or description is projected, the label and the description the component renders itself are referenced with same-root `aria-labelledby` and `aria-describedby` IDREFs, because they live in the same shadow root as the control and a content attribute stays visible to tools that read only attributes.
- **One naming order for form controls.** Every form associated component names its native control from the first source that is present: the host `aria-labelledby`, then external `<label>` elements bound with `for` or by nesting, then the component's own label (its `label` property or default slot), then the host `aria-label`. The name reaches the native control as element references. The sources are resolved again when the host `aria-label` or `aria-labelledby` changes and when focus enters the component, so a label added after the first render names the control. A click on an external label activates the component the way it activates a native control: it toggles a checkbox, switch or radio, focuses a rating or slider, and opens the file picker of a file input.
- **Delegated focus and roving tabindex** keep a single tab stop per composite and move focus between items inside the shadow root, so keyboard behavior matches the APG pattern regardless of where the items live.

Some patterns still cannot be expressed exactly, and in those cases the components use the closest semantics the platform supports. For example, in Chromium a `<label>` that wraps a component also adds text from its shadow root, such as the placeholder of an input, to the name; a label bound with `for` does not. Browser support for cross-root ARIA is improving, and the components are updated to use new capabilities as they ship, so behavior will keep improving without changes on the consumer's side. Reference points for the ongoing platform work are the [Accessibility Object Model](https://wicg.github.io/aom/) and the [cross-root ARIA](https://github.com/WICG/webcomponents/issues/917) proposals.

## What the host application should do

- Pass a meaningful label to every input-like component, through its `label` property, a `<label>` element, `aria-labelledby` or `aria-label`, and do not rely on placeholder text. Prefer `<label for>` over a wrapping label, for the reason given above.
- Keep the themes' contrast when customizing colors, or verify the result with a contrast checker.
- Test the page with a keyboard and at least one screen reader after composing components, since the composition is where page-level issues appear.

## Reporting an accessibility problem

Open a [bug report](https://github.com/IgniteUI/igniteui-webcomponents/issues/new?template=bug_report.yaml) and describe the assistive technology, browser and operating system, what was announced or what happened, and what you expected. Accessibility defects are triaged like functional bugs.
