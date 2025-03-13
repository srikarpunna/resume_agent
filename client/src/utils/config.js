// Development configuration
const config = {
  // Set to true to use mock data instead of real API calls
  useMockApi: false,
  
  // Other configuration options can be added here
  apiBaseUrl: '/api',
  
  // Delay times (in ms) for mock API responses to simulate real-world conditions
  mockDelays: {
    short: 300,
    medium: 800,
    long: 1500
  }
};

export default config; 