// DOM Elements
const searchCustomerId = document.getElementById('searchCustomerId');
const searchBtn = document.getElementById('searchBtn');
const addNewCustomerBtn = document.getElementById('addNewCustomerBtn');
const customerDetailsForm = document.getElementById('customerDetailsForm');
const deleteCustomerBtn = document.getElementById('deleteCustomerBtn');
const createCustomerBtn = document.getElementById('createCustomerBtn');
const confirmActionBtn = document.getElementById('confirmActionBtn');

// Bootstrap Modal Objects
const addCustomerModal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));

// API Endpoints (Replace with your actual API endpoints)
const API_ENDPOINTS = {
    searchCustomer: '/api/customers/',     // GET with customer ID
    deleteCustomer: '/api/customers/',     // DELETE with customer ID
    createCustomer: '/api/customers'       // POST
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Search customer button click
    searchBtn.addEventListener('click', searchCustomer);
    
    // Add new customer button click
    addNewCustomerBtn.addEventListener('click', function() {
        addCustomerModal.show();
    });
    
    // Delete customer button click
    deleteCustomerBtn.addEventListener('click', function() {
        showConfirmation('Delete Customer', 'Are you sure you want to delete this customer? This action cannot be undone.', deleteCustomer);
    });
    
    // Create customer button click
    createCustomerBtn.addEventListener('click', function() {
        if (validateNewCustomerForm()) {
            showConfirmation('Create Customer', 'Are you sure you want to create this new customer?', createCustomer);
        }
    });
});

// Search for a customer by ID
function searchCustomer() {
    const customerId = searchCustomerId.value.trim();
    
    if (!customerId) {
        alert('Please enter a Customer ID');
        return;
    }
    
    // Show loading state (optional)
    searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
    searchBtn.disabled = true;
    
    getUserDetails(customerId)
        .then(userData => {
            console.log(userData);

            displayCustomerDetails(customerId, userData[0]);
            //displayUserInfo(userData[0]);
        })
        .catch(error => {
            console.error('Failed to get user data:', error);
            alert('Customer not found or an error occurred.');
            customerDetailsForm.classList.add('hide');
        })
        .finally(() => {
            // Reset button state
            searchBtn.innerHTML = 'Search';
            searchBtn.disabled = false;
        });;
}

async function getUserDetails(userId) {
    try {
      // We'll use baseUri from our config
      const config = await getConfig();
      
      // Construct the URL with query parameters
      const url = `${config.usersApi.baseUri}/user?role=customer&id=${encodeURIComponent(userId)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
}

// Display customer details in the form
function displayCustomerDetails(ID, customer) {
    // Populate form fields with customer data
    document.getElementById('customerId').value = ID;
    document.getElementById('customerName').value = customer.Name;
    document.getElementById('customerDOB').value = customer.DOB;
    document.getElementById('customerEmail').value = customer.Email;
    document.getElementById('customerPhone').value = customer.PhoneNo;
    document.getElementById('customerAddress').value = customer.Address;
    document.getElementById('customerPoints').value = customer.LibraryPoints;
    document.getElementById('customerStatus').value = customer.Status;
    
    // Show the form
    customerDetailsForm.classList.remove('hide');
}

// Delete customer
async function deleteCustomer() {
    const customerId = document.getElementById('customerId').value;
    
    const config = await getConfig();
      
    // Construct the URL with query parameters
    const url = `${config.usersApi.baseUri}/user`;
      
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'  // Add this line
        },
        body: JSON.stringify({  // Add request body
          role: 'customer',
          id: customerId
        })
    })

    if (!response.ok) {
        throw new Error('Failed to delete customer');
    }
    alert('Customer deleted successfully');
    customerDetailsForm.classList.add('hide');
    searchCustomerId.value = '';
    
}



// Create new customer
async function createCustomer() {
    const config = await getConfig(); // Assuming you have this function as in your DELETE example
    const url = `${config.usersApi.baseUri}/user`;
    
    // Create data object with all required fields
    const newCustomer = {
        role: 'customer', // This field is required by your API but missing in your frontend
        name: document.getElementById('newCustomerName').value,
        dob: document.getElementById('newCustomerDOB').value,
        email: document.getElementById('newCustomerEmail').value,
        phone_no: document.getElementById('newCustomerPhone').value, // Changed from 'phone' to 'phone_no' to match API
        address: document.getElementById('newCustomerAddress').value
    };
   
    fetch(url, { // Using the URL variable instead of API_ENDPOINTS.createCustomer
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(newCustomer)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create customer');
        }
        return response.json();
    })
    .then(data => {
        alert('Customer created successfully');
        addCustomerModal.hide();
        resetNewCustomerForm();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to create customer. Please try again.');
    });
}

// Validate the new customer form
function validateNewCustomerForm() {
    const form = document.getElementById('newCustomerForm');
    
    // Use the browser's built-in validation
    if (!form.checkValidity()) {
        // Trigger browser's validation UI
        const tempSubmit = document.createElement('button');
        form.appendChild(tempSubmit);
        tempSubmit.click();
        form.removeChild(tempSubmit);
        return false;
    }
    
    return true;
}

// Reset the new customer form
function resetNewCustomerForm() {
    document.getElementById('newCustomerForm').reset();
}

// Show confirmation modal
function showConfirmation(title, message, confirmAction) {
    document.getElementById('confirmationTitle').textContent = title;
    document.getElementById('confirmationMessage').textContent = message;
    
    // Remove previous event listeners
    const newConfirmBtn = confirmActionBtn.cloneNode(true);
    confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', function() {
        confirmAction();
        confirmationModal.hide();
    });
    
    confirmationModal.show();
}