import { Budget, Expense } from '@/types/domain';
import { apiClient } from './client';

export interface AddExpenseDTO {
  tripId: string;
  tripStopId?: string;
  tripActivityId?: string;
  title: string;
  category: Expense['category'];
  amount: number;
  currency: string;
  date: string;
  notes?: string;
}

export const budgetApi = {
  async getTripBudget(tripId: string): Promise<Budget> {
    try {
      return await apiClient.get<Budget>(`/trips/${tripId}/budget`);
    } catch {
      return {
        id: `bud_${tripId}`,
        tripId,
        totalBudget: 1500,
        currency: 'USD',
        totalSpent: 420,
        remainingBudget: 1080,
        averageCostPerDay: 52.5,
        budgetPercentageUsed: 28,
        isOverBudget: false,
        categories: [
          { category: 'transport', allocatedAmount: 400, spentAmount: 180, percentageUsed: 45 },
          { category: 'accommodation', allocatedAmount: 500, spentAmount: 150, percentageUsed: 30 },
          { category: 'food', allocatedAmount: 300, spentAmount: 60, percentageUsed: 20 },
          { category: 'activities', allocatedAmount: 200, spentAmount: 30, percentageUsed: 15 },
          { category: 'miscellaneous', allocatedAmount: 100, spentAmount: 0, percentageUsed: 0 },
        ],
      };
    }
  },

  async addExpense(dto: AddExpenseDTO): Promise<Expense> {
    return apiClient.post<Expense>('/expenses', dto);
  },

  async deleteExpense(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/expenses/${id}`);
  },
};
