// Financial Data Types for Runwise

export interface CompanyProfile {
  name: string;
  industry: string;
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'growth' | 'profitable';
}

export interface CashPosition {
  currentBalance: number;
  creditLine: number; // Available but not used
}

export interface RevenueStream {
  id: string;
  name: string;
  type: 'recurring' | 'one-time' | 'contract';
  amount: number; // Monthly for recurring, total for one-time
  growthRate: number; // Monthly growth rate as decimal (0.05 = 5%)
  startMonth?: number; // 0 = current month
  endMonth?: number; // For contracts
}

export interface CostCategory {
  id: string;
  name: string;
  type: 'payroll' | 'operations' | 'marketing' | 'tools' | 'rent' | 'other';
  amount: number; // Monthly
  isFixed: boolean;
}

export interface TeamMember {
  id: string;
  role: string;
  salary: number; // Monthly fully-loaded cost
  startMonth: number; // 0 = already employed
}

export interface PlannedChange {
  id: string;
  type: 'hire' | 'fire' | 'revenue-change' | 'cost-change' | 'one-time-expense' | 'one-time-income';
  description: string;
  amount: number;
  month: number; // Which month this takes effect
  recurring: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  isBase: boolean;
  changes: PlannedChange[];
  color: string;
}

export interface FinancialInputs {
  company: CompanyProfile;
  cash: CashPosition;
  revenue: RevenueStream[];
  costs: CostCategory[];
  team: TeamMember[];
}

export interface MonthlyProjection {
  month: number;
  monthLabel: string;
  revenue: number;
  costs: number;
  netBurn: number;
  cashBalance: number;
  runway: number | null; // null if profitable
  isNegative: boolean;
}

export interface FinancialMetrics {
  currentCash: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  monthlyBurn: number;
  runway: number | null; // Months until zero, null if profitable
  breakEvenMonth: number | null; // Which month break-even occurs
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Insight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  description: string;
  metric?: string;
}

export interface ScenarioComparison {
  scenarioId: string;
  scenarioName: string;
  color: string;
  metrics: FinancialMetrics;
  projections: MonthlyProjection[];
}

// Store State
export interface FinancialState {
  inputs: FinancialInputs;
  scenarios: Scenario[];
  activeScenarioId: string;
  projectionMonths: number;
  
  // Actions
  setInputs: (inputs: Partial<FinancialInputs>) => void;
  setCash: (cash: Partial<CashPosition>) => void;
  addRevenue: (revenue: RevenueStream) => void;
  updateRevenue: (id: string, revenue: Partial<RevenueStream>) => void;
  removeRevenue: (id: string) => void;
  addCost: (cost: CostCategory) => void;
  updateCost: (id: string, cost: Partial<CostCategory>) => void;
  removeCost: (id: string) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  addScenario: (scenario: Scenario) => void;
  updateScenario: (id: string, scenario: Partial<Scenario>) => void;
  removeScenario: (id: string) => void;
  setActiveScenario: (id: string) => void;
  addChangeToScenario: (scenarioId: string, change: PlannedChange) => void;
  removeChangeFromScenario: (scenarioId: string, changeId: string) => void;
  loadSampleData: () => void;
  resetAll: () => void;
}
