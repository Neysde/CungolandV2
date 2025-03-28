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
  if (wikiTitle) {
    wikiTitle.addEventListener("input", function () {
      const title = this.value;
      const slug = generateSlug(title);

      // Set hidden input value for URL slug
      document.getElementById("wikiUrlHidden").value = slug;
    });
  }

  /**
   * Generate URL slug from title in edit form
   */
  if (editWikiTitle && editWikiUrlSlug) {
    editWikiTitle.addEventListener("input", function () {
      const title = this.value;
      const slug = generateSlug(title);

      // Set hidden input value for URL slug
      editWikiUrlSlug.value = slug;
    });
  }

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
  if (infoImage && infoImagePreview) {
    infoImage.addEventListener("change", function () {
      handleImageUpload(this, infoImagePreview);
    });
  }

  /**
   * Handle edit info image upload and preview
   */
  if (editInfoImage && editInfoImagePreview) {
    editInfoImage.addEventListener("change", function () {
      handleImageUpload(this, editInfoImagePreview);
    });
  }

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
   * Handle adding info fields
   */
  if (addInfoField) {
    addInfoField.addEventListener("click", function () {
      addInfoFieldToContainer(infoTableFields);
    });
  }

  /**
   * Handle adding edit info fields
   */
  if (editAddInfoField) {
    editAddInfoField.addEventListener("click", function () {
      addInfoFieldToContainer(editInfoTableFields);
    });
  }

  /**
   * Handle adding news info fields
   */
  if (addNewsInfoField) {
    addNewsInfoField.addEventListener("click", function () {
      addInfoFieldToContainer(newsInfoTableFields);
    });
  }

  /**
   * Handle adding edit news info fields
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
   * Handle adding paragraphs
   */
  if (addParagraph && contentSections) {
    addParagraph.addEventListener("click", function () {
      addParagraphToContainer(contentSections);
    });
  }

  /**
   * Handle adding paragraphs in edit mode
   */
  if (editAddParagraph && editContentSections) {
    editAddParagraph.addEventListener("click", function () {
      addParagraphToContainer(editContentSections);
    });
  }

  /**
   * Handle adding news paragraphs
   */
  if (addNewsParagraph && newsContentSections) {
    addNewsParagraph.addEventListener("click", function () {
      addParagraphToContainer(newsContentSections);
    });
  }

  /**
   * Handle adding news paragraphs in edit mode
   */
  if (editAddNewsParagraph && editNewsContentSections) {
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
   * Handle adding images
   */
  if (addImage && contentSections) {
    addImage.addEventListener("click", function () {
      addImageToContainer(contentSections);
    });
  }

  /**
   * Handle adding images in edit mode
   */
  if (editAddImage && editContentSections) {
    editAddImage.addEventListener("click", function () {
      addImageToContainer(editContentSections);
    });
  }

  /**
   * Handle adding news images
   */
  if (addNewsImage && newsContentSections) {
    addNewsImage.addEventListener("click", function () {
      addImageToContainer(newsContentSections);
    });
  }

  /**
   * Handle adding news images in edit mode
   */
  if (editAddNewsImage && editNewsContentSections) {
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
  if (previewWiki) {
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
  }

  /**
   * Form submission for creating a new wiki
   */
  if (wikiForm) {
    wikiForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate form
      if (!validateForm(this)) {
        alert("Please fill in all required fields before submitting.");
        return;
      }

      // Create FormData object
      const formData = new FormData(this);

      // Add section order and types for maintaining content order
      const sections = document
        .getElementById("contentSections")
        .querySelectorAll(".content-section");
      let sectionIndex = 0;

      sections.forEach((section) => {
        // Track the type and order of each section
        if (section.classList.contains("paragraph-section")) {
          formData.append("sectionTypes", "paragraph");
          formData.append("sectionOrder", sectionIndex);
        } else if (section.classList.contains("image-section")) {
          formData.append("sectionTypes", "image");
          formData.append("sectionOrder", sectionIndex);
        }
        sectionIndex++;
      });

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
  }

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
    // Check if edit panel exists
    if (!editPanel) {
      console.error("Edit panel element not found!");
      alert(
        "Could not open edit panel. Please refresh the page and try again."
      );
      return;
    }

    // Show loading state
    editPanel.classList.add("active");
    document.body.classList.add("edit-panel-open");

    // Fetch wiki data
    fetch(`/api/wiki/${wikiId}/data`)
      .then((response) => {
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Check content type to handle non-JSON responses
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          // For non-JSON responses, throw an error with more details
          return response.text().then((text) => {
            console.error("Server returned non-JSON response:", text);
            throw new Error(
              "Server returned an invalid response format. This might be due to authentication issues or server configuration."
            );
          });
        }
      })
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
            // Create a temporary container to hold the template
            const tempContainer = document.createElement("div");
            tempContainer.innerHTML = infoFieldTemplate;

            // Get the template element
            const newField = tempContainer.firstElementChild;

            // Set the values
            const inputs = newField.querySelectorAll("input");
            if (inputs.length >= 2) {
              inputs[0].value = field.label || ""; // Set label value
              inputs[1].value = field.value || ""; // Set value value
            }

            // Add remove button functionality
            const removeButton = newField.querySelector(".remove-field");
            if (removeButton) {
              removeButton.addEventListener("click", removeInfoField);
            }

            // Add the populated field to the form
            editInfoTableFields.appendChild(newField);
          });
        }

        // Clear existing content sections before parsing and populating
        editContentSections.innerHTML = "";

        // Parse content HTML to recreate content sections
        parseAndPopulateContent(wiki.content, editContentSections);
      })
      .catch((error) => {
        console.error("Error loading wiki:", error);
        let errorMessage = "An error occurred while loading the wiki.";

        // Provide more specific error messages based on the error
        if (error.message.includes("404")) {
          errorMessage = "Wiki not found. It may have been deleted.";
        } else if (
          error.message.includes("401") ||
          error.message.includes("403")
        ) {
          errorMessage =
            "You're not authorized to edit this wiki. Please log in again.";
        } else if (error.message.includes("non-JSON")) {
          errorMessage =
            "Server returned an invalid response. You may need to log in again.";
        }

        alert(errorMessage);
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
  if (closeEditPanel) {
    closeEditPanel.addEventListener("click", function () {
      editPanel.classList.remove("active");
      document.body.classList.remove("edit-panel-open");
      currentWikiId = null;
    });
  }

  /**
   * Form submission for editing a wiki
   */
  if (editWikiForm) {
    editWikiForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate form
      if (!validateForm(this)) {
        alert("Please fill in all required fields before submitting.");
        return;
      }

      // Create FormData object
      const formData = new FormData(this);

      // Add section order and types for maintaining content order
      const sections = document
        .getElementById("editContentSections")
        .querySelectorAll(".content-section");
      let sectionIndex = 0;

      sections.forEach((section) => {
        // Track the type and order of each section
        if (section.classList.contains("paragraph-section")) {
          formData.append("sectionTypes", "paragraph");
          formData.append("sectionOrder", sectionIndex);
        } else if (section.classList.contains("image-section")) {
          formData.append("sectionTypes", "image");
          formData.append("sectionOrder", sectionIndex);
        }
        sectionIndex++;
      });

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
          // Check if response is ok before parsing
          if (!response.ok) {
            // Check for authentication errors specifically
            if (response.status === 401 || response.status === 403) {
              // If authentication is required, we can detect the specific response
              return response.text().then((text) => {
                try {
                  const json = JSON.parse(text);
                  // If there's a redirectUrl, we can use it
                  if (json.redirectUrl && json.redirectUrl.includes("/login")) {
                    throw new Error(
                      "Your session has expired. Please log in again."
                    );
                  }
                  throw new Error(
                    json.message || "Authentication error. Please log in again."
                  );
                } catch (e) {
                  if (e instanceof SyntaxError) {
                    // If we can't parse JSON, it might be HTML redirect page
                    if (text.includes("<html") && text.includes("login")) {
                      throw new Error(
                        "Your session has expired. Please log in again."
                      );
                    }
                    throw new Error(
                      "Authentication required. Please log in again."
                    );
                  }
                  throw e;
                }
              });
            }

            // Handle other non-OK responses
            return response.text().then((text) => {
              try {
                const json = JSON.parse(text);
                throw new Error(
                  json.message ||
                    `Error: ${response.status} ${response.statusText}`
                );
              } catch (e) {
                if (e instanceof SyntaxError) {
                  console.error("Server response:", text);
                  if (text.includes("<html")) {
                    throw new Error(
                      "Server returned an HTML page instead of JSON. You may need to log in again."
                    );
                  }
                  throw new Error(
                    `Server error (${response.status}). Please try again later.`
                  );
                }
                throw e;
              }
            });
          }

          // Handle successful response
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return response.json();
          }

          // Handle potential HTML or text responses
          return response.text().then((text) => {
            try {
              return JSON.parse(text);
            } catch (e) {
              if (text.includes("<html") && text.includes("redirect")) {
                return { success: true };
              }
              console.error("Invalid JSON response:", text);
              throw new Error("Server returned an unexpected response format.");
            }
          });
        })
        .then((data) => {
          // Show success message
          alert("Wiki updated successfully!");

          // Close edit panel
          editPanel.classList.remove("active");
          document.body.classList.remove("edit-panel-open");

          // Refresh the page to show the updated wiki in the list
          window.location.reload();
        })
        .catch((error) => {
          // Reset button state
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;

          console.error("Error updating wiki:", error);

          // Check if it's a session timeout/login error
          if (
            error.message.includes("session") ||
            error.message.includes("log in") ||
            error.message.includes("Authentication")
          ) {
            alert(error.message);
            // Redirect to login page after a short delay
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 1500);
            return;
          }

          alert("There was a problem updating the wiki: " + error.message);
        });
    });
  }

  /**
   * Handle delete button click
   */
  if (deleteWikiBtn) {
    deleteWikiBtn.addEventListener("click", function (e) {
      e.preventDefault();
      deleteModal.classList.add("active");
    });
  }

  /**
   * Handle modal close button click
   */
  if (closeModal) {
    closeModal.addEventListener("click", function () {
      deleteModal.classList.remove("active");
    });
  }

  /**
   * Handle cancel delete button click
   */
  if (cancelDelete) {
    cancelDelete.addEventListener("click", function () {
      deleteModal.classList.remove("active");
    });
  }

  /**
   * Handle confirm delete button click
   */
  if (confirmDelete) {
    confirmDelete.addEventListener("click", function () {
      if (!currentWikiId) return;

      // Show loading state
      confirmDelete.textContent = "Deleting...";
      confirmDelete.disabled = true;

      // Send delete request
      fetch(`/api/wiki/${currentWikiId}/delete`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            // Check for authentication issues
            if (response.status === 401 || response.status === 403) {
              return response.text().then((text) => {
                try {
                  const json = JSON.parse(text);
                  if (json.redirectUrl && json.redirectUrl.includes("/login")) {
                    throw new Error(
                      "Your session has expired. Please log in again."
                    );
                  }
                  throw new Error(
                    json.message || "Authentication error. Please log in again."
                  );
                } catch (e) {
                  if (e instanceof SyntaxError && text.includes("login")) {
                    throw new Error(
                      "Your session has expired. Please log in again."
                    );
                  }
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
              });
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          // Check content type for JSON responses
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return response.json();
          }

          // Handle non-JSON responses
          return response.text().then((text) => {
            try {
              return JSON.parse(text);
            } catch (e) {
              if (text.includes("success") || text.includes("deleted")) {
                return { success: true };
              }
              console.error("Invalid JSON response:", text);
              throw new Error("Server returned an unexpected response format.");
            }
          });
        })
        .then((data) => {
          // Hide modal
          deleteModal.classList.remove("active");

          // Show success message
          alert("Wiki deleted successfully!");

          // Refresh the page to update the wiki list
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error deleting wiki:", error);

          // Check if it's a session timeout/login error
          if (
            error.message.includes("session") ||
            error.message.includes("log in") ||
            error.message.includes("Authentication")
          ) {
            alert(error.message);
            // Redirect to login page after a short delay
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 1500);
            return;
          }

          alert("An error occurred while deleting the wiki: " + error.message);
        })
        .finally(() => {
          // Reset button state
          confirmDelete.textContent = "Delete";
          confirmDelete.disabled = false;
        });
    });
  }

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

    // Add section order and types for maintaining content order
    const contentSections =
      newsContentSections.querySelectorAll(".content-section");
    let sectionIndex = 0;

    contentSections.forEach((section) => {
      // Track the type and order of each section
      if (section.classList.contains("paragraph-section")) {
        formData.append("sectionTypes", "paragraph");
        formData.append("sectionOrder", sectionIndex);
      } else if (section.classList.contains("image-section")) {
        formData.append("sectionTypes", "image");
        formData.append("sectionOrder", sectionIndex);
      }
      sectionIndex++;
    });

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
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            if (
              response.status === 400 &&
              data.message === "A news article with this URL already exists"
            ) {
              throw new Error(
                "A news article with this URL already exists. Please use a different title"
              );
            }
            throw new Error(
              data.message || `HTTP error! Status: ${response.status}`
            );
          }
          return data;
        });
      })
      .then((data) => {
        if (data.success) {
          // Show success message
          alert("News article created successfully!");

          // Reset the form inputs
          newsForm.reset();

          // Clear the content sections
          newsContentSections.innerHTML = "";

          // Reset the info image preview
          newsInfoImagePreview.innerHTML =
            '<i class="fas fa-image"></i><span>No image selected</span>';

          // Clear info fields
          newsInfoTableFields.innerHTML = "";

          // Refresh the page to show the new article in the list
          window.location.reload();
        } else {
          // Show error message
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(
          error.message || "An error occurred while creating the news article."
        );
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

    // Check if editNewsPanel exists first to prevent null reference error
    const editNewsPanel = document.getElementById("edit-news-panel");
    if (!editNewsPanel) {
      console.error("Edit news panel element not found in the DOM");
      alert("Could not open the editor. Please try refreshing the page.");
      return;
    }

    // Show loading state
    editNewsPanel.classList.add("active");
    document.body.classList.add("edit-panel-open");

    // Check if other required elements exist
    const editNewsContentSections = document.getElementById(
      "editNewsContentSections"
    );
    if (!editNewsContentSections) {
      console.error("editNewsContentSections element not found");
      alert("Editor is missing required elements. Please refresh the page.");
      return;
    }

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

        // Safely set form values with null checks
        const editNewsId = document.getElementById("editNewsId");
        const editNewsTitle = document.getElementById("editNewsTitle");
        const editNewsUrlSlug = document.getElementById("editNewsUrlSlug");
        const editNewsCategory = document.getElementById("editNewsCategory");
        const editNewsPublishDate = document.getElementById(
          "editNewsPublishDate"
        );
        const editNewsFeatured = document.getElementById("editNewsFeatured");
        const editNewsInfoImagePreview = document.getElementById(
          "editNewsInfoImagePreview"
        );
        const editNewsInfoTableFields = document.getElementById(
          "editNewsInfoTableFields"
        );

        // Only set values for elements that exist
        if (editNewsId) editNewsId.value = newsId;
        if (editNewsTitle) editNewsTitle.value = news.title || "";
        if (editNewsUrlSlug) editNewsUrlSlug.value = news.urlSlug || "";
        if (editNewsCategory) editNewsCategory.value = news.category || "";

        // Format and set publish date
        if (editNewsPublishDate && news.publishDate) {
          const publishDate = new Date(news.publishDate);
          editNewsPublishDate.value = publishDate.toISOString().split("T")[0];
        } else if (editNewsPublishDate) {
          editNewsPublishDate.value = "";
        }

        // Set featured checkbox
        if (editNewsFeatured) {
          editNewsFeatured.checked = news.featured || false;
        }

        // Set info image preview
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

        // Clear and populate info fields
        if (editNewsInfoTableFields) {
          editNewsInfoTableFields.innerHTML = "";
          if (news.infoFields && news.infoFields.length > 0) {
            news.infoFields.forEach((field) => {
              // Create a temporary container to hold the template
              const tempContainer = document.createElement("div");
              tempContainer.innerHTML = infoFieldTemplate;

              // Get the template element
              const newField = tempContainer.firstElementChild;

              // Set the values
              const inputs = newField.querySelectorAll("input");
              if (inputs.length >= 2) {
                inputs[0].value = field.label || ""; // Set label value
                inputs[1].value = field.value || ""; // Set value value
              }

              // Add remove button functionality
              const removeButton = newField.querySelector(".remove-field");
              if (removeButton) {
                removeButton.addEventListener("click", removeInfoField);
              }

              // Add the populated field to the form
              editNewsInfoTableFields.appendChild(newField);
            });
          }
        }

        // Parse HTML content to extract subtitles, paragraphs and images
        if (news.content && editNewsContentSections) {
          // Create a temporary container to parse the HTML
          const tempContainer = document.createElement("div");
          tempContainer.innerHTML = news.content;

          // Process the content in a more structured way, similar to wiki parsing
          let currentSubtitle = "";
          let currentParagraph = "";

          // Process each child node
          Array.from(tempContainer.childNodes).forEach((node) => {
            // Handle headings (subtitles)
            if (node.nodeName === "H2") {
              // If we have a paragraph, add it first
              if (currentParagraph) {
                addParagraphWithContent(
                  editNewsContentSections,
                  currentSubtitle,
                  currentParagraph
                );
                currentSubtitle = "";
                currentParagraph = "";
              }

              // Store the subtitle
              currentSubtitle = node.textContent;
            }
            // Handle paragraphs
            else if (
              node.nodeName === "P" &&
              !node.parentNode.classList?.contains("article-image") &&
              !node.parentNode.classList?.contains("content-image")
            ) {
              // If we already have a paragraph, add it first
              if (currentParagraph) {
                addParagraphWithContent(
                  editNewsContentSections,
                  currentSubtitle,
                  currentParagraph
                );
                currentSubtitle = "";
                currentParagraph = "";
              }

              // Store the paragraph
              currentParagraph = node.textContent;
            }
            // Handle images (both article-image and content-image classes)
            else if (
              node.nodeName === "DIV" &&
              (node.classList.contains("article-image") ||
                node.classList.contains("content-image"))
            ) {
              // If we have a paragraph, add it first
              if (currentParagraph) {
                addParagraphWithContent(
                  editNewsContentSections,
                  currentSubtitle,
                  currentParagraph
                );
                currentSubtitle = "";
                currentParagraph = "";
              }

              // Add image section
              const img = node.querySelector("img");
              const caption = node.querySelector(".image-caption");

              if (img) {
                addImageWithContent(
                  editNewsContentSections,
                  img.src,
                  caption ? caption.textContent : ""
                );
              }
            }
          });

          // Add any remaining paragraph
          if (currentParagraph) {
            addParagraphWithContent(
              editNewsContentSections,
              currentSubtitle,
              currentParagraph
            );
          }
        } else if (editNewsContentSections) {
          // Add at least one paragraph section if no content exists
          addParagraphToContainer(editNewsContentSections);
        }
      })
      .catch((error) => {
        console.error("Error loading news article:", error);
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

    // Add section order and types for maintaining content order
    const contentSections =
      editNewsContentSections.querySelectorAll(".content-section");
    let sectionIndex = 0;

    contentSections.forEach((section) => {
      // Track the type and order of each section
      if (section.classList.contains("paragraph-section")) {
        formData.append("sectionTypes", "paragraph");
        formData.append("sectionOrder", sectionIndex);
      } else if (section.classList.contains("image-section")) {
        formData.append("sectionTypes", "image");
        formData.append("sectionOrder", sectionIndex);
      }
      sectionIndex++;
    });

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

  // Also listen for dynamically created edit buttons
  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("edit-wiki-btn") ||
      e.target.closest(".edit-wiki-btn")
    ) {
      const button = e.target.classList.contains("edit-wiki-btn")
        ? e.target
        : e.target.closest(".edit-wiki-btn");
      const wikiId = button.getAttribute("data-id");
      openEditPanel(wikiId);
    }
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
