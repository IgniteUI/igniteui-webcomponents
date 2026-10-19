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
import { formatDisplayDate, getLocaleDateTimeFormats } from './date-formats.js';
import type { IgcDateRangePickerResourceStrings } from './EN/date-range-picker.resources.js';
import { addI18nController, type I18nController } from './i18n-controller.js';
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
