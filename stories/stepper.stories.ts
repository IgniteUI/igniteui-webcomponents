import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  type IgcActiveStepChangedEventArgs,
  type IgcActiveStepChangingEventArgs,
  IgcButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcMaskInputComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  IgcStepperComponent,
  IgcSwitchComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { addDays, formatDate, today } from './story-dates.js';
import { type MaterialIconName, registerMaterialIcons } from './story-icons.js';
import {
  delay,
  disableStoryControls,
  dollars,
  focusAfterUpdate,
  plural,
  prefersReducedMotion,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcMaskInputComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  IgcStepperComponent,
  IgcSwitchComponent
);
registerMaterialIcons(
  'archive',
  'done',
  'event',
  'home',
  'keyboard',
  'link',
  'local-shipping',
  'near-me',
  'people',
  'shopping-cart'
);

// region default
const metadata: Meta<IgcStepperComponent> = {
  title: 'Stepper',
  component: 'igc-stepper',
  parameters: {
    docs: {
      description: {
        component:
          'A stepper component that provides a wizard-like workflow by dividing content into logical steps.',
      },
    },
    actions: { handles: ['igcActiveStepChanging', 'igcActiveStepChanged'] },
  },
  argTypes: {
    orientation: {
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
      description: 'The orientation of the stepper.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    stepType: {
      type: { name: 'enum', value: ['full', 'indicator', 'title'] },
      description: 'The visual type of the steps.',
      options: ['full', 'indicator', 'title'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'full' } },
    },
    linear: {
      type: 'boolean',
      description: 'Whether the stepper is linear.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    contentTop: {
      type: 'boolean',
      description: 'Whether the content is displayed above the steps.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    verticalAnimation: {
      type: { name: 'enum', value: ['fade', 'none', 'grow'] },
      description: 'The animation type when in vertical mode.',
      options: ['fade', 'none', 'grow'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'grow' } },
    },
    horizontalAnimation: {
      type: { name: 'enum', value: ['slide', 'fade', 'none'] },
      description: 'The animation type when in horizontal mode.',
      options: ['slide', 'fade', 'none'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'slide' } },
    },
    animationDuration: {
      type: 'number',
      description:
        'The animation duration in either vertical or horizontal mode in milliseconds.',
      control: 'number',
      table: { defaultValue: { summary: '320' } },
    },
    titlePosition: {
      type: { name: 'enum', value: ['bottom', 'top', 'start', 'end', 'auto'] },
      description: 'The position of the steps title.',
      options: ['bottom', 'top', 'start', 'end', 'auto'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'auto' } },
    },
  },
  args: {
    orientation: 'horizontal',
    stepType: 'full',
    linear: false,
    contentTop: false,
    verticalAnimation: 'grow',
    horizontalAnimation: 'slide',
    animationDuration: 320,
    titlePosition: 'auto',
  },
};

export default metadata;

interface IgcStepperArgs {
  /** The orientation of the stepper. */
  orientation: 'horizontal' | 'vertical';
  /** The visual type of the steps. */
  stepType: 'full' | 'indicator' | 'title';
  /** Whether the stepper is linear. */
  linear: boolean;
  /** Whether the content is displayed above the steps. */
  contentTop: boolean;
  /** The animation type when in vertical mode. */
  verticalAnimation: 'fade' | 'none' | 'grow';
  /** The animation type when in horizontal mode. */
  horizontalAnimation: 'slide' | 'fade' | 'none';
  /** The animation duration in either vertical or horizontal mode in milliseconds. */
  animationDuration: number;
  /** The position of the steps title. */
  titlePosition: 'bottom' | 'top' | 'start' | 'end' | 'auto';
}
type Story = StoryObj<IgcStepperArgs>;

// endregion

type StepChanging = CustomEvent<IgcActiveStepChangingEventArgs>;
type StepChanged = CustomEvent<IgcActiveStepChangedEventArgs>;

const styles = html`
  ${storyStyles}
  <style>
    .st-stack {
      display: grid;
      gap: 1rem;
      max-width: 48rem;
    }

    .st-stack :is(h3, h4, p, ol, ul, dl, dd) {
      margin: 0;
    }

    .st-panel {
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .st-fields {
      display: grid;
      gap: 1rem;
    }

    .st-pair {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: 1rem;
    }

    .st-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .st-head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem 1rem;
    }
  </style>
`;

/** Focuses the element marked with `data-autofocus` in the step at `index`. */
async function focusStep(
  stepper: IgcStepperComponent | undefined,
  index: number
): Promise<void> {
  const step = stepper?.steps[index];
  await step?.updateComplete;
  step?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A job application in four steps. Each `igc-step` has a header with an indicator, a title and a subtitle, and the stepper shows the content of the active step. A click on a header opens its step. The headers are one tab stop: the arrow keys move between them, and Enter or Space opens the focused step. Use the controls panel to change the orientation, the step type, the title position and the animations.',
      },
    },
  },
  render: (args) => html`
    <igc-stepper
      aria-label="Job application"
      .orientation=${args.orientation}
      .stepType=${args.stepType}
      .titlePosition=${args.titlePosition}
      .linear=${args.linear}
      .contentTop=${args.contentTop}
      .animationDuration=${args.animationDuration}
      .verticalAnimation=${args.verticalAnimation}
      .horizontalAnimation=${args.horizontalAnimation}
    >
      <igc-step>
        <span slot="title">Contact details</span>
        <span slot="subtitle">Name, email and phone</span>
        <p>
          Tell us how to reach you. We answer every application within five
          working days.
        </p>
      </igc-step>

      <igc-step>
        <span slot="title">Experience</span>
        <span slot="subtitle">Your last two roles</span>
        <p>
          Add the company, your title and what you were responsible for in each
          role.
        </p>
      </igc-step>

      <igc-step>
        <span slot="title">Documents</span>
        <span slot="subtitle">Resume and cover letter</span>
        <p>Upload your resume as a PDF. A cover letter is welcome.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Review</span>
        <span slot="subtitle">Check and send</span>
        <p>
          Read your application once more. You cannot change it after you send
          it.
        </p>
      </igc-step>
    </igc-stepper>
  `,
};

const cart = [
  { name: 'Wireless headphones', price: 129 },
  { name: 'Charging case', price: 29 },
];

const deliveryMethods = [
  { id: 'standard', name: 'Standard', detail: '5 to 7 working days', price: 0 },
  { id: 'express', name: 'Express', detail: '2 working days', price: 9.99 },
  { id: 'next-day', name: 'Next day', detail: 'order by 6 PM', price: 19.99 },
];

const subtotal = cart.reduce((sum, { price }) => sum + price, 0);

const deliveryPrice = (price: number) =>
  price ? dollars.format(price) : 'free';

/**
 * Checks the controls without `form.checkValidity()`, which marks them as
 * touched and shows errors before the user edits the fields.
 */
function isValid(form?: HTMLFormElement): boolean {
  return Array.from(form?.elements ?? []).every((element) => {
    const control = element as HTMLInputElement;
    return !control.willValidate || control.validity.valid;
  });
}

export const Checkout: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A checkout in linear mode. Each form step is `invalid` until its required fields are valid, and an invalid step blocks the headers of the steps after it. Continue submits the form of the step: an invalid form moves the focus to the first invalid field, and a valid one marks the step `complete`, calls `next()` and focuses the first field of the next step. The subtitle of a complete step sums up what the customer entered, and Edit on the review step calls `navigateTo()`. A header click sends `igcActiveStepChanging`: it marks the steps that the customer leaves forward as complete, and it cancels every change while the order is on its way and after it is placed. `reset()` starts a new order, after the forms are reset.',
      },
    },
  },
  render: () => {
    const stepper = createRef<IgcStepperComponent>();
    const forms = [
      createRef<HTMLFormElement>(),
      createRef<HTMLFormElement>(),
      createRef<HTMLFormElement>(),
    ];
    const state = {
      valid: [false, true, false],
      complete: [false, false, false],
      placing: false,
      order: '',
    };

    const sync = () => {
      state.valid = forms.map(({ value }) => isValid(value));
      update();
    };

    const proceed = (index: number) => async (event: SubmitEvent) => {
      event.preventDefault();
      state.complete[index] = true;
      update();
      stepper.value?.next();
      await focusStep(stepper.value, index + 1);
    };

    const goTo = (index: number) => async () => {
      stepper.value?.navigateTo(index);
      await focusStep(stepper.value, index);
    };

    const changing = (event: StepChanging) => {
      // The order is final once the customer places it.
      if (state.placing || state.order) {
        event.preventDefault();
        return;
      }

      const { oldIndex, newIndex } = event.detail;

      for (let index = oldIndex; index < newIndex; index++) {
        state.complete[index] = state.valid[index];
      }

      update();
    };

    const place = async () => {
      if (state.placing) {
        return;
      }

      state.placing = true;
      update();
      await delay(1500);
      state.placing = false;
      state.order = 'A-10482';
      update();
      await focusStep(stepper.value, 3);
    };

    const restart = async () => {
      for (const { value } of forms) {
        value?.reset();
      }

      state.complete = [false, false, false];
      state.order = '';
      sync();
      stepper.value?.reset();
      await focusStep(stepper.value, 0);
    };

    const reviewRow = (
      term: string,
      value: unknown,
      index: number,
      what: string
    ) => html`
      <dt>${term}</dt>
      <dd>${value}</dd>
      <dd>
        <igc-button variant="flat" @click=${goTo(index)}>
          Edit <span class="sr-only">${what}</span>
        </igc-button>
      </dd>
    `;

    const { mount, update } = renderInto(() => {
      const data = forms.map(({ value }) => new FormData(value));
      const field = (index: number, name: string) =>
        String(data[index].get(name) ?? '');
      const method =
        deliveryMethods.find(({ id }) => id === field(1, 'delivery')) ??
        deliveryMethods[0];
      const total = subtotal + method.price;

      return html`
        <igc-stepper
          ${ref(stepper)}
          linear
          aria-label="Checkout"
          @igcInput=${sync}
          @igcChange=${sync}
          @igcActiveStepChanging=${changing}
        >
          <igc-step ?invalid=${!state.valid[0]} ?complete=${state.complete[0]}>
            <span slot="title">Shipping</span>
            <span slot="subtitle">
              ${
                state.complete[0]
                  ? `${field(0, 'name')}, ${field(0, 'city')}`
                  : 'Where to send it'
              }
            </span>
            <form class="st-fields" ${ref(forms[0])} @submit=${proceed(0)}>
              <igc-input
                data-autofocus
                name="name"
                label="Full name"
                autocomplete="name"
                required
              ></igc-input>
              <igc-input
                name="address"
                label="Street address"
                autocomplete="street-address"
                required
              ></igc-input>
              <div class="st-pair">
                <igc-input
                  name="city"
                  label="City"
                  autocomplete="address-level2"
                  required
                ></igc-input>
                <igc-mask-input
                  name="zip"
                  label="ZIP code"
                  mask="00000"
                  required
                ></igc-mask-input>
              </div>
              <div class="st-actions">
                <igc-button type="submit">Continue to delivery</igc-button>
              </div>
            </form>
          </igc-step>

          <igc-step ?complete=${state.complete[1]}>
            <span slot="title">Delivery</span>
            <span slot="subtitle">
              ${method.name}, ${deliveryPrice(method.price)}
            </span>
            <form class="st-fields" ${ref(forms[1])} @submit=${proceed(1)}>
              <igc-radio-group aria-labelledby="st-delivery-label">
                <label id="st-delivery-label">Delivery method</label>
                ${deliveryMethods.map(
                  ({ id, name, detail, price }, index) => html`
                    <igc-radio
                      name="delivery"
                      value=${id}
                      ?checked=${index === 0}
                      ?data-autofocus=${id === method.id}
                    >
                      ${name}: ${detail}, ${deliveryPrice(price)}
                    </igc-radio>
                  `
                )}
              </igc-radio-group>
              <div class="st-actions">
                <igc-button variant="flat" @click=${goTo(0)}>Back</igc-button>
                <igc-button type="submit">Continue to payment</igc-button>
              </div>
            </form>
          </igc-step>

          <igc-step ?invalid=${!state.valid[2]} ?complete=${state.complete[2]}>
            <span slot="title">Payment</span>
            <span slot="subtitle">
              ${
                state.complete[2]
                  ? `Card ending ${field(2, 'card').slice(-4)}`
                  : 'Card details'
              }
            </span>
            <form class="st-fields" ${ref(forms[2])} @submit=${proceed(2)}>
              <igc-mask-input
                data-autofocus
                name="card"
                label="Card number"
                mask="0000 0000 0000 0000"
                required
              ></igc-mask-input>
              <div class="st-pair">
                <igc-mask-input
                  name="expiry"
                  label="Expiry date (MM/YY)"
                  mask="00/00"
                  required
                ></igc-mask-input>
                <igc-mask-input
                  name="cvc"
                  label="Security code"
                  mask="000"
                  required
                ></igc-mask-input>
              </div>
              <igc-input
                name="cardholder"
                label="Name on card"
                autocomplete="cc-name"
                required
              ></igc-input>
              <div class="st-actions">
                <igc-button variant="flat" @click=${goTo(1)}>Back</igc-button>
                <igc-button type="submit">Review the order</igc-button>
              </div>
            </form>
          </igc-step>

          <igc-step>
            <span slot="title">Review</span>
            <span slot="subtitle">Total ${dollars.format(total)}</span>
            ${
              state.order
                ? html`
                    <div class="st-fields">
                      <h4 tabindex="-1" data-autofocus>
                        Thank you! Your order ${state.order} is confirmed.
                      </h4>
                      <p>
                        We sent the receipt to your email. ${method.name}
                        delivery: ${method.detail}.
                      </p>
                      <div class="st-actions">
                        <igc-button variant="outlined" @click=${restart}>
                          Start a new order
                        </igc-button>
                      </div>
                    </div>
                  `
                : html`
                    <div class="st-fields">
                      <h4 tabindex="-1" data-autofocus>Review your order</h4>
                      <dl class="st-summary">
                        ${reviewRow(
                          'Ship to',
                          `${field(0, 'name')}, ${field(0, 'address')}, ${field(0, 'city')} ${field(0, 'zip')}`,
                          0,
                          'shipping address'
                        )}
                        ${reviewRow(
                          'Delivery',
                          `${method.name}, ${method.detail}`,
                          1,
                          'delivery method'
                        )}
                        ${reviewRow(
                          'Payment',
                          `Card ending ${field(2, 'card').slice(-4)}`,
                          2,
                          'payment'
                        )}
                      </dl>
                      <ul class="st-lines">
                        ${cart.map(
                          ({ name, price }) => html`
                            <li>
                              <span>${name}</span>
                              <span>${dollars.format(price)}</span>
                            </li>
                          `
                        )}
                        <li>
                          <span>Delivery</span>
                          <span>${deliveryPrice(method.price)}</span>
                        </li>
                        <li>
                          <strong>Total</strong>
                          <strong>${dollars.format(total)}</strong>
                        </li>
                      </ul>
                      <div class="st-actions">
                        <igc-button variant="flat" @click=${goTo(2)}>
                          Back
                        </igc-button>
                        <igc-button @click=${place}>
                          ${
                            state.placing
                              ? 'Placing the order'
                              : `Place the order, ${dollars.format(total)}`
                          }
                        </igc-button>
                      </div>
                    </div>
                  `
            }
          </igc-step>
        </igc-stepper>
        <p class="sr-only" role="status">
          ${state.placing ? 'Placing your order.' : ''}
        </p>
      `;
    });

    return html`
      ${styles}
      <style>
        .st-summary {
          display: grid;
          grid-template-columns: max-content 1fr auto;
          align-items: center;
          gap: 0.25rem 1rem;
        }

        .st-summary dt {
          font-weight: 600;
        }

        .st-lines {
          display: grid;
          gap: 0.5rem;
          padding: 0;
          list-style: none;
        }

        .st-lines li {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .st-lines li:last-child {
          padding-block-start: 0.5rem;
          border-block-start: 1px solid var(--ig-gray-300);
        }
      </style>
      <div class="st-stack" ${mount}></div>
    `;
  },
};

const setupSteps = ['project', 'invite', 'repo', 'alerts', 'deploy'] as const;

type SetupStep = (typeof setupSteps)[number];

export const SetupChecklist: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The setup checklist of a hosting service, in a vertical stepper. The customer can open the steps in any order. Inviting the team and the alerts are `optional`, and Skip for now passes them. Deploy is `disabled` until there is a project and a repository, and its subtitle tells why. A finished step is `complete`, gets a check mark in the `indicator` slot and sums up the result in its subtitle. Then `navigateTo()` opens the next open step and the focus goes to its first control. Start over resets the forms and calls `reset()`, because `reset()` opens the first step but does not clear the content of the steps.',
      },
    },
  },
  render: () => {
    const stepper = createRef<IgcStepperComponent>();
    const results = new Map<SetupStep, string>();
    const skipped = new Set<SetupStep>();
    let projectName = '';
    let busy: SetupStep | null = null;
    let message = '';

    const handled = (id: SetupStep) => results.has(id) || skipped.has(id);
    const blocked = () => !(results.has('project') && results.has('repo'));

    const advance = async () => {
      const next = setupSteps.findIndex(
        (id) => !handled(id) && !(id === 'deploy' && blocked())
      );

      if (next > -1) {
        stepper.value?.navigateTo(next);
        await focusStep(stepper.value, next);
      }
    };

    const finish = async (id: SetupStep, result: string) => {
      results.set(id, result);
      skipped.delete(id);
      message = handled('deploy') ? 'Your workspace is ready.' : '';
      update();
      await advance();
    };

    const skip = (id: SetupStep) => async () => {
      skipped.add(id);
      update();
      await advance();
    };

    const run = async (id: SetupStep, text: string, result: string) => {
      if (busy) {
        return;
      }

      busy = id;
      message = text;
      update();
      await delay(1200);
      busy = null;
      await finish(id, result);
    };

    const submit =
      (id: SetupStep, result: (data: FormData) => string) =>
      (event: SubmitEvent) => {
        event.preventDefault();
        finish(id, result(new FormData(event.target as HTMLFormElement)));
      };

    const startOver = async () => {
      results.clear();
      skipped.clear();
      message = '';

      for (const form of story.host?.querySelectorAll('form') ?? []) {
        form.reset();
      }

      update();
      stepper.value?.reset();
      await focusStep(stepper.value, 0);
    };

    const subtitle = (id: SetupStep, fallback: string, optional = false) => {
      if (results.has(id)) {
        return results.get(id);
      }

      if (skipped.has(id)) {
        return 'Skipped';
      }

      return optional ? `Optional. ${fallback}` : fallback;
    };

    const indicator = (id: SetupStep) =>
      results.has(id)
        ? html`<igc-icon
            slot="indicator"
            name="done"
            aria-hidden="true"
          ></igc-icon>`
        : nothing;

    const story = renderInto(() => {
      const count = setupSteps.filter(handled).length;
      const project = results.has('project') ? projectName : 'your project';

      return html`
        <div class="st-head">
          <h3 id="st-setup-title">Set up your workspace</h3>
          <igc-button variant="flat" @click=${startOver}>Start over</igc-button>
        </div>
        <div class="st-progress">
          <igc-linear-progress
            aria-labelledby="st-setup-count"
            hide-label
            max=${setupSteps.length}
            value=${count}
          ></igc-linear-progress>
          <span id="st-setup-count" class="muted">
            ${count} of ${setupSteps.length} done
          </span>
        </div>
        <igc-stepper
          ${ref(stepper)}
          orientation="vertical"
          aria-labelledby="st-setup-title"
        >
          <igc-step ?complete=${results.has('project')}>
            ${indicator('project')}
            <span slot="title">Create a project</span>
            <span slot="subtitle">
              ${subtitle('project', 'Name the site that you host')}
            </span>
            <form
              class="st-fields"
              @submit=${submit('project', (data) => {
                projectName = String(data.get('project'));
                return `Created ${projectName}`;
              })}
            >
              <igc-input
                data-autofocus
                name="project"
                label="Project name"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
              >
                <span slot="helper-text">
                  Lowercase letters, digits and hyphens, such as acme-web.
                </span>
                <span slot="pattern-mismatch">
                  Use only lowercase letters, digits and hyphens.
                </span>
              </igc-input>
              <div class="st-actions">
                <igc-button type="submit">Create the project</igc-button>
              </div>
            </form>
          </igc-step>

          <igc-step optional ?complete=${results.has('invite')}>
            ${indicator('invite')}
            <span slot="title">Invite your team</span>
            <span slot="subtitle">
              ${subtitle('invite', 'Work together', true)}
            </span>
            <form
              class="st-fields"
              @submit=${submit('invite', (data) => `Invited ${data.get('email')}`)}
            >
              <igc-input
                data-autofocus
                type="email"
                name="email"
                label="Email of a teammate"
                autocomplete="off"
                required
              ></igc-input>
              <div class="st-actions">
                <igc-button variant="flat" @click=${skip('invite')}>
                  Skip for now
                </igc-button>
                <igc-button type="submit">Send the invite</igc-button>
              </div>
            </form>
          </igc-step>

          <igc-step ?complete=${results.has('repo')}>
            ${indicator('repo')}
            <span slot="title">Connect a repository</span>
            <span slot="subtitle">
              ${subtitle('repo', 'Deploy on every push')}
            </span>
            <div class="st-fields">
              <p>Every push to the main branch deploys ${project}.</p>
              <div class="st-actions">
                ${['GitHub', 'GitLab'].map(
                  (host, index) => html`
                    <igc-button
                      ?data-autofocus=${index === 0}
                      variant="outlined"
                      @click=${() =>
                        run(
                          'repo',
                          `Connecting to ${host}.`,
                          `Connected ${host.toLowerCase()}.com/acme/web`
                        )}
                    >
                      Connect ${host}
                    </igc-button>
                  `
                )}
              </div>
            </div>
          </igc-step>

          <igc-step optional ?complete=${results.has('alerts')}>
            ${indicator('alerts')}
            <span slot="title">Turn on alerts</span>
            <span slot="subtitle">
              ${subtitle('alerts', 'Know when a deploy fails', true)}
            </span>
            <form
              class="st-fields"
              @submit=${submit('alerts', (data) =>
                plural(data.getAll('alert').length, 'alert on', 'alerts on')
              )}
            >
              <igc-switch data-autofocus name="alert" value="failed" checked>
                Email me when a deploy fails
              </igc-switch>
              <igc-switch name="alert" value="usage">
                Email me a weekly usage report
              </igc-switch>
              <div class="st-actions">
                <igc-button variant="flat" @click=${skip('alerts')}>
                  Skip for now
                </igc-button>
                <igc-button type="submit">Save the alerts</igc-button>
              </div>
            </form>
          </igc-step>

          <igc-step ?disabled=${blocked()} ?complete=${results.has('deploy')}>
            ${indicator('deploy')}
            <span slot="title">Deploy</span>
            <span slot="subtitle">
              ${
                blocked()
                  ? 'Needs a project and a repository'
                  : subtitle('deploy', 'Put the site online')
              }
            </span>
            <div class="st-fields">
              <p>Build ${project} from the main branch and put it online.</p>
              <div class="st-actions">
                <igc-button
                  data-autofocus
                  @click=${() =>
                    run(
                      'deploy',
                      'Deploying.',
                      `Live at ${project}.example.app`
                    )}
                >
                  Deploy now
                </igc-button>
              </div>
            </div>
          </igc-step>
        </igc-stepper>
        <p class="muted" role="status">${message}</p>
      `;
    });
    const { update } = story;

    return html`
      ${styles}
      <style>
        .st-progress {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 1rem;
        }
      </style>
      <section
        class="st-stack st-panel"
        aria-labelledby="st-setup-title"
        ${story.mount}
      ></section>
    `;
  },
};

type Scan = { day: number; time: string; text: string; place: string };

const trackingStages: {
  title: string;
  icon: MaterialIconName;
  scans: Scan[];
}[] = [
  {
    title: 'Ordered',
    icon: 'shopping-cart',
    scans: [
      { day: -3, time: '10:24 AM', text: 'Order placed', place: 'Online' },
      { day: -3, time: '10:31 AM', text: 'Payment confirmed', place: 'Online' },
    ],
  },
  {
    title: 'Packed',
    icon: 'archive',
    scans: [
      {
        day: -2,
        time: '8:10 AM',
        text: 'Picked and packed',
        place: 'Fulfillment center, Reno, NV',
      },
    ],
  },
  {
    title: 'Shipped',
    icon: 'local-shipping',
    scans: [
      {
        day: -2,
        time: '5:45 PM',
        text: 'Picked up by the carrier',
        place: 'Reno, NV',
      },
      {
        day: -1,
        time: '11:20 PM',
        text: 'Arrived at the sorting center',
        place: 'Oakland, CA',
      },
    ],
  },
  {
    title: 'Out for delivery',
    icon: 'near-me',
    scans: [
      {
        day: 0,
        time: '8:02 AM',
        text: 'On the delivery van',
        place: 'Oakland, CA',
      },
    ],
  },
  { title: 'Delivered', icon: 'home', scans: [] },
];

const deliveredScan: Scan = {
  day: 0,
  time: '2:37 PM',
  text: 'Delivered, left at the front door',
  place: 'Oakland, CA',
};

const scanDate = (day: number) =>
  formatDate(addDays(today, day), { month: 'short', day: 'numeric' });

export const PackageTracking: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The tracking page of an order. Each stage of the shipment is a step with an icon in the `indicator` slot. The stages that the package passed are `complete`, the current stage is `active`, and the stages to come are `disabled`, so the customer can open the scans of any stage that the package reached. Refresh checks for new scans: when the package arrives, the last stage turns `complete`, and `navigateTo()` opens it. On a narrow screen the stepper turns `vertical`, so that the five titles fit.',
      },
    },
  },
  render: () => {
    const narrow = window.matchMedia('(max-width: 40rem)');
    const stepper = createRef<IgcStepperComponent>();
    const delivered = [deliveredScan];
    const initial = 3;
    const last = trackingStages.length - 1;
    let reached = initial;
    let checking = false;
    let message = '';

    const refresh = async () => {
      if (checking) {
        return;
      }

      checking = true;
      message = 'Checking for updates.';
      update();
      await delay(800);
      checking = false;

      if (reached === last) {
        message = 'No new updates.';
        update();
        return;
      }

      reached = last;
      message = `Delivered at ${deliveredScan.time}.`;
      update();

      const step = stepper.value?.steps[reached];
      await step?.updateComplete;
      stepper.value?.navigateTo(reached);
    };

    const scans = (index: number) =>
      index === last && reached === index
        ? delivered
        : trackingStages[index].scans;

    const subtitle = (index: number) => {
      const [first] = scans(index);
      return first ? scanDate(first.day) : 'Expected today by 8 PM';
    };

    const { mount, update } = renderInto(
      () => html`
        <div class="st-head">
          <div>
            <h3 id="st-track-title">Order A-10482</h3>
            <p class="muted">
              ${reached === last ? 'Delivered today' : 'Arriving today by 8 PM'}
            </p>
          </div>
          <igc-button variant="outlined" @click=${refresh}>Refresh</igc-button>
        </div>
        <igc-stepper
          ${ref(stepper)}
          aria-label="Shipment progress"
          orientation=${narrow.matches ? 'vertical' : 'horizontal'}
        >
          ${trackingStages.map(
            ({ title, icon }, index) => html`
              <igc-step
                ?complete=${index < reached || reached === last}
                ?disabled=${index > reached}
                ?active=${index === initial}
              >
                <igc-icon
                  slot="indicator"
                  name=${icon}
                  aria-hidden="true"
                ></igc-icon>
                <span slot="title">${title}</span>
                <span slot="subtitle">${subtitle(index)}</span>
                <ol class="st-scans">
                  ${scans(index).map(
                    ({ day, time, text, place }) => html`
                      <li>
                        <span class="muted">${scanDate(day)}, ${time}</span>
                        <span>${text}</span>
                        <span class="muted">${place}</span>
                      </li>
                    `
                  )}
                </ol>
              </igc-step>
            `
          )}
        </igc-stepper>
        <p class="muted" role="status">${message}</p>
      `
    );

    const watchWidth = ref((element) =>
      element
        ? narrow.addEventListener('change', update)
        : narrow.removeEventListener('change', update)
    );

    return html`
      ${styles}
      <style>
        .st-scans {
          display: grid;
          gap: 0.75rem;
          padding: 0;
          list-style: none;
        }

        .st-scans li {
          display: grid;
          gap: 0.125rem;
        }
      </style>
      <section
        class="st-stack st-panel"
        aria-labelledby="st-track-title"
        ${mount}
        ${watchWidth}
      ></section>
    `;
  },
};

const tourSlides: { title: string; icon: MaterialIconName; text: string }[] = [
  {
    title: 'Timeline view',
    icon: 'event',
    text: 'See every task of a project on one timeline, and drag a task to move its dates.',
  },
  {
    title: 'Task dependencies',
    icon: 'link',
    text: 'Link the tasks that wait for each other. When a task moves, the tasks after it move too.',
  },
  {
    title: 'Guest access',
    icon: 'people',
    text: 'Invite clients to a single project. Guests see only the tasks that you share with them.',
  },
  {
    title: 'Keyboard shortcuts',
    icon: 'keyboard',
    text: 'Press the question mark key in any project to see the shortcuts for the view that you use.',
  },
];

export const FeatureTour: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A tour of the new features of a project management app. `content-top` puts the slides above the headers, and `step-type="indicator"` shows only the numbers, so each step gets its name from a host `aria-label`. The slides fade, and the animation is off when the user prefers reduced motion. The Back and Next buttons sit outside the stepper and call `prev()` and `next()`, so the focus stays on them. `igcActiveStepChanged` follows the slide that the user opens from the headers, and a status message announces each slide.',
      },
    },
  },
  render: () => {
    const stepper = createRef<IgcStepperComponent>();
    const next = createRef<IgcButtonComponent>();
    const replay = createRef<IgcButtonComponent>();
    const reduceMotion = prefersReducedMotion();
    let index = 0;
    let finished = false;
    let message = '';

    const show = (to: number) => {
      index = to;
      message = `Slide ${index + 1} of ${tourSlides.length}: ${tourSlides[index].title}`;
      update();
    };

    const changed = ({ detail }: StepChanged) => show(detail.index);

    const back = async () => {
      stepper.value?.prev();
      show(index - 1);

      // Back turns disabled on the first slide.
      if (index === 0) {
        await focusAfterUpdate(next.value);
      }
    };

    const finish = async () => {
      finished = true;
      message = '';
      update();
      await focusAfterUpdate(replay.value);
    };

    const forward = async () => {
      if (index === tourSlides.length - 1) {
        await finish();
        return;
      }

      stepper.value?.next();
      show(index + 1);
    };

    const restart = async () => {
      finished = false;
      index = 0;
      message = '';
      update();
      await focusAfterUpdate(next.value);
    };

    const { mount, update } = renderInto(() =>
      finished
        ? html`
            <h3 id="st-tour-title">You are all set</h3>
            <p>You can open the tour again from the Help menu at any time.</p>
            <div class="st-actions">
              <igc-button ${ref(replay)} variant="outlined" @click=${restart}>
                Take the tour again
              </igc-button>
            </div>
          `
        : html`
            <h3 id="st-tour-title">What is new in Projects</h3>
            <igc-stepper
              ${ref(stepper)}
              aria-label="Tour slides"
              content-top
              step-type="indicator"
              horizontal-animation="fade"
              animation-duration=${reduceMotion ? 0 : 320}
              @igcActiveStepChanged=${changed}
            >
              ${tourSlides.map(
                ({ title, icon, text }) => html`
                  <igc-step aria-label=${title}>
                    <div class="st-slide">
                      <igc-icon name=${icon} aria-hidden="true"></igc-icon>
                      <h4>${title}</h4>
                      <p>${text}</p>
                    </div>
                  </igc-step>
                `
              )}
            </igc-stepper>
            <div class="st-actions">
              <igc-button variant="flat" @click=${finish}>
                Skip the tour
              </igc-button>
              <igc-button
                variant="outlined"
                ?disabled=${index === 0}
                @click=${back}
              >
                Back
              </igc-button>
              <igc-button ${ref(next)} @click=${forward}>
                ${index < tourSlides.length - 1 ? 'Next' : 'Get started'}
              </igc-button>
            </div>
            <p class="sr-only" role="status">${message}</p>
          `
    );

    return html`
      ${styles}
      <style>
        .st-tour {
          max-width: 32rem;
        }

        .st-slide {
          display: grid;
          justify-items: center;
          gap: 0.5rem;
          min-height: 10rem;
          text-align: center;
        }

        .st-slide igc-icon {
          --ig-icon-size: 3rem;

          color: var(--ig-primary-500);
        }
      </style>
      <section
        class="st-stack st-panel st-tour"
        aria-labelledby="st-tour-title"
        ${mount}
      ></section>
    `;
  },
};
