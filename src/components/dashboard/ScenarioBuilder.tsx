'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { calculateMetrics } from '@/lib/calculations';
import { formatCurrency, formatMonths, generateId, getScenarioColor, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Users, 
  TrendingDown, 
  Scissors, 
  DollarSign,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Scenario, PlannedChange } from '@/types';

const quickActions = [
  {
    id: 'hire',
    label: 'Hire Someone',
    icon: Users,
    type: 'hire' as const,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
  },
  {
    id: 'lose-revenue',
    label: 'Lose Revenue',
    icon: TrendingDown,
    type: 'revenue-change' as const,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20',
  },
  {
    id: 'cut-costs',
    label: 'Cut Costs',
    icon: Scissors,
    type: 'cost-change' as const,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
  },
  {
    id: 'one-time',
    label: 'One-time Expense',
    icon: DollarSign,
    type: 'one-time-expense' as const,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
  },
];

export function ScenarioBuilder() {
  const inputs = useStore((state) => state.inputs);
  const scenarios = useStore((state) => state.scenarios);
  const activeScenarioId = useStore((state) => state.activeScenarioId);
  const setActiveScenario = useStore((state) => state.setActiveScenario);
  const addScenario = useStore((state) => state.addScenario);
  const removeScenario = useStore((state) => state.removeScenario);
  const addChangeToScenario = useStore((state) => state.addChangeToScenario);
  const removeChangeFromScenario = useStore((state) => state.removeChangeFromScenario);

  const [isNewScenarioOpen, setIsNewScenarioOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<typeof quickActions[0] | null>(null);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  const [quickActionData, setQuickActionData] = useState({
    description: '',
    amount: '',
    month: '1',
  });

  const handleCreateScenario = () => {
    if (!newScenarioName.trim()) return;
    
    const newScenario: Scenario = {
      id: generateId(),
      name: newScenarioName,
      description: newScenarioDescription,
      isBase: false,
      changes: [],
      color: getScenarioColor(scenarios.length),
    };
    
    addScenario(newScenario);
    setActiveScenario(newScenario.id);
    setNewScenarioName('');
    setNewScenarioDescription('');
    setIsNewScenarioOpen(false);
  };

  const handleQuickAction = () => {
    if (!selectedAction || !activeScenarioId || activeScenarioId === 'base') return;
    
    const amount = parseFloat(quickActionData.amount);
    if (isNaN(amount)) return;

    const actionType = selectedAction.type;
    const change: PlannedChange = {
      id: generateId(),
      type: actionType,
      description: quickActionData.description || selectedAction.label,
      amount: actionType === 'revenue-change' || actionType === 'cost-change' 
        ? (selectedAction.id === 'lose-revenue' || selectedAction.id === 'cut-costs' ? -Math.abs(amount) : amount)
        : amount,
      month: parseInt(quickActionData.month),
      recurring: actionType !== 'one-time-expense',
    };

    addChangeToScenario(activeScenarioId, change);
    setQuickActionData({ description: '', amount: '', month: '1' });
    setIsQuickActionOpen(false);
    setSelectedAction(null);
  };

  const openQuickAction = (action: typeof quickActions[0]) => {
    setSelectedAction(action);
    setIsQuickActionOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Scenarios</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Compare different business strategies
            </p>
          </div>
          <Dialog open={isNewScenarioOpen} onOpenChange={setIsNewScenarioOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Scenario</DialogTitle>
                <DialogDescription>
                  Create a new scenario to test different strategies
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scenario-name">Name</Label>
                  <Input
                    id="scenario-name"
                    placeholder="e.g., Aggressive Growth"
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scenario-description">Description (optional)</Label>
                  <Input
                    id="scenario-description"
                    placeholder="e.g., Hire 3 engineers, increase marketing"
                    value={newScenarioDescription}
                    onChange={(e) => setNewScenarioDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewScenarioOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateScenario}>Create Scenario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scenario List */}
        <div className="space-y-2">
          {scenarios.map((scenario) => {
            const metrics = calculateMetrics(inputs, scenario.changes);
            const isActive = activeScenarioId === scenario.id;
            
            return (
              <div
                key={scenario.id}
                onClick={() => setActiveScenario(scenario.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  />
                  <div>
                    <p className="font-medium text-sm">{scenario.name}</p>
                    {scenario.description && (
                      <p className="text-xs text-muted-foreground">
                        {scenario.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatMonths(metrics.runway)}
                    </p>
                    <p className="text-xs text-muted-foreground">runway</p>
                  </div>
                  {!scenario.isBase && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeScenario(scenario.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions - only show for non-base scenarios */}
        {activeScenarioId && activeScenarioId !== 'base' && (
          <>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className={cn(
                      "h-auto py-3 flex flex-col items-center gap-1.5 border",
                      action.bgColor
                    )}
                    onClick={() => openQuickAction(action)}
                  >
                    <action.icon className={cn("h-5 w-5", action.color)} />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Changes */}
            {scenarios.find((s) => s.id === activeScenarioId)?.changes.length! > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Changes in this scenario</p>
                <div className="space-y-2">
                  {scenarios
                    .find((s) => s.id === activeScenarioId)
                    ?.changes.map((change) => (
                      <div
                        key={change.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <span>{change.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            change.amount > 0 ? "text-red-500" : "text-emerald-500"
                          )}>
                            {change.amount > 0 ? '+' : ''}{formatCurrency(change.amount)}/mo
                          </span>
                          <span className="text-muted-foreground text-xs">
                            M{change.month}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeChangeFromScenario(activeScenarioId, change.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick Action Dialog */}
        <Dialog open={isQuickActionOpen} onOpenChange={setIsQuickActionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAction && (
                  <>
                    <selectedAction.icon className={cn("h-5 w-5", selectedAction.color)} />
                    {selectedAction.label}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Add this change to your scenario
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="action-description">Description</Label>
                <Input
                  id="action-description"
                  placeholder={
                    selectedAction?.type === 'hire' ? "e.g., Senior Engineer" :
                    selectedAction?.type === 'revenue-change' ? "e.g., Lost client XYZ" :
                    selectedAction?.type === 'cost-change' ? "e.g., Reduce marketing" :
                    "e.g., Equipment purchase"
                  }
                  value={quickActionData.description}
                  onChange={(e) => setQuickActionData({ ...quickActionData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action-amount">
                  {selectedAction?.type === 'hire' ? 'Monthly Salary ($)' :
                   selectedAction?.type === 'one-time-expense' ? 'Amount ($)' :
                   'Monthly Amount ($)'}
                </Label>
                <Input
                  id="action-amount"
                  type="number"
                  placeholder="e.g., 10000"
                  value={quickActionData.amount}
                  onChange={(e) => setQuickActionData({ ...quickActionData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action-month">Starting Month</Label>
                <Select
                  value={quickActionData.month}
                  onValueChange={(value) => setQuickActionData({ ...quickActionData, month: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Month {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsQuickActionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleQuickAction}>
                Add Change
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
