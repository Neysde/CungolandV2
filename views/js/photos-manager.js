/**
 * Photos Manager JavaScript
 * Handles photo uploads, editing, and deletion
 */

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const photoForm = document.getElementById("photoForm");
  const photoPreview = document.getElementById("photoPreview");
  const photoInput = document.getElementById("photoInput");
  const descriptionInput = document.getElementById("photoDescription");
  const photosList = document.getElementById("photosList");
  const uploadBtn = document.getElementById("uploadBtn");

  // Photo preview functionality
  if (photoInput) {
    photoInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
          photoPreview.classList.add("has-image");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Photo upload functionality
  if (photoForm) {
    photoForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Validate form
      if (!photoInput.files.length) {
        showAlert("Please select an image to upload", "error");
        return;
      }

      if (!descriptionInput.value.trim()) {
        showAlert("Please enter a description", "error");
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append("image", photoInput.files[0]);
      formData.append("description", descriptionInput.value.trim());

      // Show loading state
      uploadBtn.disabled = true;
      uploadBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Uploading...';

      try {
        // Send request to server
        const response = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          // Reset form
          photoForm.reset();
          photoPreview.innerHTML = '<i class="fas fa-image"></i>';
          photoPreview.classList.remove("has-image");

          // Show success message
          showAlert("Photo uploaded successfully", "success");

          // Refresh photos list
          fetchPhotos();
        } else {
          showAlert(data.message || "Failed to upload photo", "error");
        }
      } catch (error) {
        console.error("Upload error:", error);
        showAlert("An error occurred while uploading the photo", "error");
      } finally {
        // Reset button state
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = "Upload Photo";
      }
    });
  }

  // Fetch and display photos
  async function fetchPhotos() {
    if (!photosList) return;

    try {
      const response = await fetch("/api/photos");
      const photos = await response.json();

      if (photos.length === 0) {
        photosList.innerHTML = `
          <div class="no-photos-message">
            <i class="fas fa-images"></i>
            <p>No photos have been uploaded yet</p>
          </div>
        `;
        return;
      }

      // Render photos
      photosList.innerHTML = photos
        .map(
          (photo) => `
        <div class="photo-item" data-id="${photo._id}">
          <div class="photo-item-image">
            <img src="${photo.imageUrl}" alt="Çüngoland Photo">
          </div>
          <div class="photo-item-content">
            <div class="photo-item-description">${photo.description}</div>
            <div class="photo-item-date">
              ${new Date(photo.createdAt).toLocaleDateString()}
            </div>
            <div class="photo-item-actions">
              <button class="edit-photo-btn" data-id="${photo._id}">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="delete-photo-btn" data-id="${photo._id}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      `
        )
        .join("");

      // Add event listeners to edit and delete buttons
      document.querySelectorAll(".edit-photo-btn").forEach((btn) => {
        btn.addEventListener("click", handleEditPhoto);
      });

      document.querySelectorAll(".delete-photo-btn").forEach((btn) => {
        btn.addEventListener("click", handleDeletePhoto);
      });
    } catch (error) {
      console.error("Error fetching photos:", error);
      photosList.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load photos</p>
        </div>
      `;
    }
  }

  // Handle edit photo
  async function handleEditPhoto(e) {
    const photoId = e.currentTarget.dataset.id;
    const photoItem = e.currentTarget.closest(".photo-item");
    const descriptionEl = photoItem.querySelector(".photo-item-description");
    const currentDescription = descriptionEl.textContent;

    // Create edit form
    const originalContent = photoItem.innerHTML;
    photoItem.innerHTML = `
      <div class="edit-photo-form">
        <div class="photo-item-image">
          <img src="${
            photoItem.querySelector("img").src
          }" alt="Çüngoland Photo">
        </div>
        <div class="form-group">
          <label for="editDescription">Description</label>
          <textarea id="editDescription" class="form-control">${currentDescription}</textarea>
        </div>
        <div class="edit-actions">
          <button class="save-edit-btn">Save Changes</button>
          <button class="cancel-edit-btn">Cancel</button>
        </div>
      </div>
    `;

    // Add event listeners to save and cancel buttons
    photoItem
      .querySelector(".save-edit-btn")
      .addEventListener("click", async () => {
        const newDescription = photoItem
          .querySelector("#editDescription")
          .value.trim();

        if (!newDescription) {
          showAlert("Description cannot be empty", "error");
          return;
        }

        try {
          const response = await fetch(`/api/photos/${photoId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ description: newDescription }),
          });

          const data = await response.json();

          if (response.ok) {
            // Update the description in the DOM
            photoItem.innerHTML = originalContent;
            photoItem.querySelector(".photo-item-description").textContent =
              newDescription;

            // Show success message
            showAlert("Photo updated successfully", "success");
          } else {
            showAlert(data.message || "Failed to update photo", "error");
            photoItem.innerHTML = originalContent;
          }
        } catch (error) {
          console.error("Update error:", error);
          showAlert("An error occurred while updating the photo", "error");
          photoItem.innerHTML = originalContent;
        }
      });

    photoItem
      .querySelector(".cancel-edit-btn")
      .addEventListener("click", () => {
        photoItem.innerHTML = originalContent;
        // Re-add event listeners
        photoItem
          .querySelector(".edit-photo-btn")
          .addEventListener("click", handleEditPhoto);
        photoItem
          .querySelector(".delete-photo-btn")
          .addEventListener("click", handleDeletePhoto);
      });
  }

  // Handle delete photo
  async function handleDeletePhoto(e) {
    if (
      !confirm(
        "Are you sure you want to delete this photo? This action cannot be undone."
      )
    ) {
      return;
    }

    const photoId = e.currentTarget.dataset.id;
    const photoItem = e.currentTarget.closest(".photo-item");

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the photo from the DOM
        photoItem.remove();

        // Show success message
        showAlert("Photo deleted successfully", "success");

        // Check if there are no photos left
        if (photosList.children.length === 0) {
          photosList.innerHTML = `
            <div class="no-photos-message">
              <i class="fas fa-images"></i>
              <p>No photos have been uploaded yet</p>
            </div>
          `;
        }
      } else {
        const data = await response.json();
        showAlert(data.message || "Failed to delete photo", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showAlert("An error occurred while deleting the photo", "error");
    }
  }

  // Helper function to show alerts
  function showAlert(message, type) {
    const alertContainer = document.getElementById("alertContainer");
    if (!alertContainer) return;

    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <span>${message}</span>
      <button class="close-alert">&times;</button>
    `;

    alertContainer.appendChild(alert);

    // Add event listener to close button
    alert.querySelector(".close-alert").addEventListener("click", () => {
      alert.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  // Initialize
  if (photosList) {
    fetchPhotos();
  }
});
