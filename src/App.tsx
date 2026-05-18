import React from 'react';
import './App.css';
import './styles/index.scss';
import logo from './assets/images/react.svg';
import AIApp from './pages/Home/Ai';
import Robot from './components/Robot';
import robotsdata from './mock/robots.json';
import robotStyles from './components/Robot/Robot.module.scss';
import ShoppingCart from './components/Robot/ShoppingCart';

interface Props {}

interface State {
  robotGallary: any[];
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      robotGallary: [],
    };
  }

  componentDidMount() {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((response) => response.json())
      .then((data) => this.setState({ robotGallary: data }));
  }
  render() {
    return (
      <>
        <AIApp />
        <div className={robotStyles.robotContainer}>
          <header>
            <img src={logo} className={robotStyles.logo} alt="logo" />
            <h1 className={robotStyles.title}>可跨网络通信，支持本机与远程进程交互，后端服务器与前端服务端交互</h1>
          </header>
          <ShoppingCart />
          <ul className={robotStyles.list}>
            {this.state.robotGallary.map((r) => (
              <Robot id={r.id} name={r.name} email={r.email} key={r.id} />
            ))}
          </ul>
        </div>
      </>
    );
  }
}

export default App;
