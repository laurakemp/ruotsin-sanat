// Kevyt PIN-kysely. Tämä ei ole oikea tietoturvasuoja: se vain estää satunnaisia
// kävijöitä käyttämästä sovellusta, jos linkki leviää.

import { PIN_HASH } from "./config.js";
import { load, save } from "./storage.js";

const SALT = "ruotsin-sanat:";

export function isPinRequired() {
  return PIN_HASH !== "" && load("pinHash") !== PIN_HASH;
}

export async function tryUnlock(pin) {
  const hash = await sha256(SALT + pin.trim());
  if (hash !== PIN_HASH) return false;
  save("pinHash", PIN_HASH);
  return true;
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
