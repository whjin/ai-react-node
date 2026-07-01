import OpenAI from 'openai';

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
    apiKey: process.env.VITE_ZHIPU_API_KEY || '',
    baseURL: process.env.VITE_ZHIPU_BASE_URL || '',
    model: process.env.VITE_ZHIPU_MODEL || '',
  },
  tongyi: {
    apiKey: process.env.VITE_TONGYI_API_KEY || '',
    baseURL: process.env.VITE_TONGYI_BASE_URL || '',
    model: process.env.VITE_TONGYI_MODEL || '',
  },
  kimi: {
    apiKey: process.env.VITE_KIMI_API_KEY || '',
    baseURL: process.env.VITE_KIMI_BASE_URL || '',
    model: process.env.VITE_KIMI_MODEL || '',
  },
  doubao: {
    apiKey: process.env.VITE_DOUBAO_API_KEY || '',
    baseURL: process.env.VITE_DOUBAO_BASE_URL || '',
    model: process.env.VITE_DOUBAO_MODEL || '',
  },
  deepseek: {
    apiKey: process.env.VITE_DEEPSEEK_API_KEY || '',
    baseURL: process.env.VITE_DEEPSEEK_BASE_URL || '',
    model: process.env.VITE_DEEPSEEK_MODEL || '',
  },
  hunyuan: {
    apiKey: process.env.VITE_HUNYUAN_API_KEY || '',
    baseURL: process.env.VITE_HUNYUAN_BASE_URL || '',
    model: process.env.VITE_HUNYUAN_MODEL || '',
  },
};

// 客户端缓存，复用实例
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
    return 'zhipu';
  }

  // 获取所有模型列表
  static getSupportedModels(): ModelType[] {
    return Object.keys(modelConfigs) as ModelType[];
  }
}
