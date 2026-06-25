import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, saveExpense } from '../../../utils/api'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Check } from 'lucide-react'

const CATEGORIES = ['food', 'travel', 'rent', 'utilities', 'entertainment', 'shopping', 'other']
const SPLIT_TYPES = ['equal', 'percentage', 'exact', 'shares']

export default function AddExpense() {
  const router = useRouter()
  const { id } = router.query

  const [group, setGroup] = useState(null)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [date, setDate] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitType, setSplitType] = useState('equal')
  const [splitAmong, setSplitAmong] = useState([])
  const [splitValues, setSplitValues] = useState({})
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurFreq, setRecurFreq] = useState('monthly')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    setDate(new Date().toISOString().split('T')[0])
    
    getGroup(id).then(g => {
      if (!g) {
        router.push('/')
        return
      }
      setGroup(g)
      setPaidBy(g.members[0]?.id || '')
      const allIds = g.members.map(m => m.id)
      setSplitAmong(allIds)
      const vals = {}
      g.members.forEach(m => { vals[m.id] = '' })
      setSplitValues(vals)
    })
  }, [id])

  if (!group) return null
  const members = group.members

  function toggleMember(memberId) {
    if (splitAmong.includes(memberId)) {
      setSplitAmong(splitAmong.filter(x => x !== memberId))
    } else {
      setSplitAmong([...splitAmong, memberId])
    }
  }

  function handleSplitValueChange(memberId, val) {
    setSplitValues({ ...splitValues, [memberId]: val })
  }

  function computeSplits() {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return null

    const splits = {}
    const involved = splitAmong

    if (involved.length === 0) return null

    if (splitType === 'equal') {
      const share = Math.round((amt / involved.length) * 100) / 100
      let total = 0
      involved.forEach((memberId, i) => {
        if (i === involved.length - 1) {
          splits[memberId] = Math.round((amt - total) * 100) / 100
        } else {
          splits[memberId] = share
          total += share
        }
      })
    } else if (splitType === 'percentage') {
      let totalPct = 0
      involved.forEach(memberId => {
        const pct = parseFloat(splitValues[memberId]) || 0
        totalPct += pct
        splits[memberId] = Math.round((amt * pct / 100) * 100) / 100
      })
      if (Math.abs(totalPct - 100) > 0.01) return 'percentages'
    } else if (splitType === 'exact') {
      let totalExact = 0
      involved.forEach(memberId => {
        const val = parseFloat(splitValues[memberId]) || 0
        splits[memberId] = val
        totalExact += val
      })
      if (Math.abs(totalExact - amt) > 0.01) return 'exact'
    } else if (splitType === 'shares') {
      let totalShares = 0
      involved.forEach(memberId => {
        totalShares += parseFloat(splitValues[memberId]) || 0
      })
      if (totalShares === 0) return 'shares'
      involved.forEach(memberId => {
        const memberShares = parseFloat(splitValues[memberId]) || 0
        splits[memberId] = Math.round((amt * memberShares / totalShares) * 100) / 100
      })
    }

    return splits
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setError('')

    if (!desc.trim()) {
      setError('Add a description')
      return
    }

    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      setError('Enter a valid amount')
      return
    }

    if (splitAmong.length === 0) {
      setError('Select at least one person to split with')
      return
    }

    const splits = computeSplits()
    if (splits === 'percentages') {
      setError('Percentages must add up to 100%')
      return
    }
    if (splits === 'exact') {
      setError(`Amounts must add up to ₹${amt}`)
      return
    }
    if (splits === 'shares') {
      setError('Enter at least one share value')
      return
    }
    if (!splits) {
      setError('Something went wrong with the split calculation')
      return
    }

    setLoading(true)

    const splitDetails = splits;

    const expense = {
      id: `e_${Date.now()}`,
      groupId: id,
      desc: desc.trim(),
      amount: amt,
      category,
      paidBy,
      splitType,
      splitAmong,
      splitDetails,
      date: new Date(date).toISOString(),
      isRecurring,
      recurFreq: isRecurring ? recurFreq : null
    }

    await saveExpense(expense)
    router.push(`/group/${id}`)
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-float pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0 }}
        className="p-6 max-w-lg mx-auto pb-12 relative z-10"
      >
        <Link href={`/group/${id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold hover:bg-white/10 transition-colors mb-6 uppercase tracking-widest">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-8">Add Expense</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="card p-6 space-y-5">
            <div>
              <label className="input-label">Description</label>
              <input
                className="input"
                type="text"
                placeholder="Dinner, Uber, Groceries..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Amount (₹)</label>
              <input
                className="input text-3xl font-display font-bold text-primary py-6"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="input-label">Category</label>
                <select 
                  className="input"
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="input-label">Date</label>
                <input
                  className="input"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Paid By</label>
              <select 
                className="input"
                value={paidBy} 
                onChange={e => setPaidBy(e.target.value)}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <div>
              <label className="input-label">Split Type</label>
              <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 relative">
                {SPLIT_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl capitalize relative z-10 transition-colors ${splitType === t ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    onClick={() => setSplitType(t)}
                  >
                    {splitType === t && (
                      <motion.div
                        layoutId="activeSplitTab"
                        className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl shadow-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label mb-3">Split Among</label>
              <div className="flex flex-col gap-2">
                {members.map(m => (
                  <div 
                    key={m.id} 
                    className={`flex items-center gap-3 border p-3 rounded-2xl cursor-pointer transition-all ${splitAmong.includes(m.id) ? 'bg-primary/5 border-primary/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`} 
                    onClick={() => toggleMember(m.id)}
                  >
                    <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                      <input
                        type="checkbox"
                        className="w-6 h-6 rounded-md border-2 border-primary/50 appearance-none checked:bg-primary checked:border-transparent transition-colors cursor-pointer"
                        checked={splitAmong.includes(m.id)}
                        onChange={() => {}}
                        readOnly
                      />
                      {splitAmong.includes(m.id) && (
                        <Check size={14} className="absolute text-white pointer-events-none" strokeWidth={3} />
                      )}
                    </div>
                    <span className={`text-[15px] font-bold transition-colors ${splitAmong.includes(m.id) ? 'text-white' : 'text-white/50'}`}>{m.name}</span>

                    {splitType !== 'equal' && splitAmong.includes(m.id) && (
                      <input
                        className="ml-auto w-[100px] bg-black/40 border border-white/10 text-white rounded-xl p-2 text-sm font-bold focus:outline-none focus:border-primary text-right"
                        type="number"
                        placeholder={splitType === 'percentage' ? '%' : splitType === 'shares' ? 'shares' : '₹'}
                        value={splitValues[m.id] || ''}
                        onChange={e => handleSplitValueChange(m.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        min="0"
                        step="0.01"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div 
              className={`flex items-center gap-3 border p-4 rounded-2xl cursor-pointer transition-all mt-4 ${isRecurring ? 'bg-primary/5 border-primary/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`} 
              onClick={() => setIsRecurring(!isRecurring)}
            >
              <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-md border-2 border-primary/50 appearance-none checked:bg-primary checked:border-transparent transition-colors cursor-pointer"
                  checked={isRecurring} 
                  readOnly 
                />
                {isRecurring && (
                  <Check size={14} className="absolute text-white pointer-events-none" strokeWidth={3} />
                )}
              </div>
              <span className={`text-[15px] font-bold transition-colors ${isRecurring ? 'text-white' : 'text-white/50'}`}>Recurring expense</span>
            </div>
            
            {isRecurring && (
              <select 
                className="input mt-1"
                value={recurFreq} 
                onChange={e => setRecurFreq(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-sm font-bold bg-danger/10 border border-danger/20 p-3 rounded-xl flex items-center gap-2 justify-center">
              {error}
            </motion.p>
          )}

          <button 
            type="submit" 
            className={`w-full btn btn-primary py-4 mt-2 text-[15px] font-bold shadow-[0_0_40px_rgba(255,79,0,0.3)] hover:shadow-[0_0_60px_rgba(255,79,0,0.5)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Saving...' : <><Save size={20} /> Record Expense</>}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
