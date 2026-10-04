// Tarkistaa, että src/data/words.json on oikeassa muodossa.
// Ajetaan automaattisesti GitHubissa ennen julkaisua, ja sen voi ajaa myös käsin:
//   node scripts/validate-words.mjs

import { readFileSync } from "node:fs";

const FILE = new URL("../src/data/words.json", import.meta.url);
const errors = [];

let list;
try {
  list = JSON.parse(readFileSync(FILE, "utf8"));
} catch (error) {
  console.error(`words.json ei ole kelvollista JSONia: ${error.message}`);
  process.exit(1);
}

if (!list.id || typeof list.id !== "string") errors.push('Puuttuu "id".');
if (!list.title) errors.push('Puuttuu "title".');

const forms = list.forms ?? ["ruotsiksi"];
if (!Array.isArray(forms) || forms.length === 0) errors.push('"forms" pitää olla taulukko.');

if (list.formHints && list.formHints.length !== forms.length) {
  errors.push(`"formHints" tarvitsee ${forms.length} selitystä, yhden kullekin muodolle.`);
}

if (!Array.isArray(list.words) || list.words.length < 2) {
  errors.push("Listassa pitää olla vähintään 2 sanaa.");
} else {
  const seen = new Set();
  for (const [i, word] of list.words.entries()) {
    const where = `sana #${i + 1} (${word.fi ?? "?"})`;
    const sv = Array.isArray(word.sv) ? word.sv : [word.sv];
    if (!word.fi?.trim()) errors.push(`${where}: puuttuu "fi".`);
    if (seen.has(word.fi)) errors.push(`${where}: sama suomenkielinen sana on jo listassa.`);
    seen.add(word.fi);
    if (sv.length !== forms.length || sv.some((form) => !form?.trim())) {
      errors.push(`${where}: "sv" tarvitsee ${forms.length} muotoa (${forms.join(", ")}).`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`words.json kunnossa: "${list.title}", ${list.words.length} sanaa.`);
