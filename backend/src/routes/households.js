const express = require('express');
const { 
  getHouseholdInfo, 
  getHouseholdMembers, 
  inviteMember 
} = require('../controllers/households');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getHouseholdInfo);
router.get('/members', getHouseholdMembers);
router.post('/invite', inviteMember);

module.exports = router;
