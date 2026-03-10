'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Search,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { ResearchModel, ResearchResult } from '@/types';

const RESEARCH_MODELS: ResearchModel[] = [
  {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    provider: 'perplexity',
    providerName: 'Perplexity AI',
    description: 'Purpose-built for real-time web research. Searches the web on every query and returns precise, cited answers with the most current data available.',
    strengths: ['Real-time web data', 'Source citations', 'Factual accuracy', 'Latest statistics'],
    hasWebSearch: true,
    recommended: true,
    apiKeyUrl: 'https://www.perplexity.ai/settings/api',
  },
  {
    id: 'sonar',
    name: 'Sonar',
    provider: 'perplexity',
    providerName: 'Perplexity AI',
    description: 'Fast web-search model. Great for quick lookups of current data, market benchmarks, and industry facts.',
    strengths: ['Fast responses', 'Real-time data', 'Cost-efficient', 'Cited sources'],
    hasWebSearch: true,
    recommended: false,
    apiKeyUrl: 'https://www.perplexity.ai/settings/api',
  },
  {
    id: 'gpt-4o-search-preview',
    name: 'GPT-4o Search Preview',
    provider: 'openai',
    providerName: 'OpenAI',
    description: "GPT-4o with integrated web browsing. Combines OpenAI's advanced reasoning with live web access for comprehensive, up-to-date research.",
    strengths: ['Advanced reasoning', 'Live web search', 'Structured analysis', 'Comprehensive reports'],
    hasWebSearch: true,
    recommended: false,
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    providerName: 'OpenAI',
    description: "OpenAI's flagship model for analysis and synthesis. Best for deep reasoning on your uploaded data — knowledge cutoff applies.",
    strengths: ['Deep reasoning', 'Data analysis', 'Professional tone', 'Structured output'],
    hasWebSearch: false,
    recommended: false,
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    providerName: 'Google',
    description: "Google's fast multimodal model with Google Search grounding. Excellent for market data, financial benchmarks, and business intelligence.",
    strengths: ['Google Search grounding', 'Fast & accurate', 'Business intelligence', 'Broad knowledge'],
    hasWebSearch: true,
    recommended: false,
    apiKeyUrl: 'https://aistudio.google.com/apikey',
  },
];

const SUGGESTED_QUERIES = [
  'What is the average monthly burn rate for Series A SaaS startups in 2024?',
  'What are the typical runway benchmarks for pre-seed startups by industry?',
  'What is the current average cost to acquire a B2B SaaS customer (CAC)?',
  'What are the latest venture capital investment trends for early-stage startups?',
  'What is a healthy gross margin percentage for a SaaS company at seed stage?',
];

export function ResearchPanel() {
  const [selectedModelId, setSelectedModelId] = useState<string>('sonar-pro');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModels, setShowModels] = useState(false);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  const selectedModel = RESEARCH_MODELS.find((m) => m.id === selectedModelId) ?? RESEARCH_MODELS[0];

  useEffect(() => {
    if (results.length > 0) {
      resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results]);

  async function handleSearch(searchQuery?: string) {
    const q = searchQuery ?? query;
    if (!q.trim() || !apiKey.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q.trim(),
          model: selectedModel.id,
          provider: selectedModel.provider,
          apiKey: apiKey.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? `Request failed with status ${response.status}`);
      }

      const result: ResearchResult = {
        answer: data.answer,
        citations: data.citations ?? [],
        model: selectedModel.name,
        provider: selectedModel.provider,
        timestamp: Date.now(),
        query: q.trim(),
      };

      setResults((prev) => [result, ...prev]);
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          AI Research Agent
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Research financial benchmarks, market data, and industry insights using AI models with live web access
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Model Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">AI Model</Label>
            <button
              onClick={() => setShowModels((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Compare models
              {showModels ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger>
              <SelectValue>
                <div className="flex items-center gap-2">
                  {selectedModel.recommended && (
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                  )}
                  <span>{selectedModel.providerName} — {selectedModel.name}</span>
                  {selectedModel.hasWebSearch && (
                    <Globe className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {RESEARCH_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <div className="flex items-center gap-2">
                    {m.recommended && (
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    )}
                    <span>{m.providerName} — {m.name}</span>
                    {m.hasWebSearch && (
                      <Globe className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selected model info */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">{selectedModel.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedModel.strengths.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                >
                  {s}
                </span>
              ))}
            </div>
            {selectedModel.hasWebSearch && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Globe className="h-3.5 w-3.5" />
                <span>Has live web search — returns the latest available data</span>
              </div>
            )}
          </div>
        </div>

        {/* Model Comparison Table */}
        {showModels && (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Model</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">Web Search</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden sm:table-cell">Best For</th>
                </tr>
              </thead>
              <tbody>
                {RESEARCH_MODELS.map((m, i) => (
                  <tr
                    key={m.id}
                    onClick={() => { setSelectedModelId(m.id); setShowModels(false); }}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-muted/50',
                      i < RESEARCH_MODELS.length - 1 && 'border-b border-border',
                      m.id === selectedModelId && 'bg-blue-500/5'
                    )}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {m.recommended && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                        <div>
                          <p className="font-medium text-foreground">{m.name}</p>
                          <p className="text-muted-foreground">{m.providerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {m.hasWebSearch ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                      {m.strengths.slice(0, 2).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 py-2 bg-muted/30 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 inline mr-1" />
                Recommended for accurate, professional, and the latest data
              </p>
            </div>
          </div>
        )}

        {/* API Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="api-key" className="text-sm font-medium">API Key</Label>
            <a
              href={selectedModel.apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              Get key <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="relative">
            <Input
              id="api-key"
              type={showApiKey ? 'text' : 'password'}
              placeholder={`Enter your ${selectedModel.providerName} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-9 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowApiKey((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your key is used only for this request and is never stored.
          </p>
        </div>

        {/* Suggested Queries */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Suggested Research Topics</Label>
          <div className="space-y-1.5">
            {SUGGESTED_QUERIES.map((sq) => (
              <button
                key={sq}
                onClick={() => handleSearch(sq)}
                disabled={!apiKey.trim() || isLoading}
                className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted/50 hover:border-blue-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="h-3 w-3 inline mr-1.5 text-blue-500" />
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Query */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="research-query" className="text-sm font-medium">Custom Research Query</Label>
            <span className={cn('text-xs', query.length > 1800 ? 'text-yellow-600 dark:text-yellow-500' : 'text-muted-foreground')}>
              {query.length}/2000
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              id="research-query"
              placeholder="e.g. What is the average Series A valuation in 2024?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
              maxLength={2000}
            />
            <Button
              onClick={() => handleSearch()}
              disabled={!query.trim() || !apiKey.trim() || isLoading}
              size="sm"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!apiKey.trim() && (
            <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Enter your API key above to start researching
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Research failed</p>
              <p className="text-xs text-red-500/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">Research Results</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {results.map((result, idx) => (
              <div
                key={result.timestamp}
                className={cn(
                  'space-y-3 p-4 rounded-lg border border-border',
                  idx === 0 && 'border-blue-500/30 bg-blue-500/5'
                )}
              >
                {/* Query */}
                <div className="flex items-start gap-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-muted-foreground">{result.query}</p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-blue-500" />
                    {result.model}
                  </span>
                  {idx === 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">Latest</span>
                  )}
                </div>

                {/* Answer */}
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {result.answer}
                </div>

                {/* Citations */}
                {result.citations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Sources & Web Queries</p>
                    <div className="space-y-1">
                      {result.citations.map((citation, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <span className="text-blue-500 shrink-0">[{i + 1}]</span>
                          {citation.startsWith('http') ? (
                            <a
                              href={citation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-500 hover:underline break-all transition-colors"
                            >
                              {citation}
                            </a>
                          ) : (
                            <span>{citation}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div ref={resultsEndRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
