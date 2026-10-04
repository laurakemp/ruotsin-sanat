// Sanalistan lataus. Muuntaa listan yhtenäiseen muotoon, jotta muu koodi voi
// olettaa, että jokaisella sanalla on taulukko muotoja.

const DEFAULT_FORMS = ["ruotsiksi"];

export async function loadList() {
  const response = await fetch("data/words.json", { cache: "no-cache" });
  const list = await response.json();
  return {
    ...list,
    forms: list.forms ?? DEFAULT_FORMS,
    formHints: list.formHints ?? [],
    example: list.example ?? null,
    words: list.words.map((word) => ({
      fi: word.fi,
      sv: Array.isArray(word.sv) ? word.sv : [word.sv],
    })),
  };
}
