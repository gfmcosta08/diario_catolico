#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const inputPath = process.argv[2];
if (!inputPath) {
  fail('Uso: node ./scripts/import-licensed-bible.js <caminho-do-json>');
}

const resolvedInput = path.resolve(process.cwd(), inputPath);
if (!fs.existsSync(resolvedInput)) {
  fail(`Arquivo nao encontrado: ${resolvedInput}`);
}

const raw = fs.readFileSync(resolvedInput, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (error) {
  fail(`JSON invalido: ${error.message}`);
}

if (!data || typeof data !== 'object') {
  fail('Formato invalido: objeto raiz esperado.');
}

if (!Array.isArray(data.days) || data.days.length !== 365) {
  fail('Formato invalido: "days" deve ter exatamente 365 itens.');
}

const map = {};
for (const item of data.days) {
  if (!Number.isInteger(item.day) || item.day < 1 || item.day > 365) {
    fail(`Dia invalido encontrado: ${JSON.stringify(item)}`);
  }
  if (typeof item.body !== 'string' || item.body.trim().length === 0) {
    fail(`Texto vazio no dia ${item.day}.`);
  }
  map[item.day] = item.body.trim();
}

for (let i = 1; i <= 365; i += 1) {
  if (!map[i]) {
    fail(`Dia ${i} ausente no JSON.`);
  }
}

const source = {
  translation: String(data.translation || 'Catolica Apostolica Romana (licenciada)'),
  license: String(data.license || 'Licenca privada'),
  importedAt: new Date().toISOString(),
};

const output = `export const LICENSED_BIBLE_SOURCE = ${JSON.stringify(source, null, 2)} as const;\n\nexport const READING_PLAN_BODY_DATA: Record<number, string> = ${JSON.stringify(map, null, 2)} as const;\n`;

const outPath = path.join(root, 'data', 'readingPlanBodyData.ts');
fs.writeFileSync(outPath, output, 'utf8');

console.log(`OK: arquivo gerado em ${outPath}`);
console.log(`Fonte: ${source.translation}`);
console.log(`Licenca: ${source.license}`);
