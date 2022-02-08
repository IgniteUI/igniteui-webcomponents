import { html } from 'lit';
import { partNameMap } from '../common/util';
import { styles } from './linear.progress.material.css';
import { IgcProgressBaseComponent, toPercent } from './common/progress-base';
import { property, query } from 'lit/decorators.js';

let NEXT_LINEAR_ID = 0;

export default class IgcLinearProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-linear-bar';
  public static styles = styles;

  public override id = `igx-linear-bar-${NEXT_LINEAR_ID++}`;

  @query('#indicator')
  private _progressIndicator!: HTMLElement;

  @property({ type: Boolean })
  public striped = false;

  @property({ reflect: true, attribute: true })
  public role = 'progressbar';

  @property({ reflect: true, attribute: true })
  public textAlign: 'start' | 'center' | 'end' = 'start';

  @property({ type: Boolean })
  public textTop = false;

  @property({ reflect: true, attribute: true })
  public text!: string;

  @property({ reflect: true, attribute: true })
  public type: 'error' | 'info' | 'warning' | 'success' | 'default' = 'default';

  private animationState = {
    width: '0%',
  };

  private get error() {
    return this.type === 'error';
  }

  private get info() {
    return this.type === 'info';
  }

  private get warning() {
    return this.type === 'warning';
  }

  private get success() {
    return this.type === 'success';
  }

  private get wrapperParts() {
    return {
      stripped: this.striped,
      indeterminate: this.indeterminate,
      success: this.success,
      danger: this.error,
      warning: this.warning,
      info: this.info,
    };
  }

  private get spanParts() {
    return {
      start: this.textAlign === 'start',
      center: this.textAlign === 'center',
      end: this.textAlign === 'end',
      top: this.textTop,
      hidden: !this.textVisibility,
    };
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this._animate = true;
    this.setAttribute('aria-valuemin', '0');
  }

  public override runAnimation(value: number) {
    if (this._animation && this._animation.playState !== 'finished') {
      return;
    }

    const valueInPercent = this.max <= 0 ? 0 : toPercent(value, this.max);

    const FRAMES = [];
    FRAMES[0] = {
      ...this.animationState,
    };

    this.animationState.width = valueInPercent + '%';
    FRAMES[1] = {
      ...this.animationState,
    };

    this._animation = this._progressIndicator.animate(FRAMES, {
      easing: 'ease-out',
      fill: 'forwards',
      duration: this.animationDuration,
    });
  }

  protected override render() {
    return html`
      <div part="wrapper">
        <div part="base">
          <div
            id="indicator"
            part="indicator ${partNameMap(this.wrapperParts)}"
            style="width: 0"
          ></div>
        </div>
        ${this.textVisibility
          ? html`
              <span part="value ${partNameMap(this.spanParts)}">
                ${this.text ? this.text : this.valueInPercent + '%'}
              </span>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-linear-bar': IgcLinearProgressComponent;
  }
}
