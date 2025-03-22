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

  // Create indicator dots for each slide
  const indicatorsContainer = document.createElement("div");
  indicatorsContainer.className = "carousel-indicators";

  carouselSlides.forEach((_, index) => {
    const indicator = document.createElement("div");
    indicator.className = `carousel-indicator ${index === 0 ? "active" : ""}`;
    indicator.dataset.index = index;
    indicator.addEventListener("click", () => {
      if (isAnimating || currentSlideIndex === index) return;
      goToSlide(index);
      startAutoSlide();
    });
    indicatorsContainer.appendChild(indicator);
  });

  carousel.appendChild(indicatorsContainer);

  // Set initial position - position slides in a row
  carouselSlides.forEach((slide, index) => {
    slide.style.order = index;
  });

  // Set up swipe functionality
  setupSwipeEvents();

  // Function to go to a specific slide with animation
  function goToSlide(index) {
    if (isAnimating) return;
    isAnimating = true;

    // Update indicators
    document.querySelectorAll(".carousel-indicator").forEach((indicator, i) => {
      indicator.classList.toggle("active", i === index);
    });

    // Determine direction of movement
    const direction = index > currentSlideIndex ? "left" : "right";

    if (direction === "left") {
      // Slides move from right to left
      carouselContainer.style.transform = `translateX(-${
        100 * (index - currentSlideIndex)
      }%)`;
    } else {
      // Slides move from left to right
      carouselContainer.style.transform = `translateX(${
        100 * (currentSlideIndex - index)
      }%)`;
    }

    // After animation completes, reset position
    setTimeout(() => {
      // Update current slide index
      currentSlideIndex = index;

      // Reset transform and reorder slides
      carouselContainer.style.transition = "none";
      carouselContainer.style.transform = "translateX(0)";

      carouselSlides.forEach((slide, i) => {
        const newOrder =
          (i - currentSlideIndex + carouselSlides.length) %
          carouselSlides.length;
        slide.style.order = newOrder;
      });

      // Force a reflow before re-enabling transitions
      void carouselContainer.offsetWidth;
      carouselContainer.style.transition = "transform 0.5s ease-in-out";

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

  // Set up event listeners for touch and mouse events
  function setupSwipeEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let startTime = 0;
    const threshold = 100; // Minimum distance to register as a swipe

    // Event handler for pointer down (touch or mouse)
    function handleStart(e) {
      if (isAnimating) return;

      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      currentX = startX;
      isDragging = true;
      startTime = Date.now();

      // Stop transition during drag
      carouselContainer.classList.add("swiping");

      // Clear auto slide during interaction
      clearInterval(slideInterval);

      // Add event listeners for move and end events
      if (e.type === "touchstart") {
        document.addEventListener("touchmove", handleMove, { passive: false });
        document.addEventListener("touchend", handleEnd);
      } else {
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);
      }
    }

    // Event handler for pointer move
    function handleMove(e) {
      if (!isDragging) return;

      // Prevent default behavior (scrolling)
      if (e.cancelable) {
        e.preventDefault();
      }

      const point = e.touches ? e.touches[0] : e;
      currentX = point.clientX;

      const deltaX = currentX - startX;
      const percentMove = (deltaX / carousel.offsetWidth) * 100;

      // Apply the movement with transform
      carouselContainer.style.transform = `translateX(${percentMove}%)`;
    }

    // Event handler for pointer up/end
    function handleEnd() {
      if (!isDragging) return;

      isDragging = false;
      carouselContainer.classList.remove("swiping");

      const deltaX = currentX - startX;
      const duration = Date.now() - startTime;
      const quickSwipe = duration < 300; // Consider it a quick swipe if less than 300ms

      // Determine if it's a swipe based on distance and time
      if (
        Math.abs(deltaX) > threshold ||
        (quickSwipe && Math.abs(deltaX) > 30)
      ) {
        if (deltaX > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
      } else {
        // Not a swipe, return to original position
        carouselContainer.style.transform = "translateX(0)";
      }

      // Restart auto slide
      startAutoSlide();

      // Remove event listeners
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    }

    // Add initial event listeners
    carousel.addEventListener("touchstart", handleStart, { passive: true });
    carousel.addEventListener("mousedown", handleStart);
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
