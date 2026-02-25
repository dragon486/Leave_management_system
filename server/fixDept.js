const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://adelmuhammed786:Eshal%40786@cluster0.s9abijq.mongodb.net/?appName=Cluster0')
    .then(async () => {
        console.log('MongoDB Connected');

        // Find any user with department exactly matching 'Eng' (case insensitive)
        const result = await User.updateMany(
            { department: { $regex: /^eng$/i } },
            { $set: { department: 'Psychology' } }
        );

        console.log(`Updated ${result.modifiedCount} user(s) from 'ENG' to 'Psychology'.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
