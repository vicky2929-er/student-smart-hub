require('dotenv').config();
const axios = require('axios');

async function testLoginAPI() {
  try {
    console.log('Testing Login API...\n');
    
    const credentials = {
      email: 'aarav.patel@student.iitd.ac.in',
      password: 'Student@123'
    };

    console.log('Sending request to: http://localhost:3030/api/auth/login');
    console.log('Credentials:', credentials);
    console.log('');

    const response = await axios.post('http://localhost:3030/api/auth/login', credentials);
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    console.log('User:', response.data.user);
    console.log('Redirect URL:', response.data.redirectUrl);
    
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLoginAPI();
