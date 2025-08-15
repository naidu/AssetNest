// Shared currency formatting utility
export const formatCurrency = (amount, currency = 'INR', currencies = null) => {
  if (!amount) {
    // Find the default currency symbol
    const defaultCurrency = currencies?.find(c => c.code === currency) || { symbol: '₹' };
    return `${defaultCurrency.symbol}0`;
  }
  
  // Use provided currencies or fallback to default symbols
  const symbols = currencies ? 
    currencies.reduce((acc, curr) => ({ ...acc, [curr.code]: curr.symbol }), {}) :
    {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
  
  const symbol = symbols[currency] || currency;
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${symbol}${numericAmount.toLocaleString('en-IN')}`;
};

// Default currency options for selectors
export const defaultCurrencyOptions = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' }
];

// Common currency options for adding new currencies
export const commonCurrencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
];
