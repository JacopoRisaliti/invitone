const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const pixelScaleFactor = 1;

let w, h;
function resize() {
  w = canvas.width = window.innerWidth / pixelScaleFactor;
  h = canvas.height = window.innerHeight / pixelScaleFactor;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  
  ctx.font = "17px serif"; 
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
}
window.addEventListener("resize", resize);
resize();

// 🌬️ cursore = vento locale
let pointer = { x: w / 2, y: h / 2 };

// 🌙 STATO DELLA LUNA E DELLE FOGLIE
let isTouching = false;    
let deveEmergere = false;  
let moonTimer = null;      
let leavesTimer = null;    // ⏱️ Nuovo timer per la sparizione di foglie/punti
let isFadingLeaves = false; // 🎭 Controlla se foglie e punti devono diventare trasparenti
let moon = { x: 0, y: 0, scale: 0, maxScale: 1 };

function aggiornaPosizione(x, y) {
  pointer.x = x / pixelScaleFactor;
  pointer.y = (y + window.scrollY) / pixelScaleFactor; 
}

function startTouch(clientX, clientY) {
  isTouching = true;
  deveEmergere = false;
  isFadingLeaves = false; // Al tocco, resetta subito la trasparenza (tutto torna visibile)
  
  // Cancella tutti i timer attivi
  if (moonTimer) { clearTimeout(moonTimer); moonTimer = null; }
  if (leavesTimer) { clearTimeout(leavesTimer); leavesTimer = null; }
  
  aggiornaPosizione(clientX, clientY);
}

function endTouch() {
  isTouching = false;
  
  moon.x = pointer.x;
  moon.y = pointer.y;

  // 1️⃣ Primo Timer: Aspetta 1 secondo per far emergere la luna
  moonTimer = setTimeout(() => {
    if (!isTouching) { 
      deveEmergere = true;
      
      // 2️⃣ Secondo Timer: Dopo che la luna è emersa, aspetta un altro secondo (1000ms) per far sparire foglie e punti
      leavesTimer = setTimeout(() => {
        if (!isTouching && deveEmergere) {
          isFadingLeaves = true;
        }
      }, 5000);

    }
  }, 5000);
}

// Eventi Mouse (Computer)
window.addEventListener("mousemove", (e) => { aggiornaPosizione(e.clientX, e.clientY); });
window.addEventListener("mousedown", (e) => { startTouch(e.clientX, e.clientY); });
window.addEventListener("mouseup", () => { endTouch(); });

// Eventi Touch (Telefono)
window.addEventListener("touchmove", (e) => { const tocco = e.touches[0]; aggiornaPosizione(tocco.clientX, tocco.clientY); });
window.addEventListener("touchstart", (e) => { const tocco = e.touches[0]; startTouch(tocco.clientX, tocco.clientY); });
window.addEventListener("touchend", () => { endTouch(); });


// 🍃 prato iniziale con gestione dell'opacità individuale
const leaves = [];
const N = 1500; 

for (let i = 0; i < N; i++) {
  let x = Math.random() * w;
  let y = Math.random() * h;

  const symbols = ["🍃", "·", "*"];
  const scelto = symbols[Math.floor(Math.random() * symbols.length)];
  
  let coloreScelto = "";

  if (scelto === "🍃") {
    coloreScelto = "rgba(58, 160, 92, 0.84)";  
  } else if (scelto === "*") {
    coloreScelto = "rgb(255, 255, 255)";     
  } else if (scelto === "·") {
    coloreScelto = "rgb(255, 242, 64)";   
  }

  leaves.push({
    x,
    y,
    vx: 0,
    vy: 0,
    baseX: x,
    baseY: y,
    symbol: scelto,       
    color: coloreScelto,
    opacity: 1.0 // 🌟 Ogni particella parte con opacità massima (100%)
  });
}

// 🌬️ vento locale (repulsione)
function wind(p) {
  let dx = p.x - pointer.x;
  let dy = p.y - pointer.y;
  let distSq = dx * dx + dy * dy;
  let radius = 51; 
  let radiusSq = radius * radius;

  if (distSq < radiusSq) {
    let force = (radiusSq - distSq) / radiusSq;
    p.vx += dx * 0.5 * force; 
    p.vy += dy * 0.5 * force;
  }
  p.vx += (Math.random() - 0.5) * 0.02;
  p.vy += (Math.random() - 0.5) * 0.02;
}

// 🌿 ritorno al prato
function returnToBase(p) {
  p.vx += (p.baseX - p.x) * 0.005;
  p.vy += (p.baseY - p.y) * 0.005;
}

function draw() {
  ctx.fillStyle = "#05274a";
  ctx.fillRect(0, 0, w, h);

  // 🌙 LOGICA DELLA LUNA
  if (!isTouching && deveEmergere) {
    if (moon.scale < moon.maxScale) moon.scale += 0.02; 
  } else {
    if (moon.scale > 0) moon.scale -= 0.05; 
  }

  // Disegno grafico della luna
  if (moon.scale > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 254, 230, " + (moon.scale * 0.9) + ")"; 
    let raggioLuna = 25 * moon.scale; 
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, raggioLuna, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#05274a";
    ctx.beginPath();
    ctx.arc(moon.x + (raggioLuna * 0.4), moon.y - (raggioLuna * 0.2), raggioLuna * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 🍃 DISEGNO DELLE FOGLIE E DELLE STELLE
  for (let p of leaves) {
    wind(p);
    returnToBase(p);

    p.vx *= 0.90;
    p.vy *= 0.90;
    p.x += p.vx;
    p.y += p.vy;

    // 🌟 GESTIONE DELLE TRASPARENZE DINAMICHE
    if (isFadingLeaves) {
      // Se dobbiamo nasconderle, riduciamo l'opacità di foglie e punti
      if (p.symbol === "🍃" || p.symbol === "·") {
        if (p.opacity > 0) p.opacity -= 0.02; // Velocità di sparizione
      }
    } else {
      // Se l'utente tocca lo schermo, tutto ritorna visibile gradualmente (o all'istante se aumenti il valore)
      if (p.opacity < 1.0) p.opacity += 0.1; 
    }

    // Se l'opacità è a 0, saltiamo il disegno per risparmiare calcoli
    if (p.opacity <= 0) continue;

    ctx.save();
    // Applichiamo l'opacità corrente al disegno nel Canvas globalmente per questa particella
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    if (p.symbol === "🍃") {
      ctx.filter = "hue-rotate(0deg)"; 
      ctx.fillText(p.symbol, p.x, p.y);
    } else {
      ctx.fillText(p.symbol, p.x, p.y);
    }
    ctx.restore();
  }

  requestAnimationFrame(draw);
}

draw();