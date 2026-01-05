import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { FinancialInputs, Scenario, FinancialMetrics, MonthlyProjection } from '@/types';
import { formatCurrencyFull } from './utils';

interface ExportData {
  inputs: FinancialInputs;
  metrics: FinancialMetrics;
  projections: MonthlyProjection[];
  scenarios: Scenario[];
}

async function captureChartAsImage(element: HTMLElement): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    } as any);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to capture chart:', error);
    return null;
  }
}

async function captureChartsFromDOM(): Promise<{ [key: string]: string | null }> {
  const chartImages: { [key: string]: string | null } = {};
  
  // Find the cash flow chart by looking for the recharts container
  const cashFlowCard = document.querySelector('[data-chart="cash-flow"]');
  if (cashFlowCard) {
    chartImages.cashFlow = await captureChartAsImage(cashFlowCard as HTMLElement);
  } else {
    // Fallback: find the recharts-responsive-container inside the main chart area
    const rechartsContainers = document.querySelectorAll('.recharts-responsive-container');
    if (rechartsContainers.length > 0) {
      // Get the parent card of the first chart (cash flow chart)
      const chartParent = rechartsContainers[0].closest('.recharts-wrapper')?.parentElement;
      if (chartParent) {
        chartImages.cashFlow = await captureChartAsImage(chartParent as HTMLElement);
      }
    }
  }

  return chartImages;
}

export async function exportToPdf({ inputs, metrics, projections, scenarios }: ExportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [180, 83, 9];
  const darkColor: [number, number, number] = [30, 30, 30];
  const grayColor: [number, number, number] = [100, 100, 100];

  // Capture charts from the DOM automatically
  const chartImages = await captureChartsFromDOM();

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Try Run Wise', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Financial Report', 14, 28);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })}`, pageWidth - 14, 20, { align: 'right' });

  let yPos = 50;

  // Executive Summary
  doc.setTextColor(...darkColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, yPos);
  yPos += 10;

  // Key Metrics Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(14, yPos, pageWidth - 28, 45, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);

  const col1 = 24;
  const col2 = 75;
  const col3 = 130;

  // Row 1
  doc.text('Cash Balance', col1, yPos + 10);
  doc.text('Monthly Burn', col2, yPos + 10);
  doc.text('Runway', col3, yPos + 10);

  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrencyFull(metrics.currentCash), col1, yPos + 20);
  doc.text(formatCurrencyFull(metrics.monthlyBurn), col2, yPos + 20);
  doc.text(metrics.runway ? `${metrics.runway.toFixed(1)} months` : 'Profitable', col3, yPos + 20);

  // Row 2
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Revenue', col1, yPos + 32);
  doc.text('Monthly Costs', col2, yPos + 32);
  doc.text('Risk Score', col3, yPos + 32);

  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrencyFull(metrics.monthlyRevenue), col1, yPos + 42);
  doc.text(formatCurrencyFull(metrics.monthlyCosts), col2, yPos + 42);
  
  // Risk score with color
  const riskColor: [number, number, number] = metrics.riskScore < 40 
    ? [34, 197, 94]
    : metrics.riskScore < 70 
      ? [234, 179, 8]
      : [239, 68, 68];
  doc.setTextColor(...riskColor);
  doc.text(`${metrics.riskScore}/100`, col3, yPos + 42);

  yPos += 60;

  // Cash Flow Chart
  if (chartImages.cashFlow) {
    doc.setTextColor(...darkColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cash Flow Overview', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    // Keep original aspect ratio - chart is roughly 2:1 (width:height)
    const chartWidth = 140;
    const chartHeight = 70;
    const chartX = (pageWidth - chartWidth) / 2; // Center horizontally
    doc.addImage(chartImages.cashFlow, 'PNG', chartX, yPos, chartWidth, chartHeight);
    yPos += chartHeight + 15;
  }

  // Check if we need a new page before Revenue section
  if (yPos > 180) {
    doc.addPage();
    yPos = 20;
  }

  // Revenue Breakdown
  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Revenue Streams', 14, yPos);
  yPos += 5;

  if (inputs.revenue.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Type', 'Amount', 'Growth Rate']],
      body: inputs.revenue.map((r) => [
        r.name,
        r.type === 'recurring' ? 'Recurring' : r.type === 'one-time' ? 'One-time' : 'Contract',
        formatCurrencyFull(r.amount),
        `${(r.growthRate * 100).toFixed(1)}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text('No revenue streams added', 14, yPos + 10);
    yPos += 20;
  }

  // Cost Breakdown
  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cost Structure', 14, yPos);
  yPos += 5;

  if (inputs.costs.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Category', 'Amount', 'Type']],
      body: inputs.costs.map((c) => [
        c.name,
        c.type.charAt(0).toUpperCase() + c.type.slice(1),
        formatCurrencyFull(c.amount),
        c.isFixed ? 'Fixed' : 'Variable'
      ]),
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text('No costs added', 14, yPos + 10);
    yPos += 20;
  }

  // Team
  if (inputs.team.length > 0) {
    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setTextColor(...darkColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Team', 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [['Role', 'Monthly Salary', 'Start Month']],
      body: inputs.team.map((t) => [
        t.role,
        formatCurrencyFull(t.salary),
        t.startMonth === 0 ? 'Current' : `Month ${t.startMonth}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  // 12-Month Projection
  doc.addPage();
  yPos = 20;

  doc.setTextColor(...darkColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('12-Month Cash Flow Projection', 14, yPos);
  yPos += 10;

  const projectionData = projections.slice(0, 12).map((p) => [
    p.monthLabel,
    formatCurrencyFull(p.revenue),
    formatCurrencyFull(p.costs),
    formatCurrencyFull(p.netBurn),
    formatCurrencyFull(p.cashBalance)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Month', 'Revenue', 'Costs', 'Net Burn', 'Cash Balance']],
    body: projectionData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });
  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

  // Scenarios
  const nonBaseScenarios = scenarios.filter(s => !s.isBase);
  if (nonBaseScenarios.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setTextColor(...darkColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Scenario Analysis', 14, yPos);
    yPos += 10;

    nonBaseScenarios.forEach((scenario, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text(`${index + 1}. ${scenario.name}`, 14, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...grayColor);
      doc.text(scenario.description, 14, yPos);
      yPos += 8;

      // Scenario changes table
      if (scenario.changes.length > 0) {
        const changeRows = scenario.changes.map((change) => {
          let typeLabel = '';
          switch (change.type) {
            case 'hire': typeLabel = 'New Hire'; break;
            case 'fire': typeLabel = 'Terminate'; break;
            case 'revenue-change': typeLabel = 'Revenue Change'; break;
            case 'cost-change': typeLabel = 'Cost Change'; break;
            case 'one-time-expense': typeLabel = 'One-time Expense'; break;
            case 'one-time-income': typeLabel = 'One-time Income'; break;
            default: typeLabel = change.type;
          }
          return [
            typeLabel,
            change.description,
            formatCurrencyFull(change.amount),
            `Month ${change.month}`
          ];
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Type', 'Description', 'Amount', 'Timing']],
          body: changeRows,
          theme: 'plain',
          headStyles: { fillColor: [240, 240, 240], textColor: darkColor, fontStyle: 'bold' },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
        });
        yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }
    });
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(
      `Page ${i} of ${pageCount} • Generated by Try Run Wise • https://tryrunwise.vercel.app/dashboard`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  const fileName = `tryrunwise-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
