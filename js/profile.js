document.addEventListener("DOMContentLoaded", function () {
    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    // Changed this selector to match your new HTML structure
    const formControls = document.querySelectorAll(".profile-form .form-control");

    let userRole = localStorage.getItem("userRole");
    let userId = localStorage.getItem("userId");

    getUserDetails(userId, userRole)
    .then(userData => {
        displayUserInfo(userData[0]);
    })
    .catch(error => {
        console.error('Failed to get user data:', error);
    });
    
    // Enable editing on button click
    editBtn.addEventListener("click", function () {
        // Removed the alert that was just for debugging
        formControls.forEach(input => {
            // Keep ID and points readonly
            if (input.id !== "userId" && input.id !== "points" && input.id !== "role") {
                input.removeAttribute("readonly");
                input.style.backgroundColor = "#fff";
            }
        });
        saveBtn.removeAttribute("disabled");
    });

    // Save changes - Updated to call the PUT API
    document.querySelector(".profile-form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent actual form submission

        const userRole = localStorage.getItem("userRole");
        const userId = localStorage.getItem("userId");

        const updatedData = {
            role: userRole,
            id: userId,
            name: document.getElementById("name").value,
            dob: document.getElementById("dob").value,
            address: document.getElementById("address").value,
            email: document.getElementById("email").value,
            phone_no: document.getElementById("phone").value // Note: using phone_no to match API requirements
        };

        console.log("Updated Profile Data:", updatedData);

        // Call the API to update user data
        updateUserDetails(updatedData)
            .then(result => {
                console.log("Profile updated successfully", result);
                alert("Profile updated successfully!");
                
                // Disable editing after save
                formControls.forEach(input => {
                    input.setAttribute("readonly", true);
                    input.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
                });
                saveBtn.setAttribute("disabled", true);
                saveBtn.style.opacity = "0.7"; // Reset the opacity to make it look disabled again
            })
            .catch(error => {
                console.error("Error updating profile:", error);
                alert("Failed to update profile. Please try again.");
            });
    });

});

// Function to call the user update API
async function updateUserDetails(userData) {
    try {
        // Get config to use baseUri
        const config = await getConfig();
        
        // Construct the URL for PUT request
        const url = `${config.usersApi.baseUri}/user`;
        
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
        console.error('Error updating user details:', error);
        throw error;
    }
}

// Function to call the user API
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
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
}

function displayUserInfo(userData) {
    // Check if userData exists and has properties
    if (userData) {
      // Populate fields with stored user data
      document.getElementById("userId").value = localStorage.getItem("userId");
      document.getElementById("name").value = userData.Name;
      document.getElementById("role").value = localStorage.getItem("userRole");
      document.getElementById("dob").value = userData.DOB;
      document.getElementById("address").value = userData.Address;
      document.getElementById("email").value = userData.Email;
      document.getElementById("phone").value = userData.PhoneNo;
      document.getElementById("points").value = userData.LibraryPoints;
    }
}