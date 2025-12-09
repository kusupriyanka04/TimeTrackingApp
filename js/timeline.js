// js/timeline.js
import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { categoryColor } from "./helpers.js";

const tlDate = document.getElementById("tlDate");
const timeline24 = document.getElementById("timeline24");

onAuthStateChanged(auth, user=>{
  if (!user) return location.href = "login.html";
  const today = new Date().toISOString().slice(0,10);
  if (!tlDate.value) tlDate.value = today;
  loadDay(tlDate.value, user.uid);
});

tlDate.addEventListener("change", (e)=>{
  const user = auth.currentUser;
  if (!user) return;
  loadDay(e.target.value, user.uid);
});

function loadDay(date, uid) {
  if (!date || !uid) return;
  const r = ref(db, `users/${uid}/days/${date}/activities`);
  onValue(r, snap => {
    if (!snap.exists()) {
      timeline24.innerHTML = `<div class="m3-timeline__placeholder">No activities for this date.</div>`;
      return;
    }
    const items = [];
    snap.forEach(ch=> items.push(ch.val()));
    render(items);
  });
}

function render(items) {
  timeline24.innerHTML = "";
  const total = items.reduce((s,i)=> s + Number(i.duration||0), 0) || 1;
  items.forEach(it=>{
    const percent = Math.max(1, Math.round((it.duration/total)*100));
    const el = document.createElement("div");
    el.className = "m3-timeline__block";
    el.style.width = `${percent}%`;
    el.style.background = categoryColor(it.category);
    el.title = `${it.name} — ${it.duration} min`;
    el.innerHTML = `<span style="padding:6px;font-weight:700;color:#fff">${it.name}</span>`;
    timeline24.appendChild(el);
  });
}
