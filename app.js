// =======================
//  DATA HARGA PER BINTANG
// =======================
const GROUP_PRICE = {
  "Master": 500,
  "Grandmaster": 1000,
  "Epic": 1500,
  "Legend": 2000,
  "Mythic": 2500,
  "Mythic Honor": 3000,
  "Mythic Glory": 3500,
  "Mythic Immortal": 4000
};

const DIVS = ["V", "IV", "III", "II", "I"];
const ETA_PER_STAR_HOUR = 0.25; // 15 menit per bintang

// =======================
//  BANGUN LIST RANK LENGKAP
// =======================
function buildRankSteps() {
  const steps = [];

  // Master–Legend: V I↘I I, per bintang 1–5
  ["Master", "Grandmaster", "Epic", "Legend"].forEach(group => {
    DIVS.forEach(div => {
      for (let star = 1; star <= 5; star++) {
        steps.push({
          label: `${group} ${div} ★${star}`,
          group
        });
      }
    });
  });

  // Mythic 1–24
  for (let s = 1; s <= 24; s++) {
    steps.push({ label: `Mythic ★${s}`, group: "Mythic" });
  }

  // Mythic Honor 25–49
  for (let s = 25; s <= 49; s++) {
    steps.push({ label: `Mythic Honor ★${s}`, group: "Mythic Honor" });
  }

  // Mythic Glory 50–99
  for (let s = 50; s <= 99; s++) {
    steps.push({ label: `Mythic Glory ★${s}`, group: "Mythic Glory" });
  }

  // Mythic Immortal 100–150
  for (let s = 100; s <= 150; s++) {
    steps.push({ label: `Mythic Immortal ★${s}`, group: "Mythic Immortal" });
  }

  return steps;
}

const RANK_STEPS = buildRankSteps();

// =======================
//  DOM ELEMENTS
// =======================
const moontonId   = document.getElementById("moontonId");
const moontonPass = document.getElementById("moontonPass");
const fromRank    = document.getElementById("fromRank");
const toRank      = document.getElementById("toRank");
const priceEl     = document.getElementById("price");
const etaEl       = document.getElementById("eta");
const noteEl      = document.getElementById("note");
const legendEl    = document.getElementById("legendList");
const sendBtn     = document.getElementById("sendBtn");
const statusMsg   = document.getElementById("statusMsg");

// URL API Google Apps Script-mu
const API_URL = "https://script.google.com/macros/s/AKfycbxHAMnnq_Db2Xd19yD4V-hFzqoYc0sivkgdWSXLbE6JpowqE0EoJ5lLY9sjQUZlqnD-OA/exec";

// =======================
//  HELPER
// =======================
function format(n) {
  return n.toLocaleString("id-ID");
}

function findIndex(label) {
  return RANK_STEPS.findIndex(s => s.label === label);
}

// =======================
//  HITUNG ESTIMASI HARGA & WAKTU
// =======================
function calc() {
  const iFrom = findIndex(fromRank.value);
  const iTo   = findIndex(toRank.value);

  if (iFrom === -1 || iTo === -1 || iTo <= iFrom) {
    priceEl.textContent = "Rp0";
    etaEl.textContent   = "-";
    return { total: 0, steps: 0 };
  }

  let total = 0;
  let steps = 0;

  for (let i = iFrom; i < iTo; i++) {
    const group   = RANK_STEPS[i].group;
    const perStar = GROUP_PRICE[group] || 0;
    total += perStar;
    steps++;
  }

  priceEl.textContent = "Rp" + format(total);

  if (steps === 0) {
    etaEl.textContent = "-";
  } else {
    const jamMin = Math.max(1, Math.round(steps * ETA_PER_STAR_HOUR));
    const jamMax = jamMin + 1;
    etaEl.textContent = `${jamMin}–${jamMax} jam`;
  }

  return { total, steps };
}

// =======================
//  INIT DROPDOWN & LEGEND
// =======================
function initSelects() {
  const opts = RANK_STEPS.map(s => `<option>${s.label}</option>`).join("");
  fromRank.innerHTML = opts;
  toRank.innerHTML   = opts;

  fromRank.selectedIndex = 0;
  toRank.selectedIndex   = RANK_STEPS.length - 1;

  calc();
}

function renderLegend() {
  legendEl.innerHTML = `
    <li><span class="left">Master</span><span class="right">Rp${format(GROUP_PRICE.Master)}</span></li>
    <li><span class="left">Grandmaster</span><span class="right">Rp${format(GROUP_PRICE.Grandmaster)}</span></li>
    <li><span class="left">Epic</span><span class="right">Rp${format(GROUP_PRICE.Epic)}</span></li>
    <li><span class="left">Legend</span><span class="right">Rp${format(GROUP_PRICE.Legend)}</span></li>
    <li><span class="left">Mythic</span><span class="right">Rp${format(GROUP_PRICE.Mythic)}</span></li>
    <li><span class="left">Mythic Honor</span><span class="right">Rp${format(GROUP_PRICE["Mythic Honor"])}</span></li>
    <li><span class="left">Mythic Glory</span><span class="right">Rp${format(GROUP_PRICE["Mythic Glory"])}</span></li>
    <li><span class="left">Mythic Immortal</span><span class="right">Rp${format(GROUP_PRICE["Mythic Immortal"])}</span></li>
  `;
}

// =======================
//  KIRIM KE GOOGLE SHEETS (Apps Script)
// =======================
async function sendToDatabase() {
  const { total } = calc();

  const payload = {
    moontonId   : moontonId.value,
    moontonPass : moontonPass.value,
    fromRank    : fromRank.value,
    toRank      : toRank.value,
    price       : total,
    note        : noteEl.value,
    timestamp   : new Date().toISOString()
  };

  statusMsg.textContent = "Mengirim...";
  statusMsg.style.color = "#fbbf24";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      // TANPA headers Content-Type → biar Apps Script nggak kena CORS/preflight
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Response bukan 200");

    // optional: baca response (kalau mau)
    // const data = await res.json();
    statusMsg.textContent = "✔️ Berhasil dikirim!";
    statusMsg.style.color = "#4ade80";
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Gagal mengirim!";
    statusMsg.style.color = "#f87171";
  }
}

// =======================
//  EVENT LISTENER & INIT
// =======================
[fromRank, toRank].forEach(el => el.addEventListener("input", calc));
sendBtn.addEventListener("click", sendToDatabase);

initSelects();
renderLegend();
document.getElementById("year").textContent = new Date().getFullYear();

