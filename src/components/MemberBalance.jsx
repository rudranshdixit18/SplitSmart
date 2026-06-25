import { fmtMoney } from '../utils/helpers'

// shows one member's balance - green if positive, red if negative
function MemberBalance({ member, amount }) {
  const rounded = Math.round(amount * 100) / 100

  let statusClass = 'text-text-muted font-medium'
  let icon = '✓'
  let label = 'settled up'
  let displayAmt = ''

  if (rounded > 0.01) {
    statusClass = 'text-[#00b894] font-semibold'
    icon = '↑'
    label = 'gets back'
    displayAmt = fmtMoney(rounded)
  } else if (rounded < -0.01) {
    statusClass = 'text-[#e17055] font-semibold'
    icon = '↓'
    label = 'owes'
    displayAmt = fmtMoney(Math.abs(rounded))
  }

  return (
    <div className="flex justify-between items-center bg-card border border-border p-3 px-4 rounded-xl mb-2">
      <div className="flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-full bg-primary text-white flex justify-center items-center font-bold text-lg">
          {member.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold text-text text-[15px]">{member}</span>
      </div>
      <div className={`text-[13px] ${statusClass}`}>
        {rounded === 0 ? (
          <span>{label} {icon}</span>
        ) : (
          <span>{icon} {label} {displayAmt}</span>
        )}
      </div>
    </div>
  )
}

export default MemberBalance
