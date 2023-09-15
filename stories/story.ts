import type { ArgTypes, Meta } from '@storybook/web-components';
import { html } from 'lit';

export function disableStoryControls<T>(meta: Meta<T>): Partial<ArgTypes<T>> {
  return Object.fromEntries(
    Object.entries(structuredClone(meta.argTypes!)).map(([key, args]) => [
      key,
      Object.assign(args as {}, { table: { disable: true } }),
    ])
  ) as unknown as Partial<ArgTypes<T>>;
}

export function formSubmitHandler(event: SubmitEvent) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  console.table(Object.fromEntries(new FormData(form)));
}

export function formControls() {
  return html`
    <fieldset>
      <igc-button variant="outlined" type="submit">Submit</igc-button>
      <igc-button variant="outlined" type="reset">Reset</igc-button>
    </fieldset>
  `;
}
