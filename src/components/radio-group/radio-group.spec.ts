import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import {
  type IgcRadioComponent,
  IgcRadioGroupComponent,
  defineComponents,
} from '../../index.js';
import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from '../common/controllers/key-bindings.js';
import { simulateKeyboard } from '../common/utils.spec.js';

describe('Radio Group Component', () => {
  before(() => {
    defineComponents(IgcRadioGroupComponent);
  });

  let group: IgcRadioGroupComponent;
  let radios: IgcRadioComponent[];

  describe('', () => {
    beforeEach(async () => {
      group = await createRadioGroupComponent();
      radios = group.querySelectorAll(
        'igc-radio'
      ) as unknown as IgcRadioComponent[];
    });

    it('is initialized with the proper default values', async () => {
      expect(group.alignment).to.equal('vertical');
    });

    it('renders a radio element successfully', async () => {
      await expect(group).shadowDom.to.be.accessible();
    });

    it('sets alignment properly', async () => {
      const DIFF_OPTIONS = {
        ignoreTags: ['igc-radio'],
        ignoreAttributes: ['label-position', 'disabled'],
      };

      group.alignment = 'horizontal';
      await elementUpdated(group);
      expect(group).dom.to.equal(
        `<igc-radio-group alignment="${group.alignment}"></igc-radio-group>`,
        DIFF_OPTIONS
      );

      group.alignment = 'vertical';
      await elementUpdated(group);
      expect(group).dom.to.equal(
        `<igc-radio-group alignment="${group.alignment}"></igc-radio-group>`,
        DIFF_OPTIONS
      );
    });

    it('should be able to navigate radios using arrow keys', async () => {
      const radio1 = spy(radios[0], 'emitEvent');
      const radio2 = spy(radios[1], 'emitEvent');
      const [first, second, _] = radios;

      first.click();

      await elementUpdated(first);
      expect(radio1).to.be.calledWith('igcFocus');
      expect(radio1).to.be.calledWith('igcChange');

      simulateKeyboard(first, arrowDown);
      await elementUpdated(first);
      await elementUpdated(second);
      expect(radio1).to.be.calledWith('igcBlur');
      expect(radio2).to.be.calledWith('igcFocus');
      expect(radio2).to.be.calledWith('igcChange');

      simulateKeyboard(second, arrowUp);
      await elementUpdated(first);
      await elementUpdated(second);
      expect(radio2).to.be.calledWith('igcBlur');
      expect(radio1).to.be.calledWith('igcFocus');
      expect(radio1).to.be.calledWith('igcChange');

      simulateKeyboard(first, arrowRight);
      await elementUpdated(first);
      await elementUpdated(second);
      expect(radio1).to.be.calledWith('igcBlur');
      expect(radio2).to.be.calledWith('igcFocus');
      expect(radio2).to.be.calledWith('igcChange');

      simulateKeyboard(second, arrowLeft);
      await elementUpdated(first);
      await elementUpdated(second);
      expect(radio2).to.be.calledWith('igcBlur');
      expect(radio1).to.be.calledWith('igcFocus');
      expect(radio1).to.be.calledWith('igcChange');
    });

    it('should ignore disabled radios when navigating', async () => {
      const radio1 = spy(radios[0], 'emitEvent');
      const radio2 = spy(radios[1], 'emitEvent');
      const radio3 = spy(radios[2], 'emitEvent');

      radios[0].click();
      await elementUpdated(radios[0]);

      radios[1].disabled = true;
      await elementUpdated(radios[1]);

      simulateKeyboard(radios[0], arrowDown);

      await elementUpdated(radios[0]);
      await elementUpdated(radios[1]);
      await elementUpdated(radios[2]);
      expect(radio1).to.be.calledWith('igcBlur');
      expect(radio2).to.not.be.called;
      expect(radio3).to.be.calledWith('igcFocus');
      expect(radio3).to.be.calledWith('igcChange');
    });
  });

  const values = ['orange', 'apple', 'mango'];
  const createRadioGroupComponent = (
    template = html`<igc-radio-group>
      ${values.map(
        (value) =>
          html`<igc-radio name="fruit" required value=${value}
            >${value}</igc-radio
          >`
      )}
    </igc-radio-group>`
  ) => {
    return fixture<IgcRadioGroupComponent>(template);
  };
});
