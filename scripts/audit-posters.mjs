/**
 * Audits poster availability for everything the home feed shows, separating OMDb data gaps
 * from problems on our side (the URL resizing in getPosterUri).
 *
 *   npm run audit:posters
 *
 * For every title it records OMDb's raw `Poster` value, then requests the original URL and
 * the resized URLs the app actually loads. Uses the real feed config and poster helper.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { homeFeed } from '../src/features/home/config/feed.ts';
import { getPosterUri } from '../src/features/movies/utils/poster.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES_PER_ROW = 2;
const SIZES = ['thumb', 'card', 'hero'];

async function loadEnv() {
  const text = await readFile(path.join(ROOT, '.env'), 'utf8');
  return Object.fromEntries(
    text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('='))
      .map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
  );
}

const env = await loadEnv().catch(() => ({}));
if (!env.OMDB_API_KEY) {
  console.error('OMDB_API_KEY is missing. Copy .env.example to .env and set your key.');
  process.exit(1);
}
const BASE_URL = env.OMDB_BASE_URL || 'https://www.omdbapi.com';

async function omdb(params) {
  const url = new URL(BASE_URL);
  for (const [key, value] of Object.entries({ ...params, apikey: env.OMDB_API_KEY })) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const response = await fetch(url);
  return response.json();
}

/** HTTP status of an image URL, or the network error name. */
async function imageStatus(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.status;
  } catch (error) {
    return error.cause?.code ?? error.name;
  }
}

async function collectTitles() {
  const titles = new Map();
  for (const row of homeFeed.rows) {
    for (let page = 1; page <= PAGES_PER_ROW; page++) {
      const body = await omdb({ s: row.query.query, type: row.query.type, page });
      if (body.Response !== 'True') {
        // Running out of pages is expected; failing on the first one means the audit is invalid.
        if (page === 1) throw new Error(`Search "${row.query.query}" failed: ${body.Error}`);
        break;
      }
      for (const item of body.Search) {
        if (!titles.has(item.imdbID)) titles.set(item.imdbID, { ...item, row: row.title });
      }
    }
  }
  for (const id of homeFeed.featuredIds) {
    const body = await omdb({ i: id });
    if (body.Response !== 'True') throw new Error(`Lookup ${id} failed: ${body.Error}`);
    titles.set(id, { ...body, row: 'Hero' });
  }
  return [...titles.values()];
}

async function classify(title) {
  const raw = title.Poster;
  if (!raw || raw === 'N/A') return { verdict: 'omdb-no-poster', raw };

  const original = await imageStatus(raw);
  const resized = {};
  for (const size of SIZES) resized[size] = await imageStatus(getPosterUri(raw, size));
  const resizedOk = SIZES.every(size => resized[size] === 200);

  if (resizedOk) return { verdict: 'ok', raw, original, resized };
  if ([original, ...Object.values(resized)].some(status => typeof status !== 'number')) {
    return { verdict: 'network-error', raw, original, resized };
  }
  // PosterImage retries OMDb's original URL when a resized one fails.
  if (original === 200) return { verdict: 'ok-via-original', raw, original, resized };
  return { verdict: 'omdb-broken-url', raw, original, resized };
}

const titles = await collectTitles();
const results = [];
for (const title of titles) results.push({ title, ...(await classify(title)) });

const counts = results.reduce((acc, { verdict }) => ({ ...acc, [verdict]: (acc[verdict] ?? 0) + 1 }), {});
console.log(`\nAudited ${results.length} unique titles from ${homeFeed.rows.length} rows + hero\n`);
console.table(counts);

const problems = results.filter(result => result.verdict !== 'ok');
if (problems.length) {
  console.log('\nTitles that need a fallback (original URL or titled tile):\n');
  console.table(
    problems.map(({ title, verdict, raw, original, resized }) => ({
      row: title.row,
      title: `${title.Title} (${title.Year})`,
      id: title.imdbID,
      verdict,
      omdbPoster: raw === 'N/A' || !raw ? raw ?? '(missing)' : `${raw.slice(0, 48)}…`,
      original: original ?? '-',
      resized: resized ? SIZES.map(size => resized[size]).join('/') : '-',
    })),
  );
}

const countOf = verdict => results.filter(result => result.verdict === verdict).length;
if (countOf('network-error')) {
  console.log(`\n⚠️  ${countOf('network-error')} title(s) hit network errors, so the audit is inconclusive. Re-run it.`);
  process.exitCode = 1;
} else {
  const recovered = countOf('ok-via-original');
  console.log(
    `\n✅ Every missing image is missing or broken at OMDb.` +
      (recovered ? ` ${recovered} poster(s) only load at OMDb's original size; the app falls back to it.` : ''),
  );
}
