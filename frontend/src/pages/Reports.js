import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  AccountBalance,
  Payment,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import apiService from '../services/apiService';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('6');
  const [reportData, setReportData] = useState({
    netWorth: [],
    assetAllocation: [],
    expenseAnalysis: [],
    budgetComparison: []
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [netWorthResponse, assetAllocationResponse, expenseAnalysisResponse, budgetComparisonResponse] = await Promise.all([
          apiService.getNetWorth({ months: period }),
          apiService.getAssetAllocation(),
          apiService.getExpenseAnalysis({ months: period }),
          apiService.getBudgetVsActual()
        ]);

        setReportData({
          netWorth: netWorthResponse.networth_data || [],
          assetAllocation: assetAllocationResponse.asset_allocation || [],
          expenseAnalysis: expenseAnalysisResponse.expense_analysis || [],
          budgetComparison: budgetComparisonResponse.budget_comparison || []
        });
      } catch (err) {
        setError('Failed to load report data');
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [period]);

  const COLORS = ['#2E7D32', '#FFC107', '#FF9800', '#F44336', '#9C27B0', '#2196F3'];

  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount) return '₹0';
    
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    
    const symbol = symbols[currency] || currency;
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${symbol}${numericAmount.toLocaleString('en-IN')}`;
  };

  const getTotalAssets = () => {
    return reportData.assetAllocation.reduce((sum, asset) => sum + parseFloat(asset.total_value), 0);
  };

  const getTotalExpenses = () => {
    return reportData.expenseAnalysis.reduce((sum, expense) => sum + parseFloat(expense.total_amount), 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Reports & Analytics
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            label="Period"
          >
            <MenuItem value="3">3 Months</MenuItem>
            <MenuItem value="6">6 Months</MenuItem>
            <MenuItem value="12">12 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Assets
                  </Typography>
                  <Typography variant="h4" component="div" color="primary">
                    {formatCurrency(getTotalAssets())}
                  </Typography>
                </Box>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Net Worth
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {formatCurrency(reportData.netWorth[reportData.netWorth.length - 1]?.net_worth)}
                  </Typography>
                </Box>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {formatCurrency(getTotalExpenses())}
                  </Typography>
                </Box>
                <Payment color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Asset Types
                  </Typography>
                  <Typography variant="h4" component="div" color="info.main">
                    {reportData.assetAllocation.length}
                  </Typography>
                </Box>
                <PieChartIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
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
                  <LineChart data={reportData.netWorth}>
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
                      data={reportData.assetAllocation}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_value"
                      label={({ asset_type, percentage }) => `${asset_type} (${percentage}%)`}
                    >
                      {reportData.assetAllocation.map((entry, index) => (
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

        {/* Expense Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Analysis
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.expenseAnalysis.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Bar dataKey="total_amount" fill="#FF9800" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget vs Actual */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget vs Actual
              </Typography>
              <Box>
                {reportData.budgetComparison.length > 0 ? (
                  reportData.budgetComparison.map((budget, index) => (
                    <Box key={index} mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">{budget.category}</Typography>
                        <Chip 
                          label={`${budget.usage_percent}%`}
                          color={budget.usage_percent > 100 ? 'error' : budget.usage_percent > 80 ? 'warning' : 'success'}
                          size="small"
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">
                          Actual: ₹{budget.actual_amount?.toLocaleString('en-IN') || '0'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Budget: ₹{budget.planned_amount?.toLocaleString('en-IN') || '0'}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography color="textSecondary">
                      No budget data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Asset Details
              </Typography>
              <Grid container spacing={2}>
                {reportData.assetAllocation.map((asset, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box p={2} border="1px solid #eee" borderRadius={1}>
                      <Typography variant="h6" color="primary">
                        {asset.asset_type}
                      </Typography>
                      <Typography variant="h5" gutterBottom>
                        {formatCurrency(asset.total_value)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {asset.count} {asset.count === 1 ? 'item' : 'items'} • {asset.percentage}% of portfolio
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
