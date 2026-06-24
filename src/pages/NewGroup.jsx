import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { saveGroup } from '../utils/store'
import { genId, genInviteCode } from '../utils/helpers'

export default function NewGroup() {
  const navigate = useNavigate()
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
    navigate(`/group/${group.id}`)
  }

  return (
    <div>
      <Link to="/" className="back-btn">← Back</Link>
      <h1 className="page-title">Create Group</h1>

      <form onSubmit={handleSubmit}>
        <label className="input-label">Group Name</label>
        <input
          className="input"
          type="text"
          placeholder="Weekend Trip, Roommates..."
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label className="input-label">Your Name</label>
        <input
          className="input"
          type="text"
          placeholder="What should people call you?"
          value={yourName}
          onChange={e => setYourName(e.target.value)}
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
          Create Group 🚀
        </button>
      </form>
    </div>
  )
}
