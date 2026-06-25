import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, getExpenses } from '../../../utils/api'
import { fmtMoney, downloadCSV, downloadPDF } from '../../../utils/helpers'
import ExpenseRow from '../../../components/ExpenseRow'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Download, FileText, SearchX, Clock } from 'lucide-react'

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

  if (loading) return <div className="p-4 max-w-lg mx-auto"><p className="text-white/40 text-center mt-8 animate-pulse font-bold tracking-widest uppercase">Loading history...</p></div>
  if (!group) return <div className="p-4 max-w-lg mx-auto"><p className="text-white/40">Workspace not found.</p></div>

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-float pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0 }}
        className="p-6 max-w-lg mx-auto pb-24 relative z-10"
      >
        <Link href={`/group/${id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold hover:bg-white/10 transition-colors mb-6 uppercase tracking-widest">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-8">Expense History</h1>

        <div className="flex gap-3 mb-8">
          <div className="flex-1 card p-4 flex flex-col justify-center items-center">
            <div className="font-display font-bold text-xl text-white mb-1">{fmtMoney(totalSpent)}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Total Spent</div>
          </div>
          <div className="flex-1 card p-4 flex flex-col justify-center items-center">
            <div className="font-display font-bold text-xl text-white mb-1">{fmtMoney(avgPerPerson)}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Avg / Person</div>
          </div>
          <div className="flex-1 card p-4 flex flex-col justify-center items-center">
            <div className="font-display font-bold text-xl text-white mb-1">{filtered.length}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Expenses</div>
          </div>
        </div>


        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            <Search size={18} />
          </div>
          <input
            className="input pl-12 bg-white/5 border-white/10 hover:border-white/20 focus:border-white/30 text-white placeholder:text-white/30"
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>


        <div className="flex gap-3 mb-5">
          <select 
            className="input !py-3 !text-sm flex-1 bg-white/5 border-white/10"
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
            className="input !py-3 !text-sm flex-1 bg-white/5 border-white/10"
            value={paidByFilter} 
            onChange={e => setPaidByFilter(e.target.value)}
          >
            <option value="all">All Members</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>


        <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 relative mb-8">
          {FILTER_PERIODS.map(p => (
            <button
              key={p.value}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl capitalize relative z-10 transition-colors ${periodFilter === p.value ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              onClick={() => setPeriodFilter(p.value)}
            >
              {periodFilter === p.value && (
                <motion.div
                  layoutId="activePeriodTab"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl shadow-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {p.label}
            </button>
          ))}
        </div>


        {filtered.length === 0 ? (
          <div className="empty-state mt-4">
            <div className="empty-icon bg-white/5 text-white/30 mb-4">
              <SearchX size={48} strokeWidth={1.5} />
            </div>
            <p className="text-white font-bold text-lg mb-1">No expenses found</p>
            {search && <p className="text-white/40 text-sm font-medium">Try a different search term</p>}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filtered.map(exp => (
              <ExpenseRow key={exp.id} expense={exp} members={members} />
            ))}
          </motion.div>
        )}


        {parsedExpenses.length > 0 && (
          <div className="flex gap-3 mt-8">
            <button
              className="flex-1 btn bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all"
              onClick={() => downloadCSV(parsedExpenses, members)}
            >
              <Download size={18} /> Download CSV
            </button>
            <button
              className="flex-1 btn bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all"
              onClick={() => downloadPDF(parsedExpenses, members, group.name)}
            >
              <FileText size={18} /> Export PDF
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
