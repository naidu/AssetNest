import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
      throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Default currencies
const defaultCurrencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' }
];

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [currencies, setCurrencies] = useState(defaultCurrencies);

  // Load currency preferences from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    const savedCurrencies = localStorage.getItem('userCurrencies');
    
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
    
    if (savedCurrencies) {
      try {
        const parsedCurrencies = JSON.parse(savedCurrencies);
        setCurrencies(parsedCurrencies);
      } catch (error) {
        console.error('Error parsing saved currencies:', error);
        setCurrencies(defaultCurrencies);
      }
    }
  }, []);

  // Save currency preference to localStorage when it changes
  const updateCurrency = (currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem('selectedCurrency', currency);
  };

  // Add new currency
  const addCurrency = (currency) => {
    const newCurrencies = [...currencies, currency];
    setCurrencies(newCurrencies);
    localStorage.setItem('userCurrencies', JSON.stringify(newCurrencies));
  };

  // Remove currency
  const removeCurrency = (currencyCode) => {
    if (currencies.length <= 1) {
      alert('At least one currency must remain.');
      return;
    }
    
    const newCurrencies = currencies.filter(c => c.code !== currencyCode);
    setCurrencies(newCurrencies);
    localStorage.setItem('userCurrencies', JSON.stringify(newCurrencies));
    
    // If the removed currency was selected, switch to the first available currency
    if (selectedCurrency === currencyCode) {
      const newSelectedCurrency = newCurrencies[0].code;
      setSelectedCurrency(newSelectedCurrency);
      localStorage.setItem('selectedCurrency', newSelectedCurrency);
    }
  };

  // Update existing currency
  const updateCurrencyDetails = (currencyCode, updatedCurrency) => {
    const newCurrencies = currencies.map(c => 
      c.code === currencyCode ? updatedCurrency : c
    );
    setCurrencies(newCurrencies);
    localStorage.setItem('userCurrencies', JSON.stringify(newCurrencies));
  };

  const value = {
    selectedCurrency,
    setSelectedCurrency: updateCurrency,
    currencies,
    addCurrency,
    removeCurrency,
    updateCurrencyDetails
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
