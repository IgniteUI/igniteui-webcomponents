import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/circular.progress.bootstrap.css.js';
import { styles as fluentDark } from './dark/circular.progress.fluent.css.js';
import { styles as indigoDark } from './dark/circular.progress.indigo.css.js';
import { styles as materialDark } from './dark/circular.progress.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/circular.progress.bootstrap.css.js';
import { styles as fluentLight } from './light/circular.progress.fluent.css.js';
import { styles as indigoLight } from './light/circular.progress.indigo.css.js';
import { styles as materialLight } from './light/circular.progress.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/circular.progress.bootstrap.css.js';
import { styles as shared } from './shared/circular.progress.common.css.js';
import { styles as fluent } from './shared/circular.progress.fluent.css.js';
import { Themes } from '../../../../theming/types.js';

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
