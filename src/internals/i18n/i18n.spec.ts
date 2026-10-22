import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import {
  CalendarResourceStringsEN,
  ComboResourceStringsEN,
  DateRangePickerResourceStringsEN,
  getI18nManager,
  type IComboResourceStrings,
  type IResourceStrings,
  registerI18n,
  setCurrentI18n,
} from 'igniteui-i18n-core';
import { ResourceStringsBG } from 'igniteui-i18n-resources';
import { LitElement } from 'lit';
import { spy } from 'sinon';
import type { DateRangePickerResourceStringsType } from '../../components/date-range-picker/date-range-picker.js';
import { I18nMixin } from '../mixins/i18n.js';
import { catchListenerErrors } from '../testing/helpers.spec.js';
import { setOrRemoveAttribute } from '../utils/dom.js';
import { formatDisplayDate, getLocaleDateTimeFormats } from './date-formats.js';
import type { IgcDateRangePickerResourceStrings } from './EN/date-range-picker.resources.js';
import {
  addI18nController,
  getHostLocale,
  type I18nController,
} from './i18n-controller.js';
import { dateRangePickerResourcesMap } from './utils.js';

class TestLocalizedClass<T extends object> extends LitElement {
  public set locale(value: string) {
    this.i18nController.locale = value;
  }
  public get locale() {
    return this.i18nController.locale;
  }

  public set resourceStrings(value: T) {
    this.i18nController.resourceStrings = value;
  }

  public get resourceStrings(): T {
    return this.i18nController.resourceStrings;
  }

  public readonly i18nController = addI18nController<T>(this, {
    defaultEN: this.defaultEN,
  });

  public get defaultEN(): T {
    return {} as T;
  }
}

describe('Localization', () => {
  let tagOld: string;
  let tagNew: string;
  let instance: LitElement & {
    locale: string;
    resourceStrings: object;
    i18nController: I18nController<any>;
  };

  before(() => {
    tagOld = defineCE(
      class extends TestLocalizedClass<
        IgcDateRangePickerResourceStrings | DateRangePickerResourceStringsType
      > {
        public override get defaultEN() {
          return Object.assign(
            {},
            DateRangePickerResourceStringsEN,
            CalendarResourceStringsEN
          );
        }

        public override set resourceStrings(
          value:
            | IgcDateRangePickerResourceStrings
            | DateRangePickerResourceStringsType
        ) {
          this.i18nController.resourceStrings = value;
        }

        public override get resourceStrings(): IgcDateRangePickerResourceStrings &
          DateRangePickerResourceStringsType {
          return this.i18nController.resourceStrings;
        }

        public override readonly i18nController = addI18nController<
          IgcDateRangePickerResourceStrings | DateRangePickerResourceStringsType
        >(this, {
          defaultEN: this.defaultEN,
          resourceMap: dateRangePickerResourcesMap,
        });

        protected override render() {
          return html`
            <div id="select">
              <span>${this.resourceStrings.selectDate}</span>
            </div>
            <div id="previous">
              <span>${this.resourceStrings.previousYears}</span>
            </div>
          `;
        }
      }
    );

    tagNew = defineCE(
      class extends TestLocalizedClass<IComboResourceStrings> {
        public override get defaultEN() {
          return ComboResourceStringsEN;
        }

        protected override render() {
          return html`
            <div id="start">
              <span>${this.resourceStrings.combo_empty_message}</span>
            </div>
          `;
        }
      }
    );
  });

  describe('Old resource strings format compatibility', () => {
    beforeEach(async () => {
      const tagName = unsafeStatic(tagOld);
      instance = await fixture(html`<${tagName}></${tagName}`);
      (getI18nManager() as any)._resourcesMap = new Map<string, any>([
        [
          'en',
          {
            default: 'US',
            scripts: new Map<string, IResourceStrings>(),
            regions: new Map<string, IResourceStrings>([['US', {}]]),
          },
        ],
      ]);
    });

    it('should initialize correct resource strings', () => {
      expect(instance.shadowRoot?.getElementById('select')?.innerText).to.equal(
        'Select Date'
      );
      expect(
        instance.shadowRoot?.getElementById('previous')?.innerText
      ).to.equal('Previous {0} Years');
    });

    it('should update the resource string when they are explicitly set', async () => {
      instance.resourceStrings = {
        selectDate: 'Избор на дата',
        previousYears: 'Предходни {0} години',
      };
      instance.requestUpdate();
      await elementUpdated(instance);

      expect(instance.shadowRoot?.getElementById('select')?.innerText).to.equal(
        'Избор на дата'
      );
      expect(
        instance.shadowRoot?.getElementById('previous')?.innerText
      ).to.equal('Предходни {0} години');
    });

    it('should keep the merged strings when the same object is set again', async () => {
      const custom = { selectDate: 'Избор на дата' };

      instance.resourceStrings = custom;
      await elementUpdated(instance);
      const merged = instance.resourceStrings;

      instance.resourceStrings = custom;

      expect(instance.isUpdatePending).to.be.false;
      expect(instance.resourceStrings).to.equal(merged);
    });

    it('should set custom locale and stay that even when locale is changed globally', async () => {
      setCurrentI18n('de');

      instance.locale = 'bg';
      instance.requestUpdate();
      await elementUpdated(instance);

      expect(instance.locale).to.equal('bg');
    });

    it('should keep the core keys that have no old resource name', async () => {
      const strings = () =>
        instance.resourceStrings as Record<string, string | undefined>;

      expect(strings().calendar_first_picker_of).to.equal(
        'First picker of {0} starts from'
      );

      instance.resourceStrings = { calendar_first_picker_of: 'Начало от' };
      await elementUpdated(instance);

      expect(strings().calendar_first_picker_of).to.equal('Начало от');
    });

    it('should convert to old resource names when resource strings are set globally from new API', async () => {
      registerI18n(ResourceStringsBG, 'bg');

      instance.locale = 'bg';
      instance.requestUpdate();
      await elementUpdated(instance);

      expect(instance.shadowRoot?.getElementById('select')?.innerText).to.equal(
        'Избор на дата'
      );
      expect(
        instance.shadowRoot?.getElementById('previous')?.innerText
      ).to.equal('Предходни {0} години');
    });
  });

  describe('New resource strings format', () => {
    beforeEach(async () => {
      const tagName = unsafeStatic(tagNew);
      instance = await fixture(html`<${tagName}></${tagName}`);
      (getI18nManager() as any)._resourcesMap = new Map<string, any>([
        [
          'en',
          {
            default: 'US',
            scripts: new Map<string, IResourceStrings>(),
            regions: new Map<string, IResourceStrings>([['US', {}]]),
          },
        ],
      ]);
    });

    it('should initialize correct resource strings', () => {
      expect(instance.shadowRoot?.getElementById('start')?.innerText).to.equal(
        'The list is empty'
      );
    });

    it('should update the resource string when they are explicitly set', async () => {
      instance.resourceStrings = {
        combo_empty_message: 'Списъкът e празен',
      };
      instance.requestUpdate();
      await elementUpdated(instance);

      expect(instance.shadowRoot?.getElementById('start')?.innerText).to.equal(
        'Списъкът e празен'
      );
    });

    it('should keep the merged strings when the same object is set again', async () => {
      const custom = { combo_empty_message: 'Списъкът e празен' };

      instance.resourceStrings = custom;
      await elementUpdated(instance);
      const merged = instance.resourceStrings;

      instance.resourceStrings = custom;

      expect(instance.isUpdatePending).to.be.false;
      expect(instance.resourceStrings).to.equal(merged);
    });

    it('should set custom locale and stay that even when locale is changed globally', async () => {
      setCurrentI18n('de');

      instance.locale = 'bg';
      instance.requestUpdate();
      await elementUpdated(instance);

      expect(instance.locale).to.equal('bg');
    });

    it('should update resource strings when are set globally', async () => {
      registerI18n(ResourceStringsBG, 'bg');

      instance.locale = 'bg';
      instance.requestUpdate();
      await elementUpdated(instance);

      expect(instance.shadowRoot?.getElementById('start')?.innerText).to.equal(
        'Списъкът е празен'
      );
    });

    it('should re-merge custom resource strings when the locale changes', async () => {
      registerI18n(ResourceStringsBG, 'bg');

      instance.resourceStrings = {
        combo_filter_search_placeholder: 'Custom placeholder',
      };
      instance.locale = 'bg';
      instance.requestUpdate();
      await elementUpdated(instance);

      const strings = instance.resourceStrings as IComboResourceStrings;

      expect(strings.combo_empty_message).to.equal('Списъкът е празен');
      expect(strings.combo_filter_search_placeholder).to.equal(
        'Custom placeholder'
      );
    });

    it('should pick up a global change that happened while detached', async () => {
      registerI18n(ResourceStringsBG, 'bg');

      const parent = instance.parentElement!;
      instance.remove();

      // The controller is not listening at this point.
      setCurrentI18n('bg');

      parent.append(instance);
      await elementUpdated(instance);

      const text = instance.shadowRoot?.getElementById('start')?.innerText;
      setCurrentI18n('en');

      expect(text).to.equal('Списъкът е празен');
    });

    it('should fall back to the default resource strings when the custom ones are cleared', async () => {
      instance.resourceStrings = {
        combo_empty_message: 'Custom empty message',
      };
      instance.requestUpdate();
      await elementUpdated(instance);

      instance.resourceStrings = undefined as unknown as object;
      await elementUpdated(instance);

      expect(instance.shadowRoot?.getElementById('start')?.innerText).to.equal(
        'The list is empty'
      );
      expect(
        (instance.resourceStrings as IComboResourceStrings).combo_empty_message
      ).to.equal(ComboResourceStringsEN.combo_empty_message);
    });
  });

  describe('Default strings', () => {
    it('resolves the default strings once for a new instance', async () => {
      const manager = getI18nManager();
      const resolve = spy(manager, 'getCurrentResourceStrings');

      try {
        const tagName = unsafeStatic(tagNew);
        instance = await fixture(html`<${tagName}></${tagName}`);

        expect(resolve.callCount).to.equal(1);
        expect(
          instance.shadowRoot?.getElementById('start')?.innerText
        ).to.equal(ComboResourceStringsEN.combo_empty_message);
      } finally {
        resolve.restore();
      }
    });

    it('keeps the English strings that the application registers before the first instance', async () => {
      const defaultEN = { ...ComboResourceStringsEN };
      const tagName = unsafeStatic(
        defineCE(
          class extends TestLocalizedClass<IComboResourceStrings> {
            public override get defaultEN() {
              return defaultEN;
            }
          }
        )
      );

      registerI18n({ combo_empty_message: 'Nothing to show' }, 'en-US');

      try {
        instance = await fixture(html`<${tagName}></${tagName}>`);

        expect(
          (instance.resourceStrings as IComboResourceStrings)
            .combo_empty_message
        ).to.equal('Nothing to show');
      } finally {
        registerI18n(
          { combo_empty_message: ComboResourceStringsEN.combo_empty_message },
          'en-US'
        );
      }
    });

    it('resolves the strings of its locale on the first update, after a late registration', async () => {
      const element = document.createElement(tagNew) as typeof instance;
      element.locale = 'fr';
      document.body.append(element);

      try {
        registerI18n({ combo_empty_message: 'La liste est vide' }, 'fr');
        await elementUpdated(element);

        expect(element.shadowRoot?.getElementById('start')?.innerText).to.equal(
          'La liste est vide'
        );
      } finally {
        element.remove();
      }
    });
  });

  describe('Locale inheritance', () => {
    const BG = ResourceStringsBG.combo_empty_message!;
    const EN = ComboResourceStringsEN.combo_empty_message!;

    type Localized = LitElement & { locale: string };

    const localizedClass = () =>
      class extends I18nMixin(LitElement, {
        defaultEN: ComboResourceStringsEN,
      }) {
        protected override render() {
          return html`<span lang=${this.locale}
            >${this.resourceStrings.combo_empty_message}</span
          >`;
        }
      };

    let tag: ReturnType<typeof unsafeStatic>;
    let tagName: string;
    let shadowHost: ReturnType<typeof unsafeStatic>;
    let lateTags = 0;

    /** A tag that the test defines after its elements connect. */
    const lateTag = () => `test-late-locale-${lateTags++}`;

    const textOf = (element: Localized) =>
      element.shadowRoot?.querySelector('span')?.innerText;

    const langOf = (element: Localized) =>
      element.shadowRoot?.querySelector('span')?.lang;

    const get = (root: ParentNode, selector: string) =>
      root.querySelector<Localized>(selector)!;

    before(() => {
      tagName = defineCE(localizedClass());
      tag = unsafeStatic(tagName);
      shadowHost = unsafeStatic(
        defineCE(
          class extends LitElement {
            protected override render() {
              return html`<${tag}></${tag}>`;
            }
          }
        )
      );
    });

    beforeEach(() => {
      registerI18n(ResourceStringsBG, 'bg');
    });

    afterEach(() => {
      setCurrentI18n('en');
    });

    it('takes the locale of the nearest ancestor that sets one', async () => {
      const root = await fixture<Localized>(html`
        <${tag} locale="bg">
          <div>
            <${tag} id="middle">
              <${tag} id="inner"></${tag}>
            </${tag}>
          </div>
        </${tag}>
      `);
      const inner = get(root, '#inner');
      await elementUpdated(inner);

      expect(get(root, '#middle').locale).to.equal('bg');
      expect(inner.locale).to.equal('bg');
      expect(textOf(inner)).to.equal(BG);
    });

    it('takes the locale across shadow roots', async () => {
      const root = await fixture<Localized>(html`
        <${tag} locale="bg"><${shadowHost}></${shadowHost}></${tag}>
      `);
      const host = root.firstElementChild as LitElement;
      await elementUpdated(host);

      const inner = get(host.renderRoot, tagName);
      await elementUpdated(inner);

      expect(inner.locale).to.equal('bg');
      expect(textOf(inner)).to.equal(BG);
    });

    it('follows a locale change of the ancestor', async () => {
      const root = await fixture<Localized>(html`
        <${tag}><${tag} id="inner"></${tag}></${tag}>
      `);
      const inner = get(root, '#inner');

      root.setAttribute('locale', 'bg');
      await elementUpdated(inner);

      expect(inner.locale).to.equal('bg');
      expect(textOf(inner)).to.equal(BG);

      root.removeAttribute('locale');
      await elementUpdated(inner);

      expect(inner.locale).to.equal('en');
      expect(textOf(inner)).to.equal(EN);
    });

    it('keeps its own locale, and passes it to its descendants', async () => {
      const root = await fixture<Localized>(html`
        <${tag} locale="bg">
          <${tag} id="middle" locale="de">
            <${tag} id="inner"></${tag}>
          </${tag}>
        </${tag}>
      `);
      const middle = get(root, '#middle');
      const inner = get(root, '#inner');
      await elementUpdated(inner);

      expect(middle.locale).to.equal('de');
      expect(inner.locale).to.equal('de');
      expect(textOf(inner)).to.equal(EN);

      middle.removeAttribute('locale');
      await elementUpdated(inner);

      expect(middle.locale).to.equal('bg');
      expect(inner.locale).to.equal('bg');
      expect(textOf(inner)).to.equal(BG);
    });

    it('follows the global locale only without an ancestor that sets one', async () => {
      const root = await fixture<HTMLElement>(html`
        <div>
          <${tag} id="free"></${tag}>
          <${tag} locale="de"><${tag} id="pinned"></${tag}></${tag}>
        </div>
      `);
      const free = get(root, '#free');
      const pinned = get(root, '#pinned');

      setCurrentI18n('bg');
      await elementUpdated(free);

      expect(free.locale).to.equal('bg');
      expect(textOf(free)).to.equal(BG);
      expect(pinned.locale).to.equal('de');
      expect(textOf(pinned)).to.equal(EN);
    });

    it('takes the locale of its new ancestor after a move', async () => {
      const root = await fixture<HTMLElement>(html`
        <div>
          <${tag} id="bg" locale="bg"></${tag}>
          <${tag} locale="de"><${tag} id="child"></${tag}></${tag}>
        </div>
      `);
      const child = get(root, '#child');
      await elementUpdated(child);

      expect(child.locale).to.equal('de');

      get(root, '#bg').append(child);
      await elementUpdated(child);

      expect(child.locale).to.equal('bg');
      expect(textOf(child)).to.equal(BG);

      root.append(child);
      await elementUpdated(child);

      expect(child.locale).to.equal('en');
      expect(textOf(child)).to.equal(EN);
    });

    it('keeps the inherited locale for an update while detached', async () => {
      const root = await fixture<Localized>(html`
        <${tag} locale="bg"><${tag} id="child"></${tag}></${tag}>
      `);
      const child = get(root, '#child');
      await elementUpdated(child);

      child.remove();
      child.requestUpdate();
      await elementUpdated(child);

      expect(child.locale).to.equal('bg');

      root.append(child);
      await elementUpdated(child);

      expect(langOf(child)).to.equal('bg');
    });

    it('does not pass an invalid or empty locale to its descendants', async () => {
      const root = await fixture<HTMLElement>(html`
        <div>
          <${tag} locale="xx_!!"><${tag} id="invalid"></${tag}></${tag}>
          <${tag} locale=""><${tag} id="empty"></${tag}></${tag}>
        </div>
      `);
      const invalid = get(root, '#invalid');
      const empty = get(root, '#empty');

      setCurrentI18n('bg');
      await elementUpdated(invalid);
      await elementUpdated(empty);

      expect(invalid.locale).to.equal('bg');
      expect(textOf(invalid)).to.equal(BG);
      expect(empty.locale).to.equal('bg');
      expect(textOf(empty)).to.equal(BG);
    });

    it('takes the locale of an ancestor that upgrades after it', async () => {
      const late = lateTag();
      const root = await fixture<HTMLElement>(html`
        <div>
          <${unsafeStatic(late)} locale="bg">
            <${tag} id="child"></${tag}>
          </${unsafeStatic(late)}>
        </div>
      `);
      const child = get(root, '#child');
      await elementUpdated(child);

      expect(child.locale).to.equal('en');

      customElements.define(late, localizedClass());
      await elementUpdated(child);

      expect(child.locale).to.equal('bg');
      expect(textOf(child)).to.equal(BG);

      get(root, late).locale = 'de';
      await elementUpdated(child);

      expect(child.locale).to.equal('de');
    });

    it('reaches the descendants that upgrade before an ancestor without a locale', async () => {
      const top = lateTag();
      const middle = lateTag();
      const root = await fixture<HTMLElement>(html`
        <div>
          <${unsafeStatic(top)} locale="bg">
            <${unsafeStatic(middle)}>
              <${tag} id="child"></${tag}>
            </${unsafeStatic(middle)}>
          </${unsafeStatic(top)}>
        </div>
      `);
      const child = get(root, '#child');

      customElements.define(middle, localizedClass());
      customElements.define(top, localizedClass());
      await elementUpdated(child);

      expect(child.locale).to.equal('bg');
      expect(textOf(child)).to.equal(BG);

      get(root, middle).locale = 'de';
      await elementUpdated(child);

      expect(child.locale).to.equal('de');
    });
    it('moves the descendants under a late ancestor that sets the inherited locale', async () => {
      const late = lateTag();
      const root = await fixture<Localized>(html`
        <${tag} locale="bg">
          <${unsafeStatic(late)}>
            <${tag} id="child"></${tag}>
          </${unsafeStatic(late)}>
        </${tag}>
      `);
      const child = get(root, '#child');

      customElements.define(late, localizedClass());
      get(root, late).locale = 'bg';
      root.locale = 'de';
      await elementUpdated(child);

      expect(child.locale).to.equal('bg');
    });

    describe('lang', () => {
      /** The `lang` observer runs in a microtask, before the update. */
      const langApplied = async (element: Localized) => {
        await Promise.resolve();
        await elementUpdated(element);
      };

      it('takes the nearest of an ancestor locale and an ancestor lang', async () => {
        const root = await fixture<HTMLElement>(html`
          <div>
            <${tag} locale="de">
              <div lang="bg"><${tag} id="lang"></${tag}></div>
            </${tag}>
            <div lang="bg">
              <${tag} locale="de"><${tag} id="locale"></${tag}></${tag}>
            </div>
          </div>
        `);

        const lang = get(root, '#lang');
        await elementUpdated(lang);

        expect(lang.locale).to.equal('bg');
        expect(textOf(lang)).to.equal(BG);
        expect(get(root, '#locale').locale).to.equal('de');
      });

      it('takes its own lang before the ancestors, and its own locale before its lang', async () => {
        const root = await fixture<Localized>(html`
          <${tag} locale="de">
            <${tag} id="lang" lang="bg"><${tag} id="child"></${tag}></${tag}>
            <${tag} id="both" locale="de" lang="bg"></${tag}>
          </${tag}>
        `);
        const child = get(root, '#child');
        await elementUpdated(child);

        expect(get(root, '#lang').locale).to.equal('bg');
        expect(child.locale).to.equal('bg');
        expect(textOf(child)).to.equal(BG);
        expect(get(root, '#both').locale).to.equal('de');
      });

      it('takes the lang across shadow roots', async () => {
        const root = await fixture<HTMLElement>(html`
          <div lang="bg"><${shadowHost}></${shadowHost}></div>
        `);
        const host = root.firstElementChild as LitElement;
        await elementUpdated(host);

        const inner = get(host.renderRoot, tagName);
        await elementUpdated(inner);

        expect(inner.locale).to.equal('bg');
        expect(textOf(inner)).to.equal(BG);
      });

      it('follows a lang change in an application shadow root', async () => {
        const root = await fixture<HTMLElement>(html`<div></div>`);
        const shadow = root.attachShadow({ mode: 'open' });
        shadow.innerHTML = `<section lang="de"><${tagName}></${tagName}></section>`;

        const inner = get(shadow, tagName);
        await elementUpdated(inner);

        expect(inner.locale).to.equal('de');

        shadow.querySelector('section')!.lang = 'bg';
        await langApplied(inner);

        expect(inner.locale).to.equal('bg');
        expect(textOf(inner)).to.equal(BG);
      });

      it('follows a new, a changed and a removed lang', async () => {
        const root = await fixture<Localized>(html`
          <${tag} locale="de">
            <div id="region"><${tag} id="child"></${tag}></div>
          </${tag}>
        `);
        const region = root.querySelector('#region')!;
        const child = get(root, '#child');

        region.setAttribute('lang', 'bg');
        await langApplied(child);

        expect(child.locale).to.equal('bg');
        expect(textOf(child)).to.equal(BG);

        region.setAttribute('lang', 'en');
        await langApplied(child);

        expect(child.locale).to.equal('en');
        expect(textOf(child)).to.equal(EN);

        region.removeAttribute('lang');
        await langApplied(child);

        expect(child.locale).to.equal('de');
      });

      it('follows a change of its own lang', async () => {
        const root = await fixture<Localized>(html`
          <${tag} locale="de"><${tag} id="child"></${tag}></${tag}>
        `);
        const child = get(root, '#child');

        child.lang = 'bg';
        await langApplied(child);

        expect(child.locale).to.equal('bg');
        expect(textOf(child)).to.equal(BG);

        child.removeAttribute('lang');
        await langApplied(child);

        expect(child.locale).to.equal('de');
      });

      it('reads a lang that changed while it was detached', async () => {
        const root = await fixture<HTMLElement>(html`
          <div><section lang="bg"><${tag}></${tag}></section></div>
        `);
        const section = root.querySelector('section')!;
        const inner = get(root, tagName);

        section.remove();
        section.lang = 'de';
        // The observer runs while the section is detached.
        await Promise.resolve();
        root.append(section);
        await elementUpdated(inner);

        expect(inner.locale).to.equal('de');
      });

      it('treats an empty or invalid lang as an unknown language', async () => {
        const root = await fixture<Localized>(html`
          <${tag} locale="bg">
            <div lang=""><${tag} id="empty"></${tag}></div>
            <div lang="xx_!!"><${tag} id="invalid"></${tag}></div>
          </${tag}>
        `);
        const empty = get(root, '#empty');
        const invalid = get(root, '#invalid');
        await elementUpdated(empty);
        await elementUpdated(invalid);

        expect(empty.locale).to.equal('en');
        expect(textOf(empty)).to.equal(EN);
        expect(invalid.locale).to.equal('en');
        expect(textOf(invalid)).to.equal(EN);
      });

      it('does not read the lang of the root element', async () => {
        const documentElement = document.documentElement;
        const original = documentElement.getAttribute('lang');
        const root = await fixture<Localized>(html`<${tag}></${tag}>`);

        try {
          documentElement.lang = 'de';
          await langApplied(root);
          setCurrentI18n('bg');
          await elementUpdated(root);

          expect(root.locale).to.equal('bg');
          expect(textOf(root)).to.equal(BG);
        } finally {
          setOrRemoveAttribute(documentElement, 'lang', original);
          await langApplied(root);
        }
      });

      it('keeps the lang of a region below an ancestor that upgrades after it', async () => {
        const late = lateTag();
        const root = await fixture<HTMLElement>(html`
          <div>
            <${unsafeStatic(late)} locale="de">
              <div lang="bg"><${tag} id="child"></${tag}></div>
            </${unsafeStatic(late)}>
          </div>
        `);
        const child = get(root, '#child');

        customElements.define(late, localizedClass());
        await elementUpdated(child);

        expect(child.locale).to.equal('bg');
      });

      it('gives the lang to a host without a locale controller', async () => {
        const root = await fixture<HTMLElement>(html`
          <div lang="bg"><span></span><span lang="de"></span></div>
        `);
        const [inherits, own] = root.querySelectorAll('span');

        expect(getHostLocale(inherits)).to.equal('bg');
        expect(getHostLocale(own)).to.equal('de');
      });

      it('follows a lang change in the shadow root of a host', async () => {
        const regionTag = unsafeStatic(
          defineCE(
            class extends localizedClass() {
              public static override properties = { region: {} };
              declare public region: string;

              protected override render() {
                return html`<div lang=${this.region}><${tag}></${tag}></div>`;
              }
            }
          )
        );
        const host = await fixture<Localized & { region: string }>(
          html`<${regionTag} region="bg"></${regionTag}>`
        );
        const inner = get(host.renderRoot, tagName);
        await elementUpdated(inner);

        expect(inner.locale).to.equal('bg');

        host.region = 'de';
        await elementUpdated(host);
        await langApplied(inner);

        expect(inner.locale).to.equal('de');
      });

      it('updates the hosts of a lang that a new host reads first', async () => {
        const root = await fixture<HTMLElement>(html`
          <div><section lang="bg"><${tag} id="first"></${tag}></section></div>
        `);
        const section = root.querySelector('section')!;
        const first = get(root, '#first');
        await elementUpdated(first);

        first.requestUpdate();
        section.lang = 'de';
        section.append(document.createElement(tagName));
        section.lang = 'bg';
        await langApplied(first);

        expect(first.locale).to.equal('bg');
        expect(langOf(first)).to.equal('bg');
      });

      it('keeps the lang of the disconnect, also after a change in the same task', async () => {
        const root = await fixture<HTMLElement>(html`
          <div>
            <section lang="de"><${tag} id="inherits"></${tag}></section>
            <${tag} id="own" lang="de"></${tag}>
          </div>
        `);
        const section = root.querySelector('section')!;
        const inherits = get(root, '#inherits');
        const own = get(root, '#own');
        await elementUpdated(inherits);
        await elementUpdated(own);

        section.lang = 'bg';
        own.lang = 'bg';
        section.remove();
        own.remove();
        await Promise.resolve();
        inherits.requestUpdate();
        own.requestUpdate();
        await elementUpdated(inherits);
        await elementUpdated(own);

        expect(langOf(inherits)).to.equal('bg');
        expect(langOf(own)).to.equal('bg');
      });

      it('goes up only from a document or a shadow root', async () => {
        const remover = defineCE(
          class extends HTMLElement {
            public connectedCallback(): void {
              this.firstElementChild!.remove();
            }
          }
        );
        const root = await fixture<HTMLElement>(html`<div></div>`);
        const wrapper = document.createElement(remover);
        const anchor = document.createElement('a');
        anchor.href = 'https://example.com/';
        anchor.append(document.createElement(tagName));
        wrapper.append(anchor);

        // A parentless anchor has a string `host`.
        expect(catchListenerErrors(() => root.append(wrapper))).to.be.empty;

        // A parentless form has its control named `host` as `host`.
        const form = document.createElement('form');
        form.innerHTML = '<input name="host" /><span></span>';

        expect(getHostLocale(form.querySelector('span')!)).to.equal('en');
      });
    });
  });

  describe('formatDisplayDate', () => {
    it('should use the default date format of the locale without a display format', () => {
      const value = new Date(2024, 0, 15, 13, 45);

      expect(formatDisplayDate(value, 'en-US')).to.equal(
        new Intl.DateTimeFormat('en-US').format(value)
      );
    });
  });

  describe('getLocaleDateTimeFormats', () => {
    afterEach(() => {
      setCurrentI18n('en');
    });

    it('returns the display and input formats of the locale', () => {
      expect(getLocaleDateTimeFormats('en-US')).to.deep.equal({
        display: 'M/d/yyyy',
        input: 'MM/dd/yyyy',
      });
      expect(getLocaleDateTimeFormats('de-DE')).to.deep.equal({
        display: 'd.M.yyyy',
        input: 'dd.MM.yyyy',
      });
    });

    it('resolves an invalid locale to the global locale, also during a locale change', () => {
      const manager = getI18nManager();
      const seen: string[] = [];
      const listener = () => seen.push(getLocaleDateTimeFormats('xx-!!').input);

      expect(getLocaleDateTimeFormats('xx-!!').input).to.equal('MM/dd/yyyy');

      manager.addEventListener('onResourceChange', listener);
      try {
        setCurrentI18n('de-DE');
      } finally {
        manager.removeEventListener('onResourceChange', listener);
      }

      expect(seen).to.deep.equal(['dd.MM.yyyy']);
      expect(getLocaleDateTimeFormats('xx-!!').input).to.equal('dd.MM.yyyy');
      expect(getLocaleDateTimeFormats('').input).to.equal('dd.MM.yyyy');
    });

    it('drops the cached formats when the cache is full', () => {
      const formats = getLocaleDateTimeFormats('fr-FR');
      expect(getLocaleDateTimeFormats('fr-FR')).to.equal(formats);

      for (let i = 0; i < 64; i++) {
        getLocaleDateTimeFormats(`en-x-n${i}`);
      }

      const refreshed = getLocaleDateTimeFormats('fr-FR');
      expect(refreshed).to.not.equal(formats);
      expect(refreshed).to.deep.equal(formats);
    });
  });
});
