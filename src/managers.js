// Property-scoped manager selection, salary strategy, and automatic renewals.
function propertyManagerById(id) {
  return PROPERTY_MANAGERS.find(manager => manager.id === id);
}

function managersForProperty(propertyId = PROPERTY_IDS.BELTON) {
  return PROPERTY_MANAGERS.filter(manager => manager.propertyId === propertyId);
}

function migratePropertyManagers(raw) {
  const migrated = { [PROPERTY_IDS.BELTON]: "ted" };
  if (!raw || typeof raw !== "object") return migrated;
  Object.entries(raw).forEach(([propertyId, managerId]) => {
    const manager = propertyManagerById(managerId);
    if (manager && manager.propertyId === propertyId) migrated[propertyId] = manager.id;
  });
  return migrated;
}

function activePropertyManager(propertyId = PROPERTY_IDS.BELTON) {
  const managerId = state.propertyManagers[propertyId];
  const manager = propertyManagerById(managerId);
  return manager && manager.propertyId === propertyId ? manager : propertyManagerById("ted");
}

function managerRenewalOffer(manager) {
  return RENEWAL_OFFERS.find(offer => offer.bonus === manager.renewalBonus);
}

function managerUnlocked(manager, propertyId = PROPERTY_IDS.BELTON) {
  if (!manager || manager.propertyId !== propertyId) return false;
  return state.buildingLevel >= manager.requiredBuildingLevel;
}

function selectPropertyManager(managerId, propertyId = PROPERTY_IDS.BELTON) {
  const manager = propertyManagerById(managerId);
  if (!manager || !managerUnlocked(manager, propertyId)) return;
  const current = activePropertyManager(propertyId);
  if (current.id === manager.id) return;
  state.propertyManagers[propertyId] = manager.id;
  addHistory(`${manager.name} became Property Manager of Ned's Naughties. Salary: ${manager.salary ? `${money(manager.salary)}/week` : "Free"}.`);
  commit(`${manager.name} is now managing Ned's Naughties.`);
}

function attemptManagerRenewals(propertyId = PROPERTY_IDS.BELTON) {
  const manager = activePropertyManager(propertyId);
  const offer = managerRenewalOffer(manager);
  const notices = [];
  state.performers
    .filter(p => p.weeksRemaining === 1 && !p.renewalAttempted && !p.renewalDeclined)
    .forEach(p => {
      if (!canPay(offer.bonus)) {
        const message = `${manager.name} could not offer ${p.name} the ${money(offer.bonus)} renewal bonus because the club does not have enough cash.`;
        notices.push(message);
        addHistory(message);
        return;
      }
      const result = attemptRenewal(p, offer, {
        offeredBy: manager.name,
        transactionLabel: `${p.name} Renewal — ${manager.name}`,
      });
      notices.push(result.message);
    });
  return notices;
}
