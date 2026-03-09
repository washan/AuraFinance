import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, symbol?: string) {
  let finalSymbol = symbol;

  if (!finalSymbol && typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        finalSymbol = parsed.baseCurrencySymbol;
      } catch (e) { }
    }
  }

  finalSymbol = finalSymbol || '$';

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${finalSymbol}${formattedNumber}`;
}
