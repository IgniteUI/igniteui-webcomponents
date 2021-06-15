# Ignite UI Web Components - from Infragistics

[![Node.js CI](https://github.com/IgniteUI/igniteui-webcomponents/workflows/Node.js%20CI/badge.svg)](https://github.com/IgniteUI/igniteui-webcomponents/actions/workflows/node.js.yml)

## Setup

From the root folder run:

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
