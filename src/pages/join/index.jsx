import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, addMemberToGroup } from '../../utils/api'
import { motion } from 'framer-motion'
import { ArrowLeft, LogIn, Sparkles } from 'lucide-react'

export default function JoinGroup() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    if (!code.trim()) {
      setError("Invite code is required")
      return
    }
    if (!name.trim()) {
      setError("Your name is required")
      return
    }

    setLoading(true)
    setError('')

    try {
      const group = await getGroup(code.trim().toUpperCase())
      
      if (!group) {
        setError("Invalid invite code")
        setLoading(false)
        return
      }

      const memberId = `m_${Date.now()}`
      
      await addMemberToGroup(group.id, {
        id: memberId,
        name: name.trim()
      })

      router.push(`/group/${group.id}`)
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-float pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0 }}
        className="p-6 max-w-lg mx-auto relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold hover:bg-white/10 transition-colors mb-8 uppercase tracking-widest">
          <ArrowLeft size={14} /> Back
        </Link>
        
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
            <Sparkles size={12} /> Join Team
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white">Join Workspace</h1>
        </div>

        <div className="card p-6 mb-8 space-y-6">
          <div>
            <label className="input-label">Invite Code</label>
            <input
              className="input font-mono uppercase placeholder:font-sans text-lg tracking-wider"
              type="text"
              placeholder="e.g. X7B9A2"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Your Name</label>
            <input
              className="input text-lg"
              type="text"
              placeholder="What should people call you?"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-sm font-bold bg-danger/10 border border-danger/20 p-3 rounded-xl flex items-center gap-2">
              {error}
            </motion.p>
          )}
        </div>

        <button
          className={`w-full btn bg-white text-black hover:bg-white/90 py-4 text-[15px] font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? 'Processing...' : <><LogIn size={20} /> Join Workspace</>}
        </button>
      </motion.div>
    </div>
  )
}
