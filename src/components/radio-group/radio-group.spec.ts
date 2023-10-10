import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';

import {
  IgcRadioComponent,
  IgcRadioGroupComponent,
  defineComponents,
} from '../../index.js';

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
      const radio1 = sinon.spy(radios[0], 'emitEvent');
      const radio2 = sinon.spy(radios[1], 'emitEvent');
      const [first, second, _] = radios;

      first.click();

      await elementUpdated(first);
      expect(radio1).to.be.calledWith('igcFocus');
      expect(radio1).to.be.calledWith('igcChange');

      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

      await elementUpdated(first);
      await elementUpdated(second);
      expect(radio1).to.be.calledWith('igcBlur');
      expect(radio2).to.be.calledWith('igcFocus');
      expect(radio2).to.be.calledWith('igcChange');

      second.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      await elementUpdated(first);
      await elementUpdated(second);
      expect(radio2).to.be.calledWith('igcBlur');
      expect(radio1).to.be.calledWith('igcFocus');
      expect(radio1).to.be.calledWith('igcChange');

      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      await elementUpdated(first);
      await elementUpdated(second);
      expect(radio1).to.be.calledWith('igcBlur');
      expect(radio2).to.be.calledWith('igcFocus');
      expect(radio2).to.be.calledWith('igcChange');

      second.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      await elementUpdated(first);
      await elementUpdated(second);
      expect(radio2).to.be.calledWith('igcBlur');
      expect(radio1).to.be.calledWith('igcFocus');
      expect(radio1).to.be.calledWith('igcChange');
    });

    it('should ignore disabled radios when navigating', async () => {
      const radio1 = sinon.spy(radios[0], 'emitEvent');
      const radio2 = sinon.spy(radios[1], 'emitEvent');
      const radio3 = sinon.spy(radios[2], 'emitEvent');

      radios[0].click();
      await elementUpdated(radios[0]);

      radios[1].disabled = true;
      await elementUpdated(radios[1]);

      radios[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );

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
