import { apiClient } from "./client";

export type ExpenseItem = {
  id: string;
  dbId?: number;
  tripId: number;
  userId?: number;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string;
};

export type BudgetSummary = {
  id: string;
  tripId: number;
  currency: string;
  totalBudget: number;
  buffetIncluded: boolean;
  totalEstimated: number;
  totalActual: number;
  remainingBudget: number;
  breakdown: Record<string, number>;
};

export const budgetService = {
  async getBudget(tripId: string): Promise<BudgetSummary> {
    return apiClient<BudgetSummary>(`/trips/${encodeURIComponent(tripId)}/budget`);
  },

  async toggleBuffet(tripId: string): Promise<BudgetSummary> {
    return apiClient<BudgetSummary>(`/trips/${encodeURIComponent(tripId)}/budget/toggle-buffet`, {
      method: "POST",
    });
  },

  async getExpenses(tripId: string): Promise<ExpenseItem[]> {
    return apiClient<ExpenseItem[]>(`/trips/${encodeURIComponent(tripId)}/expenses`);
  },

  async addExpense(
    tripId: string,
    expense: { category: string; description: string; amount: number; date?: string; notes?: string }
  ): Promise<ExpenseItem> {
    return apiClient<ExpenseItem>(`/trips/${encodeURIComponent(tripId)}/expenses`, {
      method: "POST",
      body: JSON.stringify(expense),
    });
  },

  async deleteExpense(tripId: string, expenseId: number | string): Promise<{ deletedExpenseId: number }> {
    return apiClient<{ deletedExpenseId: number }>(`/trips/${encodeURIComponent(tripId)}/expenses/${expenseId}`, {
      method: "DELETE",
    });
  },
};
