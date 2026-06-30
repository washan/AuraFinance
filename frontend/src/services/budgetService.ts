const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface BudgetSummaryItem {
    itemId: string;
    itemName: string;
    categoryName: string;
    baseAmount: number;
    extraAmount: number;
    formulated: number;
    consumed: number;
    status: 'OK' | 'WARNING' | 'EXCEEDED';
    currency: string;
}

export const getBudgetSummary = async (token: string, period: string): Promise<BudgetSummaryItem[]> => {
    const res = await fetch(`${API_URL}/budgets?period=${period}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error('Error al obtener el resumen de presupuestos');
    }

    return res.json();
};

export const upsertBudget = async (
    token: string,
    itemId: string,
    limitAmount: number,
    isBase: boolean,
    period?: string,
    currency: string = 'CRC'
) => {
    const payload = { itemId, limitAmount, isBase, period, currency };

    const res = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al guardar el presupuesto');
    }

    return res.json();
};
