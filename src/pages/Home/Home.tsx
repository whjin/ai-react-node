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
          <details>
            <summary>AI流式输出</summary>
            <AI />
          </details>
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
