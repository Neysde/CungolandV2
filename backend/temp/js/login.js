// Wait for the DOM to load completely
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Get form data
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        // Send login request
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include", // Important for cookies
          body: JSON.stringify({
            username,
            password,
          }),
        });

        // Parse the response as JSON
        const data = await response.json();

        if (response.ok) {
          // Successful login
          console.log("Login successful!");
          window.location.href = data.redirectUrl || "/api/dashboard";
        } else {
          // Failed login
          alert(data.message || "Login failed. Please try again.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again.");
      }
    });
  }

  // Toggle password visibility if the button exists
  const togglePasswordBtn = document.getElementById("togglePassword");
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", function () {
      const passwordInput = document.getElementById("password");
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        this.textContent = "Hide";
      } else {
        passwordInput.type = "password";
        this.textContent = "Show";
      }
    });
  }
});
