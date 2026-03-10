"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Bell,
  Search,
  CreditCard,
  TrendingUp,
  MoreHorizontal,
  LogOut,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import GoalSpeedometer from "@/components/GoalSpeedometer";
import BreakdownWidget from "@/components/BreakdownWidget";
import TrendWidget from "@/components/TrendWidget";
import AccountsWidget from "@/components/AccountsWidget";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [metrics, setMetrics] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Month navigation: format "YYYY-MM"
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  };
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  const navigateMonth = (direction: -1 | 1) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    let newMonth = m + direction;
    let newYear = y;
    if (newMonth < 1) { newMonth = 12; newYear--; }
    if (newMonth > 12) { newMonth = 1; newYear++; }
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const formatMonthLabel = (monthStr: string) => {
    const [y, m] = monthStr.split('-').map(Number);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${monthNames[m - 1]} ${y}`;
  };

  const isCurrentMonth = selectedMonth === getCurrentMonth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/auth");
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchProjects(token);
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchDashboardData(token, selectedProjectId, selectedMonth);
    }
  }, [selectedProjectId, selectedMonth]);

  const fetchProjects = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDashboardData = async (token: string, projectId: string = "", month: string = "") => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (projectId) params.set('projectId', projectId);
      if (month) params.set('month', month);
      const qs = params.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/summary${qs ? `?${qs}` : ""}`;
      const transactionsUrl = `${process.env.NEXT_PUBLIC_API_URL}/transactions?take=5${projectId ? `&projectId=${projectId}` : ""}`;
      const [summaryRes, transactionsRes] = await Promise.all([
        fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(transactionsUrl, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!summaryRes.ok || !transactionsRes.ok) {
        throw new Error("Error fetching dashboard data");
      }

      const summaryData = await summaryRes.json();
      const transactionsData = await transactionsRes.json();

      setMetrics(summaryData);
      setRecentTransactions(transactionsData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black overflow-y-auto">
        {/* Header — two rows on mobile, one row on desktop */}
        <header className="border-b border-white/10 shrink-0 bg-black/20 backdrop-blur-md sticky top-0 z-10">
          {/* Row 1: Title + icon buttons */}
          <div className="h-16 flex items-center justify-between px-4 pl-16 md:px-8">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-light tracking-tight">Resumen</h1>

              {/* Month Navigator — desktop only */}
              <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-1 py-0.5">
                <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Mes anterior">
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setSelectedMonth(getCurrentMonth())}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isCurrentMonth ? 'text-indigo-300' : 'text-amber-300 hover:bg-white/10'}`}
                  title={isCurrentMonth ? 'Mes actual' : 'Ir al mes actual'}
                >
                  <Calendar size={14} />
                  {formatMonthLabel(selectedMonth)}
                </button>
                <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Mes siguiente">
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Project filter — desktop */}
              {projects.length > 0 && (
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="hidden md:block bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] appearance-none"
                >
                  <option value="" className="bg-zinc-900 text-white">Todas las actividades</option>
                  <option value="__none__" className="bg-zinc-900 text-gray-400">📭 Sin Actividad</option>
                  {projects.map(p => <option key={p.id} value={p.id} className="bg-zinc-900 text-white">💼 {p.name}</option>)}
                </select>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Search — desktop only */}
              <div className="relative group hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-48 transition-all"
                />
              </div>

              {/* Bell — always visible */}
              <button onClick={() => router.push('/inbox')} title="Ir al Buzón" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-gray-300" />
              </button>

              {/* Logout — icon on mobile, text on desktop */}
              <button
                className="p-2 md:px-3 md:py-1.5 rounded-full md:rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  router.push("/auth");
                }}
                title="Salir"
              >
                <span className="hidden md:inline">Salir</span>
                <LogOut className="w-4 h-4 md:hidden" />
              </button>
            </div>
          </div>

          {/* Row 2 — Mobile only: month nav + project filter */}
          <div className="md:hidden flex items-center gap-2 px-4 pb-3">
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-1 py-0.5 shrink-0">
              <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400">
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setSelectedMonth(getCurrentMonth())}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${isCurrentMonth ? 'text-indigo-300' : 'text-amber-300'}`}
              >
                <Calendar size={12} />
                {formatMonthLabel(selectedMonth)}
              </button>
              <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400">
                <ChevronRight size={16} />
              </button>
            </div>

            {projects.length > 0 && (
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="flex-1 min-w-0 bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-medium rounded-lg px-2 py-1.5 focus:outline-none appearance-none"
              >
                <option value="" className="bg-zinc-900 text-white">Todas las actividades</option>
                <option value="__none__" className="bg-zinc-900 text-gray-400">📭 Sin Actividad</option>
                {projects.map(p => <option key={p.id} value={p.id} className="bg-zinc-900 text-white">💼 {p.name}</option>)}
              </select>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {metrics && (
            <>
              {/* Top Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Balance Total"
                  amount={formatCurrency(metrics.totalBalance?.amount || 0, metrics.currencySymbol)}
                  trend={metrics.totalBalance?.trendText}
                  trendUp={metrics.totalBalance?.trendUp}
                  icon={<Wallet size={24} className="text-indigo-400" />}
                  className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-900/40 to-black border-indigo-500/30"
                  trendColor={metrics.totalBalance?.trendUp ? "text-emerald-400" : "text-gray-400"}
                />
                <MetricCard
                  title="Ingresos Mensuales"
                  amount={formatCurrency(metrics.monthlyIncome?.amount || 0, metrics.currencySymbol)}
                  trend={metrics.monthlyIncome?.trendText}
                  trendUp={metrics.monthlyIncome?.trendUp}
                  icon={<ArrowUpRight size={24} className="text-emerald-400" />}
                  trendColor={metrics.monthlyIncome?.trendUp ? "text-emerald-400" : "text-red-400"}
                />
                <MetricCard
                  title="Gastos Mensuales"
                  amount={formatCurrency(metrics.monthlyExpenses?.amount || 0, metrics.currencySymbol)}
                  trend={metrics.monthlyExpenses?.trendText}
                  trendUp={metrics.monthlyExpenses?.trendUp}
                  trendColor={metrics.monthlyExpenses?.trendUp ? "text-red-400" : "text-emerald-400"}
                  icon={<ArrowDownRight size={24} className="text-red-400" />}
                />
                <MetricCard
                  title="Ahorros Activos"
                  amount={formatCurrency(metrics.activeSavings || 0, metrics.currencySymbol)}
                  trend="Metas Acumuladas"
                  trendUp={true}
                  icon={<Target size={24} className="text-purple-400" />}
                  trendColor="text-gray-400"
                />
              </div>

              {/* Goals Speedometer Section */}
              {metrics.goalsProgress && metrics.goalsProgress.length > 0 && (
                <div className="mt-8 mb-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium">Progreso de Metas</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.goalsProgress.map((goal: any) => (
                      <GoalSpeedometer
                        key={goal.id}
                        id={goal.id}
                        title={goal.title}
                        currentAmount={goal.currentAmount}
                        targetAmount={goal.targetAmount}
                        currencySymbol={metrics.currencySymbol}
                        type={goal.type}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mx-20 -my-20 transition-transform duration-700 group-hover:scale-150"></div>

                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                      <h3 className="text-lg font-medium">Flujo de Caja</h3>
                      <p className="text-sm text-gray-400">Ingresos vs Gastos (Últimos 6 meses)</p>
                    </div>
                    <select className="bg-black/50 border border-white/10 rounded-lg text-sm px-3 py-1.5 text-gray-300 focus:outline-none">
                      <option>Últimos 6 Meses</option>
                    </select>
                  </div>

                  {/* Chart */}
                  <div className="h-64 flex items-end justify-between gap-2 md:gap-4 relative z-10">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="w-full border-b border-white/5 h-0"></div>
                      <div className="w-full border-b border-white/5 h-0"></div>
                      <div className="w-full border-b border-white/5 h-0"></div>
                      <div className="w-full border-b border-white/5 h-0"></div>
                    </div>

                    {/* Bars Calculation (Finding Max for scaling) */}
                    {(() => {
                      const maxVal = Math.max(...metrics.cashFlow.flatMap((d: any) => [d.inc, d.exp]), 1); // Avoid div by 0
                      return metrics.cashFlow.map((data: any, i: number) => (
                        <div key={i} className="flex flex-col items-center flex-1 group/bar cursor-pointer">
                          <div className="w-full max-w-[40px] flex gap-1 items-end h-[200px] relative">
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                              Ing: {formatCurrency(data.inc, metrics.currencySymbol)} | Gto: {formatCurrency(data.exp, metrics.currencySymbol)}
                            </div>

                            {/* Income Bar */}
                            <div
                              className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm transition-all duration-500 hover:brightness-125"
                              style={{ height: `${(data.inc / maxVal) * 100}%`, minHeight: data.inc > 0 ? '4px' : '0' }}
                            ></div>
                            {/* Expense Bar */}
                            <div
                              className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-500 hover:brightness-125 hover:from-red-600 hover:to-red-400"
                              style={{ height: `${(data.exp / maxVal) * 100}%`, minHeight: data.exp > 0 ? '4px' : '0' }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-4">{data.m}</span>
                        </div>
                      ))
                    })()}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium">Actividad Reciente</h3>
                    <button className="text-indigo-400 text-sm hover:text-indigo-300" onClick={() => router.push('/transactions')}>Ver Todo</button>
                  </div>

                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {recentTransactions.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm py-10">No hay transacciones recientes.</div>
                    ) : (
                      recentTransactions.map((tx) => (
                        <TransactionRow
                          key={tx.id}
                          icon={<div className={`bg-white/5 p-2 rounded-xl ${tx.item?.category?.type === 'ahorro' ? 'text-blue-400' : tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>{tx.item?.category?.icon || <CreditCard size={18} />}</div>}
                          title={tx.item?.name || tx.notes || "Transacción"}
                          category={tx.item?.category?.name || "Sin Clasificar"}
                          amount={`${tx.type !== 'expense' ? '+' : ''}${formatCurrency(parseFloat(tx.amountBase), metrics.currencySymbol)}`}
                          date={format(new Date(tx.transactionDate), "d MMM, yy", { locale: es })}
                          positive={tx.type !== 'expense'}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Income and Expense Breakdown Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {metrics.incomeBreakdown && (
                  <BreakdownWidget
                    title="Ingresos por Concepto"
                    data={metrics.incomeBreakdown}
                    currencySymbol={metrics.currencySymbol}
                    totalAmount={metrics.monthlyIncome?.amount || 0}
                    accentColor="emerald"
                  />
                )}
                {metrics.expenseBreakdown && (
                  <BreakdownWidget
                    title="Gastos por Concepto"
                    data={metrics.expenseBreakdown}
                    currencySymbol={metrics.currencySymbol}
                    totalAmount={metrics.monthlyExpenses?.amount || 0}
                    accentColor="red"
                  />
                )}
              </div>

              {/* Trend Widget — full width */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <AccountsWidget currencySymbol={metrics.currencySymbol} />
                <TrendWidget currencySymbol={metrics.currencySymbol} />
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

// Subcomponents

function MetricCard({ title, amount, trend, trendUp, icon, trendColor = "text-emerald-400", className = "" }: any) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors duration-500 group relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mx-10 -my-10 transition-transform duration-700 group-hover:scale-150"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <div className="p-2 bg-black/40 rounded-xl border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
          {icon}
        </div>
      </div>

      <div className="relative z-10">
        <h2 className="text-3xl font-semibold mb-2 tracking-tight">{amount}</h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-black/40 border border-white/5 ${trendColor}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ icon, title, category, amount, date, positive = false }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="font-medium text-sm group-hover:text-indigo-300 transition-colors">{title}</p>
          <p className="text-xs text-gray-500">{category} • {date}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`font-medium ${positive ? 'text-emerald-400' : 'text-gray-200'}`}>{amount}</span>
        <button className="text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={16} /></button>
      </div>
    </div>
  );
}
