import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'app-button',
  styleUrl: 'button.css',
  shadow: true,
})
export class ButtonSample {

  buttonTypes = ['flat', 'raised', 'outlined', 'icon', 'fab'];
  sizes = ['small', 'medium', 'large'];

  render() {
    return (
      <Host>
        <h3>Types</h3>
        <div class="row">
          {this.buttonTypes.map(type => (
            <igc-button type={type}>{type}</igc-button>
          ))}
        </div>
        <h3>Sizes</h3>
        <div class="row">
          {this.sizes.map(size => (
            <igc-button size={size}>{size}</igc-button>
          ))}
        </div>
        <h3>Colors</h3>
        <div class="row">
          <igc-button color="white" background="green">Button</igc-button>
        </div>
        <h3>Disabled</h3>
        <div class="row">
          <igc-button disabled>Disabled</igc-button>
        </div>
        <h3>Link Buttons</h3>
        <div class="row">
          <igc-button href="https://www.infragistics.com/">Link</igc-button>
          <igc-button disabled href="https://www.infragistics.com/" target="_blank">Link</igc-button>
        </div>
        <h3>Prefix/Suffix</h3>
        <div class="row">
          <igc-button>
            <span slot="prefix">P</span>
            Button
          </igc-button>
          <igc-button>
            Button
            <span slot="suffix">S</span>
          </igc-button>
          <igc-button>
            <span slot="prefix">P</span>
            Button
            <span slot="suffix">S</span>
          </igc-button>
        </div>
      </Host>
    );
  }
}
