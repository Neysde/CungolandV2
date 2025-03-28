// News editor functionality
document.addEventListener("DOMContentLoaded", function () {
  // Handle edit news button clicks
  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("edit-news-btn") ||
      e.target.closest(".edit-news-btn")
    ) {
      e.preventDefault();
      const button = e.target.classList.contains("edit-news-btn")
        ? e.target
        : e.target.closest(".edit-news-btn");
      const newsId = button.getAttribute("data-id");
      loadNewsForEditing(newsId);
    }
  });

  // Handle close edit panel button
  const closeEditNewsPanel = document.getElementById("close-edit-news-panel");
  if (closeEditNewsPanel) {
    closeEditNewsPanel.addEventListener("click", function () {
      const editNewsPanel = document.getElementById("edit-news-panel");
      if (editNewsPanel) {
        editNewsPanel.classList.remove("active");
        document.body.classList.remove("edit-panel-open");
      }
    });
  }

  /**
   * Load news article for editing
   * @param {string} newsId - The ID of the news article to edit
   */
  function loadNewsForEditing(newsId) {
    // First check if the edit panel exists
    const editNewsPanel = document.getElementById("edit-news-panel");
    if (!editNewsPanel) {
      console.error("Edit news panel not found in the DOM");
      alert("Could not open the editor. Please try refreshing the page.");
      return;
    }

    // Show loading state
    editNewsPanel.classList.add("active");
    document.body.classList.add("edit-panel-open");

    // Set the current news ID for later use
    window.currentNewsId = newsId;

    // Fetch news data
    fetch(`/api/news/${newsId}/data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((news) => {
        populateEditNewsForm(news);
      })
      .catch((error) => {
        console.error("Error loading news:", error);
        alert(`Error loading news article: ${error.message}`);

        // Close the panel on error
        if (editNewsPanel) {
          editNewsPanel.classList.remove("active");
          document.body.classList.remove("edit-panel-open");
        }
      });
  }

  /**
   * Populate the edit news form with data
   * @param {Object} news - The news article data
   */
  function populateEditNewsForm(news) {
    // Get all the form elements
    const editNewsId = document.getElementById("editNewsId");
    const editNewsTitle = document.getElementById("editNewsTitle");
    const editNewsUrlSlug = document.getElementById("editNewsUrlSlug");
    const editNewsCategory = document.getElementById("editNewsCategory");
    const editNewsPublishDate = document.getElementById("editNewsPublishDate");
    const editNewsFeatured = document.getElementById("editNewsFeatured");
    const editNewsInfoImagePreview = document.getElementById(
      "editNewsInfoImagePreview"
    );
    const editNewsContentSections = document.getElementById(
      "editNewsContentSections"
    );
    const editNewsInfoTableFields = document.getElementById(
      "editNewsInfoTableFields"
    );

    // Set form values if elements exist
    if (editNewsId) editNewsId.value = news._id || "";
    if (editNewsTitle) editNewsTitle.value = news.title || "";
    if (editNewsUrlSlug) editNewsUrlSlug.value = news.urlSlug || "";
    if (editNewsCategory) editNewsCategory.value = news.category || "";

    // Format and set publish date if element exists
    if (editNewsPublishDate && news.publishDate) {
      const publishDate = new Date(news.publishDate);
      editNewsPublishDate.value = publishDate.toISOString().split("T")[0];
    }

    // Set featured checkbox if element exists
    if (editNewsFeatured) editNewsFeatured.checked = news.featured || false;

    // Set info image preview if element exists
    if (editNewsInfoImagePreview) {
      if (news.infoImage && news.infoImage.url) {
        editNewsInfoImagePreview.innerHTML = `<img src="${
          news.infoImage.url
        }" alt="${news.infoImage.alt || news.title}">`;
      } else {
        editNewsInfoImagePreview.innerHTML =
          '<i class="fas fa-image"></i><span>No image selected</span>';
      }
    }

    // Continue with other form fields as needed
    // ...

    console.log("News data loaded successfully:", news);
  }

  // Handle edit news form submission
  const editNewsForm = document.getElementById("editNewsForm");
  if (editNewsForm) {
    editNewsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      updateNews();
    });
  }

  /**
   * Update news article
   */
  function updateNews() {
    const editNewsForm = document.getElementById("editNewsForm");
    if (!editNewsForm) return;

    // Create FormData object
    const formData = new FormData(editNewsForm);

    // Show loading state
    const submitBtn = editNewsForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "Update";
    if (submitBtn) {
      submitBtn.textContent = "Updating...";
      submitBtn.disabled = true;
    }

    // Submit form
    fetch(`/api/news/${window.currentNewsId}/update`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          // Show success message
          alert("News article updated successfully!");

          // Close edit panel
          const editNewsPanel = document.getElementById("edit-news-panel");
          if (editNewsPanel) {
            editNewsPanel.classList.remove("active");
            document.body.classList.remove("edit-panel-open");
          }

          // Refresh the page to update the news list
          window.location.reload();
        } else {
          // Show error message
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while updating the news article.");
      })
      .finally(() => {
        // Reset button state
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      });
  }
});
