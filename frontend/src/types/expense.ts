
export type ExpenseCategory = 'food' | 'transport' | 'utilities' | 'entertainment' | 'shopping' | 'other' | 'income';
export type TransactionType = 'expense' | 'income';

export interface Expense {
  _id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  type: TransactionType;
}
