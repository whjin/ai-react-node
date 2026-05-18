import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/index.scss';
import logo from './assets/images/react.svg';
import AIApp from './pages/Home/Ai';
import Robot from './components/Robot';
import robotStyles from './components/Robot/Robot.module.scss';
import ShoppingCart from './components/Robot/ShoppingCart';

interface Props {}

interface State {
  robotGallary: any[];
}

interface RobotProps {
  id: string | number;
  name: string;
  email: string;
}

const App: React.FC = (props) => {
  const [robotGallary, setRobotGallary] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
        setRobotGallary(data);
      } catch (e) {
        setError((e as Error).message || '发生未知错误');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <AIApp />
      <div className={robotStyles.robotContainer}>
        <header>
          <img src={logo} className={robotStyles.logo} alt="logo" />
          <h1 className={robotStyles.title}>可跨网络通信，支持本机与远程进程交互，后端服务器与前端服务端交互</h1>
        </header>
        <ShoppingCart />
        {!error || (error !== '' && <h2 className={robotStyles.error}>发生错误：{error}</h2>)}
        {!loading ? (
          <ul className={robotStyles.list}>
            {robotGallary.map((r: RobotProps) => (
              <Robot id={r.id} name={r.name} email={r.email} key={r.id} />
            ))}
          </ul>
        ) : (
          <h2>加载中...</h2>
        )}
      </div>
    </>
  );
};

export default App;
