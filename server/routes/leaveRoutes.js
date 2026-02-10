const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getMyLeaves,
    cancelLeave,
    getLeaveBalance,
    getAllLeaves,
    updateLeaveStatus,
    getLeaveStatistics,
    getUserLeaves
} = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/auth');

// ============== USER ROUTES ==============
router.post('/apply', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.put('/:id/cancel', protect, cancelLeave);
router.get('/balance', protect, getLeaveBalance);

// ============== ADMIN ROUTES ==============
router.get('/all', protect, admin, getAllLeaves);
router.put('/:id/status', protect, admin, updateLeaveStatus);
router.get('/statistics', protect, admin, getLeaveStatistics);
router.get('/user/:userId', protect, admin, getUserLeaves);

module.exports = router;
