const API_BASE = "http://localhost:5000/api/diagnosis";
const THEME_KEY = "pulsepath_theme";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const symptomsInput = document.getElementById("symptoms");
const diagnoseBtn = document.getElementById("diagnoseBtn");
const historyBtn = document.getElementById("historyBtn");
const loadNowBtn = document.getElementById("loadNowBtn");
const logoutBtn = document.getElementById("logoutBtn");
const mobileNavToggle = document.getElementById("mobileNavToggle");
const topNav = document.getElementById("topNav");
const scrollLine = document.getElementById("scrollLine");
const historySection = document.getElementById("history");
const themeButtons = Array.from(document.querySelectorAll("[data-theme-choice]"));

const resultStatus = document.getElementById("resultStatus");
const mostLikely = document.getElementById("mostLikely");
const descriptionText = document.getElementById("descriptionText");
const symptomCount = document.getElementById("symptomCount");
const uncertainty = document.getElementById("uncertainty");
const entropy = document.getElementById("entropy");
const confidenceChip = document.getElementById("confidenceChip");
const predictionsBody = document.getElementById("predictionsBody");
const precautionsList = document.getElementById("precautionsList");
const historyList = document.getElementById("historyList");

const heroCondition = document.getElementById("heroCondition");
const heroConfidence = document.getElementById("heroConfidence");
const heroBandLabel = document.getElementById("heroBandLabel");

document.getElementById("year").textContent = new Date().getFullYear();

initTheme();

const suggestionPool = [
  "irritation, itching, redness",
  "headache, fatigue, nausea",
  "fever, chills, cough",
  "dry skin, scaling, irritation",
];
let suggestionIndex = 0;
setInterval(() => {
  suggestionIndex = (suggestionIndex + 1) % suggestionPool.length;
  symptomsInput.placeholder = `Try: ${suggestionPool[suggestionIndex]}`;
}, 3200);

diagnoseBtn.addEventListener("click", diagnose);
historyBtn.addEventListener("click", async () => {
  scrollToHistory();
  await loadHistory();
});
loadNowBtn.addEventListener("click", async () => {
  scrollToHistory();
  await loadHistory();
});

symptomsInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    diagnose();
  }
});

if (mobileNavToggle && topNav) {
  mobileNavToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    mobileNavToggle.setAttribute("aria-expanded", String(open));
  });

  topNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      mobileNavToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      document.body.classList.remove("nav-open");
      mobileNavToggle.setAttribute("aria-expanded", "false");
    }
  });
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  scrollLine.style.width = `${Math.min(100, Math.max(0, progress))}%`;
});

async function diagnose() {
  const symptomsArr = symptomsInput.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (symptomsArr.length === 0) {
    setStatus("Enter at least one symptom", "moderate");
    return;
  }

  setStatus("Analyzing signal...", "moderate");
  diagnoseBtn.disabled = true;

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ symptoms: symptomsArr }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data?.message || "Diagnosis failed", "low");
      return;
    }

    renderDiagnosis(data);
    setStatus("Diagnosis complete", "high");
  } catch (error) {
    setStatus("Network error during analysis", "low");
  } finally {
    diagnoseBtn.disabled = false;
  }
}

function renderDiagnosis(data) {
  const result = data?.result || {};
  const analysis = result.analysis || {};
  const predictions = Array.isArray(result.top_predictions) ? result.top_predictions : [];
  const precautions = Array.isArray(result.precautions) ? result.precautions : [];

  mostLikely.textContent = result.most_likely_condition || "N/A";
  descriptionText.textContent = result.description || "No description available.";

  animateNumber(symptomCount, Number(analysis.symptom_count ?? 0), 450, true);
  uncertainty.textContent = analysis.model_uncertainty || "-";
  animateFloat(entropy, Number(analysis.entropy_score ?? 0), 500);

  const overallConfidence = result.overall_confidence || "Unknown";
  confidenceChip.textContent = overallConfidence;
  confidenceChip.className = "chip";
  const confidenceClass = getConfidenceClass(overallConfidence);
  if (confidenceClass) confidenceChip.classList.add(confidenceClass);

  heroCondition.textContent = result.most_likely_condition || "No diagnosis yet";
  heroBandLabel.textContent = overallConfidence;
  heroConfidence.textContent = result.disclaimer || "Educational use only.";

  renderPredictions(predictions);
  renderPrecautions(precautions);
}

function renderPredictions(predictions) {
  predictionsBody.textContent = "";

  if (predictions.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.className = "empty";
    td.textContent = "No predictions returned.";
    tr.appendChild(td);
    predictionsBody.appendChild(tr);
    return;
  }

  predictions.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.style.animation = `fadeInUp 0.35s ease ${index * 0.06}s both`;

    const condition = document.createElement("td");
    condition.textContent = item.possible_condition || "-";

    const probability = document.createElement("td");
    const value = Number(item.probability);
    probability.textContent = Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : "-";

    const confidence = document.createElement("td");
    confidence.textContent = item.confidence_level || "-";

    tr.appendChild(condition);
    tr.appendChild(probability);
    tr.appendChild(confidence);
    predictionsBody.appendChild(tr);
  });
}

function renderPrecautions(precautions) {
  precautionsList.textContent = "";

  if (precautions.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No precautions provided.";
    precautionsList.appendChild(li);
    return;
  }

  precautions.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.style.animation = `fadeInUp 0.35s ease ${index * 0.06}s both`;
    precautionsList.appendChild(li);
  });
}

async function loadHistory() {
  historyBtn.disabled = true;
  historyBtn.textContent = "Loading...";

  try {
    const res = await fetch(`${API_BASE}/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      showHistoryFallback("Failed to load history.");
      return;
    }

    const data = await res.json();
    const entries = normalizeHistory(data);
    renderHistory(entries);
  } catch (error) {
    showHistoryFallback("Network error while loading history.");
  } finally {
    historyBtn.disabled = false;
    historyBtn.textContent = "Load History";
  }
}

function showHistoryFallback(message) {
  historyList.textContent = "";
  const item = document.createElement("article");
  item.className = "history-item empty-state";
  item.textContent = message;
  historyList.appendChild(item);
}

function normalizeHistory(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.history)) return payload.history;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function renderHistory(entries) {
  historyList.textContent = "";

  if (entries.length === 0) {
    showHistoryFallback("No history found.");
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement("article");
    item.className = "history-item";
    item.style.animation = `fadeInUp 0.45s ease ${index * 0.06}s both`;

    const title = document.createElement("h3");
    title.textContent = entry?.result?.most_likely_condition || "Unknown condition";

    const confidence = document.createElement("p");
    confidence.textContent = `Confidence: ${entry?.result?.overall_confidence || "-"}`;

    const symptoms = document.createElement("p");
    const symptomList = Array.isArray(entry?.symptoms) ? entry.symptoms.join(", ") : "-";
    symptoms.textContent = `Symptoms: ${symptomList}`;

    const date = document.createElement("p");
    date.className = "meta";
    date.textContent = formatDate(entry.createdAt);

    item.appendChild(title);
    item.appendChild(confidence);
    item.appendChild(symptoms);
    item.appendChild(date);
    historyList.appendChild(item);
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString();
}

function setStatus(text, level) {
  resultStatus.textContent = text;
  resultStatus.classList.remove("status--high", "status--moderate", "status--low");
  if (level === "high") resultStatus.classList.add("status--high");
  if (level === "moderate") resultStatus.classList.add("status--moderate");
  if (level === "low") resultStatus.classList.add("status--low");

  resultStatus.classList.add("pulse");
  setTimeout(() => resultStatus.classList.remove("pulse"), 350);
}

function getConfidenceClass(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("high")) return "high";
  if (normalized.includes("moderate") || normalized.includes("medium")) return "moderate";
  if (normalized.includes("low")) return "low";
  return "";
}

function animateNumber(node, target, duration, integerOnly) {
  if (!Number.isFinite(target)) {
    node.textContent = "-";
    return;
  }

  const start = Number(node.textContent) || 0;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const value = start + (target - start) * progress;
    node.textContent = integerOnly ? Math.round(value) : value.toFixed(2);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function animateFloat(node, target, duration) {
  if (!Number.isFinite(target)) {
    node.textContent = "-";
    return;
  }

  const start = parseFloat(node.textContent) || 0;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const value = start + (target - start) * progress;
    node.textContent = value.toFixed(3);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function initTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  const initialTheme = storedTheme || "dark";
  applyTheme(initialTheme);

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = button.getAttribute("data-theme-choice") || "dark";
      applyTheme(nextTheme);
    });
  });
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);

  themeButtons.forEach((button) => {
    const active = button.getAttribute("data-theme-choice") === theme;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function scrollToHistory() {
  historySection.scrollIntoView({ behavior: "smooth", block: "start" });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const fadeKeyframes = document.createElement("style");
fadeKeyframes.textContent = "@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}";
document.head.appendChild(fadeKeyframes);
