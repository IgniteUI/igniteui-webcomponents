# Security Policy

Ignite UI for Web Components is a client-side UI library published to npm as [`igniteui-webcomponents`](https://www.npmjs.com/package/igniteui-webcomponents). This document explains which versions receive security fixes, how to report a vulnerability, what happens after a report, and how consumers can verify what they install.

## Supported versions

Security fixes are released for the **latest major version**. The **previous major version** receives fixes for **critical** vulnerabilities only, published as a patch on its last minor release. Older major versions receive no security updates.

| Version             | Support                                              |
| ------------------- | ---------------------------------------------------- |
| Latest major        | All security fixes                                   |
| Previous major      | Critical vulnerabilities only, on the last minor     |
| Older majors        | None; upgrade to a supported version                 |

The current major version is listed on the [npm package page](https://www.npmjs.com/package/igniteui-webcomponents?activeTab=versions) and in the [CHANGELOG](CHANGELOG.md).

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
- Steps or a minimal reproduction that demonstrates the problem.
- The impact you believe it has, for example script execution in the host page or exposure of data the host page passed to a component.

## What to expect

| Step                | Target                                                        |
| ------------------- | ------------------------------------------------------------- |
| Acknowledgement     | Within 3 business days of the report                          |
| Triage and severity | Within 10 business days, communicated in the advisory thread  |
| Fix and release     | Within 90 days for confirmed vulnerabilities, sooner for critical ones |
| Disclosure          | Coordinated with the reporter, at release or after the fix has had time to propagate |

Severity follows the [CVSS](https://www.first.org/cvss/) rating GitHub attaches to the advisory. We credit reporters in the advisory unless they ask not to be named.

## Disclosure

Fixed vulnerabilities are published as a [GitHub security advisory](https://github.com/IgniteUI/igniteui-webcomponents/security/advisories) with a CVE identifier where applicable, and recorded under a `Security` heading in the [CHANGELOG](CHANGELOG.md) entry of the release that carries the fix.

## Verifying a release

Every release published from this repository ships with supply-chain evidence attached to the [GitHub release](https://github.com/IgniteUI/igniteui-webcomponents/releases):

- The exact tarball that was published to npm, with SHA-256 and SHA-512 digests.
- A CycloneDX 1.6 SBOM describing the delivered dependency closure, and a supplementary SBOM of the build environment.
- Signed build-provenance and SBOM attestations produced with GitHub artifact attestations.

The package is published with an OIDC token, so npm records provenance for it. To verify the tarball you install matches the one that was built and attested, run:

```bash
npm pack igniteui-webcomponents@<version>
gh attestation verify igniteui-webcomponents-<version>.tgz --repo IgniteUI/igniteui-webcomponents
gh attestation verify igniteui-webcomponents-<version>.tgz --repo IgniteUI/igniteui-webcomponents --predicate-type https://cyclonedx.org/bom
```

The SBOM README attached to each release describes how the SBOM was generated and how to re-validate it.

## Security considerations for consumers

The components render inside the host page and inherit its origin, so the host application remains responsible for the data it passes in. Points worth knowing:

- **Chat markdown rendering.** The optional chat markdown renderer in `igniteui-webcomponents/extras` converts message text to HTML and sanitizes it with [DOMPurify](https://github.com/cure53/DOMPurify) before rendering. The `sanitizer` option replaces DOMPurify; if you supply your own, it must reject scripts, event handlers and dangerous URLs. Without the extras renderer, message text is rendered as text and not as HTML.
- **Icons.** `registerIcon(name, url)` fetches the URL you pass and renders the response as inline SVG in the component's shadow root. Only register icons from origins you control or trust, and prefer `registerIconFromText` with SVG you have already vetted.
- **QR code logo.** Setting `logo-src` loads the image URL you pass in order to measure it, and `toBlob()` and `toImage()` fetch it again to inline it in the export. Only supply URLs you trust.
- **Clipboard.** The color picker and chat components write to the clipboard when the user activates a copy control. Nothing is read from the clipboard.
- **No network or storage otherwise.** The components make no network requests of their own, set no cookies and write nothing to web storage. See [PRIVACY.md](PRIVACY.md).
- **Content Security Policy.** The library uses no `eval` or string-to-code APIs. Styles are attached through constructable stylesheets in each component's shadow root. Test your CSP against the components you use before relying on a strict policy.

## Dependencies

Runtime dependencies are kept to a minimum and are listed in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Dependabot raises security updates for npm dependencies daily and version updates for GitHub Actions weekly. GitHub's CodeQL default setup analyzes every push and pull request, and the OpenSSF Scorecard runs weekly; results are visible in the repository's Security tab. The release workflow pins every action to a commit SHA and grants each job only the permissions it needs.
