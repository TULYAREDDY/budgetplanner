import React, { createContext, useState, useContext, ReactNode } from 'react';

export type ExpensePriority = 'High' | 'Medium' | 'Low';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  priority: ExpensePriority;
  isLocked?: boolean;
  isFixed?: boolean;
}

export interface EMIPlan {
  id: string;
  type: string;
  loanAmount: number;
  interestRate: number;
  durationMonths: number;
  necessity: number; // 1-10 scale
  monthlyPayment: number;
  score?: number;
}

export interface BudgetGoal {
  type: 'Savings' | 'Investment' | 'Purchase';
  targetAmount: number;
  targetDate?: Date;
  description: string;
}

export interface WeeklySpend {
  week: number;
  amount: number;
  date: Date;
}

interface BudgetContextType {
  income: number;
  setIncome: (income: number) => void;
  fixedExpenses: Expense[];
  setFixedExpenses: (expenses: Expense[]) => void;
  reducibleExpenses: Expense[];
  setReducibleExpenses: (expenses: Expense[]) => void;
  emiPlans: EMIPlan[];
  setEmiPlans: (plans: EMIPlan[]) => void;
  goal: BudgetGoal | null;
  setGoal: (goal: BudgetGoal | null) => void;
  lifestyleType: string;
  setLifestyleType: (type: string) => void;
  weeklySpends: WeeklySpend[];
  addWeeklySpend: (spend: WeeklySpend) => void;
  optimizedExpenses: Expense[] | null;
  setOptimizedExpenses: (expenses: Expense[] | null) => void;
  recommendedEMIPlan: EMIPlan | null;
  setRecommendedEMIPlan: (plan: EMIPlan | null) => void;
  alerts: string[];
  setAlerts: (alerts: string[]) => void;
  tips: string[];
  setTips: (tips: string[]) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [income, setIncome] = useState<number>(0);
  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>([]);
  const [reducibleExpenses, setReducibleExpenses] = useState<Expense[]>([]);
  const [emiPlans, setEmiPlans] = useState<EMIPlan[]>([]);
  const [goal, setGoal] = useState<BudgetGoal | null>(null);
  const [lifestyleType, setLifestyleType] = useState<string>('Moderate');
  const [weeklySpends, setWeeklySpends] = useState<WeeklySpend[]>([]);
  const [optimizedExpenses, setOptimizedExpenses] = useState<Expense[] | null>(null);
  const [recommendedEMIPlan, setRecommendedEMIPlan] = useState<EMIPlan | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);

  const addWeeklySpend = (spend: WeeklySpend) => {
    setWeeklySpends([...weeklySpends, spend]);
  };

  const value = {
    income,
    setIncome,
    fixedExpenses,
    setFixedExpenses,
    reducibleExpenses,
    setReducibleExpenses,
    emiPlans,
    setEmiPlans,
    goal,
    setGoal,
    lifestyleType,
    setLifestyleType,
    weeklySpends,
    addWeeklySpend,
    optimizedExpenses,
    setOptimizedExpenses,
    recommendedEMIPlan,
    setRecommendedEMIPlan,
    alerts,
    setAlerts,
    tips,
    setTips
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};