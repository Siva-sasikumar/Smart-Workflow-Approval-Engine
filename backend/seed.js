const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const users = [
    {
        name: 'Student User',
        email: 'student@test.com',
        password: '123456', // Will be hashed
        role: 'student',
        department: 'CSE'
    },
    {
        name: 'Faculty User',
        email: 'faculty@test.com',
        password: '123456',
        role: 'faculty',
        department: 'CSE'
    },
    {
        name: 'HOD User',
        email: 'hod@test.com',
        password: '123456',
        role: 'hod',
        department: 'CSE'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-workflow');
        console.log('MongoDB connected for seeding...');

        // Clear existing users
        await User.deleteMany({});
        console.log('Users cleared');

        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            await new User(user).save();
        }

        console.log('Seed data imported!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
