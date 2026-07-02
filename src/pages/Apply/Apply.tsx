import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Apply.module.scss';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  usedModel?: string;
  toolCalls?: string[];
}

interface WsMessage {
  type: 'assistant_response' | 'error';
  content: string;
  toolCalls?: string[];
  usedModel?: string;
}

interface SupportedModelsResponse {
  code: number;
  data: {
    supportedModels: string[];
    defaultModel: string;
  };
}

const Apply: React.FC = () => {
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [supportedModels, setSupportedModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, []);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handleNewLine = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setUserInput((prev) => prev + '\n');
    setTimeout(autoResize, 0);
  };

  const getSupportedModels = useCallback(async () => {
    try {
      const res = await fetch('/api/models');
      const contentType = res.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        console.error('接口返回格式异常，请检查后端或代理配置');
        return;
      }

      const data: SupportedModelsResponse = await res.json();
      if (data.code === 0) {
        setSupportedModels(data.data.supportedModels);
        setSelectedModel(data.data.defaultModel);
      }
    } catch (e) {
      console.error('获取模型列表失败：', (e as Error).message);
    }
  }, []);

  const initWebSocket = useCallback(() => {
    const wsPath = '/ws';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${wsPath}`;
    const ws = new WebSocket(wsUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket连接成功');
    };

    ws.onmessage = (event) => {
      const message: WsMessage = JSON.parse(event.data);

      if (message.type === 'assistant_response') {
        setMessageList((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: message.content,
            toolCalls: message.toolCalls,
            usedModel: message.usedModel,
          },
        ]);
        setLoading(false);
        scrollToBottom();
      }

      if (message.type === 'error') {
        setMessageList((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: message.content,
          },
        ]);
        setLoading(false);
        scrollToBottom();
      }
    };

    ws.onclose = () => {
      console.log('WebSocket连接关闭，正在重连...');
      wsRef.current = null;
      setTimeout(initWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.log('WebSocket连接异常：', error);
    };

    return () => {
      ws?.close();
    };
  }, [scrollToBottom]);

  const handleSend = useCallback(() => {
    const content = userInput.trim();
    const ws = wsRef.current;

    if (!content || loading || !ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    setMessageList((prev) => [
      ...prev,
      {
        role: 'user',
        content: content,
      },
    ]);

    setTimeout(scrollToBottom, 0);

    ws.send(
      JSON.stringify({
        type: 'user_input',
        content: content,
        model: selectedModel,
      }),
    );

    setUserInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);
  }, [userInput, loading, selectedModel, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Enter' && e.shiftKey) {
      handleNewLine(e);
    }
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    getSupportedModels();
    const cleanup = initWebSocket();

    return () => {
      cleanup();
    };
  }, [getSupportedModels, initWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messageList, scrollToBottom]);

  useEffect(() => {
    autoResize();
  }, [userInput, autoResize]);

  return (
    <div className={styles.applyContainer}>
      <div className={styles.header}>
        <h1 onClick={() => navigate('/')} title="返回首页">
          AI智能助手
        </h1>
        <div className={styles.modelSelector}>
          <span>模型选择：</span>
          <select
            value={selectedModel}
            disabled={loading}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {supportedModels.map((model) => (
              <option key={model} value={model}>
                {model.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.chatContainer} ref={chatContainerRef}>
        {messageList.length === 0 && (
          <div className={styles.emptyTip}>
            <h3>欢迎使用AI智能助手</h3>
            <p>输入你的需求，我会自主调用工具帮你完成任务</p>
          </div>
        )}

        {messageList.map((msg, index) => (
          <div
            key={index}
            className={`${styles.messageItem} ${styles[msg.role]}`}
          >
            <div className={styles.messageHeader}>
              <span className={`${styles.messageRole} ${styles[msg.role]}`}>
                {msg.role === 'user' ? '你' : 'AI智能助手'}
              </span>
              {msg.usedModel && (
                <span className={styles.messageModel}>
                  {msg.usedModel.toUpperCase()}
                </span>
              )}
            </div>

            {msg.toolCalls && msg.toolCalls.length > 0 && (
              <div className={styles.toolTags}>
                {msg.toolCalls.map((tool, i) => (
                  <span key={i} className={styles.toolTag}>
                    调用工具：{tool}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.messageItem} ${styles.assistant}`}>
            <div className={styles.messageHeader}>
              <span className={`${styles.messageRole} ${styles.assistant}`}>
                AI智能助手
              </span>
              <span className={styles.loading}></span>
            </div>
            <div className={styles.messageContent}>思考中...</div>
          </div>
        )}
      </div>

      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={userInput}
            placeholder="输入你的需求，按Enter发送，Shift+Enter换行"
            disabled={loading}
            onKeyDown={handleKeyDown}
            onChange={(e) => setUserInput(e.target.value)}
            rows={1}
          />
          <Button
            type="primary"
            size="large"
            onClick={handleSend}
            disabled={loading || !userInput.trim()}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Apply;
