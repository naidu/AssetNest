import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add, Payment } from '@mui/icons-material';
import apiService from '../services/apiService';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';

const Transactions = () => {
  const { selectedCurrency, currencies } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    category_id: '',
    purpose: '',
    txn_type: 'expense',
    amount: '',
    currency: selectedCurrency,
    txn_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, categoriesResponse, assetsResponse] = await Promise.all([
          apiService.getTransactions({ limit: 50 }),
          apiService.getCategories(),
          apiService.getAssets()
        ]);
        // Filter transactions by selected currency
        const filteredTransactions = (transactionsResponse.transactions || []).filter(transaction => transaction.currency === selectedCurrency);
        setTransactions(filteredTransactions);
        setCategories(categoriesResponse.categories || []);
        setAssets(assetsResponse.assets || []);
      } catch (err) {
        setError('Failed to load transactions');
        console.error('Transactions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCurrency]);

  const handleAddTransaction = async () => {
    try {
      await apiService.createTransaction(formData);
      setOpenAddModal(false);
      setFormData({
        asset_id: '',
        category_id: '',
        purpose: '',
        txn_type: 'expense',
        amount: '',
        currency: selectedCurrency,
        txn_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      // Refresh transactions list
      const response = await apiService.getTransactions({ limit: 50 });
      const filteredTransactions = (response.transactions || []).filter(transaction => transaction.currency === selectedCurrency);
      setTransactions(filteredTransactions);
    } catch (err) {
      setError('Failed to create transaction');
      console.error('Create transaction error:', err);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'income': return 'success';
      case 'expense': return 'error';
      case 'transfer': return 'info';
      default: return 'default';
    }
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
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddModal(true)}
        >
          Add Transaction
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {transactions.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.txn_id}>
                  <TableCell>
                    {new Date(transaction.txn_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.purpose || '-'}</TableCell>
                  <TableCell>{transaction.category_name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.txn_type} 
                      color={getTypeColor(transaction.txn_type)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      color={transaction.txn_type === 'income' ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {transaction.txn_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency, currencies)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box textAlign="center" py={4}>
          <Payment sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No transactions found
          </Typography>
          <Typography color="textSecondary" paragraph>
            Start tracking your finances by adding your first transaction
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddModal(true)}
          >
            Add Your First Transaction
          </Button>
        </Box>
      )}

      {/* Add Transaction Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={formData.txn_type}
                  onChange={(e) => setFormData({...formData, txn_type: e.target.value})}
                  label="Transaction Type"
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  label="Category"
                >
                  {categories
                    .filter(cat => cat.txn_kind === formData.txn_type)
                    .map((category) => (
                      <MenuItem key={category.category_id} value={category.category_id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Related Asset (Optional)</InputLabel>
                <Select
                  value={formData.asset_id}
                  onChange={(e) => setFormData({...formData, asset_id: e.target.value})}
                  label="Related Asset (Optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  {assets.map((asset) => (
                    <MenuItem key={asset.asset_id} value={asset.asset_id}>
                      {asset.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Transaction Date"
                value={formData.txn_date}
                onChange={(e) => setFormData({...formData, txn_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  label="Currency"
                >
                  <MenuItem value="INR">INR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button 
            onClick={handleAddTransaction} 
            variant="contained"
            disabled={!formData.purpose || !formData.category_id || !formData.amount}
          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;
