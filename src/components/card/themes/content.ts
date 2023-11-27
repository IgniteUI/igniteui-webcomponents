import { css } from 'lit';

// Light Overrides
import { styles as bootstrapLight } from './light/content/card.content.bootstrap.css.js';
import { styles as fluentLight } from './light/content/card.content.fluent.css.js';
import { styles as indigoLight } from './light/content/card.content.indigo.css.js';
import { styles as materialLight } from './light/content/card.content.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/content/card.content.bootstrap.css.js';
import { styles as shared } from './shared/content/card.content.common.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigoLight}
  `,
};

export const all: Themes = { light, dark };
