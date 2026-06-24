import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getGroup, saveExpense } from '../utils/store'
import { genId } from '../utils/helpers'

const CATEGORIES = ['food', 'travel', 'rent', 'utilities', 'entertainment', 'shopping', 'other']
const SPLIT_TYPES = ['equal', 'percentage', 'exact', 'shares']

export default function AddExpense() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)

  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paidBy, setPaidBy] = useState('')
  const [splitType, setSplitType] = useState('equal')
  const [splitAmong, setSplitAmong] = useState([]) // member ids who are part of split
  const [splitValues, setSplitValues] = useState({}) // memberId -> value (%, amount, or shares)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurFreq, setRecurFreq] = useState('monthly')
  const [error, setError] = useState('')

  useEffect(() => {
    const g = getGroup(id)
    if (!g) {
      navigate('/')
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
    navigate(`/group/${id}`)
  }

  return (
    <div>
      <Link to={`/group/${id}`} className="back-btn">← Back</Link>
      <h1 className="page-title">Add Expense</h1>

      <form onSubmit={handleSubmit}>
        <label className="input-label">Description</label>
        <input
          className="input"
          type="text"
          placeholder="Dinner, Uber, Groceries..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />

        <label className="input-label">Amount (₹)</label>
        <input
          className="input"
          type="number"
          placeholder="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0"
          step="0.01"
          style={{ fontSize: 20, fontWeight: 700 }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label className="input-label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="input-label">Date</label>
            <input
              className="input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        <label className="input-label">Paid By</label>
        <select value={paidBy} onChange={e => setPaidBy(e.target.value)}>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {/* split type selector */}
        <label className="input-label">Split Type</label>
        <div className="tab-bar" style={{ marginBottom: 12 }}>
          {SPLIT_TYPES.map(t => (
            <button
              key={t}
              type="button"
              className={`tab ${splitType === t ? 'active' : ''}`}
              onClick={() => setSplitType(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* member selection for split */}
        <label className="input-label">Split Among</label>
        <div style={{ marginBottom: 12 }}>
          {members.map(m => (
            <div key={m.id} className="checkbox-row" onClick={() => toggleMember(m.id)}>
              <input
                type="checkbox"
                checked={splitAmong.includes(m.id)}
                onChange={() => {}} // handled by parent onClick
                readOnly
              />
              <span style={{ fontSize: 14 }}>{m.name}</span>

              {/* show input for non-equal splits */}
              {splitType !== 'equal' && splitAmong.includes(m.id) && (
                <input
                  className="input"
                  type="number"
                  placeholder={splitType === 'percentage' ? '%' : splitType === 'shares' ? 'shares' : '₹'}
                  value={splitValues[m.id] || ''}
                  onChange={e => handleSplitValueChange(m.id, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{ width: 90, marginBottom: 0, marginLeft: 'auto', padding: '8px 10px', fontSize: 13 }}
                  min="0"
                  step="0.01"
                />
              )}
            </div>
          ))}
        </div>

        {/* recurring */}
        <div className="checkbox-row" onClick={() => setIsRecurring(!isRecurring)}>
          <input type="checkbox" checked={isRecurring} readOnly />
          <span style={{ fontSize: 14 }}>Recurring expense</span>
        </div>
        {isRecurring && (
          <select value={recurFreq} onChange={e => setRecurFreq(e.target.value)} style={{ marginTop: 4 }}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        )}

        {error && (
          <p style={{ color: '#e17055', fontSize: 13, marginTop: 8 }}>{error}</p>
        )}

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
          Save Expense 💾
        </button>
      </form>
    </div>
  )
}
