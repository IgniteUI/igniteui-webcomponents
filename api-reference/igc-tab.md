# igc-tab

A tab nested in a tabs component.

```ts
import { defineComponents, IgcTabComponent } from 'igniteui-webcomponents';

defineComponents(IgcTabComponent);
```

## Properties

- `label`: `string`. Default: `''`. Attribute: `label`.
  The tab item label.
- `selected`: `boolean`. Default: `false`. Attribute: `selected`, reflected.
  Whether the tab is selected.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the tab is disabled.
- `href`: `string | undefined`. Attribute: `href`.
  The URL of the tab. When set, the tab header renders as a link.

  A plain click selects the tab and follows the link; cancel `igcNavigate` to route
  on the client. A click with a modifier key or the middle button opens the link
  without selecting the tab. A disabled tab does not follow its link.
- `target`: `'_blank' | '_parent' | '_self' | '_top' | undefined`. Attribute: `target`.
  Where to open the URL when `href` is set. Without it, the target of the page's
  `<base>` element applies. A target other than `_self` never changes the selection.
  In a page that is not in a frame, `_parent` and `_top` count as `_self`.
- `rel`: `string | undefined`. Attribute: `rel`.
  Space-separated link types, used when `href` is set.

## Events

- `igcNavigate`
  Emitted when a plain click, Enter or Space activates a link tab, before the browser follows the link. Cancel it to route on the client. Does not bubble.

## Slots

- default: Renders the tab's content.
- `label`: Renders the tab header's label. Takes non-interactive content only.
- `prefix`: Renders the tab header's prefix. Takes non-interactive content only.
- `suffix`: Renders the tab header's suffix. Takes non-interactive content only.

## CSS parts

- `tab-header`: The header of a single tab.
- `base`: The wrapper of the prefix, the label and the suffix in the tab header.
- `prefix`: Tab header's label prefix.
- `content`: Tab header's label slot container.
- `suffix`: Tab header's label suffix.
- `tab-body`: Holds the body content of a single tab, only the body of the selected tab is visible.
