// Edistyminen: pisteet, sanojen tähdet, virheet ja päiväputki. Tallentuu
// puhelimeen.

import { load, save } from "./storage.js";

export const MAX_STARS = 3;

// ---------- Pisteet ----------

export function getPoints() {
  return load("points", 0);
}

export function addPoints(amount) {
  save("points", getPoints() + amount);
}

// ---------- Sanakohtaiset tiedot ----------
// Avaimena on listan id + suomenkielinen sana, joten uusi lista alkaa alusta.

function wordKey(listId, word) {
  return `${listId}:${word.fi}`;
}

function getValue(store, listId, word) {
  return load(store, {})[wordKey(listId, word)] ?? 0;
}

function setValue(store, listId, word, value) {
  const values = load(store, {});
  values[wordKey(listId, word)] = value;
  save(store, values);
}

// Sana saa tähden, kun kaikki muodot menevät oikein ensimmäisellä
// yrityksellä. Väärä vastaus vie yhden tähden. Kolme tähteä = opittu.
export function getStars(listId, word) {
  return getValue("stars", listId, word);
}

export function changeStars(listId, word, delta) {
  const value = Math.min(MAX_STARS, Math.max(0, getStars(listId, word) + delta));
  setValue("stars", listId, word, value);
  return value;
}

// Virheiden määrä kertoo, mitkä sanat ovat vaikeimpia.
export function getMisses(listId, word) {
  return getValue("misses", listId, word);
}

export function addMiss(listId, word) {
  setValue("misses", listId, word, getMisses(listId, word) + 1);
}

export function learnedCount(list) {
  return list.words.filter((word) => getStars(list.id, word) === MAX_STARS).length;
}

// ---------- Päiväputki ----------

function today() {
  return new Date().toLocaleDateString("sv-SE"); // muoto 2026-10-04
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86_400_000);
}

export function getDayStreak() {
  const streak = load("dayStreak", { last: null, days: 0 });
  if (!streak.last || daysBetween(streak.last, today()) > 1) return 0;
  return streak.days;
}

// Kutsutaan, kun kierros on tehty. Laskee putken vain kerran päivässä.
export function markPracticedToday() {
  const streak = load("dayStreak", { last: null, days: 0 });
  if (streak.last === today()) return streak.days;
  const continues = streak.last && daysBetween(streak.last, today()) === 1;
  const updated = { last: today(), days: continues ? streak.days + 1 : 1 };
  save("dayStreak", updated);
  return updated.days;
}
