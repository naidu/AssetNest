import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Payment,
  Assessment,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalAssets: 0,
    totalTransactions: 0,
    monthlyExpenses: 0,
    netWorth: [],
    assetAllocation: [],
    recentTransactions: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch multiple data sources in parallel
        const [
          assetsResponse,
          transactionsResponse,
          netWorthResponse,
          assetAllocationResponse,
        ] = await Promise.all([
          apiService.getAssets(),
          apiService.getTransactions({ limit: 5 }),
          apiService.getNetWorth({ months: 6 }),
          apiService.getAssetAllocation(),
        ]);

        // Calculate summary statistics
        const totalAssets = assetsResponse.assets?.reduce((sum, asset) => sum + (asset.current_value || 0), 0) || 0;
        const currentMonthTransactions = transactionsResponse.transactions?.filter(t => {
          const transactionDate = new Date(t.txn_date);
          const currentDate = new Date();
          return transactionDate.getMonth() === currentDate.getMonth() && 
                 transactionDate.getFullYear() === currentDate.getFullYear() &&
                 t.txn_type === 'expense';
        }) || [];

        const monthlyExpenses = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

        setDashboardData({
          totalAssets,
          totalTransactions: transactionsResponse.transactions?.length || 0,
          monthlyExpenses,
          netWorth: netWorthResponse.networth_data || [],
          assetAllocation: assetAllocationResponse.asset_allocation || [],
          recentTransactions: transactionsResponse.transactions || [],
        });

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const COLORS = ['#2E7D32', '#FFC107', '#FF9800', '#F44336', '#9C27B0'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Here's an overview of your financial portfolio
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assets"
            value={dashboardData.totalAssets}
            icon={<AccountBalance fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Worth"
            value={dashboardData.netWorth[dashboardData.netWorth.length - 1]?.net_worth || 0}
            icon={<TrendingUp fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Expenses"
            value={dashboardData.monthlyExpenses}
            icon={<Payment fontSize="large" />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transactions"
            value={dashboardData.totalTransactions}
            icon={<Assessment fontSize="large" />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Net Worth Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Net Worth Trend
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.netWorth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Net Worth']} />
                    <Line type="monotone" dataKey="net_worth" stroke="#2E7D32" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Allocation */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Asset Allocation
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.assetAllocation}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_value"
                      label={({ asset_type, percentage }) => `${asset_type} (${percentage}%)`}
                    >
                      {dashboardData.assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <Box>
                {dashboardData.recentTransactions.length > 0 ? (
                  dashboardData.recentTransactions.map((transaction, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1} borderBottom="1px solid #eee">
                      <Box>
                        <Typography variant="body1">{transaction.purpose || transaction.category_name}</Typography>
                        <Typography variant="body2" color="textSecondary">{new Date(transaction.txn_date).toLocaleDateString()}</Typography>
                      </Box>
                      <Typography 
                        variant="body1" 
                        color={transaction.txn_type === 'income' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.txn_type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="textSecondary">No recent transactions</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
