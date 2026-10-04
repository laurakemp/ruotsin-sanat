// Käyttöliittymä: näkymien vaihto ja harjoituksen kulku.

import { ROUND_SIZE, STREAK_BONUS_EVERY, STREAK_BONUS_POINTS } from "./config.js";
import { celebrate } from "./confetti.js";
import { loadList } from "./data.js";
import { isPinRequired, tryUnlock } from "./pin.js";
import * as progress from "./progress.js";
import { MODES, buildQuestion, buildRound, checkAnswer, formatAnswer, pickWeakest } from "./quiz.js";

const $ = (id) => document.getElementById(id);

const PRAISE = ["Oikein!", "Hienoa!", "Mahtavaa!", "Loistavaa!", "Upeaa!", "Juuri noin!", "Bra jobbat!"];
const COMFORT = [
  "Ei haittaa, tämä tulee vielä uudelleen.",
  "Melkein! Katso tarkkaan ja yritä myöhemmin uudelleen.",
  "Virheistä oppii. Tämä tulee pian uudelleen.",
];

let list = null;
let round = null;

// ---------- Apurit ----------

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function showScreen(name) {
  for (const screen of document.querySelectorAll(".screen")) {
    screen.hidden = screen.id !== `screen-${name}`;
  }
  window.scrollTo(0, 0);
}

function starsText(count) {
  return "★".repeat(count) + "☆".repeat(progress.MAX_STARS - count);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---------- Käynnistys ja PIN ----------

async function init() {
  if (isPinRequired()) {
    showScreen("pin");
    $("pin-input").focus();
    return;
  }
  await openHome();
}

$("pin-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (await tryUnlock($("pin-input").value)) {
    await openHome();
  } else {
    $("pin-error").hidden = false;
    $("pin-input").select();
  }
});

// ---------- Etusivu ----------

async function openHome() {
  list ??= await loadList();
  renderHome();
  showScreen("home");
}

function renderHome() {
  const learned = progress.learnedCount(list);
  const total = list.words.length;

  $("points").textContent = progress.getPoints();
  $("day-streak").textContent = progress.getDayStreak();
  $("list-title").textContent = list.title;
  $("learned-count").textContent = `${learned} / ${total}`;
  $("learned-bar").style.width = `${(learned / total) * 100}%`;
  $("goal-message").textContent = goalMessage(learned, total);
}

function goalMessage(learned, total) {
  if (learned === total) return "– kaikki opittu! Olet valmis kokeeseen 🏆";
  if (learned === 0) return "– aloitetaan!";
  if (learned / total >= 0.5) return "– yli puolet, hyvä!";
  return "– hyvä alku!";
}

for (const card of document.querySelectorAll(".mode-card")) {
  card.addEventListener("click", () => startRound(card.dataset.mode));
}

// ---------- Sanalista ----------

$("wordlist-btn").addEventListener("click", () => {
  $("word-table").replaceChildren(
    ...list.words.map((word) => {
      const row = el("li", "word-row");
      const head = el("div", "word-head");
      head.append(el("strong", "", word.fi), el("span", "stars", starsText(progress.getStars(list.id, word))));
      row.append(head, el("span", "word-forms", word.sv.map(formatAnswer).join(", ")));
      return row;
    }),
  );
  showScreen("words");
});

for (const button of document.querySelectorAll(".back-btn")) {
  button.addEventListener("click", openHome);
}

// ---------- Kierros ----------

function startRound(mode, words = null) {
  const starsOf = (word) => progress.getStars(list.id, word);
  const chosen = words ?? pickWeakest(list.words, starsOf, ROUND_SIZE);

  round = {
    mode,
    queue: buildRound(chosen, mode, list.forms.length),
    index: 0,
    size: chosen.length,
    firstTryCorrect: 0,
    retried: new Set(),
    missed: new Map(),
    starsEarned: new Map(),
    points: 0,
    streak: 0,
    bestStreak: 0,
  };
  showScreen("quiz");
  showQuestion();
}

function current() {
  return round.queue[round.index];
}

function showQuestion() {
  const q = current();
  const { mode } = round;

  $("quiz-bar").style.width = `${(round.index / round.queue.length) * 100}%`;
  $("streak").textContent = round.streak >= 2 ? `🔥 ${round.streak}` : "";
  $("prompt").textContent = q.word.fi;
  $("prompt-stars").textContent = starsText(progress.getStars(list.id, q.word));
  $("question-label").textContent = questionLabel(q);
  $("feedback").hidden = true;

  $("mode-learn").hidden = mode !== "learn";
  $("mode-choice").hidden = mode !== "choice";
  $("mode-write").hidden = mode !== "one" && mode !== "all";

  if (mode === "learn") showLearn();
  if (mode === "choice") showChoices(q);
  if (mode === "one" || mode === "all") showWriteFields(q);
}

function questionLabel(q) {
  if (q.formIndex !== null) return `Ruotsiksi: ${list.forms[q.formIndex]}`;
  if (round.mode === "all") return "Kirjoita kaikki muodot ruotsiksi";
  return "Muistatko muodot?";
}

// Kirjaa vastauksen ja palauttaa ansaitut pisteet palautetta varten.
function registerAnswer(correct) {
  const q = current();
  const firstTry = !round.retried.has(q.word.fi);

  if (!correct) {
    round.streak = 0;
    round.retried.add(q.word.fi);
    round.missed.set(q.word.fi, q.word);
    round.queue.push(buildQuestion(q.word, round.mode, list.forms.length, list.words));
    if (round.mode === "all" && firstTry) progress.changeStars(list.id, q.word, -1);
    return { points: 0, bonus: 0 };
  }

  const base = MODES[round.mode].points;
  const points = firstTry ? base : Math.ceil(base / 2);
  round.streak++;
  round.bestStreak = Math.max(round.bestStreak, round.streak);
  const bonus = round.streak % STREAK_BONUS_EVERY === 0 ? STREAK_BONUS_POINTS : 0;

  if (firstTry) round.firstTryCorrect++;
  if (round.mode === "all" && firstTry) {
    const stars = progress.changeStars(list.id, q.word, +1);
    round.starsEarned.set(q.word.fi, stars);
  }

  round.points += points + bonus;
  progress.addPoints(points + bonus);
  return { points, bonus };
}

function showFeedback(correct, { points, bonus }, answerText) {
  const box = $("feedback");
  box.className = `feedback ${correct ? "feedback-correct" : "feedback-wrong"}`;

  if (correct) {
    $("feedback-title").textContent = `${pick(PRAISE)} +${points} ⭐`;
    $("feedback-text").textContent =
      bonus > 0 ? `🔥 ${round.streak} oikein putkeen! +${bonus} bonuspistettä` : answerText ?? "";
  } else {
    $("feedback-title").textContent = "Ei vielä";
    $("feedback-text").textContent = `${answerText} ${pick(COMFORT)}`;
  }

  $("streak").textContent = round.streak >= 2 ? `🔥 ${round.streak}` : "";
  box.hidden = false;
  $("next-btn").focus();
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

$("next-btn").addEventListener("click", nextQuestion);

function nextQuestion() {
  round.index++;
  if (round.index < round.queue.length) {
    showQuestion();
  } else {
    showResult();
  }
}

$("quit-btn").addEventListener("click", openHome);

// ---------- Opettele ----------

function showLearn() {
  const q = current();
  $("learn-forms").replaceChildren(
    ...list.forms.map((formName, i) => {
      const cell = el("div", "form-cell");
      cell.append(el("span", "form-name", formName), el("strong", "form-value", formatAnswer(q.word.sv[i])));
      return cell;
    }),
  );
  $("learn-forms").hidden = true;
  $("reveal-btn").hidden = false;
  $("self-grade").hidden = true;
  $("reveal-btn").focus();
}

$("reveal-btn").addEventListener("click", () => {
  $("learn-forms").hidden = false;
  $("reveal-btn").hidden = true;
  $("self-grade").hidden = false;
});

$("knew-btn").addEventListener("click", () => {
  registerAnswer(true);
  nextQuestion();
});

$("again-btn").addEventListener("click", () => {
  registerAnswer(false);
  nextQuestion();
});

// ---------- Monivalinta ----------

function showChoices(q) {
  $("mode-choice").replaceChildren(
    ...q.choices.map((choice) => {
      const button = el("button", "btn choice", formatAnswer(choice));
      button.addEventListener("click", () => answerChoice(button, choice));
      return button;
    }),
  );
}

function answerChoice(clicked, choice) {
  const q = current();
  const answer = q.word.sv[q.formIndex];
  const correct = choice === answer;

  for (const button of $("mode-choice").children) {
    button.disabled = true;
    if (button.textContent === formatAnswer(answer)) button.classList.add("is-correct");
  }
  if (!correct) clicked.classList.add("is-wrong");

  const result = registerAnswer(correct);
  showFeedback(correct, result, correct ? null : `Oikea vastaus: ${formatAnswer(answer)}.`);
}

// ---------- Kirjoitus ----------

function formIndexesFor(q) {
  return q.formIndex !== null ? [q.formIndex] : list.forms.map((_, i) => i);
}

function showWriteFields(q) {
  const fields = formIndexesFor(q).map((formIndex) => {
    const wrap = el("label", "field");
    wrap.append(el("span", "field-label", list.forms[formIndex]));
    const input = el("input", "input");
    Object.assign(input, { type: "text", autocapitalize: "off", spellcheck: false, autocomplete: "off" });
    input.setAttribute("autocorrect", "off");
    input.dataset.formIndex = formIndex;
    wrap.append(input, el("span", "field-answer"));
    return wrap;
  });

  $("write-fields").replaceChildren(...fields);
  $("check-btn").hidden = false;
  $("letter-bar").hidden = false;
  fields[0].querySelector("input").focus();
}

// Enter siirtää seuraavaan kenttään, viimeisessä kentässä tarkistaa.
$("write-fields").addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const inputs = [...$("write-fields").querySelectorAll("input")];
  const next = inputs[inputs.indexOf(event.target) + 1];
  if (next) {
    event.preventDefault();
    next.focus();
  }
});

$("mode-write").addEventListener("submit", (event) => {
  event.preventDefault();
  const q = current();
  let allCorrect = true;

  for (const input of $("write-fields").querySelectorAll("input")) {
    const expected = q.word.sv[input.dataset.formIndex];
    const result = checkAnswer(input.value, expected);
    const ok = result !== "wrong";
    allCorrect &&= ok;

    input.disabled = true;
    input.classList.add(ok ? "is-correct" : "is-wrong");
    const hint = input.parentElement.querySelector(".field-answer");
    hint.textContent = ok ? (result === "missing-article" ? `Muista artikkeli: ${expected}` : "") : `✓ ${formatAnswer(expected)}`;
  }

  $("check-btn").hidden = true;
  $("letter-bar").hidden = true;
  const result = registerAnswer(allCorrect);
  const starNote =
    round.mode === "all" && round.starsEarned.has(q.word.fi)
      ? `Sanalle tähti! ${starsText(round.starsEarned.get(q.word.fi))}`
      : null;
  showFeedback(allCorrect, result, allCorrect ? starNote : "Katso oikeat muodot yllä.");
  if (allCorrect) $("prompt-stars").textContent = starsText(progress.getStars(list.id, q.word));
});

// Å, Ä ja Ö -napit lisäävät kirjaimen viimeksi valittuun kenttään.
let lastInput = null;
$("write-fields").addEventListener("focusin", (event) => {
  lastInput = event.target;
});

for (const button of document.querySelectorAll(".letter-btn")) {
  button.addEventListener("pointerdown", (event) => event.preventDefault()); // pitää näppäimistön auki
  button.addEventListener("click", () => {
    if (!lastInput || lastInput.disabled) return;
    lastInput.setRangeText(button.dataset.char, lastInput.selectionStart, lastInput.selectionEnd, "end");
    lastInput.focus();
  });
}

// ---------- Tulokset ----------

function showResult() {
  progress.markPracticedToday();
  const ratio = round.firstTryCorrect / round.size;

  const [emoji, title] =
    ratio === 1 ? ["🏆", "Täydellinen kierros!"]
    : ratio >= 0.8 ? ["🌟", "Tosi hienoa!"]
    : ratio >= 0.5 ? ["💪", "Hyvää työtä!"]
    : ["🌱", "Hyvä, että harjoittelit!"];

  $("result-emoji").textContent = emoji;
  $("result-title").textContent = title;
  $("result-text").textContent =
    ratio === 1 ? "Kaikki oikein ensimmäisellä yrityksellä." : "Jokainen kierros vie lähemmäs koetta.";
  $("stat-correct").textContent = `${round.firstTryCorrect}/${round.size}`;
  $("stat-points").textContent = `+${round.points}`;
  $("stat-streak").textContent = `🔥 ${round.bestStreak}`;

  $("star-news").hidden = round.starsEarned.size === 0;
  $("star-list").replaceChildren(
    ...[...round.starsEarned].map(([fi, stars]) => {
      const item = el("li", "", `${fi} `);
      item.append(el("span", "stars", starsText(stars)));
      if (stars === progress.MAX_STARS) item.append(" opittu! 🎉");
      return item;
    }),
  );

  const missedWords = [...round.missed.values()];
  $("missed").hidden = missedWords.length === 0;
  $("missed-list").replaceChildren(
    ...missedWords.map((word) => el("li", "", `${word.fi}: ${word.sv.map(formatAnswer).join(", ")}`)),
  );
  $("retry-btn").hidden = missedWords.length === 0;
  $("again-round-btn").className = `btn ${missedWords.length ? "btn-soft" : "btn-primary"}`;

  showScreen("result");
  if (ratio >= 0.8) celebrate();
}

$("retry-btn").addEventListener("click", () => startRound(round.mode, [...round.missed.values()]));
$("again-round-btn").addEventListener("click", () => startRound(round.mode));
$("home-btn").addEventListener("click", openHome);

init();
