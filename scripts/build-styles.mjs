import { buildComponents, buildThemes } from './sass.mjs';

await Promise.all([buildThemes(), buildComponents()]);
