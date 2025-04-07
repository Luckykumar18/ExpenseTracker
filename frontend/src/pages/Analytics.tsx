// src/pages/Analytics.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Treemap,
  BarChart,
  Bar
} from "recharts";
import { Expense } from "@/types/expense";
import { useToast } from "@/components/ui/use-toast";
import { fetchTransactions } from "../api/transaction";

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4D4D4'];

const Analytics = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { toast } = useToast();

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

  // Calculate category-wise expenses for PieChart.
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

  // Calculate monthly data for LineChart (trend analysis).
  const monthlyData = expenses
    .filter(e => e.type === "expense")
    .reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString("default", { month: "short" });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.expenses += expense.amount;
        existing.balance = existing.income - existing.expenses;
      } else {
        acc.push({
          month,
          expenses: expense.type === "expense" ? expense.amount : 0,
          income: expense.type === "income" ? expense.amount : 0,
          balance: expense.type === "income" ? expense.amount : -expense.amount
        });
      }
      return acc;
    }, [] as { month: string; expenses: number; income: number; balance: number }[])
    .sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

  // Calculate spending by day of week for AreaChart.
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayWiseData = expenses
    .filter(e => e.type === "expense")
    .reduce((acc, expense) => {
      const day = daysOfWeek[new Date(expense.date).getDay()];
      const existing = acc.find(item => item.day === day);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        acc.push({ day, amount: expense.amount });
      }
      return acc;
    }, [] as { day: string; amount: number }[])
    .sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

  // Calculate total spent by category for Treemap.
  const categoryTotals = Object.entries(
    expenses
      .filter(e => e.type === "expense")
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Prepare data for Income vs Expenses BarChart.
  const totalExpenses = expenses.filter(e => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses.filter(e => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
  const incomeVsExpenseData = [
    { name: "Income", value: totalIncome, fill: "#4ECDC4" },
    { name: "Expenses", value: totalExpenses, fill: "#FF6B6B" },
  ];

  // No data message component.
  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <p className="text-lg text-muted-foreground mb-2">No expense data available</p>
      <p className="text-sm text-muted-foreground">Add transactions on the dashboard to see analytics</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Financial Analytics
      </h1>
      
      {expenses.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <NoDataMessage />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Distribution PieChart */}
            <Card className="glass-card hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="text-gradient">Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
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
                        <ReTooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends LineChart */}
            <Card className="glass-card hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="text-gradient">Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="month" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <ReTooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Line type="monotone" dataKey="expenses" stroke="#FF6B6B" strokeWidth={2} dot={{ fill: "#FF6B6B", r: 4 }} />
                        <Line type="monotone" dataKey="income" stroke="#4ECDC4" strokeWidth={2} dot={{ fill: "#4ECDC4", r: 4 }} />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income vs Expenses BarChart */}
            <Card className="glass-card hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="text-gradient">Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={incomeVsExpenseData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                        <XAxis type="number" stroke="#fff" />
                        <YAxis dataKey="name" type="category" stroke="#fff" />
                        <ReTooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {incomeVsExpenseData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Spending by Day AreaChart */}
            <Card className="glass-card hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="text-gradient">Spending by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {dayWiseData && dayWiseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dayWiseData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="day" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <ReTooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treemap for Category Totals */}
          <div className="mt-6">
            <Card className="glass-card hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="text-gradient">Category Totals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {categoryTotals && categoryTotals.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <Treemap data={categoryTotals} dataKey="value" stroke="#fff" fill="#8884d8" />
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
