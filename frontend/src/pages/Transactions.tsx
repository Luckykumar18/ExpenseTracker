// src/pages/Transactions.tsx
import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Filter, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Expense, ExpenseCategory } from "@/types/expense";
import { fetchTransactions, deleteTransaction } from "../api/transaction";

const Transactions = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  // Load transactions from backend
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions();
        setExpenses(data);
      } catch (error) {
        console.error("Error loading transactions:", error);
        toast({
          title: "Error",
          description: "Could not load your expense data",
          variant: "destructive",
        });
      }
    };
    loadTransactions();
  }, [toast]);

  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
      const matchesType = typeFilter === "all" || expense.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      }
    });

  const totalFiltered = filteredExpenses.reduce((total, expense) => {
    return expense.type === "income" ? total + expense.amount : total - expense.amount;
  }, 0);

  const exportToCSV = () => {
    const headers = ["Description", "Category", "Type", "Amount", "Date"];
    const csvData = filteredExpenses.map((expense) => [
      expense.description,
      expense.category,
      expense.type,
      expense.amount.toString(),
      new Date(expense.date).toLocaleDateString(),
    ]);
    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Success",
      description: "Transactions exported successfully",
    });
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteTransaction(id);
      // Use _id since the backend returns _id, not id.
      setExpenses(expenses.filter((exp) => exp._id !== id));
      toast({
        title: "Deleted",
        description: "Transaction deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Transaction History
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10"
            onClick={exportToCSV}
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10">
            <Filter size={16} />
            <span>Filter</span>
          </Button>
        </div>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-gradient">Advanced Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border-white/10"
            />
            <Select value={categoryFilter} onValueChange={(value: ExpenseCategory | "all") => setCategoryFilter(value)}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value: "all" | "income" | "expense") => setTypeFilter(value)}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-") as ["date" | "amount", "asc" | "desc"];
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                <SelectItem value="amount-desc">Amount (Highest First)</SelectItem>
                <SelectItem value="amount-asc">Amount (Lowest First)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-gradient">Transaction List</CardTitle>
          <div className={`text-lg font-semibold ${totalFiltered >= 0 ? "text-green-400" : "text-red-400"}`}>
            Net: ${totalFiltered.toFixed(2)}
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground mb-2">No transactions found</p>
              <p className="text-sm text-muted-foreground">Add transactions on the dashboard to view them here</p>
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-white/5">
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map(expense => (
                      <TableRow key={expense._id} className="hover:bg-white/5">
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="capitalize">{expense.category}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            expense.type === "income" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                          }`}>
                            {expense.type}
                          </span>
                        </TableCell>
                        <TableCell className={expense.type === "income" ? "text-green-400" : "text-red-400"}>
                          ${expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{formatDistanceToNow(new Date(expense.date), { addSuffix: true })}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-red-900/30 hover:text-red-400"
                            onClick={() => handleDeleteExpense(expense._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No transactions found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Charts for Analytics can also be integrated here or in a separate Analytics.tsx */}
    </div>
  );
};

export default Transactions;
