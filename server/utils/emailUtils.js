const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send leave status update email
 * @param {Object} user User object (name, email)
 * @param {Object} leave Leave object (type, startDate, endDate, status, adminComment)
 */
const sendLeaveStatusEmail = async (user, leave) => {
    // If no credentials, log to console and return (prevent crash)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email credentials not provided. Status update logged to console:');
        console.log(`To: ${user.email}`);
        console.log(`Subject: Leave Request ${leave.status.toUpperCase()}`);
        console.log(`Message: Dear ${user.name}, your ${leave.leaveType} leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been ${leave.status}.`);
        if (leave.adminComment) console.log(`Reason: ${leave.adminComment}`);
        return;
    }

    try {
        const mailOptions = {
            from: `"Leave Management System" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Leave Request ${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: ${leave.status === 'approved' ? '#10b981' : '#ef4444'}; text-align: center;">Leave Request ${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</h2>
                    <p>Dear <strong>${user.name}</strong>,</p>
                    <p>Your <strong>${leave.leaveType}</strong> leave request has been reviewed.</p>
                    
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Start Date:</strong> ${new Date(leave.startDate).toLocaleDateString()}</p>
                        <p style="margin: 5px 0;"><strong>End Date:</strong> ${new Date(leave.endDate).toLocaleDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="text-transform: capitalize; color: ${leave.status === 'approved' ? '#10b981' : '#ef4444'};">${leave.status}</span></p>
                    </div>

                    ${leave.adminComment ? `
                    <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
                        <p><strong>Admin Comment:</strong></p>
                        <p style="font-style: italic; color: #4b5563;">"${leave.adminComment}"</p>
                    </div>
                    ` : ''}

                    <p style="margin-top: 30px; font-size: 0.875rem; color: #6b7280; text-align: center;">
                        This is an automated notification. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = {
    sendLeaveStatusEmail
};
