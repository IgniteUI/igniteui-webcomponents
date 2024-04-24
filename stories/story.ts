import type { ArgTypes, Meta } from '@storybook/web-components';
import { html } from 'lit';

import { IgcDialogComponent, defineComponents } from '../src/index.js';
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
