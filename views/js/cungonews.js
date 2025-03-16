/**
 * ÇüngoNews JavaScript
 * Handles news card interactions, navigation, and category filtering
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the news cards
  initNewsCards();

  // Initialize category filters if they exist
  initCategoryFilters();

  /**
   * Initialize news cards by adding click event listeners
   */
  function initNewsCards() {
    // Get all news cards
    const newsCards = document.querySelectorAll(".news-card");

    // Add click event listener to each card
    newsCards.forEach((card) => {
      card.addEventListener("click", handleNewsCardClick);
    });
  }

  /**
   * Handle news card click event
   * @param {Event} event - The click event
   */
  function handleNewsCardClick(event) {
    // Get the news slug from the card's data attribute
    const newsSlug = this.getAttribute("data-slug");

    // If the slug exists, navigate to the news page
    if (newsSlug) {
      window.location.href = `/news/${newsSlug}`;
    }
  }

  /**
   * Initialize category filter buttons
   */
  function initCategoryFilters() {
    // Get all category filter buttons
    const categoryButtons = document.querySelectorAll(".category-btn");

    // If no buttons exist, return
    if (categoryButtons.length === 0) return;

    // Add click event listener to each button
    categoryButtons.forEach((button) => {
      button.addEventListener("click", handleCategoryFilter);
    });
  }

  /**
   * Handle category filter button click
   * @param {Event} event - The click event
   */
  function handleCategoryFilter(event) {
    // Get all category buttons and remove active class
    const categoryButtons = document.querySelectorAll(".category-btn");
    categoryButtons.forEach((btn) => btn.classList.remove("active"));

    // Add active class to clicked button
    this.classList.add("active");

    // Get the category from the button's data attribute
    const category = this.getAttribute("data-category");

    // Get all news cards
    const newsCards = document.querySelectorAll(".news-card");

    // If "all" category is selected, show all cards
    if (category === "all") {
      newsCards.forEach((card) => {
        card.style.display = "block";
      });
      return;
    }

    // Otherwise, filter cards by category
    newsCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category");
      if (cardCategory === category) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }
});
