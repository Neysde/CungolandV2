/**
 * ÇüngoWiki JavaScript
 * Handles wiki card interactions and navigation
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the wiki cards
  initWikiCards();

  /**
   * Initialize wiki cards by adding click event listeners
   */
  function initWikiCards() {
    // Get all wiki cards
    const wikiCards = document.querySelectorAll(".wiki-card");

    // Add click event listener to each card
    wikiCards.forEach((card) => {
      card.addEventListener("click", handleWikiCardClick);
    });
  }

  /**
   * Handle wiki card click event
   * @param {Event} event - The click event
   */
  function handleWikiCardClick(event) {
    // Get the wiki slug from the card's data attribute
    const wikiSlug = this.getAttribute("data-slug");

    // If the slug exists, navigate to the wiki page
    if (wikiSlug) {
      window.location.href = `/wiki/${wikiSlug}`;
    }
  }
});
