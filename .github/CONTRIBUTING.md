# Contributing to Ignite UI Web Components

This document contains the guidelines for contributions of code, documentation and other improvements to the project.

## Code of Conduct

Follow the [Code of Conduct](../CODE_OF_CONDUCT.md) in all interactions with project maintainers and other users.

Refer to the general [Guidelines in Ignite UI for Angular](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md) for issue and pull request statuses, the testing process and other details.

## Getting Started

- **Fork the Repository**: Before you make changes, create a fork of the repository on your GitHub account. With a fork, you can edit the code without an effect on the main project code.
- **Clone your Fork**: Use Git to clone your fork to your local machine. This creates a local copy of the project for your work.
- **Create a Branch**: Create a new branch for your contribution. A branch keeps your changes isolated and organized.

No contributor license agreement or sign-off is required. As stated in the [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#6-contributions-under-repository-license):

- Your contribution is licensed under the project's [MIT License](../LICENSE).
- When you submit your contribution, you agree that you have the right to license it under those terms.

## Set up

Install [Node >= 24.0.0](https://nodejs.org/en) on your machine.

After you install the minimum Node version, continue with the rest of the repository setup.

```shell
node -v
v24.0.0

git clone https://github.com/IgniteUI/igniteui-webcomponents.git
cd igniteui-webcomponents
npm ci
npm start
```

## Development workflow

### Linting and formatting

To scan the project for linting errors, run:

```sh
npm run lint
```

To automatically fix most linting and formatting errors, run:

```sh
npm run format
```

Linting and formatting also run in a pre-commit hook.

### Type checks and consistency checks

```sh
npm run check
```

This command runs every `check-*` script:

- The type checks for the sources, scripts and stories.
- The import-boundary check.
- The import-alias check.
- The component registration check.
- The public API check.

The public API check compares the custom elements manifest and the exports of `src/index.ts` with the committed `public-api.json`. It fails on a removal or a type change, and lists the additions. After an intended public API change, run `npm run public-api:update`. Then commit `public-api.json` with your change.

### Testing with Web Test Runner

To run the suite of Web Test Runner tests, run:

```sh
npm run test
```

To run the tests in watch mode, run:

```sh
npm run test:watch
```

### Property-based tests

Parsers, converters and serializers that take user or stored input also have property-based (fuzz) tests with [fast-check](https://fast-check.dev/), in `[module].property.spec.ts`. They run with the rest of the suite. fast-check shrinks a failure to a minimal counterexample.

`npm run test` uses a fixed seed, so a run fails only for a counterexample that your change causes. Each week, the [Fuzz workflow](workflows/fuzz.yml) uses a random seed and more runs. To do the same locally, set:

| Variable       | Effect                                                      |
| -------------- | ----------------------------------------------------------- |
| `FC_SEED`      | The seed. `random` picks a new one.                         |
| `FC_NUM_RUNS`  | The number of runs for each property. The default is 100.   |
| `TEST_TIMEOUT` | The test timeout in milliseconds, for a high `FC_NUM_RUNS`. |

```sh
FC_SEED=random FC_NUM_RUNS=1000 TEST_TIMEOUT=120000 npx wtr --files "src/**/*.property.spec.ts"
```

A failed property shows its seed and counterexample. To replay it, use the same seed and run count: `FC_SEED=<seed> FC_NUM_RUNS=<runs> npx wtr --files <spec>`. The weekly run uses 1000. Fix the code. Then add the counterexample to the example-based suite. Change a property only if the property is wrong.

### Demoing with Storybook

To start a local instance of Storybook for your component, run:

```sh
npm run storybook
```

To build a production version of Storybook, run:

```sh
npm run storybook:build
```

## Making Changes

- **Code Style**: Follow the [existing code style conventions](./CODING_GUIDELINES.md) of the project. These conventions can include specific formatting guidelines or linting tools. For details, refer to the codebase of the project or to the existing documentation.
- **Commit Messages**: Write clear and concise commit messages that describe your changes.
- **Testing**: Make sure that your contribution includes relevant tests. The tests verify the functionality and prevent regressions.
- **Specifications**: Every public component has a specification at `src/components/[name]/spec.md`. See [Component Specifications](#component-specifications) below.

## Component Specifications

Each component directory has a `spec.md` that describes the component. It contains the overview and user stories, the public API, the keyboard interactions and ARIA semantics, the test scenarios, and the assumptions and limitations. The specification is the behavioral contract. Reviewers, consumers and future contributors read it to learn the intended behavior of the component.

- **A new component ships with a specification.** Write it before the implementation. The purpose of the document is to decide the public API, the keyboard model and the accessibility semantics first. Copy the structure of [`src/components/splitter/spec.md`](../src/components/splitter/spec.md). All other specifications follow this reference.
- **A new feature updates the specification of the component it touches.** A property, method, event, slot, CSS part or CSS custom property that is added, renamed, deprecated or removed belongs in the relevant API table. A new keyboard interaction, ARIA role or state, constraint or precedence rule belongs in the corresponding section.
- **Test scenarios mirror the suite that exists.** Each subsection matches a `describe` block, and the scenarios are numbered contiguously. If no test covers a documented behavior, write this under `### Not covered by the suite`. Do not imply coverage.
- **Record the change.** Add a row to the `## Revision history` table with the next version, the date and a short note. A new component starts at version 1.
- **Keep the table of contents current.** You maintain it by hand. Every `##` and `###` heading needs an entry with an anchor that resolves.

Specifications do not have ownership, approval or sign-off sections. The revision history has no author column, because `git` already records who changed what. Put design hand-off links, such as Figma files, under `### End-user experience`. Keep these links when you update the specification.

A pull request that changes behavior but does not update the affected specification is incomplete. Reviewers will ask for the update.
- **Changelog**: Add an entry under `[Unreleased]` in [CHANGELOG.md](../CHANGELOG.md) for every user-visible change. The file follows [Keep a Changelog](https://keepachangelog.com/). Use the `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` and `Security` categories. Put a fix for a vulnerability under `Security`. Add a link to the advisory after it is published.

## Accessibility

Accessibility is a requirement, not a feature. See [ACCESSIBILITY.md](../ACCESSIBILITY.md) for the conformance target and the platform constraints that shape how the components expose semantics.

- New and changed component specifications must audit the component with axe in each state that the specification exercises. Audit both the light DOM and the shadow DOM: `await expect(el).to.be.accessible()` and `await expect(el).shadowDom.to.be.accessible()`.
- Follow the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) pattern for the component's role, including its keyboard interaction. Add keyboard tests for it.
- Publish semantics through `ElementInternals` and ARIA element reflection rather than IDREF attributes, so that relations work across shadow boundaries. Use the controllers under `src/internals/controllers` instead of setting ARIA attributes by hand.
- Disable an axe rule only when it misreports semantics published through internals or element reflection. Assert the real relation in the specification instead. Document the exception next to the shared options in `src/internals/testing/helpers.spec.ts`.
- Verify interactive changes by hand with a keyboard and a screen reader before you request a review.

## Dependencies

Runtime dependencies increase the install footprint and the attack surface of every application that uses the library. Thus, the project adds them rarely and deliberately.

- **Discuss first.** Open an issue or a discussion before you add a runtime dependency or an optional peer dependency. When possible, use a small, focused implementation in `src/internals` instead of a package that does more than the component needs.
- **Licenses.** Runtime and peer dependencies must be licensed under MIT, BSD-2-Clause, BSD-3-Clause, ISC, Apache-2.0, 0BSD or an equivalent permissive license. The project does not accept copyleft licenses (GPL, LGPL, AGPL, SSPL) for anything that ships to consumers. The project accepts dual-licensed packages when one of the options is permissive.
- **Manifests.** Declare a runtime dependency in both `package.json` and the published manifest `scripts/_package.json`. Declare optional peer dependencies with `peerDependenciesMeta.optional: true` in the published manifest.
- **Lockfile.** Commit `package-lock.json` changes together with the manifest change. Install with `npm ci`. Do not use `npm install`, because the lockfile must stay authoritative.
- **Updates.** Maintainers do routine npm version bumps in batches. Do not open a pull request only to bump a dependency. When you add or update a GitHub Action, pin it to a commit SHA. Put the version in a trailing comment. See [SECURITY.md](../SECURITY.md#dependencies) for how updates are raised.
- **Dev dependencies** follow the same license rules. Apart from these rules, the maintainers decide about dev dependencies.

## Security

Do not report a vulnerability in a public issue, discussion or pull request. Use [private vulnerability reporting](https://github.com/IgniteUI/igniteui-webcomponents/security/advisories/new) as described in [SECURITY.md](../SECURITY.md).

When you contribute code, follow these rules:

- Treat every value that reaches a component from the host page as untrusted. Render text as text. When a feature must render HTML, sanitize it and make the sanitizer replaceable, as the chat markdown renderer does.
- Do not add network requests, storage access or telemetry. The library's [privacy commitments](../PRIVACY.md) depend on this.
- Do not introduce `eval`, `new Function`, string-based timers or other string-to-code paths.
- Update [THREAT-MODEL.md](../THREAT-MODEL.md) when a change adds one of these items:
  - A new way for data to reach the DOM.
  - A new network request.
  - A new browser capability.
  - A new release step.
- Reviewers check changes to the workflows under `.github/workflows` or to the scripts that build and publish the package for supply-chain impact. Keep job permissions minimal and actions pinned.

## Contributing Code

- **Pull Requests**: When your changes are ready, submit a pull request to the main repository.
- **Pull Request Description**: Write a detailed description of your pull request. Include the issue that it addresses, if there is one, and the changes that you made.
- **Code Reviews**: During the code review, respond to the feedback and make the necessary revisions.

## Reporting Issues

- **Search Existing Issues**: Before you create a new issue, search for a similar issue that already exists.
- **Clear and Descriptive Titles**: Use clear and descriptive titles for your issue reports to help maintainers understand the problem quickly.
- **Provide Details**: In your issue report, give as much detail as possible to help diagnose the problem. Useful details include the steps to reproduce the issue, the error messages and the expected behavior.
