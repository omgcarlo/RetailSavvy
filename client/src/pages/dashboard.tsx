import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Expense, Debt } from "@shared/schema";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import { convertCurrency } from "@/lib/currency";

export default function Dashboard() {
  const { currency } = useCurrency();
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: debts } = useQuery<Debt[]>({
    queryKey: ["/api/debts"],
  });

  const calculateStats = () => {
    const totalSales = transactions?.reduce((acc, t) => acc + Number(t.total), 0) || 0;
    const totalExpenses = expenses?.reduce((acc, e) => acc + Number(e.amount), 0) || 0;
    const totalTransactions = transactions?.length || 0;
    const totalDebts = debts?.reduce((acc, d) => acc + Number(d.amount), 0) || 0;

    return {
      totalSales,
      totalExpenses,
      totalTransactions,
      totalDebts,
    };
  };

  const prepareSalesData = () => {
    if (!transactions) return [];

    const salesByDate = new Map<string, number>();
    transactions.forEach((t) => {
      const date = format(new Date(t.date), "MMM d");
      const amount = Number(t.total);
      salesByDate.set(date, (salesByDate.get(date) || 0) + amount);
    });

    return Array.from(salesByDate.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your business performance
            </p>
          </div>
          <StatsCards stats={calculateStats()} />
          <SalesChart data={prepareSalesData()} />
        </main>
      </div>
    </div>
  );
}