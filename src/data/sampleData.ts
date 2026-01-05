import { FinancialInputs, Scenario } from '@/types';
import { generateId, getScenarioColor } from '@/lib/utils';

export const sampleInputs: FinancialInputs = {
  company: {
    name: 'TechStartup Inc.',
    industry: 'SaaS',
    stage: 'seed',
  },
  cash: {
    currentBalance: 850000,
    creditLine: 0,
  },
  revenue: [
    {
      id: generateId(),
      name: 'MRR - Subscriptions',
      type: 'recurring',
      amount: 45000,
      growthRate: 0.08, // 8% monthly growth
    },
    {
      id: generateId(),
      name: 'Enterprise Contract - Acme Corp',
      type: 'contract',
      amount: 8000,
      growthRate: 0,
      startMonth: 0,
      endMonth: 11, // 12 month contract
    },
  ],
  costs: [
    {
      id: generateId(),
      name: 'Office & Operations',
      type: 'operations',
      amount: 8500,
      isFixed: true,
    },
    {
      id: generateId(),
      name: 'Cloud Infrastructure',
      type: 'tools',
      amount: 12000,
      isFixed: false,
    },
    {
      id: generateId(),
      name: 'Marketing & Ads',
      type: 'marketing',
      amount: 15000,
      isFixed: false,
    },
    {
      id: generateId(),
      name: 'Software & Tools',
      type: 'tools',
      amount: 3500,
      isFixed: true,
    },
    {
      id: generateId(),
      name: 'Professional Services',
      type: 'other',
      amount: 5000,
      isFixed: true,
    },
  ],
  team: [
    { id: generateId(), role: 'CEO / Founder', salary: 12000, startMonth: 0 },
    { id: generateId(), role: 'CTO / Co-founder', salary: 12000, startMonth: 0 },
    { id: generateId(), role: 'Senior Engineer', salary: 15000, startMonth: 0 },
    { id: generateId(), role: 'Full Stack Engineer', salary: 13000, startMonth: 0 },
    { id: generateId(), role: 'Product Designer', salary: 11000, startMonth: 0 },
    { id: generateId(), role: 'Marketing Lead', salary: 10000, startMonth: 0 },
  ],
};

export const sampleScenarios: Scenario[] = [
  {
    id: 'base',
    name: 'Base Case',
    description: 'Current trajectory with no changes',
    isBase: true,
    changes: [],
    color: getScenarioColor(0),
  },
  {
    id: 'growth',
    name: 'Growth Mode',
    description: 'Hire 2 engineers, increase marketing',
    isBase: false,
    changes: [
      {
        id: generateId(),
        type: 'hire',
        description: 'Senior Backend Engineer',
        amount: 14000,
        month: 2,
        recurring: true,
      },
      {
        id: generateId(),
        type: 'hire',
        description: 'Frontend Engineer',
        amount: 12000,
        month: 3,
        recurring: true,
      },
      {
        id: generateId(),
        type: 'cost-change',
        description: 'Increase marketing budget',
        amount: 10000,
        month: 2,
        recurring: true,
      },
    ],
    color: getScenarioColor(1),
  },
  {
    id: 'survival',
    name: 'Survival Mode',
    description: 'Cut costs by 25% across the board',
    isBase: false,
    changes: [
      {
        id: generateId(),
        type: 'cost-change',
        description: 'Reduce marketing spend',
        amount: -10000,
        month: 1,
        recurring: true,
      },
      {
        id: generateId(),
        type: 'cost-change',
        description: 'Cut operations costs',
        amount: -5000,
        month: 1,
        recurring: true,
      },
    ],
    color: getScenarioColor(2),
  },
  {
    id: 'client-loss',
    name: 'Lose Big Client',
    description: 'What if Acme Corp cancels early?',
    isBase: false,
    changes: [
      {
        id: generateId(),
        type: 'revenue-change',
        description: 'Acme Corp cancellation',
        amount: -8000,
        month: 3,
        recurring: true,
      },
    ],
    color: getScenarioColor(3),
  },
];

export const defaultInputs: FinancialInputs = {
  company: {
    name: 'My Company',
    industry: 'Technology',
    stage: 'seed',
  },
  cash: {
    currentBalance: 500000,
    creditLine: 0,
  },
  revenue: [],
  costs: [],
  team: [],
};

export const defaultScenarios: Scenario[] = [
  {
    id: 'base',
    name: 'Base Case',
    description: 'Current trajectory with no changes',
    isBase: true,
    changes: [],
    color: getScenarioColor(0),
  },
];
