// Tarkistaa, että src/data/words.json on oikeassa muodossa.
// Ajetaan automaattisesti GitHubissa ennen julkaisua, ja sen voi ajaa myös käsin:
//   node scripts/validate-words.mjs

import { readFileSync } from "node:fs";

const FILE = new URL("../src/data/words.json", import.meta.url);
const errors = [];

let data;
try {
  data = JSON.parse(readFileSync(FILE, "utf8"));
} catch (error) {
  console.error(`words.json ei ole kelvollista JSONia: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(data.lists) || data.lists.length === 0) {
  errors.push('Tiedostossa pitää olla "lists"-taulukko, jossa on vähintään yksi lista.');
}

const ids = new Set();
for (const [i, list] of (data.lists ?? []).entries()) {
  const where = `lista #${i + 1} (${list.name ?? "nimetön"})`;
  if (!list.id || typeof list.id !== "string") errors.push(`${where}: puuttuu "id".`);
  if (ids.has(list.id)) errors.push(`${where}: sama "id" on jo käytössä: ${list.id}`);
  ids.add(list.id);
  if (!list.name) errors.push(`${where}: puuttuu "name".`);
  if (!Array.isArray(list.words) || list.words.length < 2) {
    errors.push(`${where}: listassa pitää olla vähintään 2 sanaa.`);
    continue;
  }
  for (const [j, word] of list.words.entries()) {
    if (!word.fi?.trim() || !word.sv?.trim()) {
      errors.push(`${where}, sana #${j + 1}: sekä "fi" että "sv" tarvitaan.`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`words.json kunnossa: ${data.lists.length} listaa.`);
