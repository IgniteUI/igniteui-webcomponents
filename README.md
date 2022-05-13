# Ignite UI Web Components - from Infragistics

[![Node.js CI](https://github.com/IgniteUI/igniteui-webcomponents/workflows/Node.js%20CI/badge.svg)](https://github.com/IgniteUI/igniteui-webcomponents/actions/workflows/node.js.yml)
[![Coverage Status](https://coveralls.io/repos/github/IgniteUI/igniteui-webcomponents/badge.svg)](https://coveralls.io/github/IgniteUI/igniteui-webcomponents)
[![npm version](https://badge.fury.io/js/igniteui-webcomponents.svg)](https://badge.fury.io/js/igniteui-webcomponents)
[![Discord](https://img.shields.io/discord/836634487483269200?logo=discord&logoColor=ffffff)](https://discord.gg/39MjrTRqds)

[Ignite UI for Web Components](https://www.infragistics.com/products/ignite-ui-web-components) is a complete library of UI components, giving you the ability to build modern web applications using encapsulation and the concept of reusable components in a dependency-free approach. See the [Storybook Here](https://igniteui.github.io/igniteui-webcomponents)!

## Browser Support

![chrome_48x48](https://user-images.githubusercontent.com/2188411/168109445-fbd7b217-35f9-44d1-8002-1eb97e39cdc6.png) | ![firefox_48x48](https://user-images.githubusercontent.com/2188411/168109465-e46305ee-f69f-4fa5-8f4a-14876f7fd3ca.png) | ![edge_48x48](https://user-images.githubusercontent.com/2188411/168109472-a730f8c0-3822-4ae6-9f54-785a66695245.png) | ![opera_48x48](https://user-images.githubusercontent.com/2188411/168109520-b6865a6c-b69f-44a4-9948-748d8afd687c.png) | ![safari_48x48](https://user-images.githubusercontent.com/2188411/168109527-6c58f2cf-7386-4b97-98b1-cfe0ab4e8626.png)
--- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |
## Usage

In order to use the Ignite UI Web Components in your application you should install the `igniteui-webcomponents` package:

```
npm install igniteui-webcomponents
```

Next you will need to import the components that you want to use. You could import one or more components using the `defineComponents` function like this:

```ts
import { defineComponents, IgcAvatarComponent, IgcBadgeComponent } from 'igniteui-webcomponents';

defineComponents(IgcAvatarComponent, IgcBadgeComponent);
```

You could also import all of the components using the `defineAllComponents` function:

```ts
import { defineAllComponents } from 'igniteui-webcomponents';

defineAllComponents();
```

Please note that importing all of the components will increase the bundle size of your application. That's why we recommend you to import only the components that you are actually using.

After the components are imported you could use them in your html:

```html
<igc-avatar initials="AZ"></igc-avatar>
<igc-badge></igc-badge>
```

### Tooling Support
The package contains its own [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org/blog/intro/) as well
as [Custom Data Format](https://code.visualstudio.com/blogs/2020/02/24/custom-data-format) for VSCode.
Refer to your IDE/toolchain documentation to see if you can take advantage of this metadata for linting, type hints and documentation.

Here is a how to enable VSCode auto-completion and hover information for HTML entities from the package.

Add the following line to your user or workspace settings:
```json
{
    "html.customData": [
        "./node_modules/igniteui-webcomponents/vscode-html-custom-data.json"
    ]
}
```

## Setup

In order to run the repository locally from the root folder run:

```
npm install
```

## Linting with ESLint, Prettier, and Types
To scan the project for linting errors, run
```bash
npm run lint
```

You can lint with ESLint and Prettier individually as well
```bash
npm run lint:eslint
```
```bash
npm run lint:prettier
```

To automatically fix many linting errors, run
```bash
npm run format
```

You can format using ESLint and Prettier individually as well
```bash
npm run format:eslint
```
```bash
npm run format:prettier
```

## Testing with Web Test Runner
To run the suite of Web Test Runner tests, run
```bash
npm run test
```

To run the tests in watch mode (for &lt;abbr title=&#34;test driven development&#34;&gt;TDD&lt;/abbr&gt;, for example), run

```bash
npm run test:watch
```

## Demoing with Storybook
To run a local instance of Storybook for your component, run
```bash
npm run storybook
```

To build a production version of Storybook, run
```bash
npm run storybook:build
```

## Local Demo with `web-dev-server`
```bash
npm serve
```
To run a local development server that serves the basic demo located in `demo/index.html`