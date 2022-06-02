import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import sinon from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents';
import IgcSelectComponent from './select';
import IgcSelectGroupComponent from './select-group';
import IgcSelectItemComponent from './select-item';

describe('Select component', () => {
  let select: IgcSelectComponent;
  const items = [
    {
      value: 'spec',
      text: 'Specification',
    },
    {
      value: 'implementation',
      text: 'Implementation',
    },
    {
      value: 'testing',
      text: 'Testing',
    },
    {
      value: 'samples',
      text: 'Samples',
    },
    {
      value: 'builds',
      text: 'Builds',
    },
    {
      value: 'documentation',
      text: 'Documentation',
    },
  ];
  const selectOpts = (el: IgcSelectComponent) =>
    [...el.querySelectorAll('igc-dropdown-item')] as HTMLElement[];

  const ddListWrapper = (el: IgcSelectComponent) =>
    el.shadowRoot!.querySelector('[part="base"]') as HTMLElement;

  const ddList = (el: IgcSelectComponent) =>
    ddListWrapper(el).querySelector('[part="list"]') as HTMLElement;

  before(() => {
    defineComponents(
      IgcSelectComponent,
      IgcSelectGroupComponent,
      IgcSelectItemComponent
    );
  });

  describe('', () => {
    beforeEach(async () => {
      select = await fixture<IgcSelectComponent>(html`<igc-select>
        ${items.map(
          (item) =>
            html`<igc-select-item value=${item.value}
              >${item.text}</igc-select-item
            >`
        )}
      </igc-select>`);
    });

    it('is accessible.', async () => {
      select.open = true;
      await elementUpdated(select);
      await expect(select).to.be.accessible();
    });

    it('is successfully created with default properties.', () => {
      expect(document.querySelector('igc-select')).to.exist;
      expect(select.open).to.be.false;
      expect(select.name).to.be.undefined;
      expect(select.value).to.be.undefined;
      expect(select.disabled).to.be.false;
      expect(select.required).to.be.false;
      expect(select.invalid).to.be.false;
      expect(select.autofocus).to.be.false;
      expect(select.label).to.be.undefined;
      expect(select.placeholder).to.be.undefined;
      expect(select.outlined).to.be.false;
      expect(select.size).to.equal('medium');
    });

    it('initializes items with default properties', () => {
      const options = [
        ...select.querySelectorAll('igc-select-item'),
      ] as IgcSelectItemComponent[];
      expect(options[0].disabled).to.be.false;
      expect(options[0].value).to.equal(items[0].value);
      expect(options[0].selected).to.be.false;
    });

    it('should focus when the focus method is called', async () => {
      const eventSpy = sinon.spy(select, 'emitEvent');

      select.focus();
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcFocus');
      expect(document.activeElement).to.equal(select);
    });

    it('should blur when the blur method is called', async () => {
      const eventSpy = sinon.spy(select, 'emitEvent');

      select.blur();
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcBlur');
      expect(document.activeElement).to.not.equal(select);
    });

    it('does not emit `igcOpening` & `igcOpened` events on `show` method calls.', async () => {
      select.open = false;
      await elementUpdated(select);

      const eventSpy = sinon.spy(select, 'emitEvent');
      select.show();
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(eventSpy).not.to.be.called;
    });

    it('emits `igcOpening` & `igcOpened` events on clicking the target.', async () => {
      select.open = false;
      await elementUpdated(select);

      const eventSpy = sinon.spy(select, 'emitEvent');
      select.click();
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(eventSpy).calledWith('igcOpening');
      expect(eventSpy).calledWith('igcOpened');
    });

    it('does not emit `igcOpened` event and does not show the list on canceling `igcOpening` event.', async () => {
      select.open = false;
      select.addEventListener('igcOpening', (event: CustomEvent) => {
        event.preventDefault();
      });
      const eventSpy = sinon.spy(select, 'emitEvent');
      await elementUpdated(select);

      select.click();
      await elementUpdated(select);

      expect(select.open).to.be.false;
      expect(eventSpy).calledOnceWithExactly('igcOpening', {
        cancelable: true,
      });
    });

    it('does not emit `igcClosing` & `igcClosed` events on `hide` method calls.', async () => {
      const eventSpy = sinon.spy(select, 'emitEvent');
      select.hide();
      await elementUpdated(select);

      expect(eventSpy).not.to.be.called;
    });

    it('emits `igcClosing` & `igcClosed` events on clicking the target.', async () => {
      const eventSpy = sinon.spy(select, 'emitEvent');
      select.click();
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
    });

    it('does not emit `igcClosed` event and does not hide the list on canceling `igcClosing` event.', async () => {
      select.addEventListener('igcClosing', (event: CustomEvent) =>
        event.preventDefault()
      );
      await elementUpdated(select);

      const eventSpy = sinon.spy(select, 'emitEvent');

      select.click();
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(eventSpy).calledOnceWithExactly('igcClosing', {
        cancelable: true,
      });
    });

    it('emits `igcChange`, `igcClosing` and `igcClosed` events on selecting an item via mouse click.', async () => {
      const options = [
        ...select.querySelectorAll('igc-select-item'),
      ] as IgcSelectItemComponent[];
      const eventSpy = sinon.spy(select, 'emitEvent');

      selectOpts(select)[2].click();
      await elementUpdated(select);

      const args = { detail: options[2] };
      expect(eventSpy).calledWithExactly('igcChange', args);
      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
    });

    it('emits `igcChange`, `igcClosing` and `igcClosed` events on selecting an item via `Enter` key.', async () => {
      const options = [
        ...select.querySelectorAll('igc-select-item'),
      ] as IgcSelectItemComponent[];
      const eventSpy = sinon.spy(select, 'emitEvent');

      pressKey('ArrowDown');
      pressKey('Enter');
      await elementUpdated(select);

      const args = { detail: options[0] };
      expect(eventSpy).calledWithExactly('igcChange', args);
      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
    });

    it('selects an item but does not close the select on `Enter` key when `igcClosing` event is canceled.', async () => {
      const options = [
        ...select.querySelectorAll('igc-select-item'),
      ] as IgcSelectItemComponent[];
      select.addEventListener('igcClosing', (event: CustomEvent) =>
        event.preventDefault()
      );
      await elementUpdated(select);
      const eventSpy = sinon.spy(select, 'emitEvent');

      pressKey('ArrowDown');
      pressKey('Enter');
      await elementUpdated(select);

      const args = { detail: options[0] };
      expect(eventSpy).calledWithExactly('igcChange', args);
      expect(eventSpy).calledWith('igcClosing');
      expect(select.open).to.be.true;
    });
  });

  describe('', () => {
    const selectGroup = (el: IgcSelectComponent) =>
      [...el.querySelectorAll('igc-select-group')] as IgcSelectGroupComponent[];

    let groups: IgcSelectGroupComponent[];

    beforeEach(async () => {
      select = await fixture<IgcSelectComponent>(html`<igc-select>
        <igc-select-group>
          <h3 slot="label">Research & Development</h3>
          ${items
            .slice(0, 3)
            .map(
              (item) =>
                html`<igc-select-item value=${item.value}
                  >${item.text}</igc-select-item
                >`
            )}
        </igc-select-group>
        <igc-select-group>
          <h3 slot="label">Product Guidance</h3>
          ${items
            .slice(3, 5)
            .map(
              (item) =>
                html`<igc-select-item value=${item.value} .disabled=${true}
                  >${item.text}</igc-select-item
                >`
            )}
        </igc-select-group>
        <igc-select-group>
          <h3 slot="label">Release Engineering</h3>
          <igc-select-item value=${items[5].value}
            >${items[5].text}</igc-select-item
          >
        </igc-select-group>
      </igc-select>`);

      select.open = true;
      await elementUpdated(select);
      groups = selectGroup(select);
    });

    it('is successfully created with default properties.', () => {
      expect(document.querySelector('igc-select')).to.exist;
      expect(groups[0].disabled).to.be.false;
    });
  });

  const pressKey = (key: string, times = 1) => {
    for (let i = 0; i < times; i++) {
      ddList(select).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: key,
          bubbles: true,
          composed: true,
        })
      );
    }
  };
});
