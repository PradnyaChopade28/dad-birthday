/* =========================================================
   EDIT ME: all the words live here.
   ========================================================= */
const CONTENT = {
  from: "your daughter",

  quote: "My biggest inspiration, my constant guide, and the person who does so much for us without ever asking for anything in return. I’m so grateful I have you as my dad. ❤️",

  letter:
`Happy Birthday, Dad ❤️

You are literally my everything — my inspiration, my guide, and the person who always motivates me to do better. You do so much for us, often without even saying a word, and the way you care for me means more than I can ever explain.

I feel so lucky and grateful to have you as my dad. I may not say it often, but I see everything you do for us, and I hope one day I can make you as proud and happy as you make me.

Love you always, Dad. ❤️`,

  // Report card lines: [subject, grade]. Edit freely.
  report: [
    ["Patience", "A+"],
    ["Guidance", "A+"],
    ["Motivation", "A+"],
    ["Taking care of us", "A+"],
    ["Being my Dad", "A++"],
  ],
  reportRemark: "Teacher’s remark: Best Dad in the world. Please never change. ⭐",

  // Photos: put photo1 ... photo5 in the /images folder (jpg, jpeg, png or webp).
  // Change the captions to whatever you like.
  photos: [
    { file: "photo1", caption: "My first hero 🦸‍♂️" },
    { file: "photo2", caption: "Our favourite smile 😊" },
    { file: "photo3", caption: "Best teacher, best Dad 📚" },
    { file: "photo4", caption: "Moments I treasure 💛" },
    { file: "photo5", caption: "Love you, Dad ❤️" },
  ],

  celebrateLine: "Hip hip hooray!",
  celebrateSub: "Happy Birthday to the best teacher and the best Dad in the world 🌟",
};

/* ========================= helpers ========================= */
const $ = (s, r = document) => r.querySelector(s);
const PALETTE = ["#FFD76A", "#FF8F8F", "#8FD0FF", "#9BF0C8", "#FFF4D6", "#FFB86B"];

document.addEventListener("DOMContentLoaded", () => {
  $("#from-name").textContent = CONTENT.from;
  buildLetters($("#t1"));
  buildLetters($("#t2"), 14);
  buildLetters($("#cele-line"));
  $("#cele-sub").textContent = CONTENT.celebrateSub;
  buildQuote();
  buildPhotos();
  buildReport();
  buildTree();
  spawnAmbient();

  setupDeck();
  setupSound();
  setupCake();
  $("#replay-btn").addEventListener("click", e => { e.stopPropagation(); location.reload(); });

  tryPlayMusic();
  armAutoplayOnFirstTouch();
});

/* big animated headline letters */
function buildLetters(el, startIndex = 0) {
  const text = el.dataset.text;
  let i = startIndex;
  text.split(" ").forEach(word => {
    const w = document.createElement("span");
    w.className = "word";
    Array.from(word).forEach(chr => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = chr;
      s.style.setProperty("--i", i);
      s.style.setProperty("--c", PALETTE[i % PALETTE.length]);
      w.appendChild(s);
      i++;
    });
    el.appendChild(w);
  });
}

/* quote, word by word */
function buildQuote() {
  const p = $("#quote-text");
  CONTENT.quote.split(" ").forEach((word, i) => {
    const s = document.createElement("span");
    s.className = "w";
    s.textContent = word;
    s.style.setProperty("--i", i);
    p.appendChild(s);
    p.appendChild(document.createTextNode(" "));
  });
}

/* ===================== ambient falling bits ===================== */
function spawnAmbient() {
  const wrap = $("#ambient");
  const emoji = ["⭐", "✨", "📚", "✏️", "🍎", "💛", "🎈", "💙"];
  for (let i = 0; i < 18; i++) {
    const b = document.createElement("span");
    b.className = "bit";
    if (i % 6 === 0) {
      const img = document.createElement("img");
      img.src = "stickers/dad-heart.png";
      img.alt = "";
      b.appendChild(img);
      b.style.width = "26px";
    } else {
      b.textContent = emoji[Math.floor(Math.random() * emoji.length)];
      b.style.fontSize = (0.9 + Math.random() * 0.9) + "rem";
    }
    b.style.left = Math.random() * 100 + "%";
    const fall = 10 + Math.random() * 9, sway = 3 + Math.random() * 3, delay = Math.random() * 14;
    b.style.animationDuration = `${fall}s, ${sway}s`;
    b.style.animationDelay = `${delay}s, ${delay}s`;
    wrap.appendChild(b);
  }
}

/* ===================== slide deck ===================== */
let slides = [];
let current = -1;
const tapIntercept = {};   // slide id -> function returning true if it used the tap

function setupDeck() {
  slides = Array.from(document.querySelectorAll("#app .slide"));
  slides.forEach(s => {
    s.addEventListener("click", () => {
      if (tapIntercept[s.id] && tapIntercept[s.id]()) return;
      if (s.classList.contains("ready")) nextSlide();
    });
  });
  $("#prev-btn").addEventListener("click", e => { e.stopPropagation(); goToSlide(current - 1); });
  goToSlide(0);
}

function goToSlide(i) {
  if (i < 0 || i >= slides.length || i === current) return;
  const prev = slides[current];
  if (prev) {
    prev.classList.remove("active");
    prev.classList.add("leaving");
    setTimeout(() => prev.classList.remove("leaving"), 520);
    onLeave(prev.id);
  }
  current = i;
  const slide = slides[i];
  slide.classList.remove("leaving");
  slide.classList.add("active");
  $("#pencil-fill").style.width = ((i + 1) / slides.length * 100) + "%";
  $("#prev-btn").hidden = i === 0;
  onEnter(slide.id, slide);
}
const nextSlide = () => goToSlide(current + 1);
const markReady = s => s.classList.add("ready");

let timers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
function clearTimers() { timers.forEach(clearTimeout); timers = []; }

let fallTimer = null;

function onEnter(id, slide) {
  clearTimers();
  if (id === "s-title") { markReady(slide); }
  if (id === "s-quote") { markReady(slide); }
  if (id === "s-photos") { markReady(slide); }
  if (id === "s-report") {
    markReady(slide);
    later(() => burstConfetti(innerWidth * 0.75, innerHeight * 0.7, 40), 3900);
  }
  if (id === "s-letter") { startLetter(slide); }
  if (id === "s-celebrate") {
    markReady(slide);
    later(() => burstConfetti(innerWidth * 0.5, innerHeight * 0.35, 110), 300);
    later(() => burstConfetti(innerWidth * 0.2, innerHeight * 0.5, 50), 800);
    later(() => burstConfetti(innerWidth * 0.8, innerHeight * 0.5, 50), 1100);
    launchBalloons();
    tryPlayMusic();
  }
  if (id === "s-tree") {
    later(() => burstConfetti(innerWidth * 0.5, innerHeight * 0.3, 60), 2300);
    fallTimer = setInterval(dropHeart, 650);
  }
}
function onLeave(id) {
  if (id === "s-tree" && fallTimer) { clearInterval(fallTimer); fallTimer = null; }
}

/* ===================== photo stack ===================== */
const EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"];
let order = [], busy = false, shown = 1;

function loadPhoto(img, wrap, base) {
  let k = 0;
  img.onerror = () => {
    k++;
    if (k < EXTS.length) img.src = `images/${base}.${EXTS[k]}`;
    else { img.onerror = null; img.remove(); wrap.classList.add("missing"); }
  };
  img.src = `images/${base}.${EXTS[0]}`;
}

function buildPhotos() {
  const stack = $("#stack");
  const n = CONTENT.photos.length;
  CONTENT.photos.forEach((p, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "pcard";
    card.setAttribute("aria-label", "Next photo");
    card.style.setProperty("--r", ((i % 2 ? 1 : -1) * (1.5 + (i * 1.7) % 3)).toFixed(1));
    card.innerHTML = `<span class="tape"></span><span class="pimg"><img alt=""></span><span class="pcap"></span>`;
    card.querySelector(".pcap").textContent = p.caption || "";
    const img = card.querySelector("img");
    img.alt = p.caption || "";
    loadPhoto(img, card.querySelector(".pimg"), p.file);
    card.addEventListener("click", e => { e.stopPropagation(); flingTop(); });
    stack.appendChild(card);
    order.push(card);
  });
  layoutStack();
  updateCount(n);
}
function layoutStack() {
  const n = order.length;
  order.forEach((c, k) => { c.style.setProperty("--k", k); c.style.zIndex = n - k; });
}
function updateCount(n) { $("#photo-count").textContent = `${shown} / ${n}`; }
function flingTop() {
  if (busy || order.length < 2) return;
  busy = true;
  const top = order.shift();
  order.push(top);
  top.classList.add("fling");
  order.slice(0, -1).forEach((c, k) => { c.style.setProperty("--k", k); c.style.zIndex = order.length - k; });
  shown = shown % order.length + 1;
  updateCount(order.length);
  setTimeout(() => {
    top.style.transition = "none";
    top.style.setProperty("--k", order.length - 1);
    top.style.zIndex = 1;
    top.classList.remove("fling");
    void top.offsetWidth;
    top.style.transition = "";
    busy = false;
  }, 560);
}

/* ===================== report card ===================== */
function buildReport() {
  const rows = $("#report-rows");
  CONTENT.report.forEach(([subject, grade], i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.style.setProperty("--i", i);
    row.innerHTML = `<span></span><span class="grade"></span>`;
    row.children[0].textContent = subject;
    row.children[1].textContent = grade;
    row.children[1].style.setProperty("--i", i);
    rows.appendChild(row);
  });
  $("#report-remark").textContent = CONTENT.reportRemark;
}

/* ===================== letter typewriter ===================== */
let typing = false, typed = false, typeTimer = null;
function startLetter(slide) {
  const el = $("#letter-text");
  if (typed) { markReady(slide); return; }
  if (typing) return;
  typing = true;
  const chars = Array.from(CONTENT.letter);
  let i = 0;
  const box = $("#notebook");
  const step = () => {
    el.textContent = chars.slice(0, i).join("");
    box.scrollTop = box.scrollHeight;
    i++;
    if (i <= chars.length) typeTimer = setTimeout(step, 24);
    else finishLetter(slide);
  };
  later(step, 900);
  tapIntercept["s-letter"] = () => {
    if (typing && !typed) { clearTimeout(typeTimer); el.textContent = CONTENT.letter; finishLetter(slide); return true; }
    return false;
  };
}
function finishLetter(slide) {
  typing = false; typed = true;
  $("#letter-text").textContent = CONTENT.letter;
  markReady(slide);
}

/* ===================== oven + cake ===================== */
function setupCake() {
  const oven = $("#oven"), cake = $("#cake"), timer = $("#oven-timer");
  const steam = $("#steam"), hint = $("#cake-hint"), slide = $("#s-cake");
  let stage = "idle";

  oven.addEventListener("click", e => {
    e.stopPropagation();
    if (stage !== "idle") return;
    stage = "baking";
    oven.classList.add("baking");
    steam.classList.add("on");
    hint.textContent = "baking… 🔥";
    let t = 3;
    timer.textContent = "0:0" + t;
    const iv = setInterval(() => {
      t--;
      if (t > 0) { timer.textContent = "0:0" + t; return; }
      clearInterval(iv);
      timer.textContent = "DING!";
      oven.classList.remove("baking");
      oven.classList.add("ding");
      const r = oven.getBoundingClientRect();
      burstConfetti(r.left + r.width / 2, r.top + 30, 30);
      setTimeout(() => {
        oven.hidden = true;
        steam.classList.remove("on");
        cake.hidden = false;
        stage = "baked";
        hint.textContent = "tap the cake to blow out the candles 🕯️";
        const c = cake.getBoundingClientRect();
        burstConfetti(c.left + c.width / 2, c.top, 40);
      }, 800);
    }, 900);
  });

  cake.addEventListener("click", e => {
    e.stopPropagation();
    if (stage !== "baked") return;
    stage = "blown";
    cake.classList.add("blown");
    hint.textContent = "wish made! 🎉 tap anywhere to continue →";
    const r = cake.getBoundingClientRect();
    burstConfetti(r.left + r.width / 2, r.top, 70);
    markReady(slide);
  });
}

/* ===================== balloons ===================== */
function launchBalloons() {
  const set = ["🎈", "🎈", "🎈", "🎉", "💛", "⭐"];
  for (let i = 0; i < 14; i++) {
    later(() => {
      const b = document.createElement("span");
      b.className = "balloon";
      b.textContent = set[Math.floor(Math.random() * set.length)];
      b.style.left = (4 + Math.random() * 90) + "%";
      b.style.fontSize = (2 + Math.random() * 2.2) + "rem";
      b.style.setProperty("--sx", (Math.random() * 80 - 40) + "px");
      b.style.setProperty("--rot", (Math.random() * 30 - 15) + "deg");
      b.style.animationDuration = (5 + Math.random() * 4) + "s";
      $("#s-celebrate").appendChild(b);
      setTimeout(() => b.remove(), 10000);
    }, i * 260);
  }
}

/* ===================== heart tree ===================== */
const HEART = "M0 6 C-12 -2 -8 -12 0 -5 C8 -12 12 -2 0 6 Z";
const HEART_COLORS = ["#FF5C7A", "#FF8FA3", "#E5484D", "#FF6F91", "#FFB3C6", "#FFD76A", "#FF7BAC"];
function buildTree() {
  const g = $("#leaves");
  const NS = "http://www.w3.org/2000/svg";
  const count = 92;
  // sunflower spiral: spreads hearts evenly over an oval canopy, with a little jitter
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt((i + 0.5) / count);
    const th = i * 2.39996;
    let x = 150 + 124 * r * Math.cos(th) + (Math.random() * 8 - 4);
    let y = 100 + 86 * r * Math.sin(th) + (Math.random() * 8 - 4);
    if (y > 176) y = 176 - Math.random() * 10;
    const outer = document.createElementNS(NS, "g");
    const s = 0.9 + Math.random() * 0.9;
    outer.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Math.random() * 50 - 25).toFixed(0)}) scale(${s.toFixed(2)})`);
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", HEART);
    p.setAttribute("fill", HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)]);
    p.setAttribute("class", "leaf");
    p.style.setProperty("--i", i);
    p.style.setProperty("--sw", (2.6 + Math.random() * 2.2).toFixed(1) + "s");
    outer.appendChild(p);
    g.appendChild(outer);
  }
  // tap the tree for a shower of hearts
  $("#tree-scene").addEventListener("click", e => {
    e.stopPropagation();
    burstConfetti(e.clientX, e.clientY, 36);
    for (let i = 0; i < 4; i++) dropHeart();
  });
}
function dropHeart() {
  const scene = $("#tree-scene");
  if (!scene) return;
  const h = document.createElement("span");
  h.className = "fall-heart";
  h.textContent = ["💖", "💗", "💕", "❤️", "💛"][Math.floor(Math.random() * 5)];
  h.style.left = (14 + Math.random() * 72) + "%";
  h.style.top = (14 + Math.random() * 30) + "%";
  h.style.fontSize = (0.9 + Math.random() * 0.8) + "rem";
  h.style.setProperty("--fy", (110 + Math.random() * 60) + "px");
  h.style.setProperty("--fx", (Math.random() * 50 - 25) + "px");
  h.style.setProperty("--fr", (Math.random() * 180 - 90) + "deg");
  scene.appendChild(h);
  setTimeout(() => h.remove(), 3700);
}

/* ===================== music ===================== */
function setupSound() {
  const btn = $("#sound-toggle"), audio = $("#bg-audio");
  btn.addEventListener("click", e => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play().then(() => { btn.textContent = "🔊"; btn.classList.add("playing"); })
        .catch(() => alert("Add your song to the audio/ folder as \"theme-song.mp3\" first (see README)."));
    } else {
      audio.pause(); btn.textContent = "🔈"; btn.classList.remove("playing");
    }
  });
}
function tryPlayMusic() {
  const audio = $("#bg-audio"), btn = $("#sound-toggle");
  if (!audio || !audio.paused) return;
  const p = audio.play();
  if (p && p.then) p.then(() => { btn.textContent = "🔊"; btn.classList.add("playing"); }).catch(() => {});
}
/* Browsers only allow sound after a first tap, so we start the music on the
   very first tap anywhere (which is the "tap anywhere to begin" on page 1). */
function armAutoplayOnFirstTouch() {
  const start = () => tryPlayMusic();
  document.addEventListener("pointerdown", start, { once: true });
  document.addEventListener("keydown", start, { once: true });
}

/* ===================== confetti (canvas) ===================== */
const canvas = $("#fx"), ctx = canvas.getContext("2d");
let particles = [], animating = false;
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize); resize();
const COLORS = ["#FFD76A", "#FF8F8F", "#8FD0FF", "#9BF0C8", "#FFF4D6", "#FFB86B", "#FF5C7A"];
const SHAPES = ["square", "circle", "heart", "star"];

function burstConfetti(x, y, count = 40) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 6;
    particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2.5,
      size: 6 + Math.random() * 7, color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      rot: Math.random() * 6, spin: (Math.random() - .5) * .35, life: 0, max: 70 + Math.random() * 50,
    });
  }
  if (!animating) loop();
}
function heartPath(s) {
  ctx.beginPath(); const k = s / 2;
  ctx.moveTo(0, k * .3);
  ctx.bezierCurveTo(0, -k * .4, -k, -k * .4, -k, k * .1);
  ctx.bezierCurveTo(-k, k * .6, 0, k * .8, 0, k * 1.1);
  ctx.bezierCurveTo(0, k * .8, k, k * .6, k, k * .1);
  ctx.bezierCurveTo(k, -k * .4, 0, -k * .4, 0, k * .3);
  ctx.fill();
}
function starPath(s) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? s * .22 : s * .55, a = i * Math.PI / 5 - Math.PI / 2;
    ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill();
}
function loop() {
  animating = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.vy += .13; p.x += p.vx; p.y += p.vy; p.rot += p.spin; p.life++;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
    ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
    if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 6.3); ctx.fill(); }
    else if (p.shape === "heart") heartPath(p.size);
    else if (p.shape === "star") starPath(p.size);
    else ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * .6);
    ctx.restore();
  });
  particles = particles.filter(p => p.life < p.max && p.y < canvas.height + 40);
  if (particles.length) requestAnimationFrame(loop);
  else { animating = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}
