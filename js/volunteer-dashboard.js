// Volunteer Dashboard JavaScript with Modern UI Enhancements
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Volunteer Dashboard');
    
    // Theme Toggle Functionality
    const themeToggle = document.getElementById("themeToggle");
    const currentTheme = localStorage.getItem("theme") || "light";
    
    // Set initial theme
    document.documentElement.setAttribute("data-theme", currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            
            // Add a subtle animation effect
            document.body.style.transition = "background 0.3s ease";
            setTimeout(() => {
                document.body.style.transition = "";
            }, 300);
        });
    }
    
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('volunteerAuthenticated');
    const userName = sessionStorage.getItem('userName') || 'Volunteer';
    const userEmail = sessionStorage.getItem('userEmail') || sessionStorage.getItem('volunteerEmail');
    
    if (!isAuthenticated) {
        window.location.href = '../pages/volunteer-login.html';
        return;
    }

    // Initialize mobile menu functionality
    initializeMobileMenu();

    // Initialize dashboard
    initializeDashboard();
    initializeAnimations();
    updateUserInfo();
    initializeStats();
    initializeAnnouncementManagement();
    
    // Add delay to ensure DOM is fully ready
    setTimeout(() => {
        console.log('Initializing ticket scanner...');
        initializeTicketScanner();
    }, 100);
    
    // Navigation functionality
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    const actionButtons = document.querySelectorAll('[data-view]');

    // Set volunteer name from session storage or default
    const volunteerEmail = sessionStorage.getItem('volunteerEmail') || 'Volunteer';
    const volunteerUserNameSpan = document.getElementById('volunteerUserName');
    if (volunteerUserNameSpan) {
        volunteerUserNameSpan.textContent = volunteerEmail.split('@')[0];
    }

    // Handle navigation
    function showView(viewId) {
        console.log('Showing view:', viewId);
        
        // Hide all views by adding hidden class
        views.forEach(view => {
            view.classList.add('hidden');
            view.classList.remove('active');
        });
        
        // Show target view by removing hidden class
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
            console.log('Target view found and shown:', viewId);
        } else {
            console.log('Target view not found:', viewId);
        }
        
        // Update navigation button states
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeNavBtn = document.querySelector(`[data-view="${viewId}"]`);
        if (activeNavBtn && activeNavBtn.classList.contains('nav-btn')) {
            activeNavBtn.classList.add('active');
        }
    }

    // Add click handlers for navigation
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const viewId = button.getAttribute('data-view');
            showView(viewId);
        });
    });

    // Add click handlers for action buttons
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const viewId = button.getAttribute('data-view');
            if (viewId) {
                showView(viewId);
            }
        });
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.clear();
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        });
    }

    // Initialize dashboard components
    function initializeDashboard() {
        // Initialize toast notifications
        window.showToast = function(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">${getToastIcon(type)}</span>
                    <span class="toast-message">${message}</span>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        };

        // Initialize EasyEntry QR code generation
        const generateQRBtn = document.getElementById('generateQR');
        if (generateQRBtn) {
            generateQRBtn.addEventListener('click', generateQRCode);
        }

        // Initialize chat functionality
        const sendChatBtn = document.getElementById('sendChatMessage');
        if (sendChatBtn) {
            sendChatBtn.addEventListener('click', sendChatMessage);
        }

        // Initialize emergency help
        const emergencyBtn = document.getElementById('requestEmergencyHelp');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', requestEmergencyHelp);
        }
    }

    function initializeAnimations() {
        // Add entrance animations
        const dashboardElements = document.querySelectorAll('.modern-dashboard > *');
        dashboardElements.forEach((element, index) => {
            element.style.animationDelay = `${(index + 1) * 0.1}s`;
        });

        // Add hover effects for interactive elements
        const interactiveElements = document.querySelectorAll('.quick-action-btn, .tool-card, .stat-card');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    function updateUserInfo() {
        // Update user name in welcome header
        const userNameElement = document.getElementById('volunteerUserName');
        if (userNameElement) {
            userNameElement.textContent = userName;
        }

        // Update avatar initial
        const avatarInitial = document.getElementById('avatarInitial');
        if (avatarInitial) {
            avatarInitial.textContent = userName.charAt(0).toUpperCase();
        }

        // Update user info in sidebar
        const sidebarUserName = document.getElementById('userName');
        const sidebarUserEmail = document.getElementById('userEmail');
        
        if (sidebarUserName) sidebarUserName.textContent = userName;
        if (sidebarUserEmail) sidebarUserEmail.textContent = userEmail || 'volunteer@eventease.com';
    }

    function initializeStats() {
        // Animate stats counters
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent) || 0;
            animateCounter(stat, 0, finalValue, 1500);
        });

        // Update stats periodically (simulate real-time data)
        setInterval(updateStats, 30000); // Update every 30 seconds
    }

    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    function updateStats() {
        // Simulate real-time stat updates
        const ticketsScanned = document.getElementById('ticketsScanned');
        const tasksCompleted = document.getElementById('tasksCompleted');
        const hoursWorked = document.getElementById('hoursWorked');
        
        if (ticketsScanned) {
            const current = parseInt(ticketsScanned.textContent) || 0;
            const newValue = current + Math.floor(Math.random() * 3);
            animateCounter(ticketsScanned, current, newValue, 500);
        }
        
        if (tasksCompleted) {
            const current = parseInt(tasksCompleted.textContent) || 0;
            if (Math.random() > 0.7) { // 30% chance to increment
                animateCounter(tasksCompleted, current, current + 1, 500);
            }
        }
        
        if (hoursWorked) {
            const startTime = sessionStorage.getItem('loginTime');
            if (startTime) {
                const hours = Math.floor((Date.now() - parseInt(startTime)) / (1000 * 60 * 60));
                hoursWorked.textContent = hours;
            }
        }
    }

    function getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    function generateQRCode() {
        const eventCode = document.getElementById('eventCode')?.value;
        if (!eventCode) {
            showToast('Please enter an event code', 'warning');
            return;
        }

        const qrContainer = document.getElementById('qrcode');
        if (qrContainer && typeof QRCode !== 'undefined') {
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: eventCode,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff"
            });
            showToast('QR code generated successfully!', 'success');
        }
    }

    function sendChatMessage() {
        const messageInput = document.getElementById('chatMessage');
        if (!messageInput || !messageInput.value.trim()) {
            showToast('Please enter a message', 'warning');
            return;
        }

        const message = messageInput.value.trim();
        showToast(`Message sent: "${message}"`, 'success');
        messageInput.value = '';
    }

    function requestEmergencyHelp() {
        showToast('Emergency help requested! Staff will be notified immediately.', 'error');
        
        // Simulate emergency notification
        setTimeout(() => {
            showToast('Emergency team has been alerted and is on the way.', 'info');
        }, 2000);
    }

    // Initialize dashboard - show dashboard view by default
    const dashboardView = document.getElementById('dashboard');
    if (dashboardView) {
        dashboardView.classList.add('active');
    }

    // Set login time for hours tracking
    if (!sessionStorage.getItem('loginTime')) {
        sessionStorage.setItem('loginTime', Date.now().toString());
    }

    console.log('Volunteer dashboard initialized successfully');
});

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (mobileMenuBtn && sidebar && sidebarOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        });
        
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
        
        // Close sidebar when clicking nav items on mobile
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('open');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
    }
}

// Announcement Management System
function initializeAnnouncementManagement() {
    const announcementForm = document.getElementById('announcement-form');
    const previewBtn = document.getElementById('preview-announcement');
    const previewModal = document.getElementById('announcement-preview');
    const closePreviewBtn = document.getElementById('close-preview');
    const editBtn = document.getElementById('edit-announcement');
    const confirmPostBtn = document.getElementById('confirm-post');
    const contentTextarea = document.getElementById('announcement-content');
    const contentCount = document.getElementById('content-count');
    const filterBtns = document.querySelectorAll('.announcement-filters .filter-btn');

    // Character count for textarea
    if (contentTextarea && contentCount) {
        contentTextarea.addEventListener('input', function() {
            const count = this.value.length;
            contentCount.textContent = count;
            
            if (count > 450) {
                contentCount.style.color = '#ef4444';
            } else if (count > 350) {
                contentCount.style.color = '#f59e0b';
            } else {
                contentCount.style.color = 'var(--text-secondary)';
            }
        });
    }

    // Preview functionality
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            const formData = getAnnouncementFormData();
            if (validateAnnouncementForm(formData)) {
                showAnnouncementPreview(formData);
            }
        });
    }

    // Close preview modal
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', closeAnnouncementPreview);
    }

    // Edit from preview
    if (editBtn) {
        editBtn.addEventListener('click', closeAnnouncementPreview);
    }

    // Confirm post from preview
    if (confirmPostBtn) {
        confirmPostBtn.addEventListener('click', function() {
            const formData = getAnnouncementFormData();
            if (validateAnnouncementForm(formData)) {
                postAnnouncement(formData);
                closeAnnouncementPreview();
            }
        });
    }

    // Form submission
    if (announcementForm) {
        announcementForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = getAnnouncementFormData();
            if (validateAnnouncementForm(formData)) {
                postAnnouncement(formData);
            }
        });
    }

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterAnnouncements(filter);
        });
    });

    // Close modal when clicking overlay
    if (previewModal) {
        previewModal.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('preview-overlay')) {
                closeAnnouncementPreview();
            }
        });
    }

    // Load existing announcements
    loadAnnouncements();
}

function getAnnouncementFormData() {
    return {
        title: document.getElementById('announcement-title')?.value.trim() || '',
        content: document.getElementById('announcement-content')?.value.trim() || '',
        priority: document.getElementById('announcement-priority')?.value || 'general',
        category: 'general' // Default category since form doesn't have this field
    };
}

function validateAnnouncementForm(data) {
    const errors = [];

    if (!data.title) {
        errors.push('Title is required');
    } else if (data.title.length > 100) {
        errors.push('Title must be 100 characters or less');
    }

    if (!data.content) {
        errors.push('Content is required');
    } else if (data.content.length > 500) {
        errors.push('Content must be 500 characters or less');
    }

    if (!data.priority) {
        errors.push('Priority is required');
    }

    if (errors.length > 0) {
        showToast(errors.join(', '), 'error');
        return false;
    }

    return true;
}

function showAnnouncementPreview(data) {
    const previewModal = document.getElementById('announcement-preview');
    const previewContainer = document.getElementById('preview-announcement-item');
    
    if (previewContainer) {
        previewContainer.innerHTML = createAnnouncementHTML(data, true);
    }
    
    if (previewModal) {
        previewModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeAnnouncementPreview() {
    const previewModal = document.getElementById('announcement-preview');
    if (previewModal) {
        previewModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function postAnnouncement(data) {
    console.log('Attempting to post announcement:', data);
    
    try {
        // Get existing announcements
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        console.log('Existing announcements:', announcements);
        
        // Create new announcement
        const newAnnouncement = {
            id: Date.now().toString(),
            title: data.title,
            content: data.content,
            priority: data.priority,
            category: data.category,
            timestamp: new Date().toISOString(),
            author: 'Volunteer',
            authorId: 'volunteer-' + Date.now()
        };
        
        console.log('New announcement created:', newAnnouncement);
        
        // Add to beginning of array (newest first)
        announcements.unshift(newAnnouncement);
        
        // Save to localStorage
        localStorage.setItem('announcements', JSON.stringify(announcements));
        console.log('Announcement saved to localStorage');
        
        // Trigger storage event for other tabs/windows (like user dashboard)
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'announcements',
            newValue: JSON.stringify(announcements),
            url: window.location.href
        }));
        
        // Clear form
        clearAnnouncementForm();
        
        // Reload announcements display
        loadAnnouncements();
        
        // Add to activity feed (if function exists)
        if (typeof addActivityFeedItem === 'function') {
            addActivityFeedItem({
                type: 'announcement',
                title: 'New Announcement Posted',
                description: `"${data.title}" - ${data.priority} priority`,
                time: 'Just now',
                icon: '📢'
            });
        }
        
        // Show success message
        if (typeof showToast === 'function') {
            showToast(`Announcement "${data.title}" posted successfully!`, 'success');
        } else {
            alert(`Announcement "${data.title}" posted successfully!`);
        }
        
        // Update stats
        updateAnnouncementStats();
        
        console.log('Announcement posted successfully');
        
    } catch (error) {
        console.error('Error posting announcement:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to post announcement. Please try again.', 'error');
        } else {
            alert('Failed to post announcement. Please try again.');
        }
    }
}

function clearAnnouncementForm() {
    const form = document.getElementById('announcement-form');
    if (form) {
        form.reset();
        
        // Reset character count
        const contentCount = document.getElementById('content-count');
        if (contentCount) {
            contentCount.textContent = '0';
            contentCount.style.color = 'var(--text-secondary)';
        }
    }
}

function loadAnnouncements() {
    console.log('Loading announcements in volunteer dashboard...');
    
    try {
        const storedData = localStorage.getItem('announcements');
        console.log('Raw stored data:', storedData);
        
        const announcements = JSON.parse(storedData || '[]');
        console.log('Parsed announcements:', announcements);
        
        // Look for the correct container - announcement-items instead of announcements-list
        const container = document.getElementById('announcement-items');
        
        if (!container) {
            console.error('Announcement items container not found');
            return;
        }
        
        console.log('Found announcement items container, rendering', announcements.length, 'announcements');
        
        if (announcements.length === 0) {
            console.log('No announcements to display');
            container.innerHTML = `
                <li class="empty-state">
                    <div class="empty-icon">📢</div>
                    <h3>No Announcements Yet</h3>
                    <p>Create your first announcement to keep attendees informed.</p>
                </li>
            `;
            return;
        }
        
        // Sort announcements by timestamp (newest first)
        const sortedAnnouncements = announcements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log('Sorted announcements:', sortedAnnouncements);
        
        container.innerHTML = sortedAnnouncements
            .map(announcement => `<li>${createAnnouncementHTML(announcement)}</li>`)
            .join('');
            
        // Add event listeners for announcement actions
        addAnnouncementActionListeners();
        
        console.log('Announcements loaded successfully');
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        const container = document.getElementById('announcement-items');
        if (container) {
            container.innerHTML = `
                <li class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Error Loading Announcements</h3>
                    <p>Please refresh the page to try again.</p>
                    <button onclick="loadAnnouncements()" class="btn primary">Retry</button>
                </li>
            `;
        }
    }
}

function createAnnouncementHTML(announcement, isPreview = false) {
    const timeAgo = isPreview ? 'Just now' : getTimeAgo(announcement.timestamp);
    const priorityIcon = {
        'emergency': '🚨',
        'important': '⚠️',
        'general': '📝'
    }[announcement.priority] || '📝';
    
    const categoryIcon = {
        'general': '📋',
        'schedule': '📅',
        'food': '🍽️',
        'safety': '🛡️',
        'technical': '💻',
        'weather': '🌤️'
    }[announcement.category] || '📋';
    
    return `
        <div class="announcement-item priority-${announcement.priority}" data-id="${announcement.id}" data-priority="${announcement.priority}">
            <div class="announcement-header">
                <h3 class="announcement-title">${escapeHtml(announcement.title)}</h3>
                <div class="announcement-meta">
                    <span class="announcement-priority ${announcement.priority}">
                        ${priorityIcon} ${announcement.priority.toUpperCase()}
                    </span>
                    <span class="announcement-time">${timeAgo}</span>
                </div>
            </div>
            
            <div class="announcement-content">
                ${escapeHtml(announcement.content).replace(/\n/g, '<br>')}
            </div>
            
            <div class="announcement-footer">
                <div class="announcement-category">
                    <span>${categoryIcon}</span>
                    <span>${announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}</span>
                </div>
                
                ${!isPreview ? `
                    <div class="announcement-actions">
                        <button class="btn secondary small edit-announcement" data-id="${announcement.id}">
                            <span class="btn-icon">✏️</span>
                            Edit
                        </button>
                        <button class="btn danger small delete-announcement" data-id="${announcement.id}">
                            <span class="btn-icon">🗑️</span>
                            Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function addAnnouncementActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-announcement').forEach(btn => {
        btn.addEventListener('click', function() {
            const announcementId = this.dataset.id;
            editAnnouncement(announcementId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-announcement').forEach(btn => {
        btn.addEventListener('click', function() {
            const announcementId = this.dataset.id;
            deleteAnnouncement(announcementId);
        });
    });
}

function editAnnouncement(id) {
    try {
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const announcement = announcements.find(a => a.id === id);
        
        if (!announcement) {
            showToast('Announcement not found', 'error');
            return;
        }
        
        // Fill form with announcement data
        document.getElementById('announcement-title').value = announcement.title;
        document.getElementById('announcement-content').value = announcement.content;
        document.getElementById('announcement-priority').value = announcement.priority;
        document.getElementById('announcement-category').value = announcement.category;
        
        // Update character count
        const contentCount = document.getElementById('content-count');
        if (contentCount) {
            contentCount.textContent = announcement.content.length;
        }
        
        // Store the ID for updating
        document.getElementById('announcement-form').dataset.editId = id;
        
        // Scroll to form
        document.querySelector('.announcement-creator').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        showToast('Editing announcement. Make changes and submit to update.', 'info');
        
    } catch (error) {
        console.error('Error editing announcement:', error);
        showToast('Failed to load announcement for editing', 'error');
    }
}

function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
        return;
    }
    
    try {
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const updatedAnnouncements = announcements.filter(a => a.id !== id);
        
        localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        
        // Trigger storage event for other tabs/windows (like user dashboard)
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'announcements',
            newValue: JSON.stringify(updatedAnnouncements),
            url: window.location.href
        }));
        
        // Reload announcements
        loadAnnouncements();
        
        // Update stats
        updateAnnouncementStats();
        
        showToast('Announcement deleted successfully', 'success');
        
    } catch (error) {
        console.error('Error deleting announcement:', error);
        showToast('Failed to delete announcement', 'error');
    }
}

function filterAnnouncements(filter) {
    const announcements = document.querySelectorAll('.announcement-item');
    
    announcements.forEach(item => {
        const priority = item.dataset.priority;
        
        if (filter === 'all' || priority === filter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function updateAnnouncementStats() {
    try {
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        
        // Update dashboard stats if elements exist
        const totalAnnouncementsEl = document.querySelector('[data-stat="total-announcements"]');
        if (totalAnnouncementsEl) {
            totalAnnouncementsEl.textContent = announcements.length;
        }
        
        // Count by priority
        const emergencyCount = announcements.filter(a => a.priority === 'emergency').length;
        const importantCount = announcements.filter(a => a.priority === 'important').length;
        
        const emergencyEl = document.querySelector('[data-stat="emergency-announcements"]');
        if (emergencyEl) {
            emergencyEl.textContent = emergencyCount;
        }
        
        const importantEl = document.querySelector('[data-stat="important-announcements"]');
        if (importantEl) {
            importantEl.textContent = importantCount;
        }
        
    } catch (error) {
        console.error('Error updating announcement stats:', error);
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Debug logging functionality
let debugLog = [];
let debugVisible = false;

function addDebugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    debugLog.push({ message: logEntry, type });
    
    // Also log to console
    console.log(`DEBUG: ${logEntry}`);
    
    // Update debug display if visible
    updateDebugDisplay();
}

function updateDebugDisplay() {
    const debugContent = document.getElementById('debug-content');
    if (debugContent) {
        debugContent.innerHTML = debugLog.map(entry => 
            `<div class="log-entry ${entry.type}">${entry.message}</div>`
        ).join('');
        debugContent.scrollTop = debugContent.scrollHeight;
    }
}

function toggleDebugLog() {
    const debugLogElement = document.getElementById('scanner-debug-log');
    const toggleButton = document.getElementById('toggle-debug');
    
    if (debugLogElement && toggleButton) {
        debugVisible = !debugVisible;
        debugLogElement.style.display = debugVisible ? 'block' : 'none';
        toggleButton.textContent = debugVisible ? 'Hide Debug' : 'Show Debug';
        
        if (debugVisible) {
            updateDebugDisplay();
        }
    }
}

// Enhanced camera functionality with debugging
let currentStream = null;
let isScanning = false;

async function startCameraWithDebug() {
    addDebugLog('Starting camera with debug...', 'info');
    
    const video = document.getElementById('scanner-video');
    const startBtn = document.getElementById('start-camera');
    const stopBtn = document.getElementById('stop-camera');
    const switchBtn = document.getElementById('switch-camera');
    const statusElement = document.getElementById('scanner-status');
    
    if (!video) {
        addDebugLog('Video element not found', 'error');
        return;
    }

    try {
        // Update UI state
        if (startBtn) startBtn.classList.add('hidden');
        if (stopBtn) stopBtn.classList.remove('hidden');
        if (switchBtn) switchBtn.classList.remove('hidden');
        
        // Update status
        if (statusElement) {
            statusElement.innerHTML = '<span class="status-text">Starting camera...</span>';
            statusElement.className = 'scanner-status';
        }

        // Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        addDebugLog(`Found ${videoDevices.length} video devices`, 'info');

        // Try to get back camera first, then front camera
        let constraints = {
            video: {
                facingMode: { ideal: 'environment' }, // Back camera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        try {
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            addDebugLog('Back camera accessed successfully', 'success');
        } catch (backCameraError) {
            addDebugLog('Back camera failed, trying front camera', 'warning');
            constraints.video.facingMode = { ideal: 'user' }; // Front camera
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            addDebugLog('Front camera accessed successfully', 'success');
        }

        video.srcObject = currentStream;
        isScanning = true;

        // Update status to scanning
        if (statusElement) {
            statusElement.innerHTML = '<span class="status-text">Camera active - Scanning for QR codes</span>';
            statusElement.className = 'scanner-status scanning';
        }

        // Wait for video to be ready
        video.addEventListener('loadedmetadata', () => {
            addDebugLog(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`, 'info');
            // Start QR detection after video is ready
            setTimeout(() => {
                if (isScanning) {
                    startQRDetection();
                }
            }, 500);
        });

        addDebugLog('Camera started successfully', 'success');
        showToast('Camera started successfully', 'success');

    } catch (error) {
        addDebugLog(`Camera error: ${error.message}`, 'error');
        console.error('Camera access error:', error);
        
        // Update status to error
        if (statusElement) {
            statusElement.innerHTML = '<span class="status-text">Camera access failed</span>';
            statusElement.className = 'scanner-status error';
        }
        
        // Reset UI state
        if (startBtn) startBtn.classList.remove('hidden');
        if (stopBtn) stopBtn.classList.add('hidden');
        if (switchBtn) switchBtn.classList.add('hidden');
        
        isScanning = false;
        
        let errorMessage = 'Camera access failed. ';
        if (error.name === 'NotAllowedError') {
            errorMessage += 'Please allow camera permissions and try again.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No camera found on this device.';
        } else {
            errorMessage += 'Please check your camera and try again.';
        }
        
        showToast(errorMessage, 'error');
    }
}

function stopCameraWithDebug() {
    addDebugLog('Stopping camera...', 'info');
    
    const video = document.getElementById('scanner-video');
    const startBtn = document.getElementById('start-camera');
    const stopBtn = document.getElementById('stop-camera');
    const switchBtn = document.getElementById('switch-camera');
    const statusElement = document.getElementById('scanner-status');
    
    if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop();
            addDebugLog(`Stopped track: ${track.kind}`, 'info');
        });
        currentStream = null;
    }
    
    if (video) {
        video.srcObject = null;
        addDebugLog('Video stream cleared', 'success');
    }
    
    // Update button states
    if (startBtn) {
        startBtn.classList.remove('hidden');
        addDebugLog('Start button shown', 'info');
    }
    if (stopBtn) {
        stopBtn.classList.add('hidden');
        addDebugLog('Stop button hidden', 'info');
    }
    if (switchBtn) {
        switchBtn.classList.add('hidden');
        addDebugLog('Switch button hidden', 'info');
    }
    
    // Update status
    if (statusElement) {
        statusElement.innerHTML = '<span class="status-text">Camera stopped</span>';
        statusElement.className = 'scanner-status';
    }
    
    isScanning = false;
    addDebugLog('Camera stopped successfully', 'success');
    showToast('Camera stopped', 'info');
}

// Ticket Scanner Functionality
function initializeTicketScanner() {
    console.log('=== INITIALIZING TICKET SCANNER ===');
    
    const scannerTabBtns = document.querySelectorAll('.scanner-tab-btn');
    const scannerTabContents = document.querySelectorAll('.scanner-tab-content');
    const startCameraBtn = document.getElementById('start-camera');
    const stopCameraBtn = document.getElementById('stop-camera');
    const scannerVideo = document.getElementById('scanner-video');
    const manualTicketForm = document.getElementById('manual-ticket-form');
    const scanResult = document.getElementById('scan-result');
    const closeResultBtn = document.getElementById('close-result');
    const scanAnotherBtn = document.getElementById('scan-another');
    const admitAttendeeBtn = document.getElementById('admit-attendee');

    let scannerActive = false;
    let scanStats = {
        total: 0,
        valid: 0,
        invalid: 0
    };

    // Detailed element checking with logging
    console.log('Element check results:', {
        scannerTabBtns: scannerTabBtns.length,
        scannerTabContents: scannerTabContents.length,
        startCameraBtn: !!startCameraBtn,
        stopCameraBtn: !!stopCameraBtn,
        scannerVideo: !!scannerVideo,
        manualTicketForm: !!manualTicketForm,
        scanResult: !!scanResult,
        closeResultBtn: !!closeResultBtn,
        scanAnotherBtn: !!scanAnotherBtn,
        admitAttendeeBtn: !!admitAttendeeBtn
    });

    // Check if all required elements exist
    if (!startCameraBtn || !stopCameraBtn || !scannerVideo) {
        console.error('CRITICAL: Required scanner elements not found');
        console.error('Missing elements:', {
            startCameraBtn: !startCameraBtn,
            stopCameraBtn: !stopCameraBtn,
            scannerVideo: !scannerVideo
        });
        showToast('Scanner initialization failed - missing elements', 'error');
        return;
    }

    console.log('All required elements found, proceeding with initialization...');

    // Tab switching
    scannerTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update tab buttons
            scannerTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update tab content
            scannerTabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });

            // Stop camera if switching away from scanner
            if (targetTab !== 'qr-scanner' && currentStream) {
                stopCamera();
            }
        });
    });

    // Camera controls with debug functionality
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', () => {
            console.log('Start camera button clicked');
            startCameraWithDebug();
        });
    }
    
    if (stopCameraBtn) {
        stopCameraBtn.addEventListener('click', () => {
            console.log('Stop camera button clicked');
            stopCameraWithDebug();
        });
    }
    
    // Switch camera button
    const switchCameraBtn = document.getElementById('switch-camera');
    if (switchCameraBtn) {
        switchCameraBtn.addEventListener('click', () => {
            console.log('Switch camera button clicked');
            switchCamera();
        });
    }
    
    // Debug toggle functionality
    const toggleDebugBtn = document.getElementById('toggle-debug');
    if (toggleDebugBtn) {
        toggleDebugBtn.addEventListener('click', toggleDebugLog);
    }

    // Manual entry form
    if (manualTicketForm) {
        manualTicketForm.addEventListener('submit', handleManualEntry);
    }

    // Result controls
    if (closeResultBtn) {
        closeResultBtn.addEventListener('click', hideResult);
    }
    
    if (scanAnotherBtn) {
        scanAnotherBtn.addEventListener('click', () => {
            hideResult();
            if (document.getElementById('qr-scanner').classList.contains('active')) {
                startCamera();
            }
        });
    }
    
    if (admitAttendeeBtn) {
        admitAttendeeBtn.addEventListener('click', admitAttendee);
    }

    // Legacy camera functions for compatibility
    async function startCamera() {
        await startCameraWithDebug();
        scannerActive = isScanning;
        if (scannerActive) {
            startQRDetection();
        }
    }

    function stopCamera() {
        stopCameraWithDebug();
        scannerActive = isScanning;
    }

    function startQRDetection() {
        const video = document.getElementById('scanner-video');
        const canvas = document.getElementById('scanner-canvas') || document.createElement('canvas');
        const statusElement = document.getElementById('scanner-status');
        
        if (!video) {
            addDebugLog('Video element not found for QR detection', 'error');
            return;
        }

        if (!scannerActive || !currentStream) {
            addDebugLog('QR Detection not started - scanner inactive or no stream', 'warning');
            return;
        }

        const context = canvas.getContext('2d');
        let scanCount = 0;
        
        function detectQR() {
            if (!scannerActive || !video.videoWidth || !video.videoHeight) {
                if (scannerActive) {
                    requestAnimationFrame(detectQR);
                }
                return;
            }

            scanCount++;
            if (scanCount % 30 === 0) { // Log every 30 frames
                addDebugLog(`QR scan attempt #${scanCount}`, 'info');
            }

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data for QR detection
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // Use jsQR to detect QR codes
            if (typeof jsQR !== 'undefined') {
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    addDebugLog(`QR Code detected: ${code.data}`, 'success');
                    
                    // Update status
                    if (statusElement) {
                        statusElement.innerHTML = '<span class="status-text">QR Code detected!</span>';
                        statusElement.className = 'scanner-status success';
                    }
                    
                    handleQRDetection(code.data);
                    return;
                }
            } else {
                if (scanCount === 1) {
                    addDebugLog('jsQR library not available', 'error');
                }
            }
            
            if (scannerActive) {
                requestAnimationFrame(detectQR);
            }
        }
        
        addDebugLog('Starting QR detection loop', 'info');
        requestAnimationFrame(detectQR);
    }

    async function switchCamera() {
        const switchBtn = document.getElementById('switch-camera');
        const statusElement = document.getElementById('scanner-status');
        
        if (!currentStream) {
            addDebugLog('No active stream to switch', 'warning');
            return;
        }

        try {
            // Disable button during switch
            if (switchBtn) switchBtn.disabled = true;
            
            // Update status
            if (statusElement) {
                statusElement.innerHTML = '<span class="status-text">Switching camera...</span>';
                statusElement.className = 'scanner-status';
            }

            // Get current facing mode
            const currentTrack = currentStream.getVideoTracks()[0];
            const currentSettings = currentTrack.getSettings();
            const currentFacingMode = currentSettings.facingMode;
            
            addDebugLog(`Current facing mode: ${currentFacingMode}`, 'info');

            // Stop current stream
            currentStream.getTracks().forEach(track => track.stop());

            // Switch to opposite camera
            const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
            
            const constraints = {
                video: {
                    facingMode: { ideal: newFacingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            const video = document.getElementById('scanner-video');
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = currentStream;

            addDebugLog(`Switched to ${newFacingMode} camera`, 'success');
            
            // Update status back to scanning
            if (statusElement) {
                statusElement.innerHTML = '<span class="status-text">Camera active - Scanning for QR codes</span>';
                statusElement.className = 'scanner-status scanning';
            }

            // Restart QR detection
            setTimeout(() => {
                if (scannerActive) {
                    startQRDetection();
                }
            }, 500);

        } catch (error) {
            addDebugLog(`Camera switch error: ${error.message}`, 'error');
            
            // Update status to error
            if (statusElement) {
                statusElement.innerHTML = '<span class="status-text">Camera switch failed</span>';
                statusElement.className = 'scanner-status error';
            }
            
            showToast('Failed to switch camera', 'error');
        } finally {
            // Re-enable button
            if (switchBtn) switchBtn.disabled = false;
        }
    }

    function generateMockTicketCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function handleQRDetection(qrData) {
        addDebugLog(`Processing QR data: ${qrData}`, 'info');
        scannerActive = false;
        stopCamera();
        
        // Parse different QR code formats
        let ticketCode = '';
        let source = 'QR Scanner';
        
        try {
            // Try to parse as JSON first (for EventEase format)
            const data = JSON.parse(qrData);
            if (data.email && data.code) {
                ticketCode = data.code;
                addDebugLog(`Extracted ticket code from JSON: ${ticketCode}`, 'success');
            }
        } catch (e) {
            addDebugLog('QR data is not JSON, trying other formats', 'info');
            // If not JSON, check for EventEase ticket format
            if (qrData.includes('EventEase-Ticket-')) {
                const parts = qrData.split('-');
                if (parts.length >= 3) {
                    ticketCode = parts[2];
                    addDebugLog(`Extracted ticket code from EventEase format: ${ticketCode}`, 'success');
                }
            } else if (/^\d{6}$/.test(qrData)) {
                // Direct 6-digit code
                ticketCode = qrData;
                addDebugLog(`Direct 6-digit code detected: ${ticketCode}`, 'success');
            } else {
                // Try to extract 6-digit number from any string
                const match = qrData.match(/\d{6}/);
                if (match) {
                    ticketCode = match[0];
                    addDebugLog(`Extracted 6-digit code from string: ${ticketCode}`, 'success');
                }
            }
        }
        
        if (ticketCode && /^\d{6}$/.test(ticketCode)) {
            addDebugLog(`Valid ticket code found: ${ticketCode}`, 'success');
            processTicketCode(ticketCode, source);
        } else {
            addDebugLog(`Invalid ticket code: ${ticketCode}`, 'error');
            showScanResult('000000', false, source);
        }
    }

    function handleManualEntry(e) {
        e.preventDefault();
        const ticketCodeInput = document.getElementById('ticket-code-input');
        const code = ticketCodeInput.value.trim();
        
        if (code.length === 6 && /^\d{6}$/.test(code)) {
            processTicketCode(code, 'Manual Entry');
            ticketCodeInput.value = '';
        } else {
            showToast('Please enter a valid 6-digit ticket code', 'error');
        }
    }

    function processTicketCode(code, method) {
        addDebugLog(`Processing ticket code: ${code} via ${method}`, 'info');
        
        // Simulate ticket validation
        const isValid = Math.random() > 0.2; // 80% chance of valid ticket
        
        scanStats.total++;
        if (isValid) {
            scanStats.valid++;
            addDebugLog(`Ticket ${code} validated successfully`, 'success');
        } else {
            scanStats.invalid++;
            addDebugLog(`Ticket ${code} validation failed`, 'error');
        }
        
        updateScanStats();
        showScanResult(code, isValid, method);
    }

    function showScanResult(code, isValid, method) {
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');
        const scannedCode = document.getElementById('scanned-code');
        const scanTime = document.getElementById('scan-time');
        const ticketStatus = document.getElementById('ticket-status');
        
        // Update result content
        scannedCode.textContent = code;
        scanTime.textContent = new Date().toLocaleTimeString();
        
        if (isValid) {
            scanResult.className = 'scan-result success';
            statusIcon.textContent = '✅';
            statusText.textContent = 'Valid Ticket';
            ticketStatus.textContent = 'Verified';
            admitAttendeeBtn.style.display = 'block';
        } else {
            scanResult.className = 'scan-result error';
            statusIcon.textContent = '❌';
            statusText.textContent = 'Invalid Ticket';
            ticketStatus.textContent = 'Rejected';
            admitAttendeeBtn.style.display = 'none';
        }
        
        scanResult.classList.remove('hidden');
        
        // Show toast notification
        const message = isValid ? 
            `Valid ticket scanned via ${method}` : 
            `Invalid ticket detected via ${method}`;
        showToast(message, isValid ? 'success' : 'error');
    }

    function hideResult() {
        scanResult.classList.add('hidden');
    }

    function admitAttendee() {
        const code = document.getElementById('scanned-code').textContent;
        showToast(`Attendee with ticket ${code} has been admitted`, 'success');
        hideResult();
        
        // Add to activity feed
        addActivityItem('🚪', `Attendee admitted - Ticket ${code}`, 'just now');
    }

    function updateScanStats() {
        document.getElementById('total-scanned').textContent = scanStats.total;
        document.getElementById('valid-tickets').textContent = scanStats.valid;
        document.getElementById('invalid-tickets').textContent = scanStats.invalid;
    }

    // Initialize stats
    updateScanStats();
    
    // Initialize debug logging
    addDebugLog('Ticket scanner initialized successfully', 'success');
}

function processQRResult(qrData) {
    addDebugLog(`Processing QR result: ${qrData}`, 'info');
    
    try {
        // Validate QR code data
        if (!qrData || qrData.trim() === '') {
            throw new Error('Empty QR code data');
        }

        // Try to parse as JSON first (for structured ticket data)
        let ticketData;
        try {
            ticketData = JSON.parse(qrData);
            addDebugLog('QR data parsed as JSON', 'success');
        } catch (jsonError) {
            // If not JSON, treat as plain text ticket ID
            ticketData = { ticketId: qrData.trim() };
            addDebugLog('QR data treated as plain text ticket ID', 'info');
        }

        // Display scan result
        displayScanResult(ticketData);
        
        // Update statistics
        updateScanStats('success');
        
        // Show success message
        showToast('QR code scanned successfully!', 'success');
        
        addDebugLog('QR result processed successfully', 'success');

    } catch (error) {
        addDebugLog(`Error processing QR result: ${error.message}`, 'error');
        
        // Update statistics
        updateScanStats('error');
        
        // Show error message
        showToast('Failed to process QR code', 'error');
        
        // Display error result
        displayScanResult({ error: 'Invalid QR code format' });
    }
}

function displayScanResult(data) {
    const resultDiv = document.getElementById('scan-result');
    if (!resultDiv) {
        addDebugLog('Scan result element not found', 'error');
        return;
    }

    let resultHTML = '<div class="scan-result-content">';
    
    if (data.error) {
        resultHTML += `
            <div class="result-status error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Scan Error</span>
            </div>
            <div class="result-details">
                <p><strong>Error:</strong> ${data.error}</p>
            </div>
        `;
    } else {
        resultHTML += `
            <div class="result-status success">
                <i class="fas fa-check-circle"></i>
                <span>Scan Successful</span>
            </div>
            <div class="result-details">
                <p><strong>Ticket ID:</strong> ${data.ticketId || 'Unknown'}</p>
                ${data.eventName ? `<p><strong>Event:</strong> ${data.eventName}</p>` : ''}
                ${data.attendeeName ? `<p><strong>Attendee:</strong> ${data.attendeeName}</p>` : ''}
                ${data.seatNumber ? `<p><strong>Seat:</strong> ${data.seatNumber}</p>` : ''}
                <p><strong>Scanned:</strong> ${new Date().toLocaleString()}</p>
            </div>
        `;
    }
    
    resultHTML += '</div>';
    resultDiv.innerHTML = resultHTML;
    resultDiv.style.display = 'block';
    
    addDebugLog('Scan result displayed', 'info');
}

function updateScanStats(result) {
    const statsElements = {
        total: document.getElementById('total-scans'),
        valid: document.getElementById('valid-scans'),
        invalid: document.getElementById('invalid-scans')
    };

    // Update internal counters
    if (!window.scanStats) {
        window.scanStats = { total: 0, valid: 0, invalid: 0 };
    }

    window.scanStats.total++;
    if (result === 'success') {
        window.scanStats.valid++;
    } else {
        window.scanStats.invalid++;
    }

    // Update UI elements
    if (statsElements.total) {
        statsElements.total.textContent = window.scanStats.total;
    }
    if (statsElements.valid) {
        statsElements.valid.textContent = window.scanStats.valid;
    }
    if (statsElements.invalid) {
        statsElements.invalid.textContent = window.scanStats.invalid;
    }
    
    addDebugLog(`Stats updated - Total: ${window.scanStats.total}, Valid: ${window.scanStats.valid}, Invalid: ${window.scanStats.invalid}`, 'info');
}