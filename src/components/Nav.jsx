import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Plus, History } from 'lucide-react';

// floating dock style bottom nav
function Nav() {
  const router = useRouter();
  const path = router.pathname;
  const { id: groupId } = router.query;

  const isHome = path === '/' || path === '/new' || path === '/join';
  const isAdd = path.includes('/add');
  const isHistory = path.includes('/history');

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`nav-item ${isHome && !isAdd ? 'active' : ''}`}>
        <Home size={20} className="mb-1" />
        <span className="text-[10px] font-bold tracking-widest uppercase">Home</span>
      </Link>

      <Link
        href={groupId ? `/group/${groupId}/add` : '/new'}
        className={`nav-item ${isAdd ? 'active text-primary' : ''}`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${isAdd ? 'bg-primary/20 text-primary' : 'bg-white/10'}`}>
          <Plus size={20} />
        </div>
      </Link>

      <Link
        href={groupId ? `/group/${groupId}/history` : '/'}
        className={`nav-item ${isHistory ? 'active' : ''}`}
      >
        <History size={20} className="mb-1" />
        <span className="text-[10px] font-bold tracking-widest uppercase">Log</span>
      </Link>
    </nav>
  )
}

export default Nav
