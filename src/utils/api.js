const API_URL = 'http://localhost:8000';

async function _fetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('API Error:', err);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Network Error:', error);
    return null;
  }
}


export async function getGroups() {
  return await _fetch('/groups') || [];
}

export async function getGroup(id) {
  return await _fetch(`/groups/${id}`);
}

export async function saveGroup(group) {
  const existing = await getGroup(group.id);
  if (!existing) {
    await _fetch('/groups', {
      method: 'POST',
      body: JSON.stringify({ id: group.id, name: group.name, code: group.code })
    });
  }
  // save members if present (simplistic sync for hackathon)
  if (group.members) {
    for (const m of group.members) {
      await _fetch(`/groups/${group.id}/members`, {
        method: 'POST',
        body: JSON.stringify(m)
      });
    }
  }
  return group;
}

export async function removeGroup(id) {
  // Not implemented in backend yet, ignore for now to save time
  console.log("Delete group not supported yet");
}

export async function addMemberToGroup(groupId, member) {
  return await _fetch(`/groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify(member)
  });
}


export async function getExpenses(groupId) {
  if (!groupId) return [];
  return await _fetch(`/groups/${groupId}/expenses`) || [];
}

export async function saveExpense(expense) {
  // split_details is an object, but backend expects json string
  const payload = {
    ...expense,
    split_details: JSON.stringify(expense.splitDetails || {})
  };
  return await _fetch(`/groups/${expense.groupId}/expenses`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function removeExpense(id) {
  console.log("Delete expense not supported yet");
}


export async function getSettlements(groupId) {
  if (!groupId) return [];
  return await _fetch(`/groups/${groupId}/settlements`) || [];
}

export async function saveSettlement(s) {
  return await _fetch(`/groups/${s.groupId}/settlements`, {
    method: 'POST',
    body: JSON.stringify({
      id: s.id,
      from_member: s.from,
      to_member: s.to,
      amount: s.amount
    })
  });
}

export async function updateSettlement(id, updates) {
  console.log("Update settlement not supported yet");
}
