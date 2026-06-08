import styles from './Home.module.scss';
import App from '../../App';
import AI from '../AI/AI';
import { Outlet, useLocation } from 'react-router-dom';

export default function Home() {
  const { pathname } = useLocation();
  const isHomeRoot = pathname === '/';

  return (
    <>
      {isHomeRoot && (
        <>
          <AI />
          <App />
        </>
      )}
      {
        <div className={styles.outletContainer}>
          <Outlet />
        </div>
      }
    </>
  );
}
