const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface InvestmentPosition {
  instrumentId: string;
  symbol: string;
  name: string;
  position: number;
  avgPrice: number;
  costBasis: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
  totalCommissions: number;
}

export interface PortfolioSummary {
  totalMarketValue: number;
  totalInvested: number;
  totalUnrealizedPl: number;
  positions: InvestmentPosition[];
}

export const getPortfolio = async (token: string): Promise<PortfolioSummary> => {
    const res = await fetch(`${API_URL}/investments/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al cargar el portafolio');
    return res.json();
};

export interface InvestmentHistoryPoint {
  date: string;
  invested: number;
  marketValue: number;
  monthLabel: string;
}

export const getInvestmentHistory = async (token: string): Promise<InvestmentHistoryPoint[]> => {
    const res = await fetch(`${API_URL}/investments/history`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al cargar el historial de inversiones');
    return res.json();
};

export const getAiInsights = async (token: string) => {
    const res = await fetch(`${API_URL}/investments/ai-insights`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al conectar con la Inteligencia Artificial');
    }
    return res.json();
};

export const createInvestmentTransaction = async (token: string, data: any) => {
    const res = await fetch(`${API_URL}/investments/transactions`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al guardar la transacción');
    }
    return res.json();
};

export const getTransactions = async (token: string) => {
    const res = await fetch(`${API_URL}/investments/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al cargar el historial de transacciones');
    return res.json();
};

export const updateInvestmentTransaction = async (token: string, id: string, data: any) => {
    const res = await fetch(`${API_URL}/investments/transactions/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar la transacción');
    return res.json();
};

export const deleteInvestmentTransaction = async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/investments/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al eliminar la transacción');
    return res.json();
};
