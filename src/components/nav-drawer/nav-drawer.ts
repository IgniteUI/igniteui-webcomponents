import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './nav-drawer.material.css';

export interface IgcNavDrawerEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

export class IgcNavDrawerComponent extends EventEmitterMixin<
  IgcNavDrawerEventMap,
  Constructor<LitElement>
>(LitElement) {
  static styles = [styles];

  @property({ reflect: true })
  position: 'start' | 'end' | 'top' | 'bottom' = 'start';

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: Boolean, reflect: true })
  pinned = false;

  // @property({ type: Boolean, reflect: true })
  // mini = false;

  @property()
  pinThreshold!: number;

  protected get classes() {
    const { position } = this;

    return {
      start: position === 'start',
      end: position === 'end',
      top: position === 'top',
      bottom: position === 'bottom',
    };
  }

  show() {
    if (this.open) {
      return;
    }

    const args = { cancel: false };

    if (!this.handleOpening(args)) {
      return;
    }

    this.open = true;
    this.emitEvent('igcOpened');
  }

  hide() {
    if (!this.open) {
      return;
    }

    const args = { cancel: false };

    if (!this.handleClosing(args)) {
      return;
    }

    this.open = false;
    this.emitEvent('igcClosed');
  }

  toggle() {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  private handleOpening(args: { cancel: boolean }) {
    this.emitEvent('igcOpening');
    if (args.cancel) {
      this.open = false;
      return false;
    }

    return true;
  }

  private handleClosing(args: { cancel: boolean }) {
    this.emitEvent('igcClosing');
    if (args.cancel) {
      this.open = true;
      return false;
    }

    return true;
  }

  render() {
    return html` <div part="base" class=${classMap(this.classes)}>
      <div part="main">
        <slot></slot>
      </div>

      <div part="mini">
        <slot name="mini"></slot>
      </div>
    </div>`;
  }
}
