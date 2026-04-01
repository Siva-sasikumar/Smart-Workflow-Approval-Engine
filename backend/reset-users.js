const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-workflow')
  .then(() => console.log('MongoDB connected'));

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String
});

const User = mongoose.model('User', UserSchema);

async function createUsers() {
  try {
    await User.deleteMany({});
    console.log('Users cleared');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const student = new User({
      name: 'Student User',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'student',
      department: 'Computer Science'
    });
    
    const faculty = new User({
      name: 'Faculty User',
      email: 'faculty@example.com',
      password: hashedPassword,
      role: 'faculty',
      department: 'Computer Science'
    });
    
    const hod = new User({
      name: 'HOD User',
      email: 'hod@example.com',
      password: hashedPassword,
      role: 'hod',
      department: 'Computer Science'
    });
    
    await student.save();
    await faculty.save();
    await hod.save();
    
    console.log('✅ Users created successfully!');
    console.log('student@example.com / 123456');
    console.log('faculty@example.com / 123456');
    console.log('hod@example.com / 123456');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

createUsers();