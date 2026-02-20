const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
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
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
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

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.department = req.body.department || user.department;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                department: updatedUser.department
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave balance
// @route   PUT /api/users/:id/leave-balance
// @access  Private (Admin)
const updateLeaveBalance = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.leaveBalance = req.body.leaveBalance || user.leaveBalance;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request admin access
// @route   POST /api/users/request-admin
// @access  Private
const requestAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Check for cooldown (e.g., 7 days)
            if (user.adminRequestDate) {
                const now = new Date();
                const lastRequest = new Date(user.adminRequestDate);
                const diffTime = Math.abs(now - lastRequest);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const cooldownDays = 7;

                if (diffDays < cooldownDays) {
                    return res.status(400).json({
                        message: `You can only request admin access once every ${cooldownDays} days. Please wait ${cooldownDays - diffDays} more days.`
                    });
                }
            }

            user.adminRequestStatus = 'pending';
            user.adminRequestReason = req.body.reason || '';
            user.adminRequestDate = Date.now();
            await user.save();
            res.json({ message: 'Admin access request submitted' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Handle admin request (approve/reject)
// @route   PUT /api/users/:id/handle-admin-request
// @access  Private (Admin)
const handleAdminRequest = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (status === 'approved') {
            user.role = 'admin';
            user.adminRequestStatus = 'approved';
        } else if (status === 'rejected') {
            user.adminRequestStatus = 'rejected';
        } else {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await user.save();
        res.json({ message: `Request ${status}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending admin requests
// @route   GET /api/users/admin-requests
// @access  Private (Admin)
const getAdminRequests = async (req, res) => {
    try {
        const users = await User.find({ adminRequestStatus: 'pending' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateLeaveBalance,
    requestAdmin,
    handleAdminRequest,
    getAdminRequests
};
