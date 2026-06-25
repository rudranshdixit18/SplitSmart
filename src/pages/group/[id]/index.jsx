import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, getExpenses, getSettlements, saveSettlement } from '../../../utils/api'
import { calcBalances, simplifyDebts } from '../../../utils/debtEngine'
import { fmtMoney, makeUpiLink, downloadCSV, downloadPDF } from '../../../utils/helpers'
import MemberBalance from '../../../components/MemberBalance'
import ExpenseRow from '../../../components/ExpenseRow'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Share2, Check, Download, FileText, Receipt, Copy, User, Plus } from 'lucide-react'

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

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
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
    <div className="relative min-h-screen">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-float pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="p-6 max-w-lg mx-auto pb-32 relative z-10"
      >
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-6 left-1/2 z-[100] bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full font-medium shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-black">
                <Check size={12} strokeWidth={3} /> 
              </div>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-8 mt-2 flex justify-between items-start">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold hover:bg-white/10 transition-colors mb-4 uppercase tracking-widest">
              <ArrowLeft size={14} /> Workspaces
            </Link>
            <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">{group.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {members.slice(0, 3).map((m, i) => (
                  <div key={m.id} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center text-[10px] font-bold text-white z-[3] relative" style={{ zIndex: 10 - i }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-white/40 ml-2">
                {members.length} Member{members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button 
            onClick={handleCopyInvite} 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70"
          >
            <Share2 size={18} />
          </button>
        </header>

        {/* Apple iOS Style Segmented Control */}
        <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-8 relative z-20">
          {tabs.map(t => (
            <button
              key={t}
              className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl capitalize relative z-10 transition-colors duration-300 ${activeTab === t ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              onClick={() => setActiveTab(t)}
            >
              {activeTab === t && (
                <motion.div
                  layoutId="activeTabGroup"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl shadow-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {t}
            </button>
          ))}
        </div>

        <div className="relative min-h-[300px]">
          {activeTab === 'balances' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {members.map(m => (
                <MemberBalance
                  key={m.id}
                  member={m.name}
                  amount={balances[m.id] || 0}
                />
              ))}
              {members.length === 1 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <User size={24} className="text-primary" />
                  </div>
                  <p className="text-white/40 font-medium">Invite friends to start splitting</p>
                  <button onClick={handleCopyInvite} className="mt-4 text-primary text-sm font-bold hover:underline">Copy Invite Link</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
            >
              {recentExpenses.length === 0 ? (
                <div className="empty-state">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Receipt size={24} className="text-white/40" />
                  </div>
                  <p className="text-white font-display font-bold text-lg mb-1">No expenses yet</p>
                  <p className="text-white/40 text-sm">Tap the + button to add one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map(exp => (
                    <ExpenseRow key={exp.id} expense={exp} members={members} />
                  ))}
                  {parsedExpenses.length > 5 && (
                    <Link 
                      href={`/group/${id}/history`}
                      className="block w-full text-center py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-sm transition-all"
                    >
                      View all {parsedExpenses.length} expenses
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settle' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
            >
              {debts.length === 0 ? (
                <div className="empty-state">
                  <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mb-4 text-success shadow-[0_0_20px_rgba(0,204,102,0.2)]">
                    <Check size={28} strokeWidth={3} />
                  </div>
                  <p className="text-white font-display font-bold text-xl mb-1">All settled up!</p>
                  <p className="text-white/40 text-sm font-medium">No pending balances.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 ml-1">
                    Suggested Transactions
                  </p>
                  <div className="space-y-3">
                    {debts.map((debt, i) => (
                      <div className="card p-5" key={i}>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">{getName(debt.from)}</span>
                            <ArrowLeft size={14} className="text-white/20 rotate-180" />
                            <span className="font-bold text-white">{getName(debt.to)}</span>
                          </div>
                          <span className="font-display font-bold text-primary text-xl">{fmtMoney(debt.amount)}</span>
                        </div>
                        <div className="flex gap-2">
                          {getUpi(debt.to) && (
                            <a
                              href={makeUpiLink({
                                upiId: getUpi(debt.to),
                                name: getName(debt.to),
                                amount: debt.amount,
                                note: `SplitSmart - ${group.name}`
                              })}
                              className="flex-1 btn bg-success text-white py-2.5 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(0,204,102,0.4)]"
                            >
                              Pay UPI
                            </a>
                          )}
                          <button
                            className="flex-1 btn btn-outline py-2.5 rounded-xl font-bold"
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
            </motion.div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
            <User size={14} /> Group Members
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {members.map(m => (
              <div key={m.id} className="card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border border-white/20 flex items-center justify-center font-bold text-white shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-white truncate">{m.name}</div>
                  {m.upiId && <div className="text-[10px] text-white/40 truncate font-mono mt-0.5">{m.upiId}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Workspace Code</div>
              <div className="font-mono text-xl font-bold text-primary-light">{group.code}</div>
            </div>
            <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white" onClick={handleCopyInvite}>
              <Copy size={18} />
            </button>
          </div>
        </div>

        {parsedExpenses.length > 0 && (
          <div className="flex gap-3 mt-8 mb-12">
            <button className="flex-1 btn btn-outline py-3 rounded-xl gap-2 font-bold" onClick={handleExport}>
              <Download size={16} /> Export CSV
            </button>
            <button className="flex-1 btn btn-outline py-3 rounded-xl gap-2 font-bold" onClick={handleExportPDF}>
              <FileText size={16} /> Export PDF
            </button>
          </div>
        )}

        {/* Floating Action Button */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-8 z-40"
        >
          <Link 
            href={`/group/${id}/add`} 
            className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-full font-bold shadow-[0_8px_32px_rgba(255,79,0,0.5)] border border-white/20"
          >
            <Plus size={20} strokeWidth={3} /> Add Expense
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
