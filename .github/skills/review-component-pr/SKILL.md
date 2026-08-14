---
name: review-component-pr
description: Comprehensive code review checklist for component pull requests ensuring quality, accessibility, and adherence to project conventions
---

# Review Component PR

A review checklist for pull requests that add or modify components. The rules behind it live in
the [Coding Guidelines](../../CODING_GUIDELINES.md); this skill is the pass over a diff.

## When to Use

- Reviewing a PR that adds or changes a component
- Pre-merge quality gate, or a self-review before opening a PR

## Review Order

1. **Structure** — are all the required files there?
2. **Public API** — properties, events, docs; this is the part that cannot be changed later
3. **Accessibility** — mandatory, never skipped
4. **Behavior** — lifecycle, state, forms
5. **Styles and themes**
6. **Tests and generated artifacts**
7. **Build and hygiene**

## 1. Structure

- [ ] Component at `src/components/[name]/[name].ts` with a single default export
- [ ] Spec at `src/components/[name]/[name].spec.ts`
- [ ] Story at `stories/[name].stories.ts` — filename matches the tag name
- [ ] Theme scaffold complete: `[name].base.scss`, `shared/`, `light/`, `dark/`, `themes.ts`
- [ ] Exported from `src/index.ts` in alphabetical order
- [ ] Cross-cutting imports use `#internals/*`, `#theming/*`, `#animations/*`; component-to-component
      imports stay relative; every specifier ends in `.js`
- [ ] Nothing new under `src/internals` is exported from the public entry point

## 2. Public API and Documentation

- [ ] `tagName`, `styles` and `register()` static members present; `register()` also registers
      every dependency rendered in the template
- [ ] `HTMLElementTagNameMap` declaration added
- [ ] Only primitives are attributes; complex types use `attribute: false` and are never reflected
- [ ] Booleans default to `false`
- [ ] Attribute names are kebab-case, spelled out for multi-word properties
- [ ] Events go through `EventEmitterMixin` with a typed event map; names are `igc`-prefixed
      camelCase, cancelable ones use the `-ing` suffix and their return value is checked
- [ ] Events are emitted from user interaction, not from property assignment or method calls
- [ ] JSDoc carries `@element`, `@slot`, `@csspart`, `@cssproperty`, `@attr`, `@default`,
      `@event` as applicable, with tags after the description
- [ ] Deprecations follow `@deprecated since [SemVer]. Use the \`[new API]\` [type] instead.`
- [ ] **No `igc-` tag names in description prose** — they ship verbatim into
      `custom-elements.json` and every framework wrapper's docs. Allowed only in `@element`,
      fenced `@example` blocks, literal `igc-`-containing event/attribute names, and
      `@internal`/`@hidden` members.
- [ ] Descriptions don't restate the tag ("The label _attribute_ of…"), don't use `Gets/Sets`,
      and booleans start with "Whether" describing the `true` state accurately

```bash
# Quick leak check — should return nothing outside @element/@example
grep -rn "igc-" --include="*.ts" src/ \
  | grep -E "^\S+:[0-9]+:\s*\*" \
  | grep -vE "@element|@example|\.spec\.ts"
```

## 3. Accessibility

- [ ] The spec contains the mandatory a11y audit (`shadowDom` **and** light DOM)
- [ ] Semantic elements used instead of `div`s with click handlers
- [ ] ARIA set through `addInternalsController` (`initialARIA`, `setARIA()`) — never
      `this.role = '…'`; `reflectRole: true` when attribute-only tooling must see the role
- [ ] Keyboard interaction implemented through `addKeybindings` (Tab, arrows, Enter/Space,
      Escape, Home/End as applicable) with visible focus indicators
- [ ] Composite hosts wrapping an input-shaped component project their semantics with
      `addAriaProjector` / `addAriaTarget` instead of setting `role`/`aria-*` on the host or
      the wrapper
- [ ] Cross-root relations use ARIA element reflection, never IDREFs
- [ ] Theme selectors for composite anchors key off the mirrored `data-role`/`data-haspopup`
      attributes, not `role`/`aria-*`
- [ ] No `public` members tagged `@hidden`/`@internal` added for cross-component access — use
      `internalsOf()`
- [ ] Cross-root ARIA is covered by `runExternalLabelAssociationTests` /
      `runAriaProjectionTests`; reflected relations are asserted by identity readback, with
      `axeReflectedRelationsOptions` suppressing the known `aria-required-attr` false positive

## 4. Behavior

- [ ] Region fences and member order follow the standard component structure
- [ ] Internal API is `_`-prefixed; no native private fields (`#`); `readonly` on controllers
      and other non-reassigned fields
- [ ] No `any`; explicit return types except where obviously noise
- [ ] Derived state computed in `willUpdate()`, side effects in `update()` with
      `super.update()` called; guarded by `changedProperties.has()`
- [ ] No new `@watch` usages
- [ ] Existing controllers reused rather than reimplemented (slots, observers, root click,
      keybindings, gestures, i18n)
- [ ] Dynamically added listeners on `window`/`document` are removed in `disconnectedCallback`;
      listeners in templates and on the host are not manually cleaned up
- [ ] User-facing strings come from the i18n controller, not inlined in templates
- [ ] Form controls: extend the right form-associated mixin, own their `_formValue` through
      `createFormValueState`, expose validators via `__validators` (reusing
      `#internals/validators.js`), update through `setValueAndFormState`, call `_validate()`
      from constraint-affecting setters, and wire `_handleBlur` / `_handleEnterKeydown` on the
      native editor
- [ ] Form controls don't reimplement touched/pristine/invalid bookkeeping; overrides of
      `formResetCallback` call `super`

## 5. Styles and Themes

- [ ] Only `.scss` edited — no generated `.css.ts` in the diff
- [ ] Load-path specifiers (`@use 'styles/utilities' as *`), no relative global imports
- [ ] Values read through `var-get()` and the theming functions; nothing hardcoded
- [ ] Part selectors use `[part~='…']`
- [ ] All four themes covered in light and dark; dark files emit only the `diff()`
- [ ] `themes.ts` aggregates every theme file that was added
- [ ] `:host` has an appropriate `display`; selector specificity kept low

## 6. Tests and Generated Artifacts

- [ ] `defineComponents()` in the `before()` hook; `elementUpdated()` after programmatic changes
- [ ] Coverage for defaults, property/attribute reflection, events, interaction and edge cases
- [ ] Interaction driven by the shared simulators from `#internals/testing/simulate.spec.js`,
      not raw `click()` / hand-built events
- [ ] Form controls tested through `createFormAssociatedTestBed` and the validity helpers
- [ ] The story's `// region default … // endregion` block was regenerated
      (`npm run cem && npm run build:meta`), not hand-edited, and is committed
- [ ] Hand-written stories cover the states a user cares about
- [ ] CHANGELOG updated

## 7. Build and Hygiene

- [ ] `npm run check` (aliases, dependency rules, types) passes
- [ ] `npm run lint` passes — biome, lit-analyzer, prettier, stylelint
- [ ] `npm run test` passes
- [ ] No leftover `console.log`/`debugger`, no commented-out code, no unexplained magic numbers
- [ ] No new heavy third-party dependency

## Frequent Findings

| Finding                                        | Why it matters                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| Missing `addThemingController`                 | The component never reacts to theme changes                           |
| Relative import into `internals`/`theming`     | `npm run check` fails; alias is the contract                          |
| Alias added to `package.json` only             | Breaks only for consumers of the published package                    |
| `igc-` tag name in a description               | Ships verbatim into every framework wrapper's API docs                |
| Hand-edited story metadata                     | Reverts on the next `npm run build:meta`                              |
| `.css.ts` file in the diff                     | Generated and gitignored — the `.scss` is the source                  |
| `[part='base']` with `partMap`                 | Selector silently stops matching once a second part name is emitted   |
| ARIA on a `delegatesFocus` host                | Assistive technology reads the native editor, not the host            |
| New `@hidden` public member                    | Leaks into the compiled public API — use `internalsOf()`              |
| Boolean property defaulting to `true`          | Cannot be turned off from markup                                      |
| `@watch` in new code                           | Lifecycle hooks are the supported path                                |

## Verdict

**Request changes** when: the a11y audit is missing or failing, ARIA is set on the wrong
element, `any` types or native private fields appear, generated artifacts are hand-edited or
missing, themes are incomplete, or the public API is undocumented.

**Approve** when the checklist passes, `npm run check`, `npm run lint` and `npm run test` are
green, and the public API reads the way it will be documented for users.

Be specific in feedback: name the file, the line and the guideline it maps to.
