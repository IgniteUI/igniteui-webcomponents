import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { watch } from '../decorators/watch.js';
import type { Constructor } from './constructor.js';

export declare class SizableInterface {
  /**
   * Determines the size of the component.
   * @attr
   * @type {"small" | "medium" | "large"}
   *
   * @deprecated since v4.5.0. Use the `--ig-size` CSS custom property instead.
   */
  public size: 'small' | 'medium' | 'large';
}

export const SizableMixin = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class SizableElement extends superClass {
    /**
     * Determines the size of the component.
     * @attr
     * @type {"small" | "medium" | "large"}
     *
     * @deprecated since v4.5.0. Use the `--ig-size` CSS custom property instead.
     */
    @property({ reflect: true })
    public size: 'small' | 'medium' | 'large' = 'large';

    @watch('size')
    protected updateSize() {
      this.style.setProperty(
        '--component-size',
        `var(--ig-size, var(--ig-size-${this.size}))`
      );
    }
  }
  return SizableElement as Constructor<SizableInterface> & T;
};
