function approveRequest(customerID, BookName, requestDate) {
    //alert(BookName);
    let decision = "APPROVED";
    UpdateDecision(customerID, BookName, requestDate, decision);
}

function declineRequest(customerID, BookName, requestDate) {
    let decision = "DECLINED";
    UpdateDecision(customerID, BookName, requestDate, decision);
}

function UpdateDecision(customerID, BookName, requestDate, decision){
        const userRole = localStorage.getItem("userRole");
        const userId = localStorage.getItem("userId");

        const formattedRequestDate = new Date(requestDate).toISOString().split('T')[0];
        const updatedData = {
            role: userRole,
            BookName: BookName,
            CustomerID: customerID,
            AdminID: userId,
            decision: decision,
            requestDate: formattedRequestDate
        };

        requestDecision(updatedData)
            .then(result => {
                console.log("Decision updated successfully", result);
                alert("Decision updated successfully!");
                
                fetchCommunityBooksRequests(userRole);
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
        const url = `${config.booksApi.baseUri}/books/community_book/requests`;
        
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
    fetchCommunityBooksRequests(userRole);
});

/**
 * Fetches reservation data from the API for a given role and customer ID
 * @param {string} role - The user's role (e.g., 'customer')
 * @param {string} customerId - The customer's unique ID
 */
async function fetchCommunityBooksRequests(role) {
    try {
        // Define the API base URL (replace with your actual API endpoint)
        const config = await getConfig();
        const url = `${config.booksApi.baseUri}/books/community_book/requests?role=${encodeURIComponent(role)}`;
        
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
        const books = await response.json();
        displayBooksRequests(books);
    } catch (error) {
        // Log and alert the user about any errors
        console.error('Error fetching Community Books:', error);
        alert("Failed to fetch Community Books requests: " + error.message);
    }
}

/**
 * Populates the HTML table with reservation data
 * @param {Array} commBooks - Array of reservation objects from the API
 */
function displayBooksRequests(commBooks) {
    const CommBooksList = document.getElementById("communityRequestsList"); // Updated ID to match HTML
    CommBooksList.innerHTML = "";

    // If no reservations are found, display a message
    if (commBooks.length === 0) {
        CommBooksList.innerHTML = '<tr><td colspan="9">No Community Book requests found.</td></tr>';
        return;
    }

    // Loop through each reservation and create a table row
    commBooks.forEach(book => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${book.CustomerID || ''}</td>
            <td>${book.PersonName || ''}</td>
            <td>${book.LibraryPoints || ''}</td>
            <td>${book.BookName || ''}</td>
            <td>${book.Genre || ''}</td>
            <td>${book.Author || ''}</td>
            <td>${book.BookDescription || ''}</td>
            <td>${formatDate(book.PublishDate)}</td>
            <td>${formatDate(book.RequestDate)}</td>
            <td>
                <button class="btn btn-sm btn-primary"  onclick="approveRequest(${book.CustomerID}, '${book.BookName.replace(/'/g, "\\'")}', '${book.RequestDate}')">Approve</button>
                <button class="btn btn-sm btn-danger"  onclick="declineRequest(${book.CustomerID}, '${book.BookName.replace(/'/g, "\\'")}', '${book.RequestDate}')">Reject</button>
            </td>
        `;
        CommBooksList.appendChild(row);
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