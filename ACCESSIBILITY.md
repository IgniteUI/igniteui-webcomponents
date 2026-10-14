# Accessibility

Ignite UI for Web Components is built to be usable with a keyboard, a screen reader and other assistive technology. This document gives the accessibility target of the library and how it is verified. It also tells where the platform still limits what a Shadow DOM component can express, and how to report a problem.

## Conformance target

The components target [WCAG 2.1](https://www.w3.org/TR/WCAG21/) level AA for the parts of a page they render. Interactive components follow the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) patterns for their role, such as combobox, listbox, tablist, tree, dialog and slider. This includes the keyboard interaction that each pattern specifies.

A component supplies its own semantics, keyboard handling, focus management and contrast within its themes. The host application remains responsible for page-level requirements, such as headings, landmarks and page titles. The host is also responsible for the text of the labels that it passes to a component. The same is true for the contrast of the custom colors that it applies through CSS custom properties.

There is no published formal conformance report (VPAT or ACR) for this package.

## How accessibility is verified

**Automated audits.** Component specifications run [axe-core](https://github.com/dequelabs/axe-core) through `chai-a11y-axe` against the component's light DOM, its shadow DOM, or both, in the states they exercise. New and changed specifications audit both trees. The audits use the default axe ruleset, which covers the WCAG 2.0 and 2.1 A and AA success criteria that axe can test. The ruleset also includes the WCAG 2.2 AA rules that axe ships and the axe best-practice rules. A failing audit fails the test run, so a regression cannot merge.

Automated audits have two limits:

- Automated tools find only some accessibility problems. A person must verify keyboard operability, focus order, the quality of a name or description, and screen-reader announcements.
- axe does not see ARIA that the components publish through `ElementInternals`. Also, some axe rules check for a content attribute, so they miss a relation set through ARIA element reflection. If a rule misreports for this reason, the specification disables it for that component. The specification then asserts the real relation directly. The file `src/internals/testing/helpers.spec.ts` contains and documents these exceptions.

**Storybook.** The Storybook build includes the accessibility addon, which runs axe against each story and shows the result in the panel.

**Manual verification.** A person checks the components with a keyboard and with screen readers, primarily NVDA with Chrome and Firefox on Windows. Manual checks cover keyboard interaction against the APG pattern, focus visibility, announcements of state changes, and behavior with reduced motion and forced-colors modes.

## Shadow DOM and the limits of the platform

The components render in Shadow DOM. This gives them style and markup encapsulation. However, ARIA was designed around a single document, and some of its mechanisms do not cross a shadow boundary:

- **IDREF relations do not cross shadow roots.** Attributes such as `aria-labelledby`, `aria-describedby`, `aria-controls` and `aria-activedescendant` refer to elements by ID. An ID inside one shadow root is not visible from another. An input inside the shadow root of a component cannot use an IDREF to refer to a label element in the page. The reverse is also true.
- **Composite roles are hard to split across roots.** Some patterns need relations between elements in different tree scopes. Examples are a combobox that owns a listbox, and a tablist whose panels are in the page.

Where the platform has a workaround, the components use it:

- **`ElementInternals`.** Components attach internals and publish their role and ARIA state through it. Thus, the host element has the correct semantics without content attributes that a consumer can overwrite. A controller in `src/internals/controllers/internals.ts` keeps that state in sync with component properties. If a tool must see the role or the `aria-label` as a content attribute, the component also sets it as a content attribute. A `role` or `aria-label` that the author sets on the host always has priority.
- **ARIA element reflection.** The components set relations as element references (`ariaLabelledByElements`, `ariaDescribedByElements`, `ariaControlsElements`, `ariaActiveDescendantElement`), not as IDREF strings. Element reflection resolves across shadow boundaries into ancestor tree scopes, so composite components can refer to elements that the page or other components own. The projection controller in `src/internals/controllers/aria-projection.ts` carries those references to the native control inside an input-shaped component, because assistive technology uses that control. One exception is deliberate. While no label or description is projected, the component refers to the label and description that it renders itself with same-root `aria-labelledby` and `aria-describedby` IDREFs. It uses IDREFs because these elements share the shadow root of the control, and tools that read only attributes can see a content attribute.
- **One naming order for form controls.** Every form associated component names its native control from the first source that is present, in this order:
  1. The host `aria-labelledby`.
  2. External `<label>` elements bound with `for` or by nesting.
  3. The component's own label (its `label` property or default slot).
  4. The host `aria-label`.

  The name reaches the native control as element references. The component resolves the sources again when the host `aria-label` or `aria-labelledby` changes and when focus enters it. Thus, a label that you add after the first render names the control. A click on an external label activates the component in the same way as a native control. The click toggles a checkbox, switch or radio, focuses a rating or slider, and opens the file picker of a file input.
- **Delegated focus and roving tabindex** keep a single tab stop for each composite and move focus between items inside the shadow root. Thus, keyboard behavior matches the APG pattern, wherever the items are.

Where the platform cannot express a pattern exactly, the components use the closest semantics that it supports. For example, in Chromium, a `<label>` that wraps a component also adds text from the shadow root to the name. This text can be the placeholder of an input. A label bound with `for` does not do this.

Browser support for cross-root ARIA is improving. The components are updated to use new capabilities when browsers ship them. Thus, the behavior continues to improve without changes on the consumer's side. Reference points for the ongoing platform work are the [Accessibility Object Model](https://wicg.github.io/aom/) and the [cross-root ARIA](https://github.com/WICG/webcomponents/issues/917) proposals.

## What the host application should do

- Give a meaningful label to every input-like component. Use its `label` property, a `<label>` element, `aria-labelledby` or `aria-label`. Do not use placeholder text as the label. When possible, use `<label for>` instead of a wrapping label, for the reason given above.
- When you customize colors, keep the contrast of the themes, or verify the result with a contrast checker.
- After you compose components, test the page with a keyboard and at least one screen reader. Page-level problems appear in the composition.

## Reporting an accessibility problem

Open a [bug report](https://github.com/IgniteUI/igniteui-webcomponents/issues/new?template=bug_report.yaml). In the report, describe the assistive technology, the browser and the operating system. Also describe what was announced or what happened, and what you expected. Accessibility defects are triaged like functional bugs.
