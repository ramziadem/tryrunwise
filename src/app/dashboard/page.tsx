'use client';

import { MetricCards } from '@/components/dashboard/MetricCards';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { ScenarioBuilder } from '@/components/dashboard/ScenarioBuilder';
import { FinancialInputs } from '@/components/dashboard/FinancialInputs';
import { Header, Footer } from '@/components/layout/Header';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-6 space-y-6">
        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Track your runway, burn rate, and model different scenarios
          </p>
        </div>

        {/* Metric Cards */}
        <MetricCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 space-y-6">
            <CashFlowChart />
            <InsightsPanel />
          </div>

          {/* Right Column - Inputs & Scenarios */}
          <div className="space-y-6">
            <FinancialInputs />
            <ScenarioBuilder />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
