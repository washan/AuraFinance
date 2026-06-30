"use client";

import React, { useEffect, useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { getInvestmentHistory, InvestmentHistoryPoint } from '@/services/investmentService';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface Props {
  token: string;
  isColones: boolean;
  exchangeRate: number;
}

export const InvestmentHistoryChart: React.FC<Props> = ({ token, isColones, exchangeRate }) => {
  const [data, setData] = useState<InvestmentHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const history = await getInvestmentHistory(token);
        setData(history);
      } catch (error) {
        console.error('Error loading investment history', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80 bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 animate-pulse">
        <div className="text-gray-400">Analizando el historial de inversiones...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  // Comprobar si hay al menos alguna inversión para mostrar algo
  const hasInvestments = data.some(d => d.invested > 0);
  if (!hasInvestments) {
     return null; 
  }

  const formatCurrency = (val: number) => {
    const finalVal = val * (isColones ? exchangeRate : 1);
    return new Intl.NumberFormat(isColones ? 'es-CR' : 'en-US', { 
        style: 'currency', 
        currency: isColones ? 'CRC' : 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(finalVal);
  };

  const formatTooltipCurrency = (val: number) => {
    const finalVal = val * (isColones ? exchangeRate : 1);
    return new Intl.NumberFormat(isColones ? 'es-CR' : 'en-US', { 
        style: 'currency', 
        currency: isColones ? 'CRC' : 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(finalVal);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const contribution = payload.find((p: any) => p.dataKey === 'monthlyContribution')?.value || 0;
      const pl = payload.find((p: any) => p.dataKey === 'monthlyPl')?.value || 0;

      return (
        <div className="bg-black/90 border border-white/10 p-4 rounded-xl backdrop-blur-md shadow-2xl min-w-[200px]">
          <p className="text-white font-bold mb-3 border-b border-white/10 pb-2">{label}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
                <span className="text-indigo-400 text-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    Aporte Mensual
                </span>
                <span className="text-white font-medium">{formatTooltipCurrency(contribution)}</span>
            </div>
            
            <div className="flex justify-between items-center gap-4">
                <span className={`${pl >= 0 ? 'text-emerald-400' : 'text-red-400'} text-sm flex items-center gap-1.5`}>
                    <div className={`w-2 h-2 rounded-full ${pl >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    G/P del Mes
                </span>
                <span className={`font-medium ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pl > 0 ? '+' : ''}{formatTooltipCurrency(pl)}
                </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mx-10 -my-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mx-10 -my-10"></div>
        
        <div className="flex items-start justify-between gap-4 mb-8 relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Análisis Mensual (12 Meses)</h2>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                        Aportes vs Ganancia/Pérdida por mes
                        <span title="Muestra cuánto dinero nuevo invertiste cada mes (barras) y cómo se comportó el mercado para tu portafolio en ese mismo mes (línea)">
                            <Info size={14} className="text-gray-500 inline ml-1 cursor-help" />
                        </span>
                    </p>
                </div>
            </div>
        </div>

      <div className="h-80 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
                dataKey="monthLabel" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                dy={10}
            />
            <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '13px', color: '#d1d5db', paddingBottom: '20px' }}
            />
            
            <Bar 
                yAxisId="left"
                dataKey="monthlyContribution" 
                name="Aporte Mensual" 
                fill="#6366f1"
                radius={[4, 4, 4, 4]}
                barSize={30}
            >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.monthlyContribution > 0 ? "#6366f1" : "#4f46e5"} fillOpacity={0.8} />
                ))}
            </Bar>
            
            <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="monthlyPl" 
                name="Ganancia/Pérdida (G/P)" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#000' }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#10b981' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
