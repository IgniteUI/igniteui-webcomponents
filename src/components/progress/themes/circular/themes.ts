import { css } from 'lit';
import { Themes } from '../../../../theming/types.js';

// Shared Styles
import { styles as material } from './shared/circular.progress.material.css.js';
import { styles as bootstrap } from './shared/circular.progress.bootstrap.css.js';
import { styles as fluent } from './shared/circular.progress.fluent.css.js';
import { styles as indigo } from './shared/circular.progress.indigo.css.js';

// Light Overrides
import { styles as materialLight } from './light/circular.progress.material.css.js';
import { styles as bootstrapLight } from './light/circular.progress.bootstrap.css.js';
import { styles as fluentLight } from './light/circular.progress.fluent.css.js';
import { styles as indigoLight } from './light/circular.progress.indigo.css.js';

// Dark Overrides
import { styles as materialDark } from './dark/circular.progress.material.css.js';
import { styles as bootstrapDark } from './dark/circular.progress.bootstrap.css.js';
import { styles as fluentDark } from './dark/circular.progress.fluent.css.js';
import { styles as indigoDark } from './dark/circular.progress.indigo.css.js';

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
