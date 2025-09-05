/**
 * Signup Page JavaScript
 * Handles form interactions, animations, and user experience enhancements
 */

class SignupPage {
  constructor() {
    this.form = document.getElementById("signupForm");
    this.passwordInput = document.getElementById("signupPassword");
    this.passwordToggle = document.getElementById("passwordToggle");
    this.toast = document.getElementById("toast");
    this.navToggle = document.getElementById("navToggle");

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupFormValidation();
    this.setupAnimations();
    this.setupPasswordToggle();
    this.setupNavigation();
    this.optimizePerformance();
  }

  setupEventListeners() {
    // Form submission
    if (this.form) {
      this.form.addEventListener("submit", this.handleFormSubmit.bind(this));
    }

    // Input focus animations
    const inputs = document.querySelectorAll(".form-input");
    inputs.forEach((input) => {
      input.addEventListener("focus", this.handleInputFocus.bind(this));
      input.addEventListener("blur", this.handleInputBlur.bind(this));
      input.addEventListener("input", this.handleInputChange.bind(this));
    });

    // Checkbox animation
    const checkbox = document.getElementById("agreeTerms");
    if (checkbox) {
      checkbox.addEventListener("change", this.handleCheckboxChange.bind(this));
    }

    // Button hover effects
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", this.handleButtonHover.bind(this));
      button.addEventListener("mouseleave", this.handleButtonLeave.bind(this));
    });
  }

  setupFormValidation() {
    const inputs = document.querySelectorAll(".form-input");

    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        this.validateField(input);
      });

      input.addEventListener("input", () => {
        this.clearFieldError(input);
      });
    });
  }

  validateField(input) {
    const wrapper = input.closest(".input-wrapper");
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Remove existing error states
    wrapper.classList.remove("error");
    this.removeErrorMessage(wrapper);

    // Validation rules
    switch (input.type) {
      case "text":
        if (input.id === "signupName") {
          if (value.length < 2) {
            isValid = false;
            errorMessage = "Name must be at least 2 characters long";
          }
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = "Please enter a valid email address";
        }
        break;

      case "password":
        if (value.length < 6) {
          isValid = false;
          errorMessage = "Password must be at least 6 characters long";
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(wrapper, errorMessage);
    }

    return isValid;
  }

  showFieldError(wrapper, message) {
    wrapper.classList.add("error");

    const errorElement = document.createElement("div");
    errorElement.className = "field-error";
    errorElement.textContent = message;

    wrapper.parentNode.appendChild(errorElement);

    // Add error styles
    const input = wrapper.querySelector(".form-input");
    if (input) {
      input.style.borderColor = "#ef4444";
      input.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.1)";
    }
  }

  clearFieldError(input) {
    const wrapper = input.closest(".input-wrapper");
    wrapper.classList.remove("error");
    this.removeErrorMessage(wrapper);

    // Reset input styles
    input.style.borderColor = "";
    input.style.boxShadow = "";
  }

  removeErrorMessage(wrapper) {
    const errorElement = wrapper.parentNode.querySelector(".field-error");
    if (errorElement) {
      errorElement.remove();
    }
  }

  setupPasswordToggle() {
    if (this.passwordToggle && this.passwordInput) {
      this.passwordToggle.addEventListener("click", () => {
        const isPassword = this.passwordInput.type === "password";
        this.passwordInput.type = isPassword ? "text" : "password";

        // Update icon
        const svg = this.passwordToggle.querySelector("svg");
        if (svg) {
          if (isPassword) {
            // Show "eye-off" icon
            svg.innerHTML = `
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        `;
          } else {
            // Show "eye" icon
            svg.innerHTML = `
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        `;
          }
        }

        // Add animation
        this.passwordToggle.style.transform = "scale(0.9)";
        setTimeout(() => {
          this.passwordToggle.style.transform = "scale(1)";
        }, 150);
      });
    }
  }

  setupAnimations() {
    // Stagger form field animations
    const formGroups = document.querySelectorAll(".form-group");
    formGroups.forEach((group, index) => {
      group.style.animationDelay = `${0.1 * index}s`;
      group.classList.add("fade-in-up");
    });

    // Intersection Observer for scroll animations
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-in");
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "50px",
        }
      );

      const animatedElements = document.querySelectorAll(
        ".feature-item, .signup-card"
      );
      animatedElements.forEach((el) => observer.observe(el));
    }
  }

  setupNavigation() {
    if (this.navToggle) {
      this.navToggle.addEventListener("click", () => {
        const navMenu = document.querySelector(".nav-menu");
        const navActions = document.querySelector(".nav-actions");

        if (navMenu && navActions) {
          navMenu.classList.toggle("active");
          navActions.classList.toggle("active");
          this.navToggle.classList.toggle("active");
        }
      });
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const inputs = this.form.querySelectorAll(".form-input");
    let isFormValid = true;

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    // Check terms agreement
    const termsCheckbox = document.getElementById("agreeTerms");
    if (termsCheckbox && !termsCheckbox.checked) {
      isFormValid = false;
      this.showToast(
        "Please agree to the Terms of Service and Privacy Policy",
        "error"
      );
      return;
    }

    if (isFormValid) {
      this.submitForm();
    } else {
      this.showToast("Please fix the errors above", "error");
    }
  }

  async submitForm() {
    const submitBtn = this.form.querySelector(".signup-btn");
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = `
            <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>Creating Account...</span>
        `;
    submitBtn.disabled = true;

    try {
      // Get form data
      const formData = new FormData(this.form);
      const userData = {
        name: document.getElementById("signupName").value,
        email: document.getElementById("signupEmail").value,
        password: document.getElementById("signupPassword").value,
      };

      // Store user data (in real app, this would be sent to server)
      localStorage.setItem("eventease_user", JSON.stringify(userData));
      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("userName", userData.name);
      sessionStorage.setItem("userEmail", userData.email);
      sessionStorage.setItem("role", "user");

      this.showToast("Account created successfully! Redirecting...", "success");

      // Redirect immediately to functions page
      setTimeout(() => {
        window.location.href = "functions.html";
      }, 500);
    } catch (error) {
      console.error("Signup error:", error);
      this.showToast("Something went wrong. Please try again.", "error");
    } finally {
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  handleInputFocus(e) {
    const wrapper = e.target.closest(".input-wrapper");
    wrapper.classList.add("focused");

    // Add subtle animation
    e.target.style.transform = "scale(1.02)";
    setTimeout(() => {
      e.target.style.transform = "scale(1)";
    }, 200);
  }

  handleInputBlur(e) {
    const wrapper = e.target.closest(".input-wrapper");
    wrapper.classList.remove("focused");
  }

  handleInputChange(e) {
    const wrapper = e.target.closest(".input-wrapper");
    if (e.target.value.trim()) {
      wrapper.classList.add("has-value");
    } else {
      wrapper.classList.remove("has-value");
    }
  }

  handleCheckboxChange(e) {
    const customCheckbox = e.target.nextElementSibling;
    if (customCheckbox) {
      customCheckbox.style.transform = "scale(1.1)";
      setTimeout(() => {
        customCheckbox.style.transform = "scale(1)";
      }, 150);
    }
  }

  handleButtonHover(e) {
    if (e.target.classList.contains("signup-btn")) {
      e.target.style.transform = "translateY(-2px)";
    }
  }

  handleButtonLeave(e) {
    if (e.target.classList.contains("signup-btn")) {
      e.target.style.transform = "translateY(0)";
    }
  }

  showToast(message, type = "info") {
    if (!this.toast) return;

    this.toast.textContent = message;
    this.toast.className = `toast ${type}`;
    this.toast.classList.remove("hidden");

    // Auto hide after 4 seconds
    setTimeout(() => {
      this.toast.classList.add("hidden");
    }, 4000);
  }

  optimizePerformance() {
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener(
      "scroll",
      () => {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
          this.handleScroll();
        }, 16); // ~60fps
      },
      { passive: true }
    );

    // Preload critical resources
    this.preloadResources();

    // Optimize animations for low-end devices
    if (this.isLowEndDevice()) {
      document.body.classList.add("reduce-animations");
    }
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const navbar = document.querySelector(".navbar");

    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  }

  preloadResources() {
    // Preload dashboard page for faster navigation
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = "../pages/dashboard.html";
    document.head.appendChild(link);
  }

  isLowEndDevice() {
    // Simple heuristic for low-end device detection
    return (
      navigator.hardwareConcurrency <= 2 ||
      navigator.deviceMemory <= 2 ||
      /Android.*Chrome\/[.0-9]*/.test(navigator.userAgent)
    );
  }
}

// Additional CSS for animations (injected via JavaScript)
const additionalStyles = `
    .fade-in-up {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .input-wrapper.focused .form-input {
        transform: scale(1);
    }
    
    .input-wrapper.has-value .input-icon {
        color: var(--primary-color);
    }
    
    .field-error {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 4px;
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .reduce-animations * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
    
    .navbar.scrolled {
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(20px);
    }
`;

// Inject additional styles
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize signup page when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new SignupPage();
  });
} else {
  new SignupPage();
}
