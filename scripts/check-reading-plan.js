const fs = require('node:fs');
const path = require('node:path');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data', 'readingPlanData.ts');
const planPath = path.join(root, 'data', 'readingPlan.ts');

const dataRaw = fs.readFileSync(dataPath, 'utf8');
const planRaw = fs.readFileSync(planPath, 'utf8');

const match = dataRaw.match(/READING_PLAN_DATA:[^=]*=\s*(\[[\s\S]*\])\s*as const;/);
if (!match) {
  fail('Não foi possível extrair READING_PLAN_DATA do arquivo TypeScript.');
}

let days;
try {
  days = JSON.parse(match[1]);
} catch (error) {
  fail(`Falha ao converter READING_PLAN_DATA para JSON: ${error.message}`);
}

if (days.length !== 365) {
  fail(`Plano deve ter 365 dias, mas possui ${days.length}.`);
}

for (let i = 0; i < 365; i += 1) {
  const expected = i + 1;
  if (days[i].day !== expected) {
    fail(`Sequência de dias inválida no índice ${i}: esperado ${expected}, recebido ${days[i].day}.`);
  }
  if (!Array.isArray(days[i].references) || days[i].references.length === 0) {
    fail(`Dia ${expected} sem referências.`);
  }
}

if (!days[0].references.includes('Gênesis 1-2')) {
  fail('Dia 1 não contém a referência esperada: "Gênesis 1-2".');
}

if (!days[364].references.includes('Apocalipse 22')) {
  fail('Dia 365 não contém a referência esperada: "Apocalipse 22".');
}

const hasClampRule = /Math\.min\(365,\s*Math\.max\(1,\s*day\)\)/.test(planRaw);
if (!hasClampRule) {
  fail('getReadingPlanDay não está aplicando clamp de 1..365 conforme esperado.');
}

console.log('OK: validações do plano bíblico passaram (365 dias, dia 1, dia 365 e clamp 1..365).');
