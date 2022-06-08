import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import sinon from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents';
import IgcInputComponent from '../input/input';
import IgcSelectComponent from './select';
import IgcSelectGroupComponent from './select-group';
import IgcSelectItemComponent from './select-item';

describe('Select component', () => {
  let select: IgcSelectComponent;
  let input: IgcInputComponent;

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
    [...el.querySelectorAll('igc-select-item')] as HTMLElement[];

  before(() => {
    defineComponents(
      IgcSelectComponent,
      IgcSelectGroupComponent,
      IgcSelectItemComponent,
      IgcInputComponent
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

      input = select.shadowRoot!.querySelector(
        'igc-input'
      ) as IgcInputComponent;
    });

    it('is accessible.', async () => {
      select.open = true;
      select.label = 'Simple Select';
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
      expect(select.autofocus).to.be.undefined;
      expect(select.label).to.be.undefined;
      expect(select.placeholder).to.be.undefined;
      expect(select.outlined).to.be.false;
      expect(select.size).to.equal('medium');
    });

    it('correctly applies input related properties to encapsulated input', async () => {
      select.value = items[0].value;
      select.disabled = true;
      select.required = true;
      select.invalid = false;
      select.autofocus = true;
      select.label = 'Select Label';
      select.placeholder = 'Select Placeholder';
      select.outlined = true;
      select.size = 'large';
      await elementUpdated(select);

      expect(input.value).to.equal(select.value);
      expect(input.disabled).to.equal(select.disabled);
      expect(input.required).to.equal(select.required);
      expect(input.invalid).to.equal(select.invalid);
      expect(input.autofocus).to.equal(select.autofocus);
      expect(input.label).to.equal(select.label);
      expect(input.placeholder).to.equal(select.placeholder);
      expect(input.outlined).to.equal(select.outlined);
      expect(input.size).to.equal(select.size);
    });

    it('initializes items with default properties', () => {
      const options = [
        ...select.querySelectorAll('igc-select-item'),
      ] as IgcSelectItemComponent[];
      expect(options[0].disabled).to.be.false;
      expect(options[0].value).to.equal(items[0].value);
      expect(options[0].selected).to.be.false;
    });

    it('navigates to the item with the specified value on `navigateTo` method calls.', async () => {
      select.navigateTo('implementation');
      await elementUpdated(select);

      expect(selectOpts(select)[1].hasAttribute('active')).to.be.true;
    });

    it('navigates to the item at the specified index on `navigateTo` method calls.', async () => {
      select.navigateTo(1);
      await elementUpdated(select);

      expect(selectOpts(select)[1].hasAttribute('active')).to.be.true;
    });

    it('opens the list of options when Enter or Spacebar keys are pressed', () => {
      const allowedKeys = [' ', 'space', 'spacebar', 'enter'];

      allowedKeys.forEach((key) => {
        pressKey(input, key);
        expect(select.open).to.be.true;
        select.hide();
      });
    });

    it('should select the next selectable item using ArrowDown or ArrowRight when the list of options is closed', async () => {
      select.hide();
      await elementUpdated(select);

      pressKey(input, 'ArrowDown');
      await elementUpdated(select);

      expect(selectOpts(select)[0].hasAttribute('selected')).to.be.true;
      expect(selectOpts(select)[0].hasAttribute('active')).to.be.true;
      expect(select.value).to.equal(items[0].value);

      pressKey(input, 'ArrowRight');
      await elementUpdated(select);

      expect(selectOpts(select)[1].hasAttribute('selected')).to.be.true;
      expect(selectOpts(select)[1].hasAttribute('active')).to.be.true;
      expect(select.value).to.equal(items[1].value);
    });

    it('should select the previous selectable item using ArrowUp or ArrowLeft when the list of options is closed', async () => {
      select.hide();
      select.select(items.length - 1);
      await elementUpdated(select);

      pressKey(input, 'ArrowUp');
      await elementUpdated(select);

      expect(selectOpts(select)[items.length - 2].hasAttribute('selected')).to
        .be.true;
      expect(selectOpts(select)[items.length - 2].hasAttribute('active')).to.be
        .true;
      expect(select.value).to.equal(items[items.length - 2].value);

      pressKey(input, 'ArrowLeft');
      await elementUpdated(select);

      expect(selectOpts(select)[items.length - 3].hasAttribute('selected')).to
        .be.true;
      expect(selectOpts(select)[items.length - 3].hasAttribute('active')).to.be
        .true;
      expect(select.value).to.equal(items[items.length - 3].value);
    });

    it('should fire the igcChange event when using ArrowUp, ArrowDown, ArrowLeft, or ArrowRight and a new item is selected', async () => {
      const eventSpy = sinon.spy(select, 'emitEvent');
      select.hide();
      select.select(0);
      await elementUpdated(select);

      pressKey(input, 'ArrowRight');
      await elementUpdated(select);
      expect(eventSpy).calledWith('igcChange');

      pressKey(input, 'ArrowDown');
      await elementUpdated(select);
      expect(eventSpy).calledWith('igcChange');

      pressKey(input, 'ArrowUp');
      await elementUpdated(select);
      expect(eventSpy).calledWith('igcChange');

      pressKey(input, 'ArrowLeft');
      await elementUpdated(select);
      expect(eventSpy).calledWith('igcChange');
    });

    it('should not fire the igcChange event when using ArrowUp or ArrowLeft and the first item is already selected', async () => {
      const eventSpy = sinon.spy(select, 'emitEvent');
      select.hide();
      select.select(0);
      await elementUpdated(select);

      expect(selectOpts(select)[0].hasAttribute('selected')).to.be.true;
      expect(selectOpts(select)[0].hasAttribute('active')).to.be.true;

      pressKey(input, 'ArrowLeft');
      await elementUpdated(select);
      expect(eventSpy).not.be.calledWith('igcChange');

      pressKey(input, 'ArrowUp');
      await elementUpdated(select);
      expect(eventSpy).not.be.calledWith('igcChange');
    });

    it('should not fire the igcChange event when using ArrowDown or ArrowRight and the last item is already selected', async () => {
      const itemIndex = items.length - 1;
      const eventSpy = sinon.spy(select, 'emitEvent');
      select.hide();

      select.select(itemIndex);
      await elementUpdated(select);

      expect(selectOpts(select)[itemIndex].hasAttribute('selected')).to.be.true;
      expect(selectOpts(select)[itemIndex].hasAttribute('active')).to.be.true;

      pressKey(input, 'ArrowDown');
      await elementUpdated(select);
      expect(eventSpy).not.be.calledWith('igcChange');

      pressKey(input, 'ArrowRight');
      await elementUpdated(select);
      expect(eventSpy).not.be.calledWith('igcChange');
    });

    it('input should not capture the keydown event when the list of options is opened', async () => {
      select.select(0);
      await elementUpdated(select);

      pressKey(select, 'ArrowDown', 2);
      await elementUpdated(select);

      console.log(selectOpts(select));
      expect(selectOpts(select)[0].hasAttribute('selected')).to.be.true;
      expect(selectOpts(select)[2].hasAttribute('selected')).to.be.false;
      expect(selectOpts(select)[2].hasAttribute('active')).to.be.true;

      pressKey(select, 'ArrowRight');
      await elementUpdated(select);
      expect(selectOpts(select)[0].hasAttribute('selected')).to.be.true;
      expect(selectOpts(select)[2].hasAttribute('active')).to.be.true;
      expect(selectOpts(select)[3].hasAttribute('selected')).to.be.false;
      expect(selectOpts(select)[3].hasAttribute('active')).to.be.false;

      pressKey(select, 'ArrowUp');
      await elementUpdated(select);
      expect(selectOpts(select)[0].hasAttribute('selected')).to.be.true;
      expect(selectOpts(select)[1].hasAttribute('selected')).to.be.false;
      expect(selectOpts(select)[1].hasAttribute('active')).to.be.true;

      pressKey(select, 'ArrowLeft');
      await elementUpdated(select);
      expect(selectOpts(select)[0].hasAttribute('selected')).to.be.true;
      expect(selectOpts(select)[0].hasAttribute('active')).to.be.false;
      expect(selectOpts(select)[1].hasAttribute('active')).to.be.true;
    });

    //   it('should focus when the focus method is called', async () => {
    //     const eventSpy = sinon.spy(select, 'emitEvent');

    //     select.focus();
    //     await elementUpdated(select);

    //     expect(eventSpy).calledWith('igcFocus');
    //     expect(document.activeElement).to.equal(select);
    //   });

    //   it('should blur when the blur method is called', async () => {
    //     const eventSpy = sinon.spy(select, 'emitEvent');

    //     select.blur();
    //     await elementUpdated(select);

    //     expect(eventSpy).calledWith('igcBlur');
    //     expect(document.activeElement).to.not.equal(select);
    //   });

    //   it('does not emit `igcOpening` & `igcOpened` events on `show` method calls.', async () => {
    //     select.open = false;
    //     await elementUpdated(select);

    //     const eventSpy = sinon.spy(select, 'emitEvent');
    //     select.show();
    //     await elementUpdated(select);

    //     expect(select.open).to.be.true;
    //     expect(eventSpy).not.to.be.called;
    //   });

    //   it('emits `igcOpening` & `igcOpened` events on clicking the target.', async () => {
    //     select.open = false;
    //     await elementUpdated(select);

    //     const eventSpy = sinon.spy(select, 'emitEvent');
    //     select.click();
    //     await elementUpdated(select);

    //     expect(select.open).to.be.true;
    //     expect(eventSpy).calledWith('igcOpening');
    //     expect(eventSpy).calledWith('igcOpened');
    //   });

    //   it('does not emit `igcOpened` event and does not show the list on canceling `igcOpening` event.', async () => {
    //     select.open = false;
    //     select.addEventListener('igcOpening', (event: CustomEvent) => {
    //       event.preventDefault();
    //     });
    //     const eventSpy = sinon.spy(select, 'emitEvent');
    //     await elementUpdated(select);

    //     select.click();
    //     await elementUpdated(select);

    //     expect(select.open).to.be.false;
    //     expect(eventSpy).calledOnceWithExactly('igcOpening', {
    //       cancelable: true,
    //     });
    //   });

    //   it('does not emit `igcClosing` & `igcClosed` events on `hide` method calls.', async () => {
    //     const eventSpy = sinon.spy(select, 'emitEvent');
    //     select.hide();
    //     await elementUpdated(select);

    //     expect(eventSpy).not.to.be.called;
    //   });

    //   it('emits `igcClosing` & `igcClosed` events on clicking the target.', async () => {
    //     const eventSpy = sinon.spy(select, 'emitEvent');
    //     select.click();
    //     await elementUpdated(select);

    //     expect(eventSpy).calledWith('igcClosing');
    //     expect(eventSpy).calledWith('igcClosed');
    //   });

    //   it('does not emit `igcClosed` event and does not hide the list on canceling `igcClosing` event.', async () => {
    //     select.addEventListener('igcClosing', (event: CustomEvent) =>
    //       event.preventDefault()
    //     );
    //     await elementUpdated(select);

    //     const eventSpy = sinon.spy(select, 'emitEvent');

    //     select.click();
    //     await elementUpdated(select);

    //     expect(select.open).to.be.true;
    //     expect(eventSpy).calledOnceWithExactly('igcClosing', {
    //       cancelable: true,
    //     });
    //   });

    //   it('emits `igcChange`, `igcClosing` and `igcClosed` events on selecting an item via mouse click.', async () => {
    //     const options = [
    //       ...select.querySelectorAll('igc-select-item'),
    //     ] as IgcSelectItemComponent[];
    //     const eventSpy = sinon.spy(select, 'emitEvent');

    //     select.click();
    //     await elementUpdated(select);

    //     selectOpts(select)[2].click();
    //     await elementUpdated(select);

    //     const args = { detail: options[2].value };
    //     expect(eventSpy).calledWithExactly('igcChange', args);
    //     expect(eventSpy).calledWith('igcClosing');
    //     expect(eventSpy).calledWith('igcClosed');
    //   });

    //   it('emits `igcChange` events on selecting an item via `Arrow` keys.', async () => {
    //     const eventSpy = sinon.spy(select, 'emitEvent');
    //     pressKey('ArrowDown', 2);
    //     await elementUpdated(select);

    //     let args = { detail: items[1].value };
    //     expect(eventSpy).calledWithExactly('igcChange', args);

    //     pressKey('ArrowRight');
    //     await elementUpdated(select);

    //     args = { detail: items[2].value };
    //     expect(eventSpy).calledWithExactly('igcChange', args);

    //     pressKey('ArrowLeft');
    //     await elementUpdated(select);

    //     args = { detail: items[1].value };
    //     expect(eventSpy).calledWithExactly('igcChange', args);

    //     pressKey('ArrowUp');
    //     await elementUpdated(select);

    //     args = { detail: items[0].value };
    //     expect(eventSpy).calledWithExactly('igcChange', args);
    //   });

    //   it('selects an item but does not close the select on `Enter` key when `igcClosing` event is canceled.', async () => {
    //     select.addEventListener('igcClosing', (event: CustomEvent) =>
    //       event.preventDefault()
    //     );
    //     await elementUpdated(select);
    //     const eventSpy = sinon.spy(select, 'emitEvent');

    //     select.click();
    //     await elementUpdated(select);

    //     pressKey('ArrowDown');
    //     pressKey('Enter');
    //     await elementUpdated(select);

    //     const args = { detail: items[0].value };
    //     expect(eventSpy).calledWithExactly('igcChange', args);
    //     expect(eventSpy).calledWith('igcClosing');
    //     expect(select.open).to.be.true;
    //   });
    // });

    // describe('', () => {
    //   const selectGroup = (el: IgcSelectComponent) =>
    //     [...el.querySelectorAll('igc-select-group')] as IgcSelectGroupComponent[];

    //   let groups: IgcSelectGroupComponent[];

    //   beforeEach(async () => {
    //     select = await fixture<IgcSelectComponent>(html`<igc-select>
    //       <igc-select-group>
    //         <h3 slot="label">Research & Development</h3>
    //         ${items
    //           .slice(0, 3)
    //           .map(
    //             (item) =>
    //               html`<igc-select-item value=${item.value}
    //                 >${item.text}</igc-select-item
    //               >`
    //           )}
    //       </igc-select-group>
    //       <igc-select-group>
    //         <h3 slot="label">Product Guidance</h3>
    //         ${items
    //           .slice(3, 5)
    //           .map(
    //             (item) =>
    //               html`<igc-select-item value=${item.value} .disabled=${true}
    //                 >${item.text}</igc-select-item
    //               >`
    //           )}
    //       </igc-select-group>
    //       <igc-select-group>
    //         <h3 slot="label">Release Engineering</h3>
    //         <igc-select-item value=${items[5].value}
    //           >${items[5].text}</igc-select-item
    //         >
    //       </igc-select-group>
    //     </igc-select>`);

    //     select.open = true;
    //     await elementUpdated(select);
    //     groups = selectGroup(select);
    //   });

    //   it('is successfully created with default properties.', () => {
    //     expect(document.querySelector('igc-select-group')).to.exist;
    //     expect(groups[0].disabled).to.be.false;
    //   });

    //   it('displays grouped items properly.', () => {
    //     expect(groups.length).to.eq(3);

    //     expect(groups[0].querySelectorAll('igc-select-item').length).to.eq(3);
    //     expect(groups[1].querySelectorAll('igc-select-item').length).to.eq(2);
    //     expect(groups[2].querySelectorAll('igc-select-item').length).to.eq(1);
    //   });

    //   it('displays group headers properly.', () => {
    //     expect(groups[0].querySelector('h3')!.textContent).to.eq(
    //       'Research & Development'
    //     );
    //     expect(groups[1].querySelector('h3')!.textContent).to.eq(
    //       'Product Guidance'
    //     );
    //     expect(groups[2].querySelector('h3')!.textContent).to.eq(
    //       'Release Engineering'
    //     );
    //   });

    //   it('navigates properly through grouped items with the list of options closed.', async () => {
    //     await elementUpdated(select);

    //     pressKey('ArrowDown', 2);
    //     await elementUpdated(select);

    //     expect(select.value).to.equal(items[1].value);

    //     pressKey('ArrowUp');
    //     await elementUpdated(select);

    //     expect(select.value).to.equal(items[0].value);
    //   });

    //   it('navigates properly through grouped items with the list of options opened.', async () => {
    //     select.click();
    //     await elementUpdated(select);

    //     pressKey('ArrowDown', 2);
    //     await elementUpdated(select);

    //     const groupItems = [...groups[0].querySelectorAll('igc-select-item')];

    //     expect(groupItems[1]?.hasAttribute('active')).to.be.true;
    //     expect(groupItems.filter((i) => i.hasAttribute('active')).length).to.eq(
    //       1
    //     );

    //     pressKey('ArrowUp');
    //     await elementUpdated(select);

    //     expect(groupItems[0]?.hasAttribute('active')).to.be.true;
    //     expect(groupItems.filter((i) => i.hasAttribute('active')).length).to.eq(
    //       1
    //     );
    //   });

    //   it('skips disabled items when navigating through grouped items with the list closed.', async () => {
    //     await elementUpdated(select);

    //     pressKey('ArrowDown', 4);
    //     await elementUpdated(select);

    //     expect(select.value).to.equal(items[3].value);

    //     pressKey('ArrowUp');
    //     await elementUpdated(select);

    //     expect(select.value).to.equal(items[2].value);
    //   });

    //   it('skips disabled items when navigating through grouped items with the list opened.', async () => {
    //     select.click();
    //     await elementUpdated(select);

    //     pressKey('ArrowDown', 4);
    //     await elementUpdated(select);

    //     let groupItems = [...groups[2].querySelectorAll('igc-select-item')];

    //     expect(groupItems[0]?.hasAttribute('active')).to.be.true;
    //     expect(groupItems.filter((i) => i.hasAttribute('active')).length).to.eq(
    //       1
    //     );

    //     pressKey('ArrowUp');
    //     await elementUpdated(select);

    //     groupItems = [...groups[1].querySelectorAll('igc-select-item')];
    //     expect(groupItems.pop()?.hasAttribute('active')).to.be.false;
    //     expect(
    //       [...groups[0].querySelectorAll('igc-select-item')]
    //         .pop()
    //         ?.hasAttribute('active')
    //     ).to.be.true;
    //   });

    //   it('does nothing on clicking group labels.', async () => {
    //     groups[0].querySelector('h3')?.click();
    //     await elementUpdated(select);

    //     expect(select.open).to.be.true;
    //   });
  });
  const pressKey = (target: HTMLElement, key: string, times = 1) => {
    for (let i = 0; i < times; i++) {
      target.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: key,
          bubbles: true,
          composed: true,
        })
      );
    }
  };
});
