import { fmtMoney, fmtDate } from '../utils/helpers'
import { motion } from 'framer-motion'
import { Utensils, Plane, Home, Lightbulb, Film, ShoppingCart, FileText } from 'lucide-react'

const getCategoryIcon = (cat) => {
  switch (cat) {
    case 'food': return <Utensils size={20} />
    case 'travel': return <Plane size={20} />
    case 'rent': return <Home size={20} />
    case 'utilities': return <Lightbulb size={20} />
    case 'entertainment': return <Film size={20} />
    case 'shopping': return <ShoppingCart size={20} />
    default: return <FileText size={20} />
  }
}

const ExpenseRow = ({ expense, members }) => {
  const payer = members.find(m => m.id === expense.paidBy)
  const payerName = payer ? payer.name : 'Someone'

  return (
    <motion.div 
      className="flex items-center p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-2xl mb-3 transition-colors cursor-pointer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mr-4 bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(255,79,0,0.1)]">
        {getCategoryIcon(expense.category)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-[15px] mb-0.5 truncate tracking-tight">{expense.desc}</div>
        <div className="text-xs font-medium text-white/40 flex items-center flex-wrap gap-1.5">
          <span className="truncate max-w-[120px] text-white/60">{payerName}</span> paid • {fmtDate(expense.date)}
          {expense.splitType && expense.splitType !== 'equal' && (
            <span className="bg-white/10 text-white/80 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ml-1 border border-white/10">{expense.splitType}</span>
          )}
        </div>
      </div>
      <div className="font-display font-bold text-white text-lg ml-3 shrink-0">{fmtMoney(expense.amount)}</div>
    </motion.div>
  )
}

export default ExpenseRow
