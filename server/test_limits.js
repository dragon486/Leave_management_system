const mongoose = require('mongoose');
const User = require('./models/User');
const Leave = require('./models/leave');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    if (users.length === 0) return process.exit(0);

    const user = users[0];
    console.log("User:", user.email);
    console.log("Leave balance:", user.leaveBalance);

    const pendingLeaves = await Leave.find({ userId: user._id, status: 'pending' });
    console.log("All pending leaves:", pendingLeaves.map(l => ({ type: l.leaveType, days: l.totalDays })));

    ['sick', 'casual', 'vacation'].forEach(type => {
        const typeLeaves = pendingLeaves.filter(l => l.leaveType === type);
        const sum = typeLeaves.reduce((s, l) => s + l.totalDays, 0);
        console.log(`${type} pending sum:`, sum);
        const valid = user.leaveBalance[type] - sum;
        console.log(`Valid remaining for ${type}:`, valid);
    });

    process.exit(0);
});
