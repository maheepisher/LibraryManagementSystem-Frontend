function loadPage(page) {
    document.getElementById("contentArea").innerHTML = `<iframe src="${page}" style="width:100%; height:100vh; border:none;"></iframe>`;
}

function logout() {
    localStorage.clear();
    window.location.href = "../index.html";
}


document.addEventListener("DOMContentLoaded", function() {
    let userRole = localStorage.getItem("userRole");
    let userId = localStorage.getItem("userId");
    let userEmail = localStorage.getItem("userEmail");

    //alert(`Role: ${userRole}, ID: ${userId}, Email: ${userEmail}`);

    if (!userRole) {
        window.location.href = "../index.html"; // Redirect to login if no role found
    }

    let navItems = document.getElementById("navItems");
    let menu = '';

    if (userRole === "Admin") {
        menu = `
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('customers.html')">Customers</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('books.html')">Books</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('reservation_requests.html')">Reservation Requests</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('community_book_requests.html')">Community Book Requests</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('returns.html')">Manage Returns</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('profile.html')">Profile</a></li>
        `;
    } else {
        menu = `
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('books.html')">Books</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('reservations.html')">My Reservations</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('community_books.html')">My Books</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="loadPage('profile.html')">Profile</a></li>
        `;
    }

    navItems.innerHTML = menu;
});
