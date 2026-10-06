import type { ArgTypes, Meta } from '@storybook/web-components-vite';
import { html, render } from 'lit';
import { ref } from 'lit/directives/ref.js';

import { IgcDialogComponent, defineComponents } from 'igniteui-webcomponents';
defineComponents(IgcDialogComponent);

export function disableStoryControls<T>(meta: Meta<T>): Partial<ArgTypes<T>> {
  return Object.fromEntries(
    Object.entries(structuredClone(meta.argTypes!)).map(([key, args]) => [
      key,
      Object.assign(args as object, { table: { disable: true } }),
    ])
  ) as unknown as Partial<ArgTypes<T>>;
}

function showDialog(data: FormData) {
  const dialog = document.createElement('igc-dialog');
  dialog.title = 'Form submission result';
  dialog.addEventListener('igcClosed', () => dialog.remove());

  const dump = document.createElement('pre');
  dump.textContent = JSON.stringify(Object.fromEntries(data), undefined, '\t');

  dialog.appendChild(dump);
  document.body.appendChild(dialog);

  dialog.show();
}

export function formSubmitHandler(event: SubmitEvent) {
  event.preventDefault();
  showDialog(new FormData(event.currentTarget as HTMLFormElement));
}

export function formControls() {
  return html`
    <fieldset>
      <igc-button variant="outlined" type="submit">Submit</igc-button>
      <igc-button variant="outlined" type="reset">Reset</igc-button>
    </fieldset>
  `;
}

function randomBetween(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new RangeError('pass in finite numbers');
  }
  if (max < min) {
    throw new RangeError('max is less than min');
  }
  const x = Math.random();
  const y = min * (1 - x) + max * x;
  return y >= min && y < max ? y : min;
}

export function randomIntBetween(min: number, max: number): number {
  return Math.floor(randomBetween(Math.ceil(min), Math.floor(max) + 1));
}

/** Resolves after `ms` milliseconds, for example to simulate a request. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The classes that many stories share. `.sr-only` hides text and keeps it for
 * assistive technologies, because `igc-visually-hidden` is not public.
 * `.muted` is secondary text.
 */
export const storyStyles = html`
  <style>
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .muted {
      color: var(--ig-gray-700);
    }
  </style>
`;

/**
 * Renders `view()` into an element on each `update()` call. Bind `mount` on
 * the element. Storybook disconnects and connects the story root, so `mount`
 * runs again with the same element and renders it again.
 */
export function renderInto(view: () => unknown) {
  let host: HTMLElement | undefined;

  const update = () => {
    if (host) {
      render(view(), host);
    }
  };

  return {
    mount: ref((element) => {
      host = element as HTMLElement | undefined;
      update();
    }),
    update,
    get host() {
      return host;
    },
  };
}

/**
 * A panel that scrolls, with `control` between a hint and enough text to
 * scroll, for the `scroll-strategy` stories.
 */
export function scrollingPanel(
  heading: string,
  subject: string,
  filler: string,
  control: unknown
) {
  return html`
    <style>
      .story-scrolling-panel {
        max-width: 46rem;
        height: 16rem;
        overflow: auto;
        padding: 1rem;
        border: 1px solid var(--ig-gray-200, #e0e0e0);
        border-radius: 4px;
      }
    </style>

    <div class="story-scrolling-panel">
      <h4>${heading}</h4>
      <p>
        Open the ${subject} and scroll this panel to compare the scroll
        strategies.
      </p>
      ${control}
      <p>${`${filler} `.repeat(23)}</p>
    </div>
  `;
}
