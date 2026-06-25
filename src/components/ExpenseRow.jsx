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

// single expense row in a list
const ExpenseRow = ({ expense, members }) => {
  // resolve paidBy to a name
  const payer = members.find(m => m.id === expense.paidBy)
  const payerName = payer ? payer.name : 'Someone'

  return (
    <motion.div 
      className="flex items-center p-3.5 bg-card border border-border rounded-xl mb-2.5 expense-item"
      whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{ perspective: 1000 }}
    >
      <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 mr-3.5 emoji">
        {getCategoryIcon(expense.category)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text text-[15px] mb-0.5 truncate">{expense.desc}</div>
        <div className="text-[13px] text-text-muted flex items-center flex-wrap">
          <span className="truncate max-w-[120px] inline-block align-bottom">{payerName}</span>&nbsp;paid • {fmtDate(expense.date)}
          {expense.splitType && expense.splitType !== 'equal' && (
            <span className="bg-[#2d2d44] text-[#a29bfe] text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ml-1.5">{expense.splitType}</span>
          )}
        </div>
      </div>
      <div className="font-bold text-text text-[17px] ml-2 shrink-0">{fmtMoney(expense.amount)}</div>
    </motion.div>
  )
}

export default ExpenseRow
