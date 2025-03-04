/**
 * Login form functionality
 * Following UX principles from the uxanduiprinciples.md guide
 */

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get references to form elements
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const rememberMeCheckbox = document.getElementById("rememberMe");

  // Initialize form state
  initializeFormState();

  /**
   * Toggle password visibility
   * Enhances usability while maintaining security awareness
   */
  togglePasswordBtn.addEventListener("click", function () {
    // Toggle between password and text type
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePasswordBtn.textContent = "Hide";
      // Update ARIA attributes for accessibility
      passwordInput.setAttribute("aria-hidden", "false");
    } else {
      passwordInput.type = "password";
      togglePasswordBtn.textContent = "Show";
      passwordInput.setAttribute("aria-hidden", "true");
    }
    // Return focus to password field for better UX
    passwordInput.focus();
  });

  /**
   * Form validation
   * Provides immediate feedback to users
   */
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    let isValid = true;
    let errorMessage = "";

    // Clear any previous validation states
    clearValidationState();

    // Username validation
    if (!usernameInput.value.trim()) {
      isValid = false;
      errorMessage = "Please enter your username";
      highlightInvalidField(usernameInput);
    } else if (usernameInput.value.trim().length < 3) {
      isValid = false;
      errorMessage = "Username must be at least 3 characters long";
      highlightInvalidField(usernameInput);
    }

    // Password validation
    if (!passwordInput.value) {
      isValid = false;
      errorMessage = errorMessage || "Please enter your password";
      highlightInvalidField(passwordInput);
    } else if (passwordInput.value.length < 6) {
      isValid = false;
      errorMessage =
        errorMessage || "Password must be at least 6 characters long";
      highlightInvalidField(passwordInput);
    }

    // If form is invalid, prevent submission and show error
    if (!isValid) {
      showFormError(errorMessage);
      return;
    }

    try {
      const credentials = {
        username: usernameInput.value,
        password: passwordInput.value,
      };

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const errorData = await response.json();
        // Display server-side error message to the user
        return showFormError(errorData.message || "Login failed");
      }

      window.location.href = "/api/dashboard";
    } catch (err) {
      // Log error to console for debugging
      console.log("Error during login:", err);
      // Display a generic error message to the user
      //showFormError("An unexpected error occurred. Please try again later.");
    }

    // Handle "Remember me" functionality
    if (rememberMeCheckbox.checked) {
      localStorage.setItem("rememberedUser", usernameInput.value);
      // Only store that user wants to be remembered, not the actual password
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedUser");
      localStorage.removeItem("rememberMe");
    }

    // Add loading state to button when form is being submitted
    const submitButton = loginForm.querySelector('button[type="submit"]');
    /* submitButton.textContent = "Signing in...";
    submitButton.disabled = true; */

    // Note: In a real implementation, you might want to prevent the default
    // form submission and use fetch API for AJAX login
  });

  /**
   * Initialize form state from localStorage if available
   */
  function initializeFormState() {
    const rememberedUser = localStorage.getItem("rememberedUser");
    const rememberMe = localStorage.getItem("rememberMe");

    if (rememberedUser && rememberMe === "true") {
      usernameInput.value = rememberedUser;
      rememberMeCheckbox.checked = true;

      // Focus on password field for better UX since username is already filled
      passwordInput.focus();
    } else {
      // Focus on the first field when form loads
      usernameInput.focus();
    }
  }

  /**
   * Clear validation visual state
   */
  function clearValidationState() {
    usernameInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");

    // Remove any existing error messages
    const existingError = document.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }
  }

  /**
   * Highlight invalid field with error class
   */
  function highlightInvalidField(inputElement) {
    inputElement.classList.add("input-error");
    inputElement.focus();
  }

  /**
   * Show form error message
   */
  function showFormError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.setAttribute("role", "alert");
    errorDiv.textContent = message;

    // Insert at the top of the form
    loginForm.insertBefore(errorDiv, loginForm.firstChild);

    // Announce error for screen readers
    errorDiv.focus();
  }

  /**
   * Handle input events to validate in real-time
   */
  usernameInput.addEventListener("input", function () {
    // Remove error state as user types
    this.classList.remove("input-error");
  });

  passwordInput.addEventListener("input", function () {
    // Remove error state as user types
    this.classList.remove("input-error");
  });
});
