import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, saveExpense } from '../../../utils/store'
import { genId } from '../../../utils/helpers'

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
  const [splitAmong, setSplitAmong] = useState([]) // member ids who are part of split
  const [splitValues, setSplitValues] = useState({}) // memberId -> value (%, amount, or shares)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurFreq, setRecurFreq] = useState('monthly')
  const [error, setError] = useState('')

  useEffect(() => {
    // only run once we have the ID (next router query can be empty on first render)
    if (!id) return

    setDate(new Date().toISOString().split('T')[0])
    
    const g = getGroup(id)
    if (!g) {
      router.push('/')
      return
    }
    setGroup(g)
    setPaidBy(g.members[0]?.id || '')
    // default: everyone is in the split
    const allIds = g.members.map(m => m.id)
    setSplitAmong(allIds)
    // init split values
    const vals = {}
    g.members.forEach(m => { vals[m.id] = '' })
    setSplitValues(vals)
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
      // handle rounding - give the remainder to first person
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

  function handleSubmit(ev) {
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

    const expense = {
      id: genId(),
      groupId: id,
      desc: desc.trim(),
      amount: amt,
      category,
      paidBy,
      splitType,
      splitAmong,
      splits,
      date: new Date(date).toISOString(),
      isRecurring,
      recurFreq: isRecurring ? recurFreq : null
    }

    saveExpense(expense)
    // console.log('saved expense:', expense)
    router.push(`/group/${id}`)
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Link href={`/group/${id}`} className="inline-block text-text-muted hover:text-text mb-4 text-sm font-medium">← Back</Link>
      <h1 className="text-2xl font-bold mb-6 text-text">Add Expense</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Description</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary"
            type="text"
            placeholder="Dinner, Uber, Groceries..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Amount (₹)</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary text-xl font-bold"
            type="number"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Category</label>
            <select 
              className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary"
              value={category} 
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Date</label>
            <input
              className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Paid By</label>
          <select 
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary"
            value={paidBy} 
            onChange={e => setPaidBy(e.target.value)}
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* split type selector */}
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Split Type</label>
          <div className="flex bg-[#2d2d44] p-1 rounded-xl mb-3">
            {SPLIT_TYPES.map(t => (
              <button
                key={t}
                type="button"
                className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${splitType === t ? 'bg-[#6c5ce7] text-white shadow' : 'text-text-muted hover:text-text'}`}
                onClick={() => setSplitType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* member selection for split */}
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Split Among</label>
          <div className="flex flex-col gap-2 mb-3">
            {members.map(m => (
              <div 
                key={m.id} 
                className="flex items-center gap-3 bg-card border border-border p-3 rounded-xl cursor-pointer hover:bg-card-hover transition-colors" 
                onClick={() => toggleMember(m.id)}
              >
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-2 border-[#6c5ce7] appearance-none checked:bg-[#6c5ce7] checked:border-transparent transition-colors cursor-pointer"
                    checked={splitAmong.includes(m.id)}
                    onChange={() => {}} // handled by parent onClick
                    readOnly
                  />
                  {splitAmong.includes(m.id) && (
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  )}
                </div>
                <span className="text-sm font-semibold text-text">{m.name}</span>

                {/* show input for non-equal splits */}
                {splitType !== 'equal' && splitAmong.includes(m.id) && (
                  <input
                    className="ml-auto w-[90px] bg-background border border-border text-text rounded-lg p-2 text-sm focus:outline-none focus:border-primary text-right"
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

        {/* recurring */}
        <div 
          className="flex items-center gap-3 bg-card border border-border p-3 rounded-xl cursor-pointer hover:bg-card-hover transition-colors" 
          onClick={() => setIsRecurring(!isRecurring)}
        >
          <div className="relative flex items-center justify-center w-5 h-5">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-2 border-[#6c5ce7] appearance-none checked:bg-[#6c5ce7] checked:border-transparent transition-colors cursor-pointer"
              checked={isRecurring} 
              readOnly 
            />
            {isRecurring && (
              <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            )}
          </div>
          <span className="text-sm font-semibold text-text">Recurring expense</span>
        </div>
        {isRecurring && (
          <select 
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary mt-1"
            value={recurFreq} 
            onChange={e => setRecurFreq(e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        )}

        {error && (
          <p className="text-[#e17055] text-[13px] mt-2 bg-[#e17055]/10 p-2 rounded-lg text-center font-medium">{error}</p>
        )}

        <button type="submit" className="w-full bg-primary text-white text-center py-3.5 rounded-xl font-bold hover:bg-primary-light transition-colors mt-4">
          Save Expense 💾
        </button>
      </form>
    </div>
  )
}
