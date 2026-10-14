import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { css, LitElement } from 'lit';
import {
  type AdoptedStylesController,
  addAdoptedStylesController,
} from './adopt-styles.js';

type AdoptingHost = LitElement & { adopted: AdoptedStylesController };

/** Returns the selector texts of the style rules the shadow root adopted. */
function adoptedSelectors(host: LitElement): string[] {
  return host
    .shadowRoot!.adoptedStyleSheets.flatMap((sheet) =>
      Array.from(sheet.cssRules)
    )
    .map((rule) => (rule as CSSStyleRule).selectorText)
    .filter(Boolean);
}

describe('Adopted styles controller', () => {
  let tag: string;
  const styles: HTMLStyleElement[] = [];

  function addDocumentStyle(text: string, parent: Node = document.head) {
    const style = document.createElement('style');
    style.textContent = text;
    parent.appendChild(style);
    styles.push(style);
    return style;
  }

  before(() => {
    tag = defineCE(
      class extends LitElement {
        public static override styles = css`
          :host {
            display: block;
          }
        `;

        public readonly adopted = addAdoptedStylesController(this);
      }
    );
  });

  afterEach(() => {
    for (const style of styles.splice(0)) {
      style.remove();
    }
  });

  it('adopts after the first render when it is asked before the host has a shadow root', async () => {
    addDocumentStyle('.early-rule { color: red; }');

    const host = document.createElement(tag) as AdoptingHost;
    expect(host.shadowRoot).to.be.null;

    host.adopted.invalidateCache(document);
    host.adopted.shouldAdoptStyles(true);

    const parent = await fixture<HTMLElement>(html`<div></div>`);
    parent.append(host);
    await host.updateComplete;

    expect(adoptedSelectors(host)).to.include('.early-rule');
  });

  it('skips a stylesheet whose rules it cannot read', async () => {
    const readable = addDocumentStyle('.readable-rule { color: red; }');
    const unreadable = addDocumentStyle('.unreadable-rule { color: red; }');

    Object.defineProperty(unreadable.sheet!, 'cssRules', {
      get() {
        throw new DOMException('Cross-origin', 'SecurityError');
      },
    });

    const tagName = unsafeStatic(tag);
    const host = await fixture<AdoptingHost>(html`<${tagName}></${tagName}>`);
    host.adopted.invalidateCache(document);
    host.adopted.shouldAdoptStyles(true);

    const selectors = adoptedSelectors(host);
    expect(readable.sheet).to.exist;
    expect(selectors).to.include('.readable-rule');
    expect(selectors).to.not.include('.unreadable-rule');
  });

  it('skips the rules that a constructed stylesheet rejects', async () => {
    const style = addDocumentStyle('.kept-rule { color: red; }');
    const [kept] = Array.from(style.sheet!.cssRules);
    const rejected = { cssText: 'not a rule' } as CSSRule;

    Object.defineProperty(style.sheet!, 'cssRules', {
      value: [rejected, kept],
    });

    const tagName = unsafeStatic(tag);
    const host = await fixture<AdoptingHost>(html`<${tagName}></${tagName}>`);
    host.adopted.invalidateCache(document);
    host.adopted.shouldAdoptStyles(true);

    const clone = host.shadowRoot!.adoptedStyleSheets.find((sheet) =>
      Array.from(sheet.cssRules).some(
        (rule) => (rule as CSSStyleRule).selectorText === '.kept-rule'
      )
    );
    expect(clone?.cssRules).to.have.lengthOf(1);
  });

  it('adopts no empty clone of a stylesheet whose rules all fail to clone', async () => {
    const style = addDocumentStyle('.ignored { color: red; }');

    Object.defineProperty(style.sheet!, 'cssRules', {
      value: [{ cssText: 'not a rule' } as CSSRule],
    });

    const tagName = unsafeStatic(tag);
    const host = await fixture<AdoptingHost>(html`<${tagName}></${tagName}>`);
    host.adopted.invalidateCache(document);
    host.adopted.shouldAdoptStyles(true);

    const sheets = host.shadowRoot!.adoptedStyleSheets;
    expect(sheets.every((sheet) => sheet.cssRules.length > 0)).to.be.true;
  });

  describe('a document without a head', () => {
    async function adoptIn(doc: Document): Promise<AdoptingHost> {
      const tagName = unsafeStatic(tag);
      const host = await fixture<AdoptingHost>(html`<${tagName}></${tagName}>`);

      // The controller tracks the owner document of the host.
      Object.defineProperty(host, 'ownerDocument', { value: doc });
      host.adopted.shouldAdoptStyles(true);
      return host;
    }

    it('adopts the stylesheets under the document element', async () => {
      const doc = document.implementation.createHTMLDocument();
      doc.head.remove();

      const style = doc.createElement('style');
      style.textContent = '.headless-rule { color: red; }';
      doc.documentElement.append(style);

      const host = await adoptIn(doc);

      expect(adoptedSelectors(host)).to.include('.headless-rule');
      host.adopted.shouldAdoptStyles(false);
      expect(adoptedSelectors(host)).to.not.include('.headless-rule');
    });

    it('observes a document without a document element', async () => {
      const doc = document.implementation.createDocument(null, null);
      // An observation of a missing node would throw.
      const host = await adoptIn(doc);

      expect(adoptedSelectors(host)).to.eql([':host']);
      host.adopted.shouldAdoptStyles(false);
    });
  });
});
