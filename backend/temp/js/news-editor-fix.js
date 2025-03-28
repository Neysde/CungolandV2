/**
 * Fix for news editor functionality
 * This script fixes the "editNewsPanel is null" error by using a more reliable approach
 */

// Fix for the news editing error
(function () {
  // Wait for the DOM to fully load
  document.addEventListener("DOMContentLoaded", function () {
    console.log("News editor fix loaded");

    // Add a single global event listener for all edit news buttons
    document.body.addEventListener("click", function (e) {
      const editBtn = e.target.closest(".edit-news-btn");
      if (editBtn) {
        e.preventDefault();
        const newsId = editBtn.getAttribute("data-id");
        console.log("Edit button clicked for news ID:", newsId);

        // Safe reference to the edit panel
        const editNewsPanel = document.getElementById("edit-news-panel");
        if (!editNewsPanel) {
          console.error("Edit news panel element not found");
          alert(
            "Could not find the news editor. Please refresh the page and try again."
          );
          return;
        }

        // Show the panel first
        editNewsPanel.classList.add("active");
        document.body.classList.add("edit-panel-open");

        // Then load the data
        loadNewsForEditing(newsId, editNewsPanel);
      }

      // Handle close button
      if (e.target.closest("#close-edit-news-panel")) {
        const panel = document.getElementById("edit-news-panel");
        if (panel) {
          panel.classList.remove("active");
          document.body.classList.remove("edit-panel-open");
        }
      }
    });

    // Also handle the edit form submission
    const editNewsForm = document.getElementById("editNewsForm");
    if (editNewsForm) {
      editNewsForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const newsId = document.getElementById("editNewsId")?.value;
        if (!newsId) {
          alert("News ID is missing. Please try again.");
          return;
        }
        updateNews(newsId, editNewsForm);
      });
    }
  });

  /**
   * Load news article data for editing
   */
  function loadNewsForEditing(newsId, panelElement) {
    console.log("Loading news data for ID:", newsId);

    fetch(`/api/news/${newsId}/data`, {
      credentials: "include", // Important for session cookies
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load news data: ${response.status}`);
        }
        return response.json();
      })
      .then((news) => {
        console.log("News data loaded:", news);
        populateNewsForm(news);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
        alert(`Could not load news data: ${error.message}`);

        // Close the panel on error
        if (panelElement) {
          panelElement.classList.remove("active");
          document.body.classList.remove("edit-panel-open");
        }
      });
  }

  /**
   * Populate the edit form with news data
   */
  function populateNewsForm(news) {
    // Set each field carefully with null checks
    safeSetValue("editNewsId", news._id);
    safeSetValue("editNewsTitle", news.title);
    safeSetValue("editNewsUrlSlug", news.urlSlug);
    safeSetValue("editNewsCategory", news.category);

    // Handle date field
    if (news.publishDate) {
      const element = document.getElementById("editNewsPublishDate");
      if (element) {
        const date = new Date(news.publishDate);
        element.value = date.toISOString().split("T")[0];
      }
    }

    // Handle checkbox
    const featuredElement = document.getElementById("editNewsFeatured");
    if (featuredElement) {
      featuredElement.checked = news.featured || false;
    }

    // Handle image preview
    const previewElement = document.getElementById("editNewsInfoImagePreview");
    if (previewElement) {
      if (news.infoImage && news.infoImage.url) {
        previewElement.innerHTML = `
          <img src="${news.infoImage.url}" alt="${
          news.infoImage.alt || news.title
        }">
        `;
      } else {
        previewElement.innerHTML =
          '<i class="fas fa-image"></i><span>No image selected</span>';
      }
    }

    // Populate content sections - this would depend on your specific structure
    // For now, just logging to ensure this part executes
    console.log("Form populated successfully");
  }

  /**
   * Update news article
   */
  function updateNews(newsId, form) {
    console.log("Updating news ID:", newsId);

    // Create form data
    const formData = new FormData(form);

    // Show loading state on the submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "Update";
    if (submitBtn) {
      submitBtn.textContent = "Updating...";
      submitBtn.disabled = true;
    }

    // Submit the form
    fetch(`/api/news/${newsId}/update`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Update failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert("News article updated successfully!");

          // Close the edit panel
          const editPanel = document.getElementById("edit-news-panel");
          if (editPanel) {
            editPanel.classList.remove("active");
            document.body.classList.remove("edit-panel-open");
          }

          // Refresh the page
          window.location.reload();
        } else {
          alert(data.message || "Failed to update news article");
        }
      })
      .catch((error) => {
        console.error("Update error:", error);
        alert(`Error updating news: ${error.message}`);
      })
      .finally(() => {
        // Reset button state
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      });
  }

  /**
   * Helper function to safely set form field values
   */
  function safeSetValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.value = value || "";
    }
  }
})();
