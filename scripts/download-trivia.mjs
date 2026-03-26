#!/usr/bin/env node
/**
 * Downloads trivia questions from OpenTDB and The Trivia API and saves
 * them as local JSON snapshots in public/data/.
 *
 * Usage:
 *   node scripts/download-trivia.mjs [--provider opentdb|triviaapi|all]
 *
 * Output:
 *   public/data/opentdb_snapshot.json
 *   public/data/triviaapi_snapshot.json
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import he from 'he';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'data');

// --- helpers ----------------------------------------------------------------

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchJSON(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'trivia-app-snapshot/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`  Retry ${attempt}/${retries - 1} for ${url}: ${err.message}`);
      await sleep(5000 * attempt);
    }
  }
}

function dedup(questions) {
  const seen = new Set();
  return questions.filter(q => {
    if (seen.has(q.question)) return false;
    seen.add(q.question);
    return true;
  });
}

function saveSnapshot(filename, provider, questions) {
  mkdirSync(OUT_DIR, { recursive: true });
  const out = {
    provider,
    downloadedAt: new Date().toISOString(),
    count: questions.length,
    questions,
  };
  writeFileSync(join(OUT_DIR, filename), JSON.stringify(out, null, 2));
  console.log(`  Saved ${questions.length} questions to public/data/${filename}`);
}

// --- OpenTDB ----------------------------------------------------------------

async function downloadOpenTDB() {
  console.log('\nDownloading OpenTDB...');

  // Fetch all categories
  const catData = await fetchJSON('https://opentdb.com/api_category.php');
  const categories = catData.trivia_categories;
  console.log(`  ${categories.length} categories found`);

  // Filtering by difficulty+type simultaneously triggers code 4 for many categories
  // even when questions exist. Use no filters and a fresh token per category instead,
  // paginating until the token is exhausted (all questions returned).
  const all = [];
  let reqCount = 0;

  for (const cat of categories) {
    // Fresh token for each category — gives a clean slate to paginate through all questions
    await sleep(2500);
    let token;
    try {
      const tokenData = await fetchJSON('https://opentdb.com/api_token.php?command=request');
      token = tokenData.token;
    } catch (err) {
      console.warn(`\n  Skipped token request for ${cat.name}: ${err.message}`);
      continue;
    }

    // Paginate until exhausted (code 4), no results (code 1),
    // or app-level rate limit (code 5 — back off and retry).
    while (true) {
      await sleep(2500);
      try {
        const url = `https://opentdb.com/api.php?amount=50&category=${cat.id}&token=${token}`;
        const data = await fetchJSON(url);
        if (data.response_code === 5) {
          await sleep(10000);
          continue;
        }
        if (data.response_code === 4 || data.response_code === 1) break;
        if (data.response_code === 0 && Array.isArray(data.results) && data.results.length > 0) {
          const mapped = data.results.map(q => ({
            question: he.decode(q.question),
            correctAnswer: he.decode(q.correct_answer),
            incorrectAnswers: q.incorrect_answers.map(a => he.decode(a)),
            category: q.category,
            difficulty: q.difficulty,
            type: q.type,
          }));
          all.push(...mapped);
          process.stdout.write(`  [${++reqCount}] ${cat.name}: +${mapped.length} (total ${all.length})\r`);
          if (data.results.length < 50) break; // fewer than requested = exhausted
        } else {
          break;
        }
      } catch (err) {
        console.warn(`\n  Skipped ${cat.name}: ${err.message}`);
        break;
      }
    }
  }

  process.stdout.write('\n');
  const unique = dedup(all);
  console.log(`  Deduplicated: ${all.length} → ${unique.length}`);
  saveSnapshot('opentdb_snapshot.json', 'opentdb', unique);
}

// --- The Trivia API ---------------------------------------------------------

async function downloadTriviaAPI() {
  console.log('\nDownloading The Trivia API...');

  const categories = [
    'arts_and_literature',
    'film_and_tv',
    'food_and_drink',
    'general_knowledge',
    'geography',
    'history',
    'music',
    'science',
    'society_and_culture',
    'sport_and_leisure',
  ];
  const difficulties = ['easy', 'medium', 'hard'];
  const all = [];
  let reqCount = 0;

  for (const cat of categories) {
    for (const diff of difficulties) {
      const url = `https://the-trivia-api.com/v2/questions?limit=50&categories=${cat}&difficulties=${diff}`;
      await sleep(800);
      try {
        const data = await fetchJSON(url);
        if (Array.isArray(data)) {
          const mapped = data.map(q => ({
            question: q.question.text,
            correctAnswer: q.correctAnswer,
            incorrectAnswers: q.incorrectAnswers,
            category: q.category,
            difficulty: q.difficulty,
            type: 'multiple',
          }));
          all.push(...mapped);
          process.stdout.write(`  [${++reqCount}] ${cat} / ${diff}: ${mapped.length} Qs (total ${all.length})\r`);
        }
      } catch (err) {
        console.warn(`\n  Skipped ${cat}/${diff}: ${err.message}`);
      }
    }
  }

  process.stdout.write('\n');
  const unique = dedup(all);
  console.log(`  Deduplicated: ${all.length} → ${unique.length}`);
  saveSnapshot('triviaapi_snapshot.json', 'triviaapi', unique);
}

// --- main -------------------------------------------------------------------

const args = process.argv.slice(2);
const providerArg = args.includes('--provider') ? args[args.indexOf('--provider') + 1] : 'all';

if (!['opentdb', 'triviaapi', 'all'].includes(providerArg)) {
  console.error(`Unknown provider: ${providerArg}. Use opentdb, triviaapi, or all.`);
  process.exit(1);
}

console.log(`Trivia snapshot downloader — provider: ${providerArg}`);
console.log('This will take several minutes due to API rate limiting.\n');

try {
  if (providerArg === 'opentdb' || providerArg === 'all') await downloadOpenTDB();
  if (providerArg === 'triviaapi' || providerArg === 'all') await downloadTriviaAPI();
  console.log('\nDone.');
} catch (err) {
  console.error('\nFatal error:', err.message);
  process.exit(1);
}
