import { readFile, writeFile } from 'node:fs/promises';
import { parser } from 'keep-a-changelog';
import report from './report.mjs';

async function createChangelog() {
  if (process.argv.length < 3) {
    report.error(
      '`version` argument is missing from the invocation.\nMake sure to pass it:'
    );
    report.error('\tnpm run release -- <target-version>');
    process.exit(1);
  }

  const version = process.argv[2];
  const changelog = parser(await readFile('./CHANGELOG.md', 'utf8'));
  const lastRelease = changelog.releases.at(0);

  changelog.tagNameBuilder = (release) => `${release.version}`;
  lastRelease.setVersion(version);
  lastRelease.setDate(new Date(Date.now()));

  await writeFile('./CHANGELOG.md', changelog.toString(), { encoding: 'utf8' });
  report.success('Changelog updated');
  process.exit(0);
}

await createChangelog();
