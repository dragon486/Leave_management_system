const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['sick', 'casual', 'vacation'],
        required: [true, 'Please specify leave type']
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide end date']
    },
    totalDays: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for leave'],
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    adminComment: {
        type: String,
        maxlength: 500
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    reviewedDate: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
leaveSchema.index({ userId: 1, status: 1 });
leaveSchema.index({ status: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
