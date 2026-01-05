import { useRef } from 'react';
import { exportToPdf } from '@/lib/exportPdf';

// Inside your component:
const cashFlowChartRef = useRef<HTMLDivElement>(null);
const revenueChartRef = useRef<HTMLDivElement>(null);
const costBreakdownChartRef = useRef<HTMLDivElement>(null);
const runwayChartRef = useRef<HTMLDivElement>(null);

const handleExportPdf = async () => {
  await exportToPdf({
    inputs,
    metrics,
    projections,
    scenarios,
    chartRefs: {
      cashFlowChart: cashFlowChartRef.current,
      revenueChart: revenueChartRef.current,
      costBreakdownChart: costBreakdownChartRef.current,
      runwayChart: runwayChartRef.current,
    },
  });
};

// Wrap your chart components with divs that have these refs:
<div ref={cashFlowChartRef}>
  <YourCashFlowChart data={...} />
</div>

<div ref={revenueChartRef}>
  <YourRevenueChart data={...} />
</div>

// etc.
