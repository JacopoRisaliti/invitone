const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// 🌬️ cursore = vento locale
let pointer = { x: w / 2, y: h / 2 };

window.addEventListener("mousemove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
});

// 🍃 prato iniziale
const leaves = [];
const N = 6000;

for (let i = 0; i < N; i++) {
  let x = Math.random() * w;
  let y = Math.random() * h;

  const colors = [
  "rgba(124,255,178,0.7)",
  "rgba(255,180,90,0.7)",
  "rgba(80,200,120,0.7)"
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

    ctx.fillStyle = "rgba(124,255,178,0.9)";
    ctx.fillRect(p.x, p.y, 1, 1);
    ctx.fillText(p.symbol, p.x, p.y);
  }

  requestAnimationFrame(draw);
}

draw();