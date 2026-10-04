// Sovelluksen asetukset. Tätä tiedostoa muokataan käsin.

// PIN-koodin SHA-256-tiiviste, joka lasketaan merkkijonosta "ruotsin-sanat:<PIN>".
// Tyhjä merkkijono = PIN-kysely ei ole käytössä.
// Uuden tiivisteen saa komennolla: node scripts/pin-hash.mjs 1234
export const PIN_HASH = "";

// Montako vaihtoehtoa monivalinnassa näytetään.
export const CHOICE_COUNT = 4;
