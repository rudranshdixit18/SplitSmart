import { fmtMoney } from '../utils/helpers'

// shows one member's balance - green if positive, red if negative
function MemberBalance({ member, amount }) {
  const rounded = Math.round(amount * 100) / 100

  let statusClass = 'settled'
  let icon = '✓'
  let label = 'settled up'
  let displayAmt = ''

  if (rounded > 0.01) {
    statusClass = 'gets'
    icon = '↑'
    label = 'gets back'
    displayAmt = fmtMoney(rounded)
  } else if (rounded < -0.01) {
    statusClass = 'owes'
    icon = '↓'
    label = 'owes'
    displayAmt = fmtMoney(Math.abs(rounded))
  }

  return (
    <div className="balance-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="member-avatar">
          {member.charAt(0).toUpperCase()}
        </div>
        <span className="member-name">{member}</span>
      </div>
      <div className={statusClass}>
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
