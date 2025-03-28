// Function to handle form submissions with proper error handling
async function handleFormSubmit(formId, url, successCallback) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include", // Important for session cookies
      });

      // Check if we got a redirect to login page (HTML response)
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("text/html")) {
        // Authentication error - redirect to login
        window.location.href = "/api/login";
        return;
      }

      // If JSON response, parse it
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        // Check for authentication error in JSON response
        if (!response.ok) {
          if (response.status === 401) {
            alert("Your session has expired. Please log in again.");
            window.location.href = "/api/login";
            return;
          }

          // Handle other errors
          alert(`Error: ${data.message || "Something went wrong"}`);
          return;
        }

        // Success case
        if (successCallback) {
          successCallback(data);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });
}

// Initialize all forms when document is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Wiki creation form
  handleFormSubmit("wikiForm", "/api/wiki/create", function (data) {
    alert("Wiki created successfully!");
    window.location.href = "/api/dashboard";
  });

  // Add other form handlers as needed
});
