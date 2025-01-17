import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { errorHandler } from './middleware/errorHandler'
import { validateNameRequest } from './middleware/validator'
import { rateLimiter } from './middleware/rateLimiter'  // 导入限流中间件
import { NameGeneratorService } from './services/nameGenerator'
import type Env from './types/env'

const app = new Hono<{ Bindings: Env }>()

// 全局中间件
app.use('*', cors())
app.use('*', prettyJSON())
app.use('*', errorHandler)
app.use('/api/*', rateLimiter)  // 为所有 API 路由添加限流

// favicon 处理
app.get('/favicon.ico', (c) => {
  return c.body(null, 204)
})

// 健康检查接口
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Chinese Name Generator API is running',
    environment: c.env.ENVIRONMENT
  })
})

// 名字生成接口
app.post('/api/generate', validateNameRequest, async (c) => {
  const nameRequest = c.get('nameRequest')
  const nameGenerator = NameGeneratorService.getInstance(c.env)
  const result = await nameGenerator.generateNames(nameRequest)
  return c.json(result)
})

export default app
