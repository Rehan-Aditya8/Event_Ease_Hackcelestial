/**
 * Login Page JavaScript
 * Handles form interactions, animations, and Firebase authentication
 */

// Import Firebase auth
import { auth } from '../js/firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

class LoginPage {
  constructor() {
    this.form = document.getElementById("loginForm");
    this.emailInput = document.getElementById("loginEmail");
    this.passwordInput = document.getElementById("loginPassword");
    this.passwordToggle = document.getElementById("passwordToggle");
    this.toast = document.getElementById("toast");

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupFormValidation();
    this.setupPasswordToggle();
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

    // Show error if validation failed
    if (!isValid) {
      wrapper.classList.add("error");
      this.addErrorMessage(wrapper, errorMessage);
    }

    return isValid;
  }

  clearFieldError(input) {
    const wrapper = input.closest(".input-wrapper");
    wrapper.classList.remove("error");
    this.removeErrorMessage(wrapper);
  }

  addErrorMessage(wrapper, message) {
    // Remove any existing error message
    this.removeErrorMessage(wrapper);
    
    // Create and add new error message
    const errorElement = document.createElement("div");
    errorElement.className = "input-error";
    errorElement.textContent = message;
    wrapper.appendChild(errorElement);
  }

  removeErrorMessage(wrapper) {
    const existingError = wrapper.querySelector(".input-error");
    if (existingError) {
      existingError.remove();
    }
  }

  handleFormSubmit(event) {
    event.preventDefault();

    // Validate all fields
    const inputs = this.form.querySelectorAll(".form-input");
    let isFormValid = true;

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      // Get user data
      const email = this.emailInput.value.trim();
      const password = this.passwordInput.value.trim();
      
      // Show loading state
      const submitButton = this.form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner"></span> Logging in...';
      
      // Sign in with Firebase Authentication
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // User signed in successfully
          this.showToast("Login successful! Redirecting...", "success");
          
          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1500);
        })
        .catch((error) => {
          // Handle errors
          submitButton.disabled = false;
          submitButton.innerHTML = 'Login';
          
          let errorMessage = "Failed to login. Please check your credentials.";
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "Invalid email or password. Please try again.";
          }
          
          this.showToast(errorMessage, "error");
          console.error("Error signing in:", error);
        });
    }
  }

  setupPasswordToggle() {
    if (this.passwordToggle && this.passwordInput) {
      this.passwordToggle.addEventListener("click", () => {
        const type = this.passwordInput.getAttribute("type") === "password" ? "text" : "password";
        this.passwordInput.setAttribute("type", type);
        
        // Toggle icon
        this.passwordToggle.classList.toggle("show-password");
      });
    }
  }

  handleInputFocus(event) {
    const wrapper = event.target.closest(".input-wrapper");
    wrapper.classList.add("focused");
  }

  handleInputBlur(event) {
    const wrapper = event.target.closest(".input-wrapper");
    if (!event.target.value) {
      wrapper.classList.remove("focused");
    }
  }

  showToast(message, type = "info") {
    if (!this.toast) return;
    
    // Clear any existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    // Set message and type
    this.toast.textContent = message;
    this.toast.className = `toast ${type}`;
    
    // Show toast
    this.toast.classList.add("show");
    
    // Hide after 3 seconds
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.remove("show");
    }, 3000);
  }
}

// Initialize the login page
document.addEventListener("DOMContentLoaded", () => {
  new LoginPage();
});