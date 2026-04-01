const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/internship_approval')
.then(async () => {
  const User = require('./models/User');
  const faculty = await User.findOne({ role: 'faculty' });
  console.log('========== FACULTY INFO ==========');
  console.log('Found:', faculty ? 'YES' : 'NO');
  if (faculty) {
    console.log('Email:', faculty.email);
    console.log('Name:', faculty.name);
    console.log('ID:', faculty._id);
  } else {
    console.log('No faculty user found!');
  }
  console.log('==================================');
  process.exit();
})
.catch(err => {
  console.log('Error:', err.message);
  process.exit();
});