const FACILITY_NAMES = ["Bar", "Main Stage", "VIP", "Private Dance Area", "DJ Booth", "Dressing Room", "Parking Lot"];
const CAPACITY = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
const BUILDING_EXPENSES = {
  1: { tax: 100, operations: 500, advertising: 100, sheriff: 100 },
  2: { tax: 200, operations: 750, advertising: 150, sheriff: 150 },
  3: { tax: 400, operations: 1250, advertising: 250, sheriff: 250 },
  4: { tax: 750, operations: 2000, advertising: 400, sheriff: 400 },
  5: { tax: 1250, operations: 3500, advertising: 750, sheriff: 750 },
};
const SIGNING_FEE = 1000;
const TRAINING_COST = 5000;
const SAVE_KEY = "neds-naughties-v01-save";
const RANKS = ["F", "E", "D", "C", "B", "A"];
const PROMOTION_RESULTS = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25];
const RANDOM_EVENT_CHANCE = 0.35;
const PROMOTION_CATEGORIES = [
  { key: "bar", label: "Bar", facility: "Bar", promotions: ["$1 Beers", "$3 Martinis"] },
  { key: "mainStage", label: "Main Stage", facility: "Main Stage", promotions: ["1/2 Price Entry Fee", "Amateur Night"] },
  { key: "vip", label: "VIP", facility: "VIP", promotions: ["1/2 Price Entry Fee", "Free Champagne"] },
  { key: "privateDance", label: "Private Dance", facility: "Private Dance Area", promotions: ["1/2 Off", "Don't Ask, Don't Tell Dances"] },
  { key: "dj", label: "DJ", facility: "DJ Booth", promotions: ["Professional DJ"] },
];
const ASSETS = {
  buildings: {
    1: "assets/buildings/neds-naughtiest-building-level-1.jpeg",
    2: "assets/buildings/neds-naughtiest-building-level-2.jpeg",
    3: "assets/buildings/neds-naughtiest-building-level-3.jpeg",
    4: "assets/buildings/neds-naughtiest-building-level-4.jpeg",
    5: "assets/buildings/neds-naughtiest-building-level-5.jpeg",
  },
  performers: {
    raven: "assets/performers/raven.jpeg",
    bambi: "assets/performers/bambi.jpeg",
    candy: "assets/performers/candy.jpeg",
    cherry: "assets/performers/cherry.jpeg",
    zella: "assets/performers/zella.jpeg",
    dallas: "assets/performers/dallas.jpeg",
    cinnamon: "assets/performers/cinnamon.jpeg",
  },
};
const PERFORMER_POOL = [
  { id: "raven", name: "Raven", concept: "Brunette bunny" },
  { id: "bambi", name: "Bambi", concept: "Blonde firefighter" },
  { id: "candy", name: "Candy", concept: "Blonde police officer" },
  { id: "cherry", name: "Cherry", concept: "Redheaded cheerleader" },
  { id: "zella", name: "Zella", concept: "Blonde schoolgirl" },
  { id: "dallas", name: "Dallas", concept: "Brunette cowgirl" },
  { id: "cinnamon", name: "Cinnamon", concept: "Brunette nurse" },
];

const byId = id => PERFORMER_POOL.find(p => p.id === id);
const money = n => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const pct = (min, max) => min + Math.random() * (max - min);
const rateWithPremium = (rate, min, max) => Math.round(rate * (1 + pct(min, max)));
const rateWithDiscount = (rate, min, max) => Math.max(1, Math.round(rate * (1 - pct(min, max))));
const randomItem = items => items[Math.floor(Math.random() * items.length)];

function contractFor(performer, overrides = {}) {
  return {
    ...performer,
    rank: "F",
    weeklyCost: 200,
    weeksRemaining: 26,
    trainingWeeks: 0,
    injuryWeeks: 0,
    revenueMultiplier: 1,
    trainingCompleted: 0,
    history: [],
    renewalOffer: null,
    rehireOffer: null,
    ...overrides,
  };
}

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

let state = loadState();

function normalizePerformer(p) {
  const base = byId(p.id) || { id: p.id, name: p.name || "Unknown", concept: p.concept || "Former performer" };
  return contractFor(base, {
    ...p,
    history: Array.isArray(p.history) ? p.history : [],
    trainingCompleted: p.trainingCompleted || 0,
    renewalOffer: p.renewalOffer || null,
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
    activePromotions: raw.activePromotions && typeof raw.activePromotions === "object" ? raw.activePromotions : {},
    clubHistory: Array.isArray(raw.clubHistory) ? raw.clubHistory : [],
    lastLedger: raw.lastLedger || null,
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

function facilityUpgradeCost(level) {
  return 1000 * Math.pow(2, level - 1);
}

function buildingUpgradeCost(level) {
  return 2000 * Math.pow(2, level - 1);
}

function promotionCost() {
  return 1000 * state.buildingLevel;
}

function rankBaseRevenue(rank) {
  return Math.round(1500 * Math.pow(1.25, Math.max(0, RANKS.indexOf(rank))));
}

function workingPerformers() {
  return state.performers.filter(p => p.trainingWeeks === 0 && p.weeksRemaining > 0 && (p.injuryWeeks || 0) <= 0);
}

function rosterCount() {
  return state.performers.filter(p => p.weeksRemaining > 0).length;
}

function hasCapacity() {
  return rosterCount() < CAPACITY[state.buildingLevel];
}

function performerRevenueRows() {
  return workingPerformers().map(p => ({ name: p.name, amount: rankBaseRevenue(p.rank) }));
}

function basePerformerRevenue() {
  return performerRevenueRows().reduce((sum, row) => sum + row.amount, 0);
}

function performerRevenue(p) {
  return Math.round(rankBaseRevenue(p.rank) * (1 + Object.values(state.facilities).reduce((sum, level) => sum + (level - 1) * 0.05, 0)));
}

function facilityRevenueRows(base = basePerformerRevenue()) {
  return FACILITY_NAMES
    .map(name => ({ name, amount: Math.round(base * ((state.facilities[name] - 1) * 0.05)) }))
    .filter(row => row.amount !== 0);
}

function facilityRevenueTotal(base = basePerformerRevenue()) {
  return facilityRevenueRows(base).reduce((sum, row) => sum + row.amount, 0);
}

function revenueBeforePromotions() {
  const base = basePerformerRevenue();
  return base + facilityRevenueTotal(base);
}

function resolvePromotionRoll() {
  return randomItem(PROMOTION_RESULTS);
}

function promotionImpact(promotion, revenueBase = revenueBeforePromotions()) {
  const categoryBase = Math.round(revenueBase / PROMOTION_CATEGORIES.length);
  return Math.round(categoryBase * (promotion.resultPercent / 100));
}

function promotionRows(revenueBase = revenueBeforePromotions()) {
  return Object.values(state.activePromotions).map(promotion => ({
    label: promotion.name,
    category: promotion.categoryLabel,
    percent: promotion.resultPercent,
    amount: promotionImpact(promotion, revenueBase),
    cost: promotion.cost,
  }));
}

function expenses(sheriffOverride = null) {
  const performerCosts = state.performers.filter(p => p.weeksRemaining > 0).reduce((sum, p) => sum + p.weeklyCost, 0);
  const building = BUILDING_EXPENSES[state.buildingLevel];
  return { performers: performerCosts, ...building, sheriff: sheriffOverride === null ? building.sheriff : sheriffOverride };
}

function expenseTotal(e) {
  return Object.values(e).reduce((sum, amount) => sum + amount, 0);
}

function transactionTotal() {
  return state.transactions.reduce((sum, t) => sum + t.amount, 0);
}

function buildLedgerData({ week, openingCash, sheriffOverride = null, eventRows = [] }) {
  const performerRows = performerRevenueRows();
  const base = performerRows.reduce((sum, row) => sum + row.amount, 0);
  const facilityRows = facilityRevenueRows(base);
  const beforePromos = base + facilityRows.reduce((sum, row) => sum + row.amount, 0);
  const promoRows = promotionRows(beforePromos);
  const e = expenses(sheriffOverride);
  const txRows = state.transactions.map(t => ({ ...t }));
  const revenue = beforePromos + promoRows.reduce((sum, row) => sum + row.amount, 0);
  const events = eventRows.reduce((sum, row) => sum + row.amount, 0);
  const transactions = txRows.reduce((sum, row) => sum + row.amount, 0);
  const totalExpenses = expenseTotal(e);
  const finalNet = revenue + events - totalExpenses - transactions;
  return {
    week,
    openingCash,
    performerRows,
    facilityRows,
    promotionRows: promoRows,
    transactionRows: txRows,
    eventRows,
    expenses: e,
    totalRevenue: revenue,
    eventTotal: events,
    transactionTotal: transactions,
    expenseTotal: totalExpenses,
    finalNet,
    endingCash: openingCash + finalNet,
  };
}

function projectedCashAfterWeek() {
  const data = buildLedgerData({ week: state.week, openingCash: state.cash + transactionTotal() });
  return data.endingCash;
}

function canUpgradeBuilding() {
  if (state.buildingLevel >= 5 || state.pendingBuildingLevel) return false;
  return Object.values(state.facilities).every(level => level > state.buildingLevel);
}

function imageOrPlaceholder(src, alt, label, small, className) {
  return `<div class="${className} art-frame"><img src="${src}" alt="${alt}" onerror="this.parentElement.classList.add('missing-art')" /><span>${label}</span><small>${small}</small></div>`;
}

function statusFor(p) {
  if (p.weeksRemaining <= 0) return "Former";
  if ((p.injuryWeeks || 0) > 0) return `Injured (${p.injuryWeeks}w)`;
  if (p.trainingWeeks) return `Training (${p.trainingWeeks}w)`;
  return "Working";
}

function rosterSummary(p, source) {
  if (source === "former") return `Rank ${p.rank} - ${statusFor(p)}`;
  if ((p.injuryWeeks || 0) > 0) return `Rank ${p.rank} - Injured - ${p.injuryWeeks}w`;
  if (p.trainingWeeks) return `Rank ${p.rank} - Training - ${p.trainingWeeks}w left`;
  return `Rank ${p.rank} - Working - ${p.weeksRemaining}w`;
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

function absenceWeeks() {
  return Math.floor(Math.random() * 5) + 2;
}

function moveFormer(p, reason, overrides = {}) {
  const previousRate = p.weeklyCost;
  const former = {
    ...p,
    weeksRemaining: 0,
    trainingWeeks: 0,
    injuryWeeks: 0,
    lastWeeklyCost: previousRate,
    exitReason: reason,
    returnWeeks: reason === "expired" ? absenceWeeks() : 0,
    rehireOffer: null,
    renewalOffer: null,
    history: [...(p.history || []), `${reason} at Week ${state.week}`],
    ...overrides,
  };
  state.formerPerformers = state.formerPerformers.filter(x => x.id !== p.id).concat(former);
  state.performers = state.performers.filter(x => x.id !== p.id);
  state.selectedPerformerId = former.id;
  state.selectedSource = "former";
}

function marketPerformers() {
  const activeIds = new Set(state.performers.map(p => p.id));
  const formerIds = new Set(state.formerPerformers.map(p => p.id));
  const fresh = PERFORMER_POOL
    .filter(p => !activeIds.has(p.id) && !formerIds.has(p.id) && p.id !== "zella")
    .map(p => ({ kind: "fresh", performer: contractFor(p) }));
  const former = state.formerPerformers
    .filter(p => !activeIds.has(p.id) && (p.returnWeeks || 0) <= 0)
    .map(p => ({ kind: p.resetOnReturn ? "fresh-return" : "former", performer: p }));
  return [...fresh, ...former];
}

function hireRate(item) {
  if (item.kind === "fresh" || item.kind === "fresh-return" || item.performer.resetOnReturn) return 200;
  if (!item.performer.rehireOffer) {
    const min = item.performer.exitReason === "fired" ? 0.20 : 0.10;
    const max = item.performer.exitReason === "fired" ? 0.35 : 0.20;
    item.performer.rehireOffer = rateWithPremium(item.performer.lastWeeklyCost || item.performer.weeklyCost || 200, min, max);
  }
  return item.performer.rehireOffer;
}

function renewalWindow(weeks) {
  if (weeks >= 21) return null;
  if (weeks >= 11) return { key: "early", label: "early renewal penalty", type: "premium", min: 0.05, max: 0.15 };
  if (weeks >= 4) return { key: "sweet", label: "sweet spot discount", type: "discount", min: 0.05, max: 0.10 };
  if (weeks >= 1) return { key: "late", label: "late renewal premium", type: "premium", min: 0.20, max: 0.50 };
  return null;
}

function getRenewalOffer(p) {
  const window = renewalWindow(p.weeksRemaining);
  if (!window) {
    p.renewalOffer = null;
    return null;
  }
  if (!p.renewalOffer || p.renewalOffer.window !== window.key || p.renewalOffer.baseRate !== p.weeklyCost) {
    const weeklyCost = window.type === "discount"
      ? rateWithDiscount(p.weeklyCost, window.min, window.max)
      : rateWithPremium(p.weeklyCost, window.min, window.max);
    p.renewalOffer = { window: window.key, label: window.label, baseRate: p.weeklyCost, weeklyCost, fee: weeklyCost, weeksRemaining: p.weeksRemaining };
  }
  return p.renewalOffer;
}

function renderFacilities() {
  const root = document.querySelector("#facilities");
  root.innerHTML = "";
  FACILITY_NAMES.forEach(name => {
    const level = state.facilities[name];
    const target = state.pendingFacilities[name];
    const cost = facilityUpgradeCost(level);
    const maxed = level >= 5;
    const locked = level > state.buildingLevel;
    const upgrading = !!target;
    const shortCash = !canPay(cost);
    const el = document.createElement("article");
    el.className = "facility";
    el.innerHTML = `<p class="eyebrow">FACILITY</p><h3>${name}</h3><div class="level">Level ${level}${upgrading ? ` -> ${target}` : ""}</div><p class="muted">${upgrading ? `Upgrading to Level ${target}. Effects begin next week.` : `Revenue bonus: +${(level - 1) * 5}%`}</p><button ${maxed || locked || upgrading || shortCash ? "disabled" : ""}>${maxed ? "Max Level" : locked ? "Building upgrade required" : upgrading ? "Upgrade pending" : shortCash ? `Insufficient cash - need ${money(cost)}` : `Upgrade - ${money(cost)}`}</button>`;
    el.querySelector("button").onclick = () => upgradeFacility(name);
    root.appendChild(el);
  });
}

function rosterButton(p, source) {
  const el = document.createElement("button");
  el.className = "roster-item";
  const formerNote = source === "former" && p.returnWeeks > 0 ? ` - Not currently available - Possible return in ${p.returnWeeks} week${p.returnWeeks === 1 ? "" : "s"}` : "";
  el.innerHTML = `${imageOrPlaceholder(ASSETS.performers[p.id], `${p.name} portrait`, p.name.toUpperCase(), "Portrait coming soon", "thumb")}<span><strong>${p.name}</strong><small>${rosterSummary(p, source)}${formerNote}</small></span>`;
  el.onclick = () => chooseProfile(p.id, source);
  return el;
}

function renderRoster() {
  const working = document.querySelector("#working-performers");
  const training = document.querySelector("#training-performers");
  const former = document.querySelector("#former-performers");
  working.innerHTML = "";
  training.innerHTML = "";
  former.innerHTML = "";
  state.performers.filter(p => !p.trainingWeeks).forEach(p => working.appendChild(rosterButton(p, "active")));
  state.performers.filter(p => p.trainingWeeks).forEach(p => training.appendChild(rosterButton(p, "active")));
  state.formerPerformers.forEach(p => former.appendChild(rosterButton(p, "former")));
  if (!working.children.length) working.innerHTML = `<p class="muted empty">No working performers.</p>`;
  if (!training.children.length) training.innerHTML = `<p class="muted empty">No one is training.</p>`;
  if (!former.children.length) former.innerHTML = `<p class="muted empty">No former performers yet.</p>`;
}

function renderMarket() {
  const root = document.querySelector("#recruitment");
  root.innerHTML = "";
  const items = marketPerformers();
  const full = !hasCapacity();
  document.querySelector("#market-status").textContent = full
    ? `Club at capacity: ${rosterCount()}/${CAPACITY[state.buildingLevel]} performer slots filled.`
    : `Open slots: ${CAPACITY[state.buildingLevel] - rosterCount()}. Signing fee: ${money(SIGNING_FEE)}.`;
  items.forEach(item => {
    const p = item.performer;
    const rate = hireRate(item);
    const disabled = full || !canPay(SIGNING_FEE);
    const freshRules = item.kind === "fresh" || item.kind === "fresh-return";
    const el = document.createElement("article");
    el.className = "performer recruit";
    el.tabIndex = 0;
    el.innerHTML = `${imageOrPlaceholder(ASSETS.performers[p.id], `${p.name} portrait`, p.name.toUpperCase(), "Portrait coming soon", "portrait")}<p class="eyebrow">${freshRules ? "AVAILABLE CONTRACT" : "FORMER PERFORMER"}</p><h3>${p.name}</h3><p class="muted">${p.concept}</p><dl><dt>Rank</dt><dd>${freshRules ? "F" : p.rank}</dd><dt>Weekly cost</dt><dd>${money(rate)}</dd><dt>Contract</dt><dd>Fresh 26 weeks</dd><dt>Signing fee</dt><dd>${money(SIGNING_FEE)}</dd></dl><button ${disabled ? "disabled" : ""}>${full ? "Club at capacity" : !canPay(SIGNING_FEE) ? "Insufficient cash" : `Hire - ${money(SIGNING_FEE)}`}</button>`;
    el.onclick = () => chooseProfile(p.id, freshRules && item.kind !== "fresh-return" ? "market" : "former");
    el.onkeydown = e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        chooseProfile(p.id, freshRules && item.kind !== "fresh-return" ? "market" : "former");
      }
    };
    el.querySelector("button").onclick = e => {
      e.stopPropagation();
      hire(p.id, item.kind);
    };
    root.appendChild(el);
  });
  if (!items.length) root.innerHTML = `<p class="muted empty">No available contracts.</p>`;
}

function renderProfile() {
  const p = selectedPerformer();
  const root = document.querySelector("#profile");
  root.classList.toggle("open", !!state.profileOpen && !!p);
  if (!p) {
    root.innerHTML = "";
    return;
  }
  const employed = state.performers.some(x => x.id === p.id);
  const offer = employed ? getRenewalOffer(p) : null;
  const fireFee = employed ? Math.round(p.weeklyCost * p.weeksRemaining * 0.5) : 0;
  const formerUnavailable = !employed && (p.returnWeeks || 0) > 0;
  const marketFresh = state.selectedSource === "market";
  const resetReturn = !employed && p.resetOnReturn;
  const askingRate = employed ? p.weeklyCost : marketFresh || resetReturn ? 200 : formerUnavailable ? (p.rehireOffer || p.lastWeeklyCost || p.weeklyCost) : hireRate({ kind: "former", performer: p });
  const statusText = marketFresh ? "Available contract" : formerUnavailable ? `Not currently available - possible return in ${p.returnWeeks} week${p.returnWeeks === 1 ? "" : "s"}` : statusFor(p);
  const weeklyRevenue = employed && p.trainingWeeks === 0 && p.weeksRemaining > 0 && (p.injuryWeeks || 0) <= 0 ? money(performerRevenue(p)) : employed && (p.injuryWeeks || 0) > 0 ? "$0" : "N/A";
  const history = (p.history || []).slice(-5).join("<br>") || "No training or contract history yet.";
  const renewText = offer ? `Renew - ${money(offer.fee)} now (${money(offer.weeklyCost)}/week, ${offer.label})` : p.weeksRemaining >= 21 ? "Too early to renew" : "Renew unavailable";
  const trainDisabled = p.trainingWeeks || (p.injuryWeeks || 0) > 0 || p.weeksRemaining <= 4 || p.rank === "A" || !canPay(TRAINING_COST);
  const trainText = p.rank === "A" ? "Max Rank" : (p.injuryWeeks || 0) > 0 ? "Cannot train while injured" : canPay(TRAINING_COST) ? "Train - $5,000" : "Insufficient cash for training";
  root.innerHTML = `<div class="profile-shell"><button id="profile-close" class="profile-close">Close</button><div class="profile-grid">${imageOrPlaceholder(ASSETS.performers[p.id], `${p.name} portrait`, p.name.toUpperCase(), "Portrait coming soon", "profile-art")}<div><p class="eyebrow">PERFORMER PROFILE</p><h2>${p.name}</h2><p class="muted">${p.concept}</p><dl class="profile-dl"><dt>Rank</dt><dd>${resetReturn ? "F" : p.rank}</dd><dt>Weekly cost</dt><dd>${money(askingRate)}</dd><dt>Weekly revenue</dt><dd>${weeklyRevenue}</dd><dt>Contract</dt><dd>${employed ? `${p.weeksRemaining} weeks` : marketFresh || resetReturn ? "Fresh 26 weeks" : "Former"}</dd><dt>Status</dt><dd>${statusText}</dd><dt>Training completed</dt><dd>${resetReturn ? 0 : p.trainingCompleted || 0}</dd><dt>Injury</dt><dd>${(p.injuryWeeks || 0) > 0 ? `${p.injuryWeeks} week${p.injuryWeeks === 1 ? "" : "s"} remaining` : "N/A"}</dd><dt>Last exit</dt><dd>${p.exitReason || "N/A"}</dd></dl><div class="profile-actions">${employed ? `<button id="profile-train" ${trainDisabled ? "disabled" : ""}>${trainText}</button><button id="profile-renew" ${!offer || !canPay(offer.fee) ? "disabled" : ""}>${offer && !canPay(offer.fee) ? "Insufficient cash for renewal" : renewText}</button><button id="profile-fire" ${!canPay(fireFee) ? "disabled" : ""}>${canPay(fireFee) ? `Fire - ${money(fireFee)} fee` : "Insufficient cash to fire"}</button>` : `<button id="profile-hire" ${formerUnavailable || !hasCapacity() || !canPay(SIGNING_FEE) ? "disabled" : ""}>${formerUnavailable ? "Not currently available" : !hasCapacity() ? "Club at capacity" : !canPay(SIGNING_FEE) ? "Insufficient cash to hire" : `${marketFresh || resetReturn ? "Hire" : "Rehire"} - ${money(SIGNING_FEE)} fee`}</button>`}</div><p class="muted">${employed ? "Renewal is locked out with 21-26 weeks remaining. Injured performers keep their roster slot and contract cost." : `${marketFresh || resetReturn ? "Available contract" : "Former performer"}. Hire creates a fresh 26-week contract once available.`}</p><h3>History</h3><p class="muted">${history}</p></div></div></div>`;
  document.querySelector("#profile-close").onclick = closeProfile;
  if (employed) {
    document.querySelector("#profile-train").onclick = () => train(p.id);
    document.querySelector("#profile-renew").onclick = () => renew(p.id);
    document.querySelector("#profile-fire").onclick = () => firePerformer(p.id);
  } else {
    document.querySelector("#profile-hire").onclick = () => hire(p.id, marketFresh || resetReturn ? "fresh-return" : "former");
  }
}

function signedMoney(amount) {
  if (amount > 0) return `+${money(amount)}`;
  if (amount < 0) return `-${money(Math.abs(amount))}`;
  return money(0);
}

function amountClass(amount) {
  return amount >= 0 ? "positive" : "negative";
}

function renderLedgerRows(rows, empty, signed = false) {
  if (!rows.length) return `<p class="muted empty">${empty}</p>`;
  return rows.map(row => `<div class="ledger-row"><span>${row.label || row.name}</span><strong class="${amountClass(row.amount)}">${signed ? signedMoney(row.amount) : money(row.amount)}</strong></div>`).join("");
}

function renderLedgerData(data, mode) {
  const expense = data.expenses;
  const promoRows = data.promotionRows.map(row => ({ label: `${row.label} (${row.percent > 0 ? "+" : ""}${row.percent}%)`, amount: row.amount }));
  return `<p class="muted">${mode === "last" ? `Closed Week ${data.week}.` : `Projected Week ${data.week} if you advance now. Random events are unknown until the button is pressed.`}</p><div class="ledger-row total"><span>Opening cash</span><strong>${money(data.openingCash)}</strong></div><h3>Performer Revenue</h3>${renderLedgerRows(data.performerRows, "No working performers generating revenue.")}<h3>Existing Club / Facility Revenue Effects</h3>${renderLedgerRows(data.facilityRows, "No facility revenue bonuses yet.")}<div class="ledger-row total"><span>Total club revenue before promotions</span><strong class="positive">${money(data.totalRevenue - data.promotionRows.reduce((sum, row) => sum + row.amount, 0))}</strong></div><h3>Promotion Effects</h3>${renderLedgerRows(promoRows, "No promotions active.", true)}<h3>Random Events</h3>${renderLedgerRows(data.eventRows, "No random event affected this ledger.", true)}<h3>This Week Transactions</h3>${data.transactionRows.length ? data.transactionRows.map(t => `<div class="ledger-row"><span>${t.label}</span><strong class="negative">-${money(t.amount)}</strong></div>`).join("") : `<p class="muted empty">No one-time transactions this week.</p>`}<h3>Recurring Expenses</h3><div class="ledger-row"><span>Performer contracts</span><strong class="negative">-${money(expense.performers)}</strong></div><div class="ledger-row"><span>Property tax</span><strong class="negative">-${money(expense.tax)}</strong></div><div class="ledger-row"><span>Operations</span><strong class="negative">-${money(expense.operations)}</strong></div><div class="ledger-row"><span>Advertising</span><strong class="negative">-${money(expense.advertising)}</strong></div><div class="ledger-row"><span>Sheriff</span><strong class="${expense.sheriff === 0 ? "positive" : "negative"}">${expense.sheriff === 0 ? money(0) : `-${money(expense.sheriff)}`}</strong></div><div class="ledger-row total"><span>Final weekly net</span><strong class="${amountClass(data.finalNet)}">${signedMoney(data.finalNet)}</strong></div><div class="ledger-row total"><span>${mode === "last" ? "Ending cash" : "Projected cash after advancing week"}</span><strong class="${amountClass(data.endingCash)}">${money(data.endingCash)}</strong></div>`;
}

function renderLedger() {
  const current = buildLedgerData({ week: state.week, openingCash: state.cash + transactionTotal() });
  const last = state.lastLedger ? `<details class="subpanel" open><summary>Last Closed Week</summary>${renderLedgerData(state.lastLedger, "last")}</details>` : "";
  document.querySelector("#ledger").innerHTML = `${last}<details class="subpanel" open><summary>Current Week Projection</summary>${renderLedgerData(current, "current")}</details>`;
}

function renderPromotions() {
  const root = document.querySelector("#promotions");
  const cost = promotionCost();
  const revenueBase = revenueBeforePromotions();
  root.innerHTML = "";
  PROMOTION_CATEGORIES.forEach(category => {
    const selected = state.activePromotions[category.key];
    const el = document.createElement("article");
    el.className = "promotion-card";
    const result = selected ? `<div class="promotion-result"><strong>${selected.name}</strong><span>Cost: ${money(selected.cost)}</span><span>Result: ${selected.resultPercent > 0 ? "+" : ""}${selected.resultPercent}%</span><span>Revenue impact: ${signedMoney(promotionImpact(selected, revenueBase))}</span></div>` : `<p class="muted">One ${category.label} promotion may run this week.</p>`;
    const buttons = category.promotions.map(name => {
      const disabled = selected || !canPay(cost);
      return `<button data-category="${category.key}" data-promo="${name}" ${disabled ? "disabled" : ""}>${selected && selected.name !== name ? "Locked this week" : !canPay(cost) ? `Insufficient cash - need ${money(cost)}` : `${name} - ${money(cost)}`}</button>`;
    }).join("");
    el.innerHTML = `<p class="eyebrow">PROMOTION</p><h3>${category.label}</h3>${result}<div class="promotion-actions">${buttons}</div>`;
    root.appendChild(el);
  });
  root.querySelectorAll("button[data-category]").forEach(button => {
    button.onclick = () => buyPromotion(button.dataset.category, button.dataset.promo);
  });
}

function renderHistory() {
  const root = document.querySelector("#club-history");
  if (!state.clubHistory.length) {
    root.innerHTML = `<p class="muted empty">No major history yet.</p>`;
    return;
  }
  root.innerHTML = state.clubHistory.map(entry => `<div class="history-row"><strong>Week ${entry.week}</strong><span>${entry.text}</span></div>`).join("");
}

function render() {
  document.querySelector("#week").textContent = state.week;
  document.querySelector("#cash").textContent = money(state.cash);
  document.querySelector("#building-level").textContent = state.buildingLevel;
  document.querySelector("#capacity").textContent = CAPACITY[state.buildingLevel];
  document.querySelector("#capacity-used").textContent = rosterCount();
  document.querySelector("#sticky-cash").textContent = money(state.cash);
  document.querySelector("#sticky-week").textContent = state.week;
  document.querySelector("#sticky-building").textContent = state.buildingLevel;
  document.querySelector("#sticky-capacity").textContent = `${rosterCount()}/${CAPACITY[state.buildingLevel]}`;
  document.querySelector("#building-art").innerHTML = imageOrPlaceholder(ASSETS.buildings[state.buildingLevel] || "", `Ned's Naughtiest Building Level ${state.buildingLevel}`, `BUILDING LEVEL ${state.buildingLevel}`, "Artwork coming soon", "building-art");
  const b = document.querySelector("#building-upgrade");
  const cost = buildingUpgradeCost(state.buildingLevel);
  const buildingReady = canUpgradeBuilding();
  const shortCash = !canPay(cost);
  b.textContent = state.buildingLevel >= 5 ? "Building Maxed" : state.pendingBuildingLevel ? `Building upgrade pending: Level ${state.pendingBuildingLevel}` : buildingReady && shortCash ? `Insufficient cash - need ${money(cost)}` : `Upgrade Building - ${money(cost)}`;
  b.disabled = !buildingReady || shortCash;
  document.querySelector("#building-requirement").textContent = state.pendingBuildingLevel ? `Building Level ${state.pendingBuildingLevel} completes next week.` : state.buildingLevel >= 5 ? "Ned's Naughties has reached Level 5." : `All facilities must reach Level ${state.buildingLevel + 1} first.`;
  renderFacilities();
  renderRoster();
  renderMarket();
  renderProfile();
  renderPromotions();
  renderLedger();
  renderHistory();
  saveState();
}

function upgradeFacility(name) {
  const level = state.facilities[name];
  const cost = facilityUpgradeCost(level);
  if (level >= 5 || level > state.buildingLevel || state.pendingFacilities[name]) return;
  if (!requireCash(cost, `${name} upgrade`)) return;
  state.cash -= cost;
  state.pendingFacilities[name] = level + 1;
  recordTransaction(`${name} Upgrade`, cost);
  addHistory(`${name} upgrade purchased for ${money(cost)}. Level ${level + 1} effects begin next week.`);
  commit(`${name} upgrade purchased. Level ${level + 1} effects begin next week.`);
}

function upgradeBuilding() {
  if (!canUpgradeBuilding()) return;
  const cost = buildingUpgradeCost(state.buildingLevel);
  if (!requireCash(cost, "building upgrade")) return;
  state.cash -= cost;
  state.pendingBuildingLevel = state.buildingLevel + 1;
  recordTransaction("Building Upgrade", cost);
  addHistory(`Building Level ${state.pendingBuildingLevel} upgrade purchased for ${money(cost)}. Effects begin next week.`);
  commit(`Building Level ${state.pendingBuildingLevel} purchased. Capacity, expenses, and artwork update next week.`);
}

function buyPromotion(categoryKey, name) {
  const category = PROMOTION_CATEGORIES.find(c => c.key === categoryKey);
  if (!category || state.activePromotions[categoryKey]) return;
  const cost = promotionCost();
  if (!requireCash(cost, `${category.label} promotion`)) return;
  const resultPercent = resolvePromotionRoll({ categoryKey, name });
  state.cash -= cost;
  const promotion = { id: `${categoryKey}-${Date.now()}`, name, categoryKey, categoryLabel: category.label, cost, resultPercent };
  state.activePromotions[categoryKey] = promotion;
  recordTransaction(`${name} Promotion`, cost);
  addHistory(`${name} promotion purchased for ${money(cost)}. Rolled ${resultPercent > 0 ? "+" : ""}${resultPercent}%.`);
  commit(`${name} purchased for ${money(cost)}. Rolled result: ${resultPercent > 0 ? "+" : ""}${resultPercent}%.`);
}

function hire(id, kind = "fresh") {
  if (!hasCapacity()) {
    setMessage(`Club at capacity: ${rosterCount()}/${CAPACITY[state.buildingLevel]} performer slots filled.`);
    render();
    return;
  }
  if (!requireCash(SIGNING_FEE, "signing fee")) return;
  const active = state.performers.some(p => p.id === id && p.weeksRemaining > 0);
  if (active) return;
  const former = state.formerPerformers.find(p => p.id === id);
  if (former && (former.returnWeeks || 0) > 0) {
    setMessage(`${former.name} is not currently available. Possible return in ${former.returnWeeks} week${former.returnWeeks === 1 ? "" : "s"}.`);
    render();
    return;
  }
  const freshReturn = kind === "fresh-return" || (former && former.resetOnReturn);
  const base = freshReturn ? byId(id) : former || contractFor(byId(id));
  const item = { kind: freshReturn ? "fresh-return" : former ? "former" : kind, performer: base };
  const weeklyCost = hireRate(item);
  state.cash -= SIGNING_FEE;
  recordTransaction(`${base.name} Signing Fee`, SIGNING_FEE);
  state.performers.push(contractFor(base, { weeklyCost, weeksRemaining: 26, trainingWeeks: 0, injuryWeeks: 0, renewalOffer: null, rehireOffer: null, returnWeeks: 0, exitReason: null, resetOnReturn: false, history: freshReturn ? [] : base.history || [] }));
  state.formerPerformers = state.formerPerformers.filter(p => p.id !== id);
  state.selectedPerformerId = id;
  state.selectedSource = "active";
  state.profileOpen = true;
  addHistory(`${base.name} signed a fresh 26-week contract. Signing fee: ${money(SIGNING_FEE)}.`);
  commit(`${base.name} signed a fresh 26-week contract. Signing fee paid: ${money(SIGNING_FEE)}.`);
}

function train(id) {
  const p = state.performers.find(x => x.id === id);
  if (!p || p.trainingWeeks) return;
  if (p.rank === "A") {
    setMessage(`${p.name} is already Max Rank.`);
    render();
    return;
  }
  if ((p.injuryWeeks || 0) > 0) {
    setMessage(`${p.name} cannot train while injured.`);
    render();
    return;
  }
  if (!requireCash(TRAINING_COST, "training")) return;
  state.cash -= TRAINING_COST;
  recordTransaction(`${p.name} Training`, TRAINING_COST);
  p.trainingWeeks = 4;
  addHistory(`${p.name} started training. Cost: ${money(TRAINING_COST)}.`);
  commit(`${p.name} left for four weeks of dance and specialization training. Her contract clock keeps running.`);
}

function renew(id) {
  const p = state.performers.find(x => x.id === id);
  if (!p || p.weeksRemaining <= 0) return;
  const offer = getRenewalOffer(p);
  if (!offer) {
    setMessage(`${p.name} is too early to renew. Renewal unlocks with 20 or fewer weeks remaining.`);
    render();
    return;
  }
  if (!requireCash(offer.fee, "contract renewal")) return;
  state.cash -= offer.fee;
  recordTransaction(`${p.name} Contract Renewal`, offer.fee);
  p.weeklyCost = offer.weeklyCost;
  p.weeksRemaining = 26;
  p.renewalOffer = null;
  addHistory(`${p.name} renewed at ${money(p.weeklyCost)}/week. Renewal fee: ${money(offer.fee)}.`);
  commit(`${p.name} renewed at ${money(p.weeklyCost)}/week for a fresh 26 weeks. Renewal fee paid: ${money(offer.fee)}.`);
}

function firePerformer(id) {
  const p = state.performers.find(x => x.id === id);
  if (!p) return;
  const fee = Math.round(p.weeklyCost * p.weeksRemaining * 0.5);
  if (!requireCash(fee, "contract termination")) return;
  if (!confirm(`Terminate ${p.name}'s contract for ${money(fee)}?`)) return;
  state.cash -= fee;
  recordTransaction(`${p.name} Contract Cancellation`, fee);
  addHistory(`${p.name} was fired. Cancellation fee: ${money(fee)}.`);
  moveFormer(p, "fired");
  commit(`${p.name}'s contract was terminated. Cancellation fee paid: ${money(fee)}.`);
}

function finishTraining(p) {
  const i = RANKS.indexOf(p.rank);
  if (i < RANKS.length - 1) p.rank = RANKS[i + 1];
  p.trainingCompleted = (p.trainingCompleted || 0) + 1;
  p.renewalOffer = null;
  const raise = [0, 0.05, 0.10, 0.15, 0.20, 0.25][Math.floor(Math.random() * 6)];
  const old = p.weeklyCost;
  p.weeklyCost = Math.round(p.weeklyCost * (1 + raise));
  const message = `${p.name} returned from training as Rank ${p.rank}. Revenue +25%. Weekly cost ${old === p.weeklyCost ? `stays at ${money(old)}` : `rose from ${money(old)} to ${money(p.weeklyCost)}`}.`;
  addHistory(`${p.name} completed training and reached Rank ${p.rank}.`);
  return message;
}

function completePendingUpgrades() {
  const notices = [];
  Object.entries(state.pendingFacilities).forEach(([name, target]) => {
    state.facilities[name] = target;
    notices.push(`${name} reached Level ${target}.`);
    addHistory(`${name} reached Level ${target}.`);
  });
  state.pendingFacilities = {};
  if (state.pendingBuildingLevel) {
    state.buildingLevel = state.pendingBuildingLevel;
    notices.push(`Building reached Level ${state.buildingLevel}.`);
    addHistory(`Building reached Level ${state.buildingLevel}.`);
    state.pendingBuildingLevel = null;
  }
  return notices;
}

function eligibleEventPerformers() {
  return state.performers.filter(p => p.trainingWeeks === 0 && p.weeksRemaining > 1 && (p.injuryWeeks || 0) <= 0);
}

function makeCashEvent(label, amount, message, historyText = null) {
  return { label, amount, message, historyText: historyText || message };
}

function rollRandomEvent() {
  if (Math.random() >= RANDOM_EVENT_CHANCE) return null;
  const level = state.buildingLevel;
  const candidates = [
    () => makeCashEvent("Bachelor Party", 1000, "A bachelor party came through Ned's Naughties. +$1,000."),
    () => makeCashEvent("Out-of-Hand Bachelor Party", -2000, "A bachelor party got out of hand. Repairs and cleanup cost $2,000."),
    () => makeCashEvent("Positive Radio Mention", 1000, "A local radio station mentioned Ned's Naughties. Business picked up. +$1,000."),
    () => makeCashEvent("Cockroach Radio Mention", -3000, "A local radio station mentioned cockroaches in the bar. -$3,000."),
    () => makeCashEvent("Wallet Found", 1000, "Aaron found a wallet in the parking lot. +$1,000."),
    () => makeCashEvent("Club Robbery", -(10000 * level), `Ned's Naughties was robbed overnight. -${money(10000 * level)}.`, `Ned's Naughties was robbed: -${money(10000 * level)}.`),
    () => ({ label: "Longhorns Win", amount: 0, sheriffOverride: 0, message: "The Longhorns won. The Sheriff is in a good mood and waived his cut this week.", historyText: "Longhorns won. Sheriff payment waived." }),
    () => ({ label: "Longhorns Loss", amount: 0, sheriffOverride: 10000 * level, message: `The Longhorns lost. The Sheriff is pissed and demands ${money(10000 * level)} this week.`, historyText: `Longhorns lost. Sheriff demanded ${money(10000 * level)}.` }),
  ];
  const eligible = eligibleEventPerformers();
  if (eligible.length) {
    candidates.push(() => {
      const performer = randomItem(eligible);
      const duration = level;
      return {
        label: "Performer Groin Injury",
        amount: 0,
        message: `${performer.name} pulled her groin and will miss ${duration} week${duration === 1 ? "" : "s"}.`,
        historyText: `${performer.name} pulled her groin and will miss ${duration} week${duration === 1 ? "" : "s"}.`,
        applyAfterWeek: () => {
          const current = state.performers.find(p => p.id === performer.id);
          if (current && current.weeksRemaining > 0) current.injuryWeeks = duration;
        },
      };
    });
    candidates.push(() => {
      const performer = randomItem(eligible);
      return {
        label: "Champagne Bottle / Hot-Air-Balloon Death",
        amount: 0,
        message: `A champagne bottle fell from a hot-air balloon and killed ${performer.name}.`,
        historyText: `A champagne bottle fell from a hot-air balloon and killed ${performer.name}.`,
        applyBeforeWeek: () => {
          const current = state.performers.find(p => p.id === performer.id);
          if (!current) return;
          moveFormer(current, "hot-air-balloon death", {
            rank: "F",
            weeklyCost: 200,
            trainingCompleted: 0,
            returnWeeks: 4,
            resetOnReturn: true,
            skipReturnTick: true,
            lastWeeklyCost: 200,
            history: [],
          });
        },
      };
    });
  }
  return randomItem(candidates)();
}

function advanceWeek() {
  const closingWeek = state.week;
  const openingCash = state.cash + transactionTotal();
  const event = rollRandomEvent();
  const eventRows = [];
  let sheriffOverride = null;
  if (event) {
    if (event.applyBeforeWeek) event.applyBeforeWeek();
    sheriffOverride = Object.prototype.hasOwnProperty.call(event, "sheriffOverride") ? event.sheriffOverride : null;
    eventRows.push({ label: event.label, amount: event.amount || 0 });
  }
  const ledger = buildLedgerData({ week: closingWeek, openingCash, sheriffOverride, eventRows });
  state.cash += ledger.totalRevenue + ledger.eventTotal - ledger.expenseTotal;
  state.lastLedger = ledger;

  ledger.promotionRows.forEach(row => {
    const result = row.percent > 0 ? "succeeded" : row.percent < 0 ? "backfired" : "broke even";
    addHistory(`${row.label} ${result}: ${row.percent > 0 ? "+" : ""}${row.percent}%. Revenue impact: ${signedMoney(row.amount)}.`, closingWeek);
  });
  if (event) addHistory(event.historyText, closingWeek);

  state.week++;
  let notices = [];
  notices = notices.concat(completePendingUpgrades());

  state.formerPerformers.forEach(p => {
    if ((p.returnWeeks || 0) > 0) {
      if (p.skipReturnTick) {
        p.skipReturnTick = false;
        return;
      }
      p.returnWeeks--;
      if (p.returnWeeks === 0) {
        if (p.resetOnReturn) {
          const message = `Apparently ${p.name} wasn't dead. The hospital had the wrong ${p.name}. ${p.name} has returned to the contract market.`;
          notices.push(message);
          addHistory(message);
        } else {
          notices.push(`${p.name} may be willing to talk again.`);
        }
      }
    }
  });

  [...state.performers].forEach(p => {
    if (p.weeksRemaining > 0) p.weeksRemaining--;
    if ((p.injuryWeeks || 0) > 0) {
      p.injuryWeeks--;
      if (p.injuryWeeks === 0) notices.push(`${p.name} recovered and returned to Working.`);
    }
    if (p.trainingWeeks > 0) {
      p.trainingWeeks--;
      if (p.trainingWeeks === 0) notices.push(finishTraining(p));
    }
    if (p.weeksRemaining === 0) {
      notices.push(`${p.name}'s 26-week contract expired. She may return to the contract market later.`);
      addHistory(`${p.name}'s contract expired.`);
      moveFormer(p, "expired");
    }
  });

  if (event && event.applyAfterWeek) event.applyAfterWeek();
  if (event) notices.unshift(event.message);
  state.activePromotions = {};
  state.transactions = [];
  commit(notices.length ? notices.join(" ") : `Week ${closingWeek} closed at ${signedMoney(ledger.finalNet)} final net.`);
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

document.querySelector("#advance-week").onclick = advanceWeek;
document.querySelector("#building-upgrade").onclick = upgradeBuilding;
document.querySelector("#new-game").onclick = newGame;
render();
