import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { saveGroup } from '../utils/api'

export default function NewGroup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [members, setMembers] = useState([{ id: 'm1', name: '' }])
  const [loading, setLoading] = useState(false)

  const handleAddMember = () => {
    setMembers([...members, { id: `m${Date.now()}`, name: '' }])
  }

  const handleMemberChange = (id, val) => {
    setMembers(members.map(m => m.id === id ? { ...m, name: val } : m))
  }

  const handleRemoveMember = (id) => {
    setMembers(members.filter(m => m.id !== id))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Group name is required")
      return
    }
    const validMembers = members.filter(m => m.name.trim())
    if (validMembers.length === 0) {
      alert("Add at least one member")
      return
    }

    setLoading(true)

    // hackathon way: random group id and short code
    const groupId = `g_${Date.now()}`
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const newGroup = {
      id: groupId,
      name: name.trim(),
      code,
      members: validMembers.map(m => ({
        id: m.id,
        name: m.name.trim(),
        groupId
      }))
    }

    await saveGroup(newGroup)
    router.push(`/group/${groupId}`)
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Link href="/" className="inline-block text-text-muted hover:text-text mb-4 text-sm font-medium">← Back to Home</Link>
      <h1 className="text-2xl font-bold mb-6 text-text">Create New Group</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-text-muted mb-1.5 uppercase tracking-wider">Group Name</label>
          <input
            className="w-full bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary placeholder:text-text-muted"
            type="text"
            placeholder="e.g. Goa Trip 🌴"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-text-muted mb-1.5 uppercase tracking-wider">Members</label>
          {members.map((m, idx) => (
            <div key={m.id} className="flex gap-2 mb-2">
              <input
                className="flex-1 bg-card border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary placeholder:text-text-muted"
                type="text"
                placeholder={`Member ${idx + 1} Name`}
                value={m.name}
                onChange={e => handleMemberChange(m.id, e.target.value)}
              />
              {members.length > 1 && (
                <button
                  className="bg-transparent border border-danger text-danger px-4 rounded-xl font-bold hover:bg-danger hover:text-white transition-colors"
                  onClick={() => handleRemoveMember(m.id)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            className="text-primary font-bold text-sm mt-1 hover:text-primary-light"
            onClick={handleAddMember}
          >
            + Add Another Member
          </button>
        </div>
      </div>

      <button
        className={`w-full bg-primary text-white py-3.5 rounded-xl font-bold mt-8 shadow-lg hover:bg-primary-light hover:-translate-y-0.5 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Group 🎉'}
      </button>
    </div>
  )
}
