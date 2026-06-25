import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, getExpenses } from '../../../utils/api'
import { fmtMoney, downloadCSV, downloadPDF } from '../../../utils/helpers'
import ExpenseRow from '../../../components/ExpenseRow'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Download, FileText, SearchX } from 'lucide-react'

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

  const parsedExpenses = useMemo(() => expenses.map(e => ({
    ...e,
    splitDetails: typeof e.split_details === 'string' ? JSON.parse(e.split_details || '{}') : (e.split_details || {})
  })), [expenses])

  const filtered = useMemo(() => {
    let result = [...parsedExpenses]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(e => e.desc.toLowerCase().includes(q))
    }

    if (catFilter !== 'all') {
      result = result.filter(e => e.category === catFilter)
    }

    if (paidByFilter !== 'all') {
      result = result.filter(e => e.paidBy === paidByFilter)
    }

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

    result.sort((a, b) => new Date(b.date) - new Date(a.date))
    return result
  }, [parsedExpenses, search, catFilter, paidByFilter, periodFilter])

  const totalSpent = filtered.reduce((sum, e) => sum + e.amount, 0)
  const avgPerPerson = members.length > 0 ? totalSpent / members.length : 0

  if (loading) return <div className="p-4 max-w-lg mx-auto"><p className="text-text-muted text-center mt-8 animate-pulse">Loading history...</p></div>
  if (!group) return <div className="p-4 max-w-lg mx-auto"><p className="text-text-muted">Workspace not found.</p></div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="p-4 max-w-lg mx-auto pb-12"
    >
      <Link href={`/group/${id}`} className="inline-flex items-center gap-1.5 text-text-muted hover:text-text mb-6 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to {group.name}
      </Link>
      <h1 className="text-2xl font-extrabold mb-6 text-text">Expense History</h1>


      <div className="flex gap-2 mb-6">
        <div className="flex-1 bg-card border border-glass-border p-3 rounded-xl text-center shadow-sm">
          <div className="font-bold text-lg text-text mb-0.5">{fmtMoney(totalSpent)}</div>
          <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Total Spent</div>
        </div>
        <div className="flex-1 bg-card border border-glass-border p-3 rounded-xl text-center shadow-sm">
          <div className="font-bold text-lg text-text mb-0.5">{fmtMoney(avgPerPerson)}</div>
          <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Avg / Person</div>
        </div>
        <div className="flex-1 bg-card border border-glass-border p-3 rounded-xl text-center shadow-sm">
          <div className="font-bold text-lg text-text mb-0.5">{filtered.length}</div>
          <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Expenses</div>
        </div>
      </div>


      <div className="relative mb-3">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
          <Search size={18} />
        </div>
        <input
          className="input pl-11"
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>


      <div className="flex gap-2 mb-4">
        <select 
          className="input !py-2.5 !text-sm"
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
          className="input !py-2.5 !text-sm"
          value={paidByFilter} 
          onChange={e => setPaidByFilter(e.target.value)}
        >
          <option value="all">All Members</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>


      <div className="flex bg-card p-1 rounded-xl mb-6 border border-glass-border relative">
        {FILTER_PERIODS.map(p => (
          <button
            key={p.value}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize relative z-10 transition-colors ${periodFilter === p.value ? 'text-white' : 'text-text-muted hover:text-text'}`}
            onClick={() => setPeriodFilter(p.value)}
          >
            {periodFilter === p.value && (
              <motion.div
                layoutId="activePeriodTab"
                className="absolute inset-0 bg-primary rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {p.label}
          </button>
        ))}
      </div>


      {filtered.length === 0 ? (
        <div className="empty-state mt-4">
          <div className="empty-icon">
            <SearchX size={48} strokeWidth={1.5} />
          </div>
          <p className="text-text font-medium text-lg">No expenses found</p>
          {search && <p className="text-text-muted text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {filtered.map(exp => (
            <ExpenseRow key={exp.id} expense={exp} members={members} />
          ))}
        </motion.div>
      )}


      {parsedExpenses.length > 0 && (
        <div className="flex gap-2 mt-6">
          <button
            className="flex-1 btn btn-outline flex items-center justify-center gap-2"
            onClick={() => downloadCSV(parsedExpenses, members)}
          >
            <Download size={16} /> CSV
          </button>
          <button
            className="flex-1 btn btn-outline flex items-center justify-center gap-2"
            onClick={() => downloadPDF(parsedExpenses, members, group.name)}
          >
            <FileText size={16} /> PDF
          </button>
        </div>
      )}
    </motion.div>
  )
}
