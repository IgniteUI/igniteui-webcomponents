# Security Policy

Ignite UI for Web Components is a client-side UI library published to npm as [`igniteui-webcomponents`](https://www.npmjs.com/package/igniteui-webcomponents). This document explains which versions receive security fixes, how to report a vulnerability, what happens after a report, and how to verify what you install.

## Supported versions

We release security fixes for the **latest major version**. The **previous major version** receives fixes for **critical** vulnerabilities only. We publish these fixes as a patch on the last minor release of that version. Older major versions receive no security updates.

| Version | Support                                  |
| ------- | ---------------------------------------- |
| 7.x     | All security fixes                       |
| 6.5.x   | Critical vulnerabilities only            |
| < 6.0   | None; upgrade to a supported version     |

We update this table with each major release. The [npm package page](https://www.npmjs.com/package/igniteui-webcomponents?activeTab=versions) and the [CHANGELOG](CHANGELOG.md) list all released versions.

## Scope

In scope:

- The `igniteui-webcomponents` npm package and all of its entry points, including `igniteui-webcomponents/extras`.
- The build and release pipeline in this repository, including the workflows under `.github/workflows` and the scripts under `scripts`.

Out of scope:

- The hosted [Storybook](https://igniteui.github.io/igniteui-webcomponents) and the [product documentation](https://www.infragistics.com/products/ignite-ui-web-components) sites. Report issues with those to [Infragistics support](https://www.infragistics.com/about-us/contact-us).
- Vulnerabilities in third-party dependencies that do not affect this package. Report those to the upstream project. If a dependency vulnerability is reachable through this package, report it here as well.
- Commercial Ignite UI for Web Components packages such as `igniteui-webcomponents-grids` and `igniteui-dockmanager`. Report those through [Infragistics support](https://www.infragistics.com/about-us/contact-us).

## Reporting a vulnerability

Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/IgniteUI/igniteui-webcomponents/security/advisories/new). **Do not open a public issue, discussion or pull request for a security problem.** Private reporting gives us time to prepare a fix before the details become public.

A useful report includes:

- The affected component or module and the package version.
- Steps or a minimal reproduction that shows the problem.
- The impact you believe it has, for example script execution in the host page or exposure of data the host page passed to a component.

## What to expect

| Step                | Target                                                        |
| ------------------- | ------------------------------------------------------------- |
| Acknowledgement     | Within 3 business days of the report                          |
| Triage and severity | Within 10 business days, communicated in the advisory thread  |
| Fix and release     | Within 90 days for confirmed vulnerabilities, sooner for critical ones |
| Disclosure          | Coordinated with the reporter, at release or after the fix has had time to propagate |

Severity follows the [CVSS](https://www.first.org/cvss/) rating that GitHub attaches to the advisory. We credit reporters in the advisory unless they ask not to be named.

## Disclosure

We publish each fixed vulnerability as a [GitHub security advisory](https://github.com/IgniteUI/igniteui-webcomponents/security/advisories), with a CVE identifier where applicable. We also record it under a `Security` heading in the [CHANGELOG](CHANGELOG.md) entry of the release that contains the fix.

## Verifying a release

Every release that this repository publishes has this supply-chain evidence attached to the [GitHub release](https://github.com/IgniteUI/igniteui-webcomponents/releases):

- The exact tarball that was published to npm, with SHA-256 and SHA-512 digests.
- A CycloneDX 1.6 SBOM that describes the delivered dependency closure, and a supplementary SBOM of the build environment.
- Signed build-provenance and SBOM attestations produced with GitHub artifact attestations.

The release workflow publishes the package with an OIDC token. Thus, npm records provenance for the package. To verify that the tarball you install matches the built and attested tarball, run:

```bash
npm pack igniteui-webcomponents@<version>
gh attestation verify igniteui-webcomponents-<version>.tgz --repo IgniteUI/igniteui-webcomponents
gh attestation verify igniteui-webcomponents-<version>.tgz --repo IgniteUI/igniteui-webcomponents --predicate-type https://cyclonedx.org/bom
```

The SBOM README attached to each release describes how the SBOM was generated and how to re-validate it.

## Threat model

The components run inside the host page, so the host application remains responsible for the data it passes in. [THREAT-MODEL.md](THREAT-MODEL.md) describes the trust boundaries, the threats that the library addresses and what the host must do. This includes the handling of chat markdown, icons, host-supplied URLs and Content Security Policy.

## Dependencies

We keep runtime dependencies to a minimum. The SBOM attached to each release lists them (see [Verifying a release](#verifying-a-release)). Dependabot raises security updates for npm dependencies daily and version updates for GitHub Actions weekly.

GitHub's CodeQL default setup analyzes every push and pull request. The OpenSSF Scorecard runs weekly. The results are visible in the repository's Security tab. The release workflow pins every action to a commit SHA and grants each job only the permissions it needs.
