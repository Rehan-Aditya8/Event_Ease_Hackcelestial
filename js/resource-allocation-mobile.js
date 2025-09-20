// Mobile Navigation for Resource Allocation
class MobileNavigation {
    constructor() {
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.navOverlay = document.getElementById('nav-overlay');
        this.isMenuOpen = false;
        
        this.init();
    }
    
    init() {
        if (this.mobileMenuBtn && this.mobileMenu && this.navOverlay) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMenu());
            this.navOverlay.addEventListener('click', () => this.closeMenu());
            
            // Close menu when clicking nav links
            const navLinks = this.mobileMenu.querySelectorAll('.nav-links a, .nav-links button');
            navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 1200 && this.isMenuOpen) {
                    this.closeMenu();
                }
            });
            
            // Handle ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen) {
                    this.closeMenu();
                }
            });
        }
    }
    
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.mobileMenu.classList.add('active');
        this.navOverlay.classList.add('active');
        this.isMenuOpen = true;
        document.body.style.overflow = 'hidden';
    }
    
    closeMenu() {
        this.mobileMenu.classList.remove('active');
        this.navOverlay.classList.remove('active');
        this.isMenuOpen = false;
        document.body.style.overflow = '';
    }
    
    destroy() {
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.removeEventListener('click', this.toggleMenu);
        }
        if (this.navOverlay) {
            this.navOverlay.removeEventListener('click', this.closeMenu);
        }
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeydown);
    }
}

// Initialize mobile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileNavigation();
});