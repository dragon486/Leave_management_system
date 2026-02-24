const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const resetAdminStatus = async () => {
    await connectDB();

    const email = 'jack@gmail.com';

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.adminRequestStatus = 'none';
        user.adminRequestDate = undefined;
        user.adminRequestReason = undefined;

        await user.save();

        console.log(`Admin request status for ${email} has been reset to 'none'.`);
        console.log(`Cooldown period has been cleared.`);
        process.exit(0);
    } catch (err) {
        console.error('Error resetting admin status:', err);
        process.exit(1);
    }
};

resetAdminStatus();
