/**
 * index.js - Main Page JavaScript
 * Handles the image carousel functionality and card interactions
 */

// Initialize all functionality when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the image carousel
  initCarousel();

  // Initialize card click events
  initCardEvents();
});

/**
 * Initialize the image carousel with automatic sliding and manual controls
 */
function initCarousel() {
  const carouselContainer = document.querySelector(".carousel-container");
  const carouselSlides = document.querySelectorAll(".carousel-slide");
  const prevButton = document.querySelector(".carousel-control.prev");
  const nextButton = document.querySelector(".carousel-control.next");
  const carousel = document.querySelector(".image-carousel");

  // Exit if there are no slides or controls
  if (
    !carouselSlides.length ||
    !prevButton ||
    !nextButton ||
    !carouselContainer
  )
    return;

  let currentSlideIndex = 0;
  let slideInterval;
  const autoSlideDelay = 5000; // 5 seconds between slides
  let isAnimating = false; // Flag to prevent multiple animations at once

  // Function to go to a specific slide with animation
  function goToSlide(index) {
    if (isAnimating) return;
    isAnimating = true;

    // Update indicators
    document.querySelectorAll(".carousel-indicator").forEach((indicator, i) => {
      indicator.classList.toggle("active", i === index);
    });

    // Update current slide index
    currentSlideIndex = index;

    // Apply transform to show the current slide
    carouselContainer.style.transform = `translateX(-${
      currentSlideIndex * 100
    }%)`;

    // Reset animation flag after transition
    setTimeout(() => {
      isAnimating = false;
    }, 500); // Match this to the CSS transition duration
  }

  // Function to go to the next slide
  function nextSlide() {
    const newIndex = (currentSlideIndex + 1) % carouselSlides.length;
    goToSlide(newIndex);
  }

  // Function to go to the previous slide
  function prevSlide() {
    const newIndex =
      (currentSlideIndex - 1 + carouselSlides.length) % carouselSlides.length;
    goToSlide(newIndex);
  }

  // Start automatic sliding
  function startAutoSlide() {
    // Clear any existing interval
    clearInterval(slideInterval);
    // Set new interval
    slideInterval = setInterval(nextSlide, autoSlideDelay);
  }

  // Event listeners for manual controls
  nextButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!isAnimating) {
      nextSlide();
      startAutoSlide(); // Reset the automatic sliding timer
    }
  });

  prevButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!isAnimating) {
      prevSlide();
      startAutoSlide(); // Reset the automatic sliding timer
    }
  });

  // Pause automatic sliding when hovering over the carousel
  carousel.addEventListener("mouseenter", () => {
    clearInterval(slideInterval);
  });

  carousel.addEventListener("mouseleave", () => {
    startAutoSlide();
  });

  // Handle keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      if (!isAnimating) {
        prevSlide();
        startAutoSlide();
      }
    } else if (e.key === "ArrowRight") {
      if (!isAnimating) {
        nextSlide();
        startAutoSlide();
      }
    }
  });

  // Initialize the first slide and start automatic sliding
  startAutoSlide();
}

/**
 * Initialize click events for wiki and news cards
 */
function initCardEvents() {
  // Wiki cards click events
  const wikiCards = document.querySelectorAll(".wiki-card");
  wikiCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Stop propagation to prevent conflicts with header click events
      e.stopPropagation();

      const slug = card.getAttribute("data-slug");
      if (slug) {
        window.location.href = `/wiki/${slug}`;
      }
    });
  });

  // News cards click events
  const newsCards = document.querySelectorAll(".news-card");
  newsCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Stop propagation to prevent conflicts with header click events
      e.stopPropagation();

      const slug = card.getAttribute("data-slug");
      if (slug) {
        window.location.href = `/news/${slug}`;
      }
    });
  });
}
