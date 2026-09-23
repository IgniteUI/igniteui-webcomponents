# Contributing to Ignite UI Web Components

We're excited you're interested in contributing to Ignite UI Web Components! This document outlines the guidelines for contributing code, documentation, and other improvements to the project.

## Code of Conduct

We have a [Code of Conduct](../CODE_OF_CONDUCT.md), please follow it in all interactions with project maintainers and fellow users.

For detailed information on issue and pull request statuses, process for testing, etc. please refer to the general [Guidelines in Ignite UI for Angular](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md).

## Getting Started

- **Fork the Repository**: Before making changes, create a fork of the repository on your GitHub account. This allows you to make your own edits without affecting the main project code.
- **Clone your Fork**: Clone your forked repository to your local machine using Git. This will create a local copy of the project you can work on.
- **Create a Branch**: Create a new branch for your specific contribution. This helps keep your changes isolated and organized.

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

## Contributing Code

- **Pull Requests**: Once your changes are ready, submit a pull request to the main repository.
- **Pull Request Description**: Provide a detailed description of your pull request, including the issue it addresses (if applicable) and the specific changes made.
- **Code Reviews**: Be prepared to address feedback and make revisions during the code review process.

## Reporting Issues

- **Search Existing Issues**: Before creating a new issue, check if a similar issue has already been reported.
- **Clear and Descriptive Titles**: Use clear and descriptive titles for your issue reports to help maintainers understand the problem quickly.
- **Provide Details**: In your issue report, provide as much detail as possible to help diagnose the problem. This might include steps to reproduce the issue, error messages, and expected behavior.

Thank you!
