import { categoryEmoji, fmtMoney, fmtDate } from '../utils/helpers'

// single expense row in a list
const ExpenseRow = ({ expense, members }) => {
  // resolve paidBy to a name
  const payer = members.find(m => m.id === expense.paidBy)
  const payerName = payer ? payer.name : 'Someone'

  return (
    <div className="flex items-center p-3.5 bg-card border border-border rounded-xl mb-2.5">
      <div className="w-11 h-11 bg-[#2d2d44] rounded-lg flex items-center justify-center text-2xl shrink-0 mr-3.5">
        {categoryEmoji(expense.category)}
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
    </div>
  )
}

export default ExpenseRow
