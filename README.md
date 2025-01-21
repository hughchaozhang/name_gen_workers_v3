# 中文姓名生成器 (Chinese Name Generator)

这是一个智能化的英文转中文姓名推荐系统，专门为外国友人提供富有文化内涵和个性化的中文名字选择服务。

## 项目特点

- 智能化名字生成：基于用户的英文名智能推荐中文名字
- 文化解读：每个名字都附带详细的文化内涵解释
- 双语支持：所有解释均提供中英文对照
- 云端部署：后端部署在 Cloudflare Workers，前端部署在 Cloudflare Pages

## 技术架构

### 后端 (Backend)
- 框架：Hono.js
- 部署：Cloudflare Workers
- API 接口：
  - POST /api/generate
    - 输入：英文名（firstName 或 firstName + lastName）
    - 输出：3个中文名字方案，每个方案包含详细解释
  - GET /api/stats
    - 功能：获取名字生成统计信息
    - 输出：当前已生成的名字总数

### 前端 (Frontend)
- 框架：Hono.js (计划中)
- 部署：Cloudflare Pages (计划中)
- 特点：简洁直观的用户界面

## API 接口说明

### 生成名字 (POST /api/generate)

#### 请求格式
```json
{
  "firstName": "string",
  "lastName": "string"  // 可选
}
```

#### 响应格式
```json
{
  "names": [
    {
      "chineseName": "string",      // 中文名字
      "pinyin": "string",           // 拼音（带声调）
      "meaning": "string",          // 整体含义
      "culturalReference": "string", // 文化内涵
      "englishMeaning": "string"    // 英文解释
    }
  ]
}
```

### 获取统计信息 (GET /api/stats)

#### 请求格式
- 方法：GET
- 路径：/api/stats
- 参数：无

#### 响应格式
```json
{
  "totalNamesGenerated": number,  // 已生成的名字总数
  "status": "success"
}
```

#### 错误响应
```json
{
  "error": {
    "message": "获取统计信息时发生错误",
    "status": 500
  }
}
```

## 开发指南

### 环境要求
- Node.js
- Bun (包管理器)
- Wrangler CLI (Cloudflare Workers 开发工具)

### 本地开发
1. 安装依赖：
```bash
bun install
```

2. 本地运行：
```bash
bun run dev
```

3. 部署到 Cloudflare Workers：
```bash
bun run deploy
```

## 项目状态
- [x] 后端框架搭建
- [ ] 后端 API 开发
- [ ] 后端部署
- [ ] 前端开发
- [ ] 前端部署

## 联系方式
如有问题或建议，请通过 Issues 与我们联系。

# Chinese Name Generator API

一个基于 Cloudflare Workers 和 AI 的中文姓名生成器 API。该服务可以根据英文名智能生成匹配的中文名字，并提供详细的文化解释。

## 特点

- 基于英文名智能推荐中文名字
- 每次生成三种不同风格的名字：
  - 传统文雅风格
  - 现代活力风格
  - 幽默诙谐风格
- 提供详细的文化解释：
  - 完整的拼音标注
  - 字义详解
  - 文化典故
  - 英文翻译
- 基于 Cloudflare Workers 部署，全球快速访问
- 内置请求验证和错误处理

## API 文档

### 生成名字

**请求**

```http
POST /api/generate
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string"  // 可选
}
```

**响应**

```json
{
  "names": [
    {
      "chineseName": "中文名字",
      "pinyin": "拼音（带声调）",
      "meaning": "字义解析",
      "culturalReference": "文化典故",
      "englishMeaning": "英文解释"
    }
  ]
}
```

### 获取统计信息

**请求**

```http
GET /api/stats
```

**响应**

```json
{
  "totalNamesGenerated": number,  // 已生成的名字总数
  "status": "success"
}
```

### 示例

**请求**
```bash
curl -X POST https://xxxxxxxx.hughzhang.workers.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{"firstName": "William"}'
```

**响应**
```json
{
  "names": [
    {
      "chineseName": "魏文澜",
      "pinyin": "Wèi Wénlán",
      "meaning": "魏，姓氏，与William的W音相近；文，指文化、文学，象征博学多才；澜，指大波浪，象征波澜壮阔的人生。",
      "culturalReference": "文澜二字出自《诗经·小雅·鹿鸣之什·文王》：'文王在上，于昭于天。'",
      "englishMeaning": "Cultured and magnificent"
    }
    // ... 更多名字选项
  ]
}
```

## 技术架构

- **框架**: [Hono](https://hono.dev/) - 轻量级的 Web 框架
- **部署**: Cloudflare Workers
- **开发语言**: TypeScript
- **包管理器**: Bun

### 项目结构

```
src/
├── constants/     # 系统常量和提示词
├── middleware/    # 中间件（验证、错误处理）
├── services/      # 业务逻辑
└── types/         # TypeScript 类型定义
```

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/hughchaozhang/name_gen_workers_v3.git
cd name_gen_workers_v3
```

2. 安装依赖
```bash
bun install
```

3. 本地运行
```bash
bun run dev
```

4. 部署
```bash
bun run deploy
```

## 环境变量

项目使用以下环境变量：

- `ENVIRONMENT`: 运行环境 ('development' 或 'production')
- `AI_API_ENDPOINT`: AI API 的端点
- `AI_API_KEY`: AI 服务的 API 密钥（仅生产环境需要）

## 生产环境

生产环境 API 地址：https://xxxxxxx.hughzhang.workers.dev

## 开发者

- Hugh Zhang ([@hughchaozhang](https://github.com/hughchaozhang))

## 许可证

MIT License