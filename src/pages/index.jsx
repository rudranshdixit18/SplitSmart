import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getGroups } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, LogIn, Users } from 'lucide-react'

function Home() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getGroups().then(data => {
      setGroups(data || [])
      setLoading(false)
    })
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="px-4 pt-6 max-w-lg mx-auto"
    >
      <div className="text-center py-6 pb-4">
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
        >
          SplitSmart
        </motion.h1>
        <p className="text-text-muted text-sm mt-2 font-medium">
          Professional group expense management.
        </p>
      </div>

      <div className="flex gap-3 mb-8">
        <Link href="/new" className="flex-1 btn btn-primary py-3.5 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <PlusCircle size={18} /> Create Group
        </Link>
        <Link href="/join" className="flex-1 btn btn-outline py-3.5 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <LogIn size={18} /> Join Group
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-text-muted mt-8 animate-pulse">Loading groups...</div>
      ) : groups.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="empty-state mt-4"
        >
          <div className="empty-icon">
            <Users size={48} strokeWidth={1.5} />
          </div>
          <p className="text-text font-medium text-lg">No groups yet</p>
          <p className="text-text-muted text-sm mt-1">Create a new group or join an existing one.</p>
        </motion.div>
      ) : (
        <>
          <h2 className="text-xs font-bold mb-4 text-text-muted uppercase tracking-widest ml-1">
            Your Groups
          </h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {groups.map(group => (
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, zIndex: 10 }}
                whileTap={{ scale: 0.98 }}
                style={{ perspective: 1000 }}
                key={group.id}
                className="card card-clickable"
                onClick={() => router.push(`/group/${group.id}`)}
              >
                <div className="font-bold text-lg text-text mb-2">{group.name}</div>
                <div className="flex justify-between items-center text-sm text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} />
                    {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="bg-[#27272a] text-primary-light px-2.5 py-1 rounded-md font-mono text-xs border border-[#3f3f46]">
                    {group.code}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

export default Home
