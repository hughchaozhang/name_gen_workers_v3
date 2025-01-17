import { NameGenerateRequest, NameGenerateResponse } from '../types';
import { SYSTEM_PROMPT } from '../constants';
import type Env from '../types/env';

// 生成名字的服务
export class NameGeneratorService {
  private static instance: NameGeneratorService;
  private env: Env;

  private constructor(env: Env) {
    this.env = env;
  }

  public static getInstance(env: Env): NameGeneratorService {
    if (!NameGeneratorService.instance) {
      NameGeneratorService.instance = new NameGeneratorService(env);
    }
    return NameGeneratorService.instance;
  }

  // 生成名字的主要方法
  public async generateNames(request: NameGenerateRequest): Promise<NameGenerateResponse> {
    try {
      const prompt = this.constructPrompt(request);
      const response = await this.callAI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error generating names:', error);
      throw new Error('Failed to generate names');
    }
  }

  // 构建 AI 提示
  private constructPrompt(request: NameGenerateRequest): string {
    const fullName = request.lastName 
      ? `${request.firstName} ${request.lastName}`
      : request.firstName;
    
    return `${SYSTEM_PROMPT}

请为以下英文名生成中文名字：${fullName}

请以下面的 JSON 格式返回结果：
{
  "names": [
    {
      "chineseName": "中文名",
      "pinyin": "拼音（带声调）",
      "meaning": "整体含义",
      "culturalReference": "文化内涵",
      "englishMeaning": "英文解释"
    }
  ]
}`;
  }

  // 调用 AI API
  private async callAI(prompt: string): Promise<any> {
    // 在开发环境中使用模拟数据
    if (this.env.ENVIRONMENT === 'development') {
      return {
        names: [
          {
            chineseName: "简安怡",
            pinyin: "jiǎn ān yí",
            meaning: "寓意安宁愉悦",
            culturalReference: "取自《诗经》安和怡乐之意",
            englishMeaning: "Peaceful and joyful"
          },
          {
            chineseName: "简乐瑶",
            pinyin: "jiǎn lè yáo",
            meaning: "充满快乐和美好",
            culturalReference: "瑶池仙境，象征美好向往",
            englishMeaning: "Joyful and precious"
          },
          {
            chineseName: "简饭饭",
            pinyin: "jiǎn fàn fàn",
            meaning: "可爱又接地气",
            culturalReference: "网络流行语，象征亲切可爱",
            englishMeaning: "Cute and down-to-earth"
          }
        ]
      };
    }

    // 生产环境使用真实 API
    const response = await fetch(this.env.AI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API Error:', error);
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    try {
      // 尝试解析 AI 返回的 JSON 字符串
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Invalid response format from AI API');
    }
  }

  // 解析并验证 AI 响应
  private parseResponse(aiResponse: any): NameGenerateResponse {
    // 验证响应格式
    if (!aiResponse.names || !Array.isArray(aiResponse.names)) {
      throw new Error('Invalid response format: missing names array');
    }

    // 验证每个名字对象的格式
    aiResponse.names.forEach((name: any, index: number) => {
      if (!name.chineseName || !name.pinyin || !name.meaning || 
          !name.culturalReference || !name.englishMeaning) {
        throw new Error(`Invalid name object at index ${index}`);
      }
    });

    return aiResponse;
  }
}
