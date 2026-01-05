'use client';

import { useStore } from '@/store/useStore';
import { calculateMetrics, generateProjections } from '@/lib/calculations';
import { generateInsights } from '@/lib/insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Lightbulb,
} from 'lucide-react';

const iconMap = {
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const colorMap = {
  danger: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-500',
    text: 'text-red-500',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: 'text-yellow-500',
    text: 'text-yellow-500',
  },
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-500',
    text: 'text-emerald-500',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-500',
    text: 'text-blue-500',
  },
};

export function InsightsPanel() {
  const inputs = useStore((state) => state.inputs);
  const scenarios = useStore((state) => state.scenarios);
  const activeScenarioId = useStore((state) => state.activeScenarioId);
  
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const metrics = calculateMetrics(inputs, activeScenario?.changes || []);
  const projections = generateProjections(inputs, activeScenario?.changes || [], 24);
  const insights = generateInsights(inputs, metrics, projections);

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Add financial data to see insights and recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Key Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Auto-generated analysis of your financial position
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const Icon = iconMap[insight.type];
          const colors = colorMap[insight.type];
          
          return (
            <div
              key={insight.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                colors.bg,
                colors.border
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", colors.icon)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{insight.title}</p>
                  {insight.metric && (
                    <span className={cn(
                      "text-sm font-semibold shrink-0",
                      colors.text
                    )}>
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
