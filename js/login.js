document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let userId = document.getElementById("userId").value;
    let password = document.getElementById("password").value;
    let userRole = document.getElementById("userRole").value;

    if (!userId || !password || !userRole) {
        alert("Please fill in all fields!");
        return;
    }
    
    //alert(userRole);
    if (userRole === "Customer") {
        getUserDetails(userId, userRole)
        .then(userData => {
        //console.log(userData);
        localStorage.setItem("userEmail", userData[0].Email);
        //let customerEmail = localStorage.getItem("userEmail");
        //alert(customerEmail);
        localStorage.setItem("userRole", userRole);  // Store user role in localStorage
        localStorage.setItem("userId", userId);     // Store user id in localStorage
        window.location.href = "pages/dashboard.html";  // Redirect to dashboard
        })
        .catch(error => {
            console.error('Failed to get user data:', error);
        });
    }
    else{
        localStorage.setItem("userRole", userRole);  // Store user role in localStorage
        localStorage.setItem("userId", userId);     // Store user id in localStorage
        window.location.href = "pages/dashboard.html";  // Redirect to dashboard
    }
    
    // Simulating API call for authentication (Replace with actual API)
    /* fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ userId, password, userRole }),
        headers: { 'Content-Type': 'application/json' }
    }).then(response => response.json()).then(data => { ... }); */

    
});


async function getUserDetails(userId, userRole) {
    try {
      // We'll use baseUri from our config
      const config = await getConfig();
      
      // Construct the URL with query parameters
      const url = `${config.usersApi.baseUri}/user?role=${encodeURIComponent(userRole)}&id=${encodeURIComponent(userId)}`;
      
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
      console.log(`This: ${data}`);
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
}