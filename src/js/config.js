// Sovelluksen asetukset. Tätä tiedostoa muokataan käsin.

// Sanalista jaetaan kirjan järjestyksessä tämän kokoisiin osioihin. Yksi
// harjoituskierros on yksi osio, ja jokainen sana käy läpi kaikki neljä
// tehtävätyyppiä, joten kierroksella on ROUND_SIZE × 4 tehtävää.
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
