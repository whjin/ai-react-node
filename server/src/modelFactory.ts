import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// 模型类型枚举
export type ModelType =
  | 'zhipu'
  | 'tongyi'
  | 'kimi'
  | 'doubao'
  | 'deepseek'
  | 'hunyuan';

interface ModelConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

// 模型映射
const modelConfigs: Record<ModelType, ModelConfig> = {
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY || '',
    baseURL: process.env.ZHIPU_BASE_URL || '',
    model: process.env.ZHIPU_MODEL || '',
  },
  tongyi: {
    apiKey: process.env.TONGYI_API_KEY || '',
    baseURL: process.env.TONGYI_BASE_URL || '',
    model: process.env.TONGYI_MODEL || '',
  },
  kimi: {
    apiKey: process.env.KIMI_API_KEY || '',
    baseURL: process.env.KIMI_BASE_URL || '',
    model: process.env.KIMI_MODEL || '',
  },
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY || '',
    baseURL: process.env.DOUBAO_BASE_URL || '',
    model: process.env.DOUBAO_MODEL || '',
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: process.env.DEEPSEEK_BASE_URL || '',
    model: process.env.DEEPSEEK_MODEL || '',
  },
  hunyuan: {
    apiKey: process.env.HUNYUAN_API_KEY || '',
    baseURL: process.env.HUNYUAN_BASE_URL || '',
    model: process.env.HUNYUAN_MODEL || '',
  },
};

// 客户端缓存，服用实例
const clientCache = new Map<ModelType, { client: OpenAI; modelName: string }>();

// 模型工厂
export class ModelFactory {
  // 创建模型客户端
  static createClient(modelType: ModelType): {
    client: OpenAI;
    modelName: string;
  } {
    if (clientCache.has(modelType)) return clientCache.get(modelType)!;

    const config = modelConfigs[modelType];
    if (!config.apiKey)
      throw new Error(`模型【${modelType}】缺少API密钥，请配置环境变量`);
    if (!config.model) {
      throw new Error(`模型【${modelType}】未配置模型名称`);
    }

    // 强制补全/v1路由，兼容国产模型接口
    const fixedBaseUrl = config.baseURL.endsWith('/v1')
      ? config.baseURL
      : `${config.baseURL}/v1`;

    const instance = {
      client: new OpenAI({
        apiKey: config.apiKey,
        baseURL: fixedBaseUrl,
      }),
      modelName: config.model,
    };
    clientCache.set(modelType, instance);
    return instance;
  }

  // 默认模型
  static getDefaultModelType(): ModelType {
    const defaultType = process.env.DEFAULT_MODEL_TYPE as ModelType;
    if (Object.keys(modelConfigs).includes(defaultType)) return defaultType;
    return 'tongyi';
  }

  // 获取所有模型列表
  static getSupportedModels(): ModelType[] {
    return Object.keys(modelConfigs) as ModelType[];
  }

  // 预校验所有模型配置，启动自检
  static validateAllConfigs(): string[] {
    const errors: string[] = [];
    (Object.keys(modelConfigs) as ModelType[]).forEach((key) => {
      const cfg = modelConfigs[key];
      if (!cfg.apiKey) errors.push(`【${key}】未配置API_KEY`);
      if (!cfg.baseURL) errors.push(`【${key}】未配置BASE_URL`);
      if (!cfg.model) errors.push(`【${key}】未配置MODEL名称`);
    });
    return errors;
  }
}
