const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateLeaveBalance
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// All routes are admin only
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/leave-balance', protect, admin, updateLeaveBalance);

module.exports = router;
