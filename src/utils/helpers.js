
export function genId() {
  return 'x' + Math.random().toString(36).substr(2, 9)
}

export function genInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function fmtDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function fmtMoney(n) {
  if (n == null || isNaN(n)) return '₹0'
  return '₹' + Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function makeUpiLink({ upiId, name, amount, note }) {
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name || '')}&am=${amount}&cu=INR&tn=${encodeURIComponent(note || '')}`
}

export function downloadCSV(expenses, members) {
  const memberMap = {}
  members.forEach(m => { memberMap[m.id] = m.name })

  const header = 'Date,Description,Amount,Paid By,Category,Split Type'
  const rows = expenses.map(exp => {
    const date = fmtDate(exp.date)
    const desc = `"${(exp.desc || '').replace(/"/g, '""')}"`
    const paidBy = memberMap[exp.paidBy] || exp.paidBy
    return `${date},${desc},${exp.amount},${paidBy},${exp.category || ''},${exp.splitType || 'equal'}`
  })

  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'splitsmart_expenses.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadPDF(expenses, members, groupName) {
  const memberMap = {}
  members.forEach(m => { memberMap[m.id] = m.name })

  let rows = ''
  let total = 0
  expenses.forEach(exp => {
    total += exp.amount
    rows += `<tr>
      <td>${fmtDate(exp.date)}</td>
      <td>${exp.desc || ''}</td>
      <td style="text-align:right">${fmtMoney(exp.amount)}</td>
      <td>${memberMap[exp.paidBy] || ''}</td>
      <td>${exp.category || ''}</td>
    </tr>`
  })

  const html = `
    <html><head><title>SplitSmart - ${groupName || 'Expenses'}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
      h2 { margin-bottom: 4px; }
      .sub { color: #666; font-size: 13px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: left; }
      th { background: #f5f5f5; font-weight: 600; }
      .total { font-weight: 700; font-size: 14px; margin-top: 12px; }
    </style></head><body>
      <h2>SplitSmart - ${groupName || 'Group'}</h2>
      <div class="sub">Exported on ${new Date().toLocaleDateString('en-IN')}</div>
      <table>
        <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Paid By</th><th>Category</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">Total: ${fmtMoney(total)}</div>
    </body></html>
  `

  const w = window.open('', '_blank', 'width=800,height=600')
  if (w) {
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }
}
