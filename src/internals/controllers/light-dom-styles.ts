import {
  isServer,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';

/** One constructed sheet per CSS text, shared by every host that adopts it. */
const sheets = new Map<string, CSSStyleSheet>();

function getSheet(css: string): CSSStyleSheet {
  let sheet = sheets.get(css);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    sheets.set(css, sheet);
  }
  return sheet;
}

/**
 * Adopts one constructed stylesheet into the root node of a host that
 * renders into its light DOM and so has no shadow root of its own to style.
 *
 * The adoption is re-checked on each update, not only on connect. A host
 * rendered inside another component's shadow root can have that root's
 * `adoptedStyleSheets` replaced by the theming logic of the outer component,
 * which drops this sheet without the host reconnecting. The check is a no-op
 * when the sheet is present.
 */
class LightDomStylesController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & Element;
  private readonly _css: string;

  constructor(host: ReactiveControllerHost & Element, css: string) {
    this._host = host;
    this._css = css;
    host.addController(this);
  }

  public hostConnected(): void {
    this._adopt();
  }

  public hostUpdate(): void {
    this._adopt();
  }

  private _adopt(): void {
    /* c8 ignore next 3 */
    if (isServer) {
      return;
    }

    const root = this._host.getRootNode() as Document | ShadowRoot;
    const sheet = getSheet(this._css);
    if (!root.adoptedStyleSheets.includes(sheet)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    }
  }
}

/**
 * Creates a controller that keeps the stylesheet built from `css` adopted
 * into the root node of `host`.
 */
export function createLightDomStylesController(
  host: ReactiveControllerHost & Element,
  css: string
): LightDomStylesController {
  return new LightDomStylesController(host, css);
}
