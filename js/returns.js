// Variable to store the current customer ID for refreshing the table after a return
let currentCustomerId = null;
const userRole = localStorage.getItem("userRole");
const userId = localStorage.getItem("userId");

// Function to fetch and display reservations based on customer ID
async function searchReservations() {
    const customerId = document.getElementById('customerIdInput').value.trim();
    if (!customerId) {
        alert('Please enter a customer ID');
        return;
    }
    currentCustomerId = customerId;

    const config = await getConfig();
    const url = `${config.reservationAPI.baseUri}/reservation/returns?role=${encodeURIComponent(userRole)}&customer_id=${encodeURIComponent(customerId)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch reservations');
            }
            return response.json();
        })
        .then(data => {
            populateTable(data);
        })
        .catch(error => {
            alert(error.message);
        });
}

// Function to populate the table with reservation data
function populateTable(reservations) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Clear existing content

    if (reservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">No reservations found for this customer</td></tr>';
        return;
    }

    reservations.forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation.ReservationID}</td>
            <td>${reservation.CustomerID}</td>
            <td>${reservation.CustomerName}</td>
            <td>${reservation.BookID}</td>
            <td>${reservation.BookName}</td>
            <td>${formatDate(reservation.BorrowedOn)}</td>
            <td>${formatDate(reservation.DueDate)}</td>
            <td><button class="btn btn-sm btn-success" onclick="returnBook(${reservation.ReservationID})">Return</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to format dates from ISO format to MM/DD/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Function to process a book return via API call
async function returnBook(reservationId) {
    const config = await getConfig();
    const url = `${config.reservationAPI.baseUri}/reservation/returns`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: userRole, reservation_id: reservationId, approver_id: userId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to process return');
        }
        return response.json();
    })
    .then(data => {
        alert('Book returned successfully');
        // Refresh the table with updated data for the current customer
        if (currentCustomerId) {
            searchReservations();
        }
    })
    .catch(error => {
        alert(error.message);
    });
}

// Event listeners for search button click and Enter key press
document.getElementById('searchButton').addEventListener('click', searchReservations);
document.getElementById('customerIdInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchReservations();
    }
});