import OpenAI from 'openai';
import dotenv from 'dotenv';
import { loadSession, saveSession, Message } from './memory';
import { registeredSkills } from './skills';
import { ModelFactory, ModelType } from './modelFactory';
dotenv.config();

// 定义与 OpenAI SDK 兼容的消息类型
type ChatCompletionMessageParam = OpenAI.ChatCompletionMessageParam;

// 缓存系统提示词，避免缓存重复生成
let cacheSystemPrompt: string | null = null;

// 构建系统提示词，告知 Agent 自身能力、规则和可用工具
function buildSystemPrompt(): string {
  if (cacheSystemPrompt) return cacheSystemPrompt;

  // 生成工具描述
  const toolDescriptions = registeredSkills
    .map((skill) => {
      const paramsDesc = skill.parameters
        .map(
          (p) =>
            `${p.name}(${p.type}): ${p.description || ''}${p.required ? '（必填）' : ''}`,
        )
        .join('；');
      return `- ${skill.name}：${skill.description}\n  参数：${paramsDesc}`;
    })
    .join('\n\n');

  cacheSystemPrompt = `
    你是一个基于Agent架构的本地智能助手，你的任务是根据用户的问题和上下文，调用以下工具来回答用户的问题。

    【你拥有的工具能力】
    ${toolDescriptions}

    【核心规则】
    1. 你可以根据用户需求，自主判断并调用任意工具，不需要提前询问用户
    2. 调用工具时，必须严格按照参数要求传入正确的参数值
    3. 工具执行完成后，你会拿到工具返回的结果，基于结果继续处理任务，直到完成用户的全部需求
    4. 所有操作都在用户的本地机器上执行，严格遵守安全限制，禁止执行高危操作
    5. 最终给用户的回复要简洁明了，不要暴露工具调用的底层细节

    当前时间：${new Date().toLocaleString('zh-CN')}
    `;

  return cacheSystemPrompt;
}

// 将内部 Message 类型转换为 OpenAI 兼容的消息类型
function convertToOpenAIMessages(
  messages: Message[],
): ChatCompletionMessageParam[] {
  return messages.map((msg) => {
    if (msg.role === 'tool') {
      return {
        role: 'tool',
        content: msg.content,
        tool_call_id: msg.tool_call_id!,
        name: msg.name!,
      };
    }
    if (msg.role === 'assistant' && msg.tool_call_id) {
      return {
        role: 'assistant',
        content: msg.content || null,
        tool_calls: [
          {
            id: msg.tool_call_id,
            type: 'function',
            function: { name: msg.name || '', arguments: '' },
          },
        ],
      };
    }
    return { role: msg.role, content: msg.content };
  });
}

// Agent执行核心函数
export async function runAgent(
  sessionId: string,
  userInput: string,
  modelType?: ModelType,
): Promise<{
  finalResponse: string;
  toolCalls: string[];
  usedModel: ModelType;
}> {
  // 启动配置自检
  const configErrors = ModelFactory.validateAllConfigs();
  if (configErrors.length > 0) {
    return {
      finalResponse: `模型配置异常：${configErrors.join('；')}`,
      toolCalls: [],
      usedModel: modelType || ModelFactory.getDefaultModelType(),
    };
  }

  // 1. 选择模型，创建客户端
  const selectedModel = modelType || ModelFactory.getDefaultModelType();
  const { client: llm, modelName } = ModelFactory.createClient(selectedModel);

  // 2. 加载会话，处理用户输入
  const session = await loadSession(sessionId);
  session.messages.push({ role: 'user', content: userInput });

  // 工具调用记录
  const toolCallHistory: string[] = [];
  // 最大循环次数，防止无限调用
  const MAX_LOOP_COUNT = 10;
  let currentLoop = 0;
  // 防止死循环：记录连续重复工具调用
  const recentToolStack: string[] = [];

  // 3. Agent核心循环：思考->调用工具->处理结果->再思考，直到任务完成
  while (currentLoop < MAX_LOOP_COUNT) {
    currentLoop++;

    try {
      // 3.1 调用模型，传入对话历史和工具定义
      const response = await llm.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...convertToOpenAIMessages(session.messages),
        ],
        tools: registeredSkills.map((skill) => ({
          type: 'function',
          function: {
            name: skill.name,
            description: skill.description,
            parameters: {
              type: 'object',
              properties: Object.fromEntries(
                skill.parameters.map((p) => [
                  p.name,
                  { type: p.type, description: p.description },
                ]),
              ),
              required: skill.parameters
                .filter((p) => p.required)
                .map((p) => p.name),
            },
          },
        })),
        tool_choice: 'auto',
        temperature: 0.3,
      });

      // 3.2 处理模型回复
      const assistantMsg = response.choices[0].message;
      session.messages.push({
        role: 'assistant',
        content: assistantMsg.content || '',
        tool_call_id: assistantMsg.tool_calls?.[0]?.id,
        name: (assistantMsg.tool_calls?.[0] as any)?.function.name,
      });

      // 3.3 无工具调用，任务完成，退出循环
      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        await saveSession(session);
        return {
          finalResponse:
            assistantMsg.content || '未能生成有效回答，请重新描述需求',
          toolCalls: toolCallHistory,
          usedModel: selectedModel,
        };
      }

      // 3.4 处理工具调用
      for (const toolCall of assistantMsg.tool_calls) {
        const skillName = (toolCall as any).function.name;
        const skill = registeredSkills.find((s) => s.name === skillName);
        recentToolStack.push(skillName);
        // 防止死循环：同一工具连续调用2次直接终止流程
        const lastTwo = recentToolStack.slice(-2);
        if (lastTwo.length === 2 && lastTwo[0] === lastTwo[1]) {
          session.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: skillName,
            content: `已连续2次调用${skillName}，停止重复查询，基于现有信息回答用户`,
          });
          continue;
        }

        if (!skill) {
          // 工具不存在，返回错误信息
          session.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: skillName,
            content: `错误：不存在【${skillName}】这个工具`,
          });
          continue;
        }

        // 记录工具调用
        toolCallHistory.push(skillName);

        // 解析工具参数
        let params: Record<string, any> = {};
        try {
          params = JSON.parse((toolCall as any).function.arguments || '{}');
        } catch (e) {
          session.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: skillName,
            content: `参数解析失败：${(e as Error).message}`,
          });
          continue;
        }

        // 校验必填参数
        const missingParams = skill.parameters
          .filter((p) => p.required && !(p.name in params))
          .map((p) => p.name);
        if (missingParams.length > 0) {
          session.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: skillName,
            content: `工具缺少必填参数：${missingParams.join(',')}`,
          });
          continue;
        }

        // 执行技能
        const skillResult = await skill.execute(params);
        // 将工具执行结果加入对话历史
        session.messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: skillName,
          content: skillResult,
        });
      }
    } catch (e) {
      const errorMsg = `Agent执行异常：${(e as Error).message}`;
      await saveSession(session);
      return {
        finalResponse: errorMsg,
        toolCalls: toolCallHistory,
        usedModel: selectedModel,
      };
    }
  }

  // 超出最大循环次数
  await saveSession(session);

  return {
    finalResponse:
      '任务执行轮次达到上限，已终止工具调用，请基于现有结果查看回答',
    toolCalls: toolCallHistory,
    usedModel: selectedModel,
  };
}
