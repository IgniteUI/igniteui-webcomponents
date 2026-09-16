# Privacy

Ignite UI for Web Components is a library of UI components that runs entirely inside the web application that embeds it. This document describes what the components do with data and which browser capabilities they touch, so that you can account for them in your own privacy assessment.

## What the library does not do

- **No telemetry.** The components send no usage data, error reports or analytics anywhere. Nothing in the package contacts Infragistics or any third party at runtime.
- **No cookies or storage.** The components set no cookies and write nothing to `localStorage`, `sessionStorage` or IndexedDB.
- **No fingerprinting.** The components do not collect device, browser or network identifiers.
- **No remote code.** The package contains no code that loads scripts or styles from a remote origin.

## Browser capabilities the components use

Some components use browser APIs that can involve user data. Each is triggered only by an explicit call from the host application or by a user action inside the component.

| Capability                    | Where                                | When                                                                                           |
| ----------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `fetch` of an application URL | Icon registry (`registerIcon`)       | Only for the URL the host application passes when registering an icon.                         |
| `fetch` of an application URL | QR code export with an embedded image| Only for the image URL the host application passes to the export call.                         |
| Clipboard write               | Color picker, chat message actions   | Only when the user activates a copy control. The clipboard is never read.                      |
| Locale and time zone          | Date and time components             | Read through `Intl` to format and parse values. Nothing is transmitted.                        |
| Reduced-motion preference     | Animations                           | Read through `matchMedia('(prefers-reduced-motion)')` to shorten or skip animations.           |

Data your application passes into a component, such as chat messages, form values or dates, stays in the page. The components render it and expose it back through their properties and events, and nowhere else.

## Hosted sites

The [Storybook](https://igniteui.github.io/igniteui-webcomponents) and the [product documentation](https://www.infragistics.com/products/ignite-ui-web-components) are separate websites operated by Infragistics. They are not part of the npm package and are covered by the [Infragistics privacy statement](https://www.infragistics.com/legal/privacy).

## Questions

Open a [discussion](https://github.com/IgniteUI/igniteui-webcomponents/discussions) for questions about this document. Report anything that looks like a privacy defect in the components as a bug, or privately through the [security policy](SECURITY.md) if it could expose user data.
