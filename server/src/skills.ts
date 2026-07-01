import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';

// 定义技能参数
export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description?: string;
  required: boolean;
}

// 定义技能接口
export interface Skill {
  name: string;
  description: string;
  parameters: SkillParameter[];
  execute: (params: Record<string, any>) => Promise<string>;
}

// 新增技能
export const registeredSkills: Skill[] = [];

// 文件根目录统一配置
const DOC_ROOT = path.join(process.cwd(), '../docs');
// 工具输出最大长度，防止上下文溢出
const MAX_TOOL_OUTPUT = 3000;

// 技能1：获取系统信息
const systemInfoSkill: Skill = {
  name: 'get_system_info',
  description:
    '获取当前服务器的系统信息，包括操作系统、CPU、内存、Node.js版本等',
  parameters: [],
  execute: async () => {
    try {
      const info = {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        hostname: os.hostname(),
        uptime: `${(os.uptime() / 3600).toFixed(2)} 小时`,
      };
      const res = JSON.stringify(info, null, 2);
      return res.length > MAX_TOOL_OUTPUT
        ? res.slice(0, MAX_TOOL_OUTPUT) + '\n...内容过长已截断'
        : res;
    } catch (e) {
      return `获取系统信息失败：${e as Error}.message`;
    }
  },
};

// 技能2：读取本地文件内容
const readFileSkill: Skill = {
  name: 'read_file',
  description: '读取本地指定路径的文件内容，仅允许读取项目../docs目录内文件',
  parameters: [
    {
      name: 'filePath',
      type: 'string',
      description: '文件相对路径',
      required: true,
    },
  ],
  execute: async (params) => {
    const { filePath } = params;
    if (!filePath || typeof filePath !== 'string')
      return '参数错误：filePath 必填字符串';
    const absolutePath = path.join(DOC_ROOT, filePath);
    if (!absolutePath.startsWith(DOC_ROOT))
      return '错误：禁止访问项目docs目录外文件';

    try {
      const content = await fs.readFile(absolutePath, 'utf-8');
      let output = `文件读取成功【${filePath}】：\n${content}`;
      if (output.length > MAX_TOOL_OUTPUT) {
        output = output.slice(0, MAX_TOOL_OUTPUT) + '\n...文件内容过长已截断';
      }
      return output;
    } catch (e) {
      return `获取文件失败：${e as Error}.message`;
    }
  },
};

// 技能3：写入内容到本地文件
const writeFileSkill: Skill = {
  name: 'write_file',
  description: '写入内容到本地指定路径文件，仅允许写入项目../docs目录内文件',
  parameters: [
    {
      name: 'filePath',
      type: 'string',
      description: '文件相对路径',
      required: true,
    },
    {
      name: 'content',
      type: 'string',
      description: '写入文本内容',
      required: true,
    },
  ],
  execute: async (params) => {
    const { filePath, content } = params;
    if (!filePath || !content) return '参数错误：filePath、content均为必填';
    const absolutePath = path.resolve(DOC_ROOT, filePath);
    if (!absolutePath.startsWith(DOC_ROOT))
      return '错误：禁止访问项目docs目录外文件';

    try {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, 'utf-8');
      return `文件写入成功，相对路径：${filePath}`;
    } catch (e) {
      return `写入文件失败：${(e as Error).message}`;
    }
  },
};

// 注册所有内置技能
registeredSkills.push(systemInfoSkill, readFileSkill, writeFileSkill);
