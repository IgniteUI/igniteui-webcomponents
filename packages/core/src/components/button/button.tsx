import { Component, Prop, h, Host } from '@stencil/core';

@Component({
  tag: 'igc-button',
  styleUrl: 'button.css',
  shadow: true,
})
export class IgcButtonComponent {
  @Prop() disabled: boolean;

  render() {
    return (
      <Host>
        <button>
          <slot/>
        </button>
      </Host>
    );
  }
}
