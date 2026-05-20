const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
let token = '';

// Helper function untuk print hasil
function printResult(title, data) {
  console.log('\n' + '='.repeat(50));
  console.log(title);
  console.log('='.repeat(50));
  console.log(JSON.stringify(data, null, 2));
}

async function testAPI() {
  try {
    // 1. Test Login
    console.log('\n🔐 Testing Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    token = loginRes.data.accessToken;
    printResult('✓ Login Success', loginRes.data);

    // Setup axios dengan token
    const api = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Test Get All Spareparts
    console.log('\n📦 Testing Get All Spareparts...');
    const sparepartsRes = await api.get('/spareparts');
    printResult('✓ Get All Spareparts', {
      count: sparepartsRes.data.length,
      data: sparepartsRes.data.slice(0, 2) // Show first 2 items
    });

    // 3. Test Get All Suppliers
    console.log('\n🏢 Testing Get All Suppliers...');
    const suppliersRes = await api.get('/suppliers');
    printResult('✓ Get All Suppliers', {
      count: suppliersRes.data.length,
      data: suppliersRes.data.slice(0, 2)
    });

    // 4. Test Get All Customers
    console.log('\n👥 Testing Get All Customers...');
    const customersRes = await api.get('/customers');
    printResult('✓ Get All Customers', {
      count: customersRes.data.length,
      data: customersRes.data
    });

    // 5. Test Get All Employees
    console.log('\n👷 Testing Get All Employees...');
    const employeesRes = await api.get('/employees');
    printResult('✓ Get All Employees', {
      count: employeesRes.data.length,
      data: employeesRes.data
    });

    // 6. Test Create Sparepart
    console.log('\n➕ Testing Create Sparepart...');
    const newSparepart = {
      code: 'SP-TEST-001',
      name: 'Test Sparepart',
      supplier_id: 1,
      buy_price: 50000,
      sell_price: 75000,
      stock: 10
    };
    const createRes = await api.post('/spareparts', newSparepart);
    printResult('✓ Create Sparepart', createRes.data);
    const createdId = createRes.data.data.id;

    // 7. Test Get Sparepart by ID
    console.log('\n🔍 Testing Get Sparepart by ID...');
    const getByIdRes = await api.get(`/spareparts/${createdId}`);
    printResult('✓ Get Sparepart by ID', getByIdRes.data);

    // 8. Test Update Sparepart
    console.log('\n✏️ Testing Update Sparepart...');
    const updateData = {
      name: 'Test Sparepart Updated',
      stock: 15
    };
    const updateRes = await api.put(`/spareparts/${createdId}`, updateData);
    printResult('✓ Update Sparepart', updateRes.data);

    // 9. Test Delete Sparepart
    console.log('\n🗑️ Testing Delete Sparepart...');
    const deleteRes = await api.delete(`/spareparts/${createdId}`);
    printResult('✓ Delete Sparepart', deleteRes.data);

    // 10. Test Error - Get Deleted Item
    console.log('\n❌ Testing Get Deleted Item (should fail)...');
    try {
      await api.get(`/spareparts/${createdId}`);
    } catch (err) {
      printResult('✓ Expected Error', {
        status: err.response.status,
        message: err.response.data.message
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('\n✨ CRUD API is working perfectly!\n');

  } catch (err) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:8080');
    return true;
  } catch (err) {
    return false;
  }
}

// Main
(async () => {
  console.log('🚀 Starting API Tests...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server is not running!');
    console.error('Please start the server first: npm run dev');
    process.exit(1);
  }

  await testAPI();
})();
