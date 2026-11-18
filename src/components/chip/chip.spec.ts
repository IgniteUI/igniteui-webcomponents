import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import { spy } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { runFocusBeforeRenderTests } from '#internals/testing/focus-before-render.spec.js';
import {
  allowMotion,
  finishAnimationsFor,
  isFocused,
  painted,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import { runHiddenAncestorTests } from '#internals/testing/hidden-ancestor.spec.js';
import { runHostAriaTests } from '#internals/testing/host-aria.spec.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import { configureTheme } from '#theming/config.js';
import { styles as indigo } from '../../styles/themes/light/indigo.css.js';
import IgcChipComponent from './chip.js';

const EASE_IN_OUT_QUAD = 'cubic-bezier(0.455, 0.03, 0.515, 0.955)';
/** The progress of `EASE_IN_OUT_QUAD` at half of the duration. */
const EASED_HALF = 0.515;
const COLOR_PROPERTIES = [
  'background-color',
  'border-color',
  'box-shadow',
  'color',
];

function cssTransitionsOf(element: Element): CSSTransition[] {
  return element
    .getAnimations()
    .filter((animation) => animation instanceof CSSTransition);
}

/** The transitions of `element`, as `property duration delay`, sorted. */
function transitionsOf(element: Element): string[] {
  return cssTransitionsOf(element)
    .map(({ transitionProperty, effect }) => {
      const { duration, delay } = effect!.getTiming();
      return `${transitionProperty} ${duration} ${delay}`;
    })
    .sort();
}

function easingsOf(element: Element): Set<string> {
  return new Set(
    cssTransitionsOf(element).map(({ effect }) => effect!.getTiming().easing!)
  );
}

function getBase(chip: IgcChipComponent): HTMLElement {
  return chip.renderRoot.querySelector('[part="base"]')!;
}

function getPrefix(chip: IgcChipComponent): HTMLElement {
  return chip.renderRoot.querySelector('[part="prefix"]')!;
}

function getIndicator(chip: IgcChipComponent): HTMLElement {
  return chip.renderRoot.querySelector('[data-indicator]')!;
}

function seekTransitions(element: Element, time: number): void {
  for (const animation of element.getAnimations()) {
    animation.pause();
    animation.currentTime = time;
  }
}

async function toggleByUser(chip: IgcChipComponent): Promise<void> {
  simulateClick(chip.renderRoot.querySelector('[part="action"]')!);
  await elementUpdated(chip);
}

const SLOTTED_SELECT = html`
  <igc-chip selectable selected>
    <span slot="select" style="display: inline-block; width: 40px"></span>
    Chip
  </igc-chip>
`;

/** Bootstrap and Material selected chips keep the colors of unselected ones. */
async function withIndigo(fn: () => unknown): Promise<void> {
  configureTheme('indigo');

  try {
    await withDocumentSheets([indigo.styleSheet!], fn);
  } finally {
    configureTheme('bootstrap');
  }
}

describe('Chip', () => {
  const DIFF_OPTIONS = {
    ignoreAttributes: ['style'],
  };

  before(() => {
    defineComponents(IgcChipComponent);
  });

  runHostAriaTests({
    tagName: 'igc-chip',
    template: html`<igc-chip>Chip</igc-chip>`,
    getTarget: (host) => host.renderRoot.querySelector('[part="action"]')!,
    visibleText: 'Chip',
  });

  it('passes the a11y audit', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip>Chip</igc-chip>`
    );

    await expect(chip).shadowDom.to.be.accessible();
    await expect(chip).to.be.accessible();
  });

  it('should initialize with default values', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should change variant correctly', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip variant="info"></igc-chip>`
    );

    expect(chip.variant).to.equal('info');

    chip.variant = 'primary';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(
      `<igc-chip variant="primary"></igc-chip>`,
      DIFF_OPTIONS
    );

    chip.variant = 'danger';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(
      `<igc-chip variant="danger"></igc-chip>`,
      DIFF_OPTIONS
    );

    chip.variant = 'success';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(
      `<igc-chip variant="success"></igc-chip>`,
      DIFF_OPTIONS
    );
  });

  it('should toggle the disabled property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.disabled = true;
    expect(chip.disabled).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip disabled></igc-chip>', DIFF_OPTIONS);

    chip.disabled = false;
    expect(chip.disabled).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should toggle the outlined property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.outlined = true;
    expect(chip.outlined).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip outlined></igc-chip>', DIFF_OPTIONS);

    chip.outlined = false;
    expect(chip.outlined).to.be.false;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should toggle the selectable property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.selectable = true;
    expect(chip.selectable).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip selectable></igc-chip>', DIFF_OPTIONS);

    chip.selectable = false;
    expect(chip.selectable).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should toggle the removable property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.removable = true;
    expect(chip.removable).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip removable></igc-chip>', DIFF_OPTIONS);

    chip.removable = false;
    expect(chip.removable).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should toggle selected property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.selected = true;
    expect(chip.selected).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip selected></igc-chip>', DIFF_OPTIONS);

    chip.selected = false;
    expect(chip.selected).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  describe('Accessibility', () => {
    it('passes the a11y audit in every interactive state', async () => {
      const states = [
        html`<igc-chip removable>Chip</igc-chip>`,
        html`<igc-chip selectable selected>Chip</igc-chip>`,
        html`<igc-chip selectable selected removable outlined>Chip</igc-chip>`,
        html`<igc-chip disabled selectable removable>Chip</igc-chip>`,
      ];

      for (const state of states) {
        const chip = await fixture<IgcChipComponent>(state);

        await expect(chip).shadowDom.to.be.accessible();
        await expect(chip).to.be.accessible();
      }
    });

    it('keeps the remove control out of the action control', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip removable>Chip</igc-chip>`
      );

      const action = chip.renderRoot.querySelector('[part="action"]')!;
      const remove = chip.renderRoot.querySelector('[part="remove"]')!;

      expect(action.contains(remove)).to.be.false;
      expect(action.querySelector('[tabindex]')).to.be.null;
    });

    it('does not leak the state icon into the accessible name', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable selected>Chip</igc-chip>`
      );

      const icon = chip.renderRoot.querySelector('igc-icon[name="selected"]')!;

      expect(icon.getAttribute('aria-hidden')).to.equal('true');
      expect(icon.hasAttribute('aria-label')).to.be.false;
    });

    it('exposes the selection state through aria-pressed', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable>Chip</igc-chip>`
      );
      const action = chip.renderRoot.querySelector('[part="action"]')!;

      expect(action.getAttribute('aria-pressed')).to.equal('false');

      chip.selected = true;
      await elementUpdated(chip);
      expect(action.getAttribute('aria-pressed')).to.equal('true');

      chip.selectable = false;
      await elementUpdated(chip);
      expect(action.hasAttribute('aria-pressed')).to.be.false;
    });

    it('forwards the host disclosure state to the action control', async () => {
      const container = await fixture<HTMLElement>(html`
        <div>
          <igc-chip selectable>Filters</igc-chip>
          <div id="filters">Filter panel</div>
        </div>
      `);
      const chip = container.querySelector<IgcChipComponent>('igc-chip')!;
      const panel = container.querySelector('#filters');
      const action = chip.renderRoot.querySelector('[part="action"]')!;

      chip.setAttribute('aria-expanded', 'true');
      chip.setAttribute('aria-haspopup', 'dialog');
      chip.setAttribute('aria-controls', 'filters');
      await elementUpdated(chip);
      expect(action.getAttribute('aria-expanded')).to.equal('true');
      expect(action.getAttribute('aria-haspopup')).to.equal('dialog');
      expect(action.ariaControlsElements).to.eql([panel]);
      expect(action.getAttribute('aria-pressed')).to.equal('false');
      await expect(chip).to.be.accessible();

      chip.ariaExpanded = 'false';
      await elementUpdated(chip);
      expect(action.getAttribute('aria-expanded')).to.equal('false');

      chip.removeAttribute('aria-expanded');
      chip.removeAttribute('aria-haspopup');
      chip.removeAttribute('aria-controls');
      await elementUpdated(chip);
      expect(action.hasAttribute('aria-expanded')).to.be.false;
      expect(action.hasAttribute('aria-haspopup')).to.be.false;
      expect(action.hasAttribute('aria-controls')).to.be.false;
    });

    it('does not forward an empty disclosure state or an `aria-controls` without a target', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip>Chip</igc-chip>`
      );
      const action = chip.renderRoot.querySelector('[part="action"]')!;

      chip.setAttribute('aria-expanded', '');
      chip.setAttribute('aria-haspopup', '');
      chip.setAttribute('aria-controls', 'missing');
      await elementUpdated(chip);
      expect(action.hasAttribute('aria-expanded')).to.be.false;
      expect(action.hasAttribute('aria-haspopup')).to.be.false;
      expect(action.hasAttribute('aria-controls')).to.be.false;
    });
  });

  describe('Rendering', () => {
    it('keeps the prefix hidden when selected but not selectable', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selected>Chip</igc-chip>`
      );
      const prefix = chip.renderRoot.querySelector('[part="prefix"]')!;

      expect(prefix.hasAttribute('hidden')).to.be.true;

      chip.selectable = true;
      await elementUpdated(chip);
      expect(prefix.hasAttribute('hidden')).to.be.false;
    });

    it('keeps the suffix hidden when only the remove control is rendered', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip removable>Chip</igc-chip>`
      );

      expect(
        chip.renderRoot.querySelector('[part="suffix"]')!.hasAttribute('hidden')
      ).to.be.true;
      expect(chip.renderRoot.querySelector('[part="remove"]')).to.not.be.null;
    });

    it('does not render the remove control for a disabled chip', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip disabled removable>Chip</igc-chip>`
      );

      expect(chip.renderRoot.querySelector('[part="remove"]')).to.be.null;
    });

    it('renders the start and end slots outside the prefix and suffix slots', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip>Chip</igc-chip>`
      );
      const slots = Array.from(
        chip.renderRoot.querySelectorAll<HTMLSlotElement>(
          '[part="action"] slot'
        ),
        ({ name }) => name
      );

      expect(slots).to.eql(['start', 'prefix', '', 'suffix', 'end']);
    });

    it('hides the prefix of a selectable chip that is not selected', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable>Chip</igc-chip>`
      );

      expect(getPrefix(chip).hasAttribute('hidden')).to.be.true;
      expect(getIndicator(chip)).to.be.null;
    });

    it('removes the selection indicator when the chip is no longer selectable', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable selected>Chip</igc-chip>`
      );

      expect(getIndicator(chip)).to.not.be.null;

      chip.selectable = false;
      await elementUpdated(chip);

      expect(getIndicator(chip)).to.be.null;
      expect(getPrefix(chip).hasAttribute('hidden')).to.be.true;
    });

    it('keeps the selection indicator at its width in a narrow chip', async () => {
      const chip = await fixture<IgcChipComponent>(html`
        <igc-chip selectable selected style="width: 90px">
          A label that is too long for the chip
        </igc-chip>
      `);
      const indicator = getIndicator(chip);
      const icon = indicator.querySelector('igc-icon')!;

      expect(indicator.getBoundingClientRect().width).to.equal(
        icon.getBoundingClientRect().width
      );
    });

    it('changes the selection of the user at once with reduced motion', async () => {
      await withIndigo(async () => {
        const chip = await fixture<IgcChipComponent>(
          html`<igc-chip selectable>Chip</igc-chip>`
        );
        await painted();

        await toggleByUser(chip);

        expect(transitionsOf(getBase(chip))).to.eql([]);
        expect(transitionsOf(getIndicator(chip))).to.eql([]);
        expect(getIndicator(chip).getBoundingClientRect().width).to.be.above(0);

        await toggleByUser(chip);
        await painted();

        expect(transitionsOf(getBase(chip))).to.eql([]);
        expect(getIndicator(chip)).to.be.null;
      });
    });
  });

  describe('Selection animation', () => {
    allowMotion();

    it('does not animate a chip that renders selected', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable selected>Chip</igc-chip>`
      );
      await painted();

      expect(transitionsOf(getBase(chip))).to.eql([]);
      expect(transitionsOf(getIndicator(chip))).to.eql([]);
    });

    it('applies a change from code at once', async () => {
      await withIndigo(async () => {
        const chip = await fixture<IgcChipComponent>(
          html`<igc-chip selectable>Chip</igc-chip>`
        );
        const base = getBase(chip);
        await painted();

        for (const change of [
          () => (chip.selected = true),
          () => (chip.variant = 'primary'),
          () => (chip.outlined = true),
          () => (chip.disabled = true),
        ]) {
          change();
          await elementUpdated(chip);

          expect(base.hasAttribute('data-instant')).to.be.true;
          expect(transitionsOf(base)).to.eql([]);
          expect(transitionsOf(getIndicator(chip))).to.eql([]);
          await painted();
        }

        chip.selected = false;
        await elementUpdated(chip);

        expect(getIndicator(chip)).to.be.null;
      });
    });

    it('shows and removes the indicator at once when selectable changes', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable selected>Chip</igc-chip>`
      );
      chip.focus();
      await elementUpdated(chip);
      await painted();

      chip.selectable = false;
      await elementUpdated(chip);

      expect(getIndicator(chip)).to.be.null;
      expect(transitionsOf(getBase(chip))).to.eql([]);

      chip.focus();
      await elementUpdated(chip);
      await painted();

      chip.selectable = true;
      await elementUpdated(chip);

      expect(transitionsOf(getIndicator(chip))).to.eql([]);
    });

    it('animates again after the user interacts with the chip', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable>Chip</igc-chip>`
      );
      const base = getBase(chip);

      for (const interact of [
        () => chip.focus(),
        () => {
          const { left, top } = chip.getBoundingClientRect();
          return sendMouse({ type: 'move', position: [left + 2, top + 2] });
        },
      ]) {
        chip.selected = !chip.selected;
        await elementUpdated(chip);
        expect(base.hasAttribute('data-instant')).to.be.true;

        await interact();
        await elementUpdated(chip);
        expect(base.hasAttribute('data-instant')).to.be.false;

        chip.blur();
        await resetMouse();
      }
    });

    it('animates the colors of the chip on a selection by the user', async () => {
      await withIndigo(async () => {
        const chip = await fixture<IgcChipComponent>(
          html`<igc-chip selectable>Chip</igc-chip>`
        );
        const base = getBase(chip);
        await painted();

        for (let i = 0; i < 2; i++) {
          await toggleByUser(chip);

          const transitions = transitionsOf(base);
          expect(transitions, `toggle ${i}`).to.include(
            'background-color 200 0'
          );
          for (const transition of transitions) {
            const [property, duration, delay] = transition.split(' ');
            expect(COLOR_PROPERTIES).to.include(property);
            expect([duration, delay]).to.eql(['200', '0']);
          }
          expect(easingsOf(base)).to.eql(new Set([EASE_IN_OUT_QUAD]));

          finishAnimationsFor(chip.shadowRoot!);
          await painted();
        }
      });
    });

    it('opens the selection indicator to the width of its content, then fades it in', async () => {
      for (const template of [
        html`<igc-chip selectable selected>Chip</igc-chip>`,
        SLOTTED_SELECT,
      ]) {
        const chip = await fixture<IgcChipComponent>(template);
        chip.selected = false;
        await elementUpdated(chip);
        await painted();

        await toggleByUser(chip);

        const indicator = getIndicator(chip);
        const content =
          chip.querySelector('[slot="select"]') ??
          indicator.querySelector('igc-icon')!;
        expect(transitionsOf(indicator)).to.eql([
          'grid-template-columns 120 0',
          'opacity 120 60',
        ]);
        expect(easingsOf(indicator)).to.eql(new Set([EASE_IN_OUT_QUAD]));

        // Half of the column duration.
        seekTransitions(indicator, 60);
        const width = content.getBoundingClientRect().width;
        expect(indicator.getBoundingClientRect().width).to.be.closeTo(
          width * EASED_HALF,
          0.5
        );

        finishAnimationsFor(indicator);
        expect(indicator.getBoundingClientRect().width).to.equal(width);
      }
    });

    it('fades the selection indicator out, closes it, then removes it', async () => {
      for (const template of [
        html`<igc-chip selectable selected>Chip</igc-chip>`,
        SLOTTED_SELECT,
      ]) {
        const chip = await fixture<IgcChipComponent>(template);
        const indicator = getIndicator(chip);
        await painted();

        await toggleByUser(chip);

        expect(getIndicator(chip)).to.equal(indicator);
        expect(indicator.hasAttribute('data-leaving')).to.be.true;
        expect(transitionsOf(indicator)).to.eql([
          'grid-template-columns 120 60',
          'opacity 120 0',
        ]);

        finishAnimationsFor(indicator);
        await painted();

        expect(getIndicator(chip)).to.be.null;
        expect(getPrefix(chip).hasAttribute('hidden')).to.be.true;
      }
    });

    it('opens and closes the gap to the next content together with the selection indicator', async () => {
      for (const template of [
        html`<igc-chip selectable><span slot="prefix">P</span>Chip</igc-chip>`,
        html`<igc-chip selectable><span slot="start">S</span>Chip</igc-chip>`,
      ]) {
        const chip = await fixture<IgcChipComponent>(template);
        await elementUpdated(chip);
        await painted();

        const prefix = chip.querySelector('[slot]')!;
        const start = prefix.getBoundingClientRect().left;
        const offset = () => prefix.getBoundingClientRect().left - start;
        const gap = Number.parseFloat(
          getComputedStyle(getPrefix(chip)).columnGap
        );

        await toggleByUser(chip);

        const indicator = getIndicator(chip);
        const icon = indicator.querySelector('igc-icon')!;
        const open = icon.getBoundingClientRect().width + gap;

        // Half of the column duration.
        seekTransitions(indicator, 60);
        expect(offset()).to.be.closeTo(open * EASED_HALF, 0.5);

        finishAnimationsFor(indicator);
        expect(offset()).to.be.closeTo(open, 0.5);

        await toggleByUser(chip);

        // Half of the column duration, after its delay.
        seekTransitions(indicator, 120);
        expect(offset()).to.be.closeTo(open * (1 - EASED_HALF), 0.5);

        finishAnimationsFor(indicator);
        await painted();
        expect(offset()).to.equal(0);
      }
    });

    it('reverses the exit when the chip is selected again', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable selected>Chip</igc-chip>`
      );
      const indicator = getIndicator(chip);
      const width = indicator.getBoundingClientRect().width;

      await toggleByUser(chip);

      // Half of the column duration, after its delay.
      seekTransitions(indicator, 120);
      const leaving = indicator.getBoundingClientRect().width;
      expect(leaving).to.be.closeTo(width * (1 - EASED_HALF), 0.5);

      await toggleByUser(chip);

      expect(
        chip.renderRoot.querySelectorAll('[data-indicator]')
      ).to.have.length(1);
      expect(getIndicator(chip)).to.equal(indicator);
      expect(indicator.hasAttribute('data-leaving')).to.be.false;

      seekTransitions(indicator, 0);
      expect(indicator.getBoundingClientRect().width).to.be.closeTo(
        leaving,
        0.5
      );

      finishAnimationsFor(indicator);
      await painted();
      expect(getIndicator(chip)).to.equal(indicator);
      expect(indicator.getBoundingClientRect().width).to.equal(width);
    });
  });

  describe('Events', () => {
    it('emits igcRemove when the remove control is activated', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip removable>Chip</igc-chip>`
      );
      const eventSpy = spy();
      chip.addEventListener('igcRemove', eventSpy);

      (
        chip.renderRoot.querySelector('igc-icon[name="remove"]') as HTMLElement
      ).click();

      expect(eventSpy).calledOnce;
    });

    it('does not emit igcSelect when the remove control is activated', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable removable>Chip</igc-chip>`
      );
      const removeSpy = spy();
      const selectSpy = spy();
      chip.addEventListener('igcRemove', removeSpy);
      chip.addEventListener('igcSelect', selectSpy);

      const icon = chip.renderRoot.querySelector(
        'igc-icon[name="remove"]'
      ) as HTMLElement;

      icon.click();
      icon.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: 'Enter',
          bubbles: true,
          composed: true,
        })
      );
      await elementUpdated(chip);

      expect(removeSpy.callCount).to.equal(2);
      expect(selectSpy).to.not.be.called;
      expect(chip.selected).to.be.false;
    });

    it('does not intercept the activation keys of a non-removable chip', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable>Chip</igc-chip>`
      );
      const eventSpy = spy();
      chip.addEventListener('igcRemove', eventSpy);

      const action = chip.renderRoot.querySelector('[part="action"]')!;

      // Unscoped remove keybindings fall back to the host and cancel the
      // default action of the chip keys, such as `Space` selection.
      for (const key of ['Enter', ' ']) {
        const event = new KeyboardEvent('keyup', {
          key,
          bubbles: true,
          composed: true,
          cancelable: true,
        });
        action.dispatchEvent(event);

        expect(event.defaultPrevented).to.be.false;
      }

      expect(eventSpy).to.not.be.called;
    });

    it('emits igcSelect from the action control', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable>Chip</igc-chip>`
      );
      const eventSpy = spy();
      chip.addEventListener('igcSelect', eventSpy);

      (chip.renderRoot.querySelector('[part="action"]') as HTMLElement).click();
      await elementUpdated(chip);

      expect(chip.selected).to.be.true;
      expect(eventSpy).calledOnce;
      expect(eventSpy.firstCall.args[0].detail).to.be.true;
    });
  });

  describe('Focus', () => {
    it('moves the focus to the action control on focus()', async () => {
      for (const template of [
        html`<igc-chip>Chip</igc-chip>`,
        html`<igc-chip removable>Chip</igc-chip>`,
      ]) {
        const chip = await fixture<IgcChipComponent>(template);
        const action = chip.renderRoot.querySelector('[part="action"]')!;

        chip.focus();

        expect(isFocused(chip)).to.be.true;
        expect(isFocused(action)).to.be.true;
      }
    });

    it('removes the focus on blur()', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip>Chip</igc-chip>`
      );

      chip.focus();
      chip.blur();

      expect(isFocused(chip)).to.be.false;
    });

    it('does not take the focus while disabled', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip disabled removable>Chip</igc-chip>`
      );

      chip.focus();

      expect(isFocused(chip)).to.be.false;
    });
  });

  runFocusBeforeRenderTests(html`<igc-chip>Label</igc-chip>`);

  runHiddenAncestorTests(html`
    <igc-chip selectable selected removable outlined>Chip</igc-chip>
  `);
});
