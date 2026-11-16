/**
 * Merges the coverage of the CI test shards into `coverage/lcov.info`, as one test run
 * merges the coverage of its test files.
 *
 * Usage: node scripts/merge-coverage.mjs <coverage-final.json>...
 *
 * V8 reports only the blocks of the functions that a run calls. Thus, each shard gives
 * other branch numbers to a file that the shards share, and an upload of each shard to
 * Coveralls counts these branches more than once.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
// web-test-runner does not export these modules.
const dist = path.dirname(require.resolve('@web/test-runner-core'));
const { getTestCoverage } = require(
  path.join(dist, 'coverage/getTestCoverage.js')
);
const { writeCoverageReport } = require(
  path.join(dist, 'cli/writeCoverageReport.js')
);

const files = process.argv.slice(2);

if (!files.length) {
  throw new Error('Give the coverage-final.json file of each shard.');
}

const sessions = files.map((file) => ({
  testCoverage: JSON.parse(readFileSync(file, 'utf8')),
}));

writeCoverageReport(getTestCoverage(sessions), {
  reportDir: 'coverage',
  reporters: ['lcov'],
});
