import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  shadow: true,
})
export class AppHome {
  render() {
    return (
      <div class="app-home">
        <stencil-route-link url="/button">
          <a>Button</a>
        </stencil-route-link>
      </div>
    );
  }
}
