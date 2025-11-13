// Harga per bintang
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
const ETA_PER_STAR_HOUR = 0.25;

// Bangun list lengkap
function buildRankSteps(){
  const steps = [];

  ["Master","Grandmaster","Epic","Legend"].forEach(group=>{
    DIVS.forEach(div=>{
      for(let star=1; star<=5; star++){
        steps.push({ label:`${group} ${div} ★${star}`, group });
      }
    });
  });

  for(let s=1;s<=24;s++)   steps.push({label:`Mythic ★${s}`, group:"Mythic"});
  for(let s=25;s<=49;s++)  steps.push({label:`Mythic Honor ★${s}`, group:"Mythic Honor"});
  for(let s=50;s<=99;s++)  steps.push({label:`Mythic Glory ★${s}`, group:"Mythic Glory"});
  for(let s=100;s<=150;s++)steps.push({label:`Mythic Immortal ★${s}`, group:"Mythic Immortal"});

  return steps;
}

const RANK_STEPS = buildRankSteps();

const moontonId = document.getElementById("moontonId");
const moontonPass = document.getElementById("moontonPass");
const fromRank = document.getElementById("fromRank");
const toRank = document.getElementById("toRank");
const priceEl = document.getElementById("price");
const etaEl = document.getElementById("eta");
const noteEl = document.getElementById("note");
const legendEl = document.getElementById("legendList");
const sendBtn = document.getElementById("sendBtn");
const statusMsg = document.getElementById("statusMsg");

const API_URL = "https://domainmu.com/api/joki"; // UBAH INI

function format(n){return n.toLocaleString("id-ID");}
function findIndex(label){return RANK_STEPS.findIndex(s=>s.label===label);}

function calc(){
  const iFrom = findIndex(fromRank.value);
  const iTo   = findIndex(toRank.value);

  let total=0, steps=0;

  for(let i=iFrom; i<iTo; i++){
    const group = RANK_STEPS[i].group;
    total += GROUP_PRICE[group];
    steps++;
  }

  priceEl.textContent = "Rp"+format(total);

  if(steps === 0) etaEl.textContent = "-";
  else{
    const jam = Math.max(1, Math.round(steps * ETA_PER_STAR_HOUR));
    etaEl.textContent = `${jam}–${jam+1} jam`;
  }

  return { total, steps };
}

function initSelects(){
  const opts = RANK_STEPS.map(s=>`<option>${s.label}</option>`).join("");
  fromRank.innerHTML = opts;
  toRank.innerHTML   = opts;

  fromRank.selectedIndex = 0;
  toRank.selectedIndex = RANK_STEPS.length-1;

  calc();
}

function renderLegend(){
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

async function sendToDatabase(){
  const { total } = calc();

  const payload = {
    moontonId: moontonId.value,
    moontonPass: moontonPass.value,
    fromRank: fromRank.value,
    toRank: toRank.value,
    price: total,
    note: noteEl.value,
    timestamp: new Date().toISOString()
  };

  statusMsg.textContent = "Mengirim...";
  statusMsg.style.color = "#fbbf24";

  try{
    const res = await fetch(API_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });

    if(!res.ok) throw new Error("gagal");

    statusMsg.textContent = "✔️ Berhasil dikirim!";
    statusMsg.style.color = "#4ade80";

  }catch(e){
    statusMsg.textContent = "❌ Gagal mengirim!";
    statusMsg.style.color = "#f87171";
  }
}

[fromRank,toRank].forEach(el=>el.addEventListener("input", calc));
sendBtn.addEventListener("click", sendToDatabase);

initSelects();
renderLegend();
document.getElementById("year").textContent = new Date().getFullYear();
