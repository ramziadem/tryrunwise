'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Zap, 
  Shield,
  LineChart,
  Users,
  Target,
  CheckCircle2,
  Linkedin,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight">Try Run Wise</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Try Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Free • No signup required
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Know your runway.
            <br />
            <span className="text-primary">Make smarter decisions.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The financial cockpit for founders and operators. Track burn rate, 
            model scenarios, and never be surprised by your runway again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
            >
              Start Planning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 text-lg font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              See Features
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            Used by founders at early-stage startups • 100% free
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container py-24 border-t">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to manage your runway
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stop guessing. Get clear visibility into your financial future.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Clock,
              title: 'Runway Calculator',
              description: 'Know exactly how many months you have until you need to raise or become profitable.',
            },
            {
              icon: TrendingUp,
              title: 'Burn Rate Tracking',
              description: 'Track your net burn, gross burn, and see trends over time.',
            },
            {
              icon: LineChart,
              title: '24-Month Projections',
              description: 'Visualize your cash flow month-by-month with interactive charts.',
            },
            {
              icon: Target,
              title: 'Scenario Planning',
              description: 'Model "what-if" scenarios: hire, lose a client, cut costs, and see the impact.',
            },
            {
              icon: Zap,
              title: 'Auto Insights',
              description: 'Get intelligent alerts about your financial health and risks.',
            },
            {
              icon: Shield,
              title: 'Risk Scoring',
              description: 'Understand your financial risk with a simple 0-100 score.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl border p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24 border-t">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Simple, powerful, deterministic
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No AI magic. No black boxes. Just clear math you can trust.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Enter Your Data',
              description: 'Add your cash balance, revenue streams, costs, and team. Takes 5 minutes.',
            },
            {
              step: '2',
              title: 'See Your Runway',
              description: 'Instantly see your runway, burn rate, and financial health score.',
            },
            {
              step: '3',
              title: 'Model Decisions',
              description: 'Create scenarios to test hiring, losing clients, or cutting costs.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 border-t">
        <div className="mx-auto max-w-3xl text-center space-y-8 rounded-2xl border bg-muted/30 p-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to take control of your runway?
          </h2>
          <p className="text-muted-foreground">
            Join founders who use Try Run Wise to make confident financial decisions.
            No signup. No credit card. Just clarity.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
          >
            Open Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* About / Contact Section */}
      <section className="container py-24 border-t">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for founders, by someone who gets it
            </h2>
            <p className="text-muted-foreground">
              I built Try Run Wise because I was tired of messy spreadsheets and 
              guessing about runway. As someone who works with startups, I know 
              how critical clear financial visibility is.
            </p>
            <p className="text-muted-foreground">
              If you need help with your financial planning, scenario modeling, 
              or building internal tools — let&apos;s talk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.linkedin.com/in/ramzi-benchadi-94b604383"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-[#0077B5] px-6 py-3 text-sm font-medium text-white hover:bg-[#0077B5]/90 transition-colors"
              >
                <Linkedin className="mr-2 h-4 w-4" />
                Connect on LinkedIn
              </a>
              <a
                href="mailto:ramzibenchadi35@gmail.com"
                className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Send Email
              </a>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">John Doe</h3>
                <p className="text-sm text-muted-foreground">Builder & Consultant</p>
              </div>
            </div>
            <ul className="space-y-2">
              {[
                'Financial modeling for startups',
                'Business intelligence tools',
                'Full-stack development',
                'Startup operations consulting',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-auto">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Try Run Wise</span>
            <span>— Built by <strong className="text-foreground"><a href="https://www.linkedin.com/in/ramzi-benchadi-94b604383" target="_blank" rel="noopener noreferrer">Ramzi Benchadi</a></strong></span>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="https://www.linkedin.com/in/ramzi-benchadi-94b604383" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a 
              href="mailto:ramzibenchadi35@gmail.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
            <span className="text-sm text-muted-foreground">
              © 2026
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
