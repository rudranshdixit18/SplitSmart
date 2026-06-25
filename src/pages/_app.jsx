import '../styles/globals.css';
import Nav from '../components/Nav';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const showNav = router.pathname.startsWith('/group/');

  return (
    <div className="min-h-screen pb-[80px]">
      <Component {...pageProps} />
      {showNav && <Nav />}
    </div>
  );
}

export default MyApp;
