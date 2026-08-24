// All screen drawing and profile panel behavior.
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
    el.innerHTML = `${imageOrPlaceholder(ASSETS.performers[p.id], `${p.name} portrait`, p.name.toUpperCase(), "Portrait coming soon", "portrait")}<p class="eyebrow">${freshRules ? "AVAILABLE CONTRACT" : "FORMER PERFORMER"}</p><h3>${p.name}</h3><p class="muted">${p.concept}</p><dl><dt>Rank</dt><dd>${freshRules ? "F" : p.rank}</dd><dt>Weekly pay</dt><dd>${money(rate)}</dd><dt>Contract</dt><dd>Fresh 26 weeks</dd><dt>Signing fee</dt><dd>${money(SIGNING_FEE)}</dd></dl><button ${disabled ? "disabled" : ""}>${full ? "Club at capacity" : !canPay(SIGNING_FEE) ? "Insufficient cash" : `Hire - ${money(SIGNING_FEE)}`}</button>`;
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
  const fireFee = employed ? Math.round(performerPay(p) * p.weeksRemaining * 0.5) : 0;
  const formerUnavailable = !employed && (p.returnWeeks || 0) > 0;
  const marketFresh = state.selectedSource === "market";
  const resetReturn = !employed && p.resetOnReturn;
  const askingRate = employed ? performerPay(p) : marketFresh || resetReturn ? performerBasePay({ rank: "F" }) : formerUnavailable ? performerBasePay(p) : hireRate({ kind: "former", performer: p });
  const statusText = marketFresh ? "Available contract" : formerUnavailable ? `Not currently available - possible return in ${p.returnWeeks} week${p.returnWeeks === 1 ? "" : "s"}` : statusFor(p);
  const weeklyRevenue = employed && p.trainingWeeks === 0 && p.weeksRemaining > 0 && (p.injuryWeeks || 0) <= 0 ? money(performerRevenue(p)) : employed && (p.injuryWeeks || 0) > 0 ? "$0" : "N/A";
  const weeklyPay = employed && p.trainingWeeks === 0 && p.weeksRemaining > 0 && (p.injuryWeeks || 0) <= 0 ? money(performerPay(p)) : employed && (p.injuryWeeks || 0) > 0 ? "$0" : money(askingRate);
  const history = (p.history || []).slice(-5).join("<br>") || "No training or contract history yet.";
  const trainDisabled = p.trainingWeeks || (p.injuryWeeks || 0) > 0 || p.weeksRemaining <= 4 || p.rank === "A" || !canPay(TRAINING_COST);
  const trainText = p.rank === "A" ? "Max Rank" : (p.injuryWeeks || 0) > 0 ? "Cannot train while injured" : canPay(TRAINING_COST) ? "Train - $5,000" : "Insufficient cash for training";
  const renewalButtons = employed && p.weeksRemaining === 1 && !p.renewalAttempted && !p.renewalDeclined
    ? RENEWAL_OFFERS.map(offer => `<button class="renewal-offer" data-bonus="${offer.bonus}" ${!canPay(offer.bonus) ? "disabled" : ""}>Offer ${money(offer.bonus)} signing bonus - ${Math.round(offer.chance * 100)}%</button>`).join("")
    : "";
  root.innerHTML = `<div class="profile-shell"><button id="profile-close" class="profile-close">Close</button><div class="profile-grid">${imageOrPlaceholder(ASSETS.performers[p.id], `${p.name} portrait`, p.name.toUpperCase(), "Portrait coming soon", "profile-art")}<div><p class="eyebrow">PERFORMER PROFILE</p><h2>${p.name}</h2><p class="muted">${p.concept}</p><dl class="profile-dl"><dt>Rank</dt><dd>${resetReturn ? "F" : p.rank}</dd><dt>Weekly pay</dt><dd>${weeklyPay}</dd><dt>Performer share</dt><dd>${Math.round(performerShare(resetReturn ? "F" : p.rank) * 100)}%</dd><dt>Weekly revenue</dt><dd>${weeklyRevenue}</dd><dt>Contract</dt><dd>${employed ? `${p.weeksRemaining} weeks` : marketFresh || resetReturn ? "Fresh 26 weeks" : "Former"}</dd><dt>Status</dt><dd>${statusText}</dd><dt>Training completed</dt><dd>${resetReturn ? 0 : p.trainingCompleted || 0}</dd><dt>Injury</dt><dd>${(p.injuryWeeks || 0) > 0 ? `${p.injuryWeeks} week${p.injuryWeeks === 1 ? "" : "s"} remaining` : "N/A"}</dd><dt>Last exit</dt><dd>${p.exitReason || "N/A"}</dd></dl><div class="profile-actions">${employed ? `<button id="profile-train" ${trainDisabled ? "disabled" : ""}>${trainText}</button>${renewalButtons}<button id="profile-fire" ${!canPay(fireFee) ? "disabled" : ""}>${canPay(fireFee) ? `Fire - ${money(fireFee)} fee` : "Insufficient cash to fire"}</button>` : `<button id="profile-hire" ${formerUnavailable || !hasCapacity() || !canPay(SIGNING_FEE) ? "disabled" : ""}>${formerUnavailable ? "Not currently available" : !hasCapacity() ? "Club at capacity" : !canPay(SIGNING_FEE) ? "Insufficient cash to hire" : `${marketFresh || resetReturn ? "Hire" : "Rehire"} - ${money(SIGNING_FEE)} fee`}</button>`}</div><p class="muted">${employed ? renewalStatus(p) : `${marketFresh || resetReturn ? "Available contract" : "Former performer"}. Hire creates a fresh 26-week contract once available.`}</p><h3>History</h3><p class="muted">${history}</p></div></div></div>`;
  document.querySelector("#profile-close").onclick = closeProfile;
  if (employed) {
    document.querySelector("#profile-train").onclick = () => train(p.id);
    document.querySelectorAll(".renewal-offer").forEach(button => {
      button.onclick = () => renew(p.id, Number(button.dataset.bonus));
    });
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
  return `<p class="muted">${mode === "last" ? `Closed Week ${data.week}.` : `Projected Week ${data.week} if you advance now. Random events are unknown until the button is pressed.`}</p><div class="ledger-row total"><span>Opening cash</span><strong>${money(data.openingCash)}</strong></div><h3>Performer Revenue</h3>${renderLedgerRows(data.performerRows, "No working performers generating revenue.")}<h3>Existing Club / Facility Revenue Effects</h3>${renderLedgerRows(data.facilityRows, "No facility revenue bonuses yet.")}<div class="ledger-row total"><span>Total club revenue before promotion</span><strong class="positive">${money(data.revenueBeforePromotions)}</strong></div><h3>Promotion Effects</h3>${renderLedgerRows(promoRows, "No promotions active.", true)}<div class="ledger-row"><span>Promotion revenue adjustment</span><strong class="${amountClass(data.promotionAdjustment)}">${signedMoney(data.promotionAdjustment)}</strong></div><div class="ledger-row total"><span>Final club revenue</span><strong class="positive">${money(data.totalRevenue)}</strong></div><h3>Random Events</h3>${renderLedgerRows(data.eventRows, "No random event affected this ledger.", true)}<h3>This Week Transactions</h3>${data.transactionRows.length ? data.transactionRows.map(t => `<div class="ledger-row"><span>${t.label}</span><strong class="negative">-${money(t.amount)}</strong></div>`).join("") : `<p class="muted empty">No one-time transactions this week.</p>`}<h3>Recurring Expenses</h3><div class="ledger-row"><span>Performer contracts</span><strong class="negative">-${money(expense.performers)}</strong></div><div class="ledger-row"><span>Property tax</span><strong class="negative">-${money(expense.tax)}</strong></div><div class="ledger-row"><span>Operations</span><strong class="negative">-${money(expense.operations)}</strong></div><div class="ledger-row"><span>Advertising</span><strong class="negative">-${money(expense.advertising)}</strong></div><div class="ledger-row"><span>Sheriff</span><strong class="${expense.sheriff === 0 ? "positive" : "negative"}">${expense.sheriff === 0 ? money(0) : `-${money(expense.sheriff)}`}</strong></div><div class="ledger-row total"><span>Final weekly net</span><strong class="${amountClass(data.finalNet)}">${signedMoney(data.finalNet)}</strong></div><div class="ledger-row total"><span>${mode === "last" ? "Ending cash" : "Projected cash after advancing week"}</span><strong class="${amountClass(data.endingCash)}">${money(data.endingCash)}</strong></div>`;
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
    const result = selected ? `<div class="promotion-result"><strong>${selected.name}</strong><span>Cost: ${money(selected.cost)}</span><span>Result: ${selected.resultPercent > 0 ? "+" : ""}${selected.resultPercent}%</span><span>Total revenue impact: ${signedMoney(promotionImpact(selected, revenueBase))}</span></div>` : `<p class="muted">One ${category.label} promotion may run this week.</p>`;
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
