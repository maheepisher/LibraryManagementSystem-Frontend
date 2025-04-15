// config.js - Create this as a separate file

// const appConfig = {
//   baseUri: 'http://127.0.0.1:5000/api',
//   timeout: 5000,
//   version: '1.0.0'

// };
const apiUrl = 'http://Capsto-LoadB-yZ3KStbkYQBN-1082039706.us-east-1.elb.amazonaws.com';

const devappConfig = {
  booksApi: {
    baseUri: 'http://127.0.0.1:5001/api',  // Books API on port 5001
    timeout: 5000,
    version: '1.0.0'
  },
  usersApi: {
    baseUri: 'http://127.0.0.1:5002/api',  // Users API on port 5000
    timeout: 5000,
    version: '1.0.0'
  },
  reservationAPI: {
    baseUri: 'http://127.0.0.1:5000/api',  // Users API on port 5000
    timeout: 5000,
    version: '1.0.0'
  },
  testAPI: {
    baseUri: 'http://capsto-loadb-mn6lp6ook0ns-1698011140.us-east-1.elb.amazonaws.com/api',  // Users API on port 5000
    timeout: 5000,
    version: '1.0.0'
  }
}; 

const appConfig = {
  
  booksApi: {
    baseUri: `${apiUrl}/api`,  // Books API on port 5001
    timeout: 5000,
    version: '1.0.0'
  },
  usersApi: {
    baseUri: `${apiUrl}/api`,  // Users API on port 5000
    timeout: 5000,
    version: '1.0.0'
  },
  reservationAPI: {
    baseUri: `${apiUrl}/api`,  // Users API on port 5000
    timeout: 5000,
    version: '1.0.0'
  }
}; 


// Function to get the config
async function getConfig() {
  // In a more complex app, you might load this from a JSON file
  //return appConfig;
  return appConfig;
}