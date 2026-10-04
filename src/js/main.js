// Käyttöliittymä: näkymät, harjoittelu ja koe.
//
// Harjoittelu: ROUND_SIZE vaikeinta sanaa satunnaisilla tehtävätyypeillä, ja
// lopuksi väärin menneiden kertaus, kunnes ne menevät oikein.
// Koe (#koe): kaikkien sanojen kaikki muodot ilman palautetta. Lopuksi tulokset
// ja linkki vaikeiden sanojen kertaukseen.

import { REWARD_NEAR_WORDS, SCHOOL_REWARD, ROUND_SIZE, STREAK_BONUS_EVERY, STREAK_BONUS_POINTS } from "./config.js?v=__VERSION__";
import { celebrate } from "./confetti.js?v=__VERSION__";
import { loadList } from "./data.js?v=__VERSION__";
import * as progress from "./progress.js?v=__VERSION__";
import {
  MODES,
  buildQuestion,
  checkAnswer,
  formatAnswer,
  pick,
  pickHardest,
  STEPS,
  STEP_NAMES,
  shuffle,
} from "./quiz.js?v=__VERSION__";

const $ = (id) => document.getElementById(id);

const PRAISE = ["Oikein!", "Hienoa!", "Mahtavaa!", "Loistavaa!", "Upeaa!", "Juuri noin!", "Bra jobbat!"];
const COMFORT = [
  "Ei haittaa, kerrataan tämä lopuksi.",
  "Virheistä oppii. Tämä tulee vielä uudelleen.",
  "Melkein! Katso tarkkaan, niin muistat ensi kerralla.",
];

let list = null;
let session = null;

// ---------- Apurit ----------

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
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

function starsOf(word) {
  return progress.getStars(list.id, word);
}

function formsText(word) {
  return word.sv.map(formatAnswer).join(", ");
}

// Muodot numeroidaan kirjan järjestyksessä: "4. supiini".
function formName(i) {
  return list.forms.length > 1 ? `${i + 1}. ${list.forms[i]}` : list.forms[i];
}

function formHint(i) {
  return list.formHints[i] ?? "";
}

// ---------- Reititys ----------

// Osoite …/#koe avaa suoraan kokeen, muuten etusivu.
async function route() {
  list ??= await loadList();
  if (location.hash === "#koe") startExam();
  else openHome();
}

window.addEventListener("hashchange", route);

// Poistaa #koe-osoitteen, jotta selaimen päivitys ei avaa koetta uudelleen.
function clearHash() {
  if (location.hash) history.pushState(null, "", location.pathname + location.search);
}

function goHome() {
  clearHash();
  openHome();
}

for (const button of document.querySelectorAll(".home-link")) {
  button.addEventListener("click", goHome);
}

// ---------- Etusivu ----------

function openHome() {
  const learned = progress.learnedCount(list);
  const total = list.words.length;

  $("points").textContent = progress.getPoints();
  $("day-streak").textContent = progress.getDayStreak();
  $("list-title").textContent = list.title;
  $("learned-count").textContent = `${learned} / ${total}`;
  $("learned-bar").style.width = `${(learned / total) * 100}%`;
  $("goal-message").textContent = goalMessage(learned, total);
  $("start-sub").textContent = `${Math.min(ROUND_SIZE, total)} sanaa`;
  $("exam-sub").textContent = `Kirjoita kaikkien ${total} sanan kaikki muodot`;
  $("exam-reward").textContent = progress.isExamReady(list.id)
    ? "✓ Olet valmis koulun kokeeseen!"
    : `💶 Koulun kokeen täysistä pisteistä ${SCHOOL_REWARD}`;
  showScreen("home");
}

function goalMessage(learned, total) {
  if (learned === total) return "– kaikki opittu! Olet valmis kokeeseen 🏆";
  if (learned === 0) return "– aloitetaan!";
  if (learned / total >= 0.5) return "– yli puolet, hyvä!";
  return "– hyvä alku!";
}

$("start-btn").addEventListener("click", () => startPractice());

$("help-btn").addEventListener("click", () => {
  const example = list.example;
  $("help-example-row").textContent = example ? example.sv.join(" – ") : "";
  $("help-forms").replaceChildren(
    ...list.forms.map((_, i) => {
      const item = el("li", "help-form");
      item.append(el("strong", "", list.forms[i]));
      if (example) item.append(el("span", "help-sv", `${example.sv[i]} = ${example.fi[i]}`));
      item.append(el("span", "muted", formHint(i)));
      return item;
    }),
  );
  showScreen("help");
});

$("wordlist-btn").addEventListener("click", () => {
  $("word-table").replaceChildren(
    ...list.words.map((word) => {
      const row = el("li", "word-row");
      const head = el("div", "word-head");
      head.append(el("strong", "", word.fi), el("span", "stars", starsText(starsOf(word))));
      row.append(head, el("span", "word-forms", formsText(word)));
      return row;
    }),
  );
  showScreen("words");
});

// ---------- Istunto (yhteinen harjoittelulle ja kokeelle) ----------

function newSession(kind, words, questions) {
  session = {
    kind, // "practice" tai "exam"
    phase: "main", // harjoittelussa lopuksi "review"
    words,
    queue: questions,
    mainCount: questions.length,
    index: 0,
    firstTryCorrect: 0,
    retried: new Set(),
    missed: new Map(),
    starsEarned: new Map(),
    examResults: [],
    points: 0,
    streak: 0,
    bestStreak: 0,
  };
  showScreen("quiz");
  showQuestion();
}

function current() {
  return session.queue[session.index];
}

function startPractice(words = null) {
  const chosen = words ?? pickHardest(list.words, starsOf, (w) => progress.getMisses(list.id, w), ROUND_SIZE);
  // Jokainen sana käy läpi kaikki vaiheet: ensin kaikki monivalintana, sitten
  // järjestys, yksi muoto ja viimeisenä kaikkien muotojen kirjoitus.
  const questions = STEPS.flatMap((mode) =>
    shuffle(chosen).map((word) => buildQuestion(word, mode, list.forms.length, list.words)),
  );
  newSession("practice", chosen, questions);
}

function startExam() {
  const questions = shuffle(list.words).map((word) => buildQuestion(word, "all", list.forms.length, list.words));
  newSession("exam", list.words, questions);
}

function phaseText() {
  const { kind, phase, index, queue } = session;
  if (kind === "exam") return `Harjoituskoe · ${index + 1} / ${queue.length}`;
  if (phase === "review") return `Kertaus · jäljellä ${queue.length - index}`;
  return `${STEP_NAMES[current().mode]} · ${index + 1} / ${queue.length}`;
}

function showQuestion() {
  const q = current();
  const isExam = session.kind === "exam";

  $("quiz-phase").textContent = phaseText();
  $("quiz-bar").style.width = `${(session.index / session.queue.length) * 100}%`;
  updateStreak();
  $("prompt").textContent = q.word.fi;
  $("prompt-stars").textContent = isExam ? "" : starsText(starsOf(q.word));
  $("question-label").textContent = questionLabel(q);
  $("feedback").hidden = true;

  showFormHelp(q);
  $("mode-order").hidden = q.mode !== "order";
  $("mode-choice").hidden = q.mode !== "choice";
  $("mode-write").hidden = q.mode !== "one" && q.mode !== "all";

  if (q.mode === "order") showOrder(q);
  if (q.mode === "choice") showChoices(q);
  if (q.mode === "one" || q.mode === "all") showWriteFields(q);
}

function questionLabel(q) {
  if (q.mode === "order") return "Laita muodot järjestykseen";
  if (q.mode === "choice") return `Valitse ${formName(q.formIndex)}`;
  if (q.mode === "one") return `Kirjoita ${formName(q.formIndex)}`;
  return "Kirjoita kaikki muodot ruotsiksi";
}

// Näyttää kirjan rivin, jossa kysytyn muodon paikalla on kysymysmerkki, ja
// selittää lyhyesti, mitä muoto tarkoittaa.
function showFormHelp(q) {
  const asksOneForm = q.formIndex !== null && list.forms.length > 1;
  $("form-pattern").hidden = !asksOneForm;
  $("question-hint").hidden = !asksOneForm && q.mode !== "order";

  if (q.mode === "order") {
    $("question-hint").textContent = `Järjestys kuten kirjassa: ${list.forms.join(" – ")}`;
  }
  if (!asksOneForm) return;

  // Monivalinnassa näytetään muut muodot apuna, kirjoittaessa vain paikat.
  $("form-pattern").replaceChildren(
    ...list.forms.map((_, i) => {
      if (i === q.formIndex) return el("span", "slot slot-target", "?");
      return el("span", "slot", q.mode === "choice" ? formatAnswer(q.word.sv[i]) : `${i + 1}.`);
    }),
  );
  $("question-hint").textContent = `${list.forms[q.formIndex]}: ${formHint(q.formIndex)}`;
}

function updateStreak() {
  $("streak").textContent = session.kind !== "exam" && session.streak >= 2 ? `🔥 ${session.streak}` : "";
}

// Kirjaa vastauksen ja palauttaa ansaitut pisteet palautetta varten.
function registerAnswer(correct) {
  const q = current();
  // Sama sana tulee kierroksella eri tehtävätyypeissä, joten yritykset
  // lasketaan sanan ja tehtävätyypin mukaan.
  const key = `${q.word.fi}:${q.mode}`;
  const firstTry = !session.retried.has(key);
  const affectsStars = q.mode === "all" && firstTry && session.phase === "main";

  if (!correct) {
    session.streak = 0;
    session.retried.add(key);
    session.missed.set(q.word.fi, q.word);
    progress.addMiss(list.id, q.word);
    if (affectsStars) progress.changeStars(list.id, q.word, -1);
    // Kertauksessa sana palaa jonoon, kunnes se menee oikein.
    if (session.phase === "review") {
      session.queue.push(buildQuestion(q.word, "all", list.forms.length, list.words));
    }
    return { points: 0, bonus: 0 };
  }

  const base = MODES[q.mode].points;
  const points = firstTry ? base : Math.ceil(base / 2);
  session.streak++;
  session.bestStreak = Math.max(session.bestStreak, session.streak);
  const bonus = session.kind !== "exam" && session.streak % STREAK_BONUS_EVERY === 0 ? STREAK_BONUS_POINTS : 0;

  if (firstTry && session.phase === "main") session.firstTryCorrect++;
  if (affectsStars) session.starsEarned.set(q.word.fi, progress.changeStars(list.id, q.word, +1));

  session.points += points + bonus;
  progress.addPoints(points + bonus);
  return { points, bonus };
}

function showFeedback(correct, { points, bonus }, detail) {
  const box = $("feedback");
  box.className = `feedback ${correct ? "feedback-correct" : "feedback-wrong"}`;

  if (correct) {
    $("feedback-title").textContent = `${pick(PRAISE)} +${points} ⭐`;
    $("feedback-text").textContent =
      bonus > 0 ? `🔥 ${session.streak} oikein putkeen! +${bonus} bonuspistettä` : detail ?? "";
  } else {
    $("feedback-title").textContent = "Ei vielä";
    $("feedback-text").textContent = [detail, pick(COMFORT)].filter(Boolean).join(" ");
  }

  updateStreak();
  box.hidden = false;
  $("next-btn").focus();
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

$("next-btn").addEventListener("click", nextQuestion);

function nextQuestion() {
  session.index++;
  if (session.index < session.queue.length) return showQuestion();

  if (session.kind === "exam") return showExamResult();
  if (session.phase === "main" && session.missed.size > 0) return showReviewIntro();
  showPracticeResult();
}

// ---------- Järjestys ----------
// Oppilas napauttaa muodot kirjan järjestyksessä. Kun kaikki on valittu,
// vastaus tarkistetaan.

function showOrder(q) {
  q.picked = [];
  renderOrder(q);
}

function renderOrder(q, checked = false) {
  $("order-slots").replaceChildren(
    ...list.forms.map((_, pos) => {
      const picked = q.picked[pos];
      const slot = el("li", "order-slot");
      slot.append(el("span", "order-name", formName(pos)));
      slot.append(el("strong", "", picked === undefined ? "" : formatAnswer(q.word.sv[picked])));
      if (checked) slot.classList.add(q.word.sv[picked] === q.word.sv[pos] ? "is-correct" : "is-wrong");
      return slot;
    }),
  );
  $("order-chips").replaceChildren(
    ...q.shuffled.map((formIndex) => {
      const chip = el("button", "btn chip-btn", formatAnswer(q.word.sv[formIndex]));
      chip.disabled = checked || q.picked.includes(formIndex);
      chip.addEventListener("click", () => pickOrder(q, formIndex));
      return chip;
    }),
  );
  $("order-reset").hidden = checked || q.picked.length === 0;
}

function pickOrder(q, formIndex) {
  q.picked.push(formIndex);
  if (q.picked.length < list.forms.length) return renderOrder(q);

  const correct = q.picked.every((picked, pos) => q.word.sv[picked] === q.word.sv[pos]);
  renderOrder(q, true);
  const result = registerAnswer(correct);
  showFeedback(correct, result, correct ? formsText(q.word) : `Oikea järjestys: ${formsText(q.word)}.`);
}

$("order-reset").addEventListener("click", () => {
  const q = current();
  q.picked = [];
  renderOrder(q);
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

function showWriteFields(q) {
  const formIndexes = q.formIndex !== null ? [q.formIndex] : list.forms.map((_, i) => i);
  const fields = formIndexes.map((formIndex) => {
    const wrap = el("label", "field");
    const label = el("span", "field-label", formName(formIndex));
    if (formHint(formIndex)) label.append(el("span", "field-hint", ` · ${formHint(formIndex)}`));
    wrap.append(label);
    const input = el("input", "input");
    Object.assign(input, { type: "text", autocapitalize: "off", spellcheck: false, autocomplete: "off" });
    input.setAttribute("autocorrect", "off");
    input.dataset.formIndex = formIndex;
    wrap.append(input, el("span", "field-answer"));
    return wrap;
  });

  $("write-fields").replaceChildren(...fields);
  $("check-btn").hidden = false;
  $("check-btn").textContent = checkButtonText();
  fields[0].querySelector("input").focus();
}

function checkButtonText() {
  if (session.kind !== "exam") return "Tarkista";
  return session.index === session.queue.length - 1 ? "Valmis – katso tulokset" : "Seuraava →";
}

// Enter siirtää seuraavaan kenttään, viimeisessä kentässä lähettää.
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
  const answers = [...$("write-fields").querySelectorAll("input")].map((input) => {
    const expected = q.word.sv[input.dataset.formIndex];
    const result = checkAnswer(input.value, expected);
    return { input, given: input.value.trim(), expected, result, ok: result !== "wrong" };
  });
  const allCorrect = answers.every((a) => a.ok);

  // Kokeessa ei näytetä palautetta, vaan siirrytään suoraan seuraavaan.
  if (session.kind === "exam") {
    session.examResults.push({ word: q.word, answers, ok: allCorrect });
    registerAnswer(allCorrect);
    return nextQuestion();
  }

  for (const { input, expected, result, ok } of answers) {
    input.disabled = true;
    input.classList.add(ok ? "is-correct" : "is-wrong");
    input.parentElement.querySelector(".field-answer").textContent = ok
      ? result === "missing-article" ? `Muista artikkeli: ${expected}` : ""
      : `✓ ${formatAnswer(expected)}`;
  }

  $("check-btn").hidden = true;
  const result = registerAnswer(allCorrect);
  const starNote = session.starsEarned.has(q.word.fi) ? `Sanalle tähti! ${starsText(starsOf(q.word))}` : null;
  showFeedback(allCorrect, result, allCorrect ? starNote : "Katso oikeat muodot yllä.");
  if (allCorrect) $("prompt-stars").textContent = starsText(starsOf(q.word));
});

// ---------- Kertaus harjoittelun lopuksi ----------

function showReviewIntro() {
  const words = [...session.missed.values()];
  $("review-list").replaceChildren(...words.map((word) => el("li", "", word.fi)));
  showScreen("review-intro");
}

$("review-start-btn").addEventListener("click", () => {
  session.phase = "review";
  session.queue = shuffle([...session.missed.values()]).map((word) =>
    buildQuestion(word, "all", list.forms.length, list.words),
  );
  session.index = 0;
  showScreen("quiz");
  showQuestion();
});

// ---------- Harjoittelun tulokset ----------

function showPracticeResult() {
  progress.markPracticedToday();
  const size = session.mainCount;
  const ratio = session.firstTryCorrect / size;

  const [emoji, title] =
    ratio === 1 ? ["🏆", "Täydellinen kierros!"]
    : ratio >= 0.8 ? ["🌟", "Tosi hienoa!"]
    : ratio >= 0.5 ? ["💪", "Hyvää työtä!"]
    : ["🌱", "Hyvä, että harjoittelit!"];

  $("result-emoji").textContent = emoji;
  $("result-title").textContent = title;
  $("result-text").textContent =
    session.missed.size > 0
      ? "Kertasit myös vaikeimmat sanat loppuun asti. Jokainen kierros vie lähemmäs koetta."
      : "Kaikki oikein ensimmäisellä yrityksellä.";
  $("stat-correct").textContent = `${session.firstTryCorrect}/${size}`;
  $("stat-points").textContent = `+${session.points}`;
  $("stat-streak").textContent = `🔥 ${session.bestStreak}`;

  $("star-news").hidden = session.starsEarned.size === 0;
  $("star-list").replaceChildren(
    ...[...session.starsEarned].map(([fi, stars]) => {
      const item = el("li", "", `${fi} `);
      item.append(el("span", "stars", starsText(stars)));
      if (stars === progress.MAX_STARS) item.append(" opittu! 🎉");
      return item;
    }),
  );

  showScreen("result");
  if (ratio >= 0.8) celebrate();
}

$("again-round-btn").addEventListener("click", () => startPractice());

// ---------- Kokeen tulokset ----------

function showExamResult() {
  progress.markPracticedToday();
  const results = session.examResults;
  const wordsOk = results.filter((r) => r.ok).length;
  const formsAll = results.flatMap((r) => r.answers);
  const formsOk = formsAll.filter((a) => a.ok).length;
  const ratio = wordsOk / results.length;

  const [emoji, title] =
    ratio === 1 ? ["🏆", "Täydet pisteet!"]
    : ratio >= 0.8 ? ["🌟", "Erinomainen tulos!"]
    : ratio >= 0.5 ? ["💪", "Hyvä tulos!"]
    : ["🌱", "Hyvä alku!"];

  $("exam-emoji").textContent = emoji;
  $("exam-title").textContent = title;
  $("exam-text").textContent =
    ratio === 1 ? "Osaat kaikki muodot. Olet valmis kokeeseen!" : "Alta näet, mitkä menivät oikein ja mitkä väärin.";
  $("exam-words").textContent = `${wordsOk}/${results.length}`;
  $("exam-forms").textContent = `${formsOk}/${formsAll.length}`;

  showReward(results.length - wordsOk);

  const wrongWords = results.filter((r) => !r.ok).map((r) => r.word);
  $("exam-review-btn").hidden = wrongWords.length === 0;
  $("exam-review-sub").textContent =
    wrongWords.length === 1 ? "1 sana, joka meni väärin" : `${wrongWords.length} sanaa, jotka menivät väärin`;

  // Väärin menneet ensin, jotta ne huomaa heti.
  const sorted = [...results].sort((a, b) => a.ok - b.ok);
  $("exam-table").replaceChildren(...sorted.map(examRow));

  showScreen("exam-result");
  if (ratio >= 0.8) celebrate();
}

// Täydet pisteet harjoituskokeessa = valmis koulun kokeeseen, jonka täysistä
// pisteistä saa palkkion. Lähellä olevaa kannustetaan yrittämään uudelleen.
function showReward(wrongCount) {
  const card = $("reward-card");
  card.hidden = wrongCount > REWARD_NEAR_WORDS;
  card.classList.toggle("reward-won", wrongCount === 0);

  if (wrongCount === 0) {
    progress.markExamReady(list.id);
    progress.markAllLearned(list);
    $("reward-emoji").textContent = "💶";
    $("reward-title").textContent = "Olet valmis koulun kokeeseen!";
    $("reward-text").textContent = `Kun saat koulun kokeesta täydet pisteet, saat ${SCHOOL_REWARD} palkkion. Tsemppiä!`;
  } else {
    $("reward-emoji").textContent = "💪";
    $("reward-title").textContent = `Enää ${wrongCount} ${wrongCount === 1 ? "sana" : "sanaa"} täysiin pisteisiin!`;
    $("reward-text").textContent =
      `Kertaa vaikeat sanat ja tee harjoituskoe uudelleen. Koulun kokeen täysistä pisteistä saat ${SCHOOL_REWARD}.`;
  }
}

function examRow({ word, answers, ok }) {
  const row = el("li", `word-row ${ok ? "row-ok" : "row-bad"}`);
  const head = el("div", "word-head");
  head.append(el("strong", "", word.fi), el("span", "row-mark", ok ? "✓" : "✗"));

  const forms = el("div", "exam-forms");
  for (const answer of answers) {
    const cell = el("span", answer.ok ? "form-ok" : "form-bad");
    if (answer.ok) {
      cell.textContent = formatAnswer(answer.expected);
    } else {
      if (answer.given) cell.append(el("s", "", answer.given), " ");
      cell.append(el("strong", "", formatAnswer(answer.expected)));
    }
    forms.append(cell);
  }

  row.append(head, forms);
  return row;
}

$("exam-review-btn").addEventListener("click", () => {
  const wrongWords = session.examResults.filter((r) => !r.ok).map((r) => r.word);
  clearHash();
  startPractice(wrongWords);
});

$("exam-again-btn").addEventListener("click", startExam);

route();
