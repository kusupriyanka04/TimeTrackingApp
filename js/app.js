// js/app.js
import { db, auth } from "./firebase.js";
import { requireAuth } from "./auth.js";
import { ref, push, onValue, remove, update, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { safeDateStr, categoryColor } from "./helpers.js";

requireAuth(); // protect page

// DOM
const datePicker = document.getElementById("datePicker");
const activityName = document.getElementById("activityName");
const categorySelect = document.getElementById("category");
const durationInput = document.getElementById("duration");
const addBtn = document.getElementById("addBtn");
const activityList = document.getElementById("activityList");
const remainingText = document.getElementById("remainingText");
const totalText = document.getElementById("totalText");
const analyseBtn = document.getElementById("analyseBtn");
const timelineEl = document.getElementById("timeline");
const logoutBtn = document.getElementById("logoutBtn");
const openDashboardBtn = document.getElementById("openDashboardBtn");
const clearDayBtn = document.getElementById("clearDayBtn");

const MAX_MINUTES = 1440;

let currentDate = null;
let lastSnapshot = null;

// auth state -> set today's date
auth.onAuthStateChanged(user => {
  if (!user) return; // requireAuth will redirect if needed
  const today = new Date().toISOString().slice(0,10);
  if (!datePicker.value) datePicker.value = today;
  setDate(datePicker.value);
});

// Date change
datePicker.addEventListener("change", (e) => setDate(e.target.value));

// Set date and attach DB listener
function setDate(dateStr) {
  const safe = safeDateStr(dateStr);
  if (!safe) return;
  currentDate = safe;
  listenDay(currentDate);
}

// Listen to DB for a day
function listenDay(date) {
  const uid = auth.currentUser.uid;
  const dayRef = ref(db, `users/${uid}/days/${date}/activities`);
  onValue(dayRef, snap => {
    lastSnapshot = snap;
    renderSnapshot(snap);
  });
}

// Render snapshot to list
function renderSnapshot(snapshot) {
  activityList.innerHTML = "";
  timelineEl.innerHTML = "";
  if (!snapshot.exists()) {
    remainingText.textContent = MAX_MINUTES;
    totalText.textContent = 0;
    analyseBtn.disabled = true;
    timelineEl.classList.add("m3-timeline--empty");
    timelineEl.innerHTML = `<div class="m3-timeline__placeholder">No activities yet</div>`;
    return;
  }

  const items = [];
  let total = 0;
  snapshot.forEach(child => {
    const obj = { id: child.key, ...child.val() };
    items.push(obj);
    total += Number(obj.duration || 0);
  });

  // sort descending by createdAt (if available)
  items.sort((a,b)=> (b.createdAt || 0) - (a.createdAt || 0));

  items.forEach(it => {
    const el = document.createElement("div");
    el.className = "m3-list-item";
    el.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <div style="width:10px;height:40px;background:${categoryColor(it.category)};border-radius:6px"></div>
        <div>
          <div style="font-weight:700">${escapeHtml(it.name)}</div>
          <div class="m3-muted" style="font-size:13px">${escapeHtml(it.category)} • ${it.duration} min</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="m3-btn m3-btn--text edit" data-id="${it.id}">Edit</button>
        <button class="m3-delete del" data-id="${it.id}">Delete</button>
      </div>
    `;
    activityList.appendChild(el);
  });

  remainingText.textContent = String(Math.max(0, MAX_MINUTES - total));
  totalText.textContent = String(total);
  analyseBtn.disabled = !(total >= MAX_MINUTES);

  // timeline
  buildTimeline(items);

  // attach edits/deletes
  activityList.querySelectorAll(".del").forEach(btn=>{
    btn.addEventListener("click", async (e)=>{
      const id = e.currentTarget.dataset.id;
      if (!confirm("Delete this activity?")) return;
      await remove(ref(db, `users/${auth.currentUser.uid}/days/${currentDate}/activities/${id}`));
    });
  });

  activityList.querySelectorAll(".edit").forEach(btn=>{
    btn.addEventListener("click", async (e)=>{
      const id = e.currentTarget.dataset.id;
      const node = snapshot.child(id);
      if (!node.exists()) return alert("Not found");
      const data = node.val();
      const newName = prompt("Activity name", data.name);
      if (newName === null) return;
      const newCategory = prompt("Category", data.category) || data.category;
      const newDuration = Number(prompt("Duration (min)", data.duration));
      if (!newName || !newDuration) return alert("Invalid input");
      // check totals
      let totalNow = 0;
      snapshot.forEach(ch => totalNow += Number(ch.val().duration || 0));
      const candidate = totalNow - Number(data.duration || 0) + newDuration;
      if (candidate > MAX_MINUTES) return alert("Would exceed 1440 minutes");
      await update(ref(db, `users/${auth.currentUser.uid}/days/${currentDate}/activities/${id}`), {
        name: newName, category: newCategory, duration: newDuration
      });
    });
  });
}

function buildTimeline(items) {
  timelineEl.classList.remove("m3-timeline--empty");
  timelineEl.innerHTML = "";
  const total = items.reduce((s,i)=> s + Number(i.duration || 0), 0) || 1;
  items.forEach(it => {
    const percent = Math.max(2, (it.duration / total) * 100);
    const block = document.createElement("div");
    block.className = "m3-timeline__block";
    block.style.width = `${percent}%`;
    block.style.background = categoryColor(it.category);
    block.title = `${it.name} — ${it.duration} min`;
    block.innerHTML = `<span style="padding:6px;font-weight:700;color:white">${escapeHtml(it.name)}</span>`;
    timelineEl.appendChild(block);
  });
}

// Add activity
addBtn.addEventListener("click", async (e)=>{
  e.preventDefault();
  if (!currentDate) return alert("Select a date");
  const name = activityName.value.trim();
  const category = categorySelect.value || "Other";
  const duration = Number(durationInput.value);
  if (!name || !duration || duration <= 0) return alert("Enter valid data");

  // compute existing total
  let existingTotal = 0;
  if (lastSnapshot && lastSnapshot.exists()) {
    lastSnapshot.forEach(ch => existingTotal += Number(ch.val().duration || 0));
  }
  if (existingTotal + duration > MAX_MINUTES) {
    return alert(`Cannot add. You have ${MAX_MINUTES - existingTotal} minutes left.`);
  }

  await push(ref(db, `users/${auth.currentUser.uid}/days/${currentDate}/activities`), {
    name, category, duration, createdAt: Date.now()
  });

  activityName.value = "";
  durationInput.value = "";
});

// Analyse navigation
analyseBtn.addEventListener("click", ()=>{
  if (!currentDate) return alert("Select a date");
  localStorage.setItem("analyseDate", currentDate);
  window.location.href = "dashboard.html";
});

// Logout
logoutBtn.addEventListener("click", async ()=>{
  await auth.signOut();
  window.location.href = "login.html";
});

// Open Dashboard
openDashboardBtn.addEventListener("click", ()=>{
  localStorage.setItem("analyseDate", currentDate || "");
  window.location.href = "dashboard.html";
});

// Clear day
clearDayBtn.addEventListener("click", async ()=>{
  if (!currentDate) return;
  if (!confirm("Delete all activities for this day?")) return;
  await set(ref(db, `users/${auth.currentUser.uid}/days/${currentDate}`), null);
});

// small helper
function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); }

