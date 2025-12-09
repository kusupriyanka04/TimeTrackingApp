// js/helpers.js
export function safeDateStr(dateStr) {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0,10);
}

export function minutesToHoursLabel(mins) {
  const m = Number(mins) || 0;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

export function categoryColor(cat) {
  const map = {
    Work: "#1E88E5",
    Study: "#7C4DFF",
    Sleep: "#00B8D4",
    Entertainment: "#FF7043",
    Exercise: "#43A047",
    Other: "#9E9E9E"
  };
  return map[cat] || map.Other;
}
