// Wait for the DOM to load completely
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    // Add event listener for form submission
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Create a status message element if it doesn't exist
      let statusMsg = document.getElementById("statusMessage");
      if (!statusMsg) {
        statusMsg = document.createElement("div");
        statusMsg.id = "statusMessage";
        statusMsg.style.marginTop = "10px";
        loginForm.appendChild(statusMsg);
      }

      // Display loading message
      statusMsg.textContent = "Logging in...";
      statusMsg.style.color = "#666";

      // Get form data
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      // Create FormData object for traditional form submission
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      // Use XMLHttpRequest for more control
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/login", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          try {
            // Try to parse JSON response
            const response = JSON.parse(xhr.responseText);

            if (xhr.status === 200) {
              // Login successful
              statusMsg.textContent = "Login successful! Redirecting...";
              statusMsg.style.color = "green";

              // Redirect to dashboard
              setTimeout(function () {
                window.location.href = response.redirectUrl || "/api/dashboard";
              }, 500);
            } else {
              // Login failed with JSON error
              statusMsg.textContent =
                response.message || "Login failed. Please try again.";
              statusMsg.style.color = "red";
            }
          } catch (e) {
            // If JSON parsing fails, we might have received HTML
            if (
              xhr.status === 200 &&
              xhr.responseText.includes("<title>Dashboard")
            ) {
              // We got the dashboard HTML directly, redirect to dashboard
              window.location.href = "/api/dashboard";
            } else if (
              xhr.status === 302 ||
              xhr.responseText.includes("<title>Login")
            ) {
              // We got redirected or received login page
              statusMsg.textContent = "Session error. Please try again.";
              statusMsg.style.color = "red";
            } else {
              // Unexpected error
              statusMsg.textContent =
                "An unexpected error occurred. Please try again.";
              statusMsg.style.color = "red";
              console.error("Login error:", e);
            }
          }
        }
      };

      // Send the request as JSON
      xhr.send(JSON.stringify({ username, password }));
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
