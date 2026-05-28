import { buildAll } from './sass.mjs';
import report from './report.mjs';

await buildAll().catch((err) => {
  report.error(err.message ?? err.toString());
  process.exit(1);
});
