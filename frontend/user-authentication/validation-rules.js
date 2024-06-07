// validation-rules.js

export const validateEmail = async (email, checkAvailability) => {
    if (email === "") {
        return { isValid: false, message: "Email je obavezan." };
    }
    const result = await checkAvailability("email", email);
    if (result.emailExists) {
        return { isValid: false, message: "Email već postoji." };
    }
    return { isValid: true, message: "" };
};

export const validateUsername = async (username, checkAvailability) => {
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    const letterRegex = /[a-zA-Z]/g;
    const specialCharRegex = /[._]/g; // Adjust to include any special characters you allow
    const letterCount = (username.match(letterRegex) || []).length;
    const specialCharCount = (username.match(specialCharRegex) || []).length;
    const errors = [];

    if (username.length < 5 || username.length > 12) {
        errors.push("Korisničko ime mora imati 5-12 karaktera.");
    }
    if (!usernameRegex.test(username)) {
        errors.push("Korisničko ime može sadržavati samo slova, brojeve, tačke i donje crte.");
    }
    if (letterCount < 3) {
        errors.push("Korisničko ime mora sadržavati najmanje 3 slova.");
    }
    if (specialCharCount > 2) {
        errors.push("Korisničko ime može sadržavati najviše 2 specijalna znaka.");
    }

    const result = await checkAvailability("username", username);
    if (result.usernameExists) {
        errors.push("Korisničko ime već postoji.");
    }

    return { isValid: errors.length === 0, message: errors.join(" ") };
};

export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z]{5,})(?=.*[0-9])(?=.*[\W_])(?!.*\s).{7,50}$/;
    if (password === "") {
        return { isValid: false, message: "Lozinka je obavezna." };
    }
    if (!passwordRegex.test(password)) {
        return { isValid: false, message: "Lozinka mora imati 7-50 karaktera, najmanje 5 slova, 1 broj, 1 specijalni znak i bez razmaka." };
    }
    return { isValid: true, message: "" };
};

export const validateConfirmPassword = (password, confirmPassword) => {
    if (confirmPassword === "") {
        return { isValid: false, message: "Potvrda lozinke je obavezna." };
    }
    if (confirmPassword !== password) {
        return { isValid: false, message: "Lozinke se ne podudaraju." };
    }
    return { isValid: true, message: "" };
};
