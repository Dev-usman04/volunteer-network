const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const timestamp = Date.now();
const testVolunteer = {
  name: 'John Doe',
  email: `john${timestamp}@example.com`,
  password: 'password123',
  role: 'volunteer',
  location: 'New York, NY',
  bio: 'Passionate volunteer looking to help the community'
};

const testOrganization = {
  name: 'Community Help Center',
  email: `help${timestamp}@community.org`,
  password: 'password123',
  role: 'organization',
  location: 'New York, NY',
  bio: 'Non-profit organization dedicated to community service'
};

const testOpportunity = {
  title: 'Help at Local Food Bank',
  description: 'We need volunteers to help sort and distribute food to families in need.',
  location: 'New York, NY',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  category: 'community',
  duration: '3-5 hours',
  maxVolunteers: 10
};

async function testAPI() {
  console.log('🚀 Testing Volunteer Network API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);

    // Test volunteer registration
    console.log('\n2. Testing volunteer registration...');
    const volunteerRegResponse = await axios.post(`${BASE_URL}/auth/register`, testVolunteer);
    console.log('✅ Volunteer registered:', volunteerRegResponse.data.user.name);
    const volunteerToken = volunteerRegResponse.data.token;

    // Test organization registration
    console.log('\n3. Testing organization registration...');
    const orgRegResponse = await axios.post(`${BASE_URL}/auth/register`, testOrganization);
    console.log('✅ Organization registered:', orgRegResponse.data.user.name);
    const orgToken = orgRegResponse.data.token;

    // Test login
    console.log('\n4. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testVolunteer.email,
      password: testVolunteer.password
    });
    console.log('✅ Login successful:', loginResponse.data.user.name);

    // Test creating opportunity (organization)
    console.log('\n5. Testing opportunity creation...');
    const opportunityResponse = await axios.post(`${BASE_URL}/opportunities`, testOpportunity, {
      headers: { Authorization: `Bearer ${orgToken}` }
    });
    console.log('✅ Opportunity created:', opportunityResponse.data.opportunity.title);
    const opportunityId = opportunityResponse.data.opportunity._id;

    // Test getting opportunities (public)
    console.log('\n6. Testing get opportunities...');
    const opportunitiesResponse = await axios.get(`${BASE_URL}/opportunities`);
    console.log('✅ Opportunities retrieved:', opportunitiesResponse.data.opportunities.length, 'opportunities');

    // Test applying to opportunity (volunteer)
    console.log('\n7. Testing application submission...');
    const applicationResponse = await axios.post(`${BASE_URL}/opportunities/${opportunityId}/apply`, {
      message: 'I would love to help with this opportunity!'
    }, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    console.log('✅ Application submitted successfully');

    // Test getting volunteer's applications
    console.log('\n8. Testing get volunteer applications...');
    const volunteerAppsResponse = await axios.get(`${BASE_URL}/applications/my`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    console.log('✅ Volunteer applications retrieved:', volunteerAppsResponse.data.applications.length, 'applications');

    // Test getting organization's opportunities
    console.log('\n9. Testing get organization opportunities...');
    const orgOppsResponse = await axios.get(`${BASE_URL}/opportunities/my/list`, {
      headers: { Authorization: `Bearer ${orgToken}` }
    });
    console.log('✅ Organization opportunities retrieved:', orgOppsResponse.data.opportunities.length, 'opportunities');

    // Test getting applications for an opportunity (organization)
    console.log('\n10. Testing get opportunity applications...');
    const oppAppsResponse = await axios.get(`${BASE_URL}/applications/opportunity/${opportunityId}`, {
      headers: { Authorization: `Bearer ${orgToken}` }
    });
    console.log('✅ Opportunity applications retrieved:', oppAppsResponse.data.applications.length, 'applications');

    console.log('\n🎉 All tests passed! The API is working correctly.');
    console.log('\n📋 Available endpoints:');
    console.log('- POST /api/auth/register - Register user');
    console.log('- POST /api/auth/login - Login user');
    console.log('- GET /api/opportunities - Get all opportunities');
    console.log('- POST /api/opportunities - Create opportunity (org only)');
    console.log('- POST /api/opportunities/:id/apply - Apply to opportunity (volunteer only)');
    console.log('- GET /api/applications/my - Get volunteer applications');
    console.log('- GET /api/applications/opportunity/:id - Get opportunity applications (org only)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI }; 