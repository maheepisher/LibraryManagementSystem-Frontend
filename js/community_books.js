// Initialize Bootstrap modal
const shareBookModal = new bootstrap.Modal(document.getElementById('shareBookModal'));

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function() {
    const userRole = localStorage.getItem("userRole");
    const userID = localStorage.getItem("userId");

    // Check if user is logged in
    if (!userRole || !userID) {
        alert("User ID or User Role not found. Please log in again.");
        window.location.href = "../index.html";
        return;
    }

    // Fetch and display shared books on page load
    fetchSharedBooks(userRole, userID);
});


/**
 * Fetches shared books data from the API for a given role and customer ID
 * @param {string} role - The user's role (e.g., 'customer')
 * @param {string} customerId - The customer's unique ID
 */
async function fetchSharedBooks(role, customerId) {
    try {
        // Define the API base URL using getConfig()
        const config = await getConfig();
        const url = `${config.booksApi.baseUri}/books/community_book?role=${encodeURIComponent(role)}&customer_id=${encodeURIComponent(customerId)}`;
        
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
        displaySharedBooks(books);
    } catch (error) {
        // Log and alert the user about any errors
        console.error('Error fetching shared books:', error);
        alert("Failed to fetch shared books: " + error.message);
    }
}

/**
 * Populates the HTML table with shared books data
 * @param {Array} books - Array of book objects from the API
 */
function displaySharedBooks(books) {
    const booksList = document.getElementById("booksList");
    booksList.innerHTML = ""; // Clear existing rows

    if (!books || books.length === 0) {
        booksList.innerHTML = '<tr><td colspan="6">No books shared yet.</td></tr>';
        return;
    }

    books.forEach(book => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${book.BookName || ''}</td>
            <td>${book.Genre || ''}</td>
            <td>${book.Author || ''}</td>
            <td>${book.BookDescription || ''}</td>
            <td>${book.SharedOn || ''}</td>
            <td>${book.BookStatus || ''}</td>
        `;
        booksList.appendChild(row);
    });
}

// Function to open the share book modal
function shareBook() {
    // Reset form fields
    document.getElementById("shareBookForm").reset();
    shareBookModal.show();
}

// Handle form submission for sharing a new community book
document.getElementById("submitBookBtn").addEventListener("click", async function() {
    const bookName = document.getElementById("bookName").value.trim();
    const genre = document.getElementById("genre").value.trim();
    const publishDate = document.getElementById("publishDate").value;
    const author = document.getElementById("author").value.trim();
    const bookDescription = document.getElementById("bookDescription").value.trim();
    const customerId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole") || "customer"; // Default to 'customer' if not set

    // Validate form fields
    if (!bookName || !genre || !publishDate || !author || !bookDescription) {
        alert("Please fill in all fields and ensure you are logged in.");
        return;
    }

    const newBook = {
        role: role,
        BookName: bookName,
        Author: author,
        Genre: genre,
        PublishDate: publishDate,
        BookDescription: bookDescription,
        CustomerID: customerId
    };

    try {
        const config = await getConfig(); // Assuming this provides the API base URL
        const url = `${config.booksApi.baseUri}/books/community_book`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newBook)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Message || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.Message || "Book shared successfully!"); // Display the API message
        shareBookModal.hide();
        fetchSharedBooks(role, customerId); // Refresh the table with updated data
    } catch (error) {
        //console.error('Error sharing book:', error);
        alert("Failed to share book: " + error.message);
    }
});
