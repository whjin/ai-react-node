import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Sign from '../pages/Sign/Sign';
import Exception from '../pages/Exception/Exception';
import Apply from '../pages/Apply/Apply';
import Check from '../pages/Check/Check';
import Login from '../pages/Login/Login';
import NotFound from '../pages/NotFound/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    Component: Home,
    handle: { title: '首页' },
    children: [
      {
        path: 'sign',
        Component: Sign,
        handle: { title: '签到' },
      },
      {
        path: 'exception',
        Component: Exception,
        handle: { title: '异常' },
      },
      {
        path: 'apply',
        Component: Apply,
        handle: { title: '申请' },
      },
      {
        path: 'check',
        Component: Check,
        handle: { title: '检查' },
      },
    ],
  },
  {
    path: '/login',
    Component: Login,
    handle: { title: '登录' },
  },
  {
    path: '*',
    Component: NotFound,
    handle: { title: '404' },
  },
];

const router = createBrowserRouter(routes);

export default router;
