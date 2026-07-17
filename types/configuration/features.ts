export interface BaseFeature {
  enabled: boolean;
  version: string;
  permissions: string[];
  beta: boolean;
}

export interface AIFeature extends BaseFeature {
  providers: ("gemini" | "openai" | "claude")[];
  activeProvider: string;
  quota: number;
}

export interface FeatureRegistry {
  ai: AIFeature;
  library: BaseFeature;
  transport: BaseFeature;
  fees: BaseFeature;
  attendance: BaseFeature;
  exams: BaseFeature;
}
