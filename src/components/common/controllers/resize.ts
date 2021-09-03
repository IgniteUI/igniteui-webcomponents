import {
  ElementPart,
  html,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import { Directive, directive, DirectiveParameters } from 'lit/directive.js';

class ResizeDirective extends Directive {
  ro!: ResizeObserver;
  width = 0;
  height = 0;

  update(part: ElementPart, [host]: DirectiveParameters<this>) {
    const el = part.element as Element;
    const controller = host as ResizeController;
    this.ro = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        entries.forEach((entry) => {
          const { width, height } = entry.contentRect;
          if (this.width !== width) {
            this.width = width;
            this.height = height;
            controller.dimensions = entry.contentRect;
            controller.host.requestUpdate();
          }
        });
      });
    });
    this.ro.observe(el);
    return this.render(host);
  }

  render(host: ReactiveController) {
    return html`${host}`;
  }
}

const resizeDirective = directive(ResizeDirective);

export class ResizeController implements ReactiveController {
  host: ReactiveControllerHost;
  width = 0;
  height = 0;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {}

  get dimensions() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  set dimensions({ width, height }) {
    this.width = width;
    this.height = height;
  }

  observe() {
    return resizeDirective(this);
  }
}
