const express = require('express');
const { 
  getBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget 
} = require('../controllers/budgets');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getBudgets);
router.post('/', validateRequest(schemas.budget), createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
