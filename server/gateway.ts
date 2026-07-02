import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { runAgent } from './src/agent';
import { ModelFactory, ModelType } from './src/modelFactory';
import { aiMessage } from './mock/ai-message';

// 处理路径（兼容ESModule）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.SERVER_PORT) || 3000;

// 静态文件服务：前端页面
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json());

// 全局配置 CORS（解决跨域问题）
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, last-event-id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/api/models', (req, res) => {
  res.json({
    code: 0,
    data: {
      defaultModel: ModelFactory.getDefaultModelType(),
      supportedModels: ModelFactory.getSupportedModels(),
    },
  });
});

app.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const lastEventId = req.headers['last-event-id'] as string;
  let messageIndex = lastEventId ? parseInt(lastEventId, 10) : 0;

  let flag =
    isNaN(messageIndex) || messageIndex < 0 || messageIndex >= aiMessage.length;
  if (flag) {
    messageIndex = 0;
  }

  res.write(`: This is comment\n`);
  res.write(`retry: 3000\n`);

  const sendMessage = () => {
    if (messageIndex < aiMessage.length) {
      res.write(`id: ${messageIndex + 1}\n`);
      res.write(`event: message\n`);
      res.write(
        `data: ${JSON.stringify({
          content: aiMessage[messageIndex],
        })}\n\n`,
      );

      messageIndex++;

      const delay = Math.floor(Math.random() * 501) + 500;
      setTimeout(sendMessage, delay);
    } else {
      res.write(`id: final\n`);
      res.write(`event: complete\n`);
      res.write(`data: "stream completed"\n\n`);
      res.end();
    }
  };

  sendMessage();

  req.on('close', () => {
    console.log('客户端断开连接');
  });
});

const wss = new WebSocketServer({ server });

// 生成唯一会话ID
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

wss.on('connection', (ws) => {
  // 每个连接生成一个独立的会话ID
  const sessionId = generateSessionId();

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'user_input') {
        const userContent = message.content?.trim();
        const targetModel = message.model as ModelType | undefined;

        if (!userContent) {
          ws.send(
            JSON.stringify({
              type: 'error',
              content: '消息内容不能为空',
            }),
          );
          return;
        }

        // 执行Agent核心逻辑
        const { finalResponse, toolCalls, usedModel } = await runAgent(
          sessionId,
          userContent,
          targetModel,
        );

        // 给客户端返回结果
        ws.send(
          JSON.stringify({
            type: 'assistant_response',
            content: finalResponse,
            toolCalls,
            usedModel,
            timeStamp: Date.now(),
          }),
        );
      }
    } catch (e) {
      ws.send(
        JSON.stringify({
          type: 'error',
          content: '消息处理失败，请重试',
        }),
      );
    }
  });

  ws.on('close', (e) => {
    console.log(`连接关闭，会话ID：${sessionId}`, e);
  });
  ws.on('error', (e) => {
    console.error(`连接异常，会话ID：${sessionId}，错误：`, e);
  });
});

// 启动服务
server.listen(PORT, () => {
  console.log(`
=============================================
智能助手服务启动成功！
服务地址：http://localhost:${PORT}
WebSocket地址：ws://localhost:${PORT}
支持的模型：${ModelFactory.getSupportedModels().join(', ')}
默认模型：${ModelFactory.getDefaultModelType()}
=============================================
  `);
});
