# Privacy

Ignite UI for Web Components is a library of UI components that runs entirely inside the web application that embeds it. This document describes what the components do with data and which browser capabilities they use. You can include this information in your own privacy assessment.

## What the library does not do

- **No telemetry.** The components send no usage data, error reports or analytics anywhere. Nothing in the package contacts Infragistics or any third party on its own. The only network requests are fetches of URLs that your application supplies. The table below lists them.
- **No cookies or storage.** The components set no cookies and write nothing to `localStorage`, `sessionStorage` or IndexedDB.
- **No fingerprinting.** The components do not collect device, browser or network identifiers.
- **No remote code.** The package contains no code that loads scripts or styles from a remote origin.

## Browser capabilities the components use

Some components use browser APIs that can involve user data. Network and clipboard operations happen only on an explicit call from the host application or a user action inside the component. The remaining capabilities are read or opened automatically while the components render.

| Capability                    | Where                              | When                                                                                                                                                                                                                                         |
| ----------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetch` of an application URL | Icon registry (`registerIcon`)     | Only for the URL that the host application passes when it registers an icon.                                                                                                                                                                 |
| Image load of an application URL | QR code with a logo (`logo-src`) | Only for the image URL that the host application sets. The image loads when `logo-src` is set, so that the component can measure it. `toBlob()` and `toImage()` fetch it again to inline it in the export.                                 |
| Clipboard write               | Color picker, chat message actions | Only when the user activates a copy control. The components never read the clipboard.                                                                                                                                                        |
| `BroadcastChannel`            | Icon registry                      | Opened automatically on page show as `ignite-ui-icon-channel`. It publishes the icons and icon references that the application registers to other browsing contexts of the same origin. Thus, an Ignite UI for Angular icon service on the same site sees them. It also answers their sync requests. It applies nothing that it receives. Nothing leaves the origin. |
| Locale and time zone          | Date and time components           | Read through `Intl` to format and parse values. Nothing is transmitted.                                                                                                                                                                      |
| Reduced-motion preference     | Animations                         | Read through `matchMedia('(prefers-reduced-motion: reduce)')` to shorten or skip animations.                                                                                                                                                 |

Data that your application passes into a component, such as chat messages, form values or dates, stays in the page. The components render it and expose it back through their properties and events. Apart from the capabilities in the table above, they give nothing to other origins or browsing contexts.

## Hosted sites

The [Storybook](https://igniteui.github.io/igniteui-webcomponents) and the [product documentation](https://www.infragistics.com/products/ignite-ui-web-components) are separate websites that Infragistics operates. They are not part of the npm package. The [Infragistics privacy statement](https://www.infragistics.com/legal/privacy) applies to them.

## Questions

Open a [discussion](https://github.com/IgniteUI/igniteui-webcomponents/discussions) for questions about this document. Report a possible privacy defect in the components as a bug. If the defect can expose user data, report it privately through the [security policy](SECURITY.md).
