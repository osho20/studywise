// ---------- Data ----------
let subjects = JSON.parse(localStorage.getItem("subjects") || "[]");

function save() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

// ---------- Helpers ----------
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysLeft(examDateStr) {
  const exam = startOfDay(examDateStr);
  const today = startOfDay(new Date());
  return Math.round((exam - today) / DAY_MS);
}

function formatDate(d) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// ---------- Core planning logic ----------
// Each subject gets a "priority score":
//   difficulty / days left  -> harder + sooner exam = more study time
// Hours of the day are split in proportion to the scores.
function buildDayPlan(hoursPerDay, dayOffset) {
  const date = new Date(startOfDay(new Date()).getTime() + dayOffset * DAY_MS);

  // only subjects whose exam is today or later (relative to this day)
  const active = subjects.filter(s => daysLeft(s.exam) - dayOffset >= 0);
  if (active.length === 0) return { date, slots: [] };

  const scores = active.map(s => {
    const left = daysLeft(s.exam) - dayOffset;
    return s.difficulty / (left + 1);
  });
  const total = scores.reduce((a, b) => a + b, 0);

  const slots = active.map((s, i) => {
    const hours = (scores[i] / total) * hoursPerDay;
    const left = daysLeft(s.exam) - dayOffset;
    return { name: s.name, hours: Math.round(hours * 2) / 2, left };
  });

  // drop slots rounded down to 0 hours, keep at least the top one
  const filtered = slots.filter(s => s.hours > 0);
  slots.sort((a, b) => b.hours - a.hours);
  return { date, slots: filtered.length ? filtered.sort((a, b) => b.hours - a.hours) : [slots[0]] };
}

// ---------- UI ----------
function renderSubjects() {
  const list = document.getElementById("subject-list");
  const empty = document.getElementById("empty-msg");
  list.innerHTML = "";
  empty.hidden = subjects.length > 0;

  const labels = { 1: "Easy", 2: "Medium", 3: "Hard" };

  subjects.forEach((s, index) => {
    const left = daysLeft(s.exam);
    const li = document.createElement("li");
    li.className = "subject";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = s.name;
    const small = document.createElement("small");
    small.textContent = `${labels[s.difficulty]} • Exam ${s.exam} • ${left >= 0 ? left + " days left" : "exam passed"}`;
    info.appendChild(title);
    info.appendChild(small);

    const btn = document.createElement("button");
    btn.className = "remove";
    btn.textContent = "Remove";
    btn.addEventListener("click", () => {
      subjects.splice(index, 1);
      save();
      renderSubjects();
    });

    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderPlan() {
  const hours = Number(document.getElementById("hours").value) || 4;
  const card = document.getElementById("plan-card");
  const todayBox = document.getElementById("today-box");
  const planDiv = document.getElementById("plan");

  if (subjects.length === 0) {
    alert("Please add at least one subject first.");
    return;
  }

  card.hidden = false;
  planDiv.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const day = buildDayPlan(hours, i);
    const box = document.createElement("div");
    box.className = "day";

    const h = document.createElement("h4");
    h.textContent = i === 0 ? `Today (${formatDate(day.date)})` : formatDate(day.date);
    box.appendChild(h);

    if (day.slots.length === 0) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "No active exams. Take a rest! 🎉";
      box.appendChild(p);
    }

    day.slots.forEach(slot => {
      const row = document.createElement("div");
      row.className = "slot";
      const left = document.createElement("span");
      left.textContent = slot.name;
      if (slot.left <= 2) left.className = "urgent";
      const right = document.createElement("span");
      right.textContent = `${slot.hours} h`;
      row.appendChild(left);
      row.appendChild(right);
      box.appendChild(row);
    });

    planDiv.appendChild(box);

    if (i === 0) {
      todayBox.innerHTML = "";
      const t = document.createElement("strong");
      if (day.slots.length) {
        t.textContent = `Focus today: ${day.slots[0].name} (${day.slots[0].hours} h)`;
      } else {
        t.textContent = "Nothing to study today. Enjoy your day!";
      }
      todayBox.appendChild(t);
    }
  }

  card.scrollIntoView({ behavior: "smooth" });
}

// ---------- Events ----------
document.getElementById("subject-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const exam = document.getElementById("exam").value;
  const difficulty = Number(document.getElementById("difficulty").value);
  if (!name || !exam) return;

  subjects.push({ name, exam, difficulty });
  save();
  renderSubjects();
  e.target.reset();
  document.getElementById("difficulty").value = "2";
});

document.getElementById("generate").addEventListener("click", renderPlan);

renderSubjects();
