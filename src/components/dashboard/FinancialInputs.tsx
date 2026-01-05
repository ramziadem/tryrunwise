'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrencyFull, generateId, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DollarSign, 
  TrendingUp, 
  Building2, 
  Users,
  Pencil,
} from 'lucide-react';
import { RevenueStream, CostCategory, TeamMember } from '@/types';

export function FinancialInputs() {
  const inputs = useStore((state) => state.inputs);
  const setCash = useStore((state) => state.setCash);
  const addRevenue = useStore((state) => state.addRevenue);
  const updateRevenue = useStore((state) => state.updateRevenue);
  const removeRevenue = useStore((state) => state.removeRevenue);
  const addCost = useStore((state) => state.addCost);
  const updateCost = useStore((state) => state.updateCost);
  const removeCost = useStore((state) => state.removeCost);
  const addTeamMember = useStore((state) => state.addTeamMember);
  const updateTeamMember = useStore((state) => state.updateTeamMember);
  const removeTeamMember = useStore((state) => state.removeTeamMember);

  const [activeTab, setActiveTab] = useState('cash');
  
  // Dialog states
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  
  // Form states
  const [revenueForm, setRevenueForm] = useState<Partial<RevenueStream>>({
    name: '',
    type: 'recurring',
    amount: 0,
    growthRate: 0,
  });
  const [costForm, setCostForm] = useState<Partial<CostCategory>>({
    name: '',
    type: 'operations',
    amount: 0,
    isFixed: true,
  });
  const [teamForm, setTeamForm] = useState<Partial<TeamMember>>({
    role: '',
    salary: 0,
    startMonth: 0,
  });

  const handleAddRevenue = () => {
    if (!revenueForm.name || !revenueForm.amount) return;
    addRevenue({
      id: generateId(),
      name: revenueForm.name,
      type: revenueForm.type || 'recurring',
      amount: revenueForm.amount,
      growthRate: (revenueForm.growthRate || 0) / 100,
    });
    setRevenueForm({ name: '', type: 'recurring', amount: 0, growthRate: 0 });
    setIsRevenueDialogOpen(false);
  };

  const handleAddCost = () => {
    if (!costForm.name || !costForm.amount) return;
    addCost({
      id: generateId(),
      name: costForm.name,
      type: costForm.type || 'operations',
      amount: costForm.amount,
      isFixed: costForm.isFixed ?? true,
    });
    setCostForm({ name: '', type: 'operations', amount: 0, isFixed: true });
    setIsCostDialogOpen(false);
  };

  const handleAddTeamMember = () => {
    if (!teamForm.role || !teamForm.salary) return;
    addTeamMember({
      id: generateId(),
      role: teamForm.role,
      salary: teamForm.salary,
      startMonth: teamForm.startMonth || 0,
    });
    setTeamForm({ role: '', salary: 0, startMonth: 0 });
    setIsTeamDialogOpen(false);
  };

  const totalRevenue = inputs.revenue.reduce((sum, r) => sum + r.amount, 0);
  const totalCosts = inputs.costs.reduce((sum, c) => sum + c.amount, 0);
  const totalPayroll = inputs.team.reduce((sum, t) => sum + t.salary, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Financial Inputs</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your company's financial data
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cash" className="text-xs sm:text-sm">
              <DollarSign className="h-4 w-4 mr-1 hidden sm:inline" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="costs" className="text-xs sm:text-sm">
              <Building2 className="h-4 w-4 mr-1 hidden sm:inline" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1 hidden sm:inline" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Cash Tab */}
          <TabsContent value="cash" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="cash-balance">Cash in Bank</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cash-balance"
                  type="number"
                  placeholder="500000"
                  className="pl-9"
                  value={inputs.cash.currentBalance || ''}
                  onChange={(e) => setCash({ currentBalance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Current bank balance available for operations
              </p>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Monthly Revenue</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {formatCurrencyFull(totalRevenue)}
                </p>
              </div>
              <Dialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Revenue Stream</DialogTitle>
                    <DialogDescription>
                      Add a new source of revenue
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="e.g., MRR - Subscriptions"
                        value={revenueForm.name || ''}
                        onChange={(e) => setRevenueForm({ ...revenueForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={revenueForm.type}
                        onValueChange={(value: 'recurring' | 'one-time' | 'contract') => 
                          setRevenueForm({ ...revenueForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recurring">Recurring (MRR)</SelectItem>
                          <SelectItem value="one-time">One-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Amount ($)</Label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={revenueForm.amount || ''}
                        onChange={(e) => setRevenueForm({ ...revenueForm, amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    {revenueForm.type === 'recurring' && (
                      <div className="space-y-2">
                        <Label>Monthly Growth Rate (%)</Label>
                        <Input
                          type="number"
                          placeholder="5"
                          value={revenueForm.growthRate || ''}
                          onChange={(e) => setRevenueForm({ ...revenueForm, growthRate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRevenueDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddRevenue}>Add Revenue</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {inputs.revenue.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No revenue streams added yet
                </p>
              ) : (
                inputs.revenue.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{rev.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {rev.type === 'recurring' && rev.growthRate > 0
                          ? `${(rev.growthRate * 100).toFixed(1)}% monthly growth`
                          : rev.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-500">
                        {formatCurrencyFull(rev.amount)}/mo
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRevenue(rev.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Monthly Costs (excl. payroll)</p>
                <p className="text-2xl font-bold text-orange-500">
                  {formatCurrencyFull(totalCosts)}
                </p>
              </div>
              <Dialog open={isCostDialogOpen} onOpenChange={setIsCostDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Cost Category</DialogTitle>
                    <DialogDescription>
                      Add a recurring operating cost
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="e.g., Cloud Infrastructure"
                        value={costForm.name || ''}
                        onChange={(e) => setCostForm({ ...costForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={costForm.type}
                        onValueChange={(value: CostCategory['type']) => 
                          setCostForm({ ...costForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="tools">Tools & Software</SelectItem>
                          <SelectItem value="rent">Rent & Utilities</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Amount ($)</Label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={costForm.amount || ''}
                        onChange={(e) => setCostForm({ ...costForm, amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCostDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCost}>Add Cost</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {inputs.costs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No costs added yet
                </p>
              ) : (
                inputs.costs.map((cost) => (
                  <div
                    key={cost.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{cost.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{cost.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-500">
                        {formatCurrencyFull(cost.amount)}/mo
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeCost(cost.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Monthly Payroll</p>
                <p className="text-2xl font-bold text-blue-500">
                  {formatCurrencyFull(totalPayroll)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inputs.team.length} team member{inputs.team.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Add a team member with their fully-loaded monthly cost
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        placeholder="e.g., Senior Engineer"
                        value={teamForm.role || ''}
                        onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Salary ($)</Label>
                      <Input
                        type="number"
                        placeholder="12000"
                        value={teamForm.salary || ''}
                        onChange={(e) => setTeamForm({ ...teamForm, salary: parseFloat(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Include benefits, taxes, etc. (fully-loaded cost)
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTeamMember}>Add Member</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {inputs.team.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No team members added yet
                </p>
              ) : (
                inputs.team.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-500">
                        {formatCurrencyFull(member.salary)}/mo
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
