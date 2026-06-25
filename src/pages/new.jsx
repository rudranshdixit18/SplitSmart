import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { saveGroup } from '../utils/store'
import { genId, genInviteCode } from '../utils/helpers'

export default function NewGroup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [yourName, setYourName] = useState('')
  const [upiId, setUpiId] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Group name is required')
      return
    }
    if (!yourName.trim()) {
      setError('Enter your name')
      return
    }

    const memberId = genId()
    const group = {
      id: genId(),
      name: name.trim(),
      code: genInviteCode(),
      members: [{
        id: memberId,
        name: yourName.trim(),
        upiId: upiId.trim() || ''
      }],
      createdAt: new Date().toISOString()
    }

    saveGroup(group)
    // console.log('created group', group)
    router.push(`/group/${group.id}`)
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Link href="/" className="inline-block text-text-muted hover:text-text mb-4">← Back</Link>
      <h1 className="text-2xl font-bold mb-6">Create Group</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Group Name</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary"
            type="text"
            placeholder="Weekend Trip, Roommates..."
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1 tracking-wider">Your Name</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary"
            type="text"
            placeholder="What should people call you?"
            value={yourName}
            onChange={e => setYourName(e.target.value)}
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
          Create Group 🚀
        </button>
      </form>
    </div>
  )
}
