import React, { useContext } from 'react';
import { appContext, appSetStateContext } from '../../AppState';

interface RobotProps {
  id: string | number;
  name: string;
  email: string;
}

const Robot: React.FC<RobotProps> = ({ id, name, email }) => {
  const value = useContext(appContext);
  const setState = useContext(appSetStateContext);
  const addToCart = () => {
    setState &&
      setState((state) => {
        return {
          ...state,
          shoppingCart: {
            items: [...state.shoppingCart.items, { id, name }],
          },
        };
      });
  };
  return (
    <li>
      <img src={`https://robohash.org/${id}`} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      <p>作者：{value.username}</p>
      <button onClick={addToCart}>加入购物车</button>
    </li>
  );
};

export default Robot;
