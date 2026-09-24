# Project Context

Concise context for ACS-aware tools. The full rules live in the
[Coding Guidelines](../../.github/CODING_GUIDELINES.md) and their summary in
[`.github/copilot-instructions.md`](../../.github/copilot-instructions.md).
Read them before making changes; if they disagree with this file, they win.

## Stack

- Language: TypeScript (strict), ESM with `.js` import extensions
- Framework: Lit 3 custom elements with Shadow DOM, `@lit/context` for shared state
- Positioning: `@floating-ui/dom`; localization: `igniteui-i18n-core`
- Styles: SCSS compiled to generated `.css.ts` files, themes from `igniteui-theming`
- Tests: Web Test Runner + Playwright, `@open-wc/testing`, mandatory a11y audits
- Docs and demos: Storybook, Custom Elements Manifest, TypeDoc
- Tooling: oxlint, oxfmt, stylelint, lit-analyzer, dependency-cruiser

## Architecture

- `src/components/[name]/`: one directory per component, with `[name].ts`, `[name].spec.ts`,
  a `spec.md` behavioral contract and, when themed, its SCSS under `themes/`
- `src/internals/`, `src/theming/`, `src/animations/`: shared code, imported only through the
  `#internals/*`, `#theming/*` and `#animations/*` aliases
- `src/extras/`: opt-in add-ons, published as `igniteui-webcomponents/extras`
- `src/styles/`: global SCSS utilities, mixins and themes
- `src/index.ts`: the public entry point of the package
- `stories/`: Storybook stories, one per component tag
- `scripts/`: build, styles, stories, typedoc and changelog scripts; `scripts/_package.json`
  is the published manifest
- `skills/`: public, user-facing skills that ship with the package
- `.agents/`: contributor-facing skills and this context

## Workflow

Read the component's `spec.md` first and update it in the same change. Use the contributor
skills instead of guessing (see [`.agents/skills/`](../skills/README.md)):

- New component: [create-new-component](../skills/create-new-component/SKILL.md)
- New property: [add-component-property](../skills/add-component-property/SKILL.md)
- SCSS and themes: [update-component-styles](../skills/update-component-styles/SKILL.md)
- Reviews: [review-component-pr](../skills/review-component-pr/SKILL.md)
- Skills: [skill-authoring](../skills/skill-authoring/SKILL.md)

Before finishing, run `npm run check`, `npm run lint` and `npm run test`. For a new
component or a bug fix, update `CHANGELOG.md`.

## Do not change without explicit instruction

- `tsconfig*.json` compiler options (strict mode is required)
- `package-lock.json` or new runtime dependencies; prefer native platform features
- Public API names, tag names, events or CSS parts without a deprecation plan
- Generated output: `src/**/*.css.ts`, the `// region default` block of stories,
  `custom-elements.json`, `dist/`
- A new import alias goes into both `package.json` and `scripts/_package.json`, never one only
