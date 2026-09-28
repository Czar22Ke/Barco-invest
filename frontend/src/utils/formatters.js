export const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    // Allow up to 4 decimal places to show daily fractional growth if it's less than a cent
    maximumFractionDigits: 4 
  }).format(num);
};
