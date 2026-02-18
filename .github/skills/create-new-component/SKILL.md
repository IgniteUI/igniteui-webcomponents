---
name: create-new-component
description: Create a new Lit web component following project conventions, including component class, styles, tests, Storybook story, and proper exports
---

# Create New Component

This skill guides you through creating a new Lit web component that follows all project conventions and best practices.

## Example Usage

- "Create a new progress-bar component"
- "Add a new stepper component to the library"
- "Create a tooltip component with accessibility support"

## Related Skills

- [add-component-property](../add-component-property/) - Add properties after creating the component
- [update-component-styles](../update-component-styles/) - Modify component styles

## When to Use

- User asks to "create a new component"
- User requests a new UI element for the component library
- User wants to add a new custom element to the project

## Prerequisites

Before starting, ensure:

- [ ] Component name is determined (kebab-case for tag name, PascalCase for class name)
- [ ] Basic component requirements/properties are known
- [ ] Component type identified (simple display, form-associated, or container)

## Required Context

Gather or confirm with the user:

- **Component name**: e.g., "progress-bar" → `IgcProgressBarComponent`
- **Component purpose**: Brief description for JSDoc comments
- **Initial properties**: Any properties the component should expose
- **CSS parts**: What internal parts should be styleable from outside
- **Slots**: What named/default slots are needed

## Steps

### 1. Create Component Directory Structure

Create the component folder with theme directories:

```bash
mkdir -p src/components/[component-name]/themes/{light,dark,shared}
```

**Example**: For "progress-bar":

```bash
mkdir -p src/components/progress-bar/themes/{light,dark,shared}
```

### 2. Create Component TypeScript File

Create `src/components/[component-name]/[component-name].ts`:

```typescript
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/[component-name].base.css.js';
import { styles as shared } from './themes/shared/[component-name].common.css.js';
import { all } from './themes/themes.js';

/**
 * [Component description - one line]
 *
 * @element igc-[component-name]
 *
 * @slot - [Default slot description]
 * @slot [slot-name] - [Named slot description if any]
 *
 * @csspart [part-name] - [Description of the CSS part]
 *
 * @cssproperty --[property-name] - [Description if using CSS custom properties]
 */
export default class Igc[ComponentName]Component extends LitElement {
  public static readonly tagName = 'igc-[component-name]';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(Igc[ComponentName]Component);
  }

  //#region Public properties

  /**
   * [Property description]
   * @attr [attribute-name]
   */
  @property({ reflect: true })
  public someProp = 'default-value';

  //#endregion

  constructor() {
    super();
    addThemingController(this, all);
  }

  //#region Lit lifecycle

  protected override render() {
    return html`
      <div part="base">
        <slot></slot>
      </div>
    `;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-[component-name]': Igc[ComponentName]Component;
  }
}
```

**Critical Points**:

- Import paths end with `.js` extension (TypeScript ESM convention)
- Use `@property` decorator for reactive properties
- **Only expose primitive types** (string, number, boolean) as attributes
- Always include `tagName` and `register()` static members with `readonly` modifier
- **Organize code with region comments**: Internal state, Public properties, Lit lifecycle, Event handlers, Internal API, Public API
- **Prefix internal API** (private properties/methods) with underscore: `_internalMethod()`
- Add theming controller in constructor
- Include comprehensive JSDoc comments
- Declare global HTMLElementTagNameMap interface
- Use explicit return types for methods

### 3. Create Base SCSS File

Create `src/components/[component-name]/themes/[component-name].base.scss`:

```scss
@use '../../../styles/utilities' as *;

:host {
  display: block;
}

[part='base'] {
  // Component styles here
}
```

**Note**: This will be transpiled to `.ts` by the build system. Do NOT create `.ts` files manually.

### 4. Create Shared Theme Files

Create theme-specific SCSS files:

- `themes/shared/[component-name].bootstrap.scss`
- `themes/shared/[component-name].material.scss`
- `themes/shared/[component-name].fluent.scss`
- `themes/shared/[component-name].indigo.scss`

**Minimal theme** (`themes/shared/[component-name].bootstrap.scss`):

```scss
@use '../../../../theming/functions' as *;

:host {
  // Theme-specific styles using igniteui-theming package
}
```

Repeat for all four themes (bootstrap, material, fluent, indigo).

### 5. Create Theme Aggregator

Create `src/components/[component-name]/themes/themes.ts`:

```typescript
import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/[component-name].bootstrap.css.js';
import { styles as material } from './shared/[component-name].material.css.js';
import { styles as fluent } from './shared/[component-name].fluent.css.js';
import { styles as indigo } from './shared/[component-name].indigo.css.js';

const light = {
  bootstrap: css`
    ${bootstrap}
  `,
  material: css`
    ${material}
  `,
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap}
  `,
  material: css`
    ${material}
  `,
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
};

export const all: Themes = { light, dark };
```

### 6. Transpile SCSS to TypeScript

Run the build script to convert SCSS to Lit CSS:

```bash
npm run build:styles
```

**Verify**: `.css.js` files are created next to `.scss` files.

### 7. Create Component Tests

Create `src/components/[component-name]/[component-name].spec.ts`:

```typescript
import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import Igc[ComponentName]Component from './[component-name].js';

describe('[ComponentName]', () => {
  before(() => {
    defineComponents(Igc[ComponentName]Component);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<Igc[ComponentName]Component>(
      html`<igc-[component-name]></igc-[component-name]>`
    );

    await expect(el).shadowDom.to.be.accessible();
    await expect(el).to.be.accessible();
  });

  it('should initialize with default values', async () => {
    const el = await fixture<Igc[ComponentName]Component>(
      html`<igc-[component-name]></igc-[component-name]>`
    );

    expect(el.someProp).to.equal('default-value');
  });

  it('should render content inside', async () => {
    const content = 'Test Content';
    const el = await fixture<Igc[ComponentName]Component>(
      html`<igc-[component-name]>${content}</igc-[component-name]>`
    );

    expect(el).dom.to.have.text(content);
  });

  it('can change properties', async () => {
    const el = await fixture<Igc[ComponentName]Component>(
      html`<igc-[component-name]></igc-[component-name]>`
    );

    el.someProp = 'new-value';
    await elementUpdated(el);

    expect(el.someProp).to.equal('new-value');
  });
});
```

**Testing Requirements**:

- Always include accessibility audit test first
- Test default initialization
- Test property reactivity
- Use `elementUpdated()` after programmatic changes

### 8. Create Storybook Story

Create `stories/[component-name].stories.ts`:

```typescript
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  Igc[ComponentName]Component,
  defineComponents,
} from 'igniteui-webcomponents';

defineComponents(Igc[ComponentName]Component);

const metadata: Meta<Igc[ComponentName]Component> = {
  title: '[ComponentName]',
  component: 'igc-[component-name]',
  parameters: {
    docs: {
      description: {
        component: '[Component description for Storybook docs]',
      },
    },
  },
  argTypes: {
    someProp: {
      type: 'string',
      description: '[Property description]',
      control: 'text',
      table: { defaultValue: { summary: 'default-value' } },
    },
  },
  args: {
    someProp: 'default-value',
  },
};

export default metadata;

interface Igc[ComponentName]Args {
  /** [Property description] */
  someProp: string;
}
type Story = StoryObj<Igc[ComponentName]Args>;

export const Basic: Story = {
  render: (args) => html`
    <igc-[component-name] .someProp=${args.someProp}>
      Content
    </igc-[component-name]>
  `,
};
```

**Story Guidelines**:

- Match argTypes to component properties
- Use property binding (`.propName`) for non-primitives
- Create at least one basic story

### 9. Export Component from Main Index

Add to `src/index.ts` in alphabetical order:

```typescript
export { default as Igc[ComponentName]Component } from './components/[component-name]/[component-name].js';
```

**Example**:

```typescript
export { default as IgcProgressBarComponent } from './components/progress-bar/progress-bar.js';
```

### 10. Build and Test

Run the full build and test suite:

```bash
# Build the project
npm run build

# Run tests
npm run test

# Start Storybook to verify
npm run storybook
```

## Validation Checklist

Verify all of the following:

- [ ] Component file at `src/components/[name]/[name].ts`
- [ ] Extends `LitElement` (or appropriate mixin)
- [ ] `tagName` and `register()` static members defined
- [ ] JSDoc comments with `@element`, `@slot`, `@csspart`
- [ ] Theming controller added in constructor
- [ ] SCSS files exist in themes directory
- [ ] `themes.ts` aggregator imports all themes
- [ ] Test file with accessibility tests
- [ ] Storybook story file
- [ ] Exported from `src/index.ts` alphabetically
- [ ] TypeScript compiles (`npm run build`)
- [ ] Tests pass (`npm run test`)
- [ ] Component appears in Storybook
- [ ] All theme variants render correctly

## Common Pitfalls

### 1. Forgetting SCSS Transpilation

**Problem**: Importing `.css.js` files that don't exist
**Solution**: Always run `npm run build:styles` after creating SCSS files

### 2. Wrong Import Extension

**Problem**: Using `.ts` instead of `.js` in imports
**Solution**: This project uses `.js` extensions for TypeScript imports (ESM standard)

### 3. Exposing Non-Primitives as Attributes

**Problem**: Trying to expose objects/arrays as HTML attributes
**Solution**: Per project guidelines, only primitives (string, number, boolean) should be attributes

### 4. Missing Global Declaration

**Problem**: TypeScript doesn't recognize custom element tag
**Solution**: Always include `declare global { interface HTMLElementTagNameMap {...} }`

### 5. No Theming Controller

**Problem**: Component doesn't respond to theme changes
**Solution**: Add `addThemingController(this, all)` in constructor

### 6. Missing `export default`

**Problem**: Import errors in other files
**Solution**: Always use `export default class` for component classes

### 7. Wrong Export Order

**Problem**: Exports not alphabetized in `src/index.ts`
**Solution**: Find correct alphabetical position before adding

## Reference Examples

### Simple Display Component: Badge

See: `src/components/badge/badge.ts`

**Characteristics**:

- Extends `LitElement` directly
- Uses `@property` decorators
- Includes theming controller
- Simple render with slots
- Dynamic CSS parts with `partMap`

### Form-Associated Component: Textarea

See: `src/components/textarea/textarea.ts`

**Characteristics**:

- Uses `FormAssociatedRequiredMixin`
- Uses `EventEmitterMixin` for events
- `@shadowOptions({ delegatesFocus: true })`
- Form validation support
- Multiple slots and parts

### Container Component: Card

See: `src/components/card/card.ts`

**Characteristics**:

- Registers multiple sub-components
- Simple container logic
- Composition-based architecture

## Architecture Notes

### Key Principles

- **Shadow DOM**: All components use Shadow DOM for encapsulation
- **Composition over Inheritance**: Use slots and sub-components
- **TypeScript Strict Mode**: Avoid `any` types
- **No Native Private Fields**: Use `_prefix` or TypeScript `private`, not `#`
- **Accessibility First**: Every component must pass a11y audits

### Build System

- SCSS transpiles to Lit `css` template literals
- Build script handles transpilation automatically
- Style watching: `npm run styles:watch`

### Testing

- Framework: `@open-wc/testing`
- Accessibility tests are mandatory
- Test both Light and Shadow DOM

### Resources

- [Lit Documentation](https://lit.dev/docs/)
- [Coding Guidelines](../../CODING_GUIDELINES.md) - Comprehensive coding standards
- [igniteui-theming Package](https://www.npmjs.com/package/igniteui-theming)
