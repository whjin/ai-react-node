import logo from '@/assets/images/react.svg';
import styles from './Sign.module.scss';

export default function Sign() {
  return (
    <>
      <header>
        <img src={logo} className={styles.logo} alt="logo" />
        <h1 className={styles.title}>
          可跨网络通信，支持本机与远程进程交互，后端服务器与前端服务端交互
        </h1>
      </header>
    </>
  );
}
