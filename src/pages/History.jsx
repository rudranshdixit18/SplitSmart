import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGroup, getExpenses } from '../utils/store'
import { fmtMoney, downloadCSV, downloadPDF } from '../utils/helpers'
import ExpenseRow from '../components/ExpenseRow'

const FILTER_PERIODS = [
  { label: 'All', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
]

export default function History() {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [paidByFilter, setPaidByFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')

  useEffect(() => {
    const g = getGroup(id)
    setGroup(g)
    if (g) {
      setExpenses(getExpenses(id))
    }
  }, [id])

  const members = group?.members || []

  // filter logic
  const filtered = useMemo(() => {
    let result = [...expenses]

    // search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(e => e.desc.toLowerCase().includes(q))
    }

    // category
    if (catFilter !== 'all') {
      result = result.filter(e => e.category === catFilter)
    }

    // paid by
    if (paidByFilter !== 'all') {
      result = result.filter(e => e.paidBy === paidByFilter)
    }

    // period filter
    if (periodFilter !== 'all') {
      const now = new Date()
      let cutoff
      if (periodFilter === 'week') {
        cutoff = new Date(now)
        cutoff.setDate(cutoff.getDate() - 7)
      } else if (periodFilter === 'month') {
        cutoff = new Date(now.getFullYear(), now.getMonth(), 1)
      }
      if (cutoff) {
        result = result.filter(e => new Date(e.date) >= cutoff)
      }
    }

    // sort newest first
    result.sort((a, b) => new Date(b.date) - new Date(a.date))
    return result
  }, [expenses, search, catFilter, paidByFilter, periodFilter])

  // stats
  const totalSpent = filtered.reduce((sum, e) => sum + e.amount, 0)
  // TODO: calculate "your share" - need to know who the current user is
  // for now just show total / member count as rough estimate
  const avgPerPerson = members.length > 0 ? totalSpent / members.length : 0

  if (!group) return <div className="app-shell"><p>Loading...</p></div>

  return (
    <div>
      <Link to={`/group/${id}`} className="back-btn">← Back to {group.name}</Link>
      <h1 className="page-title">Expense History</h1>

      {/* stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-num">{fmtMoney(totalSpent)}</div>
          <div className="stat-label">Total Spent</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{fmtMoney(avgPerPerson)}</div>
          <div className="stat-label">Avg / Person</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{filtered.length}</div>
          <div className="stat-label">Expenses</div>
        </div>
      </div>

      {/* search */}
      <div className="search-input">
        <span className="search-icon">🔍</span>
        <input
          className="input"
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* filters */}
      <div className="filter-bar">
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="food">Food</option>
          <option value="travel">Travel</option>
          <option value="rent">Rent</option>
          <option value="utilities">Utilities</option>
          <option value="entertainment">Entertainment</option>
          <option value="shopping">Shopping</option>
          <option value="other">Other</option>
        </select>

        <select value={paidByFilter} onChange={e => setPaidByFilter(e.target.value)}>
          <option value="all">All Members</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* period tabs */}
      <div className="tab-bar">
        {FILTER_PERIODS.map(p => (
          <button
            key={p.value}
            className={`tab ${periodFilter === p.value ? 'active' : ''}`}
            onClick={() => setPeriodFilter(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* expense list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">🔎</span>
          <p>No expenses found</p>
          {search && <p>Try a different search term</p>}
        </div>
      ) : (
        filtered.map(exp => (
          <ExpenseRow key={exp.id} expense={exp} members={members} />
        ))
      )}

      {/* export */}
      {expenses.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => downloadCSV(expenses, members)}
          >
            📥 CSV
          </button>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => downloadPDF(expenses, members, group.name)}
          >
            📄 PDF
          </button>
        </div>
      )}
    </div>
  )
}
