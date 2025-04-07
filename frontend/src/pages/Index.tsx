// src/pages/Index.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import { Expense } from "@/types/expense";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";
import { fetchTransactions, createTransaction } from "../api/transaction";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip
} from "recharts";
import { useNotifications } from "../context/NotificationContext";

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4D4D4'];

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { toast } = useToast();
  const { addNotification, notifications, removeNotificationByMessage } = useNotifications();

  // Load expenses from backend.
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await fetchTransactions();
        setExpenses(data);
      } catch (error) {
        console.error("Error loading expenses:", error);
        toast({
          title: "Error",
          description: "Could not load your expense data",
          variant: "destructive",
        });
      }
    };
    loadExpenses();
  }, [toast]);

  // Check expense ratio and add or remove notification accordingly.
  useEffect(() => {
    const totalExpenses = expenses
      .filter(e => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = expenses
      .filter(e => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0);

    const notificationMessage = "Warning: You have used over 90% of your income!";

    if (totalIncome > 0 && totalExpenses / totalIncome > 0.9) {
      // Only add if notification doesn't already exist.
      const existing = notifications.find(n => n.message === notificationMessage);
      if (!existing) {
        addNotification({
          id: new Date().toISOString(),
          message: notificationMessage,
          createdAt: new Date(),
          read: false,
        });
      }
    } else {
      // Remove the notification if condition no longer met.
      removeNotificationByMessage(notificationMessage);
    }
  }, [expenses, addNotification, notifications, removeNotificationByMessage]);

  const handleAddExpense = async (newExpense: Omit<Expense, "id">) => {
    try {
      const created = await createTransaction(newExpense);
      setExpenses([created, ...expenses]);
      toast({
        title: "Success",
        description: `${newExpense.type === "income" ? "Income" : "Expense"} added successfully`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to add expense";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Compute totals.
  const totalExpenses = expenses
    .filter(e => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses
    .filter(e => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Calculate category-wise expenses for pie chart.
  const categoryData = expenses
    .filter(e => e.type === "expense")
    .reduce((acc, expense) => {
      const existing = acc.find(item => item.name === expense.category);
      if (existing) {
        existing.value += expense.amount;
      } else {
        acc.push({ name: expense.category, value: expense.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  // Calculate monthly expenses for bar chart.
  const monthlyData = expenses
    .filter(e => e.type === "expense")
    .reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString("default", { month: "short" });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        acc.push({ month, amount: expense.amount });
      }
      return acc;
    }, [] as { month: string; amount: number }[])
    .sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

  // Prepare data for income vs expense chart.
  const incomeVsExpenseData = [
    { name: "Income", value: totalIncome, fill: "#4ECDC4" },
    { name: "Expenses", value: totalExpenses, fill: "#FF6B6B" },
  ];

  // Generate insights.
  const generateInsights = () => {
    const insights: string[] = [];
    if (expenses.length > 0) {
      if (totalExpenses > totalIncome) {
        insights.push("Your expenses exceed your income. Consider budgeting to balance your finances.");
      } else if (totalIncome > 0 && totalExpenses > 0) {
        const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
        if (savingsRate > 20) {
          insights.push(`Great job! You're saving ${savingsRate.toFixed(0)}% of your income.`);
        } else if (savingsRate > 0) {
          insights.push(`You're saving ${savingsRate.toFixed(0)}% of your income. Aim for 20% for financial health.`);
        }
      }
      if (categoryData.length > 0) {
        const highestCategory = [...categoryData].sort((a, b) => b.value - a.value)[0];
        insights.push(`Your highest spending category is ${highestCategory.name} at $${highestCategory.value.toFixed(2)}.`);
      }
    } else {
      insights.push("Add your first transaction to see personalized financial insights.");
    }
    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="container mx-auto space-y-6 px-4">
      {/* Top Section: Transaction Form & Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 glass-card hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="text-gradient">Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ExpenseForm onAddExpense={handleAddExpense} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-gradient">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="metric-card">
                <p className="text-lg font-semibold text-green-400">Income</p>
                <p className="text-2xl text-gradient">${totalIncome.toFixed(2)}</p>
              </div>
              <div className="metric-card">
                <p className="text-lg font-semibold text-red-400">Expenses</p>
                <p className="text-2xl text-gradient">${totalExpenses.toFixed(2)}</p>
              </div>
              <div className="metric-card">
                <p className="text-lg font-semibold text-blue-400">Balance</p>
                <p className="text-2xl text-gradient">${balance.toFixed(2)}</p>
              </div>
            </div>
            <div className="h-[250px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeVsExpenseData}
                  layout="vertical"
                  margin={{ top: 20, right: 20, left: 60, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                  <XAxis type="number" stroke="#fff" />
                  <YAxis dataKey="name" type="category" stroke="#fff" width={80} />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} minPointSize={5}>
                    {incomeVsExpenseData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Card className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-0 mb-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <CardTitle className="text-gradient text-lg">AI-Powered Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="space-y-2">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Second Section: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="text-gradient">Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="h-[300px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Add transactions to see expense distribution</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="text-gradient">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="h-[300px]">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                    <Bar dataKey="amount" fill="#4ECDC4" minPointSize={5}>
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Add transactions to see monthly expenses</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Section: Recent Transactions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-gradient">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ExpenseList expenses={expenses} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
