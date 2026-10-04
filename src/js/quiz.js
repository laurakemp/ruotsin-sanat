// Harjoittelun logiikka ilman käyttöliittymää: kysymysten muodostus ja
// vastausten tarkistus.

import { CHOICE_COUNT } from "./config.js";

const ARTICLES = ["en", "ett"];

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// direction: "fi-sv" tai "sv-fi"
export function buildQuestions(words, direction) {
  const [from, to] = direction === "fi-sv" ? ["fi", "sv"] : ["sv", "fi"];
  return shuffle(words).map((word) => ({
    prompt: word[from],
    answer: word[to],
    choices: buildChoices(word[to], words.map((w) => w[to])),
  }));
}

function buildChoices(correct, allAnswers) {
  const wrong = shuffle(allAnswers.filter((a) => a !== correct)).slice(0, CHOICE_COUNT - 1);
  return shuffle([correct, ...wrong]);
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
  const e = normalize(expected);
  if (g === e) return "correct";
  if (g === withoutArticle(e)) return "missing-article";
  return "wrong";
}
