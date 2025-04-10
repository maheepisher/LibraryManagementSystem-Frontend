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
    fetchReservations(userRole, userID);
});

/**
 * Fetches reservation data from the API for a given role and customer ID
 * @param {string} role - The user's role (e.g., 'customer')
 * @param {string} customerId - The customer's unique ID
 */
async function fetchReservations(role, customerId) {
    try {
        // Define the API base URL (replace with your actual API endpoint)
        const config = await getConfig();
        const url = `${config.reservationAPI.baseUri}/reservation?role=${encodeURIComponent(role)}&customer_id=${encodeURIComponent(customerId)}`;
        
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
        displayReservations(reservations);
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
function displayReservations(reservations) {
    const reservationList = document.getElementById("reservationList");
    reservationList.innerHTML = ""; // Clear any existing rows in the table

    // If no reservations are found, display a message
    if (reservations.length === 0) {
        reservationList.innerHTML = '<tr><td colspan="10">No reservations found.</td></tr>';
        return;
    }

    // Loop through each reservation and create a table row
    reservations.forEach(reservation => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${reservation.ReservationID || ''}</td>
            <td>${reservation.BookName || ''}</td>
            <td>${reservation.Author || ''}</td>
            <td>${reservation.Genre || ''}</td>
            <td>${formatDate(reservation.ReservationDate)}</td>
            <td>${formatDate(reservation.DueDate)}</td>
            <td>${formatDate(reservation.ReturnDate)}</td>
            <td>${reservation.ReservationStatus || ''}</td>
            <td>${reservation.ReturnStatus || ''}</td>
            <td>${reservation.FinePaid !== null ? reservation.FinePaid : ''}</td>
        `;
        reservationList.appendChild(row);
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