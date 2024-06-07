document.addEventListener("DOMContentLoaded", function() {
    function initUserProfile() {
        const userProfile = document.getElementById("user-profile");
        const displayNameElement = document.getElementById("display-name");
        const profilePictureElement = document.getElementById("profile-picture");
        const loginButton = document.getElementById("login-button");
        const dropdownMenu = document.getElementById("dropdown-menu");
        const dropdownArrow = document.querySelector(".dropdown-arrow");
        const profileLink = document.getElementById("profile-link");

        // Check if the user is logged in
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            // Display user profile
            displayNameElement.textContent = user.displayName;
            profilePictureElement.src = `data:image/png;base64,${user.profilePicture}`;
            userProfile.style.display = "flex";
            loginButton.style.display = "none";

            // Toggle dropdown menu
            userProfile.addEventListener("click", function() {
                dropdownMenu.classList.toggle("show");
                if (dropdownMenu.classList.contains("show")) {
                    dropdownArrow.classList.add("up");
                } else {
                    dropdownArrow.classList.remove("up");
                }
            });

            // Handle profile link click
            profileLink.addEventListener("click", function(event) {
                event.preventDefault();
                window.location.href = "../settings/settings.html";
            });

            // Handle logout
            document.getElementById("logout").addEventListener("click", function(event) {
                event.preventDefault();
                localStorage.removeItem("user");
                window.location.href = "./main.html"; // Adjusted to relative path
            });
        } else {
            console.log('User not logged in');
        }
    }

    initUserProfile();
});
