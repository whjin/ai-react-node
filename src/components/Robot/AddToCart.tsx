import React, { useContext } from 'react';
import { appSetStateContext } from '../../AppState';
import { type RobotProps } from './index';

export const withAddToCart = (
  ChildComponent: React.ComponentType<RobotProps>,
) => {
  return (props: RobotProps) => {
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
    return <ChildComponent {...props} addToCart={addToCart} />;
  };
};
