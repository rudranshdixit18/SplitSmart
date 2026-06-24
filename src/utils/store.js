// localStorage wrapper for splitsmart data

const KEYS = {
  groups: 'ss_groups',
  expenses: 'ss_expenses',
  settlements: 'ss_settlements',
}

function _read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}

function _write(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// --- Groups ---

export function getGroups() {
  return _read(KEYS.groups)
}

export function getGroup(id) {
  return getGroups().find(g => g.id === id) || null
}

export function saveGroup(group) {
  const all = getGroups()
  const idx = all.findIndex(g => g.id === group.id)
  if (idx >= 0) all[idx] = group
  else all.push(group)
  _write(KEYS.groups, all)
}

export function removeGroup(id) {
  const filtered = getGroups().filter(g => g.id !== id)
  _write(KEYS.groups, filtered)
}

// --- Expenses ---

export function getExpenses(groupId) {
  const all = _read(KEYS.expenses)
  return groupId ? all.filter(e => e.groupId === groupId) : all
}

export function getAllExpenses() {
  return _read(KEYS.expenses)
}

export function saveExpense(expense) {
  const all = _read(KEYS.expenses)
  const idx = all.findIndex(e => e.id === expense.id)
  if (idx >= 0) all[idx] = expense
  else all.push(expense)
  _write(KEYS.expenses, all)
}

export function removeExpense(id) {
  const filtered = _read(KEYS.expenses).filter(e => e.id !== id)
  _write(KEYS.expenses, filtered)
}

// --- Settlements ---

export function getSettlements(groupId) {
  const all = _read(KEYS.settlements)
  return groupId ? all.filter(s => s.groupId === groupId) : all
}

export function saveSettlement(s) {
  const all = _read(KEYS.settlements)
  const idx = all.findIndex(x => x.id === s.id)
  if (idx >= 0) all[idx] = s
  else all.push(s)
  _write(KEYS.settlements, all)
}

export function updateSettlement(id, updates) {
  const all = _read(KEYS.settlements)
  const idx = all.findIndex(s => s.id === id)
  if (idx === -1) return
  all[idx] = { ...all[idx], ...updates }
  _write(KEYS.settlements, all)
}
