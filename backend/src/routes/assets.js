const express = require('express');
const { 
  getAssets, 
  getAssetById, 
  createAsset, 
  updateAsset, 
  deleteAsset, 
  getAssetTypes,
  getAssetHistory
} = require('../controllers/assets');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Asset CRUD operations
router.get('/', getAssets);
router.get('/types', getAssetTypes);
router.get('/:id', getAssetById);
router.get('/:id/history', getAssetHistory);
router.post('/', validateRequest(schemas.asset), createAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

module.exports = router;
