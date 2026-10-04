// Konfettisade onnistumisen kunniaksi. Ei näytetä, jos käyttäjä on pyytänyt
// laitteen asetuksista vähemmän liikettä.

const PIECES = ["🎉", "⭐", "🇸🇪", "✨", "💛", "💙"];
const COUNT = 40;
const DURATION_MS = 2500;

export function celebrate() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.className = "confetti";
  layer.setAttribute("aria-hidden", "true");

  for (let i = 0; i < COUNT; i++) {
    const piece = document.createElement("span");
    piece.textContent = PIECES[i % PIECES.length];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.fontSize = `${16 + Math.random() * 16}px`;
    layer.append(piece);
  }

  document.body.append(layer);
  setTimeout(() => layer.remove(), DURATION_MS + 600);
}
