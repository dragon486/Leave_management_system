const cron = require('node-cron');
const User = require('../models/User');

/**
 * Initialize all cron jobs
 */
const initCronJobs = () => {
    // Schedule a task to run on the 1st of every month at midnight (00:00)
    // Format: 'minute hour day-of-month month day-of-week'
    cron.schedule('0 0 1 * *', async () => {
        console.log('--- RUNNING MONTHLY LEAVE BALANCE RESET ---');
        try {
            // Reset all users' leave balances to default values
            // Default values according to User.js: sick: 10, casual: 12, vacation: 15
            const result = await User.updateMany(
                {},
                {
                    $set: {
                        'leaveBalance.sick': 10,
                        'leaveBalance.casual': 12,
                        'leaveBalance.vacation': 15
                    }
                }
            );
            console.log(`Successfully reset balances for ${result.modifiedCount} users.`);
        } catch (error) {
            console.error('Error during monthly leave reset:', error);
        }
        console.log('--- RESET COMPLETE ---');
    });

    console.log('Monthly automatic leave reset job initialized.');
};

module.exports = {
    initCronJobs
};
