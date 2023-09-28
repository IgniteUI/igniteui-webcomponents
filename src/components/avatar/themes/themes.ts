import { css } from 'lit';
import { Themes } from '../../../theming/types.js';

// Shared Styles
import { styles as material } from './shared/avatar.material.css.js';
import { styles as bootstrap } from './shared/avatar.bootstrap.css.js';
import { styles as fluent } from './shared/avatar.fluent.css.js';
import { styles as indigo } from './shared/avatar.indigo.css.js';

// Light Overrides
import { styles as materialLight } from './light/avatar.material.css.js';
import { styles as bootstrapLight } from './light/avatar.bootstrap.css.js';
import { styles as fluentLight } from './light/avatar.fluent.css.js';
import { styles as indigoLight } from './light/avatar.indigo.css.js';

// Dark Overrides
import { styles as materialDark } from './dark/avatar.material.css.js';
import { styles as bootstrapDark } from './dark/avatar.bootstrap.css.js';
import { styles as fluentDark } from './dark/avatar.fluent.css.js';
import { styles as indigoDark } from './dark/avatar.indigo.css.js';

export const paint: Themes = {
  light: {
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
  },
  dark: {
    bootstrap: css`
      ${bootstrapDark} ${bootstrap}
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
  },
};
