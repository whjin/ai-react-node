import { useContext } from 'react';
import { appSetStateContext } from '../../AppState';
import { type RobotProps } from './GoodsItem';

export const useAddToCart = () => {
  const setState = useContext(appSetStateContext);
  const addToCart = (id: RobotProps['id'], name: RobotProps['name']) => {
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
  return addToCart;
};
