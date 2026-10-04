// Sovelluksen asetukset. Tätä tiedostoa muokataan käsin.

// PIN-koodin SHA-256-tiiviste, joka lasketaan merkkijonosta "ruotsin-sanat:<PIN>".
// Tyhjä merkkijono = PIN-kysely ei ole käytössä.
// Uuden tiivisteen saa komennolla: node scripts/pin-hash.mjs 1234
export const PIN_HASH = "";

// Montako sanaa yhdellä kierroksella harjoitellaan. Jokainen sana käy läpi
// kaikki neljä tehtävätyyppiä, joten kierroksella on ROUND_SIZE × 4 tehtävää.
export const ROUND_SIZE = 5;

// Montako vaihtoehtoa monivalinnassa näytetään.
export const CHOICE_COUNT = 4;

// Joka n:s oikea vastaus putkeen antaa bonuspisteitä.
export const STREAK_BONUS_EVERY = 5;
export const STREAK_BONUS_POINTS = 10;

// Palkkio koulun kokeen täysistä pisteistä. Sovelluksen harjoituskoe kertoo,
// milloin oppilas on valmis koulun kokeeseen.
export const SCHOOL_REWARD = "5 €";

// Kuinka monen sanan päässä täysistä pisteistä harjoituskokeessa kannustetaan.
export const REWARD_NEAR_WORDS = 3;
