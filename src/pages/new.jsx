import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { saveGroup } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, UserPlus, X, CheckCircle } from 'lucide-react'

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="p-4 max-w-lg mx-auto"
    >
      <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text mb-6 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <h1 className="text-2xl font-extrabold mb-6 text-text">Create Workspace</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Workspace Name</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. Project Alpha"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Team Members</label>
          <AnimatePresence>
            {members.map((m, idx) => (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                key={m.id} 
                className="flex gap-2 mb-2 overflow-hidden"
              >
                <input
                  className="input mb-0"
                  type="text"
                  placeholder={`Member ${idx + 1} Name`}
                  value={m.name}
                  onChange={e => handleMemberChange(m.id, e.target.value)}
                />
                {members.length > 1 && (
                  <button
                    className="btn btn-outline border-danger text-danger px-3.5"
                    onClick={() => handleRemoveMember(m.id)}
                  >
                    <X size={16} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            className="text-primary font-semibold text-sm mt-2 hover:text-primary-light flex items-center gap-1.5 transition-colors"
            onClick={handleAddMember}
          >
            <UserPlus size={16} /> Add Member
          </button>
        </div>
      </div>

      <button
        className={`w-full btn btn-primary mt-8 py-3.5 text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Processing...' : <><CheckCircle size={18} /> Initialize Workspace</>}
      </button>
    </motion.div>
  )
}
