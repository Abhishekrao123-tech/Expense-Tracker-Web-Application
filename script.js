function getStorageKey() {
  if (!currentUserId) return null;
  return `tracksmart-${currentUserId}`;
}

/* ===== MONTH SETUP ===== */
const MONTHS = ["Jan", "Feb", "Mar"];
const CURRENT_MONTH = MONTHS[new Date().getMonth()] || "Jan";

/* ===== DEFAULT DATA ===== */
let income = 0;
let expense = 0;
let currentUserId = null;

let monthlyData = {
  Jan: createMonth(),
  Feb: createMonth(),
  Mar: createMonth(),
};

let transactions = [];

/* ===== HELPERS ===== */
function createMonth() {
  return {
    total: 0,
    categories: {
      Entertainment: 0,
      Transportation: 0,
      Food: 0,
      Housing: 0,
      Health: 0,
      Education: 0,
    },
  };
}

/* ===== ELEMENTS ===== */
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const table = document.getElementById("transactions");

const modal = document.getElementById("modal");

/* OPEN MODAL */
const openBtn = document.getElementById("openModal");
if (openBtn && modal) {
  openBtn.onclick = () => {
    modal.style.display = "flex";
  };
}

/* CLOSE MODAL */
const closeBtn = document.getElementById("closeModal");
if (closeBtn && modal) {
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
}

const category = document.getElementById("category");
const radios = document.querySelectorAll("input[name='type']");

/* ===== LOAD / SAVE ===== */
function saveToStorage() {
  const key = getStorageKey();
  if (!key) return;

  localStorage.setItem(
    key,
    JSON.stringify({ income, expense, monthlyData, transactions })
  );
}

function loadFromStorage() {
  const key = getStorageKey();
  if (!key) return;

  const saved = JSON.parse(localStorage.getItem(key));
  if (!saved) return;

  income = saved.income || 0;
  expense = saved.expense || 0;
  monthlyData = saved.monthlyData || monthlyData;
  transactions = saved.transactions || [];

  updateUI();
}

/* ===== CATEGORY SELECT ===== */
function loadCategory(type) {
  category.innerHTML = "";

  if (type === "income") {
    const o = document.createElement("option");
    o.textContent = "Income";
    category.appendChild(o);
    return;
  }

  const def = document.createElement("option");
  def.textContent = "Select a category";
  def.disabled = true;
  def.selected = true;
  category.appendChild(def);

  Object.keys(monthlyData[CURRENT_MONTH].categories).forEach((c) => {
    const o = document.createElement("option");
    o.textContent = c;
    category.appendChild(o);
  });
}

loadCategory("expense");
radios.forEach((r) => (r.onchange = () => loadCategory(r.value)));

/* ===== BAR CHART (MONTHLY) ===== */
const barChart = new Chart(document.getElementById("barChart"), {
  type: "bar",
  data: {
    labels: MONTHS,
    datasets: [
      {
        data: MONTHS.map((m) => monthlyData[m].total),
        backgroundColor: "#6bdcff",
      },
    ],
  },
  options: { plugins: { legend: { display: false } } },
});

/* ===== PIE CHART (CURRENT MONTH) ===== */
const pieChart = new Chart(document.getElementById("pieChart"), {
  type: "doughnut",
  data: {
    labels: Object.keys(monthlyData[CURRENT_MONTH].categories),
    datasets: [
      {
        data: Object.values(monthlyData[CURRENT_MONTH].categories),
        backgroundColor: [
          "#f59e0b",
          "#38bdf8",
          "#22c55e",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
        ],
      },
    ],
  },
  options: {
    cutout: "70%",
    plugins: {
      legend: { labels: { color: "#fff", usePointStyle: true } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: $${ctx.raw.toLocaleString()}`,
        },
      },
    },
  },
});

/* ===== UPDATE UI ===== */
function updateUI() {
  incomeEl.textContent = `$${income.toFixed(2)}`;
  expenseEl.textContent = `$${expense.toFixed(2)}`;
  balanceEl.textContent = `$${(income - expense).toFixed(2)}`;

  barChart.data.datasets[0].data = MONTHS.map((m) => monthlyData[m].total);
  barChart.update();

  pieChart.data.datasets[0].data = Object.values(
    monthlyData[CURRENT_MONTH].categories
  );
  pieChart.update();

  table.innerHTML = "";
  transactions.forEach((t) => addRow(t, false));
}

/* ===== ADD TABLE ROW ===== */
function addRow(t, save = true) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${t.desc}</td>
    <td>${t.category}</td>
    <td>${t.date}</td>
    <td class="right ${t.type === "income" ? "green" : "red"}">
      ${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)}
    </td>
  `;
  table.prepend(tr);

  if (save) {
    transactions.unshift(t);
    saveToStorage();
  }
}

/* ===== ADD TRANSACTION ===== */
document.getElementById("addTransaction").onclick = () => {
  const type = document.querySelector("input[name='type']:checked").value;
  const desc = document.getElementById("desc").value.trim();
  const amt = +document.getElementById("amount").value;

  if (!desc || !amt) return alert("Fill all fields");
  if (type === "expense" && category.value === "Select a category")
    return alert("Please select a category");

  const t = {
    type,
    desc,
    amount: amt,
    category: category.value,
    date: new Date().toDateString(),
    month: CURRENT_MONTH,
  };

  if (type === "income") {
    income += amt;
  } else {
    expense += amt;
    monthlyData[CURRENT_MONTH].total += amt;
    monthlyData[CURRENT_MONTH].categories[t.category] += amt;
  }

  addRow(t);
  updateUI();
  saveToStorage();

  modal.style.display = "none";
};

/* ===== INIT ===== */
const waitForUser = setInterval(() => {
  if (window.currentUserId) {
    currentUserId = window.currentUserId;
    loadFromStorage();
    clearInterval(waitForUser);
  }
}, 100);
