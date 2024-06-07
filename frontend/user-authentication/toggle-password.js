function togglePasswordVisibility(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);

    if (passwordInput && eyeIcon) {
        eyeIcon.style.display = 'none'; // Hide the eye icon by default

        passwordInput.addEventListener('input', () => {
            if (passwordInput.value) {
                eyeIcon.style.display = 'block';
            } else {
                eyeIcon.style.display = 'none';
            }
        });

        eyeIcon.addEventListener("mousedown", () => {
            passwordInput.type = "text";
        });

        eyeIcon.addEventListener("mouseup", () => {
            passwordInput.type = "password";
        });

        eyeIcon.addEventListener("mouseout", () => {
            passwordInput.type = "password";
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // For signup.html
    togglePasswordVisibility("password", "eye-icon-password");
    togglePasswordVisibility("confirm-password", "eye-icon-confirm");

    // For login.html
    togglePasswordVisibility("password", "eye-icon");
});
