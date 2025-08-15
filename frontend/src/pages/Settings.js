import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Add, 
  Delete, 
  Edit,
  CurrencyExchange 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { commonCurrencies } from '../utils/currencyUtils';

const Settings = () => {
  const { user } = useAuth();
  const { currencies, addCurrency, removeCurrency, updateCurrencyDetails } = useCurrency();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    symbol: '',
    name: ''
  });

  const handleAddCurrency = () => {
    if (formData.code && formData.symbol && formData.name) {
      addCurrency(formData);
      setFormData({ code: '', symbol: '', name: '' });
      setOpenAddDialog(false);
    }
  };

  const handleEditCurrency = () => {
    if (formData.code && formData.symbol && formData.name) {
      updateCurrencyDetails(editingCurrency.code, formData);
      setFormData({ code: '', symbol: '', name: '' });
      setEditingCurrency(null);
      setOpenEditDialog(false);
    }
  };

  const handleEditClick = (currency) => {
    setEditingCurrency(currency);
    setFormData(currency);
    setOpenEditDialog(true);
  };

  const handleRemoveCurrency = (currencyCode) => {
    if (window.confirm(`Are you sure you want to remove ${currencyCode}?`)) {
      removeCurrency(currencyCode);
    }
  };

  const handleQuickAdd = (currency) => {
    addCurrency(currency);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {user?.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Role:</strong> {user?.role}
              </Typography>
              <Typography variant="body1">
                <strong>Household ID:</strong> {user?.household_id}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Currency Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  <CurrencyExchange sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Currency Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenAddDialog(true)}
                  size="small"
                >
                  Add Currency
                </Button>
              </Box>
              
              <List>
                {currencies.map((currency, index) => (
                  <React.Fragment key={currency.code}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                              label={currency.symbol} 
                              size="small" 
                              color="primary" 
                            />
                            <Typography variant="body1">
                              {currency.name} ({currency.code})
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEditClick(currency)}
                          sx={{ mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveCurrency(currency.code)}
                          disabled={currencies.length <= 1}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < currencies.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              {/* Quick Add Common Currencies */}
              <Box mt={3}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Quick Add Common Currencies:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {commonCurrencies
                    .filter(common => !currencies.find(user => user.code === common.code))
                    .map((currency) => (
                      <Chip
                        key={currency.code}
                        label={`${currency.symbol} ${currency.code}`}
                        onClick={() => handleQuickAdd(currency)}
                        clickable
                        size="small"
                        variant="outlined"
                      />
                    ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Currency Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Currency</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Currency Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., USD"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Currency Symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="e.g., $"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Currency Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., US Dollar"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCurrency} variant="contained">Add Currency</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Currency Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Currency</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Currency Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Currency Symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Currency Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditCurrency} variant="contained">Update Currency</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
