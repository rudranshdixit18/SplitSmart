import { fmtMoney } from '../utils/helpers'
import { ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react'

// shows one member's balance - green if positive, red if negative
function MemberBalance({ member, amount }) {
  const rounded = Math.round(amount * 100) / 100

  let statusClass = 'text-white/40'
  let Icon = CheckCircle2
  let label = 'Settled Up'
  let displayAmt = ''
  let bgClass = 'bg-white/5'

  if (rounded > 0.01) {
    statusClass = 'text-success'
    Icon = ArrowUpRight
    label = 'Gets Back'
    displayAmt = fmtMoney(rounded)
    bgClass = 'bg-success/10 border-success/20'
  } else if (rounded < -0.01) {
    statusClass = 'text-danger'
    Icon = ArrowDownRight
    label = 'Owes'
    displayAmt = fmtMoney(Math.abs(rounded))
    bgClass = 'bg-danger/10 border-danger/20'
  }

  return (
    <div className={`flex justify-between items-center card border p-4 ${bgClass}`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border border-white/20 text-white flex justify-center items-center font-bold text-sm shadow-inner">
          {member.charAt(0).toUpperCase()}
        </div>
        <span className="font-bold text-white text-[15px]">{member}</span>
      </div>
      <div className={`flex flex-col items-end ${statusClass}`}>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1">
          {label} <Icon size={14} strokeWidth={3} />
        </div>
        {rounded !== 0 && (
          <span className="font-display font-bold text-lg">{displayAmt}</span>
        )}
      </div>
    </div>
  )
}

export default MemberBalance
