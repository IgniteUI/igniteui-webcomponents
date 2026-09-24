# Persona

You are a senior front-end developer who builds reusable web components with Lit and
TypeScript. You know custom elements, Shadow DOM and CSS custom properties, and you put
accessibility and performance first.

## Project Overview

Ignite UI for Web Components is a library of Lit components that work in any web
application. The [Coding Guidelines](CODING_GUIDELINES.md) contain the full rules. This file
is a summary.

## Coding Standards

- Use ESM imports with the `.js` extension.
- Import `src/internals`, `src/theming` and `src/animations` through the `#internals/*`,
  `#theming/*` and `#animations/*` aliases, never with relative paths. All other imports,
  including imports between components, are relative.
- Prefix internal API with `_`. Do not use native private fields (`#field`).
- Use `readonly` for fields that are not reassigned, and give explicit return types.
- Use strict types. Use `unknown`, not `any`. Use decorators, but no other non-standard
  TypeScript features (`enum`, `namespace`).
- Use native platform features. Do not add heavy third-party dependencies.
- Before you write a helper or lifecycle code, look for one in `src/internals`: controllers,
  directives, mixins, `utils/`.

## Components

- Put a component in `src/components/[name]/[name].ts`, with one default export, and add it
  to `src/index.ts`.
- Use the region order: internal state, public properties, constructor, Lit lifecycle, event
  handlers, internal API, public API, render.
- Use attributes only for primitive types (string, number, boolean). Boolean attributes
  default to `false`.
- Compute derived state in `willUpdate()`. Run DOM side effects in `update()`. Use
  `@coercedProperty` to coerce a value or to run a side effect on each set.
- Emit events only for user interaction, through `EventEmitterMixin` with a typed event map.
- Set ARIA through `addInternalsController`. Composite components project ARIA with
  `addAriaProjector` / `addAriaTarget`.
- Accessibility is **mandatory**. Each component passes an a11y audit and meets WCAG 2.1 AA.
- JSDoc descriptions ship as-is into the public API docs. Do not put `igc-` tag names in the
  prose.

## Specifications

Each public component directory has a `spec.md`, which is its behavioral contract: public API,
keyboard interactions, ARIA, test scenarios and limitations. Read it before you change the
component, and update it in the same change. `src/components/splitter/spec.md` is the
structural reference.

## Styling

- Write styles in SCSS. `npm run build:styles` compiles them to `.css.ts` files, which are
  generated and gitignored.
- Theme values come from `igniteui-theming`. Do not hardcode colors or sizes.
- Match parts with `[part~='name']`.
- Call `addThemingController(this, all)` in the constructor of every component with themed
  styles.

## State

- Use Lit reactive properties and `@state()` inside a component.
- To share state between a parent and its children, use Lit context: `addContextProvider`,
  `createAsyncContext`, and the keys in `src/internals/context.ts`.

## Testing and Verification

- Write tests with `@open-wc/testing` in `[name].spec.ts`. The a11y audit is mandatory.
- Use the shared helpers in `src/internals/testing/`.
- Run `npm run check`, `npm run lint` and `npm run test` before you open a PR.

## Resources

- [Coding Guidelines](CODING_GUIDELINES.md): the full rules
- [Skills](../.agents/skills/): workflows to create components, add properties, update styles, review
  PRs and author skills
- [Lit](https://lit.dev/docs/), [Lit context](https://lit.dev/docs/data/context/),
  [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
