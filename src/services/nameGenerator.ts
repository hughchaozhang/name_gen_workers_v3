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
      console.log('开始生成名字...');
      const prompt = this.constructPrompt(request);
      console.log('构建提示完成，调用 AI...');
      const response = await this.callAI(prompt);
      console.log('AI 响应接收完成，解析响应...');
      const result = this.parseResponse(response);
      
      // 更新计数器
      console.log('开始更新计数器...');
      const currentCount = await this.updateNameCounter();
      console.log('计数器更新完成，当前计数:', currentCount);
      
      // 在返回结果中添加计数信息
      const finalResult = {
        names: result.names,
        totalNamesGenerated: currentCount
      };
      console.log('最终返回结果:', JSON.stringify(finalResult));
      return finalResult;
    } catch (error) {
      console.error('Error generating names:', error);
      throw new Error('Failed to generate names');
    }
  }

  // 构建 AI 提示
  private constructPrompt(request: NameGenerateRequest): string {
    const nameInfo = request.lastName 
      ? `名字（First Name）：${request.firstName}\n姓氏（Last Name）：${request.lastName}`
      : `名字（First Name）：${request.firstName}`;
    
    return `${SYSTEM_PROMPT}

请为以下英文名生成中文名字：
${nameInfo}

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
      const mockResult = {
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
      return mockResult;
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
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    try {
      // 尝试解析 AI 的响应
      const content = aiResponse.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', aiResponse);
      throw new Error('Failed to parse AI response');
    }
  }

  // 解析响应
  private parseResponse(response: any): { names: GeneratedName[] } {
    // 确保返回的数据符合我们的类型定义
    if (!response.names || !Array.isArray(response.names)) {
      throw new Error('Invalid response format: missing names array');
    }

    const names = response.names.map((name: any) => {
      if (!name.chineseName || !name.pinyin || !name.meaning) {
        throw new Error('Invalid name format in response');
      }
      return {
        chineseName: name.chineseName,
        pinyin: name.pinyin,
        meaning: name.meaning,
        culturalReference: name.culturalReference || '',
        englishMeaning: name.englishMeaning || ''
      };
    });

    return { names };  // 只返回名字数组，计数器值会在 generateNames 方法中添加
  }

  // 更新名字计数器
  private async updateNameCounter(): Promise<number> {
    try {
      console.log('正在从 KV 读取当前计数...');
      // 获取当前计数
      const countStr = await this.env.NAME_GEN_KV.get('name_counter');
      console.log('从 KV 读取的计数值:', countStr);
      
      let count = countStr ? parseInt(countStr) : 52;  // 如果没有计数，从52开始
      console.log('解析后的计数值:', count);
      
      // 每次生成3个名字，所以加3
      count += 3;
      console.log('增加3后的计数值:', count);
      
      // 更新计数
      console.log('正在将新计数值写入 KV...');
      await this.env.NAME_GEN_KV.put('name_counter', count.toString());
      console.log('计数值已更新到 KV');
      
      return count;
    } catch (error) {
      console.error('更新计数器时出错:', error);
      return 0;  // 如果出错，返回0
    }
  }
}
