export enum RiskLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export enum ScenarioBranch {
  NOT_PAID = "A",
  ALREADY_PAID = "B"
}

export interface RecommendedAction {
  title: string;
  steps: string[];
  priority: number;
}

export interface BankMetadata {
  name: string;
  id: string;
  email: string;
  hotline: string;
  portal: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}

export interface ScamShieldResult {
  riskPercent: number;
  riskLabel: RiskLevel;
  scamType: string;
  actions_A: RecommendedAction[]; // Haven't paid
  actions_B: RecommendedAction[]; // Already paid
  summary: string;
}