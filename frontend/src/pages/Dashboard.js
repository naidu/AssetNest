import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
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
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedCurrency, currencies } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [detailType, setDetailType] = useState('');
  const [detailData, setDetailData] = useState({});
  const [dashboardData, setDashboardData] = useState({
    totalAssets: 0,
    totalTransactions: 0,
    monthlyExpenses: 0,
    netWorth: [],
    assetAllocation: [],
    recentTransactions: [],
    allAssets: [],
    allTransactions: [],
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
          apiService.getAssets().catch(err => ({ assets: [] })),
          apiService.getTransactions({ limit: 5 }).catch(err => ({ transactions: [] })),
          apiService.getNetWorth({ months: 6 }).catch(err => ({ networth_data: [] })),
          apiService.getAssetAllocation().catch(err => ({ asset_allocation: [] })),
        ]);

        // Calculate summary statistics filtered by selected currency
        const assetsInCurrency = assetsResponse.assets?.filter(asset => asset.currency === selectedCurrency) || [];
        const totalAssets = assetsInCurrency.reduce((sum, asset) => sum + (parseFloat(asset.current_value) || 0), 0);
        
        // Calculate monthly expenses for selected currency
        const currentMonthTransactions = transactionsResponse.transactions?.filter(t => {
          const transactionDate = new Date(t.txn_date);
          const currentDate = new Date();
          return transactionDate.getMonth() === currentDate.getMonth() && 
                 transactionDate.getFullYear() === currentDate.getFullYear() &&
                 t.txn_type === 'expense' &&
                 t.currency === selectedCurrency;
        }) || [];

        const monthlyExpenses = currentMonthTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        // Calculate net worth for selected currency
        const totalAssetsInCurrency = assetsInCurrency.reduce((sum, asset) => sum + (parseFloat(asset.current_value) || 0), 0);
        
        // For now, use the total assets as net worth since we don't have currency-specific net worth history
        const netWorthInCurrency = [{
          month: new Date().toISOString().slice(0, 7),
          total_assets: totalAssetsInCurrency,
          total_liabs: 0,
          net_worth: totalAssetsInCurrency
        }];

        // Calculate transactions count for selected currency
        const transactionsInCurrency = transactionsResponse.transactions?.filter(t => t.currency === selectedCurrency) || [];
        const totalTransactionsInCurrency = transactionsInCurrency.length;

        setDashboardData({
          totalAssets,
          totalTransactions: totalTransactionsInCurrency,
          monthlyExpenses,
          netWorth: netWorthInCurrency,
          assetAllocation: Array.isArray(assetAllocationResponse.asset_allocation) ? assetAllocationResponse.asset_allocation : [],
          recentTransactions: transactionsResponse.transactions || [],
          allAssets: assetsResponse.assets || [], // Store all assets for currency switching
          allTransactions: transactionsResponse.transactions || [], // Store all transactions for currency switching
        });

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedCurrency]); // Add selectedCurrency as dependency



  const StatCard = ({ title, value, icon, color = 'primary', currency = 'INR', onClick, isCount = false }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {isCount ? value.toLocaleString() : formatCurrency(value, currency, currencies)}
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

  const handleCardClick = (type) => {
    setDetailType(type);
    setDetailData({
      currency: selectedCurrency,
      totalAssets: dashboardData.totalAssets,
      netWorth: dashboardData.netWorth && dashboardData.netWorth.length > 0 ? dashboardData.netWorth[dashboardData.netWorth.length - 1]?.net_worth || 0 : 0,
      monthlyExpenses: dashboardData.monthlyExpenses,
      totalTransactions: dashboardData.totalTransactions,
      assetsInCurrency: dashboardData.allAssets?.filter(asset => asset.currency === selectedCurrency) || [],
      transactionsInCurrency: dashboardData.allTransactions?.filter(t => t.currency === selectedCurrency) || [],
      currentMonthTransactions: dashboardData.allTransactions?.filter(t => {
        const transactionDate = new Date(t.txn_date);
        const currentDate = new Date();
        return transactionDate.getMonth() === currentDate.getMonth() && 
               transactionDate.getFullYear() === currentDate.getFullYear() &&
               t.txn_type === 'expense' &&
               t.currency === selectedCurrency;
      }) || [],
    });
    setOpenDetailModal(true);
  };

  const getDetailTitle = (type) => {
    switch (type) {
      case 'assets': return 'Total Assets Breakdown';
      case 'networth': return 'Net Worth Breakdown';
      case 'expenses': return 'Monthly Expenses Breakdown';
      case 'transactions': return 'Transactions Summary';
      default: return 'Details';
    }
  };

  const renderDetailContent = () => {
    switch (detailType) {
      case 'assets':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Assets in {selectedCurrency}
            </Typography>
            <List>
              {detailData.assetsInCurrency.map((asset, index) => (
                <React.Fragment key={asset.asset_id}>
                  <ListItem>
                    <ListItemText
                      primary={asset.display_name}
                      secondary={`${asset.type_name} • Acquired: ${new Date(asset.acquisition_dt).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(asset.current_value, selectedCurrency, currencies)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < detailData.assetsInCurrency.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="h6" color="primary">
                Total: {formatCurrency(detailData.totalAssets, selectedCurrency, currencies)}
              </Typography>
            </Box>
          </Box>
        );

      case 'networth':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Net Worth Calculation
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Total Assets"
                  secondary="Sum of all asset values"
                />
                <ListItemSecondaryAction>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(detailData.totalAssets, selectedCurrency, currencies)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Total Liabilities"
                  secondary="Sum of all liabilities"
                />
                <ListItemSecondaryAction>
                  <Typography variant="h6" color="error">
                    {formatCurrency(0, selectedCurrency, currencies)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Net Worth"
                  secondary="Assets - Liabilities"
                />
                <ListItemSecondaryAction>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {formatCurrency(detailData.netWorth, selectedCurrency, currencies)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Box>
        );

      case 'expenses':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Monthly Expenses in {selectedCurrency}
            </Typography>
            <List>
              {detailData.currentMonthTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.txn_id}>
                  <ListItem>
                    <ListItemText
                      primary={transaction.purpose}
                      secondary={`${transaction.category_name} • ${new Date(transaction.txn_date).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="h6" color="error">
                        -{formatCurrency(transaction.amount, selectedCurrency, currencies)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < detailData.currentMonthTransactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="h6" color="error">
                Total Monthly Expenses: {formatCurrency(detailData.monthlyExpenses, selectedCurrency, currencies)}
              </Typography>
            </Box>
          </Box>
        );

      case 'transactions':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Transactions Summary in {selectedCurrency}
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Total Transactions"
                  secondary="All transactions in this currency"
                />
                <ListItemSecondaryAction>
                  <Typography variant="h6" color="primary">
                    {detailData.totalTransactions}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Recent Transactions"
                  secondary="Latest transactions"
                />
                <ListItemSecondaryAction>
                  <Chip 
                    label={`${Math.min(detailData.transactionsInCurrency.length, 5)} shown`} 
                    size="small" 
                    color="primary" 
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Recent Transactions:
              </Typography>
              {detailData.transactionsInCurrency.slice(0, 5).map((transaction, index) => (
                <Box key={transaction.txn_id} mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {transaction.purpose} ({transaction.category_name})
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={transaction.txn_type === 'income' ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {transaction.txn_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, selectedCurrency, currencies)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      default:
        return <Typography>No details available</Typography>;
    }
  };

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Here's an overview of your financial portfolio
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assets"
            value={dashboardData.totalAssets}
            icon={<AccountBalance fontSize="large" />}
            color="primary"
            currency={selectedCurrency}
            onClick={() => handleCardClick('assets')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Worth"
            value={dashboardData.netWorth && dashboardData.netWorth.length > 0 ? dashboardData.netWorth[dashboardData.netWorth.length - 1]?.net_worth || 0 : 0}
            icon={<TrendingUp fontSize="large" />}
            color="success"
            currency={selectedCurrency}
            onClick={() => handleCardClick('networth')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Expenses"
            value={dashboardData.monthlyExpenses}
            icon={<Payment fontSize="large" />}
            color="error"
            currency={selectedCurrency}
            onClick={() => handleCardClick('expenses')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transactions"
            value={dashboardData.totalTransactions}
            icon={<Assessment fontSize="large" />}
            color="info"
            currency={selectedCurrency}
            onClick={() => handleCardClick('transactions')}
            isCount={true}
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
                {dashboardData.netWorth && dashboardData.netWorth.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.netWorth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => {
                        const symbol = selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : '£';
                        return `${symbol}${(value/100000).toFixed(0)}L`;
                      }} />
                      <Tooltip formatter={(value) => [formatCurrency(value, selectedCurrency, currencies), 'Net Worth']} />
                      <Line type="monotone" dataKey="net_worth" stroke="#2E7D32" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography color="textSecondary">No net worth data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Multi-Currency Asset Allocation */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio by Currency
              </Typography>
              <Box height={300}>
                {dashboardData.assetAllocation && dashboardData.assetAllocation.length > 0 ? (
                  dashboardData.assetAllocation
                    .filter(currencyGroup => currencyGroup.currency === selectedCurrency)
                    .map((currencyGroup, index) => (
                      <Box key={currencyGroup.currency || index} mb={2}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          {currencyGroup.currency} Portfolio - {formatCurrency(currencyGroup.total_value, currencyGroup.currency, currencies)}
                        </Typography>
                        <Box ml={2}>
                          {currencyGroup.assets && currencyGroup.assets.length > 0 ? (
                            currencyGroup.assets.map((asset, assetIndex) => (
                              <Box key={assetIndex} display="flex" justifyContent="space-between" alignItems="center" py={0.5}>
                                <Typography variant="body2">
                                  {asset.asset_type} ({asset.count})
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {formatCurrency(asset.total_value, currencyGroup.currency, currencies)} ({asset.percentage}%)
                                </Typography>
                              </Box>
                            ))
                          ) : (
                            <Typography variant="body2" color="textSecondary">No assets in this currency</Typography>
                          )}
                        </Box>
                      </Box>
                    ))
                ) : (
                  <Typography color="textSecondary">No assets found</Typography>
                )}
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
                {dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                  dashboardData.recentTransactions
                    .filter(transaction => transaction.currency === selectedCurrency)
                    .map((transaction, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1} borderBottom="1px solid #eee">
                      <Box>
                        <Typography variant="body1">{transaction.purpose || transaction.category_name || 'Transaction'}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {transaction.txn_date ? new Date(transaction.txn_date).toLocaleDateString() : 'No date'}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body1" 
                        color={transaction.txn_type === 'income' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.txn_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount || 0, selectedCurrency, currencies)}
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

      {/* Detail Modal */}
      <Dialog 
        open={openDetailModal} 
        onClose={() => setOpenDetailModal(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {getDetailTitle(detailType)}
        </DialogTitle>
        <DialogContent>
          {renderDetailContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
