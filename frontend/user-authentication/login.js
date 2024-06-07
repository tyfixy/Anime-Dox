document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector(".login-form");

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const usernameError = document.createElement("div");
    const passwordError = document.createElement("div");
    const formError = document.createElement("div");

    usernameError.className = "error-text";
    passwordError.className = "error-text";
    formError.className = "error-text form-error";

    usernameInput.parentElement.appendChild(usernameError);
    passwordInput.parentElement.appendChild(passwordError);
    loginForm.appendChild(formError);

    async function validateUsername() {
        const username = usernameInput.value.trim();
        if (username === "") {
            usernameError.textContent = "Email ili korisničko ime je obavezno.";
            return false;
        } else {
            usernameError.textContent = "";
            return true;
        }
    }

    function validatePassword() {
        const password = passwordInput.value.trim();
        if (password === "") {
            passwordError.textContent = "Lozinka je obavezna.";
            return false;
        } else {
            passwordError.textContent = "";
            return true;
        }
    }

    usernameInput.addEventListener("input", validateUsername);
    passwordInput.addEventListener("input", validatePassword);

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const isUsernameValid = validateUsername();
        const isPasswordValid = validatePassword();

        if (isUsernameValid && isPasswordValid) {
            const formData = new FormData(loginForm);
            const userData = {
                username: formData.get("username"),
                password: formData.get("password"),
            };

            fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store user data in localStorage
                    localStorage.setItem("user", JSON.stringify({
                        displayName: data.displayName,
                        profilePicture: data.profilePicture
                    }));
                    window.location.href = "./../main/main.html";
                } else {
                    formError.textContent = "Prijava nije uspjela: " + data.message;
                }
            })
            .catch(error => {
                console.error("Greška:", error);
                formError.textContent = "Prijava nije uspjela: Došlo je do greške.";
            });
        } else {
            formError.textContent = "Molimo ispravite greške u formi.";
        }
    });
});
