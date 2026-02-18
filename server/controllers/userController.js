const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        const { role, department, isActive, page = 1, limit = 10 } = req.query;

        let query = {};

        // Apply filters
        if (role) query.role = role;
        if (department) query.department = department;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        // Pagination
        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .sort({ joinDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalUsers: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.department = req.body.department || user.department;
        user.role = req.body.role || user.role;

        if (req.body.isActive !== undefined) {
            user.isActive = req.body.isActive;
        }

        const updatedUser = await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                department: updatedUser.department,
                leaveBalance: updatedUser.leaveBalance,
                isActive: updatedUser.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Soft delete - just deactivate
        user.isActive = false;
        await user.save();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user leave balance
// @route   PUT /api/users/:id/leave-balance
// @access  Private (Admin)
const updateLeaveBalance = async (req, res) => {
    try {
        const { sick, casual, vacation } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update leave balance
        if (sick !== undefined) user.leaveBalance.sick = sick;
        if (casual !== undefined) user.leaveBalance.casual = casual;
        if (vacation !== undefined) user.leaveBalance.vacation = vacation;

        await user.save();

        res.json({
            message: 'Leave balance updated successfully',
            leaveBalance: user.leaveBalance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateLeaveBalance
};
