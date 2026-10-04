// Laskee PIN-koodin tiivisteen src/js/config.js-tiedoston PIN_HASH-kenttään.
//   node scripts/pin-hash.mjs 1234

import { createHash } from "node:crypto";

const pin = process.argv[2];
if (!pin) {
  console.error("Käyttö: node scripts/pin-hash.mjs <PIN>");
  process.exit(1);
}
console.log(createHash("sha256").update(`ruotsin-sanat:${pin}`).digest("hex"));
