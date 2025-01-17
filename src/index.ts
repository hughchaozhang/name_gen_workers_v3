import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorHandler } from './middleware/errorHandler'
import { validateNameRequest } from './middleware/validator'
import { NameGeneratorService } from './services/nameGenerator'
import type Env from './types/env'

const app = new Hono<{ Bindings: Env }>()

// 添加全局错误处理中间件
app.use('*', errorHandler)

// 添加 CORS 中间件
app.use('*', cors())

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
