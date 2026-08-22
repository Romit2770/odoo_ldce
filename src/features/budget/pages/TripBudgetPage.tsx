import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  PieChart,
  Plus,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  TrendingDown,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExpenseCategory } from '@/types/domain';

export const TripBudgetPage: React.FC = () => {
  const { tripId = 'trip_1' } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const totalBudget = 1500;
  const [expenses, setExpenses] = useState([
    { id: 'e1', title: 'Flight to Mumbai', category: 'transport' as ExpenseCategory, amount: 180, date: '2026-09-10' },
    { id: 'e2', title: 'Hotel Colaba 3 nights', category: 'accommodation' as ExpenseCategory, amount: 150, date: '2026-09-10' },
    { id: 'e3', title: 'Elephanta Caves Tour & Ferry', category: 'activities' as ExpenseCategory, amount: 30, date: '2026-09-11' },
    { id: 'e4', title: 'Seafood Dinners', category: 'food' as ExpenseCategory, amount: 60, date: '2026-09-11' },
  ]);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('activities');

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentageUsed = ((totalSpent / totalBudget) * 100).toFixed(1);
  const isOverBudget = totalSpent > totalBudget;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setExpenses([
      ...expenses,
      {
        id: `e_${Date.now()}`,
        title,
        amount: Number(amount),
        category,
        date: new Date().toISOString().split('T')[0],
      },
    ]);

    setTitle('');
    setAmount('');
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/trips/${tripId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Trip Budget & Expenses
            </h1>
            <p className="text-xs text-slate-500">
              Track category breakdowns and real-time travel expenditure
            </p>
          </div>
        </div>
      </div>

      {/* Budget Metric Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Budget</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ${totalBudget}
            </div>
            <p className="text-xs text-slate-400 mt-1">Allocated limit</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Spent</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ${totalSpent}
            </div>
            <p className="text-xs text-slate-400 mt-1">{percentageUsed}% used</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${isOverBudget ? 'border-l-rose-500' : 'border-l-teal-500'}`}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">
              {isOverBudget ? 'Over Budget By' : 'Remaining Budget'}
            </span>
            <div className={`text-2xl font-bold mt-1 ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
              ${Math.abs(remainingBudget)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isOverBudget ? 'Budget exceeded' : 'Healthy balance'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase text-slate-400">Avg Cost / Day</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ${(totalSpent / 8).toFixed(1)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Over 8 total planned days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Budget Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expense Log List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recorded Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {expense.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="capitalize">{expense.category}</span>
                        <span>•</span>
                        <span>{expense.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      ${expense.amount}
                    </span>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Add Expense Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Title
                  </label>
                  <Input
                    placeholder="e.g. Scuba diving pass"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ($ USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Select
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    options={[
                      { label: 'Transport', value: 'transport' },
                      { label: 'Accommodation', value: 'accommodation' },
                      { label: 'Food & Dining', value: 'food' },
                      { label: 'Activities & Tours', value: 'activities' },
                      { label: 'Miscellaneous', value: 'miscellaneous' },
                    ]}
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2">
                  <Plus className="h-4 w-4 mr-1" />
                  Record Expense
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
