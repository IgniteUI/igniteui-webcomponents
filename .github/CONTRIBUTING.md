# Contributing to Ignite UI Web Components

We're excited you're interested in contributing to Ignite UI Web Components! This document outlines the guidelines for contributing code, documentation, and other improvements to the project.

## Code of Conduct

We have a [Code of Conduct](../CODE_OF_CONDUCT.md), please follow it in all interactions with project maintainers and fellow users.

For detailed information on issue and pull request statuses, process for testing, etc. please refer to the general [Guidelines in Ignite UI for Angular](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md).

## Getting Started

- **Fork the Repository**: Before making changes, create a fork of the repository on your GitHub account. This allows you to make your own edits without affecting the main project code.
- **Clone your Fork**: Clone your forked repository to your local machine using Git. This will create a local copy of the project you can work on.
- **Create a Branch**: Create a new branch for your specific contribution. This helps keep your changes isolated and organized.

No contributor license agreement or sign-off is required. As stated in the [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#6-contributions-under-repository-license), your contribution is licensed under the project's [MIT License](../LICENSE), and by submitting it you agree that you have the right to license it under those terms.

## Set up

You will need at least [Node >= 24.0.0](https://nodejs.org/en) installed on your machine.

Once you have the minimum Node version installed, you can continue with the rest of the repo setup.

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

This runs every `check-*` script: type checks for the sources, scripts and stories, the import-boundary check, the import-alias check and the third-party notices check.

### Testing with Web Test Runner

To run the suite of Web Test Runner tests, run:

```sh
npm run test
```

To run the tests in watch mode, run:

```sh
npm run test:watch
```

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

- **Code Style**: Follow the [existing code style conventions](./CODING_GUIDELINES.md) used in the project. This might involve specific formatting guidelines or linting tools. Refer to the project's codebase or any existing documentation for details.
- **Commit Messages**: Write clear and concise commit messages that describe your changes.
- **Testing**: Ensure your contributions include relevant tests to verify their functionality and avoid introducing regressions.
- **Specifications**: Every public component has a specification at `src/components/[name]/spec.md`. See [Component Specifications](#component-specifications) below.

## Component Specifications

Each component directory holds a `spec.md` describing that component: its overview and user stories, its public API, its keyboard interactions and ARIA semantics, its test scenarios, and its assumptions and limitations. The specification is the behavioral contract — it is what reviewers, consumers and future contributors read to learn what the component is supposed to do.

- **A new component ships with a specification.** Write it before the implementation: deciding the public API, the keyboard model and the accessibility semantics up front is the point of the document. Copy the structure of [`src/components/splitter/spec.md`](../src/components/splitter/spec.md), which is the reference every other specification follows.
- **A new feature updates the specification of the component it touches.** A property, method, event, slot, CSS part or CSS custom property that is added, renamed, deprecated or removed belongs in the relevant API table. A new keyboard interaction, ARIA role or state, constraint or precedence rule belongs in the corresponding section.
- **Test scenarios mirror the suite that exists.** Each subsection matches a `describe` block, and the scenarios are numbered contiguously. Where documented behavior is not covered by a test, say so under `### Not covered by the suite` instead of implying coverage.
- **Record the change.** Add a row to the `## Revision history` table with the next version, the date and a short note. A new component starts at version 1.
- **Keep the table of contents current.** It is hand-maintained: every `##` and `###` heading needs an entry whose anchor resolves.

Specifications do not carry ownership, approval or sign-off sections, and the revision history has no author column — `git` already records who changed what. Design hand-off links, such as Figma files, go under `### End-user experience` and are preserved across updates.

A pull request that changes behavior without updating the affected specification is incomplete, and reviewers will ask for it.
- **Changelog**: Add an entry under `[Unreleased]` in [CHANGELOG.md](../CHANGELOG.md) for every user-visible change. The file follows [Keep a Changelog](https://keepachangelog.com/), so use the `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` and `Security` categories. A fix for a vulnerability goes under `Security`, with a link to the advisory once it is published.

## Accessibility

Accessibility is a requirement, not a feature. See [ACCESSIBILITY.md](../ACCESSIBILITY.md) for the conformance target and the platform constraints that shape how the components expose semantics.

- New and changed component specifications must audit the component with axe, on both its light DOM and its shadow DOM, in each state the specification exercises: `await expect(el).to.be.accessible()` and `await expect(el).shadowDom.to.be.accessible()`.
- Follow the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) pattern for the component's role, including its keyboard interaction. Add keyboard tests for it.
- Publish semantics through `ElementInternals` and ARIA element reflection rather than IDREF attributes, so that relations work across shadow boundaries. Use the controllers under `src/internals/controllers` instead of setting ARIA attributes by hand.
- Disable an axe rule only when it misreports semantics published through internals or element reflection, assert the real relation in the specification instead, and document the exception next to the shared options in `src/internals/testing/helpers.spec.ts`.
- Verify interactive changes by hand with a keyboard and a screen reader before requesting review.

## Dependencies

Runtime dependencies increase the install footprint and the attack surface of every application that uses the library, so they are added rarely and deliberately.

- **Discuss first.** Open an issue or a discussion before adding a runtime dependency or an optional peer dependency. Prefer a small, focused implementation in `src/internals` over a package that does more than the component needs.
- **Licenses.** Runtime and peer dependencies must be licensed under MIT, BSD-2-Clause, BSD-3-Clause, ISC, Apache-2.0, 0BSD or an equivalent permissive license. Copyleft licenses (GPL, LGPL, AGPL, SSPL) are not accepted for anything that ships to consumers. Dual-licensed packages are accepted when one of the options is permissive.
- **Manifests.** A runtime dependency is declared in both `package.json` and the published manifest `scripts/_package.json`. Optional peer dependencies are declared with `peerDependenciesMeta.optional: true` in the published manifest.
- **Notices.** After changing a runtime or peer dependency, run `npm run build:notices` and commit the regenerated `THIRD-PARTY-NOTICES.md`. CI fails when the file is out of date. Generation fails for a package that declares a license but ships no license file; copy the text from the package's source repository into `scripts/license-overrides/<package-name>` (with `/` replaced by `__` for scoped packages) and note where it came from in the pull request.
- **Lockfile.** Commit `package-lock.json` changes together with the manifest change. Install with `npm ci`, never `npm install`, so the lockfile stays authoritative.
- **Updates.** Dependabot raises security updates for npm packages daily and version updates for GitHub Actions weekly. Routine npm version bumps are done by maintainers in batches. GitHub Actions are pinned to a commit SHA with the version in a trailing comment; keep that format when adding or updating an action.
- **Dev dependencies** follow the same license rules and are otherwise at the maintainers' discretion.

## Security

Never report a vulnerability in a public issue, discussion or pull request. Use [private vulnerability reporting](https://github.com/IgniteUI/igniteui-webcomponents/security/advisories/new) as described in [SECURITY.md](../SECURITY.md).

When you contribute code, keep the following in mind:

- Treat every value that reaches a component from the host page as untrusted. Render text as text; when a feature must render HTML, sanitize it and make the sanitizer replaceable, as the chat markdown renderer does.
- Do not add network requests, storage access or telemetry. The library's [privacy commitments](../PRIVACY.md) depend on this.
- Do not introduce `eval`, `new Function`, string-based timers or other string-to-code paths.
- Changes to the workflows under `.github/workflows` or to the scripts that build and publish the package are reviewed for supply-chain impact. Keep job permissions minimal and actions pinned.

## Contributing Code

- **Pull Requests**: Once your changes are ready, submit a pull request to the main repository.
- **Pull Request Description**: Provide a detailed description of your pull request, including the issue it addresses (if applicable) and the specific changes made.
- **Code Reviews**: Be prepared to address feedback and make revisions during the code review process.

## Reporting Issues

- **Search Existing Issues**: Before creating a new issue, check if a similar issue has already been reported.
- **Clear and Descriptive Titles**: Use clear and descriptive titles for your issue reports to help maintainers understand the problem quickly.
- **Provide Details**: In your issue report, provide as much detail as possible to help diagnose the problem. This might include steps to reproduce the issue, error messages, and expected behavior.

Thank you!
