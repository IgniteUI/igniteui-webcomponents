![Logo Ignite UI Web Components)](https://user-images.githubusercontent.com/52001020/173785249-7ec6ad64-ebfe-402b-9a32-d40e50182b13.png)

<h1 align="center">
  Ignite UI for Web Components - from Infragistics
</h1>

[![Node.js CI](https://github.com/IgniteUI/igniteui-webcomponents/workflows/Node.js%20CI/badge.svg)](https://github.com/IgniteUI/igniteui-webcomponents/actions/workflows/node.js.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/IgniteUI/igniteui-webcomponents/badge)](https://scorecard.dev/viewer/?uri=github.com/IgniteUI/igniteui-webcomponents)
[![Coverage Status](https://coveralls.io/repos/github/IgniteUI/igniteui-webcomponents/badge.svg)](https://coveralls.io/github/IgniteUI/igniteui-webcomponents)
[![npm version](https://badge.fury.io/js/igniteui-webcomponents.svg)](https://badge.fury.io/js/igniteui-webcomponents)
[![License: MIT](https://img.shields.io/github/license/IgniteUI/igniteui-webcomponents)](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/LICENSE)
[![Discord](https://img.shields.io/discord/836634487483269200?logo=discord&logoColor=ffffff)](https://discord.gg/39MjrTRqds)

[Ignite UI for Web Components] is a library that includes the [Data Grid], the [Hierarchical Grid], the Pivot Grid, more than 60 data [Charts], the [Dock Manager] and other components. It also includes maps, gauges and other reusable components that help you create web applications.

[Documentation][Ignite UI for Web Components] · [Storybook] · [Changelog] · [Discord](https://discord.gg/39MjrTRqds)

## Table of contents

- [Table of contents](#table-of-contents)
- [Components](#components)
  - [Grids, Grid Lite and Dock Manager](#grids-grid-lite-and-dock-manager)
    - [The Lightweight Web Components Data Grid and Data Table](#the-lightweight-web-components-data-grid-and-data-table)
    - [Dock Manager - EXCLUSIVE FEATURE](#dock-manager---exclusive-feature)
- [Quick start](#quick-start)
- [Bundling a single theme](#bundling-a-single-theme)
- [Browser support](#browser-support)
- [Tooling](#tooling)
  - [Editor metadata](#editor-metadata)
  - [AI agent skills](#ai-agent-skills)
- [Accessibility](#accessibility)
- [Security and supply chain](#security-and-supply-chain)
- [Privacy](#privacy)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Components

All components in this package are released under the MIT License. The table lists the release in which each component first shipped.

<details open>
<summary>Component list</summary>

| Components              | Status |         Documentation          | Released Version |    License     |
| :---------------------- | :----: | :----------------------------: | :--------------: | :------------: |
| Virtual Scroll          |   ✅    |  [Docs][Virtual scroll Docs]   |     [7.3.0]      | [MIT](LICENSE) |
| QR Code                 |   ✅    |      [Docs][QR Code Docs]      |     [7.3.0]      | [MIT](LICENSE) |
| Color Picker            |   ✅    |   [Docs][Color Picker Docs]    |     [7.3.0]      | [MIT](LICENSE) |
| Splitter                |   ✅    |     [Docs][Splitter Docs]      |     [7.1.0]      | [MIT](LICENSE) |
| Chat                    |   ✅    |       [Docs][Chat Docs]        |     [6.3.0]      | [MIT](LICENSE) |
| Date Range Picker       |   ✅    | [Docs][Date Range Picker Docs] |     [6.1.0]      | [MIT](LICENSE) |
| Tooltip                 |   ✅    |      [Docs][Tooltip Docs]      |     [5.4.0]      | [MIT](LICENSE) |
| File Input              |   ✅    |    [Docs][File Input Docs]     |     [5.4.0]      | [MIT](LICENSE) |
| Tile Manager            |   ✅    |   [Docs][Tile Manager Docs]    |     [5.3.0]      | [MIT](LICENSE) |
| Carousel                |   ✅    |     [Docs][Carousel Docs]      |     [5.1.0]      | [MIT](LICENSE) |
| Date picker             |   ✅    |    [Docs][Date Picker Docs]    |     [4.10.0]     | [MIT](LICENSE) |
| Divider                 |   ✅    |      [Docs][Divider Docs]      |     [4.10.0]     | [MIT](LICENSE) |
| Banner                  |   ✅    |      [Docs][Banner Docs]       |     [4.10.0]     | [MIT](LICENSE) |
| Button group            |   ✅    |   [Docs][Button Group Docs]    |     [4.5.0]      | [MIT](LICENSE) |
| Textarea                |   ✅    |     [Docs][Textarea Docs]      |     [4.5.0]      | [MIT](LICENSE) |
| Combo                   |   ✅    |       [Docs][Combo Docs]       |     [4.1.0]      | [MIT](LICENSE) |
| Stepper                 |   ✅    |      [Docs][Stepper Docs]      |     [4.1.0]      | [MIT](LICENSE) |
| Select                  |   ✅    |      [Docs][Select Docs]       |     [3.4.0]      | [MIT](LICENSE) |
| Dialog                  |   ✅    |      [Docs][Dialog Docs]       |     [3.4.0]      | [MIT](LICENSE) |
| Date Time Input         |   ✅    |  [Docs][Date Time Input Docs]  |     [3.3.0]      | [MIT](LICENSE) |
| Tabs                    |   ✅    |       [Docs][Tabs Docs]        |     [3.3.0]      | [MIT](LICENSE) |
| Accordion               |   ✅    |     [Docs][Accordion Docs]     |     [3.3.0]      | [MIT](LICENSE) |
| Mask Input              |   ✅    |   [Docs][Masked Input Docs]    |     [3.2.0]      | [MIT](LICENSE) |
| Expansion Panel         |   ✅    |  [Docs][Expansion Panel Docs]  |     [3.2.0]      | [MIT](LICENSE) |
| Tree                    |   ✅    |       [Docs][Tree Docs]        |     [3.2.0]      | [MIT](LICENSE) |
| Drop Down               |   ✅    |     [Docs][Dropdown Docs]      |     [2.2.0]      | [MIT](LICENSE) |
| Linear Progress         |   ✅    |  [Docs][Linear Progress Docs]  |     [2.1.0]      | [MIT](LICENSE) |
| Circular Progress       |   ✅    | [Docs][Circular Progress Docs] |     [2.1.0]      | [MIT](LICENSE) |
| Chip                    |   ✅    |       [Docs][Chip Docs]        |     [2.1.0]      | [MIT](LICENSE) |
| Snackbar                |   ✅    |     [Docs][Snackbar Docs]      |     [2.1.0]      | [MIT](LICENSE) |
| Toast                   |   ✅    |       [Docs][Toast Docs]       |     [2.1.0]      | [MIT](LICENSE) |
| Rating                  |   ✅    |      [Docs][Rating Docs]       |     [2.1.0]      | [MIT](LICENSE) |
| Slider                  |   ✅    |      [Docs][Slider Docs]       |     [2.0.0]      | [MIT](LICENSE) |
| Range Slider            |   ✅    |      [Docs][Slider Docs]       |     [2.0.0]      | [MIT](LICENSE) |
| Avatar                  |   ✅    |      [Docs][Avatar Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Badge                   |   ✅    |       [Docs][Badge Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Button                  |   ✅    |      [Docs][Button Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Calendar                |   ✅    |     [Docs][Calendar Docs]      |     [1.0.0]      | [MIT](LICENSE) |
| Card                    |   ✅    |       [Docs][Card Docs]        |     [1.0.0]      | [MIT](LICENSE) |
| Checkbox                |   ✅    |     [Docs][Checkbox Docs]      |     [1.0.0]      | [MIT](LICENSE) |
| Icon                    |   ✅    |       [Docs][Icon Docs]        |     [1.0.0]      | [MIT](LICENSE) |
| Icon Button             |   ✅    |    [Docs][Icon Button Docs]    |     [1.0.0]      | [MIT](LICENSE) |
| Input                   |   ✅    |       [Docs][Input Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| List                    |   ✅    |       [Docs][List Docs]        |     [1.0.0]      | [MIT](LICENSE) |
| Navigation Bar (Navbar) |   ✅    |  [Docs][Navigation Bar Docs]   |     [1.0.0]      | [MIT](LICENSE) |
| Navigation Drawer       |   ✅    | [Docs][Navigation Drawer Docs] |     [1.0.0]      | [MIT](LICENSE) |
| Radio                   |   ✅    |       [Docs][Radio Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Radio Group             |   ✅    |       [Docs][Radio Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Ripple                  |   ✅    |      [Docs][Ripple Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Switch                  |   ✅    |      [Docs][Switch Docs]       |     [1.0.0]      | [MIT](LICENSE) |

</details>

### Grids, Grid Lite and Dock Manager

The grids and the Dock Manager ship in separate packages. Grid Lite is MIT licensed. The other packages are commercial products.

| Components        | Status |         Documentation          |             License              |                                 Package                                  |
| :---------------- | :----: | :----------------------------: | :------------------------------: | :----------------------------------------------------------------------: |
| Pivot Grid        |   ✅    |    [Docs][Pivot Grid Docs]     | [Commercial][Commercial License] |   [Ignite UI Web Components Grids][Ignite UI for WebComponents Grids]    |
| Data Grid         |   ✅    |     [Docs][Data Grid Docs]     | [Commercial][Commercial License] |   [Ignite UI Web Components Grids][Ignite UI for WebComponents Grids]    |
| Tree Grid         |   ✅    |     [Docs][Tree Grid Docs]     | [Commercial][Commercial License] |   [Ignite UI Web Components Grids][Ignite UI for WebComponents Grids]    |
| Hierarchical Grid |   ✅    | [Docs][Hierarchical Grid Docs] | [Commercial][Commercial License] |   [Ignite UI Web Components Grids][Ignite UI for WebComponents Grids]    |
| Grid Lite         |   ✅    |       [Docs][Grid Lite]        |          [MIT](LICENSE)          | [Ignite UI Web Components Grid Lite][Ignite UI Web Components Grid Lite] |

#### The Lightweight Web Components Data Grid and Data Table

The Ignite UI for Web Components Data Grid and Table are lightweight and can process large volumes of data. The Web Components Grid gives data visualization capabilities and fast rendering on all devices. It also has the interactive features that users expect. You need only a small quantity of code to use them.

#### Dock Manager - EXCLUSIVE FEATURE

![Dock Manager Picture]

The Dock Manager gives a complete windowing experience. It splits complex layouts into smaller panes that are easier to manage.

- [Documentation][Dock Manager]
- License - [Commercial][Commercial License]
- Package - [igniteui-dockmanager](https://www.npmjs.com/package/igniteui-dockmanager)

## Quick start

Install the `igniteui-webcomponents` package:

```sh
npm install igniteui-webcomponents
```

Import and register the components you need with the `defineComponents` function:

```ts
import {
  defineComponents,
  IgcAvatarComponent,
  IgcBadgeComponent,
} from 'igniteui-webcomponents';

defineComponents(IgcAvatarComponent, IgcBadgeComponent);
```

You can also register every component at once with `defineAllComponents`:

```ts
import { defineAllComponents } from 'igniteui-webcomponents';

defineAllComponents();
```

Register only the components that you use. When you register all components, the bundle size of your application increases.

After you register the components, use them in your HTML:

```html
<igc-avatar initials="AZ"></igc-avatar><igc-badge></igc-badge>
```

See the [documentation][Ignite UI for Web Components] for guides on each component, theming, and framework integration.

## Bundling a single theme

Each component contains the styles of all four themes (Material, Bootstrap, Indigo and Fluent) and applies the active one. If your application uses only one theme, set the `igc-theme-<name>` condition in your bundler. The bundle then contains only the styles of that theme and is approximately 15–17% smaller after gzip.

| Tool    | Configuration                                                                                                                                       |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite    | `resolve: { conditions: ['igc-theme-bootstrap', ...defaultClientConditions] }`, with `defaultClientConditions` imported from `vite`                 |
| webpack | `resolve: { conditionNames: ['igc-theme-bootstrap', '...'] }`                                                                                       |
| esbuild | `conditions: ['igc-theme-bootstrap']`, or `--conditions=igc-theme-bootstrap` on the command line                                                    |
| Rollup  | `nodeResolve({ exportConditions: ['igc-theme-bootstrap'] })` from `@rollup/plugin-node-resolve`                                                     |
| Node.js | `node --conditions=igc-theme-bootstrap server.js`, for server-side rendering. In Vite, set `ssr.resolve.conditions` with `defaultServerConditions`. |

The condition names are `igc-theme-material`, `igc-theme-bootstrap`, `igc-theme-indigo` and `igc-theme-fluent`. Set only one of them.

- The light and dark variants of the theme stay in the bundle. Thus, you can still switch between them.
- If you call `configureTheme()` with a theme that is not in the bundle, the components show only their structural styles.
- Load the global theme style sheet as before, for example `igniteui-webcomponents/themes/light/bootstrap.css`.
- Without a condition, the bundle contains all four themes, as before.

## Browser support

| ![chrome_48x48] | ![firefox_48x48] | ![edge_48x48] | ![opera_48x48] | ![safari_48x48] |
| --------------- | ---------------- | ------------- | -------------- | --------------- |
| Latest ✔️        | Latest ✔️         | Latest ✔️      | Latest ✔️       | Latest ✔️        |

## Tooling

### Editor metadata

The package includes its own [Custom Elements Manifest], [VSCode Custom Data Format] for VSCode and [Web Types] for JetBrains IDEs.
Refer to the documentation of your editor to find if it can use this metadata for linting, intellisense and documentation.

| Package path                                                 | Description                        |
| ------------------------------------------------------------ | ---------------------------------- |
| igniteui-webcomponents/custom-elements.json                  | Custom Elements Manifest           |
| igniteui-webcomponents/web-types.json                        | Web Types for JetBrains based IDEs |
| igniteui-webcomponents/igniteui-webcomponents.css-data.json  | VSCode CSS custom data             |
| igniteui-webcomponents/igniteui-webcomponents.html-data.json | VSCode HTML custom data            |

### AI agent skills

The package also includes reusable skills for GitHub Copilot and other compatible AI agents. They provide task-specific guidance and current best practices for:

- [Choosing the right components](skills/igniteui-wc-choose-components/SKILL.md)
- [Integrating with React, Angular, Vue, or vanilla JavaScript](skills/igniteui-wc-integrate-with-framework/SKILL.md)
- [Customizing component themes](skills/igniteui-wc-customize-component-theme/SKILL.md)
- [Generating a view from an image or design](skills/igniteui-wc-generate-from-image-design/SKILL.md)
- [Optimizing bundle size](skills/igniteui-wc-optimize-bundle-size/SKILL.md)
- [Migrating from Grid Lite to the premium Data Grid](skills/igniteui-wc-migrate-grid-lite-to-premium/SKILL.md)

After you install the package, copy the skills into your repository so that your agent can find them automatically:

```sh
# Unix/macOS
cp -r node_modules/igniteui-webcomponents/skills/* .github/skills/
```

```powershell
# Windows PowerShell
Copy-Item -Recurse node_modules\igniteui-webcomponents\skills\* .github\skills\
```

See the [AI agent skills guide](skills/README.md) for example prompts, supported workflows, and additional installation locations.

## Accessibility

The components target WCAG 2.1 level AA and follow the ARIA Authoring Practices Guide patterns for their roles. Component specifications run axe-core audits against the light DOM and the shadow DOM. Manual checks with a keyboard and with screen readers such as NVDA also verify the components. The components render in Shadow DOM, so some ARIA relations cannot use IDREF attributes. Instead, the library uses `ElementInternals` and ARIA element reflection. It also adopts new platform capabilities when browsers ship them.

Read [ACCESSIBILITY.md][Accessibility] for the conformance target, the verification process, the platform constraints, and what the host application remains responsible for.

## Security and supply chain

Security fixes are released for the latest major version. Critical fixes are also backported to the previous major version. Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/IgniteUI/igniteui-webcomponents/security/advisories/new). Do not report them in a public issue.

Each [GitHub release](https://github.com/IgniteUI/igniteui-webcomponents/releases) has supply-chain evidence attached. The evidence is the published tarball with its digests, a CycloneDX SBOM, and signed provenance and SBOM attestations. You can check the attestations with `gh attestation verify`.

GitHub's CodeQL default setup scans every push and pull request. The OpenSSF Scorecard runs weekly. Dependabot keeps dependencies and actions patched. Property-based (fuzz) tests with [fast-check](https://fast-check.dev/) check the mask, date, color, QR code and layout parsers. They run on every push and pull request, and weekly with random seeds.

Read [SECURITY.md][Security] for the support policy, the reporting process, the response targets and the verification steps. Read [THREAT-MODEL.md][Threat model] for the trust boundaries and what the host application remains responsible for.

## Privacy

The library collects no data. The components send no telemetry, set no cookies, write nothing to web storage, and load no remote code. [PRIVACY.md][Privacy] lists the few browser capabilities that the components use. Examples are a fetch of an icon URL that the host application registers, and a clipboard write when the user clicks a copy control.

## Contributing

Contributions are welcome. [CONTRIBUTING.md][Contribution Guidelines] tells how to prepare a development environment. It also gives the linting, testing and Storybook commands, and the accessibility, dependency and security requirements for a change. All contributors must follow the [Code of Conduct][Code of Conduct].

## Support

See [SUPPORT.md][Support] for where to report bugs, ask questions, request components, report security or accessibility problems, and reach Infragistics support for the commercial products.

## License

The `igniteui-webcomponents` package is released under the [MIT License][License].

The Grids, Dock Manager and other packages marked *Commercial* above are licensed separately under the [Infragistics commercial license][Commercial License].

[Ignite UI for Web Components]: https://www.infragistics.com/products/ignite-ui-web-components
[Indigo.Design Design System]: https://www.infragistics.com/products/appbuilder/ui-toolkit
[Storybook]: https://igniteui.github.io/igniteui-webcomponents
[Ignite UI for WebComponents Grids]: https://www.npmjs.com/package/igniteui-webcomponents-grids
[Dock Manager Picture]: https://github.com/IgniteUI/igniteui-webcomponents/assets/52001020/a9643f17-f1c2-4554-87aa-96c9daea13b0
[Custom Elements Manifest]: https://github.com/webcomponents/custom-elements-manifest
[VSCode Custom Data Format]: https://github.com/microsoft/vscode-custom-data
[Web Types]: https://plugins.jetbrains.com/docs/intellij/websymbols-web-types.html
[chrome_48x48]: https://user-images.githubusercontent.com/2188411/168109445-fbd7b217-35f9-44d1-8002-1eb97e39cdc6.png
[firefox_48x48]: https://user-images.githubusercontent.com/2188411/168109465-e46305ee-f69f-4fa5-8f4a-14876f7fd3ca.png
[edge_48x48]: https://user-images.githubusercontent.com/2188411/168109472-a730f8c0-3822-4ae6-9f54-785a66695245.png
[opera_48x48]: https://user-images.githubusercontent.com/2188411/168109520-b6865a6c-b69f-44a4-9948-748d8afd687c.png
[safari_48x48]: https://user-images.githubusercontent.com/2188411/168109527-6c58f2cf-7386-4b97-98b1-cfe0ab4e8626.png
[Contribution Guidelines]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/.github/CONTRIBUTING.md
[Data Grid]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/data-grid
[Hierarchical Grid]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/hierarchical-grid/overview
[Charts]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/charts/chart-overview
[Dock Manager]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/dock-manager
[Pivot Grid Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/pivot-grid/overview
[Data Grid Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/grid/overview
[Tree Grid Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/tree-grid/overview
[Hierarchical Grid Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/hierarchical-grid/overview
[Switch Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/switch
[Ripple Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/ripple
[Radio Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/radio
[Navigation Drawer Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/menus/navigation-drawer
[Navigation Bar Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/menus/navbar
[List Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/list
[Input Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/input
[Icon Button Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/icon-button
[Icon Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/icon
[Checkbox Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/checkbox
[Card Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/card
[Calendar Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/scheduling/calendar
[Button Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/button
[Badge Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/badge
[Avatar Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/avatar
[Slider Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/slider
[Rating Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/rating
[Toast Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/toast
[Snackbar Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/snackbar
[Chip Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/chip
[Circular Progress Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/circular-progress
[Linear Progress Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/linear-progress
[Dropdown Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/dropdown
[Tree Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/tree
[Expansion Panel Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/expansion-panel
[Masked Input Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/input
[Accordion Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/accordion
[Tabs Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/tabs
[Date Time Input Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/date-time-input
[Dialog Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/dialog
[Select Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/select
[Stepper Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/stepper
[Combo Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/combo/overview
[Textarea Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/text-area
[Button Group Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/button-group
[Banner Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/banner
[Divider Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/divider
[Date Picker Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/scheduling/date-picker
[Carousel Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/carousel
[Tile Manager Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/tile-manager
[File Input Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/file-input
[Tooltip Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/tooltip
[Date Range Picker Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/scheduling/date-range-picker
[Chat Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/interactivity/chat
[Commercial License]: https://www.infragistics.com/legal/license
[Grid Lite]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grid-lite/overview
[Ignite UI Web Components Grid Lite]: https://www.npmjs.com/package/igniteui-grid-lite
[Splitter Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/splitter
[Color Picker Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/color-picker
[QR Code Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/qr-code
[Virtual scroll Docs]: https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/virtual-scroll
[1.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/1.0.0
[2.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/2.0.0
[2.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/2.1.0
[2.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/2.2.0
[3.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/3.2.0
[3.3.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/3.3.0
[3.4.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/3.4.0
[4.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/4.1.0
[4.5.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/4.5.0
[4.10.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/4.10.0
[5.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/5.1.0
[5.3.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/5.3.0
[5.4.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/5.4.0
[6.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/6.1.0
[6.3.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/6.3.0
[7.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/7.1.0
[7.3.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/7.3.0
[Changelog]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md
[Accessibility]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/ACCESSIBILITY.md
[Security]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/SECURITY.md
[Privacy]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/PRIVACY.md
[Threat model]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/THREAT-MODEL.md
[Support]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/.github/SUPPORT.md
[Code of Conduct]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CODE_OF_CONDUCT.md
[License]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/LICENSE
