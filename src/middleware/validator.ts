import { Context, Next } from 'hono';
import { NameGenerateRequest } from '../types';

// 验证请求数据的中间件
export async function validateNameRequest(c: Context, next: Next) {
  const body = await c.req.json();

  // 验证必填字段
  if (!body.firstName || typeof body.firstName !== 'string' || body.firstName.trim() === '') {
    return c.json({
      error: {
        message: 'firstName 是必填字段且不能为空',
        status: 400
      }
    }, 400);
  }

  // 验证可选字段
  if (body.lastName !== undefined && (typeof body.lastName !== 'string' || body.lastName.trim() === '')) {
    return c.json({
      error: {
        message: 'lastName 如果提供则不能为空',
        status: 400
      }
    }, 400);
  }

  // 验证字段长度
  if (body.firstName.length > 50 || (body.lastName && body.lastName.length > 50)) {
    return c.json({
      error: {
        message: '名字长度不能超过50个字符',
        status: 400
      }
    }, 400);
  }

  // 验证字符是否为英文字母
  const nameRegex = /^[a-zA-Z\s-]+$/;
  if (!nameRegex.test(body.firstName) || (body.lastName && !nameRegex.test(body.lastName))) {
    return c.json({
      error: {
        message: '名字只能包含英文字母、空格和连字符',
        status: 400
      }
    }, 400);
  }

  // 将验证后的数据存储到请求上下文中
  c.set('nameRequest', {
    firstName: body.firstName.trim(),
    lastName: body.lastName ? body.lastName.trim() : undefined
  } as NameGenerateRequest);

  await next();
}
