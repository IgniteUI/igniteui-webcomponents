---
name: review-component-pr
description: Code review checklist for component pull requests covering structure, public API, specification accuracy, accessibility, behavior, styles, tests, and build hygiene
---

# Review Component PR

A checklist to use on a diff. The rules are in the [Coding Guidelines](../../CODING_GUIDELINES.md).
Read the `spec.md` of the component before the diff. A change that contradicts the spec is a
bug, or the author must also update the spec.

Review in this order. The public API is hard to change after release, so review it early.

## 1. Structure

- [ ] `[name].ts` (single default export), `[name].spec.ts` and `spec.md` in
      `src/components/[name]/`
- [ ] `stories/[name].stories.ts`, with a filename that matches the tag
- [ ] Complete theme scaffold, with every file in `themes.ts`
- [ ] Exported from `src/index.ts` in alphabetical order. Nothing from `src/internals` is
      exported.
- [ ] `#internals` / `#theming` / `#animations` aliases for cross-cutting imports. Relative
      imports between components. `.js` specifiers.
- [ ] A new alias is in `package.json` **and** in `scripts/_package.json`

## 2. Public API and Documentation

- [ ] `tagName`, `styles`, `register()` (with all rendered dependencies), `HTMLElementTagNameMap`
- [ ] Only primitives are attributes. Complex types use `attribute: false` and do not reflect.
- [ ] Booleans default to `false`. Multi-word attributes are kebab-case and explicit.
- [ ] Events use `EventEmitterMixin` with a typed map. Names are `igc` + camelCase, cancelable
      events end in `-ing` and the code checks their return value.
- [ ] Events come from user interaction, not from property sets or method calls
- [ ] JSDoc tags come after the description. `@deprecated since [SemVer]. Use the \`[new]\`
      [type] instead.`
- [ ] No `igc-` tag names in description prose. No "…attribute of…", no `Gets/Sets`. Booleans
      start with "Whether" and match the `true` state.

```bash
# Tag-name leak check: expect no output outside @element/@example
grep -rn "igc-" --include="*.ts" src/ \
  | grep -E "^\S+:[0-9]+:\s*\*" \
  | grep -vE "@element|@example|\.spec\.ts"
```

## 3. Specification

Map each change to a spec section with
[Keeping it current](../../CODING_GUIDELINES.md#keeping-it-current).

- [ ] A new component has a `spec.md` in the splitter structure
- [ ] API tables match the JSDoc for each added, renamed, deprecated or removed member
- [ ] Keyboard, ARIA and limitations sections are updated where the behavior changed
- [ ] Test scenarios mirror the `describe` blocks and are numbered contiguously. Gaps are
      listed under `### Not covered by the suite`.
- [ ] `## Revision history` has a new row
- [ ] New headings have TOC entries. Anchors and relative sibling links resolve.

## 4. Accessibility

- [ ] The a11y audit covers `shadowDom` and the light DOM
- [ ] Semantic elements are used, not `div`s with click handlers
- [ ] ARIA is set through `addInternalsController` (`initialARIA`, `setARIA()`, `reflectRole`),
      never with `this.role = …`
- [ ] Keyboard support uses `addKeybindings` or `addRovingFocusController`. Focus is visible.
      On a `delegatesFocus` item, the roving tab index is on the host, not on an inner element.
- [ ] Composite hosts use `addAriaProjector` / `addAriaTarget`, with no ARIA on a
      `delegatesFocus` host. Cross-root relations use element reflection, not IDREFs.
- [ ] Theme selectors use `data-role` / `data-haspopup`, not `role` / `aria-*`
- [ ] Cross-component access uses `internalsOf()`, not new `@hidden` public members
- [ ] Cross-root ARIA is tested with `runExternalLabelAssociationTests` /
      `runAriaProjectionTests`. Relations are checked by identity readback.
      `axeReflectedRelationsOptions` is used only next to such a check.

## 5. Behavior

- [ ] Region fences and member order follow the guidelines. Internal members use `_`. No `#`
      fields. `readonly` on fields that are not reassigned. No `any`.
- [ ] Derived state in `willUpdate()`. DOM side effects in `update()` with `super.update()`.
      Both guarded by `changedProperties.has()`.
- [ ] Coercion and per-set side effects use `@coercedProperty`, not a hand-written
      backing-field accessor pair
- [ ] Existing internals are reused (controllers, `resizable()` / `draggable()`, `createTimer`,
      `internals/utils`), not written again
- [ ] Dynamic `window` / `document` listeners are removed in `disconnectedCallback`
- [ ] User-facing strings come from `I18nMixin` / `addI18nController`, with defaults from
      `igniteui-i18n-core`
- [ ] Form controls: the correct mixin, `createFormValueState`, `__validators` from
      `#internals/validators.js`, `setValueAndFormState()`, re-validation through
      `@coercedProperty` on constraint properties, and `_handleBlur` / `_handleEnterKeydown`
      on the native editor. No copied touched/pristine logic. `formResetCallback` overrides
      call `super`.

## 6. Styles and Themes

- [ ] No generated `.css.ts` in the diff
- [ ] Load-path specifiers. Values come from `var-get()` and the theming functions.
- [ ] `[part~='…']` selectors. Dark files emit only the `diff()`.
- [ ] All four themes work in light and dark mode. `:host` has a `display` value. Specificity
      is low.

## 7. Tests and Generated Artifacts

- [ ] `defineComponents()` in `before()`. `elementUpdated()` after programmatic changes.
- [ ] Tests cover defaults, reflection, events, interaction and edge cases
- [ ] Interaction uses `#internals/testing/simulate.spec.js`. Forms use
      `createFormAssociatedTestBed` and the validity helpers.
- [ ] No spec imports another component's spec. Shared helpers are in `src/internals/testing/`.
- [ ] The story's `// region default` block was regenerated (`cem` + `build:meta`), not edited
- [ ] CHANGELOG updated

## 8. Build and Hygiene

- [ ] `npm run check`, `npm run lint` and `npm run test` pass
- [ ] No `console.log`, `debugger` or commented-out code. No unexplained magic numbers.
- [ ] No new heavy third-party dependency

## Frequent Findings

| Finding                                   | Why it matters                                                   |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Missing `addThemingController`            | The component ignores theme changes                              |
| Relative import into `internals`          | `npm run check` fails                                            |
| Alias only in `package.json`              | Breaks only for consumers of the published package               |
| `igc-` in a description                   | Goes into the API docs of every framework wrapper                |
| Hand-edited story region or `.css.ts`     | Overwritten on the next build                                    |
| `[part='base']` with `partMap`            | Stops matching when a second part name is added                  |
| ARIA on a `delegatesFocus` host           | Assistive technology reads the native editor                     |
| New `@hidden` public member               | Leaks into the public API. Use `internalsOf()`.                  |
| Hand-written accessor pair for coercion   | `@coercedProperty` does this in fewer lines                      |
| API change with no `spec.md` change       | The spec no longer describes the component                       |
| Spec scenario with no test                | Shows coverage that does not exist                               |

## Verdict

**Request changes** if the a11y audit is missing or fails, ARIA is on the wrong element, `any`
or `#` fields are in the code, generated files are edited or stale, themes are incomplete, the
public API has no documentation, or `spec.md` does not match the behavior.

**Approve** if the checklist passes and `check`, `lint` and `test` pass. Each comment must
give the file, the line and the guideline it applies.
