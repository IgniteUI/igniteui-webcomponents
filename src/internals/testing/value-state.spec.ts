import { expect, fixture, nextFrame } from '@open-wc/testing';
import { emulateMedia, resetMouse } from '@web/test-runner-commands';
import type { LitElement, TemplateResult } from 'lit';
import { allowMotion, elementsIn, painted } from './helpers.spec.js';
import { transitionsIn, withTheme } from './motion.spec.js';

/** The mark ends in the first frame with no change from code. */
const MAX_INSTANT_FRAMES = 10;

function hasInstantMark(element: Element): boolean {
  return (
    element.hasAttribute('data-instant') ||
    element.matches(':state(ig-instant)')
  );
}

/**
 * Waits until no element in `container` has the instant mark of
 * `#animations/value-state.js`, which turns its transitions off. Fails when
 * the mark stays on.
 */
export async function instantMarksEnded(container: Element): Promise<void> {
  for (
    let frame = 0;
    [container, ...elementsIn(container)].some(hasInstantMark);
    frame++
  ) {
    expect(frame, 'frames with an instant mark').to.be.below(
      MAX_INSTANT_FRAMES
    );
    await nextFrame();
  }
}

export interface ValueStateMotionConfig<T extends LitElement> {
  /** The control before the change. */
  template: TemplateResult;
  /** The control after the change, for its first render. */
  changedTemplate: TemplateResult;
  /** Returns the control from the fixture when the template wraps it. */
  control?: (fixture: HTMLElement) => T;
  /** Changes the value state from code. */
  changeFromCode: (control: T) => unknown;
  /**
   * Changes the value state as the user does. For a control whose value state
   * only code changes, another user interaction that animates it, such as a hover.
   */
  changeByUser: (control: T) => unknown;
  /**
   * Transitions, as `transitionsIn` names them, that the change by the user
   * must start. Name ones that only the value state starts, so a focus or a
   * hover transition does not pass the test.
   */
  userTransitions?: string[];
}

/**
 * Checks the motion rule of a control with value state in the Material theme:
 * only a change by the user animates; a change from code and the first render
 * show at once; reduced motion turns the transitions off.
 */
export function runValueStateMotionTests<T extends LitElement>(
  config: ValueStateMotionConfig<T>
): void {
  async function render(template: TemplateResult): Promise<{
    container: HTMLElement;
    control: T;
  }> {
    const container = await fixture<HTMLElement>(template);
    const control = config.control?.(container) ?? (container as T);
    await painted();
    return { container, control };
  }

  const transitionsAfter = (change: (control: T) => unknown) =>
    withTheme('material', async () => {
      const { container, control } = await render(config.template);
      await change(control);
      await painted();
      return transitionsIn(container);
    });

  describe('Value state motion', () => {
    allowMotion();
    afterEach(() => resetMouse());

    it('animates a change by the user', async () => {
      const transitions = await transitionsAfter(config.changeByUser);

      expect(transitions).to.not.be.empty;
      expect(transitions).to.include.members(config.userTransitions ?? []);
    });

    it('shows a change from code at once', async () => {
      expect(await transitionsAfter(config.changeFromCode)).to.eql([]);
    });

    it('shows the first render at once', async () => {
      await withTheme('material', async () => {
        const { container } = await render(config.changedTemplate);
        expect(transitionsIn(container)).to.eql([]);
      });
    });

    it('turns the transitions off with reduced motion', async () => {
      await emulateMedia({ reducedMotion: 'reduce' });
      expect(await transitionsAfter(config.changeByUser)).to.eql([]);
    });
  });
}
