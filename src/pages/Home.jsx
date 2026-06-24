import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getGroups } from '../utils/store'

function Home() {
  const [groups, setGroups] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setGroups(getGroups())
  }, [])

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          💸 Split<span style={{ color: '#6c5ce7' }}>Smart</span>
        </h1>
        <p style={{ color: '#636e72', fontSize: 13, marginTop: 4 }}>
          split expenses, not friendships
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Link to="/new" className="btn btn-primary btn-block">
          + Create Group
        </Link>
        <Link to="/join" className="btn btn-outline btn-block">
          Join Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">🎉</span>
          <p>No groups yet!</p>
          <p>Create one or join with an invite code</p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#636e72' }}>
            Your Groups
          </h2>
          {groups.map(group => (
            <div
              key={group.id}
              className="card card-clickable group-card"
              onClick={() => navigate(`/group/${group.id}`)}
            >
              <div className="group-name">{group.name}</div>
              <div className="group-meta">
                <span>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
                <span className="group-code">{group.code}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default Home
