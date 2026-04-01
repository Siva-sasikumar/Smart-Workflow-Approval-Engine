const axios = require('axios');

async function testRegister() {
  try {
    const res = await axios.post('https://smart-workflow-approval-engine.onrender.com/api/auth/register', {
      name: 'System Test User',
      email: 'sys_test@example.com',
      password: 'testpassword123',
      role: 'student',
      department: 'Computer Science'
    });
    console.log('Registration Successful! JWT Token:', res.data.token);
  } catch (error) {
    if (error.response) {
      console.error('Registration Failed. Server replied:', error.response.status, error.response.data);
    } else {
      console.error('Error connecting to server:', error.message);
    }
  }
}

testRegister();
