"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface BreakdownItem {
    name: string;
    categoryName?: string;
    icon: string;
    amount: number;
}

interface BreakdownData {
    byCategory: BreakdownItem[];
    byItem: BreakdownItem[];
}

interface BreakdownWidgetProps {
    title: string;
    data: BreakdownData;
    currencySymbol: string;
    totalAmount: number;
    accentColor: "emerald" | "red" | "indigo";
}

const accentStyles = {
    emerald: {
        bar: "from-emerald-600 to-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        glow: "bg-emerald-500/10",
        title: "text-emerald-400",
    },
    red: {
        bar: "from-red-600 to-red-400",
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
        glow: "bg-red-500/10",
        title: "text-red-400",
    },
    indigo: {
        bar: "from-indigo-600 to-indigo-400",
        badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        glow: "bg-indigo-500/10",
        title: "text-indigo-400",
    },
};

export default function BreakdownWidget({
    title,
    data,
    currencySymbol,
    totalAmount,
    accentColor,
}: BreakdownWidgetProps) {
    const [view, setView] = useState<"category" | "item">("category");
    const styles = accentStyles[accentColor];
    const items = view === "category" ? data.byCategory : data.byItem;

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group">
            {/* Background glow */}
            <div
                className={`absolute top-0 right-0 w-48 h-48 ${styles.glow} rounded-full blur-3xl -mx-16 -my-16 transition-transform duration-700 group-hover:scale-150`}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-5 relative z-10">
                <div>
                    <h3 className="text-lg font-medium">{title}</h3>
                    <p className={`text-sm font-semibold ${styles.title}`}>
                        {formatCurrency(totalAmount, currencySymbol)}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex bg-black/40 rounded-lg border border-white/10 p-0.5">
                    <button
                        onClick={() => setView("category")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === "category"
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Categoría
                    </button>
                    <button
                        onClick={() => setView("item")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === "item"
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Ítem
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 relative z-10 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                        Sin datos para este período
                    </div>
                ) : (
                    items.map((item, i) => {
                        const pct = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
                        return (
                            <div key={`${item.name}-${i}`} className="group/row">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-base shrink-0">{item.icon}</span>
                                        <div className="min-w-0">
                                            <span className="text-sm font-medium text-gray-200 truncate block">
                                                {item.name}
                                            </span>
                                            {view === "item" && item.categoryName && (
                                                <span className="text-[11px] text-gray-500 truncate block">
                                                    {item.categoryName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <span className="text-sm font-medium text-gray-200">
                                            {formatCurrency(item.amount, currencySymbol)}
                                        </span>
                                        <span
                                            className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md border ${styles.badge}`}
                                        >
                                            {pct.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${styles.bar} rounded-full transition-all duration-700`}
                                        style={{ width: `${Math.max(pct, 1)}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
