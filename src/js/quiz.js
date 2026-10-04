// Harjoittelun logiikka ilman käyttöliittymää: kysymysten muodostus ja
// vastausten tarkistus.

import { CHOICE_COUNT } from "./config.js?v=__VERSION__";

const ARTICLES = ["en", "ett"];

// Tehtävätyypit ja niistä saatavat pisteet.
export const MODES = {
  choice: { points: 5 },
  order: { points: 5 },
  one: { points: 10 },
  all: { points: 20 },
};

// Harjoittelukierroksella jokainen sana käy läpi nämä vaiheet helpoimmasta
// vaikeimpaan: ensin monivalinta, viimeisenä kaikkien muotojen kirjoitus.
export const STEPS = ["choice", "order", "one", "all"];

export const STEP_NAMES = {
  choice: "Monivalinta",
  order: "Järjestys",
  one: "Kirjoita muoto",
  all: "Kaikki muodot",
};

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

// Jakaa sanat kirjan järjestyksessä osioihin, esim. 20 sanaa → 4 × 5.
export function splitSections(words, size) {
  const sections = [];
  for (let i = 0; i < words.length; i += size) sections.push(words.slice(i, i + size));
  return sections;
}

export function buildQuestion(word, mode, formCount, allWords) {
  const formIndex = mode === "choice" || mode === "one" ? Math.floor(Math.random() * formCount) : null;
  const question = { word, mode, formIndex };
  if (mode === "choice") question.choices = buildChoices(word, formIndex, allWords);
  if (mode === "order") question.shuffled = shuffledOrder(formCount);
  return question;
}

// Muotojen järjestys sekaisin, mutta ei koskaan valmiiksi oikein.
function shuffledOrder(count) {
  const indexes = [...Array(count).keys()];
  if (count < 2) return indexes;
  let result;
  do result = shuffle(indexes);
  while (result.every((value, i) => value === i));
  return result;
}

// Väärät vaihtoehdot ovat muiden sanojen samaa muotoa. Saman sanan muita
// muotoja ei käytetä, koska ne näkyvät jo kysymyksen kirjan rivillä.
function buildChoices(word, formIndex, allWords) {
  const correct = word.sv[formIndex];
  const sameForm = allWords.filter((w) => w !== word).map((w) => w.sv[formIndex]);
  const wrong = [...new Set(shuffle(sameForm))]
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
