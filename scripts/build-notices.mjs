import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import getArgs from './get-args.mjs';
import { log, logError } from './logger.mjs';

const CATEGORY = 'notices';
const OUTPUT_FILE = 'THIRD-PARTY-NOTICES.md';
const LICENSE_FILE_PATTERN = /^(licen[cs]e|copying|notice)(?![a-z])/i;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const nodeModules = path.join(repoRoot, 'node_modules');

/**
 * Reviewed license texts for packages that declare a license but ship no
 * license file. One file per package, named after the package with `/`
 * replaced by `__`, copied verbatim from the package's source repository.
 */
const overridesDir = path.join(scriptDir, 'license-overrides');

/**
 * @param {string} file - Path to a JSON file.
 * @returns {any} Parsed content.
 */
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Read a package manifest by path. Several dependencies hide `package.json`
 * behind an exports map, so module resolution cannot be used here.
 * @param {string} name - Package name.
 * @returns {any} The installed manifest.
 */
function readInstalledManifest(name) {
  const manifest = path.join(nodeModules, name, 'package.json');

  if (!fs.existsSync(manifest)) {
    throw new Error(
      `${name} is not installed under node_modules. Run "npm ci" first.`
    );
  }

  return readJson(manifest);
}

/**
 * @param {any} manifest - Installed package manifest.
 * @returns {string} Repository or homepage URL, browsable where possible.
 */
function sourceUrl(manifest) {
  const repository =
    typeof manifest.repository === 'string'
      ? manifest.repository
      : manifest.repository?.url;

  if (!repository) {
    return manifest.homepage ?? '';
  }

  return repository
    .replace(/^git\+/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^ssh:\/\/git@/, 'https://')
    .replace(/\.git$/, '');
}

/**
 * @param {any} manifest - Installed package manifest.
 * @returns {string} SPDX expression, or the legacy `licenses` array joined.
 */
function licenseExpression(manifest) {
  if (typeof manifest.license === 'string') {
    return manifest.license;
  }
  if (manifest.license?.type) {
    return manifest.license.type;
  }
  if (Array.isArray(manifest.licenses)) {
    return manifest.licenses.map((entry) => entry.type ?? entry).join(' OR ');
  }
  return 'UNKNOWN';
}

/**
 * Every license-like file shipped at the package root, in a stable order.
 * Falls back to the reviewed override when the package ships none.
 * @param {string} name - Package name.
 * @returns {{ name: string, text: string, override: boolean }[]} License texts.
 */
function licenseFiles(name) {
  const dir = path.join(nodeModules, name);
  const files = fs
    .readdirSync(dir)
    .filter((entry) => LICENSE_FILE_PATTERN.test(entry))
    .sort()
    .map((entry) => ({
      name: entry,
      text: fs.readFileSync(path.join(dir, entry), 'utf8').trim(),
      override: false,
    }));

  if (files.length > 0) {
    return files;
  }

  const override = path.join(overridesDir, name.replaceAll('/', '__'));

  if (!fs.existsSync(override)) {
    throw new Error(
      `${name} ships no license file and no reviewed copy exists at ${path.relative(repoRoot, override)}. ` +
        'Copy the license text from the package repository into that file.'
    );
  }

  log(CATEGORY, `${name} ships no license file; using the reviewed copy`);

  return [
    {
      name: 'LICENSE',
      text: fs.readFileSync(override, 'utf8').trim(),
      override: true,
    },
  ];
}

/**
 * @param {string} name - Package name.
 * @param {string} range - Declared version range.
 * @param {'dependency' | 'peer dependency' | 'optional peer dependency'} kind - Relationship.
 * @returns {object} Notice entry.
 */
function collect(name, range, kind) {
  const manifest = readInstalledManifest(name);

  return {
    name,
    range,
    kind,
    license: licenseExpression(manifest),
    url: sourceUrl(manifest),
    files: licenseFiles(name),
  };
}

/**
 * @param {object[]} entries - Collected notice entries.
 * @returns {string} The rendered Markdown document.
 */
function render(entries) {
  const lines = [
    '# Third-party notices',
    '',
    'Ignite UI for Web Components is released under the [MIT License](LICENSE). This file lists the',
    'third-party packages the published `igniteui-webcomponents` package depends on at runtime, together',
    'with their license terms, so that anyone redistributing an application built with this library can',
    'meet the attribution requirements of those licenses.',
    '',
    'Only direct runtime dependencies and peer dependencies are listed. They are not bundled',
    'into this package; a consuming application resolves them from npm. The full transitive dependency',
    'closure, with license identifiers for every package, is recorded in the CycloneDX SBOM attached to',
    'each [GitHub release](https://github.com/IgniteUI/igniteui-webcomponents/releases).',
    '',
    'This file is generated by `npm run build:notices` from the installed packages. Do not edit it by',
    'hand; regenerate it when a dependency is added, removed or relicensed.',
    '',
    '## Summary',
    '',
    '| Package | Version range | Relationship | License | Source |',
    '| --- | --- | --- | --- | --- |',
    ...entries.map(
      (entry) =>
        `| \`${entry.name}\` | \`${entry.range}\` | ${entry.kind} | ${entry.license} | ${entry.url ? `<${entry.url}>` : ''} |`
    ),
    '',
    '## License texts',
    '',
  ];

  for (const entry of entries) {
    lines.push(`### ${entry.name}`, '');
    lines.push(`- License: ${entry.license}`);
    if (entry.url) {
      lines.push(`- Source: <${entry.url}>`);
    }
    lines.push('');

    for (const file of entry.files) {
      if (file.override) {
        lines.push(
          `The package ships no license file. Its manifest declares \`${entry.license}\`; the text below is reproduced from the source repository.`,
          ''
        );
      }
      if (entry.files.length > 1) {
        lines.push(`#### ${file.name}`, '');
      }
      lines.push('```text', file.text, '```', '');
    }
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

const args = getArgs();
const output = path.join(repoRoot, OUTPUT_FILE);

try {
  // The published manifest, not the repository one: it declares what consumers resolve.
  const manifest = readJson(path.join(scriptDir, '_package.json'));
  const entries = [
    ...Object.entries(manifest.dependencies ?? {}).map(([name, range]) =>
      collect(name, range, 'dependency')
    ),
    ...Object.entries(manifest.peerDependencies ?? {}).map(([name, range]) =>
      collect(
        name,
        range,
        manifest.peerDependenciesMeta?.[name]?.optional
          ? 'optional peer dependency'
          : 'peer dependency'
      )
    ),
  ].sort((left, right) => left.name.localeCompare(right.name));

  const rendered = render(entries);

  if (args.check) {
    const current = fs.existsSync(output)
      ? fs.readFileSync(output, 'utf8')
      : '';

    if (current !== rendered) {
      throw new Error(
        `${OUTPUT_FILE} is out of date. Run "npm run build:notices" and commit the result.`
      );
    }

    log(CATEGORY, `${OUTPUT_FILE} is up to date (${entries.length} packages)`);
  } else {
    fs.writeFileSync(output, rendered);
    log(CATEGORY, `wrote ${OUTPUT_FILE} (${entries.length} packages)`);
  }
} catch (error) {
  logError(CATEGORY, 'third-party notices generation failed', error);
  process.exitCode = 1;
}
