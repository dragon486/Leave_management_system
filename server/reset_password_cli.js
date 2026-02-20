const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed
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

const resetPassword = async () => {
    await connectDB();

    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
        console.log('\n--- Users Found ---');
        try {
            const users = await User.find({}, 'name email role');
            users.forEach(u => {
                console.log(`- ${u.name} (${u.email}) [${u.role}]`);
            });
        } catch (e) {
            console.error(e);
        }
        console.log('\nUsage: node reset_password_cli.js <email> <new_password>');
        process.exit(0);
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        // Hash password - User model might handle this pre-save, but let's be explicit or rely on save.
        // Looking at User.js, it has a pre-save hook that hashes if modified.
        // So we just set the password and save.
        user.password = newPassword;
        await user.save();

        console.log(`Password for ${email} has been successfully reset.`);
        process.exit(0);
    } catch (err) {
        console.error('Error resetting password:', err);
        process.exit(1);
    }
};

resetPassword();
