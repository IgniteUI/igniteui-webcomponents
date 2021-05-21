import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-button',
  styleUrl: 'button.css',
  shadow: true,
})
export class ButtonSample {

  render() {
    return (
      <igc-button>Button</igc-button>
    );
  }
}
