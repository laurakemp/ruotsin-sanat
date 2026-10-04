// Käyttöliittymä: näkymien vaihto ja harjoituksen kulku.

import { isPinRequired, tryUnlock } from "./pin.js";
import { buildQuestions, checkAnswer } from "./quiz.js";
import { load, save } from "./storage.js";

const $ = (id) => document.getElementById(id);

const state = {
  lists: [],
  mode: "cards",
  direction: "fi-sv",
  questions: [],
  index: 0,
  missed: [],
};

// ---------- Näkymät ----------

function showScreen(name) {
  for (const screen of document.querySelectorAll(".screen")) {
    screen.hidden = screen.id !== `screen-${name}`;
  }
}

// ---------- Käynnistys ----------

async function init() {
  if (isPinRequired()) {
    showScreen("pin");
    $("pin-input").focus();
  } else {
    await openMenu();
  }
}

$("pin-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (await tryUnlock($("pin-input").value)) {
    await openMenu();
  } else {
    $("pin-error").hidden = false;
    $("pin-input").select();
  }
});

// ---------- Valikko ----------

async function openMenu() {
  if (state.lists.length === 0) {
    const response = await fetch("data/words.json");
    state.lists = (await response.json()).lists;
    renderListOptions();
  }
  restoreSettings();
  showScreen("menu");
}

function renderListOptions() {
  const container = $("list-options");
  container.replaceChildren(
    ...state.lists.map((list, i) => {
      const label = document.createElement("label");
      label.className = "option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "list";
      input.value = list.id;
      input.checked = i === 0;
      label.append(input, ` ${list.name} (${list.words.length})`);
      return label;
    }),
  );
}

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value;
}

function restoreSettings() {
  const settings = load("settings", {});
  for (const name of ["list", "mode", "direction"]) {
    const input = document.querySelector(`input[name="${name}"][value="${settings[name]}"]`);
    if (input) input.checked = true;
  }
}

$("start-btn").addEventListener("click", () => {
  const listId = selectedValue("list");
  state.mode = selectedValue("mode");
  state.direction = selectedValue("direction");
  save("settings", { list: listId, mode: state.mode, direction: state.direction });

  const list = state.lists.find((l) => l.id === listId);
  startQuiz(list.words);
});

// ---------- Harjoitus ----------

function startQuiz(words) {
  state.questions = buildQuestions(words, state.direction);
  state.index = 0;
  state.missed = [];
  showScreen("quiz");
  showQuestion();
}

function currentQuestion() {
  return state.questions[state.index];
}

function showQuestion() {
  const q = currentQuestion();
  $("progress").textContent = `${state.index + 1} / ${state.questions.length}`;
  $("prompt").textContent = q.prompt;
  $("feedback").hidden = true;
  $("next-btn").hidden = true;

  $("mode-cards").hidden = state.mode !== "cards";
  $("mode-choice").hidden = state.mode !== "choice";
  $("mode-write").hidden = state.mode !== "write";

  if (state.mode === "cards") {
    $("card-answer").hidden = true;
    $("reveal-btn").hidden = false;
    $("self-grade").hidden = true;
  } else if (state.mode === "choice") {
    renderChoices(q);
  } else {
    $("write-input").value = "";
    $("write-input").disabled = false;
    $("check-btn").hidden = false;
    $("write-input").focus();
  }
}

function recordResult(correct) {
  if (!correct) state.missed.push(currentQuestion());
}

function showFeedback(text, kind) {
  const el = $("feedback");
  el.textContent = text;
  el.className = `feedback ${kind}`;
  el.hidden = false;
  $("next-btn").hidden = false;
  $("next-btn").focus();
}

// Sanakortit
$("reveal-btn").addEventListener("click", () => {
  $("card-answer").textContent = currentQuestion().answer;
  $("card-answer").hidden = false;
  $("reveal-btn").hidden = true;
  $("self-grade").hidden = false;
});

$("knew-btn").addEventListener("click", () => gradeCard(true));
$("didnt-btn").addEventListener("click", () => gradeCard(false));

function gradeCard(knew) {
  recordResult(knew);
  nextQuestion();
}

// Monivalinta
function renderChoices(q) {
  $("choices").replaceChildren(
    ...q.choices.map((choice) => {
      const button = document.createElement("button");
      button.className = "btn choice";
      button.textContent = choice;
      button.addEventListener("click", () => answerChoice(button, choice));
      return button;
    }),
  );
}

function answerChoice(clicked, choice) {
  const q = currentQuestion();
  const correct = choice === q.answer;
  for (const button of $("choices").children) {
    button.disabled = true;
    if (button.textContent === q.answer) button.classList.add("good");
  }
  if (!correct) clicked.classList.add("bad");
  recordResult(correct);
  showFeedback(correct ? "Oikein! 🎉" : `Oikea vastaus: ${q.answer}`, correct ? "correct" : "wrong");
}

// Kirjoitus
$("mode-write").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!$("next-btn").hidden) return nextQuestion();

  const q = currentQuestion();
  const result = checkAnswer($("write-input").value, q.answer);
  $("write-input").disabled = true;
  $("check-btn").hidden = true;

  if (result === "correct") {
    recordResult(true);
    showFeedback("Oikein! 🎉", "correct");
  } else if (result === "missing-article") {
    recordResult(true);
    showFeedback(`Melkein! Muista artikkeli: ${q.answer}`, "almost");
  } else {
    recordResult(false);
    showFeedback(`Oikea vastaus: ${q.answer}`, "wrong");
  }
});

$("next-btn").addEventListener("click", nextQuestion);

function nextQuestion() {
  state.index++;
  if (state.index < state.questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

$("quit-btn").addEventListener("click", openMenu);

// ---------- Tulokset ----------

function showResult() {
  const total = state.questions.length;
  const right = total - state.missed.length;
  $("result-title").textContent =
    right === total ? `Kaikki oikein! ${right} / ${total} ⭐` : `Osasit ${right} / ${total}`;

  $("missed").hidden = state.missed.length === 0;
  $("missed-list").replaceChildren(
    ...state.missed.map((q) => {
      const li = document.createElement("li");
      li.textContent = `${q.prompt} = ${q.answer}`;
      return li;
    }),
  );
  showScreen("result");
}

$("retry-btn").addEventListener("click", () => {
  // Kysymykset käännetään takaisin sanapareiksi oikeaan suuntaan.
  const words = state.missed.map((q) =>
    state.direction === "fi-sv" ? { fi: q.prompt, sv: q.answer } : { fi: q.answer, sv: q.prompt },
  );
  startQuiz(words);
});

$("menu-btn").addEventListener("click", openMenu);

init();
