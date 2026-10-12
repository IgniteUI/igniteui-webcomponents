import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcButtonComponent,
  IgcFileInputComponent,
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html, nothing, render } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcFileInputComponent,
  IgcIconComponent,
  IgcInputComponent
);

registerMaterialIcons('description', 'photo');

// region default
const metadata: Meta<IgcFileInputComponent> = {
  title: 'FileInput',
  component: 'igc-file-input',
  parameters: {
    docs: { description: { component: '' } },
    actions: { handles: ['igcChange', 'igcCancel'] },
  },
  argTypes: {
    value: {
      type: 'string',
      description:
        'The value of the control.\nSimilar to native file input, this property is read-only and cannot be set programmatically.',
      control: 'text',
    },
    multiple: {
      type: 'boolean',
      description:
        'Whether the control allows the user to select more than one file.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    accept: {
      type: 'string',
      description:
        'The file types the control accepts, as a comma-separated list.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    autofocus: {
      type: 'boolean',
      description: 'Whether the control should receive focus automatically.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale for the resource strings. Falls back to the global locale.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name of the control, submitted with the form data.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder text of the control.',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
  },
  args: {
    multiple: false,
    accept: '',
    autofocus: false,
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
  },
};

export default metadata;

interface IgcFileInputArgs {
  /**
   * The value of the control.
   * Similar to native file input, this property is read-only and cannot be set programmatically.
   */
  value: string;
  /** Whether the control allows the user to select more than one file. */
  multiple: boolean;
  /** The file types the control accepts, as a comma-separated list. */
  accept: string;
  /** Whether the control should receive focus automatically. */
  autofocus: boolean;
  /** The locale for the resource strings. Falls back to the global locale. */
  locale: string;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The placeholder text of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
}
type Story = StoryObj<IgcFileInputArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .fi-form {
      display: grid;
      gap: 1rem;
      width: min(100%, 32rem);
    }

    .fi-form :is(h3, p),
    .fi-result,
    .fi-result dd {
      margin: 0;
    }

    .fi-form h3 {
      font-size: 1.125rem;
    }

    .fi-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .fi-files {
      margin: 0;
      padding-inline-start: 1.25rem;
    }

    .fi-result {
      padding: 0.75rem 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .fi-result div {
      display: flex;
      gap: 1rem;
    }

    .fi-result dt {
      min-width: 6rem;
      font-weight: 600;
    }

    .fi-table {
      width: 100%;
      border-collapse: collapse;
    }

    .fi-table caption {
      padding-block-end: 0.5rem;
      text-align: start;
    }

    .fi-table :is(th, td) {
      padding: 0.375rem 0.5rem;
      border-block-end: 1px solid var(--ig-gray-300);
      text-align: start;
    }
  </style>
`;

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Checks a file against an `accept` list, because the user can choose any file in the picker. */
function accepts(file: File, accept: string): boolean {
  return accept.split(',').some((entry) => {
    const type = entry.trim().toLowerCase();

    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type);
    }

    return type.endsWith('/*')
      ? file.type.startsWith(type.slice(0, -1))
      : file.type === type;
  });
}

export const Default: Story = {
  args: { label: 'Resume', accept: '.pdf,.doc,.docx' },
  parameters: {
    docs: {
      description: {
        story:
          'A file input for a resume. The control shows a Browse button and the names of the selected files. Click the control, or press Enter or Space while it has the focus, to open the file picker. `accept` limits the file types that the picker shows, and `multiple` lets the user select more than one file. Like a native file input, `value` is read-only: set it to an empty string to clear the selection. Use the controls panel to change the other properties.',
      },
    },
  },
  render: (args) => html`
    <div style="width: min(100%, 28rem)">
      <igc-file-input
        name=${ifDefined(args.name)}
        label=${ifDefined(args.label)}
        placeholder=${ifDefined(args.placeholder)}
        value=${ifDefined(args.value)}
        accept=${ifDefined(args.accept || undefined)}
        locale=${ifDefined(args.locale)}
        ?autofocus=${args.autofocus}
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        ?multiple=${args.multiple}
        ?outlined=${args.outlined}
        ?required=${args.required}
      >
        <span slot="helper-text">A PDF or Word document.</span>
      </igc-file-input>
    </div>
  `,
};

const resumeTypes = '.pdf,.doc,.docx';
const sampleTypes = 'image/png,image/jpeg,application/pdf';
const megabyte = 1024 * 1024;

function resumeError(files: FileList): string {
  const [file] = files;

  if (file && !accepts(file, resumeTypes)) {
    return 'Attach a PDF or Word document.';
  }

  return file && file.size > 5 * megabyte
    ? 'The resume is larger than 5 MB.'
    : '';
}

function samplesError(files: FileList): string {
  const list = [...files];
  const other = list.find((file) => !accepts(file, sampleTypes));

  if (other) {
    return `"${other.name}" is not a PNG or JPEG image, or a PDF document.`;
  }

  if (list.length > 5) {
    return 'Choose up to 5 files.';
  }

  const total = list.reduce((sum, file) => sum + file.size, 0);
  return total > 20 * megabyte
    ? 'The files are larger than 20 MB in total.'
    : '';
}

export const JobApplication: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A job application form with two file inputs. The resume is `required`, and the `value-missing` slot shows when the user submits without it, or closes the picker without a file. `accept` only filters the picker: the user can still choose "All files". So the `igcChange` handler checks the type and the size of each file, and calls `setCustomValidity()`. The `custom-error` slot shows the message. The work samples use `multiple`, and the list under the control shows the name and the size of each file. A new selection replaces the old one, as in a native file input. The submit handler shows the form data: each file of a `multiple` input is a separate entry with the same name. Reset clears the files, and the reset handler clears the custom errors.',
      },
    },
  },
  render: () => {
    const check = (
      event: CustomEvent<FileList>,
      validate: (files: FileList) => string
    ) => {
      const input = event.currentTarget as IgcFileInputComponent;
      const message = validate(event.detail);

      input.setCustomValidity(message);
      input.querySelector('[slot="custom-error"]')!.textContent = message;

      if (input.multiple) {
        render(
          [...event.detail].map(
            (file) => html`<li>${file.name}, ${formatSize(file.size)}</li>`
          ),
          input.parentElement!.querySelector('.fi-files')!
        );
      }
    };

    const submit = (event: SubmitEvent) => {
      const form = event.currentTarget as HTMLFormElement;

      event.preventDefault();
      render(
        html`
          <dl class="fi-result">
            ${[...new FormData(form)].map(
              ([key, value]) => html`
                <div>
                  <dt>${key}</dt>
                  <dd>
                    ${
                      value instanceof File
                        ? `${value.name}, ${formatSize(value.size)}`
                        : value
                    }
                  </dd>
                </div>
              `
            )}
          </dl>
        `,
        form.querySelector('output')!
      );
    };

    const reset = (event: Event) => {
      const form = event.currentTarget as HTMLFormElement;

      for (const input of form.querySelectorAll('igc-file-input')) {
        input.setCustomValidity('');
      }

      render(nothing, form.querySelector('.fi-files')!);
      render(nothing, form.querySelector('output')!);
    };

    return html`
      ${styles}
      <form
        class="fi-form"
        enctype="multipart/form-data"
        @submit=${submit}
        @reset=${reset}
      >
        <h3>Apply for the position of UX designer</h3>
        <igc-input
          name="name"
          label="Full name"
          autocomplete="name"
          required
        ></igc-input>
        <igc-input
          name="email"
          type="email"
          label="Email"
          autocomplete="email"
          required
        ></igc-input>
        <igc-file-input
          name="resume"
          label="Resume"
          accept=${resumeTypes}
          required
          @igcChange=${(event: CustomEvent<FileList>) => check(event, resumeError)}
        >
          <igc-icon slot="prefix" name="description"></igc-icon>
          <span slot="helper-text">A PDF or Word document, up to 5 MB.</span>
          <span slot="value-missing">Attach your resume.</span>
          <span slot="custom-error"></span>
        </igc-file-input>
        <div>
          <igc-file-input
            name="samples"
            label="Work samples (optional)"
            accept=${sampleTypes}
            multiple
            @igcChange=${(event: CustomEvent<FileList>) => check(event, samplesError)}
          >
            <igc-icon slot="prefix" name="photo"></igc-icon>
            <span slot="file-selector-text">Choose files</span>
            <span slot="file-missing-text">No samples chosen</span>
            <span slot="helper-text">
              Up to 5 images or PDF documents, 20 MB in total.
            </span>
            <span slot="custom-error"></span>
          </igc-file-input>
          <ul class="fi-files" aria-label="Work samples"></ul>
        </div>
        <div class="fi-row">
          <igc-button type="submit">Send the application</igc-button>
          <igc-button type="reset" variant="flat">Reset</igc-button>
        </div>
        <output></output>
      </form>
    `;
  },
};

type Contact = Record<string, string>;

const sampleCsv = [
  'name,email,company',
  'Ana Martins,ana.martins@example.com,Acme',
  'Liam Chen,liam.chen@example.com,Globex',
  'Sofía Díaz,,Initech',
  'Grace Okafor,grace.okafor@example.com,Umbrella',
  'Marco Rossi,marco.rossi@example.com,Acme',
  'Yuki Tanaka,yuki.tanaka@example.com,Hooli',
  'Noah Becker,noah.becker@example,Globex',
].join('\n');

/** A small parser for the story: it does not support quoted values. */
function parseCsv(text: string): { columns: string[]; rows: Contact[] } {
  const [header = '', ...lines] = text.trim().split(/\r?\n/);
  const columns = header.split(',').map((column) => column.trim());

  const rows = lines
    .filter((line) => line.trim())
    .map((line) => {
      const cells = line.split(',');
      return Object.fromEntries(
        columns.map((column, index) => [column, cells[index]?.trim() ?? ''])
      );
    });

  return { columns, rows };
}

const validEmail = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

export const ImportContacts: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'An import of contacts from a CSV file. The `igcChange` handler reads the file with `file.text()`, and checks that the file has a "name" and an "email" column. When a column is missing, `setCustomValidity()` makes the control invalid, and the `custom-error` slot tells which column. Then the story shows a preview of the first rows, and tells how many rows it skips because they have no valid email address. The `file-selector-text` slot changes the text of the button. Use "Download a sample file" to get a file to import. Choose another file, or close the picker without a file: `igcCancel` keeps the current selection, so the preview stays.',
      },
    },
  },
  render: () => {
    let contacts: Contact[] = [];
    let skipped = 0;
    let fileName = '';
    let status = '';
    let sample = '';
    let host: HTMLElement | undefined;
    let reads = 0;

    const read = async (event: CustomEvent<FileList>) => {
      const input = event.currentTarget as IgcFileInputComponent;
      const [file] = event.detail;
      const current = ++reads;

      contacts = [];
      skipped = 0;
      status = '';
      fileName = file?.name ?? '';

      if (!file) {
        input.setCustomValidity('');
        update();
        return;
      }

      const text = await file.text();

      // The read of a large file can end after the read of a newer selection.
      if (current !== reads) {
        return;
      }

      const { columns, rows } = parseCsv(text);
      const missing = ['name', 'email'].find(
        (column) => !columns.includes(column)
      );
      const message = missing ? `The file has no "${missing}" column.` : '';

      input.setCustomValidity(message);
      input.querySelector('[slot="custom-error"]')!.textContent = message;

      if (!missing) {
        contacts = rows.filter((row) => validEmail(row.email));
        skipped = rows.length - contacts.length;
      }

      update();
    };

    const importContacts = () => {
      status = `We imported ${contacts.length} contacts from ${fileName}.`;
      update();
    };

    const update = () => {
      if (!host) {
        return;
      }

      const preview = contacts.slice(0, 5);

      render(
        html`
          <div class="fi-form">
            <h3>Import contacts</h3>
            <igc-file-input
              label="Contacts file"
              accept=".csv,text/csv"
              @igcChange=${read}
            >
              <span slot="file-selector-text">Choose a CSV file</span>
              <span slot="helper-text">
                A CSV file with a "name" and an "email" column.
              </span>
              <span slot="custom-error"></span>
            </igc-file-input>
            <div class="fi-row">
              <igc-button
                variant="flat"
                href=${sample}
                download="contacts-sample.csv"
              >
                Download a sample file
              </igc-button>
            </div>
            ${
              preview.length
                ? html`
                    <table class="fi-table">
                      <caption>
                        Preview: ${preview.length} of ${contacts.length}
                        contacts
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Name</th>
                          <th scope="col">Email</th>
                          <th scope="col">Company</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${preview.map(
                          (contact) => html`
                            <tr>
                              <td>${contact.name}</td>
                              <td>${contact.email}</td>
                              <td>${contact.company}</td>
                            </tr>
                          `
                        )}
                      </tbody>
                    </table>
                  `
                : nothing
            }
            <p class="muted">
              ${
                skipped
                  ? `We skip ${skipped} ${skipped === 1 ? 'row' : 'rows'} without a valid email address.`
                  : ''
              }
            </p>
            <div class="fi-row">
              <igc-button
                ?disabled=${!contacts.length}
                @click=${importContacts}
              >
                Import ${contacts.length || ''} contacts
              </igc-button>
            </div>
            <p class="muted" role="status">${status}</p>
          </div>
        `,
        host
      );
    };

    const mount = (element?: Element) => {
      host = element as HTMLElement | undefined;

      // Storybook can disconnect the story and connect it again, so each
      // connection gets its own URL.
      if (host) {
        sample = URL.createObjectURL(
          new Blob([sampleCsv], { type: 'text/csv' })
        );
        update();
      } else {
        URL.revokeObjectURL(sample);
      }
    };

    return html`${styles}
      <div ${ref(mount)}></div>`;
  },
};
