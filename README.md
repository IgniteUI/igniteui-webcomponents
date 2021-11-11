# Ignite UI Web Components - from Infragistics

[![Node.js CI](https://github.com/IgniteUI/igniteui-webcomponents/workflows/Node.js%20CI/badge.svg)](https://github.com/IgniteUI/igniteui-webcomponents/actions/workflows/node.js.yml)
[![Coverage Status](https://coveralls.io/repos/github/IgniteUI/igniteui-webcomponents/badge.svg)](https://coveralls.io/github/IgniteUI/igniteui-webcomponents)
[![npm version](https://badge.fury.io/js/igniteui-webcomponents.svg)](https://badge.fury.io/js/igniteui-webcomponents)
[![Discord](https://img.shields.io/discord/836634487483269200?logo=discord&logoColor=ffffff)](https://discord.gg/39MjrTRqds)

[Ignite UI for Web Components](https://www.infragistics.com/products/ignite-ui-web-components) is a complete library of UI components, giving you the ability to build modern web applications using encapsulation and the concept of reusable components in a dependency-free approach.

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
