import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import NewGroup from './pages/NewGroup'
import JoinGroup from './pages/JoinGroup'
import GroupPage from './pages/GroupPage'
import AddExpense from './pages/AddExpense'
import History from './pages/History'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewGroup />} />
          <Route path="/join/:code?" element={<JoinGroup />} />
          <Route path="/group/:id" element={<GroupPage />} />
          <Route path="/group/:id/add" element={<AddExpense />} />
          <Route path="/group/:id/history" element={<History />} />
        </Routes>
      </div>
      <Nav />
    </BrowserRouter>
  )
}

export default App
