import React from 'react';
import styles from './ShoppingCard.module.scss';
import { FaShoppingCart } from 'react-icons/fa';

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
      <div className={styles.shoppingCart}>
        <button onClick={this.toggleCart}>
          <FaShoppingCart />
          <span>购物车 2 （件）</span>
        </button>
        <div style={{ display: this.state.isOpen ? 'block' : 'none' }}>
          <ul>
            <li>robot 1</li>
            <li>robot 2</li>
          </ul>
        </div>
      </div>
    );
  }
}

export default ShoppingCart;
