import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/qr-code.bootstrap.css.js';
import { styles as fluentDark } from './dark/qr-code.fluent.css.js';
import { styles as indigoDark } from './dark/qr-code.indigo.css.js';
import { styles as materialDark } from './dark/qr-code.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/qr-code.bootstrap.css.js';
import { styles as fluentLight } from './light/qr-code.fluent.css.js';
import { styles as indigoLight } from './light/qr-code.indigo.css.js';
import { styles as materialLight } from './light/qr-code.material.css.js';
import { styles as shared } from './light/qr-code.shared.css.js';

const light = {
  shared,
  material: materialLight,
  bootstrap: bootstrapLight,
  fluent: fluentLight,
  indigo: indigoLight,
};

const dark = {
  shared,
  material: [materialLight, materialDark],
  bootstrap: [bootstrapLight, bootstrapDark],
  fluent: [fluentLight, fluentDark],
  indigo: [indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };
