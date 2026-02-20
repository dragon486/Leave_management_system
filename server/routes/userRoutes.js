const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateLeaveBalance,
    requestAdmin,
    handleAdminRequest,
    getAdminRequests
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// Request Admin Access (User)
router.post('/request-admin', protect, requestAdmin);

// Admin Routes
router.get('/', protect, admin, getAllUsers);
router.get('/admin-requests', protect, admin, getAdminRequests); // Check requests
router.put('/:id/handle-admin-request', protect, admin, handleAdminRequest); // Handle request
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/leave-balance', protect, admin, updateLeaveBalance);

module.exports = router;
