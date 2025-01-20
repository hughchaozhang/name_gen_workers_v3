// 定义请求和响应的类型
export interface NameGenerateRequest {
  firstName: string;
  lastName?: string;
}

export interface GeneratedName {
  chineseName: string;
  pinyin: string;
  meaning: string;
  culturalReference: string;
  englishMeaning: string;
}

export interface NameGenerateResponse {
  names: GeneratedName[];
  totalNamesGenerated: number;
}
