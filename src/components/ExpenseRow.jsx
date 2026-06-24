import { categoryEmoji, fmtMoney, fmtDate } from '../utils/helpers'

// single expense row in a list
const ExpenseRow = ({ expense, members }) => {
  // resolve paidBy to a name
  const payer = members.find(m => m.id === expense.paidBy)
  const payerName = payer ? payer.name : 'Someone'

  return (
    <div className="expense-item">
      <div className="emoji">{categoryEmoji(expense.category)}</div>
      <div className="info">
        <div className="desc">{expense.desc}</div>
        <div className="meta">
          {payerName} paid • {fmtDate(expense.date)}
          {expense.splitType && expense.splitType !== 'equal' && (
            <span className="chip" style={{ marginLeft: 6 }}>{expense.splitType}</span>
          )}
        </div>
      </div>
      <div className="amount">{fmtMoney(expense.amount)}</div>
    </div>
  )
}

export default ExpenseRow
