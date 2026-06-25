import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, addMemberToGroup } from '../../utils/api'
import { motion } from 'framer-motion'
import { ArrowLeft, LogIn } from 'lucide-react'

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="p-4 max-w-lg mx-auto"
    >
      <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text mb-6 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <h1 className="text-2xl font-extrabold mb-6 text-text">Join Workspace</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Invite Code</label>
          <input
            className="input font-mono uppercase placeholder:font-sans"
            type="text"
            placeholder="e.g. X7B9A2"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Your Name</label>
          <input
            className="input"
            type="text"
            placeholder="What should people call you?"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-danger text-sm font-medium">{error}</p>
        )}
      </div>

      <button
        className={`w-full btn btn-primary py-3.5 mt-8 text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={handleJoin}
        disabled={loading}
      >
        {loading ? 'Processing...' : <><LogIn size={18} /> Join Workspace</>}
      </button>
    </motion.div>
  )
}
