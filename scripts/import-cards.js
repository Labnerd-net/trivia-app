#!/usr/bin/env node
/* global process */
/**
 * Merges card JSON files from context/input/<provider>/ into public/data/<provider>.json
 * Also updates question counts in public/data/README.md and src/api/adapters/localProviders.ts.
 *
 * Usage:
 *   node scripts/import-cards.js <provider>
 *   node scripts/import-cards.js all_of_us
 *
 * Each input file is expected to have a `questions` array where each question has:
 *   { category, question, answer, color (ignored) }
 *
 * Output: public/data/<provider>.json
 *   { "questions": [{ category, question, answer }] }
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const provider = process.argv[2];
if (!provider) {
  console.error('Usage: node scripts/import-cards.js <provider>');
  process.exit(1);
}

const root = resolve(import.meta.dirname, '..');
const inputDir = join(root, 'scans', 'processed_scans', provider);
const outputDir = join(root, 'public', 'data');
const outputFile = join(outputDir, `${provider}.json`);

let files;
try {
  files = readdirSync(inputDir).filter(f => f.endsWith('.json'));
} catch {
  console.error(`Input directory not found: ${inputDir}`);
  process.exit(1);
}

const questions = [];
const seen = new Set();
let skipped = 0;

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(inputDir, file), 'utf8'));
  for (const q of raw.questions ?? []) {
    const key = JSON.stringify([q.category, q.question, q.answer]);
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);
    questions.push({
      category: q.category,
      question: q.question,
      answer: q.answer,
    });
  }
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, JSON.stringify({ questions }, null, 2));
console.log(`Wrote ${questions.length} questions to ${outputFile}` + (skipped ? ` (skipped ${skipped} exact duplicates)` : ''));

const count = questions.length;
const formatted = count.toLocaleString('en-US');

// Update README.md count
const readmePath = join(outputDir, 'README.md');
try {
  const readme = readFileSync(readmePath, 'utf8');
  const readmeRe = new RegExp('(`' + provider + '\\.json`[^|]*\\|[^|]*\\|\\s*)([\\d,]+)(\\s*\\|)');
  const match = readme.match(readmeRe);
  if (!match) {
    console.warn(`  Warning: count not found for ${provider} in README.md`);
  } else if (match[2] === formatted) {
    console.log(`  README.md already up to date`);
  } else {
    writeFileSync(readmePath, readme.replace(readmeRe, `$1${formatted}$3`));
    console.log(`  Updated README.md: ${provider} → ${formatted} questions`);
  }
} catch {
  console.warn(`  Warning: could not update README.md`);
}

// Update localProviders.ts count
const providersPath = join(root, 'src', 'api', 'adapters', 'localProviders.ts');
try {
  const src = readFileSync(providersPath, 'utf8');
  const fileRef = `/data/${provider}.json`;
  const idx = src.indexOf(fileRef);
  if (idx === -1) {
    console.warn(`  Warning: ${fileRef} not found in localProviders.ts`);
  } else {
    const windowStart = Math.max(0, idx - 400);
    const before = src.slice(windowStart, idx);
    // Use the nearest count before the file ref (the window may span the previous provider).
    const matches = [...before.matchAll(/([\d,]+) questions/g)];
    const match = matches[matches.length - 1];
    if (!match) {
      console.warn(`  Warning: count pattern not found near ${fileRef} in localProviders.ts`);
    } else if (match[1] === formatted) {
      console.log(`  localProviders.ts already up to date`);
    } else {
      const newBefore =
        before.slice(0, match.index) + `${formatted} questions` + before.slice(match.index + match[0].length);
      writeFileSync(providersPath, src.slice(0, windowStart) + newBefore + src.slice(idx));
      console.log(`  Updated localProviders.ts: ${provider} → ${formatted} questions`);
    }
  }
} catch {
  console.warn(`  Warning: could not update localProviders.ts`);
}
