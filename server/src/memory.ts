import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatTime } from '../utils/util';

// 获取当前目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 会话存储目录
export const SESSION_DIR = path.join(__dirname, '../sessions');

// 消息类型
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

// 会话类型
export interface Session {
  sessionId: string;
  createTime: number | string;
  updateTime: number | string;
  messages: Message[];
}

// 初始化会话目录
async function initSessionDir() {
  try {
    await fs.access(SESSION_DIR);
  } catch (e) {
    await fs.mkdir(SESSION_DIR, { recursive: true });
  }
}

// 加载会话，不存在则创建会话
export async function loadSession(sessionId: string): Promise<Session> {
  await initSessionDir();
  const sessionPath = path.join(SESSION_DIR, `${sessionId}.json`);

  try {
    const raw = await fs.readFile(sessionPath, 'utf-8');
    const session = JSON.parse(raw) as Session;
    if (session.messages.length > 50) {
      session.messages = session.messages.slice(-30);
    }
    return session;
  } catch (e) {
    const now = formatTime(Date.now());
    const newSession: Session = {
      sessionId,
      createTime: now,
      updateTime: now,
      messages: [],
    };
    await saveSession(newSession);
    return newSession;
  }
}

// 保存会话到本地文件
export async function saveSession(session: Session): Promise<void> {
  await initSessionDir();
  session.updateTime = formatTime(Date.now());
  const sessionPath = path.join(SESSION_DIR, `${session.sessionId}.json`);
  await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
}

// 删除会话
export async function deleteSession(sessionId: string): Promise<void> {
  const sessionPath = path.join(SESSION_DIR, `${sessionId}.json`);
  try {
    await fs.unlink(sessionPath);
  } catch (e) {
    console.error(`删除会话【${sessionId}】失败：${(e as Error).message}`);
  }
}
