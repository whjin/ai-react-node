import React, { useState, useEffect } from 'react';
import styles from './Shopping.module.scss';
import ShoppingCart from './ShoppingCart';
import GoodsItem from './GoodsItem';

interface Props {}

interface State {
  shoppingGallary: any[];
}

interface RobotProps {
  id: string | number;
  name: string;
  email: string;
}

const Shopping: React.FC = () => {
  const [shoppingGallary, setRobotGallary] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/users',
        );
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
      <div className={styles.shoppingContainer}>
        <ShoppingCart />
        {!error ||
          (error !== '' && <h2 className={styles.error}>发生错误：{error}</h2>)}
        {!loading ? (
          <ul className={styles.list}>
            {shoppingGallary.map((r: RobotProps) => (
              <GoodsItem id={r.id} name={r.name} email={r.email} key={r.id} />
            ))}
          </ul>
        ) : (
          <h2>加载中...</h2>
        )}
      </div>
    </>
  );
};

export default Shopping;
