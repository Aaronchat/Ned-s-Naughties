// Facility and building upgrade rules.
function facilityUpgradeCost(level) {
  return 1000 * Math.pow(2, level - 1);
}

function buildingUpgradeCost(level) {
  return 2000 * Math.pow(2, level - 1);
}

function canUpgradeBuilding() {
  if (state.buildingLevel >= 5 || state.pendingBuildingLevel) return false;
  return Object.values(state.facilities).every(level => level > state.buildingLevel);
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
