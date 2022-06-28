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
      disabled: false,
    },
    {
      value: 'implementation',
      text: 'Implementation',
      disabled: false,
    },
    {
      value: 'testing',
      text: 'Testing',
      disabled: true,
    },
    {
      value: 'samples',
      text: 'Samples',
      disabled: false,
    },
    {
      value: 'documentation',
      text: 'Documentation',
      disabled: false,
    },
    {
      value: 'builds',
      text: 'Builds',
      disabled: true,
    },
  ];

  const selectOpts = (el: IgcSelectComponent) =>
    [...el.querySelectorAll('igc-select-item')] as IgcSelectItemComponent[];

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
            html`<igc-select-item
              value=${item.value}
              ?disabled=${item.disabled}
            >
              <span slot="prefix">FR</span>
              ${item.text}
              <span slot="suffix">FR</span>
            </igc-select-item>`
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

      const selectedItem = selectOpts(select).find((i) => i.selected);

      expect(input.value).to.equal(selectedItem?.textContent);
      expect(input.disabled).to.equal(select.disabled);
      expect(input.required).to.equal(select.required);
      expect(input.invalid).to.equal(select.invalid);
      expect(input.autofocus).to.equal(select.autofocus);
      expect(input.label).to.equal(select.label);
      expect(input.placeholder).to.equal(select.placeholder);
      expect(input.outlined).to.equal(select.outlined);
      expect(input.size).to.equal(select.size);
      expect(input.dir).to.equal(select.dir);
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

    it('assings the value of the selected item as its own', async () => {
      const selected = select.select(0);
      await elementUpdated(select);

      expect(select.value).to.equal(selected?.value);
    });

    it('should retrieve and replace only the text content of the content part in an item', () => {
      const replaceWith = 'Some other display text';
      const item = selectOpts(select)[0];
      const prefix = item.querySelector('[slot="prefix"]');
      const suffix = item.querySelector('[slot="suffix"]');

      expect(item.textContent).to.equal(items[0].text);
      expect(prefix?.textContent).to.equal('FR');
      expect(suffix?.textContent).to.equal('FR');

      item.textContent = replaceWith;

      expect(item.textContent).to.equal(replaceWith);
      expect(prefix?.textContent).to.equal('FR');
      expect(suffix?.textContent).to.equal('FR');
    });

    it('toggles the list of options when Alt+Up or Alt+Down keys are pressed', async () => {
      input.click();
      select.value = '';
      await elementUpdated(select);

      expect(select.open).to.be.true;

      pressKey(input, 'arrowup', 1, { altKey: true });
      expect(select.open).to.be.false;
      expect(select.value).to.be.undefined;

      pressKey(input, 'arrowup', 1, { altKey: true });
      expect(select.open).to.be.true;
      expect(select.value).to.be.undefined;

      pressKey(input, 'arrowdown', 1, { altKey: true });
      expect(select.open).to.be.false;
      expect(select.value).to.be.undefined;

      pressKey(input, 'arrowdown', 1, { altKey: true });
      expect(select.open).to.be.true;
      expect(select.value).to.be.undefined;

      pressKey(input, 'up', 1, { altKey: true });
      expect(select.open).to.be.false;
      expect(select.value).to.be.undefined;

      pressKey(input, 'up', 1, { altKey: true });
      expect(select.open).to.be.true;
      expect(select.value).to.be.undefined;

      pressKey(input, 'down', 1, { altKey: true });
      expect(select.open).to.be.false;
      expect(select.value).to.be.undefined;

      pressKey(input, 'down', 1, { altKey: true });
      expect(select.open).to.be.true;
      expect(select.value).to.be.undefined;
    });

    it('select the first non-disabled item when the Home button is pressed', async () => {
      const options = selectOpts(select);
      options[0].setAttribute('disabled', '');
      const activeItems = selectOpts(select).filter(
        (item) => !item.hasAttribute('disabled')
      );
      const index = selectOpts(select).indexOf(activeItems[0]);
      select.open = false;
      await elementUpdated(select);

      pressKey(input, 'home');
      await elementUpdated(select);
      expect(select.value).to.equal(items[index].value);
      expect(selectOpts(select)[index].hasAttribute('selected')).to.be.true;
    });

    it('select the last non-disabled item when the End button is pressed', async () => {
      const activeItems = selectOpts(select).filter(
        (item) => !item.hasAttribute('disabled')
      );
      const index = selectOpts(select).indexOf(
        activeItems[activeItems.length - 1]
      );
      select.open = false;
      await elementUpdated(select);

      pressKey(input, 'end');
      await elementUpdated(select);
      expect(select.value).to.equal(items[index].value);
      expect(selectOpts(select)[index].hasAttribute('selected')).to.be.true;
    });

    it('should not fire the igcChange event when the Home button is pressed and the first item is already selected', async () => {
      const eventSpy = sinon.spy(select, 'emitEvent');
      select.select(0);
      await elementUpdated(select);

      pressKey(input, 'home');
      await elementUpdated(select);
      expect(eventSpy).not.be.calledWith('igcChange');
    });

    it('should not fire the igcChange event when the End button is pressed and the last item is already selected', async () => {
      const activeItems = selectOpts(select).filter(
        (item) => !item.hasAttribute('disabled')
      );
      const index = selectOpts(select).indexOf(
        activeItems[activeItems.length - 1]
      );
      select.open = false;
      select.select(index);

      await elementUpdated(select);
      const eventSpy = sinon.spy(select, 'emitEvent');

      pressKey(input, 'end');
      expect(eventSpy).not.be.calledWith('igcChange');
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

    it('should select an item upon typing a valid term while the select is on focus', async () => {
      const term = items[0].text;

      Array.from(term).forEach((char) => {
        pressKey(input, char);
      });

      await elementUpdated(select);
      const item = selectOpts(select).find((i) => i.value === items[0].value);

      expect(item?.selected).to.be.true;
    });

    it('should not change selection upon typing an invalid term while the select is on focus', async () => {
      const itemIndex = 1;
      const term = 'infra';
      select.select(itemIndex);
      await elementUpdated(select);

      Array.from(term).forEach((char) => {
        pressKey(input, char);
      });

      await elementUpdated(select);
      expect(selectOpts(select)[itemIndex]?.selected).to.be.true;
    });

    it('should select the first item that matches the term', async () => {
      const term = 's';
      await elementUpdated(select);

      Array.from(term).forEach((char) => {
        pressKey(input, char);
      });

      await elementUpdated(select);
      const item = selectOpts(select).find((i) =>
        i.textContent?.toLocaleLowerCase()?.startsWith(term)
      );
      expect(item?.selected).to.be.true;
    });

    it('should select another valid item if the user starts typing after pausing', async () => {
      let term = 'sp';

      Array.from(term).forEach((char) => {
        pressKey(input, char);
      });

      await elementUpdated(select);
      let item = selectOpts(select).find((i) =>
        i.textContent?.toLocaleLowerCase()?.startsWith(term)
      );

      expect(item?.selected).to.be.true;

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      term = 'sa';
      Array.from(term).forEach((char) => {
        pressKey(input, char);
      });

      await elementUpdated(select);
      item = selectOpts(select).find((i) =>
        i.textContent?.toLocaleLowerCase()?.startsWith(term)
      );

      expect(item?.selected).to.be.true;
    });

    it('should not select an item upon typing a valid term while the select is on focus and the item is disabled', async () => {
      const disabledItem = items.find((i) => i.disabled);
      const term = disabledItem?.text;

      Array.from(term!).forEach((char) => {
        pressKey(input, char);
      });

      await elementUpdated(select);
      const item = selectOpts(select).find(
        (i) => i.value === disabledItem?.value
      );

      expect(item?.selected).to.be.false;
    });

    it('should close the list of options when Tab or Shift + Tab are pressed', () => {
      select.show();

      pressKey(input, 'Tab');
      expect(select.open).to.be.false;

      select.show();

      pressKey(input, 'Tab', 1, { shiftKey: true });
      expect(select.open).to.be.false;
    });

    it('should focus when the focus method is called', async () => {
      const eventSpy = sinon.spy(input, 'emitEvent');

      select.focus();
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcFocus');
      expect(document.activeElement).to.equal(select);
    });

    it('should blur when the blur method is called', async () => {
      select.focus();
      await elementUpdated(select);

      const eventSpy = sinon.spy(input, 'emitEvent');

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
      input.click();
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

      input.click();
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
      select.show();
      await elementUpdated(select);

      const eventSpy = sinon.spy(select, 'emitEvent');
      input.click();
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
    });

    it('does not emit `igcClosed` event and does not hide the list on canceling `igcClosing` event.', async () => {
      select.show();
      await elementUpdated(select);

      select.addEventListener('igcClosing', (event: CustomEvent) =>
        event.preventDefault()
      );
      const eventSpy = sinon.spy(select, 'emitEvent');

      selectOpts(select)[0].click();
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(eventSpy).calledWith('igcChange');
      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).not.be.calledWith('igcClosed');
    });

    it('emits `igcChange`, `igcClosing` and `igcClosed` events on selecting an item via mouse click.', async () => {
      select.show();
      await elementUpdated(select);
      const eventSpy = sinon.spy(select, 'emitEvent');

      selectOpts(select)[1].click();
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcChange');
      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
    });

    it('emits `igcChange` events on selecting an item via `Arrow` keys.', async () => {
      const eventSpy = sinon.spy(select, 'emitEvent');
      pressKey(input, 'ArrowDown', 2);
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcChange');

      pressKey(input, 'ArrowRight');
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcChange');

      pressKey(input, 'ArrowLeft');
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcChange');

      pressKey(input, 'ArrowUp');
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcChange');
    });

    it('selects an item but does not close the select on `Enter` key when `igcClosing` event is canceled.', async () => {
      select.show();
      await elementUpdated(select);

      select.addEventListener('igcClosing', (event: CustomEvent) =>
        event.preventDefault()
      );
      await elementUpdated(select);
      const eventSpy = sinon.spy(select, 'emitEvent');

      pressKey(input, 'ArrowDown');
      pressKey(input, 'Enter');
      await elementUpdated(select);

      expect(eventSpy).calledWith('igcChange');
      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).not.be.calledWith('igcClosed');
      expect(select.open).to.be.true;
    });

    it('reports validity when required', async () => {
      const validity = sinon.spy(select, 'reportValidity');

      select.value = undefined;
      select.required = true;
      await elementUpdated(select);

      select.reportValidity();
      expect(validity).to.have.returned(false);
      expect(select.invalid).to.be.true;

      select.value = items[0].value;
      await elementUpdated(select);
      select.reportValidity();

      expect(validity).to.have.returned(true);
      expect(select.invalid).to.be.false;
    });

    it('reports validity when not required', async () => {
      const validity = sinon.spy(select, 'reportValidity');

      select.value = undefined;
      select.required = false;
      await elementUpdated(select);

      select.reportValidity();
      expect(validity).to.have.returned(true);
      expect(select.invalid).to.be.false;

      select.value = items[0].value;
      await elementUpdated(select);
      select.reportValidity();

      expect(validity).to.have.returned(true);
      expect(select.invalid).to.be.false;
    });
  });

  describe('', () => {
    const selectGroup = (el: IgcSelectComponent) =>
      [...el.querySelectorAll('igc-select-group')] as IgcSelectGroupComponent[];

    let groups: IgcSelectGroupComponent[];

    beforeEach(async () => {
      select = await fixture<IgcSelectComponent>(html`<igc-select>
        <igc-select-group>
          <igc-select-header slot="label"
            >Research & Development</igc-select-header
          >
          ${items
            .slice(0, 3)
            .map(
              (item) =>
                html`<igc-select-item
                  value=${item.value}
                  .disabled=${item.disabled}
                  >${item.text}</igc-select-item
                >`
            )}
        </igc-select-group>
        <igc-select-group>
          <igc-select-header slot="label">Product Guidance</igc-select-header>
          ${items
            .slice(3, 5)
            .map(
              (item) =>
                html`<igc-select-item
                  value=${item.value}
                  .disabled=${item.disabled}
                  >${item.text}</igc-select-item
                >`
            )}
        </igc-select-group>
        <igc-select-group>
          <igc-select-header slot="label"
            >Release Engineering</igc-select-header
          >
          <igc-select-item
            value=${items[5].value}
            .disabled=${items[5].disabled}
            >${items[5].text}</igc-select-item
          >
        </igc-select-group>
      </igc-select>`);

      select.open = true;
      await elementUpdated(select);
      groups = selectGroup(select);
    });

    it('is successfully created with default properties.', () => {
      expect(document.querySelector('igc-select-group')).to.exist;
      expect(groups[0].disabled).to.be.false;
    });

    it('displays grouped items properly.', () => {
      expect(groups.length).to.eq(3);

      expect(groups[0].querySelectorAll('igc-select-item').length).to.eq(3);
      expect(groups[1].querySelectorAll('igc-select-item').length).to.eq(2);
      expect(groups[2].querySelectorAll('igc-select-item').length).to.eq(1);
    });

    it('displays group headers properly.', () => {
      expect(groups[0].querySelector('igc-select-header')!.textContent).to.eq(
        'Research & Development'
      );
      expect(groups[1].querySelector('igc-select-header')!.textContent).to.eq(
        'Product Guidance'
      );
      expect(groups[2].querySelector('igc-select-header')!.textContent).to.eq(
        'Release Engineering'
      );
    });

    it('should disable all group items when the group is disabled', async () => {
      groups[0].disabled = true;
      await elementUpdated(select);

      groups[0].items.forEach((i) => expect(i.disabled).to.be.true);
    });

    it('should restore disabled items to inital disabled state when group is no longer disabled', async () => {
      const item = groups[0].items[0];
      item.disabled = true;
      await elementUpdated(select);

      groups[0].disabled = true;
      await elementUpdated(select);

      groups[0].items.forEach((i) => expect(i.disabled).to.be.true);

      groups[0].disabled = false;
      await elementUpdated(select);

      expect(item.disabled).to.be.true;
    });

    it('should not let items to be programatically enabled in a disabled group', async () => {
      groups[0].disabled = true;
      await elementUpdated(select);

      groups[0].items.forEach((i) => expect(i.disabled).to.be.true);

      groups[0].items[0].disabled = false;
      await elementUpdated(select);

      groups[0].items.forEach((i) => expect(i.disabled).to.be.true);
    });
  });
});
const pressKey = (
  target: HTMLElement,
  key: string,
  times = 1,
  options?: Object
) => {
  for (let i = 0; i < times; i++) {
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: key,
        bubbles: true,
        composed: true,
        ...options,
      })
    );
  }
};
