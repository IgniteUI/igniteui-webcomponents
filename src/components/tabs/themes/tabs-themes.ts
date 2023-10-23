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
import { styles as fluent } from './shared/tabs/tabs.fluent.css.js';
import { styles as indigo } from './shared/tabs/tabs.indigo.css.js';
import { styles as material } from './shared/tabs/tabs.material.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${material} ${materialLight}
  `,
  fluent: css`
    ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${indigo} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${material} ${materialDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };
