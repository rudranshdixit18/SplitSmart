import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { saveGroup } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, UserPlus, X, CheckCircle, Sparkles } from 'lucide-react'

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
      alert("Workspace name is required")
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
    <div className="relative min-h-screen">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-float pointer-events-none" />

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
            <Sparkles size={12} /> New Environment
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white">Initialize Workspace</h1>
        </div>

        <div className="card p-6 mb-8 space-y-6">
          <div>
            <label className="input-label">Workspace Name</label>
            <input
              className="input text-lg"
              type="text"
              placeholder="e.g. Project Alpha"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Team Members</label>
            <AnimatePresence>
              {members.map((m, idx) => (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                  key={m.id} 
                  className="flex gap-2 mb-3 overflow-hidden"
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
                      className="w-[52px] shrink-0 btn bg-danger/10 border border-danger/20 hover:bg-danger/20 text-danger p-0 flex items-center justify-center rounded-xl"
                      onClick={() => handleRemoveMember(m.id)}
                    >
                      <X size={20} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <button
              className="mt-2 text-primary font-bold text-sm hover:text-primary-light flex items-center gap-1.5 transition-colors"
              onClick={handleAddMember}
            >
              <UserPlus size={16} /> Add Another Member
            </button>
          </div>
        </div>

        <button
          className={`w-full btn btn-primary py-4 text-[15px] font-bold shadow-[0_0_40px_rgba(255,79,0,0.3)] hover:shadow-[0_0_60px_rgba(255,79,0,0.5)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Processing...' : <><CheckCircle size={20} /> Create Workspace</>}
        </button>
      </motion.div>
    </div>
  )
}
