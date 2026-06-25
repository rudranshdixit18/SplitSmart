import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, getExpenses, getSettlements, saveSettlement, updateSettlement } from '../../../utils/api'
import { calcBalances, simplifyDebts } from '../../../utils/debtEngine'
import { fmtMoney, makeUpiLink, downloadCSV, downloadPDF } from '../../../utils/helpers'
import MemberBalance from '../../../components/MemberBalance'
import ExpenseRow from '../../../components/ExpenseRow'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Share2, Check, Download, FileText, Receipt, PartyPopper, Copy, User } from 'lucide-react'

export default function GroupPage() {
  const router = useRouter()
  const { id } = router.query
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])
  const [activeTab, setActiveTab] = useState('balances')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) return
    const g = await getGroup(id)
    if (!g) {
      router.push('/')
      return
    }
    setGroup(g)
    
    const [exp, setts] = await Promise.all([
      getExpenses(id),
      getSettlements(id)
    ])
    
    setExpenses(exp)
    setSettlements(setts)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    if (!id) return
    const handleFocus = () => {
      loadData()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [id])

  if (loading) return <div className="text-center text-text-muted mt-8">Loading group...</div>
  if (!group) return null

  const members = group.members || []
  
  const parsedExpenses = expenses.map(e => ({
    ...e,
    splitDetails: typeof e.split_details === 'string' ? JSON.parse(e.split_details || '{}') : (e.split_details || {})
  }))
  
  const balances = calcBalances(parsedExpenses, settlements, members)
  const debts = simplifyDebts(balances)

  const pendingSettlements = settlements.filter(s => s.status === 'pending')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleCopyInvite() {
    const url = `${window.location.origin}/join/${group.code}`
    navigator.clipboard.writeText(url).then(() => {
      showToast('Invite link copied!')
    }).catch(() => {
      showToast(`Code: ${group.code}`)
    })
  }

  async function handleMarkSettled(debt) {
    const settlementId = `s_${Date.now()}`
    const settlement = {
      id: settlementId,
      groupId: group.id,
      from: debt.from,
      to: debt.to,
      amount: debt.amount,
      status: 'settled',
    }
    await saveSettlement(settlement)
    loadData()
    showToast('Marked as settled ✓')
  }

  function handleExport() {
    downloadCSV(parsedExpenses, members)
    showToast('CSV downloaded!')
  }

  function handleExportPDF() {
    downloadPDF(parsedExpenses, members, group.name)
  }

  const getName = (memberId) => {
    const m = members.find(x => x.id === memberId)
    return m ? m.name : 'Unknown'
  }

  const getUpi = (memberId) => {
    const m = members.find(x => x.id === memberId)
    return m ? m.upiId : ''
  }

  const recentExpenses = [...parsedExpenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const tabs = ['balances', 'expenses', 'settle']

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-4 max-w-lg mx-auto pb-24"
    >
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[100] bg-success text-white px-4 py-2 rounded-full font-medium shadow-lg flex items-center gap-2"
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6 mt-3 bg-card p-4 rounded-xl border border-glass-border shadow-sm">
        <div>
          <Link href="/" className="text-text-muted text-sm hover:text-text flex items-center gap-1 mb-1">
            <ArrowLeft size={14} /> Groups
          </Link>
          <h1 className="text-[22px] font-bold mt-1 text-text">{group.name}</h1>
          <span className="text-[13px] text-text-muted">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button 
          onClick={handleCopyInvite} 
          className="btn btn-outline py-2 px-3 flex items-center gap-2"
        >
          <Share2 size={16} /> Share
        </button>
      </div>

      <div className="flex bg-card p-1 rounded-xl border border-glass-border mb-6 relative">
        {tabs.map(t => (
          <button
            key={t}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize relative z-10 transition-colors ${activeTab === t ? 'text-white' : 'text-text-muted hover:text-text'}`}
            onClick={() => setActiveTab(t)}
          >
            {activeTab === t && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'balances' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {members.map(m => (
            <MemberBalance
              key={m.id}
              member={m.name}
              amount={balances[m.id] || 0}
            />
          ))}
          {members.length === 1 && (
            <p className="text-text-muted text-[13px] text-center mt-3">
              Invite friends to start splitting!
            </p>
          )}
        </motion.div>
      )}

      {activeTab === 'expenses' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {recentExpenses.length === 0 ? (
            <div className="empty-state mt-4">
              <div className="empty-icon">
                <Receipt size={48} strokeWidth={1.5} />
              </div>
              <p className="text-text font-medium text-lg">No expenses yet</p>
              <p className="text-text-muted text-sm mt-1">Add one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map(exp => (
                <ExpenseRow key={exp.id} expense={exp} members={members} />
              ))}
              {parsedExpenses.length > 5 && (
                <Link 
                  href={`/group/${id}/history`}
                  className="block text-center text-primary text-sm mt-2 p-2 hover:underline"
                >
                  View all {parsedExpenses.length} expenses &rarr;
                </Link>
              )}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'settle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {debts.length === 0 ? (
            <div className="empty-state mt-4">
              <div className="empty-icon">
                <Check size={48} strokeWidth={1.5} />
              </div>
              <p className="text-text font-medium text-lg">Everyone's settled up!</p>
              <p className="text-text-muted text-sm mt-1">No pending balances</p>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-text-muted mb-3">
                Simplified — minimum transactions needed:
              </p>
              <div className="space-y-3">
                {debts.map((debt, i) => (
                  <div className="bg-card border border-glass-border p-4 rounded-xl flex flex-col gap-3" key={i}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text">{getName(debt.from)}</span>
                        <span className="text-text-muted">&rarr;</span>
                        <span className="font-semibold text-text">{getName(debt.to)}</span>
                      </div>
                      <span className="font-bold text-danger text-lg">{fmtMoney(debt.amount)}</span>
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
                         className="btn bg-success text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:brightness-110"
                       >
                         Pay via UPI
                       </a>
                      )}
                      <button
                        className="btn btn-outline text-success border-success px-3 py-1.5 rounded-lg hover:bg-success hover:text-white"
                        onClick={() => handleMarkSettled(debt)}
                      >
                        Mark Settled
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {pendingSettlements.length > 0 && (
            <div className="mt-5">
              <h3 className="text-[15px] font-semibold mb-2 text-text">Pending</h3>
              <div className="space-y-2">
                {pendingSettlements.map(s => (
                  <div key={s.id} className="bg-card border border-glass-border p-3 rounded-xl text-[13px] flex justify-between items-center">
                    <div>
                      <span className="font-medium text-text">{getName(s.from)}</span> <span className="text-text-muted mx-1">&rarr;</span> <span className="font-medium text-text">{getName(s.to)}</span>
                      <span className="ml-2 text-text">{fmtMoney(s.amount)}</span>
                    </div>
                    <span className="bg-card-hover border border-border text-text-muted text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md">pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-6 pt-4 border-t border-glass-border">
        <h3 className="text-[15px] font-semibold mb-3 text-text flex items-center gap-2">
          <User size={16} /> Members
        </h3>
        <ul className="flex flex-col gap-2 m-0 p-0 list-none">
          {members.map(m => (
            <li key={m.id} className="flex items-center gap-3 bg-card border border-glass-border p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-lg shrink-0">
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

        <div className="mt-4 bg-card-hover p-4 rounded-xl flex items-center justify-between border border-glass-border">
          <div>
            <div className="text-xs text-text-muted mb-1">Invite Code</div>
            <div className="font-mono text-lg font-bold text-primary-light tracking-widest">{group.code}</div>
          </div>
          <button className="btn btn-outline py-1.5 px-3" onClick={handleCopyInvite}>
            <Copy size={16} />
          </button>
        </div>
      </div>

      {parsedExpenses.length > 0 && (
        <div className="flex gap-2 mt-4 mb-20">
          <button 
            className="flex-1 btn btn-outline flex items-center justify-center gap-2"
            onClick={handleExport}
          >
            <Download size={16} /> CSV
          </button>
          <button 
            className="flex-1 btn btn-outline flex items-center justify-center gap-2"
            onClick={handleExportPDF}
          >
            <FileText size={16} /> PDF
          </button>
        </div>
      )}

      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link 
          href={`/group/${id}/add`} 
          className="w-14 h-14 bg-gradient-to-r from-primary to-accent text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl"
        >
          <Receipt size={24} />
        </Link>
      </motion.div>
    </motion.div>
  )
}
