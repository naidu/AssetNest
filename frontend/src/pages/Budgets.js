import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
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
} from '@mui/material';
import { Add, TrendingUp, Delete } from '@mui/icons-material';
import apiService from '../services/apiService';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    planned_amount: '',
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [budgetsResponse, categoriesResponse] = await Promise.all([
          apiService.getBudgets(),
          apiService.getCategories()
        ]);
        setBudgets(budgetsResponse.budgets || []);
        setCategories(categoriesResponse.categories || []);
      } catch (err) {
        setError('Failed to load budgets');
        console.error('Budgets fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddBudget = async () => {
    try {
      await apiService.createBudget(formData);
      setOpenAddModal(false);
      setFormData({
        category_id: '',
        planned_amount: '',
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      });
      // Refresh budgets list
      const response = await apiService.getBudgets();
      setBudgets(response.budgets || []);
    } catch (err) {
      setError('Failed to create budget');
      console.error('Create budget error:', err);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await apiService.deleteBudget(budgetId);
        setBudgets(budgets.filter(budget => budget.budget_id !== budgetId));
      } catch (err) {
        setError('Failed to delete budget');
        console.error('Delete budget error:', err);
      }
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'error';
  };

  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount) return '0';
    
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${parseFloat(amount).toLocaleString('en-IN')}`;
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
          Budgets
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddModal(true)}
        >
          Add Budget
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const usagePercent = budget.planned_amount > 0 
              ? Math.round((budget.actual_amount / budget.planned_amount) * 100)
              : 0;

            return (
              <Grid item xs={12} md={6} lg={4} key={budget.budget_id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" gutterBottom>
                        {budget.category_name}
                      </Typography>
                      <Tooltip title="Delete Budget">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteBudget(budget.budget_id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">
                          Spent: {formatCurrency(budget.actual_amount, budget.currency)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Budget: {formatCurrency(budget.planned_amount, budget.currency)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(usagePercent, 100)}
                        color={getProgressColor(usagePercent)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Box mt={1}>
                        <Typography variant="body2" color="textSecondary">
                          {usagePercent}% used
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Period: {new Date(budget.period_start).toLocaleDateString()} - {new Date(budget.period_end).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <TrendingUp sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No budgets found
              </Typography>
              <Typography color="textSecondary" paragraph>
                Create budgets to track your spending and achieve your financial goals
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddModal(true)}
              >
                Create Your First Budget
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add Budget Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Budget</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  label="Category"
                >
                  {categories
                    .filter(cat => cat.txn_kind === 'expense')
                    .map((category) => (
                      <MenuItem key={category.category_id} value={category.category_id}>
                        {category.name}
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
                label="Planned Amount"
                value={formData.planned_amount}
                onChange={(e) => setFormData({...formData, planned_amount: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Period Start"
                value={formData.period_start}
                onChange={(e) => setFormData({...formData, period_start: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Period End"
                value={formData.period_end}
                onChange={(e) => setFormData({...formData, period_end: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button 
            onClick={handleAddBudget} 
            variant="contained"
            disabled={!formData.category_id || !formData.planned_amount}
          >
            Create Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Budgets;
