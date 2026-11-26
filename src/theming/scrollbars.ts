import type { CSSResult } from 'lit';

import { styles as bootstrapDark } from '../styles/common/scrollbar/dark/bootstrap.css.js';
import { styles as fluentDark } from '../styles/common/scrollbar/dark/fluent.css.js';
import { styles as indigoDark } from '../styles/common/scrollbar/dark/indigo.css.js';
import { styles as materialDark } from '../styles/common/scrollbar/dark/material.css.js';
import { styles as bootstrapLight } from '../styles/common/scrollbar/light/bootstrap.css.js';
import { styles as fluentLight } from '../styles/common/scrollbar/light/fluent.css.js';
import { styles as indigoLight } from '../styles/common/scrollbar/light/indigo.css.js';
import { styles as materialLight } from '../styles/common/scrollbar/light/material.css.js';
import type { Theme, ThemeVariant } from './types.js';

/** The scrollbar tokens and properties of each theme, scoped to `:host`. */
export const scrollbars: Record<ThemeVariant, Record<Theme, CSSResult>> = {
  light: {
    bootstrap: bootstrapLight,
    fluent: fluentLight,
    indigo: indigoLight,
    material: materialLight,
  },
  dark: {
    bootstrap: bootstrapDark,
    fluent: fluentDark,
    indigo: indigoDark,
    material: materialDark,
  },
};
