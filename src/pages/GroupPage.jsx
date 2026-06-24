import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getGroup, getExpenses, getSettlements, saveSettlement, updateSettlement } from '../utils/store'
import { calcBalances, simplifyDebts } from '../utils/debtEngine'
import { fmtMoney, genId, makeUpiLink, downloadCSV, downloadPDF } from '../utils/helpers'
import MemberBalance from '../components/MemberBalance'
import ExpenseRow from '../components/ExpenseRow'

export default function GroupPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])
  const [activeTab, setActiveTab] = useState('balances')
  const [toast, setToast] = useState('')

  // load data
  useEffect(() => {
    const g = getGroup(id)
    if (!g) {
      navigate('/')
      return
    }
    setGroup(g)
    setExpenses(getExpenses(id))
    setSettlements(getSettlements(id))
  }, [id])

  // refresh data when we come back from adding expense
  useEffect(() => {
    const handleFocus = () => {
      setExpenses(getExpenses(id))
      setSettlements(getSettlements(id))
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [id])

  if (!group) return null

  const members = group.members
  const balances = calcBalances(expenses, settlements, members)
  const debts = simplifyDebts(balances)

  // pending settlements
  const pendingSettlements = settlements.filter(s => s.status === 'pending')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleCopyInvite() {
    const url = `${window.location.origin}/join/${group.code}`
    navigator.clipboard.writeText(url).then(() => {
      showToast('Invite link copied! 📋')
    }).catch(() => {
      // fallback
      showToast(`Code: ${group.code}`)
    })
  }

  function handleMarkSettled(debt) {
    const settlement = {
      id: genId(),
      groupId: group.id,
      from: debt.from,
      to: debt.to,
      amount: debt.amount,
      status: 'settled',
      settledAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    saveSettlement(settlement)
    setSettlements(getSettlements(id))
    showToast('Marked as settled ✓')
  }

  function handleExport() {
    downloadCSV(expenses, members)
    showToast('CSV downloaded!')
  }

  function handleExportPDF() {
    downloadPDF(expenses, members, group.name)
  }

  // get member name from id
  const getName = (memberId) => {
    const m = members.find(x => x.id === memberId)
    return m ? m.name : 'Unknown'
  }

  // get member upi from id
  const getUpi = (memberId) => {
    const m = members.find(x => x.id === memberId)
    return m ? m.upiId : ''
  }

  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const tabs = ['balances', 'expenses', 'settle']

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}

      {/* header */}
      <div className="group-header" style={{ marginTop: 12 }}>
        <div>
          <Link to="/" className="back-btn" style={{ margin: 0, padding: 0 }}>← Groups</Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{group.name}</h1>
          <span style={{ fontSize: 13, color: '#636e72' }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button 
          onClick={handleCopyInvite} 
          className="btn btn-outline btn-sm"
        >
          Share 🔗
        </button>
      </div>

      {/* tabs */}
      <div className="tab-bar">
        {tabs.map(t => (
          <button
            key={t}
            className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* BALANCES TAB */}
      {activeTab === 'balances' && (
        <div>
          {members.map(m => (
            <MemberBalance
              key={m.id}
              member={m.name}
              amount={balances[m.id] || 0}
            />
          ))}
          {members.length === 1 && (
            <p style={{ color: '#636e72', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
              Invite friends to start splitting! 🎈
            </p>
          )}
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div>
          {recentExpenses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">🧾</span>
              <p>No expenses yet</p>
              <p>Add one to get started!</p>
            </div>
          ) : (
            <>
              {recentExpenses.map(exp => (
                <ExpenseRow key={exp.id} expense={exp} members={members} />
              ))}
              {expenses.length > 5 && (
                <Link 
                  to={`/group/${id}/history`}
                  style={{ 
                    display: 'block', textAlign: 'center', 
                    color: '#6c5ce7', fontSize: 14, marginTop: 8, padding: 8 
                  }}
                >
                  View all {expenses.length} expenses →
                </Link>
              )}
            </>
          )}
          <Link
            to={`/group/${id}/add`}
            className="btn btn-primary btn-block"
            style={{ marginTop: 16 }}
          >
            + Add Expense
          </Link>
        </div>
      )}

      {/* SETTLE TAB */}
      {activeTab === 'settle' && (
        <div>
          {debts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">🎊</span>
              <p>Everyone's settled up!</p>
              <p>No pending balances</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: '#636e72', marginBottom: 12 }}>
                Simplified — minimum transactions needed:
              </p>
              {debts.map((debt, i) => (
                <div className="settle-card" key={i}>
                  <div className="settle-info">
                    <span style={{ fontWeight: 600 }}>{getName(debt.from)}</span>
                    <span style={{ color: '#636e72' }}>→</span>
                    <span style={{ fontWeight: 600 }}>{getName(debt.to)}</span>
                    <span className="settle-amount">{fmtMoney(debt.amount)}</span>
                  </div>
                  <div className="settle-actions">
                    {getUpi(debt.to) && (
                      <a
                        href={makeUpiLink({
                          upiId: getUpi(debt.to),
                          name: getName(debt.to),
                          amount: debt.amount,
                          note: `SplitSmart - ${group.name}`
                        })}
                        className="upi-link"
                        style={{ fontSize: 12, padding: '8px 14px' }}
                      >
                        Pay via UPI
                      </a>
                    )}
                    <button
                      className="settle-btn"
                      onClick={() => handleMarkSettled(debt)}
                    >
                      Mark Settled ✓
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* pending settlements history */}
          {pendingSettlements.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Pending</h3>
              {pendingSettlements.map(s => (
                <div key={s.id} className="card" style={{ fontSize: 13 }}>
                  {getName(s.from)} → {getName(s.to)}: {fmtMoney(s.amount)}
                  <span className="chip" style={{ marginLeft: 8 }}>pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members section */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #2d2d44' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Members</h3>
        <ul className="member-list">
          {members.map(m => (
            <li key={m.id} className="member-item">
              <div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                {m.upiId && (
                  <div style={{ fontSize: 12, color: '#636e72' }}>{m.upiId}</div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* TODO: add member directly from here */}
        <div className="invite-box" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#636e72' }}>Invite Code</div>
          <div className="code">{group.code}</div>
          <button className="btn btn-sm btn-outline" onClick={handleCopyInvite}>
            Copy Invite Link
          </button>
        </div>
      </div>

      {/* export */}
      {expenses.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button 
            className="btn btn-outline" 
            onClick={handleExport}
            style={{ flex: 1 }}
          >
            📥 CSV
          </button>
          <button 
            className="btn btn-outline" 
            onClick={handleExportPDF}
            style={{ flex: 1 }}
          >
            📄 PDF
          </button>
        </div>
      )}

      {/* FAB for adding expense */}
      <Link to={`/group/${id}/add`} className="fab" title="Add Expense">
        +
      </Link>
    </div>
  )
}
