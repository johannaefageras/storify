#!/usr/bin/env node
/**
 * Lists all jomoji IDs from the Jomojis folder.
 * Run with: node scripts/list-jomoji-ids.js
 *
 * This helps you see which IDs need to be added to jomojiMeanings.json
 */

import { readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jomojiDir = join(__dirname, '..', 'Jomojis');

if (!existsSync(jomojiDir)) {
  console.error('Jomojis folder not found at:', jomojiDir);
  process.exit(1);
}

const categories = readdirSync(jomojiDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let totalCount = 0;
const allIds = [];

console.log('='.repeat(60));
console.log('JOMOJI IDS BY CATEGORY');
console.log('='.repeat(60));
console.log('');

for (const category of categories) {
  const categoryPath = join(jomojiDir, category);
  const files = readdirSync(categoryPath)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''));

  console.log(`## ${category} (${files.length} emojis)`);
  console.log('-'.repeat(40));

  for (const id of files) {
    console.log(`  "${id}"`);
    allIds.push({ id, category });
  }

  totalCount += files.length;
  console.log('');
}

console.log('='.repeat(60));
console.log(`TOTAL: ${totalCount} emojis`);
console.log('='.repeat(60));
console.log('');
console.log('JSON template for jomojiMeanings.json:');
console.log('-'.repeat(40));
console.log('{');

for (let i = 0; i < allIds.length; i++) {
  const { id, category } = allIds[i];
  const name = id
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const comma = i < allIds.length - 1 ? ',' : '';
  console.log(`  "${id}": {`);
  console.log(`    "name": "${name}",`);
  console.log(`    "meaning": "TODO: Beskriv vad denna emoji betyder om användarens dag/känslor"`);
  console.log(`  }${comma}`);
}

console.log('}');
