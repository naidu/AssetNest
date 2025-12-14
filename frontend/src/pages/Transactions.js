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
import { Add, Payment, Edit, Delete, SwapHoriz } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import apiService from '../services/apiService';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';

const Transactions = () => {
  const { selectedCurrency, currencies } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formData, setFormData] = useState({
    asset_id: '',
    account_id: '',
    category_id: '',
    purpose: '',
    txn_type: 'expense',
    amount: '',
    currency: selectedCurrency,
    txn_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [transferData, setTransferData] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: '',
    currency: selectedCurrency,
    txn_date: new Date().toISOString().split('T')[0],
    purpose: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, categoriesResponse, assetsResponse, bankAccountsResponse] = await Promise.all([
          apiService.getTransactions({ limit: 50 }),
          apiService.getCategories(),
          apiService.getAssets(),
          apiService.getBankAccounts()
        ]);
        // Filter transactions by selected currency
        const filteredTransactions = (transactionsResponse.transactions || []).filter(transaction => transaction.currency === selectedCurrency);
        setTransactions(filteredTransactions);
        setCategories(categoriesResponse.categories || []);
        setAssets(assetsResponse.assets || []);
        // Filter bank accounts by selected currency
        const filteredBankAccounts = (bankAccountsResponse.bank_accounts || []).filter(account => account.currency === selectedCurrency);
        setBankAccounts(filteredBankAccounts);
      } catch (err) {
        setError('Failed to load transactions');
        console.error('Transactions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCurrency]);

  const refreshTransactions = async () => {
    try {
      const response = await apiService.getTransactions({ limit: 50 });
      const filteredTransactions = (response.transactions || []).filter(transaction => transaction.currency === selectedCurrency);
      setTransactions(filteredTransactions);
    } catch (err) {
      console.error('Refresh transactions error:', err);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const payload = {
        ...formData,
        asset_id: formData.asset_id ? Number(formData.asset_id) : null,
        account_id: formData.account_id ? Number(formData.account_id) : null,
        category_id: Number(formData.category_id),
        amount: Number(formData.amount)
      };

      await apiService.createTransaction(payload);
      setOpenAddModal(false);
      setFormData({
        asset_id: '',
        account_id: '',
        category_id: '',
        purpose: '',
        txn_type: 'expense',
        amount: '',
        currency: selectedCurrency,
        txn_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      await refreshTransactions();
    } catch (err) {
      setError('Failed to create transaction');
      console.error('Create transaction error:', err);
    }
  };

  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      asset_id: transaction.asset_id || '',
      account_id: transaction.account_id || '',
      category_id: transaction.category_id || '',
      purpose: transaction.purpose || '',
      txn_type: transaction.txn_type || 'expense',
      amount: transaction.amount || '',
      currency: transaction.currency || selectedCurrency,
      txn_date: transaction.txn_date ? new Date(transaction.txn_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: transaction.notes || ''
    });
    setOpenEditModal(true);
  };

  const handleUpdateTransaction = async () => {
    try {
      const payload = {
        ...formData,
        asset_id: formData.asset_id ? Number(formData.asset_id) : null,
        account_id: formData.account_id ? Number(formData.account_id) : null,
        category_id: Number(formData.category_id),
        amount: Number(formData.amount)
      };

      await apiService.updateTransaction(selectedTransaction.txn_id, payload);
      setOpenEditModal(false);
      setSelectedTransaction(null);
      setFormData({
        asset_id: '',
        account_id: '',
        category_id: '',
        purpose: '',
        txn_type: 'expense',
        amount: '',
        currency: selectedCurrency,
        txn_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      await refreshTransactions();
    } catch (err) {
      setError('Failed to update transaction');
      console.error('Update transaction error:', err);
    }
  };

  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiService.deleteTransaction(selectedTransaction.txn_id);
      setOpenDeleteDialog(false);
      setSelectedTransaction(null);
      await refreshTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Delete transaction error:', err);
    }
  };

  const handleTransfer = async () => {
    try {
      const payload = {
        ...transferData,
        from_account_id: Number(transferData.from_account_id),
        to_account_id: Number(transferData.to_account_id),
        amount: Number(transferData.amount)
      };

      await apiService.transferTransaction(payload);
      setOpenTransferModal(false);
      setTransferData({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        currency: selectedCurrency,
        txn_date: new Date().toISOString().split('T')[0],
        purpose: '',
        notes: ''
      });
      await refreshTransactions();
    } catch (err) {
      setError('Failed to transfer money');
      console.error('Transfer error:', err);
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
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={() => setOpenTransferModal(true)}
          >
            Transfer
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddModal(true)}
          >
            Add Transaction
          </Button>
        </Box>
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
                <TableCell>Account</TableCell>
                <TableCell>Related Asset</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
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
                    {transaction.account_name ? (
                      <Chip 
                        label={`${transaction.account_name} (${transaction.account_type})`} 
                        color="primary" 
                        size="small" 
                        variant="outlined"
                      />
                    ) : (
                      <Chip 
                        label="Cash" 
                        color="default" 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.asset_name ? (
                      <Chip 
                        label={transaction.asset_name} 
                        color="secondary" 
                        size="small" 
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">-</Typography>
                    )}
                  </TableCell>
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
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Tooltip title="Edit Transaction">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(transaction)}
                          aria-label="Edit transaction"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Transaction">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(transaction)}
                          aria-label="Delete transaction"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
      <Dialog 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="add-transaction-dialog-title"
        aria-describedby="add-transaction-dialog-description"
      >
        <DialogTitle id="add-transaction-dialog-title">Add New Transaction</DialogTitle>
        <DialogContent id="add-transaction-dialog-description">
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
                <InputLabel>Bank Account</InputLabel>
                <Select
                  value={formData.account_id}
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                  label="Bank Account"
                >
                  <MenuItem value="">Cash</MenuItem>
                  {bankAccounts.map((account) => (
                    <MenuItem key={account.account_id} value={account.account_id}>
                      {account.display_name} ({account.bank_name})
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

      {/* Edit Transaction Modal */}
      <Dialog 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="edit-transaction-dialog-title"
        aria-describedby="edit-transaction-dialog-description"
      >
        <DialogTitle id="edit-transaction-dialog-title">Edit Transaction</DialogTitle>
        <DialogContent id="edit-transaction-dialog-description">
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
                <InputLabel>Bank Account</InputLabel>
                <Select
                  value={formData.account_id}
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                  label="Bank Account"
                >
                  <MenuItem value="">Cash</MenuItem>
                  {bankAccounts.map((account) => (
                    <MenuItem key={account.account_id} value={account.account_id}>
                      {account.display_name} ({account.bank_name})
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
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateTransaction} 
            variant="contained"
            disabled={!formData.purpose || !formData.category_id || !formData.amount}
          >
            Update Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-transaction-dialog-title"
        aria-describedby="delete-transaction-dialog-description"
      >
        <DialogTitle id="delete-transaction-dialog-title">Delete Transaction</DialogTitle>
        <DialogContent id="delete-transaction-dialog-description">
          <Typography>
            Are you sure you want to delete this transaction? This will also update the account balance accordingly.
            <br />
            <strong>Purpose:</strong> {selectedTransaction?.purpose || '-'}
            <br />
            <strong>Amount:</strong> {selectedTransaction && formatCurrency(selectedTransaction.amount, selectedTransaction.currency, currencies)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Money Dialog */}
      <Dialog open={openTransferModal} onClose={() => setOpenTransferModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transfer Money Between Accounts</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>From Account</InputLabel>
                <Select
                  value={transferData.from_account_id}
                  onChange={(e) => setTransferData({...transferData, from_account_id: e.target.value})}
                  label="From Account"
                >
                  <MenuItem value="">Select Account</MenuItem>
                  {bankAccounts.map((account) => (
                    <MenuItem key={account.account_id} value={account.account_id}>
                      {account.display_name} ({account.bank_name}) - {formatCurrency(account.current_balance, account.currency, currencies)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>To Account</InputLabel>
                <Select
                  value={transferData.to_account_id}
                  onChange={(e) => setTransferData({...transferData, to_account_id: e.target.value})}
                  label="To Account"
                >
                  <MenuItem value="">Select Account</MenuItem>
                  {bankAccounts
                    .filter(account => account.account_id !== Number(transferData.from_account_id))
                    .map((account) => (
                      <MenuItem key={account.account_id} value={account.account_id}>
                        {account.display_name} ({account.bank_name})
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
                value={transferData.amount}
                onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Transfer Date"
                value={transferData.txn_date}
                onChange={(e) => setTransferData({...transferData, txn_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={transferData.currency}
                  onChange={(e) => setTransferData({...transferData, currency: e.target.value})}
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
                label="Purpose"
                value={transferData.purpose}
                onChange={(e) => setTransferData({...transferData, purpose: e.target.value})}
                placeholder="e.g., Transfer to savings account"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={transferData.notes}
                onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransferModal(false)}>Cancel</Button>
          <Button 
            onClick={handleTransfer} 
            variant="contained"
            disabled={!transferData.from_account_id || !transferData.to_account_id || !transferData.amount}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;
