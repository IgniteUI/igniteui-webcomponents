import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import {
  defineComponents,
  IgcButtonGroupComponent,
  IgcToggleButtonComponent,
} from '../../index.js';
import sinon from 'sinon';

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
        expect(buttonGroup.id).to.contain('igc-button-group-');
        expect(buttonGroup.multiple).to.be.false;
        expect(buttonGroup.disabled).to.be.false;
        expect(buttonGroup.alignment).to.equal('horizontal');
        expect(buttonGroup.selection).to.be.empty;
        expect(buttonGroup.dir).to.be.empty;
      });

      it('should render proper role and attributes', () => {
        const buttonGroupElement = buttonGroup.shadowRoot?.querySelector('div');

        expect(buttonGroupElement).not.to.be.null;
        expect(buttonGroupElement).to.have.attribute('role', 'group');
        expect(buttonGroupElement).to.have.attribute('aria-disabled', 'false');
      });
    });

    describe('Properties` Tests', () => {
      it('sets `multiple` property successfully', async () => {
        buttonGroup.multiple = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.multiple).to.be.true;
        expect(buttonGroup).dom.to.equal(
          `<igc-button-group multiple></igc-button-group>`,
          DIFF_OPTIONS
        );

        buttonGroup.multiple = false;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.multiple).to.be.false;
        expect(buttonGroup).dom.to.equal(
          `<igc-button-group></igc-button-group>`,
          DIFF_OPTIONS
        );
      });

      it('sets `disabled` property successfully', async () => {
        buttonGroup.disabled = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.disabled).to.be.true;
        expect(buttonGroup).dom.to.equal(
          `<igc-button-group disabled></igc-button-group>`,
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
          `<igc-button-group></igc-button-group>`,
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
        // single selection
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection='["left"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['left']);

        // multiple selection
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group multiple selection='["left", "right"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selection.length).to.equal(2);
        expect(buttonGroup.selection).to.have.same.members(['left', 'right']);
      });

      it('should initialize a button group with initial selection state through child attribute', async () => {
        // single selection
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group>
            <igc-toggle-button value="left" selected>Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['left']);

        // multiple selection
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group multiple>
            <igc-toggle-button value="left" selected>Left</igc-toggle-button>
            <igc-toggle-button value="center" selected>Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selection.length).to.equal(2);
        expect(buttonGroup.selection).to.have.same.members(['left', 'center']);
      });

      it('should be able to update selection state through selection property', async () => {
        // single selection
        expect(buttonGroup.selection.length).to.equal(0);

        buttonGroup.selection = ['left'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['left']);

        // multiple selection
        buttonGroup.multiple = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(0);

        buttonGroup.selection = ['left', 'right'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(2);
        expect(buttonGroup.selection).to.have.same.members(['left', 'right']);
      });

      it('should be able to update selection state through the selected property of its children', async () => {
        // single selection
        expect(buttonGroup.selection.length).to.equal(0);

        buttons[0].selected = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['left']);

        // multiple selection
        buttonGroup.multiple = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(0);

        buttons[0].selected = true;
        buttons[1].selected = true;

        expect(buttonGroup.selection.length).to.equal(2);
        expect(buttonGroup.selection).to.have.same.members(['left', 'center']);
      });

      it('should set the selection to be the last selected button if multiple buttons are selected (single)', async () => {
        // through selection attribute
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection='["right", "left"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['left']);

        // through child selected attribute
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group>
            <igc-toggle-button value="left" selected>Left</igc-toggle-button>
            <igc-toggle-button value="center" selected>Center</igc-toggle-button>
            <igc-toggle-button value="right">Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['center']);

        // through selection property
        buttonGroup = await createButtonGroupComponent();
        buttonGroup.selection = ['right', 'left'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['left']);
      });

      it('should clear the selection when changing the selection mode', async () => {
        expect(buttonGroup.multiple).to.be.false;
        expect(buttonGroup.selection.length).to.equal(0);

        buttonGroup.selection = ['left'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(1);

        buttonGroup.multiple = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.multiple).to.be.true;
        expect(buttonGroup.selection.length).to.equal(0);

        buttonGroup.selection = ['left', 'right'];
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(2);

        buttonGroup.multiple = false;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.multiple).to.be.false;
        expect(buttonGroup.selection.length).to.equal(0);
      });

      it('initial selection through child selection attribute has higher priority', async () => {
        // single selection
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group selection='["left"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right" selected>Right</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['right']);

        // multiple selection
        buttonGroup = await createButtonGroupComponent(`
          <igc-button-group multiple selection='["left", "center"]'>
            <igc-toggle-button value="left">Left</igc-toggle-button>
            <igc-toggle-button value="center">Center</igc-toggle-button>
            <igc-toggle-button value="right" selected>Right</igc-toggle-button>
            <igc-toggle-button value="top" selected>Top</igc-toggle-button>
          </igc-button-group>`);

        expect(buttonGroup.selection.length).to.equal(2);
        expect(buttonGroup.selection).to.have.same.members(['right', 'top']);
      });
    });

    describe('UI Tests', () => {
      it('should be able to select only a single button through UI when selection is single', async () => {
        expect(buttonGroup.multiple).to.be.false;
        expect(buttonGroup.selection.length).to.equal(0);

        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['left']);

        buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['center']);
      });

      it('should be able to select multiple buttons through UI when selection is multiple', async () => {
        buttonGroup.multiple = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.multiple).to.be.true;
        expect(buttonGroup.selection.length).to.equal(0);

        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(1);
        expect(buttonGroup.selection).to.have.same.members(['left']);

        buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(buttonGroup.selection.length).to.equal(2);
        expect(buttonGroup.selection).to.have.same.members(['left', 'center']);
      });

      it('should not be able to interact through UI when the group is disabled', async () => {
        buttonGroup.disabled = true;
        await elementUpdated(buttonGroup);

        expect(buttonGroup.disabled).to.be.true;

        const buttonGroupElement = buttonGroup.shadowRoot?.querySelector('div');
        expect(buttonGroupElement).to.have.attribute('aria-disabled', 'true');

        const style = getComputedStyle(buttonGroup);
        expect(style.pointerEvents).to.equal('none');
      });

      it('should emit `igcSelect` event on user interaction', async () => {
        const eventSpy = sinon.spy(buttonGroup, 'emitEvent');

        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        const args = {
          cancelable: true,
          detail: {
            button: buttons[0],
            value: buttons[0].value,
          },
        };

        expect(eventSpy).calledWith('igcSelect', args);
      });

      it('can cancel `igcSelect` event', async () => {
        const eventSpy = sinon.spy(buttonGroup, 'emitEvent');

        buttonGroup.addEventListener('igcSelect', (event) => {
          event.preventDefault();
        });

        buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await elementUpdated(buttonGroup);

        expect(eventSpy).calledWith('igcSelect');
        expect(buttonGroup.selection.length).to.equal(0);
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
