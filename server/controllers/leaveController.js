const Leave = require('../models/leave');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// ============== USER FUNCTIONS ==============

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private (User)
const applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        // Calculate total days including partial days
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Calculate difference in milliseconds
        const diffMs = end - start;

        // Check if end date is before start date
        if (diffMs <= 0) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Convert to days (1 day = 24*60*60*1000 ms) and round to whole numbers as per user's preference
        const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        // Check if user has enough leave balance
        const user = await User.findById(req.user._id);


        if (user.leaveBalance[leaveType] < totalDays) {
            return res.status(400).json({
                message: `Insufficient ${leaveType} leave balance. Available: ${user.leaveBalance[leaveType]} days, Requested: ${totalDays} days`
            });
        }

        // Check for overlapping leaves
        const overlappingLeave = await Leave.findOne({
            userId: req.user._id,
            status: { $in: ['pending', 'approved'] },
            $or: [
                {
                    startDate: { $lte: end },
                    endDate: { $gte: start }
                }
            ]
        });

        if (overlappingLeave) {
            return res.status(400).json({
                message: 'You already have a leave application matching this date range'
            });
        }


        // Create leave request
        const leave = await Leave.create({
            userId: req.user._id,
            leaveType,
            startDate,
            endDate,
            totalDays,
            reason
        });

        const populatedLeave = await Leave.findById(leave._id).populate('userId', 'name email department');

        res.status(201).json({
            message: 'Leave application submitted successfully',
            leave: populatedLeave
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my-leaves
// @access  Private (User)
const getMyLeaves = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = { userId: req.user._id };

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // Filter by date range if provided
        if (startDate && endDate) {
            query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const leaves = await Leave.find(query)
            .populate('reviewedBy', 'name email')
            .sort({ appliedDate: -1 });

        res.json({
            count: leaves.length,
            leaves
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel pending leave
// @route   PUT /api/leaves/:id/cancel
// @access  Private (User)
const cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Check if leave belongs to user
        if (leave.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this leave' });
        }

        // Can only cancel pending leaves
        if (leave.status !== 'pending') {
            return res.status(400).json({ message: `Cannot cancel ${leave.status} leave` });
        }

        leave.status = 'cancelled';
        await leave.save();

        res.json({
            message: 'Leave cancelled successfully',
            leave
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leave balance
// @route   GET /api/leaves/balance
// @access  Private (User)
const getLeaveBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            leaveBalance: user.leaveBalance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============== ADMIN FUNCTIONS ==============

// @desc    Get all leaves with filters
// @route   GET /api/leaves/all
// @access  Private (Admin)
const getAllLeaves = async (req, res) => {
    try {
        const { status, leaveType, userId, startDate, endDate, page = 1, limit = 10 } = req.query;

        let query = {};

        // Apply filters
        if (status) query.status = status;
        if (leaveType) query.leaveType = leaveType;
        if (userId) query.userId = userId;

        if (startDate && endDate) {
            query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Pagination
        const skip = (page - 1) * limit;

        const leaves = await Leave.find(query)
            .populate('userId', 'name email department')
            .populate('reviewedBy', 'name email')
            .sort({ appliedDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Leave.countDocuments(query);

        res.json({
            leaves,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalLeaves: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const { sendLeaveStatusEmail } = require('../utils/emailUtils');

// @desc    Update leave status (approve/reject)
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use "approved" or "rejected"' });
        }

        const leave = await Leave.findById(req.params.id).populate('userId', 'name email department');

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Can only approve/reject pending leaves
        if (leave.status !== 'pending') {
            return res.status(400).json({ message: `Cannot update ${leave.status} leave` });
        }

        // Update leave balance if approved
        if (status === 'approved') {
            const user = await User.findById(leave.userId);
            user.leaveBalance[leave.leaveType] -= leave.totalDays;
            await user.save();
        }

        leave.status = status;
        leave.adminComment = adminComment;
        leave.reviewedDate = Date.now();
        leave.reviewedBy = req.user._id;

        await leave.save();

        // Create audit log
        await AuditLog.create({
            action: status,
            adminId: req.user._id,
            employeeId: leave.userId,
            leaveId: leave._id,
            details: `Leave ${status} by admin. Comment: ${adminComment || 'None'}`
        });

        // Send email notification
        await sendLeaveStatusEmail(leave.userId, leave);

        const updatedLeave = await Leave.findById(leave._id)
            .populate('userId', 'name email department')
            .populate('reviewedBy', 'name email');

        res.json({
            message: `Leave ${status} successfully`,
            leave: updatedLeave
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/statistics
// @access  Private (Admin)
const getLeaveStatistics = async (req, res) => {
    try {
        const totalLeaves = await Leave.countDocuments();
        const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
        const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
        const rejectedLeaves = await Leave.countDocuments({ status: 'rejected' });

        // Leaves by type
        const sickLeaves = await Leave.countDocuments({ leaveType: 'sick', status: 'approved' });
        const casualLeaves = await Leave.countDocuments({ leaveType: 'casual', status: 'approved' });
        const vacationLeaves = await Leave.countDocuments({ leaveType: 'vacation', status: 'approved' });

        // Recent leaves
        const recentLeaves = await Leave.find()
            .populate('userId', 'name email department')
            .sort({ appliedDate: -1 })
            .limit(5);

        res.json({
            totalLeaves,
            pendingLeaves,
            approvedLeaves,
            rejectedLeaves,
            leavesByType: {
                sick: sickLeaves,
                casual: casualLeaves,
                vacation: vacationLeaves
            },
            recentLeaves
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leaves for a specific user
// @route   GET /api/leaves/user/:userId
// @access  Private (Admin)
const getUserLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ userId: req.params.userId })
            .populate('reviewedBy', 'name email')
            .sort({ appliedDate: -1 });

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                name: user.name,
                email: user.email,
                department: user.department,
                leaveBalance: user.leaveBalance
            },
            leaves
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all audit logs
// @route   GET /api/leaves/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('adminId', 'name email')
            .populate('employeeId', 'name email')
            .populate('leaveId')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    // User functions
    applyLeave,
    getMyLeaves,
    cancelLeave,
    getLeaveBalance,
    // Admin functions
    getAllLeaves,
    updateLeaveStatus,
    getLeaveStatistics,
    getUserLeaves,
    getAuditLogs
};
