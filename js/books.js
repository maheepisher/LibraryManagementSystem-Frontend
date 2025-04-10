const createBookBtn = document.getElementById('createBookBtn');
let confirmActionBtn = document.getElementById('confirmActionBtn');
const addNewBookBtn = document.getElementById('addBookBtn');

const addBookModal = new bootstrap.Modal(document.getElementById('addBookModal'));
let confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));

document.addEventListener("DOMContentLoaded", function() {
    
    let userRole = localStorage.getItem("userRole");
    let userID = localStorage.getItem("userId");
    let customerEmail = localStorage.getItem("userEmail");
    let currentPage = 1;
    const recordsPerPage = 10;
    let allBooks = []; // Store all fetched books for client-side pagination

    if (!userRole) {
        window.location.href = "../index.html";
        return;
    }

    if (userRole === "Admin") {
        document.getElementById("addBookBtn").style.display = "block";
        document.getElementById("bookIdHeader").style.display = "table-cell";
        document.getElementById("bookIdFilter").style.display = "block";
    }

    fetchBooks(currentPage);

    async function fetchBooks(page, filters = {}) {
        try {
            const config = await getConfig();
            let url = new URL(`${config.booksApi.baseUri}/books`);

            // Required parameter
            url.searchParams.append('role', userRole);

            // Optional filter parameters
            if (filters.bookId) url.searchParams.append('book_id', filters.bookId);
            if (filters.bookName) url.searchParams.append('BookName', filters.bookName);
            if (filters.genre) url.searchParams.append('genre', filters.genre);
            if (filters.author) url.searchParams.append('author', filters.author);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (data.Message) throw new Error(data.Message); // Handle API error messages

            allBooks = data; // Store all books (assuming data is an array)

            // Slice the data client-side
            const start = (page - 1) * recordsPerPage;
            const end = start + recordsPerPage;
            const paginatedBooks = allBooks.slice(start, end);

            displayBooks(paginatedBooks, page);
            setupPagination(allBooks.length, page);

        } catch (error) {
            console.error('Error fetching books:', error);
            // Optionally display error to user
        }
    }

    function displayBooks(books, page) {
        const booksList = document.getElementById("booksList");
        booksList.innerHTML = "";
        console.log(books);
        const startIndex = (page - 1) * recordsPerPage + 1;
        books.forEach((book, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${startIndex + index}</td>
                ${userRole === 'Admin' ? `<td>${book.BookID}</td>` : ''}
                <td>${book.BookName}</td>
                <td>${book.Genre}</td>
                <td>${book.Author}</td>
                <td>${book.PublishDate}</td>
                <td>${book.BookDescription}</td>
                <td>
                    ${userRole === 'Customer' ? 
                        `<button class="btn btn-primary" onclick="reserveBook(${book.BookID}, '${book.BookName.replace(/'/g, "\\'")}')">Reserve Book</button>` :
                        `<button class="btn btn-danger" onclick="deleteBook(${book.BookID})">Delete Book</button>`
                    }
                </td>
            `;
            booksList.appendChild(row);
        });
    }

    function setupPagination(totalCount, currentPage) {
        const totalPages = Math.ceil(totalCount / recordsPerPage);
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";

        pagination.innerHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        }

        pagination.innerHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
            </li>
        `;
    }

    window.changePage = function(page) {
        currentPage = page;
        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const paginatedBooks = allBooks.slice(start, end);
        displayBooks(paginatedBooks, page);
        setupPagination(allBooks.length, page);
    };

    window.applyFilters = function() {
        currentPage = 1;
        const filters = getCurrentFilters();
        fetchBooks(currentPage, filters);
    };

    function getCurrentFilters() {
        console.log(userRole);
        return {            
            bookId: userRole === 'Admin' ? document.getElementById("filterBookId").value : undefined,
            bookName: document.getElementById("filterBookName").value,
            genre: document.getElementById("filterGenre").value,
            author: document.getElementById("filterAuthor").value
        };
    }

    // window.addBook = function() {
    //     alert("Feature to add a new book coming soon!");
    // };

    // window.reserveBook = async function(bookId) {
    //     const config = await getConfig();
    //     const url = `${config.booksApi.baseUri}/books`;
    //     fetch(`${config.reservationAPI.baseUri}/books/reserve/${bookId}`, { method: 'POST' })
    //         .then(response => response.json())
    //         .then(data => alert("Book reserved successfully!"))
    //         .catch(error => alert("Error reserving book: " + error));
    // };

    window.reserveBook = async function(bookId, bookName) {  // Exposed globally for onclick
        showConfirmation('Reserve Book', `Are you sure you want to reserve the Book ID: ${bookId} - ${bookName} ?`, async () => {
            try {
                const config = await getConfig();
                const url = `${config.reservationAPI.baseUri}/reservation/reserve`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'  // Add this line
                    },
                    body: JSON.stringify({  // Add request body
                      role: userRole,
                      book_id: bookId,
                      book_name: bookName,
                      customer_id: userID,
                      customer_email: customerEmail
                    })
                })
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.Message || `HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                console.log(result);
                alert("Book Reserved!!");
                fetchBooks(currentPage);

            } catch (error) {
                console.error('Error reserving book:', error);
                alert("Failed to reserve book: " + error.message);
            }
        });
    };

    window.deleteBook = async function(bookId) {  // Exposed globally for onclick
        showConfirmation('Delete Book', `Are you sure you want to delete the book with ID: ${bookId}?`, async () => {
            try {
                const config = await getConfig();
                const url = `${config.booksApi.baseUri}/books`;
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'  // Add this line
                    },
                    body: JSON.stringify({  // Add request body
                      role: 'Admin',
                      id: bookId
                    })
                })

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                alert("Book Deleted!!");
                fetchBooks(currentPage);  // Refresh book list
            } catch (error) {
                console.error('Error deleting book:', error);
                alert("Failed to delete book: " + error.message);
            }
        });
    };

    async function createBook() {
        const newBook = {
            role: "Admin",
            BookName: document.getElementById("newBookName").value,
            Author: document.getElementById("newBookAuthor").value,
            Genre: document.getElementById("newBookGenre").value,
            PublishDate: document.getElementById("newBookPublishDate").value,
            BookDescription: document.getElementById("newBookDescription").value,
            isCommunityBook: false
        };

        try {
            const config = await getConfig();
            const response = await fetch(`${config.booksApi.baseUri}/books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBook)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            alert("Book added successfully!");
            bootstrap.Modal.getInstance(document.getElementById("addBookModal")).hide();
            fetchBooks(currentPage);  // Refresh book list
        } catch (error) {
            console.error('Error adding book:', error);
            alert("Failed to add book: " + error.message);
        }
    }

    addNewBookBtn.addEventListener('click', function() {
        addBookModal.show();
    });

    createBookBtn.addEventListener('click', function() {
        if (validateNewBookForm()) {
            showConfirmation('Add Book', 'Are you sure you want to add this new book?', createBook);
        }
    });


});

// function showConfirmation(title, message, confirmAction) {
//     document.getElementById('confirmationTitle').textContent = title;
//     document.getElementById('confirmationMessage').textContent = message;
    
//     // Remove previous event listeners
//     const newConfirmBtn = confirmActionBtn.cloneNode(true);
//     confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);
    
//     // Add new event listener
//     newConfirmBtn.addEventListener('click', function() {
//         confirmAction();
//         confirmationModal.hide();
//     });
    
//     confirmationModal.show();
// }
function showConfirmation(title, message, confirmAction) {
    document.getElementById('confirmationTitle').textContent = title;
    document.getElementById('confirmationMessage').textContent = message;
    
    // Remove previous event listeners by cloning
    const newConfirmBtn = confirmActionBtn.cloneNode(true);
    confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);
    
    // Update the global reference to the new button
    confirmActionBtn = newConfirmBtn;
    
    // Add new event listener
    confirmActionBtn.addEventListener('click', function() {
        confirmAction();
        confirmationModal.hide();
    });
    
    confirmationModal.show();
}

function validateNewBookForm() {
    const form = document.getElementById('newBookForm');
    
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