import React from 'react';
import './App.css';
import './styles/normalize.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const { pathname } = useLocation();
  const isLoginPage = pathname === '/login';
  const isHidePage = ['/404', '/apply'].includes(pathname);

  const navigate = useNavigate();

  return (
    <Layout
      className="app-layout"
      style={{ margin: 0, padding: 0, width: '100%' }}
    >
      {!isLoginPage && !isHidePage && (
        <Header className="app-header">
          <h1 onClick={() => navigate('/')} title="返回首页">
            首页
          </h1>
        </Header>
      )}
      <Content
        className={`app-content ${isHidePage ? 'hide-page-content' : ''}`}
      >
        <Outlet />
      </Content>
      {!isLoginPage && !isHidePage && (
        <Footer className="app-footer">
          版权信息 ©{new Date().getFullYear()}
          <a
            href="https://wuhuajin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: '4px' }}
          >
            吴华锦
          </a>
        </Footer>
      )}
    </Layout>
  );
};

export default App;
