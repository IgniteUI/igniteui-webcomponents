import report from './report.mjs';
import { buildAll } from './sass.mjs';

await buildAll().catch((err) => {
  report.error(err.message ?? err.toString());
  process.exit(1);
});
