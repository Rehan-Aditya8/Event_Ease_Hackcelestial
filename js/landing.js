// Landing Page JavaScript
// Performance optimized with smooth animations and interactions

class LandingPage {
  constructor() {
    this.init();
    this.bindEvents();
    this.setupAnimations();
    this.optimizePerformance();
  }

  init() {
    // Initialize components when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupComponents()
      );
    } else {
      this.setupComponents();
    }
  }

  setupComponents() {
    this.navbar = document.querySelector(".navbar");
    this.navToggle = document.querySelector(".nav-toggle");
    this.navMenu = document.querySelector(".nav-menu");
    this.heroSection = document.querySelector(".hero");
    this.featureCards = document.querySelectorAll(".feature-card");
    this.floatingCards = document.querySelectorAll(".floating-card");
    this.gradientOrbs = document.querySelectorAll(".gradient-orb");

    // Setup intersection observer for animations
    this.setupIntersectionObserver();

    // Setup smooth scrolling for internal links only
        this.setupSmoothScrolling();
        
        // Setup navbar scroll effect
        this.setupNavbarScroll();
        
        // Setup mobile navigation
        this.setupMobileNav();
        
        // Setup parallax effects
        this.setupParallax();
        
        // Setup counter animations
        this.setupCounters();
  }

  bindEvents() {
    // Throttled scroll event
    let scrollTimeout;
    window.addEventListener(
      "scroll",
      () => {
        if (scrollTimeout) {
          cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(() => this.handleScroll());
      },
      { passive: true }
    );

    // Resize event with debouncing
    let resizeTimeout;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.handleResize(), 150);
      },
      { passive: true }
    );

    // Mouse move for parallax (throttled)
    let mouseMoveTimeout;
    document.addEventListener(
      "mousemove",
      (e) => {
        if (mouseMoveTimeout) {
          cancelAnimationFrame(mouseMoveTimeout);
        }
        mouseMoveTimeout = requestAnimationFrame(() => this.handleMouseMove(e));
      },
      { passive: true }
    );
  }

  setupAnimations() {
    // Animate elements on page load
    this.animateOnLoad();

    // Setup stagger animations for cards
    this.setupStaggerAnimations();
  }

  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");

          // Special handling for feature cards
          if (entry.target.classList.contains("feature-card")) {
            this.animateFeatureCard(entry.target);
          }

          // Special handling for stats
          if (entry.target.classList.contains("stat-number")) {
            this.animateCounter(entry.target);
          }
        }
      });
    }, options);

    // Observe elements
    if (this.featureCards && this.featureCards.length > 0) {
      this.featureCards.forEach((card) => this.observer.observe(card));
    }
    document
      .querySelectorAll(".stat-number")
      .forEach((stat) => this.observer.observe(stat));
    document
      .querySelectorAll(".section-header")
      .forEach((header) => this.observer.observe(header));
  }

  setupSmoothScrolling() {
    // Smooth scroll ONLY for internal anchor links (starting with #)
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        link.addEventListener("click", (e) => {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: "smooth",
            });
          }
        });
      }
    });
  }

  setupNavbarScroll() {
    let lastScrollY = window.scrollY;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100) {
        this.navbar.style.background = "rgba(10, 10, 15, 0.95)";
        this.navbar.style.backdropFilter = "blur(20px)";
      } else {
        this.navbar.style.background = "rgba(10, 10, 15, 0.8)";
        this.navbar.style.backdropFilter = "blur(20px)";
      }

      // Hide/show navbar on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        this.navbar.style.transform = "translateY(-100%)";
      } else {
        this.navbar.style.transform = "translateY(0)";
      }

      lastScrollY = currentScrollY;
    };

    this.updateNavbar = updateNavbar;
  }

  setupMobileNav() {
    if (this.navToggle && this.navMenu) {
      this.navToggle.addEventListener("click", () => {
        this.navMenu.classList.toggle("active");
        this.navToggle.classList.toggle("active");

        // Animate hamburger menu
        const spans = this.navToggle.querySelectorAll("span");
        if (this.navToggle.classList.contains("active")) {
          spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
          spans[1].style.opacity = "0";
          spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
        } else {
          spans[0].style.transform = "none";
          spans[1].style.opacity = "1";
          spans[2].style.transform = "none";
        }
      });

      // Close mobile menu when clicking on navigation links (only #-links, not external pages)
      this.navMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", () => {
          this.navMenu.classList.remove("active");
          this.navToggle.classList.remove("active");

          const spans = this.navToggle.querySelectorAll("span");
          spans[0].style.transform = "none";
          spans[1].style.opacity = "1";
          spans[2].style.transform = "none";
        });
      });
    }
  }

  setupParallax() {
    // Subtle parallax effect for gradient orbs
    this.parallaxElements = {
      orbs: this.gradientOrbs,
      cards: this.floatingCards,
    };
  }

  setupCounters() {
    this.counters = document.querySelectorAll(".stat-number");
  }

  handleScroll() {
    if (this.updateNavbar) {
      this.updateNavbar();
    }

    // Parallax effect for gradient orbs
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    if (this.gradientOrbs && this.gradientOrbs.length > 0) {
      this.gradientOrbs.forEach((orb, index) => {
        const speed = 0.5 + index * 0.1;
        const yPos = -(scrollY * speed);
        orb.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    }

    // Floating cards parallax
    if (this.floatingCards && this.floatingCards.length > 0) {
      this.floatingCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          const speed = 0.1 + index * 0.05;
          const yPos = -(scrollY * speed);
          card.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
    }
  }

  handleResize() {
    // Handle responsive adjustments
    if (window.innerWidth > 768) {
      this.navMenu.classList.remove("active");
      this.navToggle.classList.remove("active");
    }
  }

  handleMouseMove(e) {
    // Subtle mouse parallax for hero elements
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    const xPercent = (clientX / innerWidth - 0.5) * 2;
    const yPercent = (clientY / innerHeight - 0.5) * 2;

    // Apply to gradient orbs
    if (this.gradientOrbs && this.gradientOrbs.length > 0) {
      this.gradientOrbs.forEach((orb, index) => {
        const intensity = 10 + index * 5;
        const x = xPercent * intensity;
        const y = yPercent * intensity;
        const scrollY = window.scrollY;
        const speed = 0.5 + index * 0.1;
        const scrollOffset = -(scrollY * speed);
        orb.style.transform = `translate3d(${x}px, ${y + scrollOffset}px, 0)`;
      });
    }

    // Apply to floating cards
    if (this.floatingCards && this.floatingCards.length > 0) {
      this.floatingCards.forEach((card, index) => {
        const intensity = 5 + index * 2;
        const x = xPercent * intensity;
        const y = yPercent * intensity;
        const scrollY = window.scrollY;
        const speed = 0.1 + index * 0.05;
        const scrollOffset = -(scrollY * speed);
        card.style.transform = `translate3d(${x}px, ${y + scrollOffset}px, 0)`;
      });
    }
  }

  animateOnLoad() {
    // Add loaded class to body for CSS animations
    document.body.classList.add("loaded");

    // Animate hero elements with stagger
    const heroElements = document.querySelectorAll(".hero-content > *");
    heroElements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }, index * 200);
    });
  }

  setupStaggerAnimations() {
    // Stagger animation for feature cards
    if (this.featureCards && this.featureCards.length > 0) {
      this.featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
      });
    }
  }

  animateFeatureCard(card) {
    // Add entrance animation
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";

    // Add hover effect enhancement
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-8px) scale(1.02)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
    });
  }

  animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^0-9]/g, ""));
    const suffix = element.textContent.replace(/[0-9]/g, "");
    let current = 0;
    const increment = target / 60; // 60 frames for 1 second at 60fps

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current) + suffix;
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target + suffix;
      }
    };

    updateCounter();
  }

  optimizePerformance() {
    // Preload critical resources
    this.preloadResources();

    // Setup lazy loading for images
    this.setupLazyLoading();

    // Optimize animations for performance
    this.optimizeAnimations();

    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  }

  preloadResources() {
    // Load Google Fonts properly
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(fontLink);
  }

  setupLazyLoading() {
    // Lazy load images when they come into view
    const images = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  optimizeAnimations() {
    // Use transform and opacity for better performance
    const animatedElements = document.querySelectorAll('[class*="animate"]');

    animatedElements.forEach((element) => {
      element.style.willChange = "transform, opacity";
    });

    // Clean up will-change after animations
    setTimeout(() => {
      animatedElements.forEach((element) => {
        element.style.willChange = "auto";
      });
    }, 3000);
  }

  setupPerformanceMonitoring() {
    // Monitor performance and adjust animations if needed
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        this.checkPerformance();
      });
    }
  }

  checkPerformance() {
    // Check if device supports high-performance animations
    const isHighPerformance =
      window.devicePixelRatio <= 2 &&
      navigator.hardwareConcurrency >= 4 &&
      !navigator.userAgent.includes("Mobile");

    if (!isHighPerformance) {
      // Reduce animations for lower-end devices
      document.body.classList.add("reduced-motion");

      // Disable parallax on low-end devices
      if (this.gradientOrbs && this.gradientOrbs.length > 0) {
        this.gradientOrbs.forEach((orb) => {
          orb.style.animation = "none";
        });
      }
    }
  }

  // Public methods for external use
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      const offsetTop = section.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  }



  showNotification(message, type = "info") {
    // Create and show notification
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "16px 24px",
      borderRadius: "8px",
      color: "white",
      fontWeight: "500",
      zIndex: "10000",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease",
      backgroundColor:
        type === "success"
          ? "#4CAF50"
          : type === "error"
          ? "#F44336"
          : "#2196F3",
    });

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = "translateX(0)";
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize the landing page
const landingPage = new LandingPage();

// Export for external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = LandingPage;
}

// Global utility functions
window.scrollToSection = (sectionId) => landingPage.scrollToSection(sectionId);
window.showNotification = (message, type) =>
  landingPage.showNotification(message, type);

// Handle page visibility changes for performance
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Pause animations when page is not visible
    document.body.classList.add("page-hidden");
  } else {
    // Resume animations when page becomes visible
    document.body.classList.remove("page-hidden");
  }
});

// Service Worker registration disabled - sw.js file not found
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
//             .then(registration => {
//                 console.log('SW registered: ', registration);
//             })
//             .catch(registrationError => {
//                 console.log('SW registration failed: ', registrationError);
//             });
//     });
// }
