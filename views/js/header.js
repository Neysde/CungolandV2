// Header interaction handling for Çüngoland
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const mobileMenuBtn = document.querySelector(".mobile-menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const header = document.querySelector(".main-header");

  // Toggle mobile menu
  mobileMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent event from bubbling
    mainNav.classList.toggle("active");
    mobileMenuBtn.classList.toggle("active");
  });

  // Handle scroll behavior
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    // Show/hide header based on scroll direction
    if (currentScroll > lastScroll && currentScroll > 100) {
      header.style.transform = "translateY(-100%)";
      // Close mobile menu when hiding header
      mainNav.classList.remove("active");
      mobileMenuBtn.classList.remove("active");
    } else {
      header.style.transform = "translateY(0)";
    }

    lastScroll = currentScroll;
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      mainNav.classList.remove("active");
      mobileMenuBtn.classList.remove("active");
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    const isClickInside =
      mainNav.contains(e.target) || mobileMenuBtn.contains(e.target);

    if (!isClickInside && mainNav.classList.contains("active")) {
      mainNav.classList.remove("active");
      mobileMenuBtn.classList.remove("active");
    }
  });
});
