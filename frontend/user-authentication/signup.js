import { validateEmail, validateUsername, validatePassword, validateConfirmPassword } from './validation-rules.js';

document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.querySelector(".signup-form");

    const emailInput = document.getElementById("email");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    const emailError = document.getElementById("email-error");
    const usernameError = document.getElementById("username-error");
    const passwordError = document.getElementById("password-error");
    const confirmPasswordError = document.getElementById("confirm-password-error");
    const formError = document.querySelector(".form-error");

    let emailTouched = false;
    let usernameTouched = false;
    let passwordTouched = false;
    let confirmPasswordTouched = false;
    let formSubmitted = false;

    async function checkAvailability(field, value) {
        const response = await fetch("http://localhost:3000/check-availability", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ [field]: value })
        });
        return response.json();
    }

    emailInput.addEventListener("input", async () => {
        emailTouched = true;
        if (emailInput.value.trim() === "") {
            emailError.textContent = "";
        } else {
            const { isValid, message } = await validateEmail(emailInput.value.trim(), checkAvailability);
            emailError.textContent = message;
        }
        checkFormErrors();
    });

    usernameInput.addEventListener("input", async () => {
        usernameTouched = true;
        if (usernameInput.value.trim() === "") {
            usernameError.textContent = "";
        } else {
            const { isValid, message } = await validateUsername(usernameInput.value.trim(), checkAvailability);
            usernameError.textContent = message;
        }
        checkFormErrors();
    });

    passwordInput.addEventListener("input", () => {
        passwordTouched = true;
        if (passwordInput.value.trim() === "") {
            passwordError.textContent = "";
        } else {
            const { isValid, message } = validatePassword(passwordInput.value.trim());
            passwordError.textContent = message;
        }
        checkFormErrors();
    });

    confirmPasswordInput.addEventListener("input", () => {
        confirmPasswordTouched = true;
        if (confirmPasswordInput.value.trim() === "") {
            confirmPasswordError.textContent = "";
        } else {
            const { isValid, message } = validateConfirmPassword(passwordInput.value.trim(), confirmPasswordInput.value.trim());
            confirmPasswordError.textContent = message;
        }
        checkFormErrors();
    });

    function checkFormErrors() {
        if (
            emailError.textContent === "" &&
            usernameError.textContent === "" &&
            passwordError.textContent === "" &&
            confirmPasswordError.textContent === ""
        ) {
            formError.textContent = "";
        }
    }

    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        formSubmitted = true;

        const { isValid: isEmailValid } = await validateEmail(emailInput.value.trim(), checkAvailability);
        const { isValid: isUsernameValid } = await validateUsername(usernameInput.value.trim(), checkAvailability);
        const { isValid: isPasswordValid } = validatePassword(passwordInput.value.trim());
        const { isValid: isConfirmPasswordValid } = validateConfirmPassword(passwordInput.value.trim(), confirmPasswordInput.value.trim());

        if (isEmailValid && isUsernameValid && isPasswordValid && isConfirmPasswordValid) {
            const formData = new FormData(signupForm);
            const userData = {
                email: formData.get("email"),
                username: formData.get("username"),
                displayname: formData.get("username"), // Set display name to username if not provided
                password: formData.get("password"),
                confirmPassword: formData.get("confirm-password")
            };

            fetch("http://localhost:3000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Registracija uspješna!");
                    window.location.href = "./login.html";
                } else {
                    formError.textContent = "Registracija nije uspjela: " + data.message;
                }
            })
            .catch(error => {
                console.error("Greška:", error);
                formError.textContent = "Registracija nije uspjela: Došlo je do greške.";
            });
        } else {
            formError.textContent = "Molimo ispravite greške u formi.";
        }
    });
});
