import axios from 'axios';

// Automatically detect API URL based on current domain
const getApiUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';  // Local development
  } else {
    // For production, use the same domain as the frontend
    // The nginx proxy will handle routing /api requests to the backend
    return `${protocol}//${hostname}/api`;
  }
};

const API_URL = process.env.REACT_APP_API_URL || getApiUrl();

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        throw error;
      }
    );
  }

  // Assets
  async getAssets() {
    return await this.api.get('/assets');
  }

  async getAssetById(id) {
    return await this.api.get(`/assets/${id}`);
  }

  async createAsset(assetData) {
    return await this.api.post('/assets', assetData);
  }

  async updateAsset(id, assetData) {
    return await this.api.put(`/assets/${id}`, assetData);
  }

  async deleteAsset(id) {
    return await this.api.delete(`/assets/${id}`);
  }

  async getAssetTypes() {
    return await this.api.get('/assets/types');
  }

  async getAssetHistory(id) {
    return await this.api.get(`/assets/${id}/history`);
  }

  // Transactions
  async getTransactions(params = {}) {
    return await this.api.get('/transactions', { params });
  }

  async createTransaction(transactionData) {
    return await this.api.post('/transactions', transactionData);
  }

  async updateTransaction(id, transactionData) {
    return await this.api.put(`/transactions/${id}`, transactionData);
  }

  async deleteTransaction(id) {
    return await this.api.delete(`/transactions/${id}`);
  }

  async getCategories() {
    return await this.api.get('/transactions/categories');
  }

  // Bank Accounts
  async getBankAccounts() {
    return await this.api.get('/bank-accounts');
  }

  async getBankAccount(id) {
    return await this.api.get(`/bank-accounts/${id}`);
  }

  async createBankAccount(accountData) {
    return await this.api.post('/bank-accounts', accountData);
  }

  async updateBankAccount(id, accountData) {
    return await this.api.put(`/bank-accounts/${id}`, accountData);
  }

  async deleteBankAccount(id) {
    return await this.api.delete(`/bank-accounts/${id}`);
  }

  async getBankAccountBalance(id) {
    return await this.api.get(`/bank-accounts/${id}/balance`);
  }

  async updateBankAccountBalance(id, balanceData) {
    return await this.api.put(`/bank-accounts/${id}/balance`, balanceData);
  }

  // Budgets
  async getBudgets(params = {}) {
    return await this.api.get('/budgets', { params });
  }

  async createBudget(budgetData) {
    return await this.api.post('/budgets', budgetData);
  }

  async updateBudget(id, budgetData) {
    return await this.api.put(`/budgets/${id}`, budgetData);
  }

  async deleteBudget(id) {
    return await this.api.delete(`/budgets/${id}`);
  }

  // Reports
  async getNetWorth(params = {}) {
    return await this.api.get('/reports/networth', { params });
  }

  async getExpenseAnalysis(params = {}) {
    return await this.api.get('/reports/expenses', { params });
  }

  async getBudgetVsActual(params = {}) {
    return await this.api.get('/reports/budget-vs-actual', { params });
  }

  async getAssetAllocation() {
    return await this.api.get('/reports/asset-allocation');
  }

  // Households
  async getHouseholdInfo() {
    return await this.api.get('/households');
  }

  async getHouseholdMembers() {
    return await this.api.get('/households/members');
  }

  async inviteMember(memberData) {
    return await this.api.post('/households/invite', memberData);
  }
}

export default new ApiService();
