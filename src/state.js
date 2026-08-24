// Save data, migration, shared state, history, and selected profile state.
function newState() {
  return {
    week: 1,
    cash: 10000,
    buildingLevel: 1,
    facilities: Object.fromEntries(FACILITY_NAMES.map(n => [n, 1])),
    pendingFacilities: {},
    pendingBuildingLevel: null,
    performers: [contractFor(byId("zella"))],
    formerPerformers: [],
    transactions: [],
    activePromotions: {},
    clubHistory: [],
    lastLedger: null,
    selectedPerformerId: "zella",
    selectedSource: "active",
    profileOpen: false,
  };
}



function normalizePerformer(p) {
  const base = byId(p.id) || { id: p.id, name: p.name || "Unknown", concept: p.concept || "Former performer" };
  return contractFor(base, {
    ...p,
    history: Array.isArray(p.history) ? p.history : [],
    trainingCompleted: p.trainingCompleted || 0,
    weeklyCost: performerBasePay({ ...base, ...p }),
    renewalOffer: null,
    renewalAttempted: !!p.renewalAttempted,
    renewalDeclined: !!p.renewalDeclined,
    rehireOffer: p.rehireOffer || null,
    exitReason: p.exitReason || null,
    lastWeeklyCost: p.lastWeeklyCost || p.weeklyCost || 200,
    returnWeeks: Math.max(0, p.returnWeeks || 0),
    injuryWeeks: Math.max(0, p.injuryWeeks || 0),
    resetOnReturn: !!p.resetOnReturn,
    skipReturnTick: !!p.skipReturnTick,
  });
}

function migrate(raw) {
  const fresh = newState();
  if (!raw || typeof raw !== "object") return fresh;
  return {
    ...fresh,
    ...raw,
    facilities: { ...fresh.facilities, ...raw.facilities },
    pendingFacilities: raw.pendingFacilities && typeof raw.pendingFacilities === "object" ? raw.pendingFacilities : {},
    pendingBuildingLevel: raw.pendingBuildingLevel || null,
    performers: (raw.performers || fresh.performers).map(normalizePerformer),
    formerPerformers: (raw.formerPerformers || []).map(normalizePerformer),
    transactions: Array.isArray(raw.transactions) ? raw.transactions : [],
    activePromotions: normalizeActivePromotions(raw.activePromotions),
    clubHistory: Array.isArray(raw.clubHistory) ? raw.clubHistory : [],
    lastLedger: raw.lastLedger && raw.lastLedger.version === "v1.6" ? raw.lastLedger : null,
    selectedPerformerId: raw.selectedPerformerId || "zella",
    selectedSource: raw.selectedSource || "active",
    profileOpen: !!raw.profileOpen,
  };
}

function loadState() {
  try {
    return migrate(JSON.parse(localStorage.getItem(SAVE_KEY)));
  } catch {
    return newState();
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function commit(message) {
  saveState();
  setMessage(message);
  render();
}

function canPay(amount) {
  return state.cash >= amount;
}

function requireCash(amount, label) {
  if (canPay(amount)) return true;
  setMessage(`Insufficient cash for ${label}: need ${money(amount)}, have ${money(state.cash)}.`);
  render();
  return false;
}

function recordTransaction(label, amount) {
  state.transactions.push({ label, amount, week: state.week });
}

function addHistory(text, week = state.week) {
  state.clubHistory.unshift({ week, text });
  state.clubHistory = state.clubHistory.slice(0, 120);
}

function chooseProfile(id, source = "active") {
  state.selectedPerformerId = id;
  state.selectedSource = source;
  state.profileOpen = true;
  saveState();
  render();
}

function closeProfile() {
  state.profileOpen = false;
  saveState();
  render();
}

function selectedPerformer() {
  if (state.selectedSource === "former") return state.formerPerformers.find(p => p.id === state.selectedPerformerId);
  if (state.selectedSource === "market") return contractFor(byId(state.selectedPerformerId));
  return state.performers.find(p => p.id === state.selectedPerformerId) || state.performers[0];
}

function newGame() {
  if (!confirm("Start a New Game? This will permanently erase your current Ned's Naughties save.")) return;
  state = newState();
  saveState();
  setMessage("New game started. Ned's Naughties is back to Week 1.");
  render();
}

function setMessage(t) {
  document.querySelector("#message").textContent = t;
}

let state = loadState();
