# Integrating Ignite UI Web Components — Angular

## Installation

```bash
npm install igniteui-webcomponents
```

## Setup

### Step 1 — Register the theme and components

In `src/main.ts`, import a theme and register the components before bootstrapping:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import { defineComponents, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcInputComponent);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### Step 2 — Add `CUSTOM_ELEMENTS_SCHEMA`

Angular requires `CUSTOM_ELEMENTS_SCHEMA` to accept custom element tags in templates.

**Standalone components** — add the schema to each component that uses Ignite UI elements:

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <igc-button variant="contained">Click me</igc-button>
  `
})
export class MyComponent {}
```

**NgModule-based apps** — add the schema once to `AppModule` (or the relevant module):

```typescript
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Available Themes

| Theme     | Light                                                  | Dark                                                  |
|-----------|--------------------------------------------------------|-------------------------------------------------------|
| Bootstrap | `igniteui-webcomponents/themes/light/bootstrap.css`    | `igniteui-webcomponents/themes/dark/bootstrap.css`    |
| Material  | `igniteui-webcomponents/themes/light/material.css`     | `igniteui-webcomponents/themes/dark/material.css`     |
| Fluent    | `igniteui-webcomponents/themes/light/fluent.css`       | `igniteui-webcomponents/themes/dark/fluent.css`       |
| Indigo    | `igniteui-webcomponents/themes/light/indigo.css`       | `igniteui-webcomponents/themes/dark/indigo.css`       |

## Usage in Templates

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <igc-button
      #myButton
      variant="contained"
      (click)="handleClick($event)">
      Click me
    </igc-button>

    <igc-input
      [label]="inputLabel"
      [placeholder]="'Enter your name'"
      [required]="true"
      (igcChange)="handleChange($event)">
    </igc-input>
  `
})
export class MyComponent implements AfterViewInit {
  @ViewChild('myButton') buttonRef!: ElementRef;

  inputLabel = 'Name';

  ngAfterViewInit() {
    // Access the native element directly if needed
    const button = this.buttonRef.nativeElement;
  }

  handleClick(event: PointerEvent) {
    console.log('Button clicked');
  }

  handleChange(event: CustomEvent) {
    console.log('Input changed', event.detail);
  }
}
```

## Working with Complex Properties

Use Angular property binding `[property]` to pass objects and arrays:

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <igc-combo [data]="items"></igc-combo>
  `
})
export class MyComponent {
  items = [
    { value: 1, label: 'Item 1' },
    { value: 2, label: 'Item 2' },
  ];
}
```

## Key Considerations

| Concern | Details |
|---------|---------|
| **CUSTOM_ELEMENTS_SCHEMA** | Required in every module or standalone component that uses `igc-*` tags |
| **Event binding** | Use Angular syntax: `(igcChange)="handler($event)"` |
| **Property binding** | Use `[property]="value"` for reactive data and complex types |
| **Form integration** | Web components work with Angular Forms via `ngModel` or reactive form controls |

## TypeScript Support

The `igniteui-webcomponents` package automatically registers all component types in `HTMLElementTagNameMap`. DOM queries are fully typed:

```typescript
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent);

// Automatically typed as IgcButtonComponent | null
const button = document.querySelector('igc-button');
```

## Common Issues

### Angular template error: "Unknown element"

Add `CUSTOM_ELEMENTS_SCHEMA` to the component's `schemas` array (standalone) or to the module (NgModule).

### Events not firing

Use Angular's event binding syntax `(igcChange)="handler($event)"` — not `(change)`. Ignite UI components emit prefixed custom events (e.g., `igcInput`, `igcChange`).

### No styles applied

Ensure you import a theme CSS file in `main.ts` before bootstrapping.

### Properties not updating

Use `[property]="value"` binding for complex or reactive data. Attribute strings (e.g. `label="Name"`) work for primitive values only.

---

## Next Steps

- [Optimize bundle size](../../optimize-bundle-size/) — import only the components you use
- [Customize themes](../../customize-component-theme/) — apply your brand colors
- [Component documentation](https://igniteui.github.io/igniteui-webcomponents) — full API reference
