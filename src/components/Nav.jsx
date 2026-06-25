import Link from 'next/link';
import { useRouter } from 'next/router';

// bottom nav bar - mobile app style
function Nav() {
  const router = useRouter();
  const path = router.pathname;
  const { id: groupId } = router.query;

  const isHome = path === '/' || path === '/new' || path === '/join';
  const isAdd = path.includes('/add');
  const isHistory = path.includes('/history');

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[65px] bg-card border-t border-border flex justify-around items-center px-2 z-50 sm:rounded-none">
      <Link href="/" className={`flex flex-col items-center justify-center w-full h-full text-text-muted transition-colors ${isHome && !isAdd ? 'text-primary' : ''}`}>
        <span className="text-xl mb-1">🏠</span>
        <span className="text-xs font-medium">Home</span>
      </Link>

      <Link
        href={groupId ? `/group/${groupId}/add` : '/new'}
        className={`flex flex-col items-center justify-center w-full h-full text-text-muted transition-colors ${isAdd ? 'text-primary' : ''}`}
      >
        <span className="text-2xl font-bold leading-none mb-1">+</span>
        <span className="text-xs font-medium">Add</span>
      </Link>

      <Link
        href={groupId ? `/group/${groupId}/history` : '/'}
        className={`flex flex-col items-center justify-center w-full h-full text-text-muted transition-colors ${isHistory ? 'text-primary' : ''}`}
      >
        <span className="text-xl mb-1">📋</span>
        <span className="text-xs font-medium">History</span>
      </Link>
    </nav>
  )
}

export default Nav
