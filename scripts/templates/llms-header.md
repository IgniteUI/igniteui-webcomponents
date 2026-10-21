# Ignite UI for Web Components

> Accessible, themable UI components built with Lit as standard custom elements. They work in any web framework or with no framework. MIT license. This file and the pages that it links describe the version of the `igniteui-webcomponents` package that they ship with. The build generates them from the Custom Elements Manifest of that version.

- Install the package with `npm install igniteui-webcomponents`.
- Import the component classes from the package root and register them with `defineComponents()`, for example `defineComponents(IgcButtonComponent, IgcInputComponent)`. `defineAllComponents()` registers all the components, but it makes the bundle larger.
- Load one theme style sheet, for example `igniteui-webcomponents/themes/light/bootstrap.css`. The themes are `material`, `bootstrap`, `indigo` and `fluent`, each in `light` and `dark`. To change the theme at run time, call `configureTheme('material', 'dark')`.
- Tag names start with `igc-`. Class names have the form `Igc<Name>Component`. Event names start with `igc`, for example `igcChange`. The `Igc<Name>ComponentEventMap` type gives the `detail` type of each event.
- Form controls are form-associated custom elements. They submit their value with a `<form>` and support the Constraint Validation API, as native controls do.
- You can set a property that has an attribute in HTML. You can set a property without an attribute only in JavaScript.
- Style a component through its CSS parts (`::part()`) and its CSS custom properties. Each component page lists them.
- The data grids, the charts and the dock manager are in other packages. The documentation index below covers them.
