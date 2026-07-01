import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home/Home';
import Sign from '../pages/Sign/Sign';
import Exception from '../pages/Exception/Exception';
import Apply from '../pages/Apply/Apply';
import Check from '../pages/Check/Check';
import Login from '../pages/Login/Login';
import NotFound from '../pages/NotFound/NotFound';
import AI from '../pages/AI/AI';
import Shopping from '../pages/Shopping/Shopping';

const routes: RouteObject[] = [
  {
    path: '/',
    Component: App,
    handle: { title: '布局容器', auth: false },
    children: [
      {
        index: true,
        Component: Home,
        handle: { title: '首页', auth: false, icon: 'home' },
      },
      {
        path: 'sign',
        Component: Sign,
        handle: { title: '签到', auth: true, icon: 'sign' },
      },
      {
        path: 'exception',
        Component: Exception,
        handle: { title: '异常', auth: false, icon: 'exception' },
      },
      {
        path: 'apply',
        Component: Apply,
        handle: { title: '申请', auth: true, icon: 'apply' },
      },
      {
        path: 'check',
        Component: Check,
        handle: { title: '检查', auth: true, icon: 'check' },
      },
      {
        path: 'ai',
        Component: AI,
        handle: { title: 'AI智能助手', auth: false, icon: 'ai' },
      },
      {
        path: 'shopping',
        Component: Shopping,
        handle: { title: '购物商城', auth: false, icon: 'shopping' },
      },
    ],
  },
  {
    path: '/login',
    Component: Login,
    handle: { title: '登录', auth: false, icon: 'login' },
  },
  {
    path: '*',
    Component: NotFound,
    handle: { title: '404', auth: false },
  },
];

const router = createBrowserRouter(routes);

export default router;
