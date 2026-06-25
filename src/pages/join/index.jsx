import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroup, addMemberToGroup } from '../../utils/api'

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
      // Find group by code. In our backend, get_group checks id first, then code.
      const group = await getGroup(code.trim().toUpperCase())
      
      if (!group) {
        setError("Invalid invite code")
        setLoading(false)
        return
      }

      // hackathon random id
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
    <div className="p-4 max-w-lg mx-auto">
      <Link href="/" className="inline-block text-text-muted hover:text-text mb-4 text-sm font-medium">← Back to Home</Link>
      <h1 className="text-2xl font-bold mb-6 text-text">Join Group</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-text-muted mb-1.5 uppercase tracking-wider">Invite Code</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 font-mono uppercase focus:outline-none focus:border-primary placeholder:text-text-muted placeholder:font-sans"
            type="text"
            placeholder="e.g. X7B9A2"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-text-muted mb-1.5 uppercase tracking-wider">Your Name</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary placeholder:text-text-muted"
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
        className={`w-full bg-primary text-white py-3.5 rounded-xl font-bold mt-8 shadow-lg hover:bg-primary-light hover:-translate-y-0.5 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={handleJoin}
        disabled={loading}
      >
        {loading ? 'Joining...' : 'Join Group 🤝'}
      </button>
    </div>
  )
}
