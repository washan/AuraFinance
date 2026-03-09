import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface GoalSpeedometerProps {
    id: string;
    title: string;
    currentAmount: number;
    targetAmount: number | null;
    currencySymbol: string;
    type?: string;
}

export default function GoalSpeedometer({
    title,
    currentAmount,
    targetAmount,
    currencySymbol,
    type = 'savings',
}: GoalSpeedometerProps) {
    // If no target amount is set, we can't show a valid percentage.
    const hasTarget = targetAmount !== null && targetAmount > 0;
    const safeTargetAmount = hasTarget ? targetAmount : 1;
    const percentage = hasTarget ? Math.min((currentAmount / safeTargetAmount) * 100, 100) : 0;

    const data = [
        { name: "Progreso", value: percentage },
        { name: "Restante", value: 100 - percentage },
    ];

    // Visual gradient colors based on goal type
    const isExpense = type === 'expense';
    const COLORS = isExpense
        ? ["#fbbf24", "#3f3f46"] // Amber-400 for expense, Zinc-700 for empty
        : ["#818cf8", "#3f3f46"]; // Indigo-400 for savings, Zinc-700 for empty

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors duration-500 flex flex-col items-center justify-between relative overflow-hidden group">
            {/* Background glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${isExpense ? 'bg-amber-500/10' : 'bg-indigo-500/10'} rounded-full blur-3xl -mx-10 -my-10 transition-transform duration-700 group-hover:scale-150 pointer-events-none`}></div>

            <div className="w-full text-center relative z-10 mb-2">
                <h4 className="text-gray-300 font-medium text-sm truncate">{isExpense ? '📋' : '🎯'} {title}</h4>
            </div>

            <div className="w-full h-32 relative z-10 flex items-center justify-center -mt-4">
                {hasTarget ? (
                    <ResponsiveContainer width="100%" height="200%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="70%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                                itemStyle={{ color: "#fff" }}
                                formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Porcentaje"] as any}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Sin meta definida
                    </div>
                )}

                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center pointer-events-none">
                    <p className="text-xl font-semibold tracking-tight">
                        {hasTarget ? `${percentage.toFixed(0)}%` : "N/A"}
                    </p>
                </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-gray-400 relative z-10 mt-2">
                <div className="text-left">
                    <p className="mb-0.5">{isExpense ? 'Pagado' : 'Acumulado'}</p>
                    <p className="font-medium text-white">{formatCurrency(currentAmount, currencySymbol)}</p>
                </div>
                <div className="text-right">
                    <p className="mb-0.5">Meta</p>
                    <p className="font-medium text-white">
                        {hasTarget ? formatCurrency(targetAmount!, currencySymbol) : "N/A"}
                    </p>
                </div>
            </div>
        </div>
    );
}
