// Sovelluksen asetukset. Tätä tiedostoa muokataan käsin.

// PIN-koodin SHA-256-tiiviste, joka lasketaan merkkijonosta "ruotsin-sanat:<PIN>".
// Tyhjä merkkijono = PIN-kysely ei ole käytössä.
// Uuden tiivisteen saa komennolla: node scripts/pin-hash.mjs 1234
export const PIN_HASH = "";

// Montako sanaa yhdellä kierroksella harjoitellaan. Heikoimmat tulevat ensin.
export const ROUND_SIZE = 10;

// Montako vaihtoehtoa monivalinnassa näytetään.
export const CHOICE_COUNT = 4;

// Joka n:s oikea vastaus putkeen antaa bonuspisteitä.
export const STREAK_BONUS_EVERY = 5;
export const STREAK_BONUS_POINTS = 10;

// Palkkio täysistä pisteistä kokeessa. Näytetään etusivulla ja kokeen tuloksissa.
export const EXAM_REWARD = "5 €";

// Kuinka monen sanan päässä täysistä pisteistä palkkiosta muistutetaan.
export const REWARD_NEAR_WORDS = 3;
