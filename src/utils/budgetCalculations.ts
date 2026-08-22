import { Expense, ExpenseCategory, BudgetCategoryBreakdown } from '@/types/domain';

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  averageCostPerDay: number;
  budgetPercentageUsed: number;
  isOverBudget: boolean;
  categories: BudgetCategoryBreakdown[];
}

export function computeBudgetSummary(
  totalBudget: number,
  expenses: Expense[],
  totalDays: number
): BudgetSummary {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const averageCostPerDay = totalDays > 0 ? totalSpent / totalDays : 0;
  const budgetPercentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;

  const categoryMap: Record<ExpenseCategory, number> = {
    transport: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    miscellaneous: 0,
  };

  expenses.forEach((expense) => {
    if (categoryMap[expense.category] !== undefined) {
      categoryMap[expense.category] += expense.amount;
    } else {
      categoryMap.miscellaneous += expense.amount;
    }
  });

  const categories: BudgetCategoryBreakdown[] = Object.entries(categoryMap).map(
    ([cat, spent]) => {
      const category = cat as ExpenseCategory;
      // In full implementation, allocated amounts can be customized per category
      const allocatedAmount = totalBudget * 0.2; 
      const percentageUsed = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
      return {
        category,
        allocatedAmount,
        spentAmount: spent,
        percentageUsed: Number(percentageUsed.toFixed(1)),
      };
    }
  );

  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    averageCostPerDay: Number(averageCostPerDay.toFixed(2)),
    budgetPercentageUsed: Number(budgetPercentageUsed.toFixed(1)),
    isOverBudget,
    categories,
  };
}
