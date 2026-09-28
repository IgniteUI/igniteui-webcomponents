# Privacy

Ignite UI for Web Components is a library of UI components that runs entirely inside the web application that embeds it. This document describes what the components do with data and which browser capabilities they touch, so that you can account for them in your own privacy assessment.

## What the library does not do

- **No telemetry.** The components send no usage data, error reports or analytics anywhere. Nothing in the package contacts Infragistics or any third party on its own. The only network requests are fetches of URLs your application supplies, listed below.
- **No cookies or storage.** The components set no cookies and write nothing to `localStorage`, `sessionStorage` or IndexedDB.
- **No fingerprinting.** The components do not collect device, browser or network identifiers.
- **No remote code.** The package contains no code that loads scripts or styles from a remote origin.

## Browser capabilities the components use

Some components use browser APIs that can involve user data. Network and clipboard operations happen only on an explicit call from the host application or a user action inside the component. The remaining capabilities are read or opened automatically while the components render.

| Capability                    | Where                              | When                                                                                                                                                                                                                                         |
| ----------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetch` of an application URL | Icon registry (`registerIcon`)     | Only for the URL the host application passes when registering an icon.                                                                                                                                                                       |
| Image load of an application URL | QR code with a logo (`logo-src`) | Only for the image URL the host application sets. The image loads when `logo-src` is set, to measure it, and is fetched again by `toBlob()` and `toImage()` to inline it in the export.                                                    |
| Clipboard write               | Color picker, chat message actions | Only when the user activates a copy control. The clipboard is never read.                                                                                                                                                                    |
| `BroadcastChannel`            | Icon registry                      | Opened automatically on page show as `ignite-ui-icon-channel`. It publishes the icons and icon references the application registers to other browsing contexts of the same origin, so that an Ignite UI for Angular icon service on the same site sees them, and answers their sync requests. It applies nothing it receives. Nothing leaves the origin. |
| Locale and time zone          | Date and time components           | Read through `Intl` while formatting and parsing values. Nothing is transmitted.                                                                                                                                                             |
| Reduced-motion preference     | Animations                         | Read through `matchMedia('(prefers-reduced-motion: reduce)')` to shorten or skip animations.                                                                                                                                                 |

Data your application passes into a component, such as chat messages, form values or dates, stays in the page. The components render it and expose it back through their properties and events. Apart from the capabilities in the table above, they hand nothing to other origins or browsing contexts.

## Hosted sites

The [Storybook](https://igniteui.github.io/igniteui-webcomponents) and the [product documentation](https://www.infragistics.com/products/ignite-ui-web-components) are separate websites operated by Infragistics. They are not part of the npm package and are covered by the [Infragistics privacy statement](https://www.infragistics.com/legal/privacy).

## Questions

Open a [discussion](https://github.com/IgniteUI/igniteui-webcomponents/discussions) for questions about this document. Report anything that looks like a privacy defect in the components as a bug, or privately through the [security policy](SECURITY.md) if it could expose user data.
