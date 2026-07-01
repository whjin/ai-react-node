import { useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';
import { Button, Card, Space } from 'antd';

export default function Home() {
  const navigate = useNavigate();

  const gotoPage = (path: string) => {
    navigate(path);
  };

  return (
    <div className={styles.homeContainer}>
      <Card title="自定义字体/签到" className={styles.card}>
        <Space>
          <Button type="primary" onClick={() => gotoPage('/sign')}>
            签到功能
          </Button>
        </Space>
      </Card>
      <Card title="AI流式输出" className={styles.card}>
        <Space>
          <Button type="primary" onClick={() => gotoPage('/ai')}>
            AI智能助手
          </Button>
        </Space>
      </Card>
      <Card title="购物商城" className={styles.card}>
        <Space>
          <Button type="primary" onClick={() => gotoPage('/shopping')}>
            进入购物商城
          </Button>
        </Space>
      </Card>
      <Card title="系统功能" className={styles.card}>
        <Space wrap>
          <Button onClick={() => gotoPage('/exception')}>异常管理</Button>
          <Button onClick={() => gotoPage('/apply')}>申请处理</Button>
          <Button onClick={() => gotoPage('/check')}>检查功能</Button>
        </Space>
      </Card>
    </div>
  );
}
