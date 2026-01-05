import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FinancialState,
  FinancialInputs,
  CashPosition,
  RevenueStream,
  CostCategory,
  TeamMember,
  Scenario,
  PlannedChange,
} from '@/types';
import { defaultInputs, defaultScenarios, sampleInputs, sampleScenarios } from '@/data/sampleData';
import { generateId, getScenarioColor } from '@/lib/utils';

export const useStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      inputs: defaultInputs,
      scenarios: defaultScenarios,
      activeScenarioId: 'base',
      projectionMonths: 24,

      setInputs: (inputs: Partial<FinancialInputs>) =>
        set((state) => ({
          inputs: { ...state.inputs, ...inputs },
        })),

      setCash: (cash: Partial<CashPosition>) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            cash: { ...state.inputs.cash, ...cash },
          },
        })),

      addRevenue: (revenue: RevenueStream) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            revenue: [...state.inputs.revenue, revenue],
          },
        })),

      updateRevenue: (id: string, revenue: Partial<RevenueStream>) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            revenue: state.inputs.revenue.map((r) =>
              r.id === id ? { ...r, ...revenue } : r
            ),
          },
        })),

      removeRevenue: (id: string) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            revenue: state.inputs.revenue.filter((r) => r.id !== id),
          },
        })),

      addCost: (cost: CostCategory) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            costs: [...state.inputs.costs, cost],
          },
        })),

      updateCost: (id: string, cost: Partial<CostCategory>) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            costs: state.inputs.costs.map((c) =>
              c.id === id ? { ...c, ...cost } : c
            ),
          },
        })),

      removeCost: (id: string) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            costs: state.inputs.costs.filter((c) => c.id !== id),
          },
        })),

      addTeamMember: (member: TeamMember) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            team: [...state.inputs.team, member],
          },
        })),

      updateTeamMember: (id: string, member: Partial<TeamMember>) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            team: state.inputs.team.map((m) =>
              m.id === id ? { ...m, ...member } : m
            ),
          },
        })),

      removeTeamMember: (id: string) =>
        set((state) => ({
          inputs: {
            ...state.inputs,
            team: state.inputs.team.filter((m) => m.id !== id),
          },
        })),

      addScenario: (scenario: Scenario) =>
        set((state) => ({
          scenarios: [...state.scenarios, scenario],
        })),

      updateScenario: (id: string, scenario: Partial<Scenario>) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id ? { ...s, ...scenario } : s
          ),
        })),

      removeScenario: (id: string) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          activeScenarioId:
            state.activeScenarioId === id ? 'base' : state.activeScenarioId,
        })),

      setActiveScenario: (id: string) =>
        set({ activeScenarioId: id }),

      addChangeToScenario: (scenarioId: string, change: PlannedChange) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId
              ? { ...s, changes: [...s.changes, change] }
              : s
          ),
        })),

      removeChangeFromScenario: (scenarioId: string, changeId: string) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId
              ? { ...s, changes: s.changes.filter((c) => c.id !== changeId) }
              : s
          ),
        })),

      loadSampleData: () =>
        set({
          inputs: sampleInputs,
          scenarios: sampleScenarios,
          activeScenarioId: 'base',
        }),

      resetAll: () =>
        set({
          inputs: defaultInputs,
          scenarios: defaultScenarios,
          activeScenarioId: 'base',
        }),
    }),
    {
      name: 'runwise-storage',
      partialize: (state) => ({
        inputs: state.inputs,
        scenarios: state.scenarios,
        activeScenarioId: state.activeScenarioId,
      }),
    }
  )
);

// Helper hook to get current scenario
export function useCurrentScenario() {
  const scenarios = useStore((state) => state.scenarios);
  const activeScenarioId = useStore((state) => state.activeScenarioId);
  return scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
}

// Helper hook to create a new scenario
export function useCreateScenario() {
  const addScenario = useStore((state) => state.addScenario);
  const scenarios = useStore((state) => state.scenarios);

  return (name: string, description: string = '') => {
    const newScenario: Scenario = {
      id: generateId(),
      name,
      description,
      isBase: false,
      changes: [],
      color: getScenarioColor(scenarios.length),
    };
    addScenario(newScenario);
    return newScenario;
  };
}
