/**
 * Dashboard JavaScript
 * Handles dynamic content creation, image uploads, form submission, and wiki management
 */

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements - Create Wiki
  const wikiForm = document.getElementById("wikiForm");
  const wikiTitle = document.getElementById("wikiTitle");
  const infoImage = document.getElementById("infoImage");
  const infoImagePreview = document.getElementById("infoImagePreview");
  const infoTableFields = document.getElementById("infoTableFields");
  const addInfoField = document.getElementById("addInfoField");
  const contentSections = document.getElementById("contentSections");
  const addParagraph = document.getElementById("addParagraph");
  const addImage = document.getElementById("addImage");
  const previewWiki = document.getElementById("previewWiki");

  // DOM Elements - Edit Wiki
  const editPanel = document.getElementById("edit-panel");
  const closeEditPanel = document.getElementById("close-edit-panel");
  const editWikiForm = document.getElementById("editWikiForm");
  const editWikiId = document.getElementById("editWikiId");
  const editWikiTitle = document.getElementById("editWikiTitle");
  const editWikiUrlSlug = document.getElementById("editWikiUrlSlug");
  const editInfoImage = document.getElementById("editInfoImage");
  const editInfoImagePreview = document.getElementById("editInfoImagePreview");
  const editInfoTableFields = document.getElementById("editInfoTableFields");
  const editAddInfoField = document.getElementById("editAddInfoField");
  const editContentSections = document.getElementById("editContentSections");
  const editAddParagraph = document.getElementById("editAddParagraph");
  const editAddImage = document.getElementById("editAddImage");
  const deleteWikiBtn = document.getElementById("deleteWiki");

  // DOM Elements - Create News
  const newsForm = document.getElementById("newsForm");
  const newsTitle = document.getElementById("newsTitle");
  const newsCategory = document.getElementById("newsCategory");
  const newsPublishDate = document.getElementById("newsPublishDate");
  const newsFeatured = document.getElementById("newsFeatured");
  const newsInfoImage = document.getElementById("newsInfoImage");
  const newsInfoImagePreview = document.getElementById("newsInfoImagePreview");
  const newsInfoTableFields = document.getElementById("newsInfoTableFields");
  const addNewsInfoField = document.getElementById("addNewsInfoField");
  const newsContentSections = document.getElementById("newsContentSections");
  const addNewsParagraph = document.getElementById("addNewsParagraph");
  const addNewsImage = document.getElementById("addNewsImage");
  const previewNews = document.getElementById("previewNews");

  // DOM Elements - Edit News
  const editNewsPanel = document.getElementById("edit-news-panel");
  const closeEditNewsPanel = document.getElementById("close-edit-news-panel");
  const editNewsForm = document.getElementById("editNewsForm");
  const editNewsId = document.getElementById("editNewsId");
  const editNewsTitle = document.getElementById("editNewsTitle");
  const editNewsUrlSlug = document.getElementById("editNewsUrlSlug");
  const editNewsCategory = document.getElementById("editNewsCategory");
  const editNewsPublishDate = document.getElementById("editNewsPublishDate");
  const editNewsFeatured = document.getElementById("editNewsFeatured");
  const editNewsInfoImage = document.getElementById("editNewsInfoImage");
  const editNewsInfoImagePreview = document.getElementById(
    "editNewsInfoImagePreview"
  );
  const editNewsInfoTableFields = document.getElementById(
    "editNewsInfoTableFields"
  );
  const editAddNewsInfoField = document.getElementById("editAddNewsInfoField");
  const editNewsContentSections = document.getElementById(
    "editNewsContentSections"
  );
  const editAddNewsParagraph = document.getElementById("editAddNewsParagraph");
  const editAddNewsImage = document.getElementById("editAddNewsImage");
  const deleteNewsBtn = document.getElementById("deleteNews");

  // DOM Elements - Delete Modal
  const deleteModal = document.getElementById("deleteModal");
  const deleteNewsModal = document.getElementById("deleteNewsModal");
  const closeModal = document.querySelector(".close-modal");
  const cancelDelete = document.getElementById("cancelDelete");
  const confirmDelete = document.getElementById("confirmDelete");
  const cancelNewsDelete = document.getElementById("cancelNewsDelete");
  const confirmNewsDelete = document.getElementById("confirmNewsDelete");

  // DOM Elements - Tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Templates
  const paragraphTemplate =
    document.getElementById("paragraphTemplate").innerHTML;
  const imageTemplate = document.getElementById("imageTemplate").innerHTML;
  const infoFieldTemplate =
    document.getElementById("infoFieldTemplate").innerHTML;

  // Counter for generating unique IDs
  let sectionCounter = 1;
  let currentWikiId = null;
  let currentNewsId = null;

  /**
   * Tab functionality
   */
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all tabs
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");
      const tabId = this.getAttribute("data-tab");
      document.getElementById(`${tabId}-section`).classList.add("active");
    });
  });

  /**
   * Generate URL slug from title
   * Converts title to lowercase, replaces spaces with hyphens, and removes special characters
   */
  wikiTitle.addEventListener("input", function () {
    const title = this.value;
    const slug = generateSlug(title);

    // Set hidden input value for URL slug
    document.getElementById("wikiUrlHidden").value = slug;
  });

  /**
   * Generate URL slug from title in edit form
   */
  editWikiTitle.addEventListener("input", function () {
    const title = this.value;
    const slug = generateSlug(title);

    // Set hidden input value for URL slug
    editWikiUrlSlug.value = slug;
  });

  /**
   * Generate URL slug from title for news
   */
  if (newsTitle) {
    newsTitle.addEventListener("input", function () {
      const title = this.value;
      const slug = generateSlug(title);

      // Set hidden input value for URL slug
      document.getElementById("newsUrlHidden").value = slug;
    });
  }

  /**
   * Generate URL slug from title in edit news form
   */
  if (editNewsTitle) {
    editNewsTitle.addEventListener("input", function () {
      const title = this.value;
      const slug = generateSlug(title);

      // Set hidden input value for URL slug
      editNewsUrlSlug.value = slug;
    });
  }

  /**
   * Generate slug from title
   * @param {string} title - The title to convert to a slug
   * @returns {string} - The generated slug
   */
  function generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  }

  /**
   * Handle info image upload and preview
   */
  infoImage.addEventListener("change", function () {
    handleImageUpload(this, infoImagePreview);
  });

  /**
   * Handle edit info image upload and preview
   */
  editInfoImage.addEventListener("change", function () {
    handleImageUpload(this, editInfoImagePreview);
  });

  /**
   * Handle info image upload for news
   */
  if (newsInfoImage) {
    newsInfoImage.addEventListener("change", function () {
      handleImageUpload(this, newsInfoImagePreview);
    });
  }

  /**
   * Handle info image upload for edit news
   */
  if (editNewsInfoImage) {
    editNewsInfoImage.addEventListener("change", function () {
      handleImageUpload(this, editNewsInfoImagePreview);
    });
  }

  /**
   * Handle image upload and preview
   * @param {HTMLInputElement} fileInput - The file input element
   * @param {HTMLElement} previewElement - The preview element
   */
  function handleImageUpload(fileInput, previewElement) {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        // Clear previous content
        previewElement.innerHTML = "";

        // Create image element
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Image preview";

        // Add image to preview
        previewElement.appendChild(img);
      };

      reader.readAsDataURL(file);
    }
  }

  /**
   * Add new info field to the info table
   */
  addInfoField.addEventListener("click", function () {
    addInfoFieldToContainer(infoTableFields);
  });

  /**
   * Add new info field to the edit info table
   */
  editAddInfoField.addEventListener("click", function () {
    addInfoFieldToContainer(editInfoTableFields);
  });

  /**
   * Add info field to news form
   */
  if (addNewsInfoField) {
    addNewsInfoField.addEventListener("click", function () {
      addInfoFieldToContainer(newsInfoTableFields);
    });
  }

  /**
   * Add info field to edit news form
   */
  if (editAddNewsInfoField) {
    editAddNewsInfoField.addEventListener("click", function () {
      addInfoFieldToContainer(editNewsInfoTableFields);
    });
  }

  /**
   * Add info field to container
   * @param {HTMLElement} container - The container to add the field to
   */
  function addInfoFieldToContainer(container) {
    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = infoFieldTemplate;

    // Get the new field element
    const newField = tempContainer.firstElementChild;

    // Add event listener to the remove button
    const removeButton = newField.querySelector(".remove-field");
    if (removeButton) {
      removeButton.addEventListener("click", removeInfoField);
    }

    // Add the new field to the DOM
    container.appendChild(newField);
  }

  /**
   * Remove info field from the info table
   */
  function removeInfoField() {
    this.closest(".info-field").remove();
  }

  /**
   * Add event listeners to existing remove buttons
   */
  document.querySelectorAll(".remove-field").forEach((button) => {
    button.addEventListener("click", removeInfoField);
  });

  /**
   * Add new paragraph section to the content
   */
  addParagraph.addEventListener("click", function () {
    addParagraphToContainer(contentSections);
  });

  /**
   * Add new paragraph section to the edit content
   */
  editAddParagraph.addEventListener("click", function () {
    addParagraphToContainer(editContentSections);
  });

  /**
   * Add paragraph to news form
   */
  if (addNewsParagraph) {
    addNewsParagraph.addEventListener("click", function () {
      addParagraphToContainer(newsContentSections);
    });
  }

  /**
   * Add paragraph to edit news form
   */
  if (editAddNewsParagraph) {
    editAddNewsParagraph.addEventListener("click", function () {
      addParagraphToContainer(editNewsContentSections);
    });
  }

  /**
   * Add paragraph to container
   * @param {HTMLElement} container - The container to add the paragraph to
   */
  function addParagraphToContainer(container) {
    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = paragraphTemplate.replace(
      /{index}/g,
      sectionCounter++
    );

    // Get the new section element
    const newSection = tempContainer.firstElementChild;

    // Add event listener to the remove button
    const removeButton = newSection.querySelector(".remove-section");
    if (removeButton) {
      removeButton.addEventListener("click", removeContentSection);
    }

    // Add the new section to the DOM
    container.appendChild(newSection);
  }

  /**
   * Add new image section to the content
   */
  addImage.addEventListener("click", function () {
    addImageToContainer(contentSections);
  });

  /**
   * Add new image section to the edit content
   */
  editAddImage.addEventListener("click", function () {
    addImageToContainer(editContentSections);
  });

  /**
   * Add image to news form
   */
  if (addNewsImage) {
    addNewsImage.addEventListener("click", function () {
      addImageToContainer(newsContentSections);
    });
  }

  /**
   * Add image to edit news form
   */
  if (editAddNewsImage) {
    editAddNewsImage.addEventListener("click", function () {
      addImageToContainer(editNewsContentSections);
    });
  }

  /**
   * Add image to container
   * @param {HTMLElement} container - The container to add the image to
   */
  function addImageToContainer(container) {
    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = imageTemplate.replace(
      /{index}/g,
      sectionCounter++
    );

    // Get the new section element
    const newSection = tempContainer.firstElementChild;

    // Add event listener to the remove button
    const removeButton = newSection.querySelector(".remove-section");
    if (removeButton) {
      removeButton.addEventListener("click", removeContentSection);
    }

    // Add event listener to the file input
    const fileInput = newSection.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.addEventListener("change", handleContentImageUpload);
    }

    // Add the new section to the DOM
    container.appendChild(newSection);
  }

  /**
   * Remove content section
   * This function will remove any content section, including the initial one
   */
  function removeContentSection() {
    const section = this.closest(".content-section");
    const container = section.parentElement;

    // Check if this is the last section
    if (container.children.length > 1) {
      section.remove();
    } else {
      // If it's the last section, show an alert
      alert("You need to have at least one content section.");
    }
  }

  /**
   * Add event listeners to existing remove section buttons
   * This includes the initial paragraph section
   */
  document.querySelectorAll(".remove-section").forEach((button) => {
    button.addEventListener("click", removeContentSection);
  });

  /**
   * Handle content image upload and preview
   */
  function handleContentImageUpload() {
    const file = this.files[0];
    if (file) {
      const preview = this.closest(".image-upload-container").querySelector(
        ".image-preview"
      );
      if (preview) {
        const reader = new FileReader();

        reader.onload = function (e) {
          // Clear previous content
          preview.innerHTML = "";

          // Create image element
          const img = document.createElement("img");
          img.src = e.target.result;
          img.alt = "Content image preview";

          // Add image to preview
          preview.appendChild(img);
        };

        reader.readAsDataURL(file);
      }
    }
  }

  /**
   * Add event listeners to existing file inputs
   */
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    if (input.id === "infoImage" || input.id === "editInfoImage") return; // Skip info image, it has its own handler
    input.addEventListener("change", handleContentImageUpload);
  });

  /**
   * Preview wiki
   */
  previewWiki.addEventListener("click", function (e) {
    e.preventDefault();

    // Validate form
    if (!validateForm(wikiForm)) {
      alert("Please fill in all required fields before previewing.");
      return;
    }

    // Open preview in new window/tab
    const formData = new FormData(wikiForm);

    // TODO: Implement preview functionality
    // This would typically involve sending the form data to the server
    // and getting back a preview HTML that can be displayed in a new window
    alert("Preview functionality will be implemented on the server side.");
  });

  /**
   * Form submission for creating a new wiki
   */
  wikiForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate form
    if (!validateForm(this)) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    // Create FormData object
    const formData = new FormData(this);

    // Show loading state
    const submitBtn = this.querySelector(".submit-btn");
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Creating...";
    submitBtn.disabled = true;

    // Send form data to server
    fetch("/api/wiki/create", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;

        // Check if response is ok
        if (!response.ok) {
          return response.text().then((text) => {
            // Try to parse as JSON, if it fails, use the text as error message
            try {
              const json = JSON.parse(text);
              throw new Error(json.message || "Error creating wiki");
            } catch (e) {
              if (e instanceof SyntaxError) {
                // JSON parse error, use the raw text
                console.error("Server response:", text);
                throw new Error("Server error. Please try again later.");
              }
              throw e; // Re-throw if it's not a SyntaxError
            }
          });
        }

        // Try to parse the response as JSON
        return response.text().then((text) => {
          try {
            return JSON.parse(text);
          } catch (e) {
            // If JSON parsing fails, check if it's a redirect
            if (text.includes("<html") && text.includes("redirect")) {
              // It's likely an HTML redirect page
              return { url: "/api/dashboard" }; // Redirect to dashboard as fallback
            }
            console.error("Invalid JSON response:", text);
            throw new Error("Invalid response from server");
          }
        });
      })
      .then((data) => {
        // Reset form
        wikiForm.reset();
        infoTableFields.innerHTML = "";
        contentSections.innerHTML = "";
        addParagraphToContainer(contentSections);
        infoImagePreview.innerHTML =
          '<i class="fas fa-image"></i><span>No image selected</span>';

        // Show success message
        alert("Wiki created successfully!");

        // Refresh the page to show the new wiki in the list
        window.location.reload();
      })
      .catch((error) => {
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;

        console.error("Error:", error);
        alert("There was a problem creating the wiki: " + error.message);
      });
  });

  /**
   * Handle wiki card click
   */
  document.querySelectorAll(".wiki-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      // If the click was on a button or link, don't open the edit panel
      if (
        e.target.closest(".edit-wiki-btn") ||
        e.target.closest(".view-wiki-btn")
      ) {
        return;
      }

      const wikiId = this.getAttribute("data-id");
      openEditPanel(wikiId);
    });
  });

  /**
   * Handle edit button click
   */
  document.querySelectorAll(".edit-wiki-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const wikiId = this.getAttribute("data-id");
      openEditPanel(wikiId);
    });
  });

  /**
   * Open edit panel
   * @param {string} wikiId - The ID of the wiki to edit
   */
  function openEditPanel(wikiId) {
    // Show loading state
    editPanel.classList.add("active");
    document.body.classList.add("edit-panel-open");

    // Fetch wiki data
    fetch(`/api/wiki/${wikiId}/data`)
      .then((response) => response.json())
      .then((wiki) => {
        // Store current wiki ID
        currentWikiId = wikiId;

        // Set form values
        editWikiId.value = wikiId;
        editWikiTitle.value = wiki.title;
        editWikiUrlSlug.value = wiki.urlSlug;

        // Set info image preview
        if (wiki.infoImage && wiki.infoImage.url) {
          editInfoImagePreview.innerHTML = `<img src="${
            wiki.infoImage.url
          }" alt="${wiki.infoImage.alt || wiki.title}">`;
        } else {
          editInfoImagePreview.innerHTML =
            '<i class="fas fa-image"></i><span>No image selected</span>';
        }

        // Clear and populate info fields
        editInfoTableFields.innerHTML = "";
        if (wiki.infoFields && wiki.infoFields.length > 0) {
          wiki.infoFields.forEach((field) => {
            const fieldHTML = infoFieldTemplate
              .replace(/::LABEL::/g, field.label)
              .replace(/::VALUE::/g, field.value);
            editInfoTableFields.insertAdjacentHTML("beforeend", fieldHTML);
          });
        }

        // Parse content HTML to recreate content sections
        parseAndPopulateContent(wiki.content, editContentSections);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while loading the wiki.");
        editPanel.classList.remove("active");
        document.body.classList.remove("edit-panel-open");
      });
  }

  /**
   * Parse wiki content and populate content sections
   * @param {string} content - The HTML content
   * @param {HTMLElement} container - The container to add the content to
   */
  function parseAndPopulateContent(content, container) {
    // Create a temporary container to parse the HTML
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = content;

    // Process the content
    let currentSubtitle = "";
    let currentParagraph = "";

    // Process each child node
    Array.from(tempContainer.childNodes).forEach((node) => {
      // Handle headings (subtitles)
      if (node.nodeName === "H2") {
        // If we have a paragraph, add it first
        if (currentParagraph) {
          addParagraphWithContent(container, currentSubtitle, currentParagraph);
          currentSubtitle = "";
          currentParagraph = "";
        }

        // Store the subtitle
        currentSubtitle = node.textContent;
      }
      // Handle paragraphs
      else if (node.nodeName === "P") {
        // If we already have a paragraph, add it first
        if (currentParagraph) {
          addParagraphWithContent(container, currentSubtitle, currentParagraph);
          currentSubtitle = "";
          currentParagraph = "";
        }

        // Store the paragraph
        currentParagraph = node.textContent;
      }
      // Handle images
      else if (
        node.nodeName === "DIV" &&
        node.classList.contains("article-image")
      ) {
        // If we have a paragraph, add it first
        if (currentParagraph) {
          addParagraphWithContent(container, currentSubtitle, currentParagraph);
          currentSubtitle = "";
          currentParagraph = "";
        }

        // Add image section
        const img = node.querySelector("img");
        const caption = node.querySelector(".image-caption");

        if (img) {
          addImageWithContent(
            container,
            img.src,
            caption ? caption.textContent : ""
          );
        }
      }
    });

    // Add any remaining paragraph
    if (currentParagraph) {
      addParagraphWithContent(container, currentSubtitle, currentParagraph);
    }
  }

  /**
   * Add paragraph with content to container
   * @param {HTMLElement} container - The container to add the paragraph to
   * @param {string} subtitle - The subtitle text
   * @param {string} paragraph - The paragraph text
   */
  function addParagraphWithContent(container, subtitle, paragraph) {
    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = paragraphTemplate.replace(
      /{index}/g,
      sectionCounter++
    );

    // Get the new section element
    const newSection = tempContainer.firstElementChild;

    // Set subtitle and paragraph values
    const subtitleInput = newSection.querySelector('input[name^="subtitles"]');
    const paragraphTextarea = newSection.querySelector(
      'textarea[name^="paragraphs"]'
    );

    if (subtitleInput) subtitleInput.value = subtitle || "";
    if (paragraphTextarea) paragraphTextarea.value = paragraph || "";

    // Add event listener to the remove button
    const removeButton = newSection.querySelector(".remove-section");
    if (removeButton) {
      removeButton.addEventListener("click", removeContentSection);
    }

    // Add the new section to the DOM
    container.appendChild(newSection);
  }

  /**
   * Add image section with content
   * @param {HTMLElement} container - The container to add the image to
   * @param {string} imageUrl - The image URL
   * @param {string} caption - The image caption
   */
  function addImageWithContent(container, imageUrl, caption) {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = imageTemplate.replace(
      /{index}/g,
      sectionCounter++
    );

    const newSection = tempContainer.firstElementChild;
    const captionInput = newSection.querySelector(
      'input[name="imageCaptions[]"]'
    );
    const preview = newSection.querySelector(".image-preview");

    if (captionInput) captionInput.value = caption;

    if (preview && imageUrl) {
      preview.innerHTML = "";
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = caption || "Image";
      preview.appendChild(img);
    }

    const removeButton = newSection.querySelector(".remove-section");
    if (removeButton) {
      removeButton.addEventListener("click", removeContentSection);
    }

    const fileInput = newSection.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.addEventListener("change", handleContentImageUpload);
    }

    container.appendChild(newSection);
  }

  /**
   * Close edit panel
   */
  closeEditPanel.addEventListener("click", function () {
    editPanel.classList.remove("active");
    document.body.classList.remove("edit-panel-open");
    currentWikiId = null;
  });

  /**
   * Form submission for editing a wiki
   */
  editWikiForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate form
    if (!validateForm(this)) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    // Create FormData object
    const formData = new FormData(this);

    // Show loading state
    const submitBtn = this.querySelector(".submit-btn");
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;

    // Send form data to server
    fetch(`/api/wiki/${currentWikiId}/update`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;

        // Check if response is ok
        if (!response.ok) {
          return response.text().then((text) => {
            try {
              const json = JSON.parse(text);
              throw new Error(json.message || "Error updating wiki");
            } catch (e) {
              if (e instanceof SyntaxError) {
                console.error("Server response:", text);
                throw new Error("Server error. Please try again later.");
              }
              throw e;
            }
          });
        }

        return response.text().then((text) => {
          try {
            return JSON.parse(text);
          } catch (e) {
            if (text.includes("<html") && text.includes("redirect")) {
              return { url: "/api/dashboard" };
            }
            console.error("Invalid JSON response:", text);
            throw new Error("Invalid response from server");
          }
        });
      })
      .then((data) => {
        // Show success message
        alert("Wiki updated successfully!");

        // Close edit panel
        editPanel.classList.remove("active");

        // Refresh the page to show the updated wiki in the list
        window.location.reload();
      })
      .catch((error) => {
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;

        console.error("Error:", error);
        alert("There was a problem updating the wiki: " + error.message);
      });
  });

  /**
   * Delete wiki button click
   */
  deleteWikiBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // Show delete confirmation modal
    deleteModal.classList.add("active");
  });

  /**
   * Close delete modal
   */
  closeModal.addEventListener("click", function () {
    deleteModal.classList.remove("active");
  });

  /**
   * Cancel delete
   */
  cancelDelete.addEventListener("click", function () {
    deleteModal.classList.remove("active");
  });

  /**
   * Confirm delete
   */
  confirmDelete.addEventListener("click", function () {
    // Show loading state
    this.textContent = "Deleting...";
    this.disabled = true;

    // Send delete request
    fetch(`/api/wiki/${currentWikiId}/delete`, {
      method: "POST",
    })
      .then((response) => {
        // Reset button state
        this.textContent = "Delete";
        this.disabled = false;

        // Check if response is ok
        if (!response.ok) {
          return response.text().then((text) => {
            try {
              const json = JSON.parse(text);
              throw new Error(json.message || "Error deleting wiki");
            } catch (e) {
              if (e instanceof SyntaxError) {
                console.error("Server response:", text);
                throw new Error("Server error. Please try again later.");
              }
              throw e;
            }
          });
        }

        return response.text().then((text) => {
          try {
            return JSON.parse(text);
          } catch (e) {
            if (text.includes("<html") && text.includes("redirect")) {
              return { success: true };
            }
            console.error("Invalid JSON response:", text);
            throw new Error("Invalid response from server");
          }
        });
      })
      .then((data) => {
        // Close delete modal
        deleteModal.classList.remove("active");

        // Close edit panel
        editPanel.classList.remove("active");

        // Show success message
        alert("Wiki deleted successfully!");

        // Refresh the page to update the wiki list
        window.location.reload();
      })
      .catch((error) => {
        // Reset button state
        this.textContent = "Delete";
        this.disabled = false;

        // Close delete modal
        deleteModal.classList.remove("active");

        console.error("Error:", error);
        alert("There was a problem deleting the wiki: " + error.message);
      });
  });

  /**
   * Validate form
   * @param {HTMLFormElement} form - The form to validate
   * @returns {boolean} - Whether the form is valid
   */
  function validateForm(form) {
    // Check required fields
    const titleInput = form.querySelector('input[name="title"]');
    if (!titleInput || !titleInput.value.trim()) return false;

    // Check if there's at least one content section
    const contentSections = form.querySelector(".content-sections");
    if (!contentSections || contentSections.children.length === 0) return false;

    // Check if at least one paragraph has content
    let hasContent = false;
    const paragraphs = form.querySelectorAll('textarea[name="paragraphs[]"]');
    paragraphs.forEach((paragraph) => {
      if (paragraph.value.trim()) hasContent = true;
    });

    return hasContent;
  }

  /**
   * Handle news form submission
   */
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitNewsForm();
    });
  }

  /**
   * Handle edit news form submission
   */
  if (editNewsForm) {
    editNewsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      updateNews();
    });
  }

  /**
   * Handle edit news button click
   */
  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("edit-news-btn") ||
      e.target.closest(".edit-news-btn")
    ) {
      const button = e.target.classList.contains("edit-news-btn")
        ? e.target
        : e.target.closest(".edit-news-btn");
      const newsId = button.getAttribute("data-id");
      loadNewsForEditing(newsId);
    }
  });

  /**
   * Close edit news panel
   */
  if (closeEditNewsPanel) {
    closeEditNewsPanel.addEventListener("click", function () {
      editNewsPanel.classList.remove("active");
      document.body.classList.remove("edit-panel-open");
      currentNewsId = null;
    });
  }

  /**
   * Handle delete news button click
   */
  if (deleteNewsBtn) {
    deleteNewsBtn.addEventListener("click", function () {
      deleteNewsModal.classList.add("active");
    });
  }

  /**
   * Handle cancel news delete button click
   */
  if (cancelNewsDelete) {
    cancelNewsDelete.addEventListener("click", function () {
      deleteNewsModal.classList.remove("active");
    });
  }

  /**
   * Handle confirm news delete button click
   */
  if (confirmNewsDelete) {
    confirmNewsDelete.addEventListener("click", function () {
      deleteNews();
    });
  }

  /**
   * Submit news form
   * Creates a new news article
   */
  function submitNewsForm() {
    // Create FormData object
    const formData = new FormData(newsForm);

    // Add featured flag as boolean
    formData.set("featured", newsFeatured.checked);

    // Show loading state
    const submitBtn = newsForm.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Creating...";
    submitBtn.disabled = true;

    // Submit form
    fetch("/api/news/create", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Show success message
          alert("News article created successfully!");

          // Reset form
          newsForm.reset();
          newsInfoImagePreview.innerHTML =
            '<i class="fas fa-image"></i><span>No image selected</span>';
          newsInfoTableFields.innerHTML = "";
          newsContentSections.innerHTML = "";
          addParagraphToContainer(newsContentSections);

          // Redirect to the new news article
          window.open(data.url, "_blank");

          // Refresh the page to update the news list
          window.location.reload();
        } else {
          // Show error message
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while creating the news article.");
      })
      .finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  }

  /**
   * Load news article for editing
   * @param {string} newsId - The ID of the news article to edit
   */
  function loadNewsForEditing(newsId) {
    currentNewsId = newsId;

    // Show loading state
    editNewsPanel.classList.add("active");
    document.body.classList.add("edit-panel-open");

    // Fetch news data
    fetch(`/api/news/${newsId}/data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((news) => {
        // Clear existing content sections
        editNewsContentSections.innerHTML = "";

        // Set form values
        editNewsId.value = newsId;
        editNewsTitle.value = news.title || "";
        editNewsUrlSlug.value = news.urlSlug || "";
        editNewsCategory.value = news.category || "";

        // Format and set publish date
        if (news.publishDate) {
          const publishDate = new Date(news.publishDate);
          editNewsPublishDate.value = publishDate.toISOString().split("T")[0];
        } else {
          editNewsPublishDate.value = "";
        }

        // Set featured checkbox
        editNewsFeatured.checked = news.featured || false;

        // Set info image preview
        if (news.infoImage && news.infoImage.url) {
          editNewsInfoImagePreview.innerHTML = `<img src="${
            news.infoImage.url
          }" alt="${news.infoImage.alt || news.title}">`;
        } else {
          editNewsInfoImagePreview.innerHTML =
            '<i class="fas fa-image"></i><span>No image selected</span>';
        }

        // Clear and populate info fields
        editNewsInfoTableFields.innerHTML = "";
        if (news.infoFields && news.infoFields.length > 0) {
          news.infoFields.forEach((field, index) => {
            const fieldHTML = `
              <div class="info-field">
                <div class="field-inputs">
                  <input type="text" name="infoTable[fields][${index}][label]" placeholder="Label" value="${
              field.label || ""
            }" required>
                  <input type="text" name="infoTable[fields][${index}][value]" placeholder="Value" value="${
              field.value || ""
            }" required>
                </div>
                <button type="button" class="remove-field-btn" onclick="removeInfoField(this)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            `;
            editNewsInfoTableFields.insertAdjacentHTML("beforeend", fieldHTML);
          });
        }

        // Clear content sections
        editNewsContentSections.innerHTML = "";

        // Parse HTML content to extract subtitles and paragraphs
        if (news.content) {
          // Create a temporary container to parse the HTML
          const tempContainer = document.createElement("div");
          tempContainer.innerHTML = news.content;

          // Find all h2 (subtitles) and p (paragraphs) elements
          const h2Elements = tempContainer.querySelectorAll("h2");
          const pElements = tempContainer.querySelectorAll("p");

          // If we have h2 elements, assume they are subtitles followed by paragraphs
          if (h2Elements.length > 0) {
            h2Elements.forEach((h2, index) => {
              // Get the corresponding paragraph if available
              const paragraph = pElements[index]
                ? pElements[index].textContent
                : "";

              // Add a paragraph section with subtitle and content
              addParagraphWithContent(
                editNewsContentSections,
                h2.textContent,
                paragraph
              );
            });
          } else {
            // If no h2 elements, just add the content as a single paragraph
            addParagraphWithContent(editNewsContentSections, "", news.content);
          }
        } else {
          // Add at least one paragraph section if no content exists
          addParagraphToContainer(editNewsContentSections);
        }
      })
      .catch((error) => {
        alert(`Error loading news article: ${error.message}`);
        // Close the panel on error
        editNewsPanel.classList.remove("active");
        document.body.classList.remove("edit-panel-open");
      });
  }

  /**
   * Delete news article
   */
  function deleteNews() {
    // Show loading state
    const deleteBtn = confirmNewsDelete;
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = "Deleting...";
    deleteBtn.disabled = true;

    // Submit delete request
    fetch(`/api/news/${currentNewsId}`, {
      method: "DELETE",
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
          alert("News article deleted successfully!");

          // Close modal and edit panel
          deleteNewsModal.classList.remove("active");
          editNewsPanel.classList.remove("active");
          document.body.classList.remove("edit-panel-open");
          currentNewsId = null;

          // Refresh the page to update the news list
          window.location.reload();
        } else {
          // Show error message
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while deleting the news article.");
      })
      .finally(() => {
        // Reset button state
        deleteBtn.textContent = originalText;
        deleteBtn.disabled = false;
      });
  }

  /**
   * Update news article
   */
  function updateNews() {
    // Create FormData object
    const formData = new FormData(editNewsForm);

    // Add featured flag as boolean
    formData.set("featured", editNewsFeatured.checked);

    // Process content sections to create HTML content
    const contentSections =
      editNewsContentSections.querySelectorAll(".content-section");
    let htmlContent = "";

    contentSections.forEach((section) => {
      if (section.classList.contains("paragraph-section")) {
        const subtitle = section.querySelector(
          'input[name^="subtitles"]'
        ).value;
        const paragraph = section.querySelector(
          'textarea[name^="paragraphs"]'
        ).value;

        if (subtitle) {
          htmlContent += `<h2>${subtitle}</h2>`;
        }

        if (paragraph) {
          htmlContent += `<p>${paragraph}</p>`;
        }
      } else if (section.classList.contains("image-section")) {
        const caption = section.querySelector(
          'input[name^="imageCaptions"]'
        ).value;
        const imageUrl = section.querySelector('input[type="hidden"]')?.value;

        if (imageUrl) {
          htmlContent += `<div class="content-image">
            <img src="${imageUrl}" alt="${caption || "Image"}">
            ${caption ? `<p class="image-caption">${caption}</p>` : ""}
          </div>`;
        }
      }
    });

    // Set the content
    formData.set("content", htmlContent);

    // Show loading state
    const submitBtn = editNewsForm.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;

    // Submit form
    fetch(`/api/news/${currentNewsId}/update`, {
      method: "POST",
      body: formData,
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
          editNewsPanel.classList.remove("active");
          document.body.classList.remove("edit-panel-open");

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
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  }

  // Add event listeners to all edit wiki buttons
  const editWikiButtons = document.querySelectorAll(".edit-wiki-btn");
  editWikiButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const wikiId = this.getAttribute("data-id");
      openEditPanel(wikiId);
    });
  });

  // Add event listeners to all edit news buttons
  const editNewsButtons = document.querySelectorAll(".edit-news-btn");
  editNewsButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const newsId = this.getAttribute("data-id");
      loadNewsForEditing(newsId);
    });
  });

  // Add event listener to all close modal buttons
  document.querySelectorAll(".close-modal").forEach((button) => {
    button.addEventListener("click", function () {
      // Find the closest modal and close it
      const modal = this.closest(".modal");
      if (modal) {
        modal.classList.remove("active");
      }
    });
  });
});
