import { Context, Next } from 'hono';

// 错误处理中间件
export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);

    if (error instanceof Error) {
      return c.json({
        error: {
          message: error.message || '发生未知错误',
          status: 500
        }
      }, 500);
    }

    return c.json({
      error: {
        message: '发生未知错误',
        status: 500
      }
    }, 500);
  }
}
