import { LitElement, ReactiveController, ReactiveControllerHost } from 'lit';

type Direction = 'ltr' | 'rtl' | 'auto';

export class DirectionController implements ReactiveController {
  value!: Direction;
  private host: ReactiveControllerHost;
  private el: LitElement;
  private mo!: MutationObserver;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
    this.el = this.host as LitElement;
  }

  hostConnected() {
    this.mo = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        this.host.requestUpdate();
      });
    });

    this.mo.observe(this.el, {
      attributes: true,
      attributeFilter: ['dir'],
    });
  }

  hostUpdate() {
    const styles = window.getComputedStyle(this.el);
    this.value = styles.getPropertyValue('direction') as Direction;
  }
}
