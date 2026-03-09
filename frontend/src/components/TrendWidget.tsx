"use client";

import { useEffect, useState, useCallback } from "react";
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TrendDataPoint {
    month: string;
    year: number;
    inc: number;
    exp: number;
}

interface Category {
    id: string;
    name: string;
    icon?: string;
    type: string;
}

interface TrendWidgetProps {
    currencySymbol: string;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label, currencySymbol }: any) => {
    if (!active || !payload || !payload.length) return null;
    const inc = payload.find((p: any) => p.dataKey === "inc")?.value ?? 0;
    const exp = payload.find((p: any) => p.dataKey === "exp")?.value ?? 0;
    const balance = inc - exp;

    return (
        <div className="bg-zinc-900/95 border border-white/10 rounded-xl p-3 text-sm shadow-xl backdrop-blur-sm min-w-[180px]">
            <p className="font-semibold text-white mb-2">{label}</p>
            <div className="space-y-1">
                <div className="flex justify-between gap-4">
                    <span className="text-indigo-400">Ingresos</span>
                    <span className="text-white font-medium">{formatCurrency(inc, currencySymbol)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-red-400">Gastos</span>
                    <span className="text-white font-medium">{formatCurrency(exp, currencySymbol)}</span>
                </div>
                <div className="border-t border-white/10 mt-2 pt-2 flex justify-between gap-4">
                    <span className={balance >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {balance >= 0 ? "Superávit" : "Déficit"}
                    </span>
                    <span className={`font-semibold ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {formatCurrency(Math.abs(balance), currencySymbol)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function TrendWidget({ currencySymbol }: TrendWidgetProps) {
    const [data, setData] = useState<TrendDataPoint[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    // Load categories once
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((cats: Category[]) => setCategories(cats))
            .catch(console.error);
    }, []);

    // Load trend data when category changes
    const fetchTrend = useCallback(async (categoryId: string) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        setIsLoading(true);
        try {
            const qs = categoryId ? `?categoryId=${categoryId}` : "";
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/trend${qs}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const raw: TrendDataPoint[] = await res.json();
                // Label each point as "Ene 26", etc.
                const labeled = raw.map((d) => ({
                    ...d,
                    label: `${d.month} ${String(d.year).slice(2)}`,
                }));
                setData(labeled);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrend(selectedCategoryId);
    }, [selectedCategoryId, fetchTrend]);

    // Trend badge helpers (last vs previous month)
    const trendBadge = (key: "inc" | "exp") => {
        if (data.length < 2) return null;
        const last = data[data.length - 1][key];
        const prev = data[data.length - 2][key];
        if (prev === 0) return null;
        const pct = ((last - prev) / Math.abs(prev)) * 100;
        const up = pct >= 0;
        const isGood = key === "inc" ? up : !up;

        return (
            <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${isGood
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
            >
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {pct >= 0 ? "+" : ""}
                {pct.toFixed(1)}%
            </span>
        );
    };

    // Determine if the last point is a surplus (for area gradient color)
    const lastPoint = data[data.length - 1];
    const isLastSurplus = lastPoint ? lastPoint.inc >= lastPoint.exp : true;

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group">
            {/* Ambient glow */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl -mx-20 -my-20 transition-transform duration-700 group-hover:scale-125 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-medium">Tendencia: Ingresos vs Gastos</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Últimos 6 meses</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Trend badges */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Ing.</span>
                        {trendBadge("inc") ?? <Minus size={12} />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Gto.</span>
                        {trendBadge("exp") ?? <Minus size={12} />}
                    </div>

                    {/* Category filter */}
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-lg text-sm px-3 py-1.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.icon ? `${c.icon} ` : ""}{c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chart */}
            <div className="relative z-10 h-64">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                        Sin datos para mostrar
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                            <defs>
                                {/* Gradient for the area between the lines */}
                                <linearGradient id="surplusGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                </linearGradient>
                                <linearGradient id="deficitGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

                            <XAxis
                                dataKey="label"
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={8}
                            />
                            <YAxis
                                tick={{ fill: "#6b7280", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) =>
                                    v >= 1_000_000
                                        ? `${(v / 1_000_000).toFixed(1)}M`
                                        : v >= 1_000
                                            ? `${(v / 1_000).toFixed(0)}k`
                                            : `${v}`
                                }
                                width={45}
                            />

                            <Tooltip
                                content={<CustomTooltip currencySymbol={currencySymbol} />}
                                cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                            />

                            <Legend
                                formatter={(value) => (
                                    <span className="text-xs text-gray-400">
                                        {value === "inc" ? "Ingresos" : "Gastos"}
                                    </span>
                                )}
                                wrapperStyle={{ paddingTop: "8px" }}
                            />

                            {/* Shaded area between lines */}
                            <Area
                                type="monotone"
                                dataKey="inc"
                                fill={isLastSurplus ? "url(#surplusGrad)" : "url(#deficitGrad)"}
                                stroke="none"
                                activeDot={false}
                                legendType="none"
                            />

                            {/* Income line */}
                            <Line
                                type="monotone"
                                dataKey="inc"
                                name="inc"
                                stroke="#818cf8"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: "#818cf8", stroke: "#1e1b4b", strokeWidth: 2 }}
                            />

                            {/* Expense line */}
                            <Line
                                type="monotone"
                                dataKey="exp"
                                name="exp"
                                stroke="#f87171"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#f87171", strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: "#f87171", stroke: "#3f0000", strokeWidth: 2 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
