import { Component, Prop, h, Host } from '@stencil/core';

@Component({
  tag: 'igc-button',
  styleUrl: 'button.css',
  shadow: true,
})
export class IgcButtonComponent {
  @Prop({ reflect: true }) type: 'flat' | 'raised' | 'outlined' | 'icon' | 'fab' = 'flat';

  @Prop({ reflect: true }) disabled: boolean;

  @Prop({ reflect: true }) background: string;

  @Prop({ reflect: true }) color: string;

  @Prop({ reflect: true }) size: 'small' | 'medium' | 'large' = 'large';

  @Prop() href: string;

  @Prop() download: string;

  @Prop() rel: string;

  @Prop() target: '_blank' | '_parent' | '_self' | '_top';

  @Prop() buttonType: 'button' | 'reset' | 'submit' = 'button';

  render() {
    const TagType = this.href ? 'a' : 'button';
    const attributes = TagType === 'button' ?
      {
        type: this.buttonType
      } :
      {
        href: this.href,
        download: this.download,
        target: this.target,
        rel: this.rel
      };
    const classes = {
      'igc-button': true,
      'igc-button--flat': this.type === 'flat',
      'igc-button--outlined': this.type === 'outlined',
      'igc-button--raised': this.type === 'raised',
      'igc-button--icon': this.type === 'icon',
      'igc-button--fab': this.type === 'fab',
      'igc-button--disabled': this.disabled,
      'igc-button--small': this.size === 'small',
      'igc-button--medium': this.size === 'medium',
      'igc-button--large': this.size === 'large',
    }

    return (
      <Host>
        <TagType
          {...attributes}
          part="native"
          disabled={this.disabled}
          style={{
            background: this.background,
            color: this.color
          }}
          class={classes}
        >
          <slot name="prefix"/>
          <slot/>
          <slot name="suffix"/>
        </TagType>
      </Host>
    );
  }
}
