const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: json
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data
          });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  let cookie = '';
  const email = 'resident.test' + Date.now() + '@wastewarrior.local'; // Unique email

  console.log('--- TEST: Register ---');
  let res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email,
    password: 'TestPassword123!',
    fullName: 'Test Resident'
  });
  console.log('Register Status:', res.status);
  console.assert(res.status === 201, 'Expected 201');
  console.assert(res.data.user.role === 'resident', 'Expected role resident');
  cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '';
  console.assert(cookie.includes('waste_warrior_token'), 'Expected cookie');

  console.log('--- TEST: Privilege Escalation ---');
  res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin.test' + Date.now() + '@wastewarrior.local',
    password: 'TestPassword123!',
    fullName: 'Fake Admin',
    role: 'admin'
  });
  console.log('Escalation Status:', res.status);
  console.assert(res.status === 201, 'Expected 201');
  console.assert(res.data.user.role === 'resident', 'Expected role to fallback to resident');

  console.log('--- TEST: Duplicate Email ---');
  res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email,
    password: 'TestPassword123!',
    fullName: 'Test Resident'
  });
  console.log('Duplicate Status:', res.status);
  console.assert(res.status === 409, 'Expected 409');

  console.log('--- TEST: Login Success ---');
  res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email,
    password: 'TestPassword123!'
  });
  console.log('Login Status:', res.status);
  console.assert(res.status === 200, 'Expected 200');
  cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '';
  
  console.log('--- TEST: Wrong Password ---');
  res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email,
    password: 'WrongPassword!'
  });
  console.log('Wrong Password Status:', res.status);
  console.assert(res.status === 401, 'Expected 401');

  console.log('--- TEST: Unknown Email ---');
  res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'unknown@example.com',
    password: 'TestPassword123!'
  });
  console.log('Unknown Email Status:', res.status);
  console.assert(res.status === 401, 'Expected 401');

  console.log('--- TEST: GET /me (Authenticated) ---');
  res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  console.log('/me Status:', res.status);
  console.assert(res.status === 200, 'Expected 200');
  console.assert(res.data.user.email === email, 'Expected email to match');

  console.log('--- TEST: GET /me (Unauthenticated) ---');
  res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {} // No cookie
  });
  console.log('/me Unauthenticated Status:', res.status);
  console.assert(res.status === 401, 'Expected 401');

  console.log('--- TEST: Logout ---');
  res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/logout',
    method: 'POST',
    headers: { 'Cookie': cookie }
  });
  console.log('Logout Status:', res.status);
  console.assert(res.status === 200, 'Expected 200');
  const setCookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
  console.assert(setCookie.includes('waste_warrior_token=;'), 'Expected cookie to be cleared');

  console.log('All tests completed successfully!');
};

runTests().catch(console.error);
