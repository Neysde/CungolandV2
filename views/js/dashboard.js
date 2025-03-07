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

  // DOM Elements - Delete Modal
  const deleteModal = document.getElementById("deleteModal");
  const closeModal = document.querySelector(".close-modal");
  const cancelDelete = document.getElementById("cancelDelete");
  const confirmDelete = document.getElementById("confirmDelete");

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
    currentWikiId = wikiId;

    // Show loading state
    editPanel.classList.add("active");

    // Prevent body scrolling
    document.body.classList.add("edit-panel-open");

    // Store a reference to the edit form
    const editFormContainer = document.querySelector(".edit-panel-content");

    // Show loading indicator
    editWikiForm.innerHTML =
      '<div class="loading" style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i><p>Loading wiki data...</p></div>';

    // Fetch wiki data without logging
    fetch(`/api/wiki/${wikiId}/data`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            try {
              const json = JSON.parse(text);
              throw new Error(json.message || "Failed to fetch wiki data");
            } catch (e) {
              throw new Error(
                `Failed to fetch wiki data: ${response.status} ${response.statusText}`
              );
            }
          });
        }

        return response.text().then((text) => {
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error("Invalid JSON response from server");
          }
        });
      })
      .then((wiki) => {
        // Check if the wiki data is valid
        if (!wiki || typeof wiki !== "object") {
          throw new Error("Invalid wiki data received");
        }

        // Recreate the edit form with the correct structure
        editWikiForm.innerHTML = `
          <!-- Hidden Wiki ID -->
          <input type="hidden" id="editWikiId" name="wikiId" value="${
            wiki._id
          }">
          
          <!-- Wiki Title Section -->
          <div class="form-section">
            <h3>Title</h3>
            <div class="form-group">
              <label for="editWikiTitle">Main Title</label>
              <input type="text" id="editWikiTitle" name="title" required placeholder="Enter wiki title" value="${
                wiki.title || ""
              }">
              <!-- Hidden input for URL slug -->
              <input type="hidden" id="editWikiUrlSlug" name="urlSlug" value="${
                wiki.urlSlug || ""
              }">
            </div>
          </div>

          <!-- Info Table Section -->
          <div class="form-section">
            <h3>Info Table</h3>
            
            <!-- Info Table Image Upload -->
            <div class="form-group">
              <label for="editInfoImage">Info Table Image</label>
              <div class="image-upload-container">
                <div class="image-preview" id="editInfoImagePreview">
                  ${
                    wiki.infoImage && wiki.infoImage.url
                      ? `<img src="${wiki.infoImage.url}" alt="${
                          wiki.infoImage.alt || wiki.title
                        }">`
                      : `<i class="fas fa-image"></i><span>No image selected</span>`
                  }
                </div>
                <div class="image-upload-controls">
                  <label class="upload-btn">
                    <i class="fas fa-upload"></i> Upload New Image
                    <input type="file" id="editInfoImage" name="infoImage" accept="image/*" hidden>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Info Table Fields -->
            <div class="form-group">
              <label>Info Table Fields</label>
              <div id="editInfoTableFields" class="info-table-fields">
                <!-- Will be populated dynamically -->
              </div>
              <button type="button" id="editAddInfoField" class="add-field-btn">
                <i class="fas fa-plus"></i> Add Field
              </button>
            </div>
          </div>

          <!-- Content Section -->
          <div class="form-section">
            <h3>Content</h3>
            
            <div id="editContentSections" class="content-sections">
              <!-- Will be populated dynamically -->
            </div>
            
            <!-- Add Content Controls -->
            <div class="add-content-controls">
              <button type="button" id="editAddParagraph" class="add-content-btn">
                <i class="fas fa-paragraph"></i> Add Paragraph
              </button>
              <button type="button" id="editAddImage" class="add-content-btn">
                <i class="fas fa-image"></i> Add Image
              </button>
            </div>
          </div>

          <!-- Submit Section -->
          <div class="form-actions">
            <button type="button" id="deleteWiki" class="delete-btn">
              <i class="fas fa-trash"></i> Delete Wiki
            </button>
            <button type="submit" class="submit-btn">Save Changes</button>
          </div>
        `;

        // Get references to the newly created elements
        const editWikiId = document.getElementById("editWikiId");
        const editWikiTitle = document.getElementById("editWikiTitle");
        const editWikiUrlSlug = document.getElementById("editWikiUrlSlug");
        const editInfoImage = document.getElementById("editInfoImage");
        const editInfoImagePreview = document.getElementById(
          "editInfoImagePreview"
        );
        const editInfoTableFields = document.getElementById(
          "editInfoTableFields"
        );
        const editContentSections = document.getElementById(
          "editContentSections"
        );
        const editAddInfoField = document.getElementById("editAddInfoField");
        const editAddParagraph = document.getElementById("editAddParagraph");
        const editAddImage = document.getElementById("editAddImage");
        const deleteWikiBtn = document.getElementById("deleteWiki");

        // Attach event listeners
        if (editWikiTitle) {
          editWikiTitle.addEventListener("input", function () {
            const title = this.value;
            const slug = generateSlug(title);
            if (editWikiUrlSlug) {
              editWikiUrlSlug.value = slug;
            }
          });
        }

        if (editInfoImage) {
          editInfoImage.addEventListener("change", function () {
            if (editInfoImagePreview) {
              handleImageUpload(this, editInfoImagePreview);
            }
          });
        }

        if (editAddInfoField) {
          editAddInfoField.addEventListener("click", function () {
            if (editInfoTableFields) {
              addInfoFieldToContainer(editInfoTableFields);
            }
          });
        }

        if (editAddParagraph) {
          editAddParagraph.addEventListener("click", function () {
            if (editContentSections) {
              addParagraphToContainer(editContentSections);
            }
          });
        }

        if (editAddImage) {
          editAddImage.addEventListener("click", function () {
            if (editContentSections) {
              addImageToContainer(editContentSections);
            }
          });
        }

        if (deleteWikiBtn) {
          deleteWikiBtn.addEventListener("click", function (e) {
            e.preventDefault();
            deleteModal.classList.add("active");
          });
        }

        // Populate info table fields
        if (
          editInfoTableFields &&
          wiki.infoFields &&
          wiki.infoFields.length > 0
        ) {
          wiki.infoFields.forEach((field) => {
            const tempContainer = document.createElement("div");
            tempContainer.innerHTML = infoFieldTemplate;

            const newField = tempContainer.firstElementChild;
            const inputs = newField.querySelectorAll("input");
            if (inputs.length >= 2) {
              inputs[0].value = field.label || "";
              inputs[1].value = field.value || "";
            }

            const removeButton = newField.querySelector(".remove-field");
            if (removeButton) {
              removeButton.addEventListener("click", removeInfoField);
            }

            editInfoTableFields.appendChild(newField);
          });
        }

        // Parse and populate content
        if (editContentSections && wiki.content) {
          parseAndPopulateContent(wiki.content, editContentSections);
        }

        // If no content sections were added, add a default paragraph section
        if (editContentSections && editContentSections.children.length === 0) {
          addParagraphToContainer(editContentSections);
        }
      })
      .catch((error) => {
        // Only log errors to console
        console.error("Error in edit panel:", error.message);

        editWikiForm.innerHTML = `
          <div class="error" style="text-align: center; padding: 2rem; color: var(--danger-color);">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>${error.message}</p>
            <button id="close-error" class="cancel-btn" style="margin-top: 1rem;">Close</button>
          </div>
        `;

        // Add event listener to close button
        const closeErrorBtn = document.getElementById("close-error");
        if (closeErrorBtn) {
          closeErrorBtn.addEventListener("click", function () {
            editPanel.classList.remove("active");
            document.body.classList.remove("edit-panel-open");
          });
        }
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
   * Add paragraph section with content
   * @param {HTMLElement} container - The container to add the paragraph to
   * @param {string} subtitle - The subtitle
   * @param {string} paragraph - The paragraph content
   */
  function addParagraphWithContent(container, subtitle, paragraph) {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = paragraphTemplate.replace(
      /{index}/g,
      sectionCounter++
    );

    const newSection = tempContainer.firstElementChild;
    const subtitleInput = newSection.querySelector('input[name="subtitles[]"]');
    const paragraphTextarea = newSection.querySelector(
      'textarea[name="paragraphs[]"]'
    );

    if (subtitleInput) subtitleInput.value = subtitle;
    if (paragraphTextarea) paragraphTextarea.value = paragraph;

    const removeButton = newSection.querySelector(".remove-section");
    if (removeButton) {
      removeButton.addEventListener("click", removeContentSection);
    }

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
});
