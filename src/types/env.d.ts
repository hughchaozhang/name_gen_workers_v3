interface Env {
  // 环境变量
  ENVIRONMENT: string;
  AI_API_ENDPOINT: string;
  AI_API_KEY: string;
  NAME_GEN_KV: KVNamespace;  // 添加 KV 存储
}

export default Env;
