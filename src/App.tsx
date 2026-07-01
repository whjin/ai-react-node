import React from 'react';
import './App.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const { pathname } = useLocation();
  const isLoginPage = pathname === '/login';
  const is404Page = pathname.includes('404');

  const navigate = useNavigate();

  return (
    <Layout
      className="app-layout"
      style={{ margin: 0, padding: 0, width: '100%' }}
    >
      {!isLoginPage && !is404Page && (
        <Header className="app-header">
          <h1 onClick={() => navigate('/')} title="返回首页">
            系统首页
          </h1>
        </Header>
      )}
      <Content className="app-content">
        <Outlet />
      </Content>
      {!isLoginPage && !is404Page && (
        <Footer className="app-footer">
          系统版权信息 ©{new Date().getFullYear()}
        </Footer>
      )}
    </Layout>
  );
};

export default App;
