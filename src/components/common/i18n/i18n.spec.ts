import {
  ComboResourceStringsEN,
  getI18nManager,
  type IComboResourceStrings,
  type IResourceStrings,
  registerI18n,
  setCurrentI18n,
} from 'igniteui-i18n-core';
import { ResourceStringsBG } from 'igniteui-i18n-resources';
import { LitElement } from 'lit';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  defineCE,
  elementUpdated,
  fixture,
  html,
  unsafeStatic,
} from '../helpers.spec.js';
import {
  type IgcDateRangePickerResourceStrings,
  IgcDateRangePickerResourceStringsEN,
} from './EN/date-range-picker.resources.js';
import { addI18nController, type I18nController } from './i18n-controller.js';

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

  beforeAll(() => {
    tagOld = defineCE(
      class extends TestLocalizedClass<IgcDateRangePickerResourceStrings> {
        public override get defaultEN() {
          return IgcDateRangePickerResourceStringsEN;
        }

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

    it('should set custom locale and stay that even when locale is changed globally', async () => {
      setCurrentI18n('de');

      instance.locale = 'bg';
      instance.requestUpdate();
      await elementUpdated(instance);

      expect(instance.locale).to.equal('bg');
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
  });
});
