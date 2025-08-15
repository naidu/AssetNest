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
  Divider,
} from '@mui/material';
import { Add, AccountBalance, Edit, Delete, History } from '@mui/icons-material';
import apiService from '../services/apiService';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';

const Assets = () => {
  const { selectedCurrency, currencies } = useCurrency();
  const [assets, setAssets] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetHistory, setAssetHistory] = useState([]);
  const [formData, setFormData] = useState({
    asset_type_id: '',
    display_name: '',
    acquisition_dt: '',
    current_value: '',
    purchase_price: '',
    currency: selectedCurrency,
    notes: '',
    details: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assetsResponse, typesResponse] = await Promise.all([
          apiService.getAssets(),
          apiService.getAssetTypes()
        ]);
        // Filter assets by selected currency
        const filteredAssets = (assetsResponse.assets || []).filter(asset => asset.currency === selectedCurrency);
        setAssets(filteredAssets);
        setAssetTypes(typesResponse.asset_types || []);
      } catch (err) {
        setError('Failed to load assets');
        console.error('Assets fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCurrency]);

  const handleAddAsset = async () => {
    try {
      await apiService.createAsset(formData);
      setOpenAddModal(false);
      setFormData({
        asset_type_id: '',
        display_name: '',
        acquisition_dt: '',
        current_value: '',
        currency: selectedCurrency,
        notes: '',
        details: {}
      });
      // Refresh assets list
      const response = await apiService.getAssets();
      const filteredAssets = (response.assets || []).filter(asset => asset.currency === selectedCurrency);
      setAssets(filteredAssets);
    } catch (err) {
      setError('Failed to create asset');
      console.error('Create asset error:', err);
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setFormData({
      asset_type_id: asset.asset_type_id,
      display_name: asset.display_name,
      acquisition_dt: asset.acquisition_dt ? asset.acquisition_dt.split('T')[0] : '',
      current_value: asset.current_value,
      purchase_price: asset.purchase_price || '',
      currency: asset.currency,
      notes: asset.notes || '',
      details: asset.details || {}
    });
    setOpenEditModal(true);
  };

  const handleUpdateAsset = async () => {
    try {
      await apiService.updateAsset(editingAsset.asset_id, formData);
      setOpenEditModal(false);
      setEditingAsset(null);
      setFormData({
        asset_type_id: '',
        display_name: '',
        acquisition_dt: '',
        current_value: '',
        currency: 'INR',
        notes: '',
        details: {}
      });
      // Refresh assets list
      const response = await apiService.getAssets();
      const filteredAssets = (response.assets || []).filter(asset => asset.currency === selectedCurrency);
      setAssets(filteredAssets);
    } catch (err) {
      setError('Failed to update asset');
      console.error('Update asset error:', err);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await apiService.deleteAsset(assetId);
        setAssets(assets.filter(asset => asset.asset_id !== assetId));
      } catch (err) {
        setError('Failed to delete asset');
        console.error('Delete asset error:', err);
      }
    }
  };

  const handleViewHistory = async (asset) => {
    try {
      setSelectedAsset(asset);
      const response = await apiService.getAssetHistory(asset.asset_id);
      setAssetHistory(response.history || []);
      setOpenHistoryModal(true);
    } catch (err) {
      setError('Failed to load asset history');
      console.error('Asset history error:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'sold': return 'warning';
      case 'closed': return 'error';
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
          Assets
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddModal(true)}
        >
          Add Asset
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {assets.length > 0 ? (
          assets.map((asset) => (
            <Grid item xs={12} md={6} lg={4} key={asset.asset_id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" component="div">
                      {asset.display_name}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Chip 
                        label={asset.status} 
                        color={getStatusColor(asset.status)} 
                        size="small" 
                      />
                      <Tooltip title="View History">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleViewHistory(asset)}
                        >
                          <History fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Asset">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditAsset(asset)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Asset">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteAsset(asset.asset_id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {asset.type_name}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    Current: {formatCurrency(asset.current_value, asset.currency, currencies)}
                  </Typography>
                  {asset.purchase_price && (
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      Purchase: {formatCurrency(asset.purchase_price, asset.currency, currencies)}
                    </Typography>
                  )}
                  {asset.acquisition_dt && (
                    <Typography variant="body2" color="textSecondary">
                      Acquired: {new Date(asset.acquisition_dt).toLocaleDateString()}
                    </Typography>
                  )}
                  {asset.notes && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {asset.notes}
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
                No assets found
              </Typography>
              <Typography color="textSecondary" paragraph>
                Start building your portfolio by adding your first asset
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddModal(true)}
              >
                Add Your First Asset
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add Asset Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Asset</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Asset Type</InputLabel>
                <Select
                  value={formData.asset_type_id}
                  onChange={(e) => setFormData({...formData, asset_type_id: e.target.value})}
                  label="Asset Type"
                >
                  {assetTypes.map((type) => (
                    <MenuItem key={type.asset_type_id} value={type.asset_type_id}>
                      {type.type_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Asset Name"
                value={formData.display_name}
                onChange={(e) => setFormData({...formData, display_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Acquisition Date"
                value={formData.acquisition_dt}
                onChange={(e) => setFormData({...formData, acquisition_dt: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Current Value"
                value={formData.current_value}
                onChange={(e) => setFormData({...formData, current_value: e.target.value})}
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
                  <MenuItem value="GBP">GBP</MenuItem>
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
            onClick={handleAddAsset} 
            variant="contained"
            disabled={!formData.asset_type_id || !formData.display_name || !formData.current_value}
          >
            Add Asset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Asset Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Asset</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Asset Name"
                value={formData.display_name}
                onChange={(e) => setFormData({...formData, display_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Acquisition Date"
                value={formData.acquisition_dt}
                onChange={(e) => setFormData({...formData, acquisition_dt: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Current Value"
                value={formData.current_value}
                onChange={(e) => setFormData({...formData, current_value: e.target.value})}
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
                  <MenuItem value="GBP">GBP</MenuItem>
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
            onClick={handleUpdateAsset} 
            variant="contained"
            disabled={!formData.display_name || !formData.current_value}
          >
            Update Asset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset History Modal */}
      <Dialog open={openHistoryModal} onClose={() => setOpenHistoryModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Asset History - {selectedAsset?.display_name}
        </DialogTitle>
        <DialogContent>
          {assetHistory.length > 0 ? (
            <List>
              {assetHistory.map((entry, index) => (
                <Box key={entry.history_id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {entry.change_reason}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(entry.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          {entry.field_name && (
                            <Typography variant="body2" color="textSecondary">
                              Field: {entry.field_name}
                            </Typography>
                          )}
                          {entry.old_value && (
                            <Typography variant="body2" color="error">
                              From: {entry.old_value}
                            </Typography>
                          )}
                          {entry.new_value && (
                            <Typography variant="body2" color="success.main">
                              To: {entry.new_value}
                            </Typography>
                          )}
                          <Typography variant="body2" color="textSecondary">
                            By: {entry.user_name}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < assetHistory.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                No history available for this asset
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assets;
