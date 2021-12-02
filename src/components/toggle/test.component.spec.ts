import { LitElement, html } from 'lit';
import { IgcToggleController } from './toggle.controller';
import { IToggleOptions } from './utilities';

export default class PopperTestComponent extends LitElement {
  public target!: HTMLElement;
  public options!: IToggleOptions;
  public open = false;
  public toggle = new IgcToggleController(this);
  public toggleDirective!: any;

  protected render() {
    this.toggleDirective = this.toggle.createToggle(
      this.target,
      this.open,
      this.options
    );
    return html` <div ${this.toggleDirective}>Toggle Content</div>`;
  }
}
