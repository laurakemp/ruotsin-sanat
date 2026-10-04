// Pieni kääre localStoragelle. Selain voi estää tallennuksen (esim. yksityinen
// selaus), joten virheet niellään eikä sovellus kaadu niihin.

const PREFIX = "ruotsin-sanat:";

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Tallennus ei onnistunut, sovellus toimii silti.
  }
}
