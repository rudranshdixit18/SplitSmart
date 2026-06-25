import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, getExpenses, getSettlements, saveSettlement, updateSettlement } from '../../../utils/store'
import { calcBalances, simplifyDebts } from '../../../utils/debtEngine'
import { fmtMoney, genId, makeUpiLink, downloadCSV, downloadPDF } from '../../../utils/helpers'
import MemberBalance from '../../../components/MemberBalance'
import ExpenseRow from '../../../components/ExpenseRow'

export default function GroupPage() {
  const router = useRouter()
  const { id } = router.query
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])
  const [activeTab, setActiveTab] = useState('balances')
  const [toast, setToast] = useState('')

  // load data
  useEffect(() => {
    if (!id) return
    const g = getGroup(id)
    if (!g) {
      router.push('/')
      return
    }
    setGroup(g)
    setExpenses(getExpenses(id))
    setSettlements(getSettlements(id))
  }, [id])

  // refresh data when we come back from adding expense
  useEffect(() => {
    if (!id) return
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
    <div className="p-4 max-w-lg mx-auto">
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#00b894] text-white px-4 py-2 rounded-full font-medium shadow-lg z-[100] animate-[fadeIn_0.3s_ease]">{toast}</div>}

      {/* header */}
      <div className="flex justify-between items-center mb-6 mt-3 bg-card p-4 rounded-xl border border-border">
        <div>
          <Link href="/" className="text-text-muted text-sm hover:text-text">← Groups</Link>
          <h1 className="text-[22px] font-bold mt-1 text-text">{group.name}</h1>
          <span className="text-[13px] text-text-muted">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button 
          onClick={handleCopyInvite} 
          className="bg-transparent border border-primary text-primary px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
        >
          Share 🔗
        </button>
      </div>

      {/* tabs */}
      <div className="flex bg-[#2d2d44] p-1 rounded-xl mb-6">
        {tabs.map(t => (
          <button
            key={t}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${activeTab === t ? 'bg-[#6c5ce7] text-white shadow' : 'text-text-muted hover:text-text'}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* BALANCES TAB */}
      {activeTab === 'balances' && (
        <div className="space-y-3">
          {members.map(m => (
            <MemberBalance
              key={m.id}
              member={m.name}
              amount={balances[m.id] || 0}
            />
          ))}
          {members.length === 1 && (
            <p className="text-text-muted text-[13px] text-center mt-3">
              Invite friends to start splitting! 🎈
            </p>
          )}
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div>
          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-2xl border border-border">
              <span className="text-5xl mb-4">🧾</span>
              <p className="text-text font-medium">No expenses yet</p>
              <p className="text-text-muted text-sm mt-1">Add one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map(exp => (
                <ExpenseRow key={exp.id} expense={exp} members={members} />
              ))}
              {expenses.length > 5 && (
                <Link 
                  href={`/group/${id}/history`}
                  className="block text-center text-[#6c5ce7] text-sm mt-2 p-2 hover:underline"
                >
                  View all {expenses.length} expenses →
                </Link>
              )}
            </div>
          )}
          <Link
            href={`/group/${id}/add`}
            className="block w-full bg-[#6c5ce7] text-white text-center py-3.5 rounded-xl font-bold hover:bg-[#a29bfe] transition-colors mt-4"
          >
            + Add Expense
          </Link>
        </div>
      )}

      {/* SETTLE TAB */}
      {activeTab === 'settle' && (
        <div>
          {debts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-2xl border border-border">
              <span className="text-5xl mb-4">🎊</span>
              <p className="text-text font-medium">Everyone's settled up!</p>
              <p className="text-text-muted text-sm mt-1">No pending balances</p>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-text-muted mb-3">
                Simplified — minimum transactions needed:
              </p>
              <div className="space-y-3">
                {debts.map((debt, i) => (
                  <div className="bg-card border border-[#2d2d44] p-4 rounded-xl flex flex-col gap-3" key={i}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text">{getName(debt.from)}</span>
                        <span className="text-text-muted">→</span>
                        <span className="font-semibold text-text">{getName(debt.to)}</span>
                      </div>
                      <span className="font-bold text-[#e17055] text-lg">{fmtMoney(debt.amount)}</span>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      {getUpi(debt.to) && (
                        <a
                          href={makeUpiLink({
                            upiId: getUpi(debt.to),
                            name: getName(debt.to),
                            amount: debt.amount,
                            note: `SplitSmart - ${group.name}`
                          })}
                          className="bg-[#00b894] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center justify-center min-w-[90px] shadow-sm hover:bg-[#00a884] transition-colors"
                        >
                          Pay via UPI
                        </a>
                      )}
                      <button
                        className="bg-transparent border border-[#00b894] text-[#00b894] text-xs font-semibold px-3 py-1.5 rounded-lg min-w-[90px] hover:bg-[#00b894] hover:text-white transition-colors"
                        onClick={() => handleMarkSettled(debt)}
                      >
                        Mark Settled ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* pending settlements history */}
          {pendingSettlements.length > 0 && (
            <div className="mt-5">
              <h3 className="text-[15px] font-semibold mb-2 text-text">Pending</h3>
              <div className="space-y-2">
                {pendingSettlements.map(s => (
                  <div key={s.id} className="bg-card border border-[#2d2d44] p-3 rounded-xl text-[13px] flex justify-between items-center">
                    <div>
                      <span className="font-medium text-text">{getName(s.from)}</span> <span className="text-text-muted mx-1">→</span> <span className="font-medium text-text">{getName(s.to)}</span>
                      <span className="ml-2 text-text">{fmtMoney(s.amount)}</span>
                    </div>
                    <span className="bg-[#2d2d44] text-text-muted text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md">pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Members section */}
      <div className="mt-6 pt-4 border-t border-[#2d2d44]">
        <h3 className="text-[15px] font-semibold mb-3 text-text">Members</h3>
        <ul className="flex flex-col gap-2 m-0 p-0 list-none">
          {members.map(m => (
            <li key={m.id} className="flex items-center gap-3 bg-card border border-[#2d2d44] p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#6c5ce7] text-white flex items-center justify-center font-bold text-lg shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm text-text">{m.name}</div>
                {m.upiId && (
                  <div className="text-[12px] text-text-muted">{m.upiId}</div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* invite box */}
        <div className="mt-4 bg-[#2d2d44] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-text-muted mb-1">Invite Code</div>
            <div className="font-mono text-lg font-bold text-[#a29bfe] tracking-widest">{group.code}</div>
          </div>
          <button className="bg-transparent border border-[#a29bfe] text-[#a29bfe] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#a29bfe] hover:text-white transition-colors" onClick={handleCopyInvite}>
            Copy Link
          </button>
        </div>
      </div>

      {/* export */}
      {expenses.length > 0 && (
        <div className="flex gap-2 mt-4">
          <button 
            className="flex-1 bg-transparent border border-border text-text py-2 rounded-xl text-sm font-semibold hover:bg-card-hover transition-colors"
            onClick={handleExport}
          >
            📥 CSV
          </button>
          <button 
            className="flex-1 bg-transparent border border-border text-text py-2 rounded-xl text-sm font-semibold hover:bg-card-hover transition-colors"
            onClick={handleExportPDF}
          >
            📄 PDF
          </button>
        </div>
      )}

      {/* FAB for adding expense */}
      <Link href={`/group/${id}/add`} className="fixed bottom-[80px] right-6 w-14 h-14 bg-[#6c5ce7] text-white rounded-full flex items-center justify-center text-3xl pb-1 shadow-[0_4px_12px_rgba(108,92,231,0.4)] hover:scale-105 transition-transform z-40" title="Add Expense">
        +
      </Link>
    </div>
  )
}
