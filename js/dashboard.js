// js/dashboard.js
import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { categoryColor } from "./helpers.js";

let pieChart = null, barChart = null;

// DOM
const dashDate = document.getElementById("dashDate");
const noData = document.getElementById("noData");
const stats = document.getElementById("stats");
const totalHoursEl = document.getElementById("totalHours");
const numActivitiesEl = document.getElementById("numActivities");
const dashTimeline = document.getElementById("dashTimeline");
const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logoutBtn");

backBtn?.addEventListener("click", ()=> location.href = "index.html");
logoutBtn?.addEventListener("click", ()=> auth.signOut().then(()=> location.href = "login.html"));

onAuthStateChanged(auth, user => {
  if (!user) return location.href = "login.html";
  const stored = localStorage.getItem("analyseDate");
  const today = new Date().toISOString().slice(0,10);
  dashDate.value = stored || today;
  attachListener(dashDate.value, user.uid);
});

dashDate.addEventListener("change", (e)=>{
  const user = auth.currentUser;
  if (!user) return;
  attachListener(e.target.value, user.uid);
});

function attachListener(date, uid) {
  if (!date || !uid) return;
  const dayRef = ref(db, `users/${uid}/days/${date}/activities`);
  onValue(dayRef, snap => {
    if (!snap.exists()) {
      noData.classList.remove("hidden");
      stats.classList.add("hidden");
      destroyCharts();
      dashTimeline.innerHTML = "";
      return;
    }
    noData.classList.add("hidden");
    stats.classList.remove("hidden");
    const items = [];
    snap.forEach(ch=> items.push(ch.val()));
    renderStats(items);
    renderCharts(items);
    renderTimeline(items);
  });
}

function renderStats(items) {
  const total = items.reduce((s,i)=> s + Number(i.duration||0), 0);
  totalHoursEl.textContent = `${(total/60).toFixed(2)} h`;
  numActivitiesEl.textContent = String(items.length);
}

function renderCharts(items) {
  const catMap = items.reduce((acc,it)=>{
    const k = it.category || "Other";
    acc[k] = (acc[k]||0)+Number(it.duration||0);
    return acc;
  }, {});
  const labels = Object.keys(catMap);
  const data = labels.map(l=>catMap[l]);
  const colors = labels.map(l=>categoryColor(l));

  // Pie/donut
  const pieCtx = document.getElementById("pieChart");
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type: "doughnut",
    data: { labels, datasets:[ { data, backgroundColor: colors } ] },
    options: { cutout: "60%", plugins:{ legend:{ position: "bottom" } } }
  });

  // Bar (activities)
  const actLabels = items.map(i=>i.name);
  const actData = items.map(i=>i.duration);
  const barCtx = document.getElementById("barChart");
  if (barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type: "bar",
    data: { labels: actLabels, datasets:[ { label:"Minutes", data: actData, backgroundColor: actLabels.map((_,i)=>colors[i%colors.length]) } ] },
    options: { indexAxis: "y", plugins:{ legend:{ display:false } } }
  });
}

function renderTimeline(items) {
  dashTimeline.innerHTML = "";
  const total = items.reduce((s,i)=> s + Number(i.duration||0), 0) || 1;
  items.forEach(it=>{
    const percent = Math.max(3, Math.round((it.duration/total)*100));
    const div = document.createElement("div");
    div.className = "m3-timeline__block";
    div.style.width = `${percent}%`;
    div.style.background = categoryColor(it.category);
    div.title = `${it.name} • ${it.category} • ${it.duration} min`;
    div.innerHTML = `<span style="padding:6px;font-weight:700;color:#fff">${it.name} (${it.duration}m)</span>`;
    dashTimeline.appendChild(div);
  });
}

function destroyCharts() {
  if (pieChart) { pieChart.destroy(); pieChart = null; }
  if (barChart) { barChart.destroy(); barChart = null; }
}

