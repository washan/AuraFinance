"use client";

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getInvestmentHistory, InvestmentHistoryPoint } from '@/services/investmentService';

interface Props {
  token: string;
}

export const InvestmentHistoryChart: React.FC<Props> = ({ token }) => {
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
      <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="text-gray-400">Cargando gráfico de inversiones...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  // Comprobar si hay al menos alguna inversión para mostrar algo o si todo es cero
  const hasInvestments = data.some(d => d.invested > 0);
  if (!hasInvestments) {
     return null; // Omitir si no hay nada
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Crecimiento de Inversiones (6 Meses)
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
            <XAxis 
                dataKey="monthLabel" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                dy={10}
            />
            <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']}
              labelStyle={{ color: '#111827', fontWeight: 'bold' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area
              type="monotone"
              dataKey="marketValue"
              name="Valor Actual"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
            <Area
              type="monotone"
              dataKey="invested"
              name="Total Aportado"
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorInvested)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
