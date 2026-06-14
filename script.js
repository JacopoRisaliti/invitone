const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const pixelScaleFactor = 1;
const spriteSize = 1;

let w, h;
function resize() {
  w = canvas.width = window.innerWidth / pixelScaleFactor;
  h = canvas.height = window.innerHeight / pixelScaleFactor;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resize);
resize();

// 🌬️ cursore = vento locale
let pointer = { x: w / 2, y: h / 2 };

// Funzione unica per aggiornare la posizione
function aggiornaPosizione(x, y) {
  pointer.x = x / pixelScaleFactor;
  pointer.y = y / pixelScaleFactor;
}

// Per il COMPUTER (Muovendo il mouse)
window.addEventListener("mousemove", (e) => {
  aggiornaPosizione(e.clientX, e.clientY);
});

// Per il TELEFONO (Trascinando il dito)
window.addEventListener("touchmove", (e) => {
  // Prendiamo la posizione del primo dito che tocca lo schermo
  const tocco = e.touches[0];
  aggiornaPosizione(tocco.clientX, tocco.clientY);
});

// 🍃 prato iniziale
const leaves = [];
const N = 10000;

for (let i = 0; i < N; i++) {
  let x = Math.random() * w;
  let y = Math.random() * h;

  const colors = [
  "rgba(56, 238, 132, 0.7)",
  "rgba(255, 255, 255, 0.7)",
  "rgba(15, 53, 32, 0.7)"
];

const symbols = ["🍃", "·", "*"];

leaves.push({
  x,
  y,
  vx: 0,
  vy: 0,
  baseX: x,
  baseY: y,

  symbol: symbols[Math.floor(Math.random() * 3)],
  color: colors[Math.floor(Math.random() * 3)]
});
}

// 🌬️ vento locale (repulsione)
function wind(p) {
  let dx = p.x - pointer.x;
  let dy = p.y - pointer.y;

  let distSq = dx * dx + dy * dy;
  let radius = 33;
  let radiusSq = radius * radius;

  if (distSq < radiusSq) {
    let force = (radiusSq - distSq) / radiusSq;

    p.vx += dx * 0.3 * force;
    p.vy += dy * 0.3 * force;
    p.angle += (p.vx + p.vy) * 0.01;
  }

  // micro caos naturale
  p.vx += (Math.random() - 0.5) * 0.02;
  p.vy += (Math.random() - 0.5) * 0.02;
}

// 🌿 ritorno al prato (FORZA DI MEMORIA)
function returnToBase(p) {
  p.vx += (p.baseX - p.x) * 0.003;
  p.vy += (p.baseY - p.y) * 0.003;
}

function draw() {
  ctx.fillStyle = "#05274a";
  ctx.fillRect(0, 0, w, h);

  for (let p of leaves) {
    wind(p);
    returnToBase(p);

    // 🌬️ attrito (equilibrio energia)
    p.vx *= 0.90;
    p.vy *= 0.90;

    p.x += p.vx;
    p.y += p.vy;

    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, spriteSize, spriteSize);
    ctx.fillText(p.symbol, p.x, p.y);
  }

  requestAnimationFrame(draw);
}

draw();