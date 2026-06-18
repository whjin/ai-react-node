import React from 'react';
import styles from './ShoppingCard.module.scss';
import { FaShoppingCart } from 'react-icons/fa';
import { appContext } from '../../AppState';

interface Props {}

interface State {
  isOpen: boolean;
}

class ShoppingCart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  toggleCart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if ((e.target as HTMLElement).nodeName === 'SPAN') {
      this.setState({
        isOpen: !this.state.isOpen,
      });
    }
  };

  render() {
    return (
      <appContext.Consumer>
        {(value) => {
          return (
            <div className={styles.shoppingCart}>
              <button onClick={this.toggleCart}>
                <FaShoppingCart />
                <span>购物车 {value.shoppingCart.items.length}（件）</span>
              </button>
              <div
                style={{
                  display:
                    this.state.isOpen && value.shoppingCart.items.length > 0
                      ? 'block'
                      : 'none',
                }}
              >
                <ol>
                  {value.shoppingCart.items.map((i) => (
                    <li key={i.id}>{i.name}</li>
                  ))}
                </ol>
              </div>
            </div>
          );
        }}
      </appContext.Consumer>
    );
  }
}

export default ShoppingCart;
