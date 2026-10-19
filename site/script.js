// ---------------------------------------------------------------
// CONFIG: swap these placeholders for the real details
// ---------------------------------------------------------------
const CONFIG = {
  whatsapp: "254700000000", // PLACEHOLDER: country code + number, no "+" or spaces
  openHour: 8,              // 8:00am
  closeHour: 21.5,          // 9:30pm
  // Hidden until the café agrees. To show it, use e.g.:
  // "Top score each week wins a free Scud. Show your score at the counter!"
  gamePrize: "",
};

// Shared sticky notes. Paste the config object from your Firebase project
// (Project settings → Your apps → Web app) to share notes between visitors.
// Left as null, notes are saved only in each visitor's own browser.
const FIREBASE_CONFIG = null; // PLACEHOLDER

// ---------------------------------------------------------------
// ILLUSTRATIONS: symbol id → viewBox (symbols live at the end of index.html)
// ---------------------------------------------------------------
const VIEWBOX = {
  "i-iced": "0 0 200 220", "i-shake": "0 0 200 220", "i-hot": "0 0 200 220",
  "i-waffle": "0 0 200 200", "i-scud": "0 0 200 220", "i-bowl": "0 0 200 160",
  "i-mojito": "0 0 200 220", "i-caramel": "0 0 200 220", "i-tiramisu": "0 0 200 220",
  "i-matchamisu": "0 0 200 220", "i-strawmatcha": "0 0 200 220", "i-lotus": "0 0 200 220",
};
const MOTION = { "i-iced": "clink", "i-mojito": "clink", "i-scud": "clink", "i-caramel": "clink", "i-tiramisu": "clink", "i-matchamisu": "clink", "i-strawmatcha": "clink" };
// Cold drinks get condensation that slides down on hover
const DRIP = new Set(["i-iced", "i-mojito", "i-scud", "i-caramel", "i-tiramisu", "i-matchamisu", "i-strawmatcha", "i-lotus"]);

function illus(art) {
  const { id, vars = {} } = art;
  const style = Object.entries(vars).map(([k, v]) => `--${k}:${v}`).join(";");
  const steam = id === "i-hot" ? `<use href="#i-steam" class="steam"/>` : "";
  const drip = DRIP.has(id) ? `<use href="#i-drip" class="drip"/>` : "";
  return `<svg class="illus ${MOTION[id] || "wobble"}" viewBox="${VIEWBOX[id]}" style="${style}" aria-hidden="true"><use href="#${id}"/>${steam}${drip}</svg>`;
}

const ART = {
  signature: { id: "i-lotus" },
  classic: { id: "i-shake", vars: { d1: "#f2c6c0", t: "#d27466" } },
  iced: { id: "i-caramel" },
  matcha: { id: "i-matchamisu" },
  hot: { id: "i-hot" },
  mojito: { id: "i-mojito" },
  waffle: { id: "i-waffle" },
  bowl: { id: "i-bowl" },
  scud: { id: "i-scud" },
};

// ---------------------------------------------------------------
// MENU: fav = founder's favourite. sizes = [small, large] prices.
// suffix is added to item names in the WhatsApp order ("Oreo" -> "Oreo shake").
// ---------------------------------------------------------------
const MENU = {
  drinks: [
    { name: "signature milkshakes", suffix: "shake", art: ART.signature, sizes: [250, 450], items: [
      { name: "Lotus Biscoff", fav: true }, { name: "Oreo", fav: true },
      { name: "Mint choc" }, { name: "Brownie" }, { name: "Coffee" },
    ]},
    { name: "classic milkshakes", suffix: "shake", art: ART.classic, sizes: [150, 250], items: [
      { name: "Vanilla" }, { name: "Strawberry" }, { name: "Chocolate" },
      { name: "Pistachio", fav: true }, { name: "Blueberry" }, { name: "Mango" },
    ]},
    { name: "iced coffee & karak", art: ART.iced, items: [
      { name: "Iced Caramel latte", price: 300, fav: true },
      { name: "Iced Vanilla latte", price: 300 },
      { name: "Iced Tiramisu latte", price: 500, fav: true },
      { name: "Iced Karak", price: 500 },
    ]},
    { name: "matcha", suffix: "matcha", art: ART.matcha, items: [
      { name: "Vanilla", price: 500 },
      { name: "Strawberry", price: 550, fav: true },
      { name: "Matcha misu", price: 650, fav: true },
    ]},
    { name: "hot drinks", art: ART.hot, sizes: [150, 250], items: [
      { name: "Espresso" }, { name: "Cappuccino" }, { name: "Cafe Latte" },
      { name: "Mocha" }, { name: "Cardamom tea" }, { name: "Black / White coffee" },
    ]},
    { name: "mojitos", suffix: "mojito", art: ART.mojito, items: [
      { name: "Classic", price: 450 },
      { name: "Strawberry", price: 450, fav: true },
      { name: "Passion", price: 450 },
    ]},
  ],
  eats: [
    { name: "waffles", suffix: "waffle", art: ART.waffle, items: [
      { name: "Lotus biscoff", price: 450 }, { name: "White chocolate", price: 450 },
      { name: "Oreo", price: 450 }, { name: "Fruits", price: 450 },
    ]},
    { name: "smoothie bowls", suffix: "bowl", art: ART.bowl, note: "Greek yoghurt included.", items: [
      { name: "Nutty monkey", desc: "Peanut butter, banana, milk", price: 400 },
      { name: "Choco monkey", desc: "Chocolate, banana, milk", price: 400 },
    ]},
    { name: "scud", art: ART.scud, items: [
      { name: "Scud", desc: "Strawberries and grapes layered with ice cream on a mango base", price: 300 },
    ]},
  ],
};

// Ordering is switched on/off with data-ordering on <html> in index.html
const ORDERING = document.documentElement.dataset.ordering !== "off";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const fmt = (n) => n.toLocaleString("en-KE");
const store = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function orderLabel(cat, item) {
  if (!cat.suffix || item.name.toLowerCase().includes(cat.suffix)) return item.name;
  return `${item.name} ${cat.suffix}`;
}

function addBtn(name, price, size, extraClass = "") {
  const sizeTxt = size ? `, ${size}` : "";
  if (!ORDERING) return `<span class="add" role="text" aria-label="KES ${price}${sizeTxt}">${price}</span>`;
  return `<button type="button" class="add ${extraClass}" data-add data-name="${name}" data-size="${size}" data-price="${price}" aria-label="Add ${name}${sizeTxt}, KES ${price}">${price}</button>`;
}

// ---------- Render menu ----------
function renderPanel(key) {
  const panel = $(`[data-panel="${key}"]`);
  panel.innerHTML = MENU[key].map((cat) => {
    const sized = Array.isArray(cat.sizes);
    const head = sized
      ? `<div class="cat-sizes" aria-hidden="true"><span>small</span><span>large</span></div>`
      : "";
    const items = cat.items.map((it) => {
      const label = orderLabel(cat, it);
      const prices = sized
        ? cat.sizes.map((p, i) => addBtn(label, p, i ? "large" : "small")).join("")
        : addBtn(label, it.price, "");
      return `<li class="item">
        <span class="item-name"><span>${it.name}${it.fav ? '<span class="heart" title="Founder\'s favourite" aria-label="Founder\'s favourite">♥</span>' : ""}</span>${it.desc ? `<small>${it.desc}</small>` : ""}</span>
        <span class="item-prices">${prices}</span>
      </li>`;
    }).join("");
    return `<article class="cat" data-reveal>
      <div class="cat-head"><div class="cat-title"><span class="cat-ill">${illus(cat.art)}</span><h3>${cat.name}</h3></div>${head}</div>
      ${cat.note ? `<p class="cat-note">${cat.note}</p>` : ""}
      <ul class="items">${items}</ul>
    </article>`;
  }).join("");
}

renderPanel("drinks");
renderPanel("eats");

// ---------- Tabs ----------
const tabs = $$('[role="tab"]');
function selectTab(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    const panel = $("#" + t.getAttribute("aria-controls"));
    panel.hidden = !on;
    if (on) {
      $$("[data-reveal]", panel).forEach((el) => el.classList.add("is-in"));
      panel.classList.remove("is-switching"); void panel.offsetWidth; panel.classList.add("is-switching");
    }
  });
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectTab(t));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    selectTab(next); next.focus();
  });
});
// Signature tiles jump to the right tab
$$("[data-jump]").forEach((a) => a.addEventListener("click", () => selectTab($(`#tab-${a.dataset.jump}`))));

// ---------- Order ----------
const order = new Map(); // key -> { name, size, price, qty }

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn || !ORDERING) return;
  const { name, size, price } = btn.dataset;
  const key = `${name}|${size}`;
  const line = order.get(key) || { name, size, price: Number(price), qty: 0 };
  line.qty += 1;
  order.set(key, line);
  btn.classList.add("added");
  setTimeout(() => btn.classList.remove("added"), 900);
  renderOrder();
});

function renderOrder() {
  const lines = [...order.entries()];
  const count = lines.reduce((n, [, l]) => n + l.qty, 0);
  const total = lines.reduce((n, [, l]) => n + l.qty * l.price, 0);

  $$("[data-order-count]").forEach((el) => { el.textContent = count; el.hidden = count === 0; });
  $("[data-order-count-bar]").textContent = count;
  $("[data-order-total-bar]").textContent = fmt(total);
  $("[data-order-total]").textContent = fmt(total);
  $(".order-bar").hidden = count === 0 || !$(".drawer").hidden;
  $("[data-order-empty]").hidden = count > 0;
  $("[data-order-form]").hidden = count === 0;

  $("[data-order-list]").innerHTML = lines.map(([key, l]) => `
    <li class="order-line">
      <span class="ol-name">${l.name}</span>
      <span class="qty">
        <button type="button" data-qty="-1" data-key="${key}" aria-label="Remove one ${l.name}">−</button>
        <span>${l.qty}</span>
        <button type="button" data-qty="1" data-key="${key}" aria-label="Add one ${l.name}">+</button>
      </span>
      <span class="ol-size">${l.size ? l.size + " · " : ""}KES ${fmt(l.price * l.qty)}</span>
    </li>`).join("");
}

$("[data-order-list]").addEventListener("click", (e) => {
  const b = e.target.closest("[data-qty]");
  if (!b) return;
  const line = order.get(b.dataset.key);
  line.qty += Number(b.dataset.qty);
  if (line.qty <= 0) order.delete(b.dataset.key);
  renderOrder();
});

// Drawer open / close
const drawer = $(".drawer");
const scrim = $(".drawer-scrim");
let lastFocus = null;
function openDrawer() {
  lastFocus = document.activeElement;
  drawer.hidden = false; scrim.hidden = false;
  document.body.style.overflow = "hidden";
  renderOrder();
  $(".icon-btn", drawer).focus();
}
function closeDrawer() {
  drawer.hidden = true; scrim.hidden = true;
  document.body.style.overflow = "";
  renderOrder();
  lastFocus?.focus();
}
$$("[data-open-order]").forEach((b) => b.addEventListener("click", openDrawer));
$$("[data-close-order]").forEach((b) => b.addEventListener("click", closeDrawer));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) closeDrawer(); });

// Send to WhatsApp
$("[data-order-form]").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const lines = [...order.values()].map((l) =>
    `• ${l.qty} × ${l.name}${l.size ? ` (${l.size})` : ""}: KES ${fmt(l.qty * l.price)}`);
  const total = [...order.values()].reduce((n, l) => n + l.qty * l.price, 0);
  const name = f.get("name")?.trim();
  const notes = f.get("notes")?.trim();
  const msg = [
    `Hi Layali! I'd like to order${name ? ` (this is ${name})` : ""}:`,
    "",
    ...lines,
    "",
    `Total: KES ${fmt(total)}`,
    `${f.get("mode")}`,
    notes ? `Notes: ${notes}` : null,
  ].filter((x) => x !== null).join("\n");
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});

// Plain WhatsApp link in the Visit section
$$("[data-wa-link]").forEach((a) => {
  a.href = `https://wa.me/${CONFIG.whatsapp}`;
  a.target = "_blank"; a.rel = "noopener";
});

// ---------------------------------------------------------------
// DRINK FINDER
// ---------------------------------------------------------------
const FINDER = [
  { key: "base", q: "What are you in the mood for?", options: [
    { value: "coffee", label: "Coffee", art: ART.iced },
    { value: "matcha", label: "Matcha", art: ART.matcha },
    { value: "fruity", label: "Something fruity", art: ART.mojito },
    { value: "creamy", label: "Sweet & creamy", art: ART.signature },
  ]},
  { key: "sweet", q: "How sweet are we going?", options: [
    { value: "1", label: "Just a little" },
    { value: "2", label: "Properly sweet" },
    { value: "3", label: "Dessert in a cup" },
  ]},
  { key: "temp", q: "Hot or iced?", when: (a) => a.base === "coffee", options: [
    { value: "iced", label: "Iced", art: ART.iced },
    { value: "hot", label: "Hot", art: ART.hot },
  ]},
];

const PICKS = {
  "coffee-iced-1": { name: "Iced Vanilla latte", price: 300, art: { id: "i-iced" }, why: "Smooth and light, with just a hint of vanilla." },
  "coffee-iced-2": { name: "Iced Caramel latte", price: 300, art: ART.iced, fav: true, why: "Our founder's go-to: caramel, espresso and cold milk." },
  "coffee-iced-3": { name: "Iced Tiramisu latte", price: 500, art: { id: "i-tiramisu" }, fav: true, why: "Tiramisu, but you drink it through a straw." },
  "coffee-hot-1": { name: "Cappuccino", sizes: [150, 250], art: ART.hot, why: "A classic. Strong coffee under soft foam." },
  "coffee-hot-2": { name: "Cafe Latte", sizes: [150, 250], art: ART.hot, why: "Warm, milky and easy to love." },
  "coffee-hot-3": { name: "Mocha", sizes: [150, 250], art: { id: "i-hot", vars: { d1: "#7a4a2e" } }, why: "Coffee and chocolate together, nothing to think about." },
  "matcha-1": { name: "Vanilla matcha", price: 500, art: { id: "i-iced", vars: { d1: "#93a865" } }, why: "Earthy matcha softened with a little vanilla." },
  "matcha-2": { name: "Strawberry matcha", price: 550, art: { id: "i-strawmatcha" }, fav: true, why: "Matcha over strawberry milk. Pretty and very drinkable." },
  "matcha-3": { name: "Matcha misu", price: 650, art: { id: "i-matchamisu" }, fav: true, why: "Our matcha take on tiramisu. A dessert with a straw." },
  "fruity-1": { name: "Classic mojito", price: 450, art: ART.mojito, why: "Lime, mint and lots of ice. Very refreshing." },
  "fruity-2": { name: "Strawberry mojito", price: 450, art: { id: "i-mojito", vars: { d1: "#f2c6c0", t: "#d27466" } }, fav: true, why: "A classic mojito with sweet strawberries." },
  "fruity-3": { name: "Scud", price: 300, art: ART.scud, why: "Strawberries, grapes and ice cream on a mango base, layered in one cup." },
  "creamy-1": { name: "Vanilla shake", sizes: [150, 250], art: { id: "i-shake", vars: { d1: "#f6ecd6", t: "#e2c27a" } }, why: "Simple, cold and creamy." },
  "creamy-2": { name: "Pistachio shake", sizes: [150, 250], art: { id: "i-shake", vars: { d1: "#d3dba3", t: "#8aa05a" } }, fav: true, why: "Nutty and creamy, and one of our founder's favourites." },
  "creamy-3": { name: "Lotus Biscoff shake", sizes: [250, 450], art: ART.signature, fav: true, why: "Our number one. Biscoff blended into a thick shake." },
};

const finder = $("[data-finder]");
let answers = {};
let history = [];

function finderSteps() { return FINDER.filter((s) => !s.when || s.when(answers)); }

function renderFinder() {
  const steps = finderSteps();
  const step = steps.find((s) => !(s.key in answers));
  if (!step) return renderPick();
  const idx = steps.indexOf(step);
  finder.innerHTML = `
    <div class="finder-progress" aria-hidden="true">${steps.map((_, i) => `<span class="${i <= idx ? "on" : ""}"></span>`).join("")}</div>
    <p class="finder-q" id="finder-q">${step.q}</p>
    <div class="finder-options" role="group" aria-labelledby="finder-q">
      ${step.options.map((o) => `<button type="button" class="finder-opt" data-answer="${o.value}">${o.art ? `<span class="opt-ill">${illus(o.art)}</span>` : ""}${o.label}</button>`).join("")}
    </div>
    ${history.length ? `<button type="button" class="finder-back" data-finder-back>← Back</button>` : ""}`;
  $$("[data-answer]", finder).forEach((b) => b.addEventListener("click", () => {
    history.push(step.key);
    answers[step.key] = b.dataset.answer;
    renderFinder();
    $(".finder-opt, .finder-result button", finder)?.focus({ preventScroll: true });
  }));
  $("[data-finder-back]", finder)?.addEventListener("click", () => {
    delete answers[history.pop()];
    renderFinder();
  });
}

function renderPick() {
  const key = answers.base === "coffee" ? `coffee-${answers.temp}-${answers.sweet}` : `${answers.base}-${answers.sweet}`;
  const p = PICKS[key];
  const buttons = p.sizes
    ? p.sizes.map((price, i) => addBtn(p.name, price, i ? "large" : "small", "add-wide")).join("")
    : addBtn(p.name, p.price, "", "add-wide");
  finder.innerHTML = `
    <div class="finder-result">
      <div class="res-ill">${illus(p.art)}</div>
      <div>
        <p class="kicker">You should try</p>
        <h3>${p.name}${p.fav ? ' <span class="heart" aria-label="Founder\'s favourite">♥</span>' : ""}</h3>
        <p>${p.why}</p>
        <div class="res-actions">${buttons}<button type="button" class="finder-back" data-finder-reset>Start over</button></div>
      </div>
    </div>`;
  $("[data-finder-reset]", finder).addEventListener("click", () => { answers = {}; history = []; renderFinder(); });
}

renderFinder();

// ---------------------------------------------------------------
// STICKY NOTES DOOR
// ---------------------------------------------------------------
const NOTE_COLORS = ["yellow", "green", "orange", "pink"];
// PLACEHOLDER: sample notes, swap for real ones from the door
const SAMPLE_NOTES = [
  { id: "s1", text: "best iced caramel latte in south c, no debate", color: "yellow", x: 6, y: 8 },
  { id: "s2", text: "came for one matcha, stayed for three ♥", color: "green", x: 38, y: 5 },
  { id: "s3", text: "the lotus waffle fixed my week", color: "orange", x: 66, y: 12 },
  { id: "s4", text: "do it for the plot!!", color: "pink", x: 10, y: 44 },
  { id: "s5", text: "karak tastes like home", color: "green", x: 42, y: 40 },
  { id: "s6", text: "first date here. wish us luck", color: "yellow", x: 64, y: 50 },
  { id: "s7", text: "scud supremacy", color: "pink", x: 30, y: 72 },
];
// Very basic word filter; delete anything else from the Firebase console.
const BLOCKED = ["fuck", "shit", "bitch", "cunt", "dick", "pussy", "asshole", "slut", "whore", "bastard"];

const doorList = $("[data-door-notes]");
const noteForm = $("[data-note-form]");
const noteStatus = $("[data-note-status]");
const localPos = store.get("layali-note-pos", {});

function hashRot(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 9) - 4) * 1.2; // -4.8deg .. 4.8deg
}

function placeNote(el, x, y) {
  el.style.left = `min(${x}%, calc(100% - var(--nw) - 16px))`;
  el.style.top = `min(${y}%, calc(100% - var(--nh) - 16px))`;
}

function renderNotes(notes, newId) {
  const list = notes.length < 6 ? [...SAMPLE_NOTES, ...notes] : notes;
  doorList.replaceChildren(...list.map((n) => {
    const li = document.createElement("li");
    li.className = `door-note n-${NOTE_COLORS.includes(n.color) ? n.color : "yellow"}`;
    li.textContent = n.text; // textContent keeps visitor text safe
    li.dataset.id = n.id;
    li.style.setProperty("--r", `${hashRot(n.id)}deg`);
    const pos = localPos[n.id] || n;
    placeNote(li, Number(pos.x) || 0, Number(pos.y) || 0);
    if (n.id === newId) li.classList.add("is-new");
    return li;
  }));
}

// Dragging (positions are remembered on this device only)
doorList.addEventListener("pointerdown", (e) => {
  const note = e.target.closest(".door-note");
  if (!note) return;
  const door = doorList.getBoundingClientRect();
  const start = note.getBoundingClientRect();
  const dx = e.clientX - start.left, dy = e.clientY - start.top;
  note.setPointerCapture(e.pointerId);
  note.classList.add("dragging");
  doorList.append(note); // bring to front
  const move = (ev) => {
    const x = Math.max(0, Math.min(ev.clientX - dx - door.left, door.width - note.offsetWidth));
    const y = Math.max(0, Math.min(ev.clientY - dy - door.top, door.height - note.offsetHeight));
    note.style.left = `${(x / door.width) * 100}%`;
    note.style.top = `${(y / door.height) * 100}%`;
  };
  const up = () => {
    note.classList.remove("dragging");
    note.removeEventListener("pointermove", move);
    localPos[note.dataset.id] = { x: parseFloat(note.style.left), y: parseFloat(note.style.top) };
    store.set("layali-note-pos", localPos);
  };
  note.addEventListener("pointermove", move);
  note.addEventListener("pointerup", up, { once: true });
  note.addEventListener("pointercancel", up, { once: true });
});

// Notes storage: Firebase when configured, otherwise this browser only
function localNotes() {
  let cb = () => {};
  return {
    shared: false,
    subscribe(fn) { cb = fn; fn(store.get("layali-notes", [])); },
    async add(note) {
      const notes = store.get("layali-notes", []);
      const saved = { ...note, id: "l" + Date.now() };
      notes.push(saved);
      store.set("layali-notes", notes.slice(-30));
      cb(notes);
      return saved.id;
    },
  };
}

// Loads Firebase once; shared by the notes door and the game scoreboard
let firebasePromise = null;
function firebase() {
  if (!FIREBASE_CONFIG) return Promise.reject(new Error("Firebase is not configured"));
  firebasePromise ||= (async () => {
    const v = "10.12.2";
    const [{ initializeApp }, fs] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`),
    ]);
    return { fs, db: fs.getFirestore(initializeApp(FIREBASE_CONFIG)) };
  })();
  return firebasePromise;
}

async function firebaseNotes() {
  const { fs, db } = await firebase();
  const col = fs.collection(db, "notes");
  return {
    shared: true,
    subscribe(fn) {
      fs.onSnapshot(fs.query(col, fs.orderBy("createdAt", "desc"), fs.limit(40)),
        (snap) => fn(snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse()),
        (err) => console.warn("Notes unavailable:", err));
    },
    async add(note) {
      const ref = await fs.addDoc(col, { ...note, createdAt: fs.serverTimestamp() });
      return ref.id;
    },
  };
}

let notesStore;
let lastAddedId = null;
let currentNotes = [];
(async () => {
  try { notesStore = FIREBASE_CONFIG ? await firebaseNotes() : localNotes(); }
  catch (err) { console.warn("Falling back to local notes:", err); notesStore = localNotes(); }
  notesStore.subscribe((notes) => { currentNotes = notes; renderNotes(notes, lastAddedId); });
})();

const noteText = $("#note-text");
noteText.addEventListener("input", () => { $("[data-note-count]").textContent = `${noteText.value.length} / 80`; });
noteForm.addEventListener("change", (e) => { if (e.target.name === "color") noteForm.dataset.color = e.target.value; });

noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = noteText.value.trim().replace(/\s+/g, " ");
  const color = new FormData(noteForm).get("color");
  if (!text) return;
  if (BLOCKED.some((w) => text.toLowerCase().includes(w))) {
    noteStatus.textContent = "Let's keep the door friendly. Try a different note?";
    return;
  }
  const wait = 30000 - (Date.now() - store.get("layali-last-note", 0));
  if (wait > 0) {
    noteStatus.textContent = `One note at a time. Try again in ${Math.ceil(wait / 1000)}s.`;
    return;
  }
  const btn = $("button[type=submit]", noteForm);
  btn.disabled = true;
  try {
    const note = { text, color, x: Math.round(4 + Math.random() * 62), y: Math.round(4 + Math.random() * 60) };
    lastAddedId = await notesStore.add(note);
    renderNotes(currentNotes, lastAddedId);
    store.set("layali-last-note", Date.now());
    noteText.value = "";
    $("[data-note-count]").textContent = "0 / 80";
    noteStatus.textContent = notesStore.shared ? "Stuck! Everyone can see it now." : "Stuck! It's on the door.";
  } catch (err) {
    noteStatus.textContent = "Couldn't stick that one. Please try again.";
    console.warn(err);
  } finally {
    btn.disabled = false;
  }
});

// ---------------------------------------------------------------
// MINI GAME: Build the Scud
// ---------------------------------------------------------------
const GAME_SECONDS = 30;
const INK = "#3b2f27";
const DROPS = [
  { type: "strawberry", pts: 10, weight: 34 },
  { type: "grape", pts: 10, weight: 30 },
  { type: "mango", pts: 15, weight: 20 },
  { type: "scoop", pts: 25, weight: 7 },
  { type: "bee", pts: -20, weight: 9, bad: true },
];
const DROP_TOTAL = DROPS.reduce((n, d) => n + d.weight, 0);

const stage = $("[data-game-stage]");
const canvas = $("[data-game-canvas]");
const ctx = canvas.getContext("2d");
const startScreen = $("[data-game-start]");
const overScreen = $("[data-game-over]");
const scoreForm = $("[data-score-form]");
const scoreStatus = $("[data-score-status]");
const hud = { score: $("[data-score]"), time: $("[data-time]"), combo: $("[data-combo]") };

let W = 0, H = 0, S = 1;
const game = {
  state: "idle", score: 0, time: GAME_SECONDS, elapsed: 0, last: 0,
  items: [], pops: [], history: [], caught: 0, scoops: 0,
  combo: 0, mult: 1, spawnIn: 0, keys: { left: false, right: false },
  cup: { x: 0, target: 0, shake: 0 }, paused: false,
};

if (CONFIG.gamePrize) {
  const prize = $("[data-game-prize]");
  prize.textContent = CONFIG.gamePrize;
  prize.hidden = false;
}

const cupSize = () => ({ tw: 100 * S, bw: 74 * S, h: 108 * S });
const cupTop = () => H - cupSize().h - 18 * S;

function sizeCanvas() {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = r.width; H = r.height;
  S = Math.max(0.75, Math.min(1.2, W / 440));
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const half = cupSize().tw / 2;
  game.cup.x = Math.min(Math.max(game.cup.x || W / 2, half), W - half);
  game.cup.target = game.cup.x;
  if (game.state !== "playing") draw();
}

// ----- drawing (same offset-ink style as the illustrations) -----
function sketch(build, fill, lw = 2.4) {
  ctx.save(); ctx.translate(2.5, 2.5); build(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  build(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = "round"; ctx.stroke();
}
function rr(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
}
function drawItem(it) {
  const s = it.s;
  ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
  if (it.type === "strawberry") {
    sketch(() => { ctx.beginPath(); ctx.moveTo(0, s); ctx.bezierCurveTo(-s * 1.15, s * 0.15, -s * 0.95, -s * 0.95, 0, -s * 0.65); ctx.bezierCurveTo(s * 0.95, -s * 0.95, s * 1.15, s * 0.15, 0, s); ctx.closePath(); }, "#d27466");
    ctx.fillStyle = "#f6e6a8";
    [[-0.35, -0.1], [0.3, -0.2], [0, 0.25], [-0.2, 0.5], [0.25, 0.45], [0, -0.3]].forEach(([a, b]) => { ctx.beginPath(); ctx.ellipse(a * s, b * s, 1.3 * S, 2 * S, 0, 0, Math.PI * 2); ctx.fill(); });
    sketch(() => { ctx.beginPath(); ctx.moveTo(-s * 0.55, -s * 0.72); ctx.lineTo(0, -s * 0.5); ctx.lineTo(s * 0.55, -s * 0.72); ctx.lineTo(0, -s * 1.05); ctx.closePath(); }, "#7a9a5a", 1.8);
  } else if (it.type === "grape") {
    sketch(() => { ctx.beginPath(); ctx.arc(0, 0, s * 0.72, 0, Math.PI * 2); }, it.color);
    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.beginPath(); ctx.arc(-s * 0.25, -s * 0.25, s * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.lineTo(s * 0.18, -s * 1.02); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
  } else if (it.type === "mango") {
    sketch(() => rr(-s * 0.68, -s * 0.68, s * 1.36, s * 1.36, s * 0.3), "#f0b24a");
    ctx.strokeStyle = "#c98a2a"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.3); ctx.lineTo(s * 0.3, s * 0.3); ctx.moveTo(-s * 0.3, s * 0.05); ctx.lineTo(s * 0.05, -s * 0.3); ctx.stroke();
  } else if (it.type === "scoop") {
    sketch(() => {
      ctx.beginPath(); ctx.arc(0, s * 0.2, s * 0.95, Math.PI, 0);
      for (let i = 0; i <= 6; i++) ctx.lineTo(s * 0.95 - i * (1.9 * s / 6), s * 0.2 + (i % 2 ? s * 0.3 : 0));
      ctx.closePath();
    }, "#f3d3b8");
    sketch(() => { ctx.beginPath(); ctx.arc(0, -s * 0.85, s * 0.26, 0, Math.PI * 2); }, "#d27466", 2);
  } else if (it.type === "bee") {
    ctx.fillStyle = "rgba(233,238,240,0.9)"; ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
    [-1, 1].forEach((d) => { ctx.beginPath(); ctx.ellipse(d * s * 0.3, -s * 0.72, s * 0.32, s * 0.5, d * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    sketch(() => { ctx.beginPath(); ctx.ellipse(0, 0, s * 0.95, s * 0.66, 0, 0, Math.PI * 2); }, "#f4c542");
    ctx.lineWidth = 3.2 * S; ctx.beginPath(); ctx.moveTo(-s * 0.22, -s * 0.6); ctx.lineTo(-s * 0.22, s * 0.6); ctx.moveTo(s * 0.22, -s * 0.62); ctx.lineTo(s * 0.22, s * 0.62); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(s * 0.62, -s * 0.12, 2.2 * S, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-s * 0.95, 0); ctx.lineTo(-s * 1.3, -s * 0.08); ctx.lineTo(-s * 0.95, s * 0.14); ctx.fill();
  }
  ctx.restore();
}

const PIECE = { strawberry: "#d27466", grape: "#8e6a9a", mango: "#f0b24a" };
function drawCup() {
  const { tw, bw, h } = cupSize();
  const top = cupTop();
  const cx = game.cup.x + (game.cup.shake > 0 ? Math.sin(game.elapsed * 70) * 5 * S : 0);
  const path = () => { ctx.beginPath(); ctx.moveTo(cx - tw / 2, top); ctx.lineTo(cx + tw / 2, top); ctx.lineTo(cx + bw / 2, top + h); ctx.lineTo(cx - bw / 2, top + h); ctx.closePath(); };
  const level = Math.min(1, game.caught / 26);

  ctx.save(); path(); ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(cx - tw, top, tw * 2, h);
  if (level > 0) {
    const fillTop = top + h * (1 - level);
    const mangoH = (top + h - fillTop) * 0.36;
    ctx.fillStyle = "#f8efdf"; ctx.fillRect(cx - tw, fillTop, tw * 2, top + h - fillTop);
    ctx.fillStyle = "#f0b24a"; ctx.fillRect(cx - tw, top + h - mangoH, tw * 2, mangoH);
    const band = Math.max(1, top + h - mangoH - fillTop);
    game.history.slice(-30).forEach((t, i) => {
      if (!PIECE[t]) return;
      const px = cx + (((i * 37) % 100) / 100 - 0.5) * bw * 0.85;
      const py = fillTop + 6 * S + (((i * 53) % 100) / 100) * Math.max(0, band - 10 * S);
      ctx.fillStyle = t === "grape" && i % 2 ? "#b9c46a" : PIECE[t];
      ctx.beginPath(); ctx.arc(px, py, 6 * S, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 1.3; ctx.strokeStyle = INK; ctx.stroke();
    });
  }
  ctx.restore();

  // Ice-cream dome once you've caught a scoop and the cup is filling up
  if (game.scoops > 0 && level > 0.55) {
    sketch(() => { ctx.beginPath(); ctx.moveTo(cx - tw / 2 + 2, top); ctx.bezierCurveTo(cx - tw / 2, top - 46 * S, cx + tw / 2, top - 46 * S, cx + tw / 2 - 2, top); ctx.closePath(); }, "#fbf4e6");
    sketch(() => { ctx.beginPath(); ctx.arc(cx, top - 36 * S, 8 * S, 0, Math.PI * 2); }, "#d27466", 2);
  }

  path(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = 1.6; ctx.beginPath();
  for (let k = 0; k < 3; k++) {
    const y = top + h * (0.58 + k * 0.13);
    const x = cx + tw / 2 - 14 * S - (y - top) * ((tw - bw) / 2 / h);
    ctx.moveTo(x, y); ctx.lineTo(x + 6 * S, y - 6 * S);
  }
  ctx.stroke();
  ctx.fillStyle = INK; ctx.font = `600 ${14 * S}px "Bricolage Grotesque", sans-serif`; ctx.textAlign = "center";
  ctx.fillText("layali", cx, top + h * 0.86);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  game.items.forEach(drawItem);
  drawCup();
  ctx.textAlign = "center";
  game.pops.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life / 0.9);
    ctx.fillStyle = p.bad ? "#a0402a" : INK;
    ctx.font = `700 ${22 * S}px Caveat, cursive`;
    ctx.fillText(p.text, p.x, p.y);
  });
  ctx.globalAlpha = 1;
}

// ----- game loop -----
function spawn() {
  let roll = Math.random() * DROP_TOTAL;
  const d = DROPS.find((x) => (roll -= x.weight) < 0) || DROPS[0];
  const s = (d.type === "scoop" ? 19 : d.type === "bee" ? 16 : 17) * S;
  game.items.push({
    ...d, s,
    x: s + Math.random() * (W - 2 * s), y: -s * 1.5,
    vy: (150 + game.elapsed * 7) * S * (0.85 + Math.random() * 0.35),
    rot: d.bad ? 0 : d.type === "scoop" ? (Math.random() - 0.5) * 0.4 : Math.random() * 6,
    spin: d.bad || d.type === "scoop" ? 0 : (Math.random() - 0.5) * 3,
    color: Math.random() < 0.5 ? "#8e6a9a" : "#b9c46a", t: Math.random() * 6,
  });
}
function pop(text, x, y, bad = false) { game.pops.push({ text, x, y, bad, life: 0.9 }); }

function update(dt) {
  game.elapsed += dt;
  game.time = Math.max(0, GAME_SECONDS - game.elapsed);
  const { tw } = cupSize();
  const dir = (game.keys.right ? 1 : 0) - (game.keys.left ? 1 : 0);
  if (dir) game.cup.target += dir * 560 * S * dt;
  game.cup.target = Math.min(Math.max(game.cup.target, tw / 2), W - tw / 2);
  game.cup.x += (game.cup.target - game.cup.x) * Math.min(1, dt * 16);
  game.cup.shake = Math.max(0, game.cup.shake - dt);

  game.spawnIn -= dt;
  if (game.spawnIn <= 0) {
    spawn();
    game.spawnIn = Math.max(0.3, 0.7 - game.elapsed * 0.013) * (0.7 + Math.random() * 0.6);
  }

  const top = cupTop();
  game.items = game.items.filter((it) => {
    it.y += it.vy * dt;
    it.rot += it.spin * dt;
    if (it.bad) { it.t += dt; it.x += Math.sin(it.t * 5) * 70 * S * dt; }
    const inMouth = it.y + it.s * 0.6 >= top && it.y - it.s <= top + 16 * S && Math.abs(it.x - game.cup.x) <= tw / 2;
    if (inMouth) {
      if (it.bad) {
        game.score = Math.max(0, game.score + it.pts);
        game.combo = 0; game.mult = 1; game.cup.shake = 0.4;
        pop("bzz! −20", it.x, top - 10 * S, true);
      } else {
        game.combo += 1;
        game.mult = Math.min(3, 1 + Math.floor(game.combo / 5));
        const pts = it.pts * game.mult;
        game.score += pts;
        game.caught += 1;
        if (it.type === "scoop") game.scoops += 1;
        game.history.push(it.type);
        pop(`+${pts}`, it.x, top - 10 * S);
      }
      return false;
    }
    if (it.y - it.s > H) {
      if (!it.bad) { game.combo = 0; game.mult = 1; }
      return false;
    }
    return true;
  });
  game.pops = game.pops.filter((p) => { p.y -= 46 * S * dt; p.life -= dt; return p.life > 0; });

  hud.score.textContent = game.score;
  hud.time.textContent = Math.ceil(game.time);
  hud.combo.hidden = game.mult < 2;
  hud.combo.textContent = `×${game.mult} combo`;

  if (game.time <= 0) endGame();
}

function frame(now) {
  if (game.state !== "playing") return;
  if (!game.paused) {
    update(Math.min(0.05, (now - game.last) / 1000));
    draw();
  }
  game.last = now;
  requestAnimationFrame(frame);
}

function startGame() {
  Object.assign(game, {
    state: "playing", score: 0, time: GAME_SECONDS, elapsed: 0, items: [], pops: [], history: [],
    caught: 0, scoops: 0, combo: 0, mult: 1, spawnIn: 0.2, paused: false, last: performance.now(),
  });
  game.cup.x = game.cup.target = W / 2;
  hud.combo.hidden = true;
  startScreen.hidden = true;
  overScreen.hidden = true;
  stage.classList.add("is-playing");
  canvas.focus({ preventScroll: true });
  requestAnimationFrame(frame);
}

function endGame() {
  game.state = "over";
  stage.classList.remove("is-playing");
  const best = Math.max(store.get("layali-game-best", 0), game.score);
  store.set("layali-game-best", best);
  $("[data-final-score]").textContent = game.score;
  $("[data-best]").textContent = game.score >= best && game.score > 0 ? "New personal best!" : `Your best: ${best}`;
  scoreForm.hidden = game.score === 0;
  $("button", scoreForm).disabled = false;
  scoreStatus.textContent = "";
  $("#score-name").value = store.get("layali-player", "");
  overScreen.hidden = false;
  (game.score > 0 ? $("#score-name") : $("[data-game-play]", overScreen)).focus({ preventScroll: true });
}

$$("[data-game-play]").forEach((b) => b.addEventListener("click", startGame));

// Controls: pointer (mouse / finger) and arrow keys
canvas.tabIndex = 0;
function aim(e) {
  if (game.state !== "playing") return;
  game.cup.target = e.clientX - canvas.getBoundingClientRect().left;
}
canvas.addEventListener("pointerdown", (e) => { aim(e); canvas.setPointerCapture?.(e.pointerId); });
canvas.addEventListener("pointermove", aim);
const KEYMAP = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
addEventListener("keydown", (e) => {
  if (game.state !== "playing" || !KEYMAP[e.key]) return;
  game.keys[KEYMAP[e.key]] = true;
  e.preventDefault();
});
addEventListener("keyup", (e) => { if (KEYMAP[e.key]) game.keys[KEYMAP[e.key]] = false; });
document.addEventListener("visibilitychange", () => { game.paused = document.hidden; });
addEventListener("resize", sizeCanvas);
sizeCanvas();
document.fonts?.ready.then(() => { if (game.state !== "playing") draw(); });

// ----- weekly scoreboard -----
function weekKey(d = new Date()) {
  const n = new Date(d.getTime() + 3 * 3600e3); // Nairobi time (UTC+3)
  const t = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const week = Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
const WEEK = weekKey();

function localBoard() {
  const key = `layali-scores-${WEEK}`;
  let cb = () => {};
  const top = () => store.get(key, []).sort((a, b) => b.score - a.score).slice(0, 10);
  return {
    shared: false,
    subscribe(fn) { cb = fn; fn(top()); },
    async add(entry) {
      const id = "l" + Date.now();
      store.set(key, [...store.get(key, []), { ...entry, id }].sort((a, b) => b.score - a.score).slice(0, 10));
      cb(top());
      return id;
    },
  };
}
async function firebaseBoard() {
  const { fs, db } = await firebase();
  const col = fs.collection(db, "scores", WEEK, "entries");
  return {
    shared: true,
    subscribe(fn) {
      fs.onSnapshot(fs.query(col, fs.orderBy("score", "desc"), fs.limit(10)),
        (snap) => fn(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => console.warn("Scoreboard unavailable:", err));
    },
    async add(entry) {
      const ref = await fs.addDoc(col, { ...entry, createdAt: fs.serverTimestamp() });
      return ref.id;
    },
  };
}

const board = $("[data-board]");
let boardStore;
let myEntryId = null;
let boardRows = [];
function renderBoard(rows) {
  boardRows = rows;
  if (!rows.length) {
    board.innerHTML = `<li><span class="b-empty">No scores yet this week. Be the first!</span></li>`;
    return;
  }
  board.replaceChildren(...rows.map((r, i) => {
    const li = document.createElement("li");
    if (r.id === myEntryId) li.className = "me";
    const rank = document.createElement("span"); rank.className = "b-rank"; rank.textContent = i + 1;
    const name = document.createElement("span"); name.className = "b-name"; name.textContent = r.name; // textContent keeps names safe
    const score = document.createElement("span"); score.className = "b-score"; score.textContent = r.score;
    li.append(rank, name, score);
    return li;
  }));
}
(async () => {
  try { boardStore = FIREBASE_CONFIG ? await firebaseBoard() : localBoard(); }
  catch (err) { console.warn("Falling back to local scoreboard:", err); boardStore = localBoard(); }
  if (!boardStore.shared) $("[data-board-note]").textContent = "Resets every Monday. Scores are kept on this device for now.";
  boardStore.subscribe(renderBoard);
})();

scoreForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("#score-name").value.trim().replace(/\s+/g, " ").slice(0, 16);
  if (!name) return;
  if (BLOCKED.some((w) => name.toLowerCase().includes(w))) {
    scoreStatus.textContent = "Pick a friendlier name?";
    return;
  }
  const btn = $("button", scoreForm);
  btn.disabled = true;
  try {
    myEntryId = await boardStore.add({ name, score: game.score });
    store.set("layali-player", name);
    renderBoard(boardRows);
    scoreForm.hidden = true;
    scoreStatus.textContent = "You're on the board!";
  } catch (err) {
    console.warn(err);
    btn.disabled = false;
    scoreStatus.textContent = "Couldn't save that score. Try again?";
  }
});

// ---------------------------------------------------------------
// DAY / NIGHT
// ---------------------------------------------------------------
const themeBtn = $("[data-theme-toggle]");
function syncTheme() {
  const night = document.documentElement.dataset.theme === "night";
  themeBtn.setAttribute("aria-pressed", night);
  themeBtn.setAttribute("aria-label", night ? "Switch to day mode" : "Switch to night mode");
  $("[data-theme-label]").textContent = night ? "Day" : "Night";
  $('meta[name="theme-color"]').content = night ? "#17120E" : "#EDE3D1";
}
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "night" ? "day" : "night";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("layali-theme", next); } catch {}
  syncTheme();
});
syncTheme();

// ---------- Night sky: stars + tonight's moon ----------
(function nightSky() {
  // Stars: fixed pseudo-random layout so they don't jump around between visits
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const stars = $("[data-stars]");
  for (let i = 0; i < 46; i++) {
    const st = document.createElement("span");
    const size = 1 + rand() * 2;
    st.className = "star";
    st.style.cssText = `left:${rand() * 100}%;top:${rand() * 46}%;width:${size}px;height:${size}px;animation-delay:${(-rand() * 3).toFixed(2)}s;animation-duration:${(2 + rand() * 3).toFixed(2)}s`;
    stars.append(st);
  }

  // Moon phase from a known new moon (6 Jan 2000, 18:14 UTC) and the synodic month
  const SYNODIC = 29.530588853;
  const days = (Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5;
  const p = ((days % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC; // 0 = new, 0.5 = full
  const lit = (1 - Math.cos(2 * Math.PI * p)) / 2;             // fraction illuminated
  const name =
    p < 0.03 || p > 0.97 ? "new moon" :
    p < 0.22 ? "waxing crescent" : p < 0.28 ? "first quarter" :
    p < 0.47 ? "waxing gibbous" : p < 0.53 ? "full moon" :
    p < 0.72 ? "waning gibbous" : p < 0.78 ? "last quarter" : "waning crescent";

  // Lit shape: a half disc plus an elliptical terminator
  const r = 44, c = 50, rx = r * Math.abs(1 - 2 * lit);
  const waxing = p < 0.5;
  const crescent = lit < 0.5;
  const half = waxing ? `M${c} ${c - r} A${r} ${r} 0 0 1 ${c} ${c + r}` : `M${c} ${c - r} A${r} ${r} 0 0 0 ${c} ${c + r}`;
  const sweep = waxing ? (crescent ? 0 : 1) : (crescent ? 1 : 0);
  const litPath = `${half} A${rx} ${r} 0 0 ${sweep} ${c} ${c - r} Z`;
  $("[data-moon]").innerHTML = `
    <circle cx="${c}" cy="${c}" r="${r}" fill="rgba(255,240,210,0.07)" stroke="rgba(255,240,210,0.22)" stroke-width="1.5"/>
    ${lit > 0.01 ? `<path d="${litPath}" fill="#f6e9c8"/>` : ""}
    <g fill="rgba(120,100,70,0.16)"><circle cx="38" cy="36" r="7"/><circle cx="62" cy="58" r="9"/><circle cx="44" cy="66" r="5"/><circle cx="64" cy="32" r="4"/></g>`;
  $("[data-moon-label]").textContent = name === "new moon"
    ? "new moon tonight · the lanterns are on"
    : `tonight's moon · ${name}`;
  $(".moon-wrap").title = `Tonight's moon over Nairobi: ${name}, ${Math.round(lit * 100)}% lit`;
})();

// ---------- Open now? (Nairobi time) ----------
(function openStatus() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour").value);
  const m = Number(parts.find((p) => p.type === "minute").value);
  const now = h + m / 60;
  const open = now >= CONFIG.openHour && now < CONFIG.closeHour;
  $("[data-open-dot]").classList.toggle("is-open", open);
  $("[data-open-status]").textContent = open
    ? "Open now · until 9:30pm"
    : "Closed now · opens 8:00am";
})();

// ---------- Scroll reveal ----------
const revealer = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); revealer.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
  : null;
$$("[data-reveal]").forEach((el) => revealer ? revealer.observe(el) : el.classList.add("is-in"));

// ---------- Opening animation ----------
(function intro() {
  const html = document.documentElement;
  if (!html.classList.contains("intro")) return;
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    try { sessionStorage.setItem("layali-intro", "1"); } catch {}
    html.classList.add("intro-done");
    setTimeout(() => html.classList.remove("intro", "intro-play", "intro-done"), 750);
  };
  // Wait (briefly) for the Arabic font so the calligraphy draws in the right shape
  const font = document.fonts ? document.fonts.load('700 150px "Reem Kufi"') : Promise.resolve();
  Promise.race([font, new Promise((r) => setTimeout(r, 900))]).then(() => {
    html.classList.add("intro-play");
    setTimeout(end, 2300);
  });
  $("[data-intro-skip]").addEventListener("click", end);
  $("[data-intro]").addEventListener("click", end);
  addEventListener("keydown", end, { once: true });
  addEventListener("wheel", end, { once: true, passive: true });
  addEventListener("touchmove", end, { once: true, passive: true });
})();

// ---------- Photo rail + lightbox ----------
const rail = $("[data-rail]");
const railStep = () => rail.querySelector(".photo-card").offsetWidth + 18;
$("[data-rail-prev]").addEventListener("click", () => rail.scrollBy({ left: -railStep(), behavior: "smooth" }));
$("[data-rail-next]").addEventListener("click", () => rail.scrollBy({ left: railStep(), behavior: "smooth" }));

const lightbox = $("[data-lightbox]");
const lightboxImg = $("[data-lightbox-img]");
function openPhoto(img) {
  if (!lightbox.showModal) return;
  lightboxImg.src = img.currentSrc || img.src;
  lightboxImg.alt = img.alt;
  lightbox.showModal();
}
$$("[data-zoom]").forEach((b) => b.addEventListener("click", () => openPhoto($("img", b))));
$$(".gallery img, .story-img img").forEach((img) => img.addEventListener("click", () => openPhoto(img)));
$("[data-lightbox-close]").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });

$("[data-year]").textContent = new Date().getFullYear();
