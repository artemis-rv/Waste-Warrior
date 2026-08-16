

async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  
  // 1. Create a user and log in to get a cookie
  const email = `testresident_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName: 'Test Resident' })
  });

  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const cookie = loginRes.headers.get('set-cookie');
  console.log('Login Status:', loginRes.status, cookie ? 'Cookie received' : 'No cookie');

  // 2. Test Unauthenticated Access
  const unauthRes = await fetch(`${baseUrl}/resident/dashboard`);
  console.log('Unauthenticated Status:', unauthRes.status);

  // 3. Test Authenticated Resident Access (Valid Payload / Request)
  const headers = { 'Cookie': cookie, 'Content-Type': 'application/json' };
  
  const dashboardRes = await fetch(`${baseUrl}/resident/dashboard`, { headers });
  const dashboardData = await dashboardRes.json();
  console.log('Dashboard Status:', dashboardRes.status, 'Stats:', dashboardData.stats);

  // 4. Test Submitting a Report
  const reportRes = await fetch(`${baseUrl}/resident/reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Test Issue',
      description: 'Test Description',
      address_text: '123 Main St',
      location_lat: 10.0,
      location_lng: 20.0
    })
  });
  const reportData = await reportRes.json();
  console.log('Report Status:', reportRes.status, 'Report Title:', reportData.report?.title, 'New Credits:', reportData.totalCredits);

  // 5. Test Invalid Payload
  const invalidRes = await fetch(`${baseUrl}/resident/reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: null // Should potentially fail database constraints
    })
  });
  console.log('Invalid Payload Status:', invalidRes.status);

  // 6. Test Credits Redemption
  const redeemRes = await fetch(`${baseUrl}/resident/credits/redeem`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount: 50 }) // we only have 10 credits from the report!
  });
  const redeemData = await redeemRes.json();
  console.log('Redeem Status:', redeemRes.status, 'Message:', redeemData.message);
}

runTests().catch(console.error);
