/**
 * ÇüngoTwitter JavaScript
 * Handles tweet creation, editing, deletion, and UI interactions
 */

document.addEventListener("DOMContentLoaded", function () {
  // Character counter for tweet text
  setupCharacterCounter();

  // Image upload preview
  setupImageUpload();

  // Tweet form submission
  setupTweetForm();

  // Tweet editing and deletion
  setupTweetActions();

  // Like button functionality
  setupLikeButtons();
});

/**
 * Sets up character counter for tweet text areas
 */
function setupCharacterCounter() {
  // Get all tweet text areas
  const tweetTextAreas = document.querySelectorAll(
    "#tweetText, #editTweetText"
  );

  tweetTextAreas.forEach((textarea) => {
    // Update character count on input
    textarea.addEventListener("input", function () {
      const maxLength = this.getAttribute("maxlength");
      const currentLength = this.value.length;
      const remainingChars = maxLength - currentLength;

      // Find the character count element (next sibling small element)
      const countDisplay = this.nextElementSibling;

      if (countDisplay && countDisplay.classList.contains("character-count")) {
        countDisplay.textContent = `${remainingChars} characters remaining`;

        // Change color when getting close to limit
        if (remainingChars <= 20) {
          countDisplay.style.color = "#e0245e"; // Red when close to limit
        } else {
          countDisplay.style.color = ""; // Reset to default
        }
      }
    });
  });
}

/**
 * Sets up image upload preview functionality
 */
function setupImageUpload() {
  // Tweet image upload
  const tweetImageInput = document.getElementById("tweetImage");
  const imagePreview = document.getElementById("tweetImagePreview");
  const removeImageBtn = document.getElementById("removeImage");

  if (tweetImageInput && imagePreview) {
    // Show preview when image is selected
    tweetImageInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
          // Clear preview
          imagePreview.innerHTML = "";

          // Create image element
          const img = document.createElement("img");
          img.src = e.target.result;
          img.alt = "Tweet image preview";

          // Add image to preview
          imagePreview.appendChild(img);

          // Show remove button
          if (removeImageBtn) {
            removeImageBtn.style.display = "inline-flex";
          }
        };

        reader.readAsDataURL(this.files[0]);
      }
    });

    // Remove image functionality
    if (removeImageBtn) {
      removeImageBtn.addEventListener("click", function () {
        // Clear file input
        tweetImageInput.value = "";

        // Reset preview
        imagePreview.innerHTML = `
          <i class="fas fa-image"></i>
          <p>No image selected</p>
        `;

        // Hide remove button
        this.style.display = "none";
      });
    }
  }
}

/**
 * Sets up tweet form submission
 */
function setupTweetForm() {
  const tweetForm = document.getElementById("tweetForm");

  if (tweetForm) {
    // Make sure the form submits normally without JavaScript interference
    // We'll just add some visual feedback
    tweetForm.addEventListener("submit", function () {
      const submitBtn = this.querySelector(".submit-btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Posting...';
      }

      // Let the form submit naturally
      return true;
    });
  }
}

/**
 * Sets up tweet editing and deletion functionality
 */
function setupTweetActions() {
  // Edit tweet buttons
  const editButtons = document.querySelectorAll(".edit-tweet-btn");
  const editModal = document.getElementById("editTweetModal");
  const editForm = document.getElementById("editTweetForm");
  const updateBtn = document.getElementById("updateTweetBtn");

  // Delete tweet buttons
  const deleteButtons = document.querySelectorAll(".delete-tweet-btn");
  const deleteModal = document.getElementById("deleteTweetModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteTweet");

  // Close modal buttons
  const closeButtons = document.querySelectorAll(".close-modal, .cancel-btn");

  // Current tweet ID being edited or deleted
  let currentTweetId = null;

  // Edit tweet functionality
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get tweet ID
      currentTweetId = this.getAttribute("data-id");

      // Get tweet text (in a real app, you would fetch this from the server)
      // For now, we'll get it from the DOM
      const tweetCard = this.closest(".tweet-dashboard-card");
      const tweetText = tweetCard.querySelector(".tweet-text p").textContent;

      // Set text in edit form
      const editTextArea = document.getElementById("editTweetText");
      if (editTextArea) {
        editTextArea.value = tweetText;

        // Trigger input event to update character count
        const inputEvent = new Event("input", {
          bubbles: true,
          cancelable: true,
        });
        editTextArea.dispatchEvent(inputEvent);
      }

      // Show modal
      if (editModal) {
        editModal.classList.add("active");
      }
    });
  });

  // Update tweet functionality
  if (updateBtn) {
    updateBtn.addEventListener("click", function () {
      if (!currentTweetId || !editForm) return;

      // Get updated text
      const updatedText = document.getElementById("editTweetText").value;

      // Send update request to the server
      fetch(`/api/tweets/${currentTweetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: updatedText }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Update the text in the DOM
            const tweetCards = document.querySelectorAll(
              ".tweet-dashboard-card"
            );
            tweetCards.forEach((card) => {
              const editBtn = card.querySelector(".edit-tweet-btn");
              if (
                editBtn &&
                editBtn.getAttribute("data-id") === currentTweetId
              ) {
                const textElement = card.querySelector(".tweet-text p");
                if (textElement) {
                  textElement.textContent = updatedText;
                }
              }
            });

            // Close modal
            if (editModal) {
              editModal.classList.remove("active");
            }

            // Show success message
            alert("Tweet updated successfully!");
          } else {
            alert(`Error updating tweet: ${data.message}`);
          }
        })
        .catch((error) => {
          console.error("Error updating tweet:", error);
          alert("An error occurred while updating the tweet.");
        });
    });
  }

  // Delete tweet functionality
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get tweet ID
      currentTweetId = this.getAttribute("data-id");

      // Show modal
      if (deleteModal) {
        deleteModal.classList.add("active");
      }
    });
  });

  // Confirm delete functionality
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", function () {
      if (!currentTweetId) return;

      // Send delete request to the server
      fetch(`/api/tweets/${currentTweetId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Close modal first
            if (deleteModal) {
              deleteModal.classList.remove("active");
            }

            // Remove the tweet from the DOM
            const tweetCards = document.querySelectorAll(
              ".tweet-dashboard-card"
            );
            tweetCards.forEach((card) => {
              const deleteBtn = card.querySelector(".delete-tweet-btn");
              if (
                deleteBtn &&
                deleteBtn.getAttribute("data-id") === currentTweetId
              ) {
                card.remove();
              }
            });

            // Show success message
            alert("Tweet deleted successfully!");

            // Check if there are any tweets left
            const remainingTweets = document.querySelectorAll(
              ".tweet-dashboard-card"
            );
            if (remainingTweets.length === 0) {
              try {
                // Show no tweets message
                const tweetsContainer = document.querySelector(
                  ".tweets-dashboard-container"
                );
                if (tweetsContainer) {
                  // Create the no tweets message
                  const noTweetsMessage = document.createElement("div");
                  noTweetsMessage.className = "no-tweets-message";
                  noTweetsMessage.innerHTML = `
                    <i class="far fa-comment-dots"></i>
                    <p>You haven't posted any tweets yet. Create your first tweet above!</p>
                  `;

                  // Replace the tweets container with the no tweets message
                  const twitterManager =
                    document.querySelector(".twitter-manager");
                  if (twitterManager) {
                    // Remove the tweets container
                    tweetsContainer.remove();

                    // Find the first child of twitterManager
                    const firstChild = twitterManager.firstChild;

                    // Insert the no tweets message as the first child
                    if (
                      firstChild &&
                      firstChild.parentNode === twitterManager
                    ) {
                      // Double-check that firstChild is actually a child of twitterManager
                      twitterManager.insertBefore(noTweetsMessage, firstChild);
                    } else {
                      // Otherwise just append it to the end
                      twitterManager.appendChild(noTweetsMessage);
                    }
                  }
                }
              } catch (err) {
                console.error("Error showing no tweets message:", err);
              }
            }
          } else {
            alert(`Error deleting tweet: ${data.message}`);
          }
        })
        .catch((error) => {
          console.error("Error deleting tweet:", error);
          alert("An error occurred while deleting the tweet.");
        });
    });
  }

  // Close modals
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Close all modals
      const modals = document.querySelectorAll(".modal");
      modals.forEach((modal) => {
        modal.classList.remove("active");
      });

      // Reset current tweet ID
      currentTweetId = null;
    });
  });
}

/**
 * Sets up like button functionality
 */
function setupLikeButtons() {
  const likeButtons = document.querySelectorAll(".like-btn");

  likeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tweetId = this.getAttribute("data-id");
      const likeCountSpan = this.querySelector("span");

      // Send like request to the server
      fetch(`/api/tweets/${tweetId}/like`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Update the like count in the DOM
            likeCountSpan.textContent = data.likes;

            // Add a visual indication that the tweet was liked
            this.classList.add("liked");
            this.querySelector("i").classList.remove("far");
            this.querySelector("i").classList.add("fas");
          } else {
            console.error("Error liking tweet:", data.message);
          }
        })
        .catch((error) => {
          console.error("Error liking tweet:", error);
        });
    });
  });
}
