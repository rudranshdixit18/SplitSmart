import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getGroups } from '../utils/api'

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

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <div className="text-center py-6 pb-2">
        <h1 className="text-3xl font-extrabold text-text">
          💸 Split<span className="text-primary">Smart</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">
          split expenses, not friendships
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Link href="/new" className="flex-1 bg-primary text-white text-center py-3 rounded-xl font-bold hover:bg-primary-light transition-colors">
          + Create Group
        </Link>
        <Link href="/join" className="flex-1 bg-transparent border border-primary text-primary text-center py-3 rounded-xl font-bold hover:bg-card-hover transition-colors">
          Join Group
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-text-muted mt-8">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-2xl border border-border mt-4">
          <span className="text-5xl mb-4">🎉</span>
          <p className="text-text font-medium">No groups yet!</p>
          <p className="text-text-muted text-sm mt-1">Create one or join with an invite code</p>
        </div>
      ) : (
        <>
          <h2 className="text-sm font-bold mb-3 text-text-muted uppercase tracking-wider">
            Your Groups
          </h2>
          <div className="space-y-3">
            {groups.map(group => (
              <div
                key={group.id}
                className="bg-card hover:bg-card-hover transition-colors border border-border rounded-xl p-4 cursor-pointer"
                onClick={() => router.push(`/group/${group.id}`)}
              >
                <div className="font-bold text-lg text-text mb-1">{group.name}</div>
                <div className="flex justify-between items-center text-sm text-text-muted">
                  <span>{group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}</span>
                  <span className="bg-[#2d2d44] text-[#a29bfe] px-2 py-0.5 rounded font-mono text-xs">{group.code}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Home
