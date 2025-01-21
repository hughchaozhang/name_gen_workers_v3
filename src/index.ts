import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { errorHandler } from './middleware/errorHandler'
import { validateNameRequest } from './middleware/validator'
import { rateLimiter } from './middleware/rateLimiter'
import { NameGeneratorService } from './services/nameGenerator'
import type Env from './types/env'

const app = new Hono<{ Bindings: Env }>()

// 全局中间件
app.use('*', cors())
app.use('*', prettyJSON())
app.use('*', errorHandler)
app.use('/api/*', rateLimiter)

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
  try {
    const body = await c.req.json()
    const nameGenerator = NameGeneratorService.getInstance(c.env)
    const result = await nameGenerator.generateNames({
      firstName: body.firstName,
      lastName: body.lastName
    })
    return c.json(result)
  } catch (error) {
    console.error('Error generating names:', error)
    return c.json({
      error: {
        message: '生成名字时发生错误',
        status: 500
      }
    }, 500)
  }
})

// 统计信息接口
app.get('/api/stats', async (c) => {
  try {
    const nameGenerator = NameGeneratorService.getInstance(c.env)
    const totalNamesGenerated = await nameGenerator.getTotalNamesGenerated()
    return c.json({
      totalNamesGenerated,
      status: 'success'
    })
  } catch (error) {
    console.error('Error getting stats:', error)
    return c.json({
      error: {
        message: '获取统计信息时发生错误',
        status: 500
      }
    }, 500)
  }
})

export default app
