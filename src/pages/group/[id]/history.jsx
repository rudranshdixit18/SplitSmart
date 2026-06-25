import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, getExpenses } from '../../../utils/api'
import { fmtMoney, downloadCSV, downloadPDF } from '../../../utils/helpers'
import ExpenseRow from '../../../components/ExpenseRow'

const FILTER_PERIODS = [
  { label: 'All', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
]

export default function History() {
  const router = useRouter()
  const { id } = router.query
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [paidByFilter, setPaidByFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const loadData = async () => {
      const g = await getGroup(id)
      setGroup(g)
      if (g) {
        const exps = await getExpenses(id)
        setExpenses(exps)
      }
      setLoading(false)
    }
    loadData()
  }, [id])

  const members = group?.members || []

  // ensure split_details is parsed if it comes from backend as a string
  const parsedExpenses = useMemo(() => expenses.map(e => ({
    ...e,
    splitDetails: typeof e.split_details === 'string' ? JSON.parse(e.split_details || '{}') : (e.split_details || {})
  })), [expenses])

  // filter logic
  const filtered = useMemo(() => {
    let result = [...parsedExpenses]

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
  }, [parsedExpenses, search, catFilter, paidByFilter, periodFilter])

  // stats
  const totalSpent = filtered.reduce((sum, e) => sum + e.amount, 0)
  // TODO: calculate "your share" - need to know who the current user is
  // for now just show total / member count as rough estimate
  const avgPerPerson = members.length > 0 ? totalSpent / members.length : 0

  if (loading) return <div className="p-4 max-w-lg mx-auto"><p className="text-text-muted text-center mt-8">Loading history...</p></div>
  if (!group) return <div className="p-4 max-w-lg mx-auto"><p className="text-text-muted">Group not found.</p></div>

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Link href={`/group/${id}`} className="inline-block text-text-muted hover:text-text mb-4 text-sm font-medium">← Back to {group.name}</Link>
      <h1 className="text-2xl font-bold mb-6 text-text">Expense History</h1>

      {/* stats */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 bg-card border border-border p-3 rounded-xl text-center">
          <div className="font-bold text-lg text-text mb-0.5">{fmtMoney(totalSpent)}</div>
          <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Total Spent</div>
        </div>
        <div className="flex-1 bg-card border border-border p-3 rounded-xl text-center">
          <div className="font-bold text-lg text-text mb-0.5">{fmtMoney(avgPerPerson)}</div>
          <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Avg / Person</div>
        </div>
        <div className="flex-1 bg-card border border-border p-3 rounded-xl text-center">
          <div className="font-bold text-lg text-text mb-0.5">{filtered.length}</div>
          <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Expenses</div>
        </div>
      </div>

      {/* search */}
      <div className="relative mb-3">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        <input
          className="w-full bg-card border border-border text-text rounded-xl py-3 pr-3 pl-11 focus:outline-none focus:border-primary placeholder:text-text-muted"
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* filters */}
      <div className="flex gap-2 mb-4">
        <select 
          className="flex-1 bg-card border border-border text-text rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
          value={catFilter} 
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="food">Food</option>
          <option value="travel">Travel</option>
          <option value="rent">Rent</option>
          <option value="utilities">Utilities</option>
          <option value="entertainment">Entertainment</option>
          <option value="shopping">Shopping</option>
          <option value="other">Other</option>
        </select>

        <select 
          className="flex-1 bg-card border border-border text-text rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
          value={paidByFilter} 
          onChange={e => setPaidByFilter(e.target.value)}
        >
          <option value="all">All Members</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* period tabs */}
      <div className="flex bg-[#2d2d44] p-1 rounded-xl mb-6">
        {FILTER_PERIODS.map(p => (
          <button
            key={p.value}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${periodFilter === p.value ? 'bg-[#6c5ce7] text-white shadow' : 'text-text-muted hover:text-text'}`}
            onClick={() => setPeriodFilter(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* expense list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-2xl border border-border">
          <span className="text-5xl mb-4">🔎</span>
          <p className="text-text font-medium">No expenses found</p>
          {search && <p className="text-text-muted text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(exp => (
            <ExpenseRow key={exp.id} expense={exp} members={members} />
          ))}
        </div>
      )}

      {/* export */}
      {parsedExpenses.length > 0 && (
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 bg-transparent border border-border text-text py-2.5 rounded-xl text-sm font-semibold hover:bg-card-hover transition-colors"
            onClick={() => downloadCSV(parsedExpenses, members)}
          >
            📥 CSV
          </button>
          <button
            className="flex-1 bg-transparent border border-border text-text py-2.5 rounded-xl text-sm font-semibold hover:bg-card-hover transition-colors"
            onClick={() => downloadPDF(parsedExpenses, members, group.name)}
          >
            📄 PDF
          </button>
        </div>
      )}
    </div>
  )
}
