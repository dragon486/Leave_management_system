const mongoose = require('mongoose');
const User = require('./models/User');
const Leave = require('./models/leave');

mongoose.connect('mongodb+srv://adelmuhammed786:Eshal%40786@cluster0.s9abijq.mongodb.net/?appName=Cluster0')
    .then(async () => {
        console.log('MongoDB Connected');
        const users = await User.find({}, 'name email department');
        console.log('\n--- USERS ---');
        users.forEach(u => console.log(`User: ${u.name} | Dept: ${u.department}`));

        const leaves = await Leave.find().populate('userId', 'name department');
        console.log('\n--- LEAVES ---');
        leaves.forEach(l => {
            console.log(`Leave ID: ${l._id} | By: ${l.userId?.name} | User Dept: ${l.userId?.department}`);
        });

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
