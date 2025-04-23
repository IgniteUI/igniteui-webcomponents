import type { ArgTypes, Meta } from '@storybook/web-components';
import { html } from 'lit';

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
