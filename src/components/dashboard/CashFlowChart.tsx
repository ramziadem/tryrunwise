'use client';

import { useStore } from '@/store/useStore';
import { compareScenarios } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

export function CashFlowChart() {
  const inputs = useStore((state) => state.inputs);
  const scenarios = useStore((state) => state.scenarios);
  
  // Compare all scenarios
  const comparisons = compareScenarios(inputs, scenarios, 24);
  
  // Prepare chart data
  const chartData = comparisons[0]?.projections.map((proj, index) => {
    const dataPoint: Record<string, string | number> = {
      month: proj.monthLabel,
    };
    
    comparisons.forEach((comp) => {
      dataPoint[comp.name] = Math.round(comp.projections[index]?.cashBalance || 0);
    });
    
    return dataPoint;
  }) || [];

  // Find when cash goes negative for any scenario
  const zeroLines = comparisons.map((comp) => {
    const zeroMonth = comp.projections.findIndex((p) => p.isNegative);
    return {
      name: comp.name,
      month: zeroMonth >= 0 ? zeroMonth : null,
      color: comp.color,
    };
  }).filter((z) => z.month !== null);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Cash Flow Projection</CardTitle>
        <p className="text-sm text-muted-foreground">
          24-month forecast comparing all scenarios
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {comparisons.map((comp) => (
                  <linearGradient
                    key={comp.scenarioId}
                    id={`gradient-${comp.scenarioId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={comp.color}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={comp.color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
              {comparisons.map((comp, index) => (
                <Area
                  key={comp.scenarioId}
                  type="monotone"
                  dataKey={comp.name}
                  stroke={comp.color}
                  strokeWidth={index === 0 ? 2 : 1.5}
                  fill={`url(#gradient-${comp.scenarioId})`}
                  fillOpacity={index === 0 ? 1 : 0.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {zeroLines.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {zeroLines.map((z) => (
              <div
                key={z.name}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: z.color }}
                />
                <span className="text-red-500 font-medium">
                  {z.name}: Cash exhausted month {z.month! + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
