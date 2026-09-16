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

[Ignite UI for Web Components] is a comprehensive library that includes the fastest [Data Grid] on the market, a high-performing [Hierarchical Grid], Pivot Grid, 60+ data [Charts], [Dock Manager], and more. Plus maps, gauges and other reusable feature-rich components to help you create better web apps and modern-day UX experiences.

[Documentation][Ignite UI for Web Components] · [Storybook] · [Changelog] · [Discord](https://discord.gg/39MjrTRqds)

## Table of contents

- [Quick start](#quick-start)
- [Components](#components)
- [Browser support](#browser-support)
- [Tooling](#tooling)
- [Accessibility](#accessibility)
- [Security and supply chain](#security-and-supply-chain)
- [Privacy](#privacy)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

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

Registering all components increases the bundle size of your application, so register only the ones you use.

After the components are registered, use them in your HTML:

```html
<igc-avatar initials="AZ"></igc-avatar><igc-badge></igc-badge>
```

See the [documentation][Ignite UI for Web Components] for guides on each component, theming, and framework integration.

## Components

All components in this package are released under the MIT License. The table lists the release in which each component first shipped.

<details open>
<summary>Component list</summary>

| Components              | Status |         Documentation          | Released Version |    License     |
| :---------------------- | :----: | :----------------------------: | :--------------: | :------------: |
| Virtual Scroll          |   ✅   |       [Storybook][Storybook]   |     [7.3.0]      | [MIT](LICENSE) |
| QR Code                 |   ✅   |       [Storybook][Storybook]   |     [7.3.0]      | [MIT](LICENSE) |
| Color Picker            |   ✅   |       [Storybook][Storybook]   |     [7.3.0]      | [MIT](LICENSE) |
| Splitter                |   ✅   |     [Docs][Splitter Docs]      |     [7.1.0]      | [MIT](LICENSE) |
| Chat                    |   ✅   |       [Docs][Chat Docs]        |     [6.3.0]      | [MIT](LICENSE) |
| Date Range Picker       |   ✅   | [Docs][Date Range Picker Docs] |     [6.1.0]      | [MIT](LICENSE) |
| Tooltip                 |   ✅   |      [Docs][Tooltip Docs]      |     [5.4.0]      | [MIT](LICENSE) |
| File Input              |   ✅   |    [Docs][File Input Docs]     |     [5.4.0]      | [MIT](LICENSE) |
| Tile Manager            |   ✅   |   [Docs][Tile Manager Docs]    |     [5.3.0]      | [MIT](LICENSE) |
| Carousel                |   ✅   |     [Docs][Carousel Docs]      |     [5.1.0]      | [MIT](LICENSE) |
| Date picker             |   ✅   |    [Docs][Date Picker Docs]    |     [4.10.0]     | [MIT](LICENSE) |
| Divider                 |   ✅   |      [Docs][Divider Docs]      |     [4.10.0]     | [MIT](LICENSE) |
| Banner                  |   ✅   |      [Docs][Banner Docs]       |     [4.10.0]     | [MIT](LICENSE) |
| Button group            |   ✅   |   [Docs][Button Group Docs]    |     [4.5.0]      | [MIT](LICENSE) |
| Textarea                |   ✅   |     [Docs][Textarea Docs]      |     [4.5.0]      | [MIT](LICENSE) |
| Combo                   |   ✅   |       [Docs][Combo Docs]       |     [4.1.0]      | [MIT](LICENSE) |
| Stepper                 |   ✅   |      [Docs][Stepper Docs]      |     [4.1.0]      | [MIT](LICENSE) |
| Select                  |   ✅   |      [Docs][Select Docs]       |     [3.4.0]      | [MIT](LICENSE) |
| Dialog                  |   ✅   |      [Docs][Dialog Docs]       |     [3.4.0]      | [MIT](LICENSE) |
| Date Time Input         |   ✅   |  [Docs][Date Time Input Docs]  |     [3.3.0]      | [MIT](LICENSE) |
| Tabs                    |   ✅   |       [Docs][Tabs Docs]        |     [3.3.0]      | [MIT](LICENSE) |
| Accordion               |   ✅   |     [Docs][Accordion Docs]     |     [3.3.0]      | [MIT](LICENSE) |
| Mask Input              |   ✅   |   [Docs][Masked Input Docs]    |     [3.2.0]      | [MIT](LICENSE) |
| Expansion Panel         |   ✅   |  [Docs][Expansion Panel Docs]  |     [3.2.0]      | [MIT](LICENSE) |
| Tree                    |   ✅   |       [Docs][Tree Docs]        |     [3.2.0]      | [MIT](LICENSE) |
| Drop Down               |   ✅   |     [Docs][Dropdown Docs]      |     [2.2.0]      | [MIT](LICENSE) |
| Linear Progress         |   ✅   |  [Docs][Linear Progress Docs]  |     [2.1.0]      | [MIT](LICENSE) |
| Circular Progress       |   ✅   | [Docs][Circular Progress Docs] |     [2.1.0]      | [MIT](LICENSE) |
| Chip                    |   ✅   |       [Docs][Chip Docs]        |     [2.1.0]      | [MIT](LICENSE) |
| Snackbar                |   ✅   |     [Docs][Snackbar Docs]      |     [2.1.0]      | [MIT](LICENSE) |
| Toast                   |   ✅   |       [Docs][Toast Docs]       |     [2.1.0]      | [MIT](LICENSE) |
| Rating                  |   ✅   |      [Docs][Rating Docs]       |     [2.1.0]      | [MIT](LICENSE) |
| Slider                  |   ✅   |      [Docs][Slider Docs]       |     [2.0.0]      | [MIT](LICENSE) |
| Range Slider            |   ✅   |      [Docs][Slider Docs]       |     [2.0.0]      | [MIT](LICENSE) |
| Avatar                  |   ✅   |      [Docs][Avatar Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Badge                   |   ✅   |       [Docs][Badge Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Button                  |   ✅   |      [Docs][Button Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Calendar                |   ✅   |     [Docs][Calendar Docs]      |     [1.0.0]      | [MIT](LICENSE) |
| Card                    |   ✅   |       [Docs][Card Docs]        |     [1.0.0]      | [MIT](LICENSE) |
| Checkbox                |   ✅   |     [Docs][Checkbox Docs]      |     [1.0.0]      | [MIT](LICENSE) |
| Icon                    |   ✅   |       [Docs][Icon Docs]        |     [1.0.0]      | [MIT](LICENSE) |
| Icon Button             |   ✅   |    [Docs][Icon Button Docs]    |     [1.0.0]      | [MIT](LICENSE) |
| Input                   |   ✅   |       [Docs][Input Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| List                    |   ✅   |       [Docs][List Docs]        |     [1.0.0]      | [MIT](LICENSE) |
| Navigation Bar (Navbar) |   ✅   |  [Docs][Navigation Bar Docs]   |     [1.0.0]      | [MIT](LICENSE) |
| Navigation Drawer       |   ✅   | [Docs][Navigation Drawer Docs] |     [1.0.0]      | [MIT](LICENSE) |
| Radio                   |   ✅   |       [Docs][Radio Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Radio Group             |   ✅   |       [Docs][Radio Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Ripple                  |   ✅   |      [Docs][Ripple Docs]       |     [1.0.0]      | [MIT](LICENSE) |
| Switch                  |   ✅   |      [Docs][Switch Docs]       |     [1.0.0]      | [MIT](LICENSE) |

</details>

### Grids, Grid Lite and Dock Manager

The grids and the Dock Manager ship in separate packages. Grid Lite is MIT licensed; the others are commercial products.

| Components        | Status |         Documentation          |             License              |                                 Package                                  |
| :---------------- | :----: | :----------------------------: | :------------------------------: | :----------------------------------------------------------------------: |
| Pivot Grid        |   ✅   |    [Docs][Pivot Grid Docs]     | [Commercial][Commercial License] |   [Ignite UI Web Components Grids][Ignite UI for WebComponents Grids]    |
| Data Grid         |   ✅   |     [Docs][Data Grid Docs]     | [Commercial][Commercial License] |   [Ignite UI Web Components Grids][Ignite UI for WebComponents Grids]    |
| Tree Grid         |   ✅   |     [Docs][Tree Grid Docs]     | [Commercial][Commercial License] |   [Ignite UI Web Components Grids][Ignite UI for WebComponents Grids]    |
| Hierarchical Grid |   ✅   | [Docs][Hierarchical Grid Docs] | [Commercial][Commercial License] |   [Ignite UI Web Components Grids][Ignite UI for WebComponents Grids]    |
| Grid Lite         |   ✅   |       [Docs][Grid Lite]        |          [MIT](LICENSE)          | [Ignite UI Web Components Grid Lite][Ignite UI Web Components Grid Lite] |

#### The Lightweight Web Components Data Grid and Data Table

The Ignite UI for Web Components Data Grid and Table are both lightweight and developed to handle high data volumes. The Web Components Grid offers powerful data visualization capabilities and superior performance on any device. With interactive features that users expect. Fast rendering. Unbeatable interactions. And the best possible user experience that you wouldn’t otherwise be able to achieve with so little code on your own.

#### Dock Manager - EXCLUSIVE FEATURE

![Dock Manager Picture]

Provide a complete windowing experience, splitting complex layouts into smaller, easier-to-manage panes.

- [Documentation][Dock Manager]
- License - [Commercial][Commercial License]
- Package - [igniteui-dockmanager](https://www.npmjs.com/package/igniteui-dockmanager)

## Browser support

| ![chrome_48x48] | ![firefox_48x48] | ![edge_48x48] | ![opera_48x48] | ![safari_48x48] |
| --------------- | ---------------- | ------------- | -------------- | --------------- |
| Latest ✔️       | Latest ✔️        | Latest ✔️     | Latest ✔️      | Latest ✔️       |

## Tooling

### Editor metadata

The package comes with its own [Custom Elements Manifest], [VSCode Custom Data Format] for VSCode and [Web Types] for JetBrains IDEs.
Refer to the documentation of your editor of choice to see if you can take advantage of this metadata for linting, intellisense and documentation.

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

After installing the package, copy the skills into your repository so your agent can discover them automatically:

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

The components target WCAG 2.1 level AA and follow the ARIA Authoring Practices Guide patterns for their roles. Every component specification runs axe-core audits against both the light DOM and the shadow DOM, and components are verified by hand with a keyboard and screen readers such as NVDA. Because the components render in Shadow DOM, some ARIA relations cannot be expressed with IDREF attributes; the library uses `ElementInternals` and ARIA element reflection instead, and adopts new platform capabilities as browsers ship them.

Read [ACCESSIBILITY.md][Accessibility] for the conformance target, the verification process, the platform constraints, and what the host application remains responsible for.

## Security and supply chain

Security fixes are released for the latest major version, and critical fixes are backported to the previous major. Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/IgniteUI/igniteui-webcomponents/security/advisories/new), never in a public issue.

Every release ships with supply-chain evidence attached to the [GitHub release](https://github.com/IgniteUI/igniteui-webcomponents/releases): the published tarball with its digests, a CycloneDX SBOM, and signed provenance and SBOM attestations that you can check with `gh attestation verify`. GitHub's CodeQL default setup scans every push and pull request, the OpenSSF Scorecard runs weekly, and Dependabot keeps dependencies and actions patched.

Read [SECURITY.md][Security] for the support policy, the reporting process, response targets, verification steps, and security considerations for consumers.

## Privacy

The library collects no data. The components send no telemetry, set no cookies, write nothing to web storage, and load no remote code. The few browser capabilities they use, such as fetching an icon URL the host application registers or writing to the clipboard when the user clicks a copy control, are listed in [PRIVACY.md][Privacy].

## Contributing

Contributions are welcome. [CONTRIBUTING.md][Contribution Guidelines] covers setting up a development environment, the linting, testing and Storybook commands, and the accessibility, dependency and security requirements for a change. All contributors are expected to follow the [Code of Conduct][Code of Conduct].

## Support

See [SUPPORT.md][Support] for where to report bugs, ask questions, request components, report security or accessibility problems, and reach Infragistics support for the commercial products.

## License

The `igniteui-webcomponents` package is released under the [MIT License][License]. Third-party runtime dependencies and their license terms are listed in [THIRD-PARTY-NOTICES.md][Third-party notices].

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
[Support]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/.github/SUPPORT.md
[Code of Conduct]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CODE_OF_CONDUCT.md
[License]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/LICENSE
[Third-party notices]: https://github.com/IgniteUI/igniteui-webcomponents/blob/master/THIRD-PARTY-NOTICES.md
