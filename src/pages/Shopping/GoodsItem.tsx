import React, { useContext } from 'react';
import { appContext } from '../../AppState';
import { useAddToCart } from './AddToCart';

// Hooks 自定义Hooks
export interface RobotProps {
  id: string | number;
  name: string;
  email: string;
}

const GoodsItem: React.FC<RobotProps> = ({ id, name, email }) => {
  const value = useContext(appContext);
  const addToCart = useAddToCart();
  return (
    <li>
      <img src={`https://robohash.org/${id}`} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      <p>作者：{value.username}</p>
      <button onClick={() => addToCart(id, name)}>加入购物车</button>
    </li>
  );
};
export default GoodsItem;
