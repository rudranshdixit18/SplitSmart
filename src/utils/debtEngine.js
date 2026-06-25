
export function calcBalances(expenses, settlements, members) {
  // init everyone to 0
  const bal = {}
  members.forEach(m => { bal[m.id] = 0 })


  for (const exp of expenses) {
    // payer is owed the total split amount
    const splits = exp.splits || {}
    const splitEntries = Object.entries(splits)

    for (const [memberId, amt] of splitEntries) {
      bal[memberId] = (bal[memberId] || 0) - amt  // they owe this much
    }
    // payer gets credited the total they paid out in splits
    const totalSplit = splitEntries.reduce((sum, [, a]) => sum + a, 0)
    bal[exp.paidBy] = (bal[exp.paidBy] || 0) + totalSplit
  }


  for (const s of settlements) {
    if (s.status !== 'settled') continue
    bal[s.from] = (bal[s.from] || 0) + s.amount   // from paid, so gets credit
    bal[s.to] = (bal[s.to] || 0) - s.amount        // to received, so owes less credit
  }

  return bal
}

export function simplifyDebts(balanceMap) {

  const creds = [] // ppl who are owed money (positive balance)
  const debts = [] // ppl who owe money (negative balance)

  for (const [id, bal] of Object.entries(balanceMap)) {
    // round to avoid floating point nonsense
    const rounded = Math.round(bal * 100) / 100
    if (rounded > 0) creds.push({ id, amt: rounded })
    else if (rounded < 0) debts.push({ id, amt: Math.abs(rounded) })
  }


  creds.sort((a, b) => b.amt - a.amt)
  debts.sort((a, b) => b.amt - a.amt)

  const txns = []
  let i = 0, j = 0

  while (i < debts.length && j < creds.length) {
    const settleAmt = Math.min(debts[i].amt, creds[j].amt)
    // round again just in case
    const amt = Math.round(settleAmt * 100) / 100

    if (amt > 0) {
      txns.push({
        from: debts[i].id,
        to: creds[j].id,
        amount: amt,
      })
    }

    debts[i].amt -= amt
    creds[j].amt -= amt


    if (debts[i].amt < 0.01) i++
    if (creds[j].amt < 0.01) j++
  }

  return txns
}
