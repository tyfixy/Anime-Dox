document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("logout").addEventListener("click", function() {
        localStorage.removeItem("user");
        window.location.reload();
    });
});
