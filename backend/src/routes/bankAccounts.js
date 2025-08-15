const express = require('express');
const router = express.Router();
const bankAccountsController = require('../controllers/bankAccounts');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all bank accounts for the household
router.get('/', bankAccountsController.getBankAccounts);

// Get a specific bank account
router.get('/:account_id', bankAccountsController.getBankAccount);

// Create a new bank account
router.post('/', bankAccountsController.createBankAccount);

// Update a bank account
router.put('/:account_id', bankAccountsController.updateBankAccount);

// Delete a bank account
router.delete('/:account_id', bankAccountsController.deleteBankAccount);

// Get account balance and transaction summary
router.get('/:account_id/balance', bankAccountsController.getAccountBalance);

// Update account balance (for reconciliation)
router.put('/:account_id/balance', bankAccountsController.updateAccountBalance);

module.exports = router;
