// Harjoittelun logiikka ilman käyttöliittymää: kysymysten muodostus ja
// vastausten tarkistus.

import { CHOICE_COUNT } from "./config.js";

const ARTICLES = ["en", "ett"];

// Harjoitustavat helpoimmasta vaikeimpaan.
export const MODES = {
  learn: { name: "Opettele", points: 2 },
  choice: { name: "Monivalinta", points: 5 },
  one: { name: "Kirjoita muoto", points: 10 },
  all: { name: "Koe: kaikki muodot", points: 20 },
};

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randomIndex(length) {
  return Math.floor(Math.random() * length);
}

// Valitsee kierrokselle heikoimmin osatut sanat. Samantasoisista arvotaan.
export function pickWeakest(words, starsOf, count) {
  return shuffle(words)
    .sort((a, b) => starsOf(a) - starsOf(b))
    .slice(0, count);
}

// Muodostaa kierroksen kysymykset. Jokaisesta sanasta tulee yksi kysymys.
export function buildRound(words, mode, formCount) {
  return shuffle(words).map((word) => buildQuestion(word, mode, formCount, words));
}

// Väärin mennyt kysymys palaa jonoon uutena kysymyksenä samasta sanasta.
export function buildQuestion(word, mode, formCount, allWords) {
  const formIndex = mode === "choice" || mode === "one" ? randomIndex(formCount) : null;
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
