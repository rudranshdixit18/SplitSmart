import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getGroups } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight, Users, Sparkles } from 'lucide-react'

export default function Home() {
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
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      <main className="px-6 pt-12 pb-32 max-w-2xl mx-auto relative z-10">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="py-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
            <Sparkles size={14} className="text-primary-light" /> Next-Gen Finance
          </div>
          <h1 className="text-6xl sm:text-7xl font-display font-bold tracking-tighter leading-[1.1] mb-6">
            Split bills.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Zero friction.
            </span>
          </h1>
          <p className="text-lg text-white/50 font-medium max-w-md leading-relaxed">
            The most elegant way to manage shared expenses. Built for speed, designed for clarity.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Link href="/new" className="flex-1 btn btn-primary py-4 rounded-2xl text-[15px] font-bold shadow-[0_0_40px_rgba(255,79,0,0.3)] hover:shadow-[0_0_60px_rgba(255,79,0,0.5)] flex items-center justify-center gap-2 group">
            <Plus size={20} className="transition-transform group-hover:rotate-90" /> Initialize Workspace
          </Link>
          <Link href="/join" className="flex-1 btn bg-white/5 border border-white/10 hover:bg-white/10 py-4 rounded-2xl text-[15px] font-bold backdrop-blur-md flex items-center justify-center gap-2 group transition-all">
            Join Existing <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Dashboard / Groups List */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-[0.2em]">
              Active Workspaces
            </h2>
            {!loading && groups.length > 0 && (
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-white/70 border border-white/10">
                {groups.length} Total
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2].map(i => (
                <div key={i} className="h-[100px] rounded-[24px] bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="empty-state"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_30px_rgba(255,79,0,0.15)]">
                <Users size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">No active workspaces</h3>
              <p className="text-white/40 max-w-[250px] mx-auto text-[15px]">
                Create a new workspace or join an existing one using an invite code.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-4"
            >
              {groups.map(group => (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  key={group.id}
                  className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-[24px] p-6 cursor-pointer transition-all duration-500 overflow-hidden"
                  onClick={() => router.push(`/group/${group.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-2xl text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-4 text-[13px] font-medium text-white/50">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-white/40" />
                          {group.members?.length || 0} Member{(group.members?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(0,204,102,0.6)]" />
                          Active
                        </span>
                      </div>
                    </div>
                    
                    <div className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg backdrop-blur-md">
                      <span className="font-mono text-xs font-bold text-primary-light tracking-wider">
                        {group.code}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
