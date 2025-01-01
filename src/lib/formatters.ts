export const formatPrice = (amount: number | null | undefined, currency: string = 'NGN'): string => {
  if (amount === null || amount === undefined) return `${currency} 0`;
  
  try {
    return `${currency} ${Number(amount).toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  } catch (error) {
    console.error('Error formatting price:', error);
    return `${currency} ${amount}`;
  }
}; 