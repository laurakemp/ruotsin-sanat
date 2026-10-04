// Harjoittelun logiikka ilman käyttöliittymää: kysymysten muodostus ja
// vastausten tarkistus.

import { CHOICE_COUNT } from "./config.js";

const ARTICLES = ["en", "ett"];

// Tehtävätyypit ja niistä saatavat pisteet.
export const MODES = {
  learn: { points: 2 },
  choice: { points: 5 },
  one: { points: 10 },
  all: { points: 20 },
};

// Harjoittelussa tehtävätyyppi arvotaan sanan osaamisen mukaan: uusille
// sanoille helpompia, osatuille vaikeampia.
const MODES_BY_STARS = [
  ["learn", "choice", "one", "all"],
  ["choice", "one", "all"],
  ["one", "all"],
  ["one", "all"],
];

// Lopun kertauksessa kirjoitetaan aina itse.
const REVIEW_MODES = ["one", "all"];

export function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function randomMode(stars) {
  return pick(MODES_BY_STARS[Math.min(stars, MODES_BY_STARS.length - 1)]);
}

export function randomReviewMode() {
  return pick(REVIEW_MODES);
}

// Valitsee heikoimmin osatut sanat: ensin vähiten tähtiä, sitten eniten
// virheitä. Samantasoisista arvotaan.
export function pickHardest(words, starsOf, missesOf, count) {
  return shuffle(words)
    .sort((a, b) => starsOf(a) - starsOf(b) || missesOf(b) - missesOf(a))
    .slice(0, count);
}

export function buildQuestion(word, mode, formCount, allWords) {
  const formIndex = mode === "choice" || mode === "one" ? Math.floor(Math.random() * formCount) : null;
  const question = { word, mode, formIndex };
  if (mode === "choice") question.choices = buildChoices(word, formIndex, allWords);
  return question;
}

// Väärät vaihtoehdot ovat saman sanan muita muotoja ja muiden sanojen samaa
// muotoa, koska juuri ne menevät helposti sekaisin.
function buildChoices(word, formIndex, allWords) {
  const correct = word.sv[formIndex];
  const sameWord = word.sv.filter((_, i) => i !== formIndex);
  const sameForm = allWords.filter((w) => w !== word).map((w) => w.sv[formIndex]);
  const wrong = [...new Set(shuffle([...sameWord, ...shuffle(sameForm)]))]
    .filter((option) => option !== correct)
    .slice(0, CHOICE_COUNT - 1);
  return shuffle([correct, ...wrong]);
}

// Vaihtoehtoiset muodot erotetaan datassa vinoviivalla: "sa/sade".
export function formatAnswer(expected) {
  return expected.split("/").join(" / ");
}

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function withoutArticle(text) {
  const [first, ...rest] = text.split(" ");
  return ARTICLES.includes(first) && rest.length ? rest.join(" ") : text;
}

// Palauttaa "correct", "missing-article" tai "wrong".
export function checkAnswer(given, expected) {
  const g = normalize(given);
  const alternatives = expected.split("/").map(normalize);
  if (alternatives.includes(g)) return "correct";
  if (alternatives.some((alt) => g === withoutArticle(alt) && g !== alt)) return "missing-article";
  return "wrong";
}
