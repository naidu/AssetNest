const express = require('express');
const { 
  getTransactions, 
  createTransaction,
  transferTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getCategories 
} = require('../controllers/transactions');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getTransactions);
router.get('/categories', getCategories);
router.post('/', validateRequest(schemas.transaction), createTransaction);
router.post('/transfer', validateRequest(schemas.transfer), transferTransaction);
router.put('/:id', validateRequest(schemas.updateTransaction), updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
