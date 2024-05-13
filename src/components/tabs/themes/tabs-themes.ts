import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/tab.bootstrap.css.js';
import { styles as fluentDark } from './dark/tab.fluent.css.js';
import { styles as indigoDark } from './dark/tab.indigo.css.js';
import { styles as materialDark } from './dark/tab.material.css.js';
import { styles as sharedDark } from './dark/tab.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/tab.bootstrap.css.js';
import { styles as fluentLight } from './light/tab.fluent.css.js';
import { styles as indigoLight } from './light/tab.indigo.css.js';
import { styles as materialLight } from './light/tab.material.css.js';
import { styles as sharedLight } from './light/tab.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/tabs/tabs.bootstrap.css.js';
import { styles as fluent } from './shared/tabs/tabs.fluent.css.js';

const light = {
  shared: css`
    ${sharedLight}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
  `,
};

const dark = {
  shared: css`
    ${sharedDark}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${materialDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };
