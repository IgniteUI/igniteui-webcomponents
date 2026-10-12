# Threat model

This document describes the trust boundaries of the `igniteui-webcomponents` package, the threats the library addresses, and what the host application remains responsible for. It covers the npm package and its release pipeline. The scope and the reporting process are in [SECURITY.md](SECURITY.md). The browser capabilities the components use are in [PRIVACY.md](PRIVACY.md).

## System and trust boundaries

The components run inside the host page and inherit its origin. They have the same privileges as all other scripts on the page. Their shadow roots are an encapsulation mechanism, not a security boundary. Thus, the library is not a defense against script that already runs in the page.

Data crosses into the components at these boundaries:

| Boundary                         | Examples                                                                                              | Trust                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Properties, attributes and slots | Form values, chat messages, labels, `href`, `src`                                                     | Set by the host code, but can carry untrusted user or server data.      |
| Host templates and renderers     | Chat `renderers`, a custom markdown `sanitizer`                                                       | Host code. The library runs it as given.                                 |
| Host-supplied URLs               | `registerIcon(name, url)`, QR code `logo-src`, button `href`, avatar `src`                            | The library requests or renders the URL as given.                        |
| User interaction                 | Typing, pasting, file selection, copy controls                                                        | Untrusted input from the user.                                           |
| Same-origin browsing contexts    | The icon registry `BroadcastChannel`                                                                  | Already fully trusted by the origin.                                     |
| Package supply chain             | The published tarball and its runtime dependencies                                                    | Verified through the release evidence described in SECURITY.md.         |

The assets to protect are:

- The integrity of the host page: no script runs that the host did not intend.
- The data that the host passes to the components.
- The integrity of the published package.

## Threats and mitigations

### Script injection through rendered content

- **Text and attributes.** Lit bindings render the values from properties, attributes and slots. These bindings set text and attribute values and do not parse them as HTML.
- **Chat markdown.** The optional renderer in `igniteui-webcomponents/extras` converts message text to HTML. It sanitizes the result with [DOMPurify](https://github.com/cure53/DOMPurify), including highlighted code blocks. The `sanitizer` option replaces DOMPurify. A replacement must reject scripts, event handlers and dangerous URLs. Without the extras renderer, the chat renders message text as text.
- **Host renderers.** Templates and renderers that the host passes to a component run as host code. The library does not sanitize them. Escape or sanitize untrusted data in them.
- **URL properties.** The components render `href` on the button and the icon button, and `src` on the avatar, as given. A `javascript:` URL in `href` runs when the user activates the link. Validate URLs that come from untrusted data.

### Untrusted SVG icons

`registerIcon` and `registerIconFromText` check that the markup is well-formed SVG, but they do not sanitize it. The icon renders as markup in the shadow root of `igc-icon`. Thus, an SVG with event handler attributes can run script in the page. Register icons only from sources that you control or trust. Sanitize SVG from any other source, for example with DOMPurify's SVG profile, before you pass it to `registerIconFromText`.

### Requests to host-supplied URLs

The components make no network requests of their own. `registerIcon` fetches the URL that it receives. The QR code loads the `logo-src` image to measure it. `toBlob()` and `toImage()` fetch it again to inline it in the export. These requests go to the origin that the URL names and follow the page's referrer policy.

Supply only URLs that you trust. Restrict them with the `connect-src` and `img-src` directives of your Content Security Policy.

### Exposure to other browsing contexts

The icon registry opens the `BroadcastChannel` `ignite-ui-icon-channel`. It publishes the icons that the application registers to other browsing contexts of the same origin. It never applies state that it receives, so another context cannot inject an icon. Nothing leaves the origin.

### Untrusted serialized layouts

`loadLayout` on the tile manager treats a layout as untrusted, because applications keep it in web storage or on a server. It copies only the serialized tile properties (spans, positions, flags and `id`) to the tiles with a matching `id`. It ignores all other keys, such as `innerHTML` or an own `__proto__`. It also ignores a value that is not an array and an entry that is not an object. Invalid JSON throws a `SyntaxError`. Property-based tests send generated and hostile layouts to it.

### Clipboard

The color picker and the chat message actions write to the clipboard only when the user activates a copy control. The components never read the clipboard, so pasted content reaches them only as ordinary user input.

### Content Security Policy

The library uses no `eval`, `new Function`, string-based timers or other string-to-code paths. It loads no scripts or styles from a remote origin. Each component attaches its styles through constructable stylesheets in its shadow root. If you enforce Trusted Types, allow the `lit-html` policy that Lit creates. Test your policy against the components you use before you rely on it.

### Compromised package or dependency

A tampered tarball or a malicious dependency runs with the privileges of the host page. The release workflow publishes with an OIDC token. It attaches build provenance, an SBOM and signed attestations to each release. The workflow pins every action to a commit SHA and gives each job only the permissions that it needs. The project keeps runtime dependencies to a minimum. [Verifying a release](SECURITY.md#verifying-a-release) shows how to check the tarball you install.

## Out of scope

- Attackers who can already run script in the host page or modify its responses.
- The host application's own templates, sanitizers, server responses and Content Security Policy.
- The hosted Storybook and documentation sites and the commercial packages. See the [scope](SECURITY.md#scope) in SECURITY.md.

## Keeping this document current

Update this document when a change adds one of these items:

- A new way for data to reach the DOM.
- A new network request.
- A new browser capability.
- A new release step.

Report a weakness in any of the mitigations above privately, as described in [SECURITY.md](SECURITY.md#reporting-a-vulnerability).
