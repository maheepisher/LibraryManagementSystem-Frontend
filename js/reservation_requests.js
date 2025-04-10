function approveRequest(requestID, bookName, email) {
    
    alert(email);
    let decision = "APPROVED";
    UpdateDecision(requestID, decision, bookName, email);
}

function declineRequest(requestID, bookName, email) {
    let decision = "DECLINED";
    UpdateDecision(requestID, decision, bookName, email);
}

function UpdateDecision(requestID, decision, book_Name, customer_email){
        const userRole = localStorage.getItem("userRole");
        const userId = localStorage.getItem("userId");

        const updatedData = {
            role: userRole,
            approver_id: userId,
            decision: decision,
            reservation_id: requestID,
            customer_Email: customer_email,
            book_name: book_Name
        };

        requestDecision(updatedData)
            .then(result => {
                console.log("Decision updated successfully", result);
                alert("Decision updated successfully!");
                
                fetchReservationRequests(userRole);
            })
            .catch(error => {
                console.error("Error updating decision:", error);
                alert("Failed to update decision. Please try again.");
            });
}

async function requestDecision(userData) {
    try {
        // Get config to use baseUri
        const config = await getConfig();
        
        // Construct the URL for PUT request
        const url = `${config.reservationAPI.baseUri}/reservation/requests`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating reservation request decision:', error);
        throw error;
    }
}

// Wait for the DOM to fully load before executing the script
document.addEventListener("DOMContentLoaded", function() {
    // Retrieve user role and ID from local storage
    let userRole = localStorage.getItem("userRole");
    let userID = localStorage.getItem("userId");

    // Check if user is logged in by verifying role and ID
    if (!userRole || !userID) {
        alert("User role or ID not found. Please log in again.");
        window.location.href = "../index.html"; // Redirect to login page
        return;
    }

    // Fetch reservations for the logged-in customer
    fetchReservationRequests(userRole);
});

/**
 * Fetches reservation data from the API for a given role and customer ID
 * @param {string} role - The user's role (e.g., 'customer')
 * @param {string} customerId - The customer's unique ID
 */
async function fetchReservationRequests(role, customerId) {
    try {
        // Define the API base URL (replace with your actual API endpoint)
        const config = await getConfig();
        const url = `${config.reservationAPI.baseUri}/reservation/requests?role=${encodeURIComponent(role)}`;
        
        // Make the GET request to the API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        // Check if the response is successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Message || `HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response and display the data
        const reservations = await response.json();
        displayReservationRequests(reservations);
    } catch (error) {
        // Log and alert the user about any errors
        console.error('Error fetching reservations:', error);
        alert("Failed to fetch reservations: " + error.message);
    }
}

/**
 * Populates the HTML table with reservation data
 * @param {Array} reservations - Array of reservation objects from the API
 */
function displayReservationRequests(reservations) {
    const reservationList = document.getElementById("requestsList"); // Updated ID to match HTML
    reservationList.innerHTML = ""; // Clear any existing rows in the table

    // If no reservations are found, display a message
    if (reservations.length === 0) {
        reservationList.innerHTML = '<tr><td colspan="9">No reservation requests found.</td></tr>';
        return;
    }

    // Loop through each reservation and create a table row
    reservations.forEach(reservation => {
        const row = document.createElement("tr");
        // Escape the JSON string to handle quotes and special characters
        const reservationStr = JSON.stringify(reservation).replace(/"/g, '&quot;');
        row.innerHTML = `
            <td>${reservation.ReservationID || ''}</td>
            <td>${formatDate(reservation.ReservationDate)}</td>
            <td>${reservation.CustomerID || ''}</td>
            <td>${reservation.CustomerName || ''}</td>
            <td>${reservation.BookID || ''}</td>
            <td>${reservation.BookName || ''}</td>
            <td>${reservation.LibraryPoints !== null ? reservation.LibraryPoints : ''}</td>
            <td>${reservation.PendingReturns !== null ? reservation.PendingReturns : ''}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="approveRequest(${reservation.ReservationID}, '${reservation.BookName.replace(/'/g, "\\'")}', '${reservation.CustomerEmail}')">Approve</button>
                <button class="btn btn-sm btn-danger" onclick="declineRequest(${reservation.ReservationID}, '${reservation.BookName.replace(/'/g, "\\'")}', '${reservation.CustomerEmail}')">Reject</button>
            </td>
        `;
        reservationList.appendChild(row);
        // const row = document.createElement("tr");
        // row.innerHTML = `
        //     <td>${reservation.ReservationID || ''}</td>
        //     <td>${formatDate(reservation.ReservationDate)}</td>
        //     <td>${reservation.CustomerID || ''}</td>
        //     <td>${reservation.CustomerName || ''}</td>
        //     <td>${reservation.BookID || ''}</td>
        //     <td>${reservation.BookName || ''}</td>
        //     <td>${reservation.LibraryPoints !== null ? reservation.LibraryPoints : ''}</td>
        //     <td>${reservation.PendingReturns !== null ? reservation.PendingReturns : ''}</td>
        //     <td>
        //         <button class="btn btn-sm btn-primary"  onclick="approveRequest(${JSON.stringify(reservation)})">Approve</button>
        //         <button class="btn btn-sm btn-danger"  onclick="declineRequest(${JSON.stringify(reservation)})">Reject</button>
        //     </td>
        // `;
        // reservationList.appendChild(row);
    });
}

/**
 * Formats a date string into a readable format (e.g., "10/25/2023")
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date or empty string if null
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Returns date in local format
}