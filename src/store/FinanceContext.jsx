// ─── Finance Context ───
// Global state provider for the entire financial data tree.

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import sampleData from '@/constants/sampleData';
import { saveToStorage, loadFromStorage } from '@/services/storage';

const FinanceContext = createContext(null);
const FinanceDispatchContext = createContext(null);

// ─── Action Types ───
export const ACTIONS = {
  // Data management
  LOAD_DATA:          'LOAD_DATA',
  RESET_TO_SAMPLE:    'RESET_TO_SAMPLE',
  IMPORT_DATA:        'IMPORT_DATA',

  // Profile
  UPDATE_PROFILE:     'UPDATE_PROFILE',

  // Income
  UPDATE_INCOME:      'UPDATE_INCOME',

  // Assets
  ADD_ASSET:          'ADD_ASSET',
  UPDATE_ASSET:       'UPDATE_ASSET',
  DELETE_ASSET:       'DELETE_ASSET',

  // Liabilities
  ADD_LIABILITY:      'ADD_LIABILITY',
  UPDATE_LIABILITY:   'UPDATE_LIABILITY',
  DELETE_LIABILITY:    'DELETE_LIABILITY',

  // Tax deductions
  UPDATE_TAX_DEDUCTIONS: 'UPDATE_TAX_DEDUCTIONS',

  // Budget
  UPDATE_BUDGET_ITEM: 'UPDATE_BUDGET_ITEM',
  ADD_BUDGET_ITEM:    'ADD_BUDGET_ITEM',
  DELETE_BUDGET_ITEM: 'DELETE_BUDGET_ITEM',

  // Goals
  ADD_GOAL:           'ADD_GOAL',
  UPDATE_GOAL:        'UPDATE_GOAL',
  DELETE_GOAL:        'DELETE_GOAL',

  // Insurance
  UPDATE_INSURANCE:   'UPDATE_INSURANCE',

  // UI State
  SET_ACTIVE_MODULE:  'SET_ACTIVE_MODULE',
  TOGGLE_AGENT:       'TOGGLE_AGENT',
};

// ─── Reducer ───
function financeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_DATA:
      return { ...state, ...action.payload };

    case ACTIONS.RESET_TO_SAMPLE:
      return { ...state, ...sampleData };

    case ACTIONS.IMPORT_DATA:
      return { ...state, ...action.payload };

    case ACTIONS.UPDATE_PROFILE:
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case ACTIONS.UPDATE_INCOME:
      return {
        ...state,
        income: {
          monthly: { ...state.income.monthly, ...action.payload.monthly },
          annual: { ...state.income.annual, ...action.payload.annual },
        },
      };

    case ACTIONS.ADD_ASSET:
      return { ...state, assets: [...state.assets, action.payload] };

    case ACTIONS.UPDATE_ASSET:
      return {
        ...state,
        assets: state.assets.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        ),
      };

    case ACTIONS.DELETE_ASSET:
      return { ...state, assets: state.assets.filter((a) => a.id !== action.payload) };

    case ACTIONS.ADD_LIABILITY:
      return { ...state, liabilities: [...state.liabilities, action.payload] };

    case ACTIONS.UPDATE_LIABILITY:
      return {
        ...state,
        liabilities: state.liabilities.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload } : l
        ),
      };

    case ACTIONS.DELETE_LIABILITY:
      return { ...state, liabilities: state.liabilities.filter((l) => l.id !== action.payload) };

    case ACTIONS.UPDATE_TAX_DEDUCTIONS:
      return { ...state, taxDeductions: { ...state.taxDeductions, ...action.payload } };

    case ACTIONS.UPDATE_BUDGET_ITEM:
      return {
        ...state,
        budget: {
          ...state.budget,
          expenses: state.budget.expenses.map((e, i) =>
            i === action.payload.index ? { ...e, ...action.payload.data } : e
          ),
        },
      };

    case ACTIONS.ADD_BUDGET_ITEM:
      return {
        ...state,
        budget: {
          ...state.budget,
          expenses: [...state.budget.expenses, action.payload],
        },
      };

    case ACTIONS.DELETE_BUDGET_ITEM:
      return {
        ...state,
        budget: {
          ...state.budget,
          expenses: state.budget.expenses.filter((_, i) => i !== action.payload),
        },
      };

    case ACTIONS.ADD_GOAL:
      return { ...state, goals: [...state.goals, action.payload] };

    case ACTIONS.UPDATE_GOAL:
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g
        ),
      };

    case ACTIONS.DELETE_GOAL:
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };

    case ACTIONS.UPDATE_INSURANCE:
      return { ...state, insurance: { ...state.insurance, ...action.payload } };

    case ACTIONS.SET_ACTIVE_MODULE:
      return { ...state, _ui: { ...state._ui, activeModule: action.payload } };

    case ACTIONS.TOGGLE_AGENT:
      return { ...state, _ui: { ...state._ui, agentOpen: !state._ui?.agentOpen } };

    default:
      console.warn(`Unknown action: ${action.type}`);
      return state;
  }
}

// ─── Initial State ───
const initialUIState = {
  activeModule: 'dashboard',
  agentOpen: false,
};

function getInitialState() {
  const saved = loadFromStorage();
  const data = saved || sampleData;
  return {
    ...data,
    _ui: initialUIState,
  };
}

// ─── Provider ───
export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, null, getInitialState);

  // Auto-save on state changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Strip UI state before saving
      const { _ui, ...dataToSave } = state;
      saveToStorage(dataToSave);
    }, 500);

    return () => clearTimeout(timer);
  }, [state]);

  return (
    <FinanceContext.Provider value={state}>
      <FinanceDispatchContext.Provider value={dispatch}>
        {children}
      </FinanceDispatchContext.Provider>
    </FinanceContext.Provider>
  );
}

// ─── Hooks ───
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
}

export function useFinanceDispatch() {
  const context = useContext(FinanceDispatchContext);
  if (!context) {
    throw new Error('useFinanceDispatch must be used within FinanceProvider');
  }
  return context;
}
