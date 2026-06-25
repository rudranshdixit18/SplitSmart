import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getGroups, saveGroup } from '../../utils/store'
import { genId } from '../../utils/helpers'

export default function JoinGroup() {
  const router = useRouter()
  const { code: urlCode } = router.query
  
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [upiId, setUpiId] = useState('')
  const [error, setError] = useState('')

  // if code comes from URL, prefill
  useEffect(() => {
    if (urlCode) setCode(urlCode.toUpperCase())
  }, [urlCode])

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Enter an invite code')
      return
    }
    if (!name.trim()) {
      setError('Enter your name')
      return
    }

    // find the group
    const groups = getGroups()
    const group = groups.find(g => g.code === code.trim().toUpperCase())
    
    if (!group) {
      setError('No group found with that code 😕')
      return
    }

    // check if name already exists (simple dupe check)
    if (group.members.some(m => m.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('Someone with that name is already in the group')
      return
    }

    // add member
    group.members.push({
      id: genId(),
      name: name.trim(),
      upiId: upiId.trim() || ''
    })

    saveGroup(group)
    router.push(`/group/${group.id}`)
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Link href="/" className="inline-block text-text-muted hover:text-text mb-4">← Back</Link>
      <h1 className="text-2xl font-bold mb-1">Join Group</h1>
      <p className="text-text-muted text-sm mb-6">Enter the invite code shared by your friend</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Invite Code</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary text-center font-mono text-xl tracking-widest uppercase"
            type="text"
            placeholder="ABC123"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Your Name</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Your UPI ID (optional)</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary"
            type="text"
            placeholder="you@upi"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-danger text-sm mb-2">{error}</p>
        )}

        <button type="submit" className="w-full bg-primary text-white text-center py-3.5 rounded-xl font-bold hover:bg-primary-light transition-colors mt-2">
          Join Group ✨
        </button>
      </form>
    </div>
  )
}
