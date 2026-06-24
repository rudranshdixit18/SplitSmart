import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getGroups, saveGroup } from '../utils/store'
import { genId } from '../utils/helpers'

export default function JoinGroup() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  
  const [code, setCode] = useState(urlCode || '')
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
    navigate(`/group/${group.id}`)
  }

  return (
    <div>
      <Link to="/" className="back-btn">← Back</Link>
      <h1 className="page-title">Join Group</h1>
      <p className="page-subtitle">Enter the invite code shared by your friend</p>

      <form onSubmit={onSubmit}>
        <label className="input-label">Invite Code</label>
        <input
          className="input"
          type="text"
          placeholder="ABC123"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          style={{ 
            fontFamily: 'monospace', 
            fontSize: 20, 
            letterSpacing: 3, 
            textAlign: 'center' 
          }}
          maxLength={6}
        />

        <label className="input-label">Your Name</label>
        <input
          className="input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label className="input-label">Your UPI ID (optional)</label>
        <input
          className="input"
          type="text"
          placeholder="you@upi"
          value={upiId}
          onChange={e => setUpiId(e.target.value)}
        />

        {error && (
          <p style={{ color: '#e17055', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
          Join Group ✨
        </button>
      </form>
    </div>
  )
}
