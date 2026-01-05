'use client';

import { useStore } from '@/store/useStore';
import { calculateMetrics, generateProjections } from '@/lib/calculations';
import { formatCurrency, formatMonths, getRiskColor, getRiskBgColor, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

export function MetricCards() {
  const inputs = useStore((state) => state.inputs);
  const scenarios = useStore((state) => state.scenarios);
  const activeScenarioId = useStore((state) => state.activeScenarioId);
  
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const metrics = calculateMetrics(inputs, activeScenario?.changes || []);
  
  // Get base metrics for comparison
  const baseMetrics = calculateMetrics(inputs, []);
  
  const runwayDiff = metrics.runway !== null && baseMetrics.runway !== null 
    ? metrics.runway - baseMetrics.runway 
    : null;

  const cards = [
    {
      title: 'Cash in Bank',
      value: formatCurrency(metrics.currentCash),
      subtitle: 'Current balance',
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Monthly Burn',
      value: metrics.monthlyBurn > 0 ? formatCurrency(metrics.monthlyBurn) : '$0',
      subtitle: metrics.monthlyBurn <= 0 ? 'Net positive!' : 'Net cash out',
      icon: metrics.monthlyBurn <= 0 ? TrendingUp : TrendingDown,
      color: metrics.monthlyBurn <= 0 ? 'text-emerald-500' : 'text-orange-500',
      bgColor: metrics.monthlyBurn <= 0 ? 'bg-emerald-500/10' : 'bg-orange-500/10',
    },
    {
      title: 'Runway',
      value: formatMonths(metrics.runway),
      subtitle: runwayDiff && !activeScenario?.isBase
        ? `${runwayDiff > 0 ? '+' : ''}${runwayDiff.toFixed(1)} mo vs base`
        : metrics.runway === null ? 'Profitable' : 'Until $0',
      icon: Clock,
      color: metrics.runway === null || metrics.runway > 12 ? 'text-emerald-500' : 
             metrics.runway > 6 ? 'text-yellow-500' : 'text-red-500',
      bgColor: metrics.runway === null || metrics.runway > 12 ? 'bg-emerald-500/10' : 
               metrics.runway > 6 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      diff: runwayDiff,
    },
    {
      title: 'Risk Score',
      value: `${metrics.riskScore}`,
      subtitle: metrics.riskLevel.charAt(0).toUpperCase() + metrics.riskLevel.slice(1) + ' risk',
      icon: AlertTriangle,
      color: getRiskColor(metrics.riskLevel),
      bgColor: getRiskBgColor(metrics.riskLevel),
      isRisk: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold tracking-tight">
                    {card.value}
                  </p>
                  {card.diff !== undefined && card.diff !== null && card.diff !== 0 && (
                    <span className={cn(
                      "text-xs font-medium flex items-center",
                      card.diff > 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      {card.diff > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(card.diff).toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              </div>
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
            </div>
            {card.isRisk && (
              <div className="mt-3">
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div 
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      metrics.riskLevel === 'low' ? 'bg-emerald-500' :
                      metrics.riskLevel === 'medium' ? 'bg-yellow-500' :
                      metrics.riskLevel === 'high' ? 'bg-orange-500' : 'bg-red-500'
                    )}
                    style={{ width: `${metrics.riskScore}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
