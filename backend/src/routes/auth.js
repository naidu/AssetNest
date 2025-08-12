const express = require('express');
const { register, login, logout, profile, getUserPreferences, updateUserPreferences } = require('../controllers/auth');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRequest(schemas.register), register);
router.post('/login', validateRequest(schemas.login), login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, profile);
router.get('/preferences', authenticateToken, getUserPreferences);
router.put('/preferences', authenticateToken, updateUserPreferences);

module.exports = router;
