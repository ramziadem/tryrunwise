'use client';

import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { exportToPdf } from '@/lib/exportPdf';
import { calculateMetrics, generateProjections } from '@/lib/calculations';
import { 
  Download, 
  RotateCcw, 
  Database,
  Linkedin,
  FileDown,
} from 'lucide-react';

export function Header() {
  const loadSampleData = useStore((state) => state.loadSampleData);
  const resetAll = useStore((state) => state.resetAll);
  const inputs = useStore((state) => state.inputs);
  const scenarios = useStore((state) => state.scenarios);

  const handleExportPdf = async () => {
    const metrics = calculateMetrics(inputs);
    const projections = generateProjections(inputs);
    await exportToPdf({
      inputs,
      metrics,
      projections,
      scenarios,
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight">Try Run Wise</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSampleData}
            className="hidden sm:flex gap-2"
          >
            <Database className="h-4 w-4" />
            Load Demo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportPdf}
            className="hidden sm:flex gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="hidden sm:flex gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <a href="https://www.linkedin.com/in/ramzi-benchadi-94b604383" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-4 w-4" />
              <span className="hidden sm:inline">Connect</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 mt-auto">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Try Run Wise</span>
          <span>— Built by <strong className="text-foreground"><a href="https://www.linkedin.com/in/ramzi-benchadi-94b604383">Ramzi Benchadi</a></strong></span>
        </div>
        <div className="flex items-center gap-4">
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
            © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
