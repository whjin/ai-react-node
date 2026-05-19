import React, { useContext } from 'react';
import { appContext } from '../../AppState';
import { withAddToCart } from './AddToCart';

export interface RobotProps {
  id: string | number;
  name: string;
  email: string;
  addToCart: (id: RobotProps['id'], name: RobotProps['name']) => void;
}

const Robot: React.FC<RobotProps> = ({ id, name, email, addToCart }) => {
  const value = useContext(appContext);

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

export default withAddToCart(Robot);
