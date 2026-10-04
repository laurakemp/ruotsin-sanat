// Edistyminen: pisteet, sanojen tähdet ja päiväputki. Tallentuu puhelimeen.

import { load, save } from "./storage.js";

export const MAX_STARS = 3;

// ---------- Pisteet ----------

export function getPoints() {
  return load("points", 0);
}

export function addPoints(amount) {
  save("points", getPoints() + amount);
}

// ---------- Tähdet ----------
// Sana saa tähden, kun kaikki muodot menevät kokeessa oikein ensimmäisellä
// yrityksellä. Väärä vastaus vie yhden tähden. Kolme tähteä = opittu.

function starKey(listId, word) {
  return `${listId}:${word.fi}`;
}

export function getStars(listId, word) {
  return load("stars", {})[starKey(listId, word)] ?? 0;
}

export function changeStars(listId, word, delta) {
  const stars = load("stars", {});
  const key = starKey(listId, word);
  const value = Math.min(MAX_STARS, Math.max(0, (stars[key] ?? 0) + delta));
  stars[key] = value;
  save("stars", stars);
  return value;
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

// Kutsutaan, kun päivän ensimmäinen kierros on tehty.
export function markPracticedToday() {
  const streak = load("dayStreak", { last: null, days: 0 });
  if (streak.last === today()) return streak.days;
  const continues = streak.last && daysBetween(streak.last, today()) === 1;
  const updated = { last: today(), days: continues ? streak.days + 1 : 1 };
  save("dayStreak", updated);
  return updated.days;
}
