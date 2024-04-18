import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { spy } from 'sinon';

import {
  IgcButtonGroupComponent,
  IgcToggleButtonComponent,
  defineComponents,
} from '../../index.js';

describe('Button Group', () => {
  before(() => {
    defineComponents(IgcButtonGroupComponent);
  });

  const DIFF_OPTIONS = {
    ignoreTags: ['igc-toggle-button'],
    ignoreAttributes: ['id', 'alignment'],
  };

  let buttonGroup: IgcButtonGroupComponent;
  let buttons: IgcToggleButtonComponent[];

  describe('', () => {
    beforeEach(async () => {
      buttonGroup = await createButtonGroupComponent();
      buttons = buttonGroup.querySelectorAll(
        'igc-toggle-button'
      ) as unknown as IgcToggleButtonComponent[];
    });

    describe('Initialization Tests', () => {
      it('passes the a11y audit', async () => {
        await expect(buttonGroup).to.be.accessible();
        await expect(buttonGroup).shadowDom.to.be.accessible();
      });

      it('should initialize a button group with toggle buttons', () => {
        expect(buttonGroup).to.contain('igc-toggle-button');
        expect(buttons.length).to.equal(3);
      });

      it('is correctly initialized with its default component state', () => {
        expect(buttonGroup.disabled).to.be.false;
        expect(buttonGroup.alignment).to.equal('horizontal');
        expect(buttonGroup.selection).to.equal('single');
        expect(buttonGroup.selectedItems).to.be.empty;
        expect(buttonGroup.dir).to.be.empty;
      });

      it('should render proper role and attributes', () => {
        const buttonGroupElement = buttonGroup.shadowRoot?.querySelector('div');

        expect(buttonGroupElement).not.to.be.null;
        expect(buttonGroupElement).to.have.attribute('part', 'group');
        expect(buttonGroupElement).to.have.attribute('role', 'group');
        expect(buttonGroupElement).to.have.attribute('aria-disabled', 'false');
      });
    });

    describe('Properties` Tests', () => {
      it('sets `selection` property successfully', async () => {
        buttonGroup.selection = 'multiple';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection).to.equal('multiple');

        buttonGroup.selection = 'single-required';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection).to.equal('single-required');
      });

      it('sets `disabled` property successfully', async () => {
        buttonGroup.disabled = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.disabled).to.be.true;
        expect(buttonGroup).dom.to.equal(
          '<igc-button-group disabled></igc-button-group>',
          DIFF_OPTIONS
        );

        buttons.forEach((b) => {
          expect(b.disabled).to.be.true;
          expect(b).dom.to.equal(
            `<igc-toggle-button disabled>${b.textContent?.trim()}</igc-toggle-button>`,
            {
              ignoreAttributes: ['value'],
            }
          );
        });

        buttonGroup.disabled = false;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.disabled).to.be.false;
        expect(buttonGroup).dom.to.equal(
          '<igc-button-group></igc-button-group>',
          DIFF_OPTIONS
        );

        buttons.forEach((b) => {
          expect(b.disabled).to.be.false;
          expect(b).dom.to.equal(
            `<igc-toggle-button>${b.textContent?.trim()}</igc-toggle-button>`,
            {
              ignoreAttributes: ['value'],
            }
          );
        });
      });

      it('sets `alignment` property successfully', async () => {
        buttonGroup.alignment = 'vertical';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.alignment).to.equal('vertical');
        expect(buttonGroup).dom.to.equal(
          `<igc-button-group alignment="vertical"></igc-button-group>`,
          {
            ignoreTags: ['igc-toggle-button'],
            ignoreAttributes: ['id'],
          }
        );

        buttonGroup.alignment = 'horizontal';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.alignment).to.equal('horizontal');
        expect(buttonGroup).dom.to.equal(
          `<igc-button-group alignment="horizontal"></igc-button-group>`,
          {
            ignoreTags: ['igc-toggle-button'],
            ignoreAttributes: ['id'],
          }
        );
      });
    });

    describe('Selection Tests', () => {
      it('should initialize a button group with initial selection state through attribute', async () => {
        // single mode
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selected-items='["left"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // single-required mode
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection="single-required" selected-items='["left"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // multiple mode
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection="multiple" selected-items='["left", "right"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(2);
        expect(buttonGroup.selectedItems).to.have.same.members([
          'left',
          'right',
        ]);
      });

      it('should initialize a button group with initial selection state through child attribute', async () => {
        // single mode
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group>
            <igc-toggle-button value="left" selected>Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // single-required mode
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection="single-required">
            <igc-toggle-button value="left" selected>Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // multiple mode
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection="multiple">
            <igc-toggle-button value="left" selected>Left</igc-toggle-button>
            <igc-toggle-button value="center" selected>Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(2);
        expect(buttonGroup.selectedItems).to.have.same.members([
          'left',
          'center',
        ]);
      });

      it('should be able to update selection state through selectedItems property', async () => {
        // single mode
        expect(buttonGroup.selectedItems.length).to.equal(0);

        buttonGroup.selectedItems = ['left'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // signle-required mode
        buttonGroup.selection = 'single-required';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(0);

        buttonGroup.selectedItems = ['right'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['right']);

        // multiple mode
        buttonGroup.selection = 'multiple';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(0);

        buttonGroup.selectedItems = ['left', 'right'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(2);
        expect(buttonGroup.selectedItems).to.have.same.members([
          'left',
          'right',
        ]);
      });

      it('should be able to update selection state through the selected property of its children', async () => {
        // single mode
        expect(buttonGroup.selectedItems.length).to.equal(0);

        buttons[0].selected = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // multiple mode
        buttonGroup.selection = 'multiple';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(0);

        buttons[0].selected = true;
        buttons[1].selected = true;

        expect(buttonGroup.selectedItems.length).to.equal(2);
        expect(buttonGroup.selectedItems).to.have.same.members([
          'left',
          'center',
        ]);
      });

      it('should set the selectedItems to be the last selected button if multiple buttons are selected', async () => {
        // single mode
        // through selected-items attribute
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selected-items='["right", "left"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // through child selected attribute
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group>
            <igc-toggle-button value="left" selected>Left</igc-toggle-button>
            <igc-toggle-button value="center" selected>Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['center']);

        // through selectedItems property
        buttonGroup = await createButtonGroupComponent();
        buttonGroup.selectedItems = ['right', 'left'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // single-required mode
        // through selected-items attribute
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection="single-required" selected-items='["right", "left"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // through child selected attribute
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection="single-required">
            <igc-toggle-button value="left" selected>Left</igc-toggle-button>
            <igc-toggle-button value="center" selected>Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['center']);

        // through selectedItems property
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection="single-required">
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        buttonGroup.selectedItems = ['right', 'left'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);
      });

      it('should update selected state when adding buttons at runtime', async () => {
        // single / single-required mode
        buttons[0].selected = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members([
          buttons[0].value,
        ]);

        const button1 = document.createElement(
          IgcToggleButtonComponent.tagName
        );
        button1.setAttribute('value', 'button-1');
        button1.setAttribute('selected', '');

        const button2 = document.createElement(
          IgcToggleButtonComponent.tagName
        );
        button2.setAttribute('value', 'button-2');
        button2.setAttribute('selected', '');

        buttonGroup.appendChild(button1);
        buttonGroup.appendChild(button2);
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members([button2.value]);

        // multiple mode
        buttonGroup.selection = 'multiple';
        await elementUpdated(buttonGroup);

        buttons[0].selected = true;
        buttons[1].selected = true;

        const button3 = document.createElement(
          IgcToggleButtonComponent.tagName
        );
        button3.setAttribute('value', 'button-3');
        button3.setAttribute('selected', '');

        const button4 = document.createElement(
          IgcToggleButtonComponent.tagName
        );
        button4.setAttribute('value', 'button-4');
        button4.setAttribute('selected', '');

        buttonGroup.appendChild(button3);
        buttonGroup.appendChild(button4);
        await elementUpdated(buttonGroup);

        const expectedSelection = [
          buttons[0].value,
          buttons[1].value,
          button3.value,
          button4.value,
        ];

        expect(buttonGroup.selectedItems.length).to.equal(
          expectedSelection.length
        );
        expect(buttonGroup.selectedItems).to.have.same.members(
          expectedSelection
        );
      });

      it('should clear the selection when changing the selection mode', async () => {
        expect(buttonGroup.selection).to.equal('single');
        expect(buttonGroup.selectedItems.length).to.equal(0);

        buttonGroup.selectedItems = ['left'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);

        buttonGroup.selection = 'multiple';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection).to.equal('multiple');
        expect(buttonGroup.selectedItems.length).to.equal(0);

        buttonGroup.selectedItems = ['left', 'right'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(2);

        buttonGroup.selection = 'single-required';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection).to.equal('single-required');
        expect(buttonGroup.selectedItems.length).to.equal(0);
      });

      it('initial selection through child selection attribute has higher priority', async () => {
        // single mode
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selected-items='["left"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right" selected>Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['right']);

        // single-required mode
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection="single-required" selected-items='["left"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right" selected>Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['right']);

        // multiple mode
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection="multiple" selected-items='["left", "center"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right" selected>Right</igc-toggle-button>
            <igc-toggle-button value="top" selected>Top</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selectedItems.length).to.equal(2);
        expect(buttonGroup.selectedItems).to.have.same.members([
          'right',
          'top',
        ]);
      });
    });

    describe('UI Tests', () => {
      it('should be able to select only a single button through UI when selection is single', async () => {
        expect(buttonGroup.selection).to.equal('single');
        expect(buttonGroup.selectedItems.length).to.equal(0);

        // select first button
        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // select second button
        buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['center']);

        // deselect second button
        buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(0);
      });

      it('should not be able to deselect a button through UI when selection is single-required', async () => {
        buttonGroup.selection = 'single-required';
        await elementUpdated(buttonGroup);

        buttons[0].selected = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection).to.equal('single-required');
        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        // deselect button
        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);
      });

      it('should be able to select multiple buttons through UI when selection is multiple', async () => {
        buttonGroup.selection = 'multiple';
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection).to.equal('multiple');
        expect(buttonGroup.selectedItems.length).to.equal(0);

        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members(['left']);

        buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selectedItems.length).to.equal(2);
        expect(buttonGroup.selectedItems).to.have.same.members([
          'left',
          'center',
        ]);
      });

      it('should not be able to interact through UI when the group is disabled', async () => {
        buttonGroup.disabled = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.disabled).to.be.true;

        const buttonGroupElement = buttonGroup.shadowRoot?.querySelector('div');
        expect(buttonGroupElement).to.have.attribute('aria-disabled', 'true');

        buttons.forEach((button) => {
          const style = getComputedStyle(button);
          expect(style.pointerEvents).to.equal('none');
        });
      });

      it('should emit `igcSelect` event on select', async () => {
        const eventSpy = spy(buttonGroup, 'emitEvent');

        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        const args = { detail: buttons[0].value };

        expect(eventSpy).calledWith('igcSelect', args);

        buttonGroup.addEventListener('igcSelect', (event) => {
          expect(buttonGroup.selectedItems.length).to.equal(1);
          expect(buttonGroup.selectedItems).to.have.same.members([
            event.detail,
          ]);
        });
      });

      it('should emit `igcDeselect` event on deselect', async () => {
        const eventSpy = spy(buttonGroup, 'emitEvent');

        buttons[0].selected = true;
        await elementUpdated(buttonGroup);

        // deselect button
        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        const args = { detail: buttons[0].value };

        expect(eventSpy).calledWith('igcDeselect', args);

        buttonGroup.addEventListener('igcDeselect', () => {
          expect(buttonGroup.selectedItems.length).to.equal(0);
        });
      });

      it('events are correctly emitted on user interaction (single mode)', async () => {
        const eventSpy = spy(buttonGroup, 'emitEvent');
        const selectArgs = { detail: '' };
        const deselectArgs = { detail: '' };

        // select first button
        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        selectArgs.detail = buttons[0].value;

        expect(eventSpy).calledWith('igcSelect', selectArgs);
        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members([
          buttons[0].value,
        ]);

        // select second button
        buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        selectArgs.detail = buttons[1].value;
        deselectArgs.detail = buttons[0].value;

        expect(eventSpy).calledWith('igcDeselect', deselectArgs);
        expect(eventSpy).calledWith('igcSelect', selectArgs);
        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members([
          buttons[1].value,
        ]);
      });

      it('events are correctly emitted on user interaction (single-required mode)', async () => {
        const eventSpy = spy(buttonGroup, 'emitEvent');
        const selectArgs = { detail: '' };
        const deselectArgs = { detail: '' };

        buttonGroup.selection = 'single-required';
        await elementUpdated(buttonGroup);

        // select first button
        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        selectArgs.detail = buttons[0].value;

        expect(eventSpy).calledWith('igcSelect', selectArgs);
        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members([
          buttons[0].value,
        ]);

        eventSpy.resetHistory();

        // deselect first button
        // should not emit events when interacting with an already selected button
        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(eventSpy).not.calledWith('igcDeselect');
        expect(eventSpy).not.calledWith('igcSelect');
        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members([
          buttons[0].value,
        ]);

        // select second button
        buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        selectArgs.detail = buttons[1].value;
        deselectArgs.detail = buttons[0].value;

        expect(eventSpy).calledWith('igcDeselect', deselectArgs);
        expect(eventSpy).calledWith('igcSelect', selectArgs);
        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members([
          buttons[1].value,
        ]);
      });

      it('events are correctly emitted on user interaction (multiple mode)', async () => {
        const eventSpy = spy(buttonGroup, 'emitEvent');
        const selectArgs = { detail: '' };
        const deselectArgs = { detail: '' };

        buttonGroup.selection = 'multiple';
        await elementUpdated(buttonGroup);

        // select first button
        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        selectArgs.detail = buttons[0].value;

        expect(eventSpy).calledWith('igcSelect', selectArgs);
        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members([
          buttons[0].value,
        ]);

        // select second button
        buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        selectArgs.detail = buttons[1].value;

        expect(eventSpy).not.calledWith('igcDeselect');
        expect(eventSpy).calledWith('igcSelect', selectArgs);
        expect(buttonGroup.selectedItems.length).to.equal(2);
        expect(buttonGroup.selectedItems).to.have.same.members([
          buttons[0].value,
          buttons[1].value,
        ]);

        // deselect first button
        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        deselectArgs.detail = buttons[0].value;

        expect(eventSpy).calledWith('igcDeselect', deselectArgs);
        expect(buttonGroup.selectedItems.length).to.equal(1);
        expect(buttonGroup.selectedItems).to.have.same.members([
          buttons[1].value,
        ]);
      });
    });
  });

  const createButtonGroupComponent = (
    template = `
      <igc-button-group>
        <igc-toggle-button value="left">Left</igc-toggle-button>
        <igc-toggle-button value="center">Center</igc-toggle-button>
        <igc-toggle-button value="right">Right</igc-toggle-button>
      </igc-button-group>`
  ) => {
    return fixture<IgcButtonGroupComponent>(html`${unsafeStatic(template)}`);
  };
});
