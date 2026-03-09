"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Building2, Banknote, CreditCard, TrendingUp, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Account {
    id: string;
    name: string;
    type: string; // bank, cash, credit, investment
    balance: string;
    currency: { code: string; symbol: string };
}

interface AccountsWidgetProps {
    currencySymbol: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; hex: string; icon: React.ReactNode }> = {
    bank: {
        label: "Banco",
        color: "text-indigo-400",
        hex: "#818cf8",
        icon: <Building2 size={15} />,
    },
    cash: {
        label: "Efectivo",
        color: "text-emerald-400",
        hex: "#34d399",
        icon: <Banknote size={15} />,
    },
    credit: {
        label: "Crédito",
        color: "text-red-400",
        hex: "#f87171",
        icon: <CreditCard size={15} />,
    },
    investment: {
        label: "Inversión",
        color: "text-purple-400",
        hex: "#a78bfa",
        icon: <TrendingUp size={15} />,
    },
};

const UNKNOWN_CONFIG = {
    label: "Otro",
    color: "text-gray-400",
    hex: "#6b7280",
    icon: <Banknote size={15} />,
};

const CustomTooltip = ({ active, payload, currencySymbol }: any) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
        <div className="bg-zinc-900/95 border border-white/10 rounded-xl p-3 text-sm shadow-xl backdrop-blur-sm">
            <p className="text-gray-300 font-medium">{name}</p>
            <p className="text-white font-semibold mt-0.5">{formatCurrency(value, currencySymbol)}</p>
        </div>
    );
};

export default function AccountsWidget({ currencySymbol }: AccountsWidgetProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAccounts = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setAccounts(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    // Only positive balances go into the donut (credit accounts are liabilities)
    const positiveAccounts = accounts.filter((a) => parseFloat(a.balance) > 0 && a.type !== "credit");
    const totalPositive = positiveAccounts.reduce((s, a) => s + parseFloat(a.balance), 0);
    const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.balance), 0);

    // Aggregate by type for the donut
    const pieData = Object.entries(
        positiveAccounts.reduce<Record<string, number>>((acc, a) => {
            acc[a.type] = (acc[a.type] || 0) + parseFloat(a.balance);
            return acc;
        }, {})
    ).map(([type, value]) => ({
        name: TYPE_CONFIG[type]?.label ?? UNKNOWN_CONFIG.label,
        type,
        value,
    }));

    // Group accounts by type for the list
    const grouped = accounts.reduce<Record<string, Account[]>>((acc, a) => {
        if (!acc[a.type]) acc[a.type] = [];
        acc[a.type].push(a);
        return acc;
    }, {});

    const typeOrder = ["bank", "cash", "investment", "credit"];
    const sortedTypes = [
        ...typeOrder.filter((t) => grouped[t]),
        ...Object.keys(grouped).filter((t) => !typeOrder.includes(t)),
    ];

    if (isLoading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
            </div>
        );
    }

    if (accounts.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex items-center justify-center h-48 text-gray-500 text-sm">
                No hay cuentas registradas.
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none transition-transform duration-700 group-hover:scale-125" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-medium">Distribución de Cuentas</h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""} registrada{accounts.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={fetchAccounts}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
                    title="Actualizar"
                >
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* Content: Donut + list side by side */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Donut chart */}
                <div className="flex flex-col items-center">
                    <div className="relative w-full h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="55%"
                                    outerRadius="80%"
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {pieData.map((entry) => (
                                        <Cell
                                            key={entry.type}
                                            fill={TYPE_CONFIG[entry.type]?.hex ?? UNKNOWN_CONFIG.hex}
                                            fillOpacity={0.85}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-gray-400">Total</span>
                            <span className="text-base font-semibold text-white leading-tight">
                                {formatCurrency(totalBalance, currencySymbol)}
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
                        {pieData.map((entry) => {
                            const cfg = TYPE_CONFIG[entry.type] ?? UNKNOWN_CONFIG;
                            return (
                                <div key={entry.type} className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <span
                                        className="inline-block w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: cfg.hex }}
                                    />
                                    {cfg.label}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Account list grouped by type */}
                <div className="space-y-4 overflow-y-auto max-h-64 pr-1 custom-scrollbar">
                    {sortedTypes.map((type) => {
                        const cfg = TYPE_CONFIG[type] ?? UNKNOWN_CONFIG;
                        return (
                            <div key={type}>
                                {/* Type header */}
                                <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 ${cfg.color}`}>
                                    {cfg.icon}
                                    {cfg.label}
                                </div>

                                {/* Accounts */}
                                <div className="space-y-2">
                                    {grouped[type].map((account) => {
                                        const balance = parseFloat(account.balance);
                                        const pct = totalPositive > 0 && balance > 0
                                            ? Math.min((balance / totalPositive) * 100, 100)
                                            : 0;
                                        const isCredit = type === "credit";

                                        return (
                                            <div key={account.id} className="group/acc">
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="text-gray-300 font-medium truncate max-w-[120px]">
                                                        {account.name}
                                                    </span>
                                                    <span
                                                        className={`font-semibold tabular-nums ${isCredit
                                                            ? "text-red-400"
                                                            : balance >= 0
                                                                ? "text-white"
                                                                : "text-red-400"
                                                            }`}
                                                    >
                                                        {isCredit ? "-" : ""}
                                                        {formatCurrency(Math.abs(balance), account.currency?.symbol ?? currencySymbol)}
                                                    </span>
                                                </div>
                                                {!isCredit && balance > 0 && (
                                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{
                                                                width: `${pct}%`,
                                                                backgroundColor: cfg.hex,
                                                                opacity: 0.7,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className="text-[10px] text-gray-600">{account.currency?.code}</span>
                                                    {!isCredit && balance > 0 && (
                                                        <span className="text-[10px] text-gray-600">{pct.toFixed(1)}% del total</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
