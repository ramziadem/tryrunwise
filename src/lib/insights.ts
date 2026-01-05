import { FinancialInputs, Insight, FinancialMetrics, MonthlyProjection } from '@/types';
import { calculatePayrollPercentage, findZeroCashMonth } from './calculations';
import { formatCurrency, formatMonths, formatPercent } from './utils';

export function generateInsights(
  inputs: FinancialInputs,
  metrics: FinancialMetrics,
  projections: MonthlyProjection[]
): Insight[] {
  const insights: Insight[] = [];
  let insightId = 0;

  // Runway warnings
  if (metrics.runway !== null) {
    if (metrics.runway < 3) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'danger',
        title: 'Critical: Less than 3 months runway',
        description: `At current burn rate, you have ${formatMonths(metrics.runway)} of runway. Immediate action required.`,
        metric: formatMonths(metrics.runway),
      });
    } else if (metrics.runway < 6) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'warning',
        title: 'Low runway warning',
        description: `You have ${formatMonths(metrics.runway)} of runway. Consider reducing burn or raising capital.`,
        metric: formatMonths(metrics.runway),
      });
    } else if (metrics.runway >= 18) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'success',
        title: 'Healthy runway',
        description: `With ${formatMonths(metrics.runway)} of runway, you have time to execute your strategy.`,
        metric: formatMonths(metrics.runway),
      });
    }
  } else {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'success',
      title: 'Profitable operations',
      description: 'Your revenue exceeds costs. You have unlimited runway!',
      metric: '∞',
    });
  }

  // Payroll analysis
  const payrollPct = calculatePayrollPercentage(inputs);
  if (payrollPct > 0.7) {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'warning',
      title: 'High payroll concentration',
      description: `Payroll is ${formatPercent(payrollPct)} of your total costs. This limits flexibility.`,
      metric: formatPercent(payrollPct),
    });
  } else if (payrollPct > 0.5) {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'info',
      title: 'Payroll insight',
      description: `Payroll represents ${formatPercent(payrollPct)} of your burn. Typical for tech companies.`,
      metric: formatPercent(payrollPct),
    });
  }

  // Break-even analysis
  if (metrics.breakEvenMonth !== null) {
    if (metrics.breakEvenMonth <= 6) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'success',
        title: 'Break-even on the horizon',
        description: `At current growth, you'll break even in ${metrics.breakEvenMonth} months.`,
        metric: `${metrics.breakEvenMonth} mo`,
      });
    } else if (metrics.breakEvenMonth <= 18) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'info',
        title: 'Path to profitability',
        description: `Break-even projected in ${metrics.breakEvenMonth} months at current growth rate.`,
        metric: `${metrics.breakEvenMonth} mo`,
      });
    }
  } else if (metrics.monthlyBurn > 0) {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'info',
      title: 'No break-even in sight',
      description: 'At current trajectory, break-even is beyond 5 years. Growth acceleration needed.',
    });
  }

  // Cash danger zone
  const zeroCashMonth = findZeroCashMonth(projections);
  if (zeroCashMonth !== null) {
    const zeroDate = projections[zeroCashMonth]?.monthLabel;
    insights.push({
      id: `insight-${insightId++}`,
      type: 'danger',
      title: 'Cash exhaustion date',
      description: `Your cash reaches zero in ${zeroDate}. Plan accordingly.`,
      metric: zeroDate,
    });
  }

  // Revenue analysis
  if (metrics.monthlyRevenue === 0) {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'info',
      title: 'Pre-revenue stage',
      description: 'Focus on reaching first revenue milestone to extend runway options.',
    });
  } else if (inputs.revenue.length === 1) {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'warning',
      title: 'Revenue concentration risk',
      description: 'You have a single revenue source. Consider diversifying.',
    });
  }

  // Burn trend (check if burn is increasing over time)
  if (projections.length > 3) {
    const firstBurn = projections[0].netBurn;
    const thirdBurn = projections[3].netBurn;
    if (thirdBurn > firstBurn * 1.2) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'warning',
        title: 'Burn rate increasing',
        description: `Your burn is projected to increase ${formatPercent((thirdBurn - firstBurn) / firstBurn)} over the next 3 months.`,
      });
    }
  }

  // Monthly burn vs revenue ratio
  if (metrics.monthlyRevenue > 0) {
    const ratio = metrics.monthlyCosts / metrics.monthlyRevenue;
    if (ratio > 3) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'info',
        title: 'High burn multiple',
        description: `You're spending ${ratio.toFixed(1)}x your revenue. Normal for early stage, monitor as you grow.`,
        metric: `${ratio.toFixed(1)}x`,
      });
    } else if (ratio < 1.2 && ratio > 0) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'success',
        title: 'Efficient operations',
        description: `Your costs are only ${ratio.toFixed(1)}x revenue. Great efficiency!`,
        metric: `${ratio.toFixed(1)}x`,
      });
    }
  }

  return insights;
}

// Generate actionable recommendations
export function generateRecommendations(
  inputs: FinancialInputs,
  metrics: FinancialMetrics
): string[] {
  const recommendations: string[] = [];

  if (metrics.runway !== null && metrics.runway < 6) {
    recommendations.push('Consider reducing non-essential costs to extend runway');
    recommendations.push('Start fundraising conversations now if planning to raise');
    recommendations.push('Identify which costs can be cut quickly if needed');
  }

  const payrollPct = calculatePayrollPercentage(inputs);
  if (payrollPct > 0.7) {
    recommendations.push('High payroll % limits flexibility—consider contractors for variable work');
  }

  if (metrics.monthlyRevenue === 0) {
    recommendations.push('Focus on landing first paying customers to prove market demand');
  }

  if (inputs.revenue.length === 1 && metrics.monthlyRevenue > 0) {
    recommendations.push('Diversify revenue streams to reduce concentration risk');
  }

  return recommendations;
}
