import { useState, useRef, useEffect } from 'react';
import styles from './AI.module.scss';

export default function AI() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('未连接');
  const eventSourceRef = useRef<EventSource | null>(null);

  const startSSEStream = async () => {
    setIsStreaming(true);
    setMessages([]);

    const connect = () => {
      setConnectionStatus('正在连接');

      const eventSource = new EventSource('http://localhost:3001/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnectionStatus('已连接');
      };

      eventSource.addEventListener('complete', () => {
        eventSource.close();
        handleStop();
        setConnectionStatus('已完成');
      });

      eventSource.onmessage = (event) => {
        const cleanData = event.data.replace(/[\u00A0]/g, ' ').trim();
        const parseData = JSON.parse(cleanData);
        setMessages((prev) => [...prev, parseData.content]);
      };

      eventSource.onerror = (error) => {
        console.error('SSE: 连接错误', error);
        setConnectionStatus('连接断开，等待自动重连');
      };
    };

    connect();
  };

  const handleStart = async () => {
    startSSEStream();
  };

  const handleStop = () => {
    setIsStreaming(false);
    setConnectionStatus('未连接');

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      handleStop();
    };
  }, []);

  return (
    <div className={styles.aiContainer}>
      <div>
        <button onClick={handleStart} disabled={isStreaming}>
          {isStreaming ? '正在接收数据...' : '开始流式输出'}
        </button>
        <button onClick={handleStop} disabled={!isStreaming}>
          停止
        </button>
        <span style={{ marginLeft: '10px' }}>状态：{connectionStatus}</span>
      </div>
      <div
        className={styles.messageContainer}
        style={{
          color: '#000',
          textAlign: 'left',
          whiteSpace: 'pre-line',
        }}
      >
        {messages.join('')}
      </div>
    </div>
  );
}
