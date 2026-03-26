#!/usr/bin/env node
/**
 * check-duplicates.mjs
 *
 * Scans a trivia JSON file for exact and same-answer duplicate questions,
 * then writes a markdown summary file.
 *
 * Usage:
 *   node scripts/check-duplicates.mjs <file.json> [output.md]
 *
 * If output path is omitted, it defaults to context/<basename>-duplicates.md
 */

import fs from 'fs';
import path from 'path';

const [, , inputArg, outputArg] = process.argv;

if (!inputArg) {
  console.error('Usage: node scripts/check-duplicates.mjs <file.json> [output.md]');
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const basename = path.basename(inputPath, '.json');

const outputPath = outputArg
  ? path.resolve(outputArg)
  : path.resolve('docs', 'duplicates', `${basename}-duplicates.md`);

// ---------------------------------------------------------------------------
// Load & normalise
// ---------------------------------------------------------------------------

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

/**
 * Normalise to a flat array of { index, category, question, answer }.
 * Handles two schemas:
 *   - card game format:     { questions: [{ category, question, answer }] }
 *   - snapshot format:      { questions: [{ question, correctAnswer, incorrectAnswers[], category }] }
 */
function normalise(data) {
  const arr = data.questions ?? data;
  if (!Array.isArray(arr)) throw new Error('Cannot find questions array in file.');

  return arr.map((q, i) => ({
    index: i,
    category: q.category ?? 'Unknown',
    question: q.question,
    answer: q.answer ?? q.correctAnswer,
  }));
}

const questions = normalise(raw);

// ---------------------------------------------------------------------------
// Find exact duplicates (same question text + same answer, case-insensitive)
// ---------------------------------------------------------------------------

const seenExact = new Map();
const exactDuplicates = []; // { original, duplicate }

for (const q of questions) {
  const key = `${q.question.toLowerCase().trim()}|||${q.answer.toLowerCase().trim()}`;
  if (seenExact.has(key)) {
    exactDuplicates.push({ original: seenExact.get(key), duplicate: q });
  } else {
    seenExact.set(key, q);
  }
}

// ---------------------------------------------------------------------------
// Build markdown report
// ---------------------------------------------------------------------------

const lines = [];

lines.push(`# Duplicate Report: ${basename}.json`);
lines.push('');
lines.push(`**File:** \`${inputPath}\`  `);
lines.push(`**Total questions:** ${questions.length}  `);
lines.push(`**Exact duplicates:** ${exactDuplicates.length}`);
lines.push('');
lines.push('---');
lines.push('');

// --- Exact duplicates section ---
lines.push('## Exact Duplicates');
lines.push('');
lines.push('These questions have identical text and answer. Safe to remove the duplicate index.');
lines.push('');

if (exactDuplicates.length === 0) {
  lines.push('_None found._');
} else {
  for (const { original, duplicate } of exactDuplicates) {
    lines.push(`### [${original.index}] vs [${duplicate.index}]`);
    lines.push('');
    lines.push(`- **Category:** ${original.category}`);
    lines.push(`- **Question:** ${original.question}`);
    lines.push(`- **Answer:** ${original.answer}`);
    lines.push(`- **Keep index:** ${original.index} — **Remove index:** ${duplicate.index}`);
    lines.push('');
  }
}

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join('\n'));

console.log(`Checked ${questions.length} questions in ${path.basename(inputPath)}`);
console.log(`  Exact duplicates:    ${exactDuplicates.length}`);
console.log(`  Report written to:   ${outputPath}`);
