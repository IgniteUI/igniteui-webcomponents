import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import sinon from 'sinon';
import IgcButtonComponent from '../button/button';
import { defineComponents } from '../common/definitions/defineComponents';
import IgcDropdownComponent from './dropdown';
import IgcDropdownGroupComponent from './dropdown-group';
import IgcDropdownHeaderComponent from './dropdown-header';
import IgcDropdownItemComponent from './dropdown-item';

describe('Dropdown component', () => {
  before(() => {
    defineComponents(
      IgcDropdownComponent,
      IgcButtonComponent,
      IgcDropdownHeaderComponent,
      IgcDropdownGroupComponent,
      IgcDropdownItemComponent
    );
  });

  let dropdown: IgcDropdownComponent;
  const items = [
    'Specification',
    'Implementation',
    'Testing',
    'Samples',
    'Documentation',
    'Builds',
  ];

  const ddListWrapper = (el: IgcDropdownComponent) =>
    el.shadowRoot!.querySelector('[part="base"]') as HTMLElement;
  const ddList = (el: IgcDropdownComponent) =>
    ddListWrapper(el).querySelector('[part="list"]') as HTMLElement;
  const ddItems = (el: IgcDropdownComponent) =>
    [...el.querySelectorAll('igc-dropdown-item')] as HTMLElement[];
  const ddHeaders = (el: IgcDropdownComponent) =>
    [...el.querySelectorAll('igc-dropdown-header')] as HTMLElement[];
  const target = (el: IgcDropdownComponent) =>
    el.querySelector('input') as HTMLElement;

  describe('', () => {
    beforeEach(async () => {
      dropdown = await fixture<IgcDropdownComponent>(html` <igc-dropdown>
        <input
          type="button"
          slot="target"
          value="Dropdown"
          aria-label="dropdownButton"
        />
        <igc-dropdown-header>Tasks</igc-dropdown-header>
        ${items.map(
          (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
        )}
      </igc-dropdown>`);
    });

    it('handles initial selection', async () => {
      dropdown = await fixture<IgcDropdownComponent>(html`
        <igc-dropdown>
          <input
            type="button"
            slot="target"
            value="Dropdown"
            aria-label="dropdownButton"
          />
          <igc-dropdown-header>Languages</igc-dropdown-header>
          <igc-dropdown-item selected>JavaScript</igc-dropdown-item>
          <igc-dropdown-item selected>TypeScript</igc-dropdown-item>
          <igc-dropdown-item>SCSS</igc-dropdown-item>
        </igc-dropdown>
      `);

      expect(dropdown.querySelectorAll('[selected]').length).to.equal(1);
      expect(dropdown.querySelector('[selected]')?.textContent).to.equal(
        'TypeScript'
      );
    });

    it('is accessible.', async () => {
      dropdown.open = true;
      await elementUpdated(dropdown);
      await expect(dropdown).to.be.accessible();
      await expect(dropdown).shadowDom.to.be.accessible();
    });

    it('is successfully created with default properties.', () => {
      expect(document.querySelector('igc-dropdown')).to.exist;
      expect(dropdown.open).to.be.false;
      expect(dropdown.flip).to.be.false;
      expect(dropdown.keepOpenOnOutsideClick).to.be.false;
      expect(dropdown.keepOpenOnSelect).to.be.false;
      expect(dropdown.placement).to.eq('bottom-start');
      expect(dropdown.positionStrategy).to.eq('absolute');
      expect(dropdown.scrollStrategy).to.eq('scroll');
      expect(dropdown.distance).to.eq(0);
      expect(dropdown.sameWidth).to.be.false;
    });

    it('shows and hides the list when changing the value of `open`.', async () => {
      expect(ddListWrapper(dropdown).getBoundingClientRect()).to.be.empty;

      dropdown.open = true;
      await elementUpdated(dropdown);

      expect(dropdown.open).to.be.true;

      dropdown.open = false;
      await elementUpdated(dropdown);

      expect(dropdown.open).to.be.false;
    });

    describe('', () => {
      const listRect = () => ddListWrapper(dropdown).getBoundingClientRect();
      const targetRect = () => target(dropdown).getBoundingClientRect();

      beforeEach(async () => {
        dropdown.open = true;
        await elementUpdated(dropdown);
      });

      it('displays properly all declared items.', async () => {
        const headers = ddHeaders(dropdown).map((h) => h.innerText);
        const itemValues = ddItems(dropdown).map((h) => h.innerText);

        expect(headers.length).to.eq(1);
        expect(itemValues.length).to.eq(items.length);

        expect(headers[0]).to.eq('Tasks');
        expect(itemValues).to.deep.eq(items);
      });

      it('places the list at the bottom start of the target.', async () => {
        expect(listRect().x).to.eq(targetRect().x);
        expect(Math.round(listRect().top)).to.eq(
          Math.round(targetRect().bottom)
        );
      });

      it('repositions the list immediately according to `placement` property.', async () => {
        dropdown.placement = 'right-start';
        await elementUpdated(dropdown);

        expect(dropdown.placement).to.eq('right-start');

        expect(listRect().x).to.eq(targetRect().right);
        expect(Math.round(listRect().top)).to.eq(Math.round(targetRect().top));
      });

      it('honors `flip` value when positioning the list according to the specified `placement`.', async () => {
        dropdown.placement = 'left';
        await elementUpdated(dropdown);

        expect(dropdown.placement).to.eq('left');

        expect(Math.round(listRect().right)).to.eq(targetRect().x);

        dropdown.flip = true;
        await elementUpdated(dropdown);

        expect(dropdown.flip).to.be.true;
        expect(listRect().x).to.eq(targetRect().right);
      });

      it('honors `preventOverflow` option and keeps the list in view.', async () => {
        dropdown.placement = 'right-end';
        await elementUpdated(dropdown);

        expect(dropdown.placement).to.eq('right-end');
        expect(Math.round(listRect().top)).to.eq(0);
      });

      it('offsets the list according to the `offset` property value.', async () => {
        dropdown.distance = 5;
        await elementUpdated(dropdown);

        expect(listRect().x).to.eq(targetRect().x);
        expect(Math.round(listRect().top)).to.eq(
          Math.round(targetRect().bottom + 5)
        );

        dropdown.placement = 'left-start';
        dropdown.distance = 20;
        await elementUpdated(dropdown);

        expect(Math.round(listRect().right)).to.eq(targetRect().x - 20);
        expect(Math.round(listRect().top)).to.eq(Math.round(targetRect().top));
      });

      it('toggles the list on `show`/`hide` method calls.', async () => {
        dropdown.show();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;

        dropdown.hide();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;

        dropdown.show();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;
      });

      it('toggles the list on `toggle` method calls.', async () => {
        dropdown.toggle();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;

        dropdown.toggle();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;

        dropdown.toggle();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
      });

      it('`select` method successfully selects the item with the specified value.', async () => {
        const itemValue = 'Samples';
        const selectedItem = dropdown.select(itemValue);
        await elementUpdated(dropdown);

        expect(selectedItem).to.exist;
        expect(selectedItem?.value).to.eq(itemValue);

        const item = ddItems(dropdown).find((i) => i.innerText === itemValue);
        expect(item?.hasAttribute('active')).to.be.true;
        expect(item?.attributes.getNamedItem('selected')).to.exist;
        expect(item?.attributes.getNamedItem('aria-selected')).to.exist;

        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('selected'))
            .length
        ).to.eq(1);
      });

      it('`select` method successfully selects the item at the specified index.', async () => {
        const itemValue = 'Samples';
        const selectedItem = dropdown.select(3);
        await elementUpdated(dropdown);

        expect(selectedItem).to.exist;
        expect(selectedItem?.value).to.eq(itemValue);

        const item = ddItems(dropdown).find((i) => i.innerText === itemValue);
        expect(item?.hasAttribute('active')).to.be.true;
        expect(item?.attributes.getNamedItem('selected')).to.exist;
        expect(item?.attributes.getNamedItem('aria-selected')).to.exist;

        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('selected'))
            .length
        ).to.eq(1);
      });

      it('`select` method selects nothing if the specified value does not exist.', async () => {
        const selectedItem = dropdown.select('Samples1');
        await elementUpdated(dropdown);

        expect(selectedItem).to.be.null;
        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('selected'))
            .length
        ).to.eq(0);
      });

      it('`select` method selects nothing if the specified index is out of bounds.', async () => {
        const selectedItem = dropdown.select(-3);
        await elementUpdated(dropdown);

        expect(selectedItem).to.be.null;
        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('selected'))
            .length
        ).to.eq(0);
      });

      it('`select` method does not change the active/selected item if the specified value does not exist.', async () => {
        dropdown.select('Samples');
        await elementUpdated(dropdown);

        dropdown.select('Test');
        expect(
          ddItems(dropdown).find((i) => i.attributes.getNamedItem('selected'))
            ?.textContent
        ).to.eq('Samples');
      });

      it('clears current selection on `clearSelection` method calls.', async () => {
        const item = dropdown.select('Samples');
        await elementUpdated(dropdown);

        dropdown.clearSelection();
        await elementUpdated(dropdown);
        expect(getSelectedItems().length).to.eq(0);
        expect(item?.hasAttribute('active')).to.be.false;
      });

      it('navigates to the item with the specified value on `navigateTo` method calls.', async () => {
        dropdown.navigateTo('Implementation');
        await elementUpdated(dropdown);

        expect(ddItems(dropdown)[1].hasAttribute('active')).to.be.true;

        dropdown.navigateTo('Implementations');
        await elementUpdated(dropdown);

        expect(ddItems(dropdown)[1].hasAttribute('active')).to.be.true;
      });

      it('navigates to the item at the specified index on `navigateTo` method calls.', async () => {
        dropdown.navigateTo(1);
        await elementUpdated(dropdown);

        expect(ddItems(dropdown)[1].hasAttribute('active')).to.be.true;

        dropdown.navigateTo(10);
        await elementUpdated(dropdown);

        expect(ddItems(dropdown)[1].hasAttribute('active')).to.be.true;
      });

      it('activates the first item on pressing `arrowdown` key when no selection is available.', async () => {
        pressKey('ArrowDown');
        await elementUpdated(dropdown);

        const item = ddItems(dropdown)[0];
        expect(item?.hasAttribute('active')).to.be.true;
        expect(
          ddItems(dropdown).filter((i) => i.hasAttribute('active')).length
        ).to.eq(1);
      });

      it('activates the last item on pressing `End` key', async () => {
        pressKey('End');
        await elementUpdated(dropdown);

        const item = ddItems(dropdown).at(-1)!;
        expect(item.hasAttribute('active')).to.be.true;
        expect(dropdown.querySelectorAll('[active]').length).to.equal(1);
      });

      it('activates the first item on pressing `Home` key', async () => {
        pressKey('Home');
        await elementUpdated(dropdown);

        const item = ddItems(dropdown).at(0)!;
        expect(item.hasAttribute('active')).to.be.true;
        expect(dropdown.querySelectorAll('[active]').length).to.equal(1);
      });

      it('activates the next item on pressing `arrowdown` key.', async () => {
        pressKey('ArrowDown', 2);

        await elementUpdated(dropdown);

        const item = ddItems(dropdown)[1];
        expect(item?.hasAttribute('active')).to.be.true;
        expect(
          ddItems(dropdown).filter((i) => i.hasAttribute('active')).length
        ).to.eq(1);
      });

      it('does not change the activate item on pressing `arrowdown` key at the end of the list.', async () => {
        pressKey('ArrowDown', ddItems(dropdown).length);
        await elementUpdated(dropdown);

        const item = ddItems(dropdown).pop();
        expect(item?.hasAttribute('active')).to.be.true;
        expect(
          ddItems(dropdown).filter((i) => i.hasAttribute('active')).length
        ).to.eq(1);
      });

      it('activates the previous item on pressing `arrowup` key.', async () => {
        pressKey('ArrowDown', 2);
        pressKey('ArrowUp');
        await elementUpdated(dropdown);

        const item = ddItems(dropdown)[0];
        expect(item?.hasAttribute('active')).to.be.true;
        expect(
          ddItems(dropdown).filter((i) => i.hasAttribute('active')).length
        ).to.eq(1);
      });

      it('does not change the activate item on pressing `arrowup` key at the top of the list.', async () => {
        pressKey('ArrowDown', 2);
        pressKey('ArrowUp');
        await elementUpdated(dropdown);

        const item = ddItems(dropdown)[0];
        expect(item?.hasAttribute('active')).to.be.true;
        expect(
          ddItems(dropdown).filter((i) => i.hasAttribute('active')).length
        ).to.eq(1);
      });

      it('selects the currently active item on pressing `Enter` key and closes the dropdown.', async () => {
        expect(dropdown.open).to.be.true;
        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('selected'))
            .length
        ).to.eq(0);

        pressKey('ArrowDown', 2);
        pressKey('Enter');
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('selected'))
            .length
        ).to.eq(1);
        expect(ddItems(dropdown)[1]?.hasAttribute('active')).to.be.true;
        expect(ddItems(dropdown)[1]?.attributes.getNamedItem('selected')).to
          .exist;
      });

      it('does not select the currently active item on pressing `Escape` key and closes the dropdown.', async () => {
        expect(dropdown.open).to.be.true;
        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('selected'))
            .length
        ).to.eq(0);

        pressKey('ArrowDown', 2);
        pressKey('Escape');
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('selected'))
            .length
        ).to.eq(0);
        expect(ddItems(dropdown)[1]?.hasAttribute('active')).to.be.true;
        expect(ddItems(dropdown)[1]?.attributes.getNamedItem('selected')).to.be
          .null;
      });

      it('preserves selection on closing & reopening.', async () => {
        pressKey('ArrowDown', 2);
        pressKey('Enter');
        dropdown.open = true;
        await elementUpdated(dropdown);

        expect(getSelectedItems()[0].textContent).to.eq('Implementation');
      });

      it('items are selected via mouse click.', async () => {
        expect(getSelectedItems().length).to.eq(0);

        ddItems(dropdown)[3].click();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
        expect(ddItems(dropdown)[3]?.hasAttribute('active')).to.be.true;
        expect(getSelectedItems().length).to.eq(1);
        expect(getSelectedItems()[0].textContent).to.eq('Samples');
      });

      it('preserves selection on closing the list.', async () => {
        dropdown.select('Samples');
        dropdown.toggle();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
        dropdown.toggle();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;
        expect(getSelectedItems()[0].textContent).to.eq('Samples');
      });

      it('keeps the list open on selection if `closeOnSelect` is set to false.', async () => {
        expect(getSelectedItems().length).to.eq(0);

        dropdown.keepOpenOnSelect = true;
        ddItems(dropdown)[3].click();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;
        expect(getSelectedItems()[0].textContent).to.eq('Samples');

        pressKey('ArrowDown');
        pressKey('Enter');
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;
        expect(getSelectedItems()[0].textContent).to.eq('Documentation');
      });

      it('allows disabling items.', async () => {
        const dropDownItems = [
          ...dropdown.querySelectorAll('igc-dropdown-item'),
        ] as IgcDropdownItemComponent[];

        expect(dropDownItems[0].disabled).to.eq(false);
        dropDownItems[0].disabled = true;
        await elementUpdated(dropdown);

        expect(dropDownItems[0].disabled).to.eq(true);
        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('disabled'))
            .length
        ).to.eq(1);

        expect(dropDownItems[3].disabled).to.eq(false);
        dropDownItems[3].disabled = true;
        await elementUpdated(dropdown);

        expect(dropDownItems[3].disabled).to.eq(true);
        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('disabled'))
            .length
        ).to.eq(2);

        dropDownItems[3].disabled = false;
        await elementUpdated(dropdown);

        expect(dropDownItems[3].disabled).to.eq(false);
        expect(
          ddItems(dropdown).filter((i) => i.attributes.getNamedItem('disabled'))
            .length
        ).to.eq(1);
      });

      it('does not activate disabled items during keyboard navigation.', async () => {
        const dropDownItems = [
          ...dropdown.querySelectorAll('igc-dropdown-item'),
        ] as IgcDropdownItemComponent[];
        dropDownItems[0].disabled = true;
        await elementUpdated(dropdown);

        pressKey('ArrowDown');
        await elementUpdated(dropdown);

        expect(ddItems(dropdown)[0]?.hasAttribute('active')).to.be.false;
        expect(ddItems(dropdown)[1]?.hasAttribute('active')).to.be.true;

        pressKey('ArrowUp');
        await elementUpdated(dropdown);

        expect(ddItems(dropdown)[0]?.hasAttribute('active')).to.be.false;
        expect(ddItems(dropdown)[1]?.hasAttribute('active')).to.be.true;
      });

      it('does not activate disabled items on mouse click.', async () => {
        const dropDownItems = [
          ...dropdown.querySelectorAll('igc-dropdown-item'),
        ] as IgcDropdownItemComponent[];
        dropDownItems[0].disabled = true;
        await elementUpdated(dropdown);

        dropDownItems[0].click();
        await elementUpdated(dropdown);

        expect(ddItems(dropdown)[0]?.hasAttribute('active')).to.be.false;
        expect(dropdown.open).to.be.true;
        expect(getSelectedItems().length).to.eq(0);
      });

      it('does not emit `igcOpening` & `igcOpened` events on `show` method calls.', async () => {
        dropdown.open = false;
        await elementUpdated(dropdown);

        const eventSpy = sinon.spy(dropdown, 'emitEvent');
        dropdown.show();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;
        expect(eventSpy).not.to.be.called;
      });

      it('emits `igcOpening` & `igcOpened` events on clicking the target.', async () => {
        dropdown.open = false;
        await elementUpdated(dropdown);

        const eventSpy = sinon.spy(dropdown, 'emitEvent');
        target(dropdown).click();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;
        expect(eventSpy).calledWith('igcOpening');
        expect(eventSpy).calledWith('igcOpened');
      });

      it('does not emit `igcOpened` event and does not show the list on canceling `igcOpening` event.', async () => {
        dropdown.open = false;
        dropdown.addEventListener('igcOpening', (event: CustomEvent) => {
          event.preventDefault();
        });
        const eventSpy = sinon.spy(dropdown, 'emitEvent');
        await elementUpdated(dropdown);

        target(dropdown).click();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
        expect(eventSpy).calledOnceWithExactly('igcOpening', {
          cancelable: true,
        });
      });

      it('does not emit `igcClosing` & `igcClosed` events on `hide` method calls.', async () => {
        const eventSpy = sinon.spy(dropdown, 'emitEvent');
        dropdown.hide();
        await elementUpdated(dropdown);

        expect(eventSpy).not.to.be.called;
      });

      it('emits `igcClosing` & `igcClosed` events on clicking the target.', async () => {
        const eventSpy = sinon.spy(dropdown, 'emitEvent');
        target(dropdown).click();
        await elementUpdated(dropdown);

        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
      });

      it('does not emit `igcClosed` event and does not hide the list on canceling `igcClosing` event.', async () => {
        dropdown.addEventListener('igcClosing', (event: CustomEvent) =>
          event.preventDefault()
        );
        await elementUpdated(dropdown);

        const eventSpy = sinon.spy(dropdown, 'emitEvent');

        target(dropdown).click();
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;
        expect(eventSpy).calledOnceWithExactly('igcClosing', {
          cancelable: true,
        });
      });

      it('emits `igcChange`, `igcClosing` and `igcClosed` events on selecting an item via mouse click.', async () => {
        const dropDownItems = [
          ...dropdown.querySelectorAll('igc-dropdown-item'),
        ] as IgcDropdownItemComponent[];
        const eventSpy = sinon.spy(dropdown, 'emitEvent');

        ddItems(dropdown)[2].click();
        await elementUpdated(dropdown);

        const args = { detail: dropDownItems[2] };
        expect(eventSpy).calledWithExactly('igcChange', args);
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
      });

      it('emits `igcChange`, `igcClosing` and `igcClosed` events on selecting an item via `Enter` key.', async () => {
        const dropDownItems = [
          ...dropdown.querySelectorAll('igc-dropdown-item'),
        ] as IgcDropdownItemComponent[];
        const eventSpy = sinon.spy(dropdown, 'emitEvent');

        pressKey('ArrowDown');
        pressKey('Enter');
        await elementUpdated(dropdown);

        const args = { detail: dropDownItems[0] };
        expect(eventSpy).calledWithExactly('igcChange', args);
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
      });

      it('selects an item but does not close the dropdown on `Enter` key when `igcClosing` event is canceled.', async () => {
        const dropDownItems = [
          ...dropdown.querySelectorAll('igc-dropdown-item'),
        ] as IgcDropdownItemComponent[];
        dropdown.addEventListener('igcClosing', (event: CustomEvent) =>
          event.preventDefault()
        );
        await elementUpdated(dropdown);
        const eventSpy = sinon.spy(dropdown, 'emitEvent');

        pressKey('ArrowDown');
        pressKey('Enter');
        await elementUpdated(dropdown);

        const args = { detail: dropDownItems[0] };
        expect(eventSpy).calledWithExactly('igcChange', args);
        expect(eventSpy).calledWith('igcClosing');
        expect(dropdown.open).to.be.true;
      });

      it('emits `igcChange` event with the correct arguments on selecting an item.', async () => {
        ddItems(dropdown)[2].click();
        dropdown.open = true;
        await elementUpdated(dropdown);

        const dropDownItems = [
          ...dropdown.querySelectorAll('igc-dropdown-item'),
        ] as IgcDropdownItemComponent[];
        const eventSpy = sinon.spy(dropdown, 'emitEvent');

        ddItems(dropdown)[0].click();
        await elementUpdated(dropdown);

        let args = { detail: dropDownItems[0] };
        expect(eventSpy).calledWithExactly('igcChange', args);

        dropdown.open = true;
        await elementUpdated(dropdown);

        pressKey('ArrowDown');
        pressKey('Enter');

        await elementUpdated(dropdown);

        args = { detail: dropDownItems[1] };
        expect(eventSpy).calledWithExactly('igcChange', args);
      });

      it('by default closes the list on clicking outside.', async () => {
        document.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
      });

      it('emits closing events when clicking outside', async () => {
        const eventSpy = sinon.spy(dropdown, 'emitEvent');

        document.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
      });

      it('cleans up document event listeners', async () => {
        const eventSpy = sinon.spy(dropdown, 'emitEvent');

        dropdown.open = true;
        await elementUpdated(dropdown);

        document.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
        expect(eventSpy).callCount(2);

        document.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.false;
        expect(eventSpy).callCount(2);
      });

      it('can cancel `igcClosing` event when clicking outside', async () => {
        const eventSpy = sinon.spy(dropdown, 'emitEvent');

        dropdown.addEventListener('igcClosing', (e) => e.preventDefault());

        document.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).not.calledWith('igcClosed');
      });

      it('does not close the list on clicking outside when `closeOnOutsideClick` is false.', async () => {
        dropdown.keepOpenOnOutsideClick = true;
        await elementUpdated(dropdown);

        document.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(dropdown);

        expect(dropdown.open).to.be.true;
      });
    });
  });

  describe('', () => {
    const ddGroups = (el: IgcDropdownComponent) =>
      [...el.querySelectorAll('igc-dropdown-group')] as HTMLElement[];
    let groups: HTMLElement[];
    beforeEach(async () => {
      dropdown = await fixture<IgcDropdownComponent>(html`<igc-dropdown>
        <input type="button" slot="target" value="Dropdown" />
        <igc-dropdown-group>
          <h3 slot="label">Research & Development</h3>
          ${items
            .slice(0, 3)
            .map(
              (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
            )}
        </igc-dropdown-group>
        <igc-dropdown-group>
          <h3 slot="label">Product Guidance</h3>
          ${items
            .slice(3, 5)
            .map(
              (item) =>
                html`<igc-dropdown-item .disabled=${true}
                  >${item}</igc-dropdown-item
                >`
            )}
        </igc-dropdown-group>
        <igc-dropdown-group>
          <h3 slot="label">Release Engineering</h3>
          <igc-dropdown-item>${items[5]}</igc-dropdown-item>
        </igc-dropdown-group>
      </igc-dropdown>`);

      dropdown.open = true;
      await elementUpdated(dropdown);
      groups = ddGroups(dropdown);
    });

    it('displays grouped items properly.', () => {
      expect(groups.length).to.eq(3);

      expect(groups[0].querySelectorAll('igc-dropdown-item').length).to.eq(3);
      expect(groups[1].querySelectorAll('igc-dropdown-item').length).to.eq(2);
      expect(groups[2].querySelectorAll('igc-dropdown-item').length).to.eq(1);
    });

    it('displays group headers properly.', () => {
      expect(groups[0].querySelector('h3')!.textContent).to.eq(
        'Research & Development'
      );
      expect(groups[1].querySelector('h3')!.textContent).to.eq(
        'Product Guidance'
      );
      expect(groups[2].querySelector('h3')!.textContent).to.eq(
        'Release Engineering'
      );
    });

    it('navigates properly through grouped items.', async () => {
      pressKey('ArrowDown', 2);
      await elementUpdated(dropdown);

      const groupItems = [...groups[0].querySelectorAll('igc-dropdown-item')];

      expect(groupItems[1]?.hasAttribute('active')).to.be.true;
      expect(groupItems.filter((i) => i.hasAttribute('active')).length).to.eq(
        1
      );

      pressKey('ArrowUp');
      await elementUpdated(dropdown);

      expect(groupItems[0]?.hasAttribute('active')).to.be.true;
      expect(groupItems.filter((i) => i.hasAttribute('active')).length).to.eq(
        1
      );
    });

    it('skips disabled items when navigating through grouped items.', async () => {
      pressKey('ArrowDown', 4);
      await elementUpdated(dropdown);

      let groupItems = [...groups[2].querySelectorAll('igc-dropdown-item')];

      expect(groupItems[0]?.hasAttribute('active')).to.be.true;
      expect(groupItems.filter((i) => i.hasAttribute('active')).length).to.eq(
        1
      );

      pressKey('ArrowUp');
      await elementUpdated(dropdown);

      groupItems = [...groups[1].querySelectorAll('igc-dropdown-item')];
      expect(groupItems.pop()?.hasAttribute('active')).to.be.false;
      expect(
        [...groups[0].querySelectorAll('igc-dropdown-item')]
          .pop()
          ?.hasAttribute('active')
      ).to.be.true;
    });

    it('does nothing on clicking group labels.', async () => {
      groups[0].querySelector('h3')?.click();
      await elementUpdated(dropdown);

      expect(dropdown.open).to.be.true;
    });

    describe('', () => {
      beforeEach(async () => {
        const styles: Partial<CSSStyleDeclaration> = {
          height: `150px`,
        };
        Object.assign(
          (dropdown?.shadowRoot?.children[1] as HTMLElement).style,
          styles
        );
        await elementUpdated(dropdown);
      });

      it('scrolls to item on activation via keyboard.', async () => {
        expect(ddListWrapper(dropdown).scrollTop).to.eq(0);

        pressKey('ArrowDown', 3);
        await elementUpdated(dropdown);
        expect(ddListWrapper(dropdown).scrollTop).to.eq(0);

        pressKey('ArrowDown', 1);
        await elementUpdated(dropdown);

        const wrapper = ddListWrapper(dropdown);
        const lastItem = ddItems(dropdown).pop();
        const itemRect = lastItem?.getBoundingClientRect();
        expect(
          Math.round(wrapper.getBoundingClientRect().bottom)
        ).to.be.greaterThanOrEqual(Math.round(itemRect?.bottom as number));
      });

      it('scrolls to the selected item on opening the list.', async () => {
        pressKey('ArrowDown', 4);
        pressKey('Enter');
        await elementUpdated(dropdown);

        dropdown.open = true;
        await elementUpdated(dropdown);

        const wrapper = ddListWrapper(dropdown);
        const selectedItem = ddItems(dropdown)[3];
        const itemRect = selectedItem?.getBoundingClientRect();
        expect(
          Math.round(wrapper.getBoundingClientRect().bottom)
        ).to.be.greaterThanOrEqual(Math.round(itemRect?.bottom as number));
      });
    });
  });

  const getSelectedItems = () => {
    return [
      ...ddItems(dropdown).filter((i) => i.attributes.getNamedItem('selected')),
    ];
  };

  const pressKey = (key: string, times = 1) => {
    for (let i = 0; i < times; i++) {
      ddList(dropdown).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: key,
          bubbles: true,
          composed: true,
        })
      );
    }
  };
});
