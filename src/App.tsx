import './App.css';
import './styles/index.scss';
import logo from './assets/images/react.svg';
import AIApp from './pages/Home/Ai';
import Robot from './components/Robot';
import robotsdata from './mock/robots.json';
import styles from './components/Robot/Robot.module.scss';

function App() {
  return (
    <>
      <AIApp />
      <div className={styles.robotContainer}>
        <header>
          <img src={logo} className={styles.logo} alt='logo' />
          <h1 className={styles.title}>可跨网络通信，支持本机与远程进程交互，后端服务器与前端服务端交互</h1>
        </header>
        <ul className={styles.list}>
          {robotsdata.map(r => (
            <Robot id={r.id} name={r.name} email={r.email} key={r.id} />
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
