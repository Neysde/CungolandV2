/**
 * Dashboard Patch - Fixes the editNewsPanel is null error
 *
 * This script patches the editNewsPanel null reference issue
 * by ensuring the element exists before using it.
 */

// Run patch immediately
(function patchDashboard() {
  console.log("Applying dashboard fixes...");

  // Store original functions that we need to patch
  const originalLoadNewsForEditing = window.loadNewsForEditing;

  // Create a safe patched version of loadNewsForEditing
  window.loadNewsForEditing = function (newsId) {
    console.log("Patched loadNewsForEditing called for news ID:", newsId);

    // Check if editNewsPanel exists first
    const editNewsPanel = document.getElementById("edit-news-panel");
    if (!editNewsPanel) {
      console.error("Edit news panel is null! Showing error to user.");
      alert(
        "Could not open the news editor. The element was not found on the page. Please refresh and try again."
      );
      return;
    }

    // Check if original function exists
    if (typeof originalLoadNewsForEditing === "function") {
      // Call the original function
      try {
        return originalLoadNewsForEditing(newsId);
      } catch (error) {
        console.error("Error in original loadNewsForEditing:", error);
        // Handle the error ourselves
        editNewsPanel.classList.add("active");
        document.body.classList.add("edit-panel-open");

        // Fetch news data directly
        fetch(`/api/news/${newsId}/data`, {
          credentials: "include",
        })
          .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch news data");
            return response.json();
          })
          .then((news) => {
            console.log("News data loaded via patch:", news);
            // Simple population of the form
            if (document.getElementById("editNewsId"))
              document.getElementById("editNewsId").value = news._id || "";
            if (document.getElementById("editNewsTitle"))
              document.getElementById("editNewsTitle").value = news.title || "";
          })
          .catch((err) => {
            console.error("Patch fetch error:", err);
            alert("Error loading news data: " + err.message);
            editNewsPanel.classList.remove("active");
            document.body.classList.remove("edit-panel-open");
          });
      }
    } else {
      // Original function not found, implement basic functionality
      console.warn(
        "Original loadNewsForEditing not found, using backup implementation"
      );
      editNewsPanel.classList.add("active");
      document.body.classList.add("edit-panel-open");
      alert(
        "Partial functionality available. Please refresh the page for full functionality."
      );
    }
  };

  // Add global click handler for edit news buttons
  document.addEventListener("click", function (e) {
    if (
      e.target.matches(".edit-news-btn") ||
      e.target.closest(".edit-news-btn")
    ) {
      const btn = e.target.matches(".edit-news-btn")
        ? e.target
        : e.target.closest(".edit-news-btn");
      const newsId = btn.getAttribute("data-id");

      if (!document.getElementById("edit-news-panel")) {
        console.error("Edit news panel not found in DOM");
        alert(
          "Could not edit news - editor panel not found. Please refresh the page."
        );
        return;
      }

      window.loadNewsForEditing(newsId);
    }
  });
})();
