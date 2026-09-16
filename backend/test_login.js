const axios = require('axios');
axios.post('http://localhost:8072/api/auth/login', {
  email: 'admin@stockflow.com',
  password: 'Admin@123'
}).then(res => console.log('SUCCESS:', res.data)).catch(err => console.log('ERROR:', err.response?.data));
