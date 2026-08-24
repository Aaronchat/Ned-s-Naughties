// Performer contracts, hiring, renewals, firing, and return-to-market rules.
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
    renewalAttempted: false,
    renewalDeclined: false,
    renewalWarningShown: false,
    rehireOffer: null,
    ...overrides,
  };
}

function absenceWeeks() {
  return Math.floor(Math.random() * 5) + 2;
}

function moveFormer(p, reason, overrides = {}) {
  const previousRate = performerPay(p);
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
    renewalAttempted: false,
    renewalDeclined: false,
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
  if (item.kind === "fresh" || item.kind === "fresh-return" || item.performer.resetOnReturn) return performerBasePay({ rank: "F" });
  return performerBasePay(item.performer);
}

function renewalStatus(p) {
  if (p.renewalDeclined) return "Offer rejected. She will leave when this contract expires.";
  if (p.renewalAttempted) return "Renewal offer already used for this contract.";
  if (p.weeksRemaining === 1) return "Renewal window open. Choose one signing bonus.";
  return `Renewal locked until 1 week remains. Current contract: ${p.weeksRemaining} weeks.`;
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
  state.performers.push(contractFor(base, { weeklyCost, weeksRemaining: 26, trainingWeeks: 0, injuryWeeks: 0, renewalOffer: null, renewalAttempted: false, renewalDeclined: false, renewalWarningShown: false, rehireOffer: null, returnWeeks: 0, exitReason: null, resetOnReturn: false, history: freshReturn ? [] : base.history || [] }));
  state.formerPerformers = state.formerPerformers.filter(p => p.id !== id);
  state.selectedPerformerId = id;
  state.selectedSource = "active";
  state.profileOpen = true;
  addHistory(`${base.name} signed a fresh 26-week contract. Signing fee: ${money(SIGNING_FEE)}.`);
  commit(`${base.name} signed a fresh 26-week contract. Signing fee paid: ${money(SIGNING_FEE)}.`);
}

function renew(id, bonus) {
  const p = state.performers.find(x => x.id === id);
  if (!p || p.weeksRemaining <= 0) return;
  const offer = RENEWAL_OFFERS.find(o => o.bonus === bonus);
  if (!offer) return;
  if (p.weeksRemaining !== 1) {
    setMessage(`${p.name}'s renewal is locked until exactly 1 week remains.`);
    render();
    return;
  }
  if (p.renewalAttempted || p.renewalDeclined) {
    setMessage(`${p.name} already received her one renewal offer for this contract.`);
    render();
    return;
  }
  if (!requireCash(offer.bonus, "renewal signing bonus")) return;
  p.renewalAttempted = true;
  const accepted = Math.random() < offer.chance;
  if (!accepted) {
    p.renewalDeclined = true;
    addHistory(`${p.name} rejected a ${money(offer.bonus)} renewal offer and will leave when her contract expires.`);
    commit(`${p.name} rejected the ${money(offer.bonus)} renewal offer. No signing bonus was paid.`);
    return;
  }
  state.cash -= offer.bonus;
  recordTransaction(`${p.name} Renewal Signing Bonus`, offer.bonus);
  p.weeksRemaining = 26;
  p.renewalAttempted = false;
  p.renewalDeclined = false;
  p.renewalWarningShown = false;
  p.renewalOffer = null;
  addHistory(`${p.name} accepted a ${money(offer.bonus)} renewal bonus and signed a fresh 26-week contract.`);
  commit(`${p.name} accepted the ${money(offer.bonus)} renewal offer. Fresh 26-week contract signed.`);
}

function firePerformer(id) {
  const p = state.performers.find(x => x.id === id);
  if (!p) return;
  const fee = Math.round(performerPay(p) * p.weeksRemaining * 0.5);
  if (!requireCash(fee, "contract termination")) return;
  if (!confirm(`Terminate ${p.name}'s contract for ${money(fee)}?`)) return;
  state.cash -= fee;
  recordTransaction(`${p.name} Contract Cancellation`, fee);
  addHistory(`${p.name} was fired. Cancellation fee: ${money(fee)}.`);
  moveFormer(p, "fired");
  commit(`${p.name}'s contract was terminated. Cancellation fee paid: ${money(fee)}.`);
}
