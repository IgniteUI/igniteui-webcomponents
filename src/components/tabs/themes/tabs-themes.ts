import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/tab.bootstrap.css.js';
import { styles as fluentDark } from './dark/tab.fluent.css.js';
import { styles as indigoDark } from './dark/tab.indigo.css.js';
import { styles as materialDark } from './dark/tab.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/tab.bootstrap.css.js';
import { styles as fluentLight } from './light/tab.fluent.css.js';
import { styles as indigoLight } from './light/tab.indigo.css.js';
import { styles as materialLight } from './light/tab.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/tabs/tabs.bootstrap.css.js';
import { styles as shared } from './shared/tabs/tabs.common.css.js';
import { styles as fluent } from './shared/tabs/tabs.fluent.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${shared} ${materialDark}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };
