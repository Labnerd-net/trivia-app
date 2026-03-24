#!/usr/bin/env node
/* global process */
/**
 * Merges card JSON files from context/input/<provider>/ into public/data/<provider>.json
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
const inputDir = join(root, 'input', provider);
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

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(inputDir, file), 'utf8'));
  for (const q of raw.questions ?? []) {
    questions.push({
      category: q.category,
      question: q.question,
      answer: q.answer,
    });
  }
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, JSON.stringify({ questions }, null, 2));

console.log(`Wrote ${questions.length} questions to ${outputFile}`);
