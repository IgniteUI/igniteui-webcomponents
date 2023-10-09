import { css } from 'lit';
import { Themes } from '../../../theming/types.js';

// Shared Styles
import { styles as bootstrap } from './shared/container/list.bootstrap.css.js';

// Light Overrides
import { styles as bootstrapLight } from './light/container/list.bootstrap.css.js';

// Dark Overrides
import { styles as bootstrapDark } from './dark/container/list.bootstrap.css.js';
import { styles as fluentDark } from './dark/container/list.fluent.css.js';
import { styles as indigoDark } from './dark/container/list.indigo.css.js';

const light = {
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap} ${bootstrapDark}
  `,
  fluent: css`
    ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };
