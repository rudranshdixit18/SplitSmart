import { useLocation, Link, useParams } from 'react-router-dom'

// bottom nav bar - mobile app style
function Nav() {
  const location = useLocation()
  const path = location.pathname

  // figure out if we're in a group context
  const groupMatch = path.match(/\/group\/([^/]+)/)
  const groupId = groupMatch ? groupMatch[1] : null

  const isHome = path === '/' || path === '/new' || path === '/join'
  const isAdd = path.includes('/add')
  const isHistory = path.includes('/history')

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${isHome && !isAdd ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span>Home</span>
      </Link>

      <Link
        to={groupId ? `/group/${groupId}/add` : '/new'}
        className={`nav-item ${isAdd ? 'active' : ''}`}
      >
        <span className="nav-icon" style={{ fontSize: 24, fontWeight: 700 }}>+</span>
        <span>Add</span>
      </Link>

      <Link
        to={groupId ? `/group/${groupId}/history` : '/'}
        className={`nav-item ${isHistory ? 'active' : ''}`}
      >
        <span className="nav-icon">📋</span>
        <span>History</span>
      </Link>
    </nav>
  )
}

export default Nav
