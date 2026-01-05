import {
  FinancialInputs,
  MonthlyProjection,
  FinancialMetrics,
  Scenario,
  PlannedChange,
} from '@/types';
import { getMonthLabel } from './utils';

// Calculate total monthly revenue at a given month
export function calculateMonthlyRevenue(
  inputs: FinancialInputs,
  month: number,
  changes: PlannedChange[] = []
): number {
  let total = 0;

  // Base revenue streams
  for (const stream of inputs.revenue) {
    const startMonth = stream.startMonth ?? 0;
    const endMonth = stream.endMonth ?? Infinity;

    if (month >= startMonth && month <= endMonth) {
      if (stream.type === 'recurring') {
        // Apply growth rate
        const monthsActive = month - startMonth;
        const growthMultiplier = Math.pow(1 + stream.growthRate, monthsActive);
        total += stream.amount * growthMultiplier;
      } else if (stream.type === 'one-time' && month === startMonth) {
        total += stream.amount;
      } else if (stream.type === 'contract') {
        total += stream.amount;
      }
    }
  }

  // Apply scenario changes
  for (const change of changes) {
    if (change.type === 'revenue-change' && month >= change.month) {
      if (change.recurring) {
        total += change.amount;
      } else if (month === change.month) {
        total += change.amount;
      }
    }
    if (change.type === 'one-time-income' && month === change.month) {
      total += change.amount;
    }
  }

  return Math.max(0, total);
}

// Calculate total monthly costs at a given month
export function calculateMonthlyCosts(
  inputs: FinancialInputs,
  month: number,
  changes: PlannedChange[] = []
): number {
  let total = 0;

  // Base cost categories
  for (const cost of inputs.costs) {
    total += cost.amount;
  }

  // Team payroll
  for (const member of inputs.team) {
    if (month >= member.startMonth) {
      total += member.salary;
    }
  }

  // Apply scenario changes
  for (const change of changes) {
    if (change.type === 'hire' && month >= change.month) {
      total += change.amount; // Monthly salary
    }
    if (change.type === 'fire' && month >= change.month) {
      total -= change.amount; // Reduce by salary
    }
    if (change.type === 'cost-change' && month >= change.month) {
      if (change.recurring) {
        total += change.amount;
      } else if (month === change.month) {
        total += change.amount;
      }
    }
    if (change.type === 'one-time-expense' && month === change.month) {
      total += change.amount;
    }
  }

  return Math.max(0, total);
}

// Calculate net burn (costs - revenue, positive = burning money)
export function calculateNetBurn(revenue: number, costs: number): number {
  return costs - revenue;
}

// Generate monthly projections
export function generateProjections(
  inputs: FinancialInputs,
  changes: PlannedChange[] = [],
  months: number = 24
): MonthlyProjection[] {
  const projections: MonthlyProjection[] = [];
  let cashBalance = inputs.cash.currentBalance;

  for (let month = 0; month < months; month++) {
    const revenue = calculateMonthlyRevenue(inputs, month, changes);
    const costs = calculateMonthlyCosts(inputs, month, changes);
    const netBurn = calculateNetBurn(revenue, costs);
    
    if (month > 0) {
      cashBalance -= netBurn;
    }

    const isNegative = cashBalance < 0;
    
    // Calculate runway from this point
    let runway: number | null = null;
    if (netBurn > 0) {
      runway = Math.max(0, cashBalance / netBurn);
    }

    projections.push({
      month,
      monthLabel: getMonthLabel(month),
      revenue,
      costs,
      netBurn,
      cashBalance: Math.max(0, cashBalance),
      runway,
      isNegative,
    });
  }

  return projections;
}

// Calculate overall metrics
export function calculateMetrics(
  inputs: FinancialInputs,
  changes: PlannedChange[] = []
): FinancialMetrics {
  const currentRevenue = calculateMonthlyRevenue(inputs, 0, changes);
  const currentCosts = calculateMonthlyCosts(inputs, 0, changes);
  const monthlyBurn = calculateNetBurn(currentRevenue, currentCosts);

  // Calculate runway
  let runway: number | null = null;
  if (monthlyBurn > 0) {
    runway = inputs.cash.currentBalance / monthlyBurn;
  }

  // Find break-even month
  let breakEvenMonth: number | null = null;
  for (let month = 0; month < 60; month++) {
    const revenue = calculateMonthlyRevenue(inputs, month, changes);
    const costs = calculateMonthlyCosts(inputs, month, changes);
    if (revenue >= costs) {
      breakEvenMonth = month;
      break;
    }
  }

  // Calculate risk score (0-100, higher = more risk)
  let riskScore = 0;

  // Runway-based risk
  if (runway !== null) {
    if (runway < 3) riskScore += 50;
    else if (runway < 6) riskScore += 35;
    else if (runway < 9) riskScore += 20;
    else if (runway < 12) riskScore += 10;
  }

  // Burn rate vs cash
  const burnRatio = monthlyBurn / inputs.cash.currentBalance;
  if (burnRatio > 0.2) riskScore += 25;
  else if (burnRatio > 0.15) riskScore += 15;
  else if (burnRatio > 0.1) riskScore += 10;

  // Revenue concentration (if single stream)
  if (inputs.revenue.length === 1) riskScore += 10;

  // No revenue
  if (currentRevenue === 0) riskScore += 15;

  // Cap at 100
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore < 25) riskLevel = 'low';
  else if (riskScore < 50) riskLevel = 'medium';
  else if (riskScore < 75) riskLevel = 'high';
  else riskLevel = 'critical';

  return {
    currentCash: inputs.cash.currentBalance,
    monthlyRevenue: currentRevenue,
    monthlyCosts: currentCosts,
    monthlyBurn,
    runway,
    breakEvenMonth,
    riskScore,
    riskLevel,
  };
}

// Compare multiple scenarios
export function compareScenarios(
  inputs: FinancialInputs,
  scenarios: Scenario[],
  months: number = 24
): { scenarioId: string; name: string; color: string; metrics: FinancialMetrics; projections: MonthlyProjection[] }[] {
  return scenarios.map((scenario) => ({
    scenarioId: scenario.id,
    name: scenario.name,
    color: scenario.color,
    metrics: calculateMetrics(inputs, scenario.changes),
    projections: generateProjections(inputs, scenario.changes, months),
  }));
}

// Find the month when cash runs out
export function findZeroCashMonth(projections: MonthlyProjection[]): number | null {
  for (const proj of projections) {
    if (proj.isNegative) {
      return proj.month;
    }
  }
  return null;
}

// Calculate payroll as percentage of burn
export function calculatePayrollPercentage(inputs: FinancialInputs): number {
  const totalPayroll = inputs.team.reduce((sum, m) => sum + m.salary, 0);
  const totalCosts = inputs.costs.reduce((sum, c) => sum + c.amount, 0) + totalPayroll;
  if (totalCosts === 0) return 0;
  return totalPayroll / totalCosts;
}

// Calculate how many hires you can afford
export function calculateAffordableHires(
  inputs: FinancialInputs,
  averageSalary: number,
  minRunwayMonths: number = 6
): number {
  const currentMetrics = calculateMetrics(inputs, []);
  if (currentMetrics.runway === null) return 99; // Profitable

  const currentBurn = currentMetrics.monthlyBurn;
  const cash = inputs.cash.currentBalance;

  // How much more burn can we add while keeping X months runway?
  // runway = cash / burn
  // minRunway = cash / (burn + newHires * salary)
  // minRunway * (burn + newHires * salary) = cash
  // burn + newHires * salary = cash / minRunway
  // newHires = (cash / minRunway - burn) / salary

  const maxBurn = cash / minRunwayMonths;
  const additionalBurnAllowed = maxBurn - currentBurn;
  const affordableHires = Math.floor(additionalBurnAllowed / averageSalary);

  return Math.max(0, affordableHires);
}
