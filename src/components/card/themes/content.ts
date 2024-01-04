import { css } from 'lit';

// Light Overrides
import { styles as bootstrapLight } from './light/content/card.content.bootstrap.css.js';
import { styles as fluentLight } from './light/content/card.content.fluent.css.js';
import { styles as indigoLight } from './light/content/card.content.indigo.css.js';
import { styles as materialLight } from './light/content/card.content.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/content/card.content.bootstrap.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
  `,
};

export const all: Themes = { light, dark };
