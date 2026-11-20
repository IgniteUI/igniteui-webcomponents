import { expect, fixture } from '@open-wc/testing';
import { emulateMedia, resetMouse } from '@web/test-runner-commands';
import type { LitElement, TemplateResult } from 'lit';
import { getCSSTransitions } from '#animations/css-transitions.js';
import { configureTheme } from '#theming/config.js';
import type { Theme } from '#theming/types.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import { styles as fluent } from '../../styles/themes/light/fluent.css.js';
import { styles as indigo } from '../../styles/themes/light/indigo.css.js';
import { styles as material } from '../../styles/themes/light/material.css.js';
import {
  allowMotion,
  painted,
  shadowRootsIn,
  withDocumentSheets,
} from './helpers.spec.js';

/** The test page has no palette, so no color changes without one. */
const PALETTES = { bootstrap, fluent, indigo, material };

/** The running CSS transitions in `container` and its shadow roots, as `element property`. */
export function transitionsIn(container: Element): string[] {
  return [container, ...shadowRootsIn(container)]
    .flatMap((root) => getCSSTransitions(root, { subtree: true }))
    .map(({ effect, transitionProperty }) => {
      const { target, pseudoElement } = effect as KeyframeEffect;
      const part = target?.getAttribute('part');
      return `${target?.localName}${part ? `[part="${part}"]` : ''}${pseudoElement ?? ''} ${transitionProperty}`;
    });
}

/** Runs `fn` in `theme`, with its palette, then goes back to the default theme. */
export async function withTheme<R>(
  theme: Theme,
  fn: () => R | Promise<R>
): Promise<R> {
  let result!: R;
  configureTheme(theme);

  try {
    await withDocumentSheets([PALETTES[theme].styleSheet!], async () => {
      result = await fn();
    });
  } finally {
    configureTheme('bootstrap');
  }

  return result;
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
  /** A theme in which the change has transitions. Material by default. */
  theme?: Theme;
}

/**
 * Checks the motion rule of a control with value state: only a change by the
 * user animates; a change from code and the first render show at once; reduced
 * motion turns the transitions off.
 */
export function runValueStateMotionTests<T extends LitElement>(
  config: ValueStateMotionConfig<T>
): void {
  const theme = config.theme ?? 'material';

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
    withTheme(theme, async () => {
      const { container, control } = await render(config.template);
      await change(control);
      await painted();
      return transitionsIn(container);
    });

  describe('Value state motion', () => {
    allowMotion();
    afterEach(() => resetMouse());

    it('animates a change by the user', async () => {
      expect(await transitionsAfter(config.changeByUser)).to.not.be.empty;
    });

    it('shows a change from code at once', async () => {
      expect(await transitionsAfter(config.changeFromCode)).to.eql([]);
    });

    it('shows the first render at once', async () => {
      await withTheme(theme, async () => {
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
