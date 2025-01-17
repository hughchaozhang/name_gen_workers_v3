import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

const RATE_LIMIT = {
  WINDOW_SIZE: 3600, // 1小时窗口期
  MAX_REQUESTS: 15  // 每个IP每小时最多15次请求
}

export const rateLimiter = async (c: Context, next: Next) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown'
  const currentTime = Math.floor(Date.now() / 1000)
  const windowStart = currentTime - RATE_LIMIT.WINDOW_SIZE

  try {
    // 获取KV中存储的请求记录
    const key = `rate_limit:${ip}`
    const requests = await c.env.NAME_GEN_KV.get(key, 'json') || []

    // 清理过期的请求记录
    const validRequests = requests.filter((timestamp: number) => timestamp > windowStart)

    // 检查是否超出限制
    if (validRequests.length >= RATE_LIMIT.MAX_REQUESTS) {
      throw new HTTPException(429, {
        message: '请求过于频繁，请稍后再试。每小时最多允许15次请求。Too many requests, please try again later. Maximum of 15 requests per hour is allowed.',
      })
    }

    // 添加新的请求记录
    validRequests.push(currentTime)
    await c.env.NAME_GEN_KV.put(key, JSON.stringify(validRequests), {
      expirationTtl: RATE_LIMIT.WINDOW_SIZE
    })

    // 添加剩余请求次数到响应头
    c.header('X-RateLimit-Limit', RATE_LIMIT.MAX_REQUESTS.toString())
    c.header('X-RateLimit-Remaining', (RATE_LIMIT.MAX_REQUESTS - validRequests.length).toString())
    c.header('X-RateLimit-Reset', (currentTime + RATE_LIMIT.WINDOW_SIZE).toString())

    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    // 如果KV操作失败，为了不影响服务，仍然允许请求通过
    console.error('Rate limiter error:', error)
    await next()
  }
}
