import { css } from 'lit';

import type { Themes } from '../../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/circular.progress.bootstrap.css.js';
import { styles as fluentDark } from './dark/circular.progress.fluent.css.js';
import { styles as indigoDark } from './dark/circular.progress.indigo.css.js';
import { styles as materialDark } from './dark/circular.progress.material.css.js';
import { styles as sharedDark } from './dark/circular.progress.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/circular.progress.bootstrap.css.js';
import { styles as fluentLight } from './light/circular.progress.fluent.css.js';
import { styles as indigoLight } from './light/circular.progress.indigo.css.js';
import { styles as materialLight } from './light/circular.progress.material.css.js';
import { styles as sharedLight } from './light/circular.progress.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/circular.progress.bootstrap.css.js';
import { styles as fluent } from './shared/circular.progress.fluent.css.js';

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
