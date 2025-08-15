import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
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
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  AccountBalance,
  Edit,
  Delete,
  Visibility,
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';

const BankAccounts = () => {
  const { selectedCurrency, currencies } = useCurrency();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [formData, setFormData] = useState({
    display_name: '',
    bank_name: '',
    account_type: 'savings',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    opening_balance: '',
    currency: selectedCurrency,
    notes: '',
    is_active: true
  });

  useEffect(() => {
    fetchBankAccounts();
  }, [selectedCurrency]);

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBankAccounts();
      // Filter accounts by selected currency
      const filteredAccounts = response.bank_accounts.filter(account => account.currency === selectedCurrency);
      setBankAccounts(filteredAccounts);
    } catch (err) {
      setError('Failed to load bank accounts');
      console.error('Bank accounts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      await apiService.createBankAccount(formData);
      setOpenAddModal(false);
      setFormData({
        display_name: '',
        bank_name: '',
        account_type: 'savings',
        account_number: '',
        ifsc_code: '',
        branch_name: '',
        opening_balance: '',
        currency: selectedCurrency,
        notes: '',
        is_active: true
      });
      fetchBankAccounts();
    } catch (err) {
      setError('Failed to create bank account');
      console.error('Create bank account error:', err);
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setFormData({
      display_name: account.display_name,
      bank_name: account.bank_name,
      account_type: account.account_type,
      account_number: account.account_number || '',
      ifsc_code: account.ifsc_code || '',
      branch_name: account.branch_name || '',
      opening_balance: account.opening_balance,
      currency: account.currency,
      notes: account.notes || '',
      is_active: account.is_active
    });
    setOpenEditModal(true);
  };

  const handleUpdateAccount = async () => {
    try {
      await apiService.updateBankAccount(editingAccount.account_id, formData);
      setOpenEditModal(false);
      setEditingAccount(null);
      setFormData({
        display_name: '',
        bank_name: '',
        account_type: 'savings',
        account_number: '',
        ifsc_code: '',
        branch_name: '',
        opening_balance: '',
        currency: selectedCurrency,
        notes: '',
        is_active: true
      });
      fetchBankAccounts();
    } catch (err) {
      setError('Failed to update bank account');
      console.error('Update bank account error:', err);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
      try {
        await apiService.deleteBankAccount(accountId);
        setBankAccounts(bankAccounts.filter(account => account.account_id !== accountId));
      } catch (err) {
        setError('Failed to delete bank account');
        console.error('Delete bank account error:', err);
      }
    }
  };

  const handleViewAccount = async (account) => {
    try {
      setSelectedAccount(account);
      const response = await apiService.getBankAccountBalance(account.account_id);
      setAccountBalance(response);
      setOpenViewModal(true);
    } catch (err) {
      setError('Failed to load account details');
      console.error('View account error:', err);
    }
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'savings': return 'success';
      case 'current': return 'primary';
      case 'credit': return 'warning';
      case 'loan': return 'error';
      case 'investment': return 'info';
      case 'nre': return 'secondary';
      case 'nro': return 'secondary';
      default: return 'default';
    }
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'savings': return <AccountBalanceWallet />;
      case 'current': return <AccountBalance />;
      case 'credit': return <TrendingUp />;
      case 'loan': return <TrendingDown />;
      case 'investment': return <TrendingUp />;
      default: return <AccountBalance />;
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
          Bank Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddModal(true)}
        >
          Add Bank Account
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {bankAccounts.length > 0 ? (
          bankAccounts.map((account) => (
            <Grid item xs={12} md={6} lg={4} key={account.account_id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getAccountTypeIcon(account.account_type)}
                      <Typography variant="h6" component="div">
                        {account.display_name}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleViewAccount(account)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Account">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditAccount(account)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Account">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteAccount(account.account_id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Typography color="textSecondary" gutterBottom>
                    {account.bank_name}
                  </Typography>
                  
                  <Box display="flex" gap={1} mb={2}>
                    <Chip 
                      label={account.account_type} 
                      color={getAccountTypeColor(account.account_type)} 
                      size="small" 
                    />
                    <Chip 
                      label={account.is_active ? 'Active' : 'Inactive'} 
                      color={account.is_active ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="h5" color="primary" gutterBottom>
                    {formatCurrency(account.current_balance, account.currency, currencies)}
                  </Typography>
                  
                  {account.account_number && (
                    <Typography variant="body2" color="textSecondary">
                      A/C: {account.account_number}
                    </Typography>
                  )}
                  
                  {account.ifsc_code && (
                    <Typography variant="body2" color="textSecondary">
                      IFSC: {account.ifsc_code}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <AccountBalance sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No bank accounts found
              </Typography>
              <Typography color="textSecondary" paragraph>
                Start tracking your finances by adding your first bank account
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddModal(true)}
              >
                Add Bank Account
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add Bank Account Dialog */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Bank Account</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="e.g., HDFC Savings"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="e.g., HDFC Bank"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  label="Account Type"
                >
                  <MenuItem value="savings">Savings</MenuItem>
                  <MenuItem value="current">Current</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="loan">Loan</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="nre">NRE (Non-Resident External)</MenuItem>
                  <MenuItem value="nro">NRO (Non-Resident Ordinary)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="e.g., 1234567890"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                placeholder="e.g., HDFC0001234"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Branch Name"
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                placeholder="e.g., Mumbai Main Branch"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Opening Balance"
                type="number"
                value={formData.opening_balance}
                onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  label="Currency"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this account"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active Account"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button onClick={handleAddAccount} variant="contained">Add Account</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Bank Account Dialog */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Bank Account</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  label="Account Type"
                >
                  <MenuItem value="savings">Savings</MenuItem>
                  <MenuItem value="current">Current</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="loan">Loan</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="nre">NRE (Non-Resident External)</MenuItem>
                  <MenuItem value="nro">NRO (Non-Resident Ordinary)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Branch Name"
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Opening Balance"
                type="number"
                value={formData.opening_balance}
                onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  label="Currency"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active Account"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateAccount} variant="contained">Update Account</Button>
        </DialogActions>
      </Dialog>

      {/* View Account Details Dialog */}
      <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Account Details</DialogTitle>
        <DialogContent>
          {selectedAccount && accountBalance && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedAccount.display_name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {selectedAccount.bank_name} • {selectedAccount.account_type}
              </Typography>
              
              <Box display="flex" gap={2} mb={3}>
                <Chip 
                  label={selectedAccount.account_type} 
                  color={getAccountTypeColor(selectedAccount.account_type)} 
                />
                <Chip 
                  label={selectedAccount.is_active ? 'Active' : 'Inactive'} 
                  color={selectedAccount.is_active ? 'success' : 'default'} 
                  variant="outlined"
                />
              </Box>
              
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" color="primary">
                    Current Balance: {formatCurrency(accountBalance.account_balance.current_balance, selectedAccount.currency, currencies)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    Opening Balance: {formatCurrency(selectedAccount.opening_balance, selectedAccount.currency, currencies)}
                  </Typography>
                </Grid>
              </Grid>
              
              {selectedAccount.account_number && (
                <Typography variant="body2" gutterBottom>
                  <strong>Account Number:</strong> {selectedAccount.account_number}
                </Typography>
              )}
              {selectedAccount.ifsc_code && (
                <Typography variant="body2" gutterBottom>
                  <strong>IFSC Code:</strong> {selectedAccount.ifsc_code}
                </Typography>
              )}
              {selectedAccount.branch_name && (
                <Typography variant="body2" gutterBottom>
                  <strong>Branch:</strong> {selectedAccount.branch_name}
                </Typography>
              )}
              {selectedAccount.notes && (
                <Typography variant="body2" gutterBottom>
                  <strong>Notes:</strong> {selectedAccount.notes}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Transaction Summary
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Total Transactions</Typography>
                  <Typography variant="h6">{accountBalance.summary.total_transactions}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Total Income</Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(accountBalance.summary.total_income, selectedAccount.currency, currencies)}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Total Expenses</Typography>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(accountBalance.summary.total_expenses, selectedAccount.currency, currencies)}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Total Transfers</Typography>
                  <Typography variant="h6" color="info.main">
                    {formatCurrency(accountBalance.summary.total_transfers, selectedAccount.currency, currencies)}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <List>
                {accountBalance.recent_transactions.map((transaction, index) => (
                  <React.Fragment key={transaction.txn_id}>
                    <ListItem>
                      <ListItemText
                        primary={transaction.purpose}
                        secondary={`${transaction.category_name} • ${new Date(transaction.txn_date).toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction>
                        <Typography 
                          variant="body1" 
                          color={transaction.txn_type === 'income' ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {transaction.txn_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency, currencies)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < accountBalance.recent_transactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankAccounts;
