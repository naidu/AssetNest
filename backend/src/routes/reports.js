const express = require('express');
const { 
  getNetWorth, 
  getExpenseAnalysis, 
  getBudgetVsActual, 
  getAssetAllocation 
} = require('../controllers/reports');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/networth', getNetWorth);
router.get('/expenses', getExpenseAnalysis);
router.get('/budget-vs-actual', getBudgetVsActual);
router.get('/asset-allocation', getAssetAllocation);

module.exports = router;
