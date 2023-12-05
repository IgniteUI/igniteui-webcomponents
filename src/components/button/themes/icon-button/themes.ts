import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/icon-button.bootstrap.css.js';
import { styles as fluentDark } from './dark/icon-button.fluent.css.js';
import { styles as indigoDark } from './dark/icon-button.indigo.css.js';
import { styles as materialDark } from './dark/icon-button.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/icon-button.bootstrap.css.js';
import { styles as fluentLight } from './light/icon-button.fluent.css.js';
import { styles as indigoLight } from './light/icon-button.indigo.css.js';
import { styles as materialLight } from './light/icon-button.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/icon-button.bootstrap.css.js';
import { styles as shared } from './shared/icon-button.common.css.js';
import { styles as fluent } from './shared/icon-button.fluent.css.js';
import { styles as indigo } from './shared/icon-button.indigo.css.js';
import { styles as material } from './shared/icon-button.material.css.js';
import { Themes } from '../../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${material} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigo} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${shared} ${material} ${materialDark}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };
