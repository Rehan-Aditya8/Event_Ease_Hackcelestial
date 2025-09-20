// Import Firebase auth
import { auth, db } from '../js/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

console.log('=== DASHBOARD.JS LOADING ===');

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DASHBOARD.JS DOM CONTENT LOADED ===');
    const userNameSpan = document.getElementById('userName');
    const userEmailSpan = document.getElementById('userEmail');
    const welcomeUserNameSpan = document.getElementById('welcomeUserName');
    const userAvatarImg = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    const navItems = document.querySelectorAll('.dashboard-sidebar .nav-item');
    const views = document.querySelectorAll('.dashboard-content .view');
    const backButtons = document.querySelectorAll('.back-btn');

    // EasyEntry elements
    const eventCodeForm = document.getElementById('eventCodeForm');
    const eventCodeInput = document.getElementById('eventCode');
    const qrTicketSection = document.getElementById('qr-ticket');
    const qrcodeDiv = document.getElementById('qrcode');
    const ticketUserSpan = document.getElementById('ticketUser');
    const ticketCodeSpan = document.getElementById('ticketCode');

    // Announcements elements
    const announcementsList = document.getElementById('announcement-items');
    const announcementFilters = document.querySelectorAll('.announcement-filters .filter-btn');

    // Lost & Found elements
    const chatBox = document.getElementById('chatBox');
    const chatForm = document.getElementById('chatForm');
    const chatNameInput = document.getElementById('chatName');
    const chatMessageInput = document.getElementById('chatMessage');
    const chatImageInput = document.getElementById('chatImage');
    
    // Volunteer Lost & Found elements
    const volunteerChatBox = document.getElementById('volunteerChatBox');
    const volunteerChatForm = document.getElementById('volunteerChatForm');
    const volunteerChatNameInput = document.getElementById('volunteerChatName');
    const volunteerChatMessageInput = document.getElementById('volunteerChatMessage');
    const volunteerChatImageInput = document.getElementById('volunteerChatImage');

    // Medical elements
    const sosButton = document.getElementById('sos-button');
    const locationStatusDiv = document.getElementById('location-status');
    const userMapDiv = document.getElementById('user-map');

    // Toast Notification
    const toast = document.getElementById('toast');

    // Initialize dashboard based on user role
    function initDashboard() {
        const role = sessionStorage.getItem('role') || 'user';
        const userDashboard = document.getElementById('user-dashboard');
        const volunteerDashboard = document.getElementById('volunteer-dashboard');
        
        if (role === 'volunteer') {
            if (userDashboard) userDashboard.classList.add('hidden');
            if (volunteerDashboard) volunteerDashboard.classList.remove('hidden');
        } else {
            if (userDashboard) userDashboard.classList.remove('hidden');
            if (volunteerDashboard) volunteerDashboard.classList.add('hidden');
        }
        
        // Check for hash navigation to show specific section
        const hash = window.location.hash;
        if (hash === '#volunteer-dashboard' && role === 'volunteer') {
            // Ensure volunteer dashboard is visible and scroll to it
            if (volunteerDashboard) {
                volunteerDashboard.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    
    // Initialize dashboard on load
    initDashboard();
    function updateUserInfo(user) {
        if (user) {
            // Get additional user data from Firestore
            getDoc(doc(db, "users", user.uid))
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        
                        // Update UI with user information
                        const displayName = user.displayName || userData.name || 'User';
                        const userEmail = user.email || userData.email || '';
                        
                        // Display name and email separately
                        userNameSpan.textContent = displayName;
                        if (userEmailSpan) userEmailSpan.textContent = userEmail;
                        welcomeUserNameSpan.textContent = displayName;
                        userAvatarImg.src = user.photoURL || 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=U';
                        if (ticketUserSpan) ticketUserSpan.textContent = displayName;
                        
                        // Log user info for debugging
                        console.log("User info:", { name: displayName, email: userEmail });
                        
                        showToast("Welcome back, " + displayName, "success");
                    }
                })
                .catch(error => {
                    console.error("Error getting user data:", error);
                });
        } else {
            // Redirect to login if no user is found
            window.location.href = '../pages/login.html';
        }
    }
    
    // Check authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            console.log("User authenticated:", user.email);
            updateUserInfo(user);
        } else {
            // User is signed out
            window.location.href = '../pages/login.html';
        }
    });

    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            // Sign-out successful
            window.location.href = '../index.html';
        }).catch((error) => {
            // An error happened
            console.error("Error signing out:", error);
            showToast("Error signing out", "error");
        });
    });

    // --- View Management ---
    // Navigation handling
    const navButtons = document.querySelectorAll('.nav-btn');
    const cardButtons = document.querySelectorAll('[data-view]');
    
    function showView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });
        
        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
            targetView.classList.remove('hidden');
        }

        // Update navigation button states
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewId) {
                btn.classList.add('active');
            }
        });
        
        // Initialize view-specific functionality
        if (viewId === 'ticket') {
            initQRScanner();
        } else if (viewId === 'announcements') {
            console.log('=== SWITCHING TO ANNOUNCEMENTS VIEW ===');
            renderAnnouncements();
        } else if (viewId === 'lostfound') {
            initLostFoundTabs();
        } else if (viewId === 'emergency') {
            initEmergencyMap();
            updateEmergencyStats();
            renderEmergencyList();
        } else if (viewId === 'volunteer-parking') {
            // Redirect to functions.html for volunteer parking management
            window.location.href = 'functions.html#volunteer-parking';
        }
    }

    // Add event listeners to all navigation elements
    cardButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('=== CARD BUTTON CLICKED ===', btn.getAttribute('data-view'));
            e.preventDefault();
            const targetView = btn.getAttribute('data-view');
            if (targetView) {
                showView(targetView);
            }
        });
    });

    // --- EasyEntry Functionality ---
    eventCodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const eventCode = eventCodeInput.value;
        if (eventCode.length === 6) {
            ticketCodeSpan.textContent = eventCode;
            // Generate QR Code
            qrcodeDiv.innerHTML = ''; // Clear previous QR
            new QRCode(qrcodeDiv, {
                text: `EventEase-Ticket-${eventCode}-${userNameSpan.textContent}`,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            qrTicketSection.classList.remove('hidden');
            showToast('Entry pass generated successfully!', 'success');
        } else {
            showToast('Please enter a valid 6-digit event code.', 'error');
        }
    });

    // --- Volunteer QR Scanner Functionality ---
    const startQRScannerBtn = document.getElementById('start-qr-scanner');
    const closeQRScannerBtn = document.getElementById('close-scanner');
    const resetScannerBtn = document.getElementById('reset-scanner');
    const scannerPreview = document.getElementById('scanner-preview');
    const scanResult = document.getElementById('scan-result');
    const volunteerScanner = document.getElementById('volunteer-scanner');
    const volunteerOptions = document.querySelector('.volunteer-options');

    let qrScanner = null;
    let scannerStream = null;

    if (startQRScannerBtn) {
        startQRScannerBtn.addEventListener('click', async () => {
            try {
                await startQRScanner();
            } catch (error) {
                showToast('Camera access denied or not available', 'error');
            }
        });
    }

    if (closeQRScannerBtn) {
        closeQRScannerBtn.addEventListener('click', () => {
            stopQRScanner();
            volunteerScanner.classList.add('hidden');
            volunteerOptions.classList.remove('hidden');
        });
    }

    if (resetScannerBtn) {
        resetScannerBtn.addEventListener('click', () => {
            scanResult.classList.add('hidden');
            startQRScanner();
        });
    }

    // Enhanced QR Scanner functionality for user dashboard
    let scannerStream = null;
    let isScanning = false;
    let currentCamera = 'environment'; // 'user' for front camera, 'environment' for back camera

    // Get scanner elements
    const startCameraBtn = document.getElementById('start-camera');
    const stopCameraBtn = document.getElementById('stop-camera');
    const switchCameraBtn = document.getElementById('switch-camera');
    const scannerStatus = document.getElementById('scanner-status');
    const scannerPreview = document.getElementById('scanner-preview');
    const closeScannerBtn = document.getElementById('close-scanner');
    const resetScannerBtn = document.getElementById('reset-scanner');

    // Initialize scanner event listeners
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', startCamera);
    }
    if (stopCameraBtn) {
        stopCameraBtn.addEventListener('click', stopCamera);
    }
    if (switchCameraBtn) {
        switchCameraBtn.addEventListener('click', switchCamera);
    }
    if (closeScannerBtn) {
        closeScannerBtn.addEventListener('click', closeScannerView);
    }
    if (resetScannerBtn) {
        resetScannerBtn.addEventListener('click', resetScanner);
    }

    async function startCamera() {
        try {
            updateScannerStatus('Requesting camera access...', 'scanning');
            
            const constraints = {
                video: {
                    facingMode: currentCamera,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
            scannerPreview.srcObject = scannerStream;
            
            await scannerPreview.play();
            
            // Update UI
            startCameraBtn.style.display = 'none';
            stopCameraBtn.style.display = 'inline-flex';
            switchCameraBtn.style.display = 'inline-flex';
            
            updateScannerStatus('Camera active - Position QR code in frame', 'scanning');
            
            // Start QR detection
            isScanning = true;
            detectQRCode();
            
            showToast('Camera started successfully', 'success');
        } catch (error) {
            console.error('Camera access error:', error);
            updateScannerStatus('Camera access denied', 'error');
            showToast('Unable to access camera. Please check permissions.', 'error');
        }
    }

    function stopCamera() {
        if (scannerStream) {
            scannerStream.getTracks().forEach(track => track.stop());
            scannerStream = null;
        }
        
        if (scannerPreview) {
            scannerPreview.srcObject = null;
        }
        
        isScanning = false;
        
        // Update UI
        startCameraBtn.style.display = 'inline-flex';
        stopCameraBtn.style.display = 'none';
        switchCameraBtn.style.display = 'none';
        
        updateScannerStatus('Camera stopped', '');
        showToast('Camera stopped', 'info');
    }

    async function switchCamera() {
        if (!scannerStream) return;
        
        // Stop current stream
        stopCamera();
        
        // Switch camera mode
        currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
        
        // Start with new camera
        setTimeout(() => {
            startCamera();
        }, 500);
        
        showToast(`Switched to ${currentCamera === 'environment' ? 'back' : 'front'} camera`, 'info');
    }

    function updateScannerStatus(message, type = '') {
        if (scannerStatus) {
            const statusText = scannerStatus.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = message;
            }
            
            // Remove existing status classes
            scannerStatus.classList.remove('scanning', 'error');
            
            // Add new status class
            if (type) {
                scannerStatus.classList.add(type);
            }
        }
    }

    function detectQRCode() {
        if (!isScanning || !scannerPreview || scannerPreview.readyState !== 4) {
            if (isScanning) {
                setTimeout(detectQRCode, 100);
            }
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = scannerPreview.videoWidth;
        canvas.height = scannerPreview.videoHeight;
        
        context.drawImage(scannerPreview, 0, 0, canvas.width, canvas.height);
        
        try {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                handleQRScanResult(code.data);
                return;
            }
        } catch (error) {
            console.error('QR detection error:', error);
        }

        // Continue scanning if no result found and scanner is still active
        if (isScanning && !scanResult.classList.contains('hidden')) {
            return; // Stop scanning if result is shown
        }

        if (isScanning) {
            setTimeout(detectQRCode, 100);
        }
    }

    function closeScannerView() {
        stopCamera();
        volunteerScanner.classList.add('hidden');
        volunteerOptions.classList.remove('hidden');
        scanResult.classList.add('hidden');
    }

    function resetScanner() {
        scanResult.classList.add('hidden');
        updateScannerStatus('Ready to scan', '');
        
        // Restart scanning if camera is active
        if (scannerStream && !isScanning) {
            isScanning = true;
            detectQRCode();
        }
    }

    async function startQRScanner() {
        try {
            volunteerOptions.classList.add('hidden');
            volunteerScanner.classList.remove('hidden');
            scanResult.classList.add('hidden');

            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            scannerStream = stream;
            scannerPreview.srcObject = stream;
            scannerPreview.play();

            // Start QR code detection
            detectQRCode();
        } catch (error) {
            showToast('Unable to access camera', 'error');
            volunteerScanner.classList.add('hidden');
            volunteerOptions.classList.remove('hidden');
        }
    }

    function stopQRScanner() {
        if (scannerStream) {
            scannerStream.getTracks().forEach(track => track.stop());
            scannerStream = null;
        }
        if (scannerPreview) {
            scannerPreview.srcObject = null;
        }
    }

    function detectQRCode() {
        if (!scannerPreview || scannerPreview.readyState !== 4) {
            setTimeout(detectQRCode, 100);
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = scannerPreview.videoWidth;
        canvas.height = scannerPreview.videoHeight;
        
        context.drawImage(scannerPreview, 0, 0, canvas.width, canvas.height);
        
        try {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                handleQRScanResult(code.data);
                return;
            }
        } catch (error) {
            // Continue scanning
        }

        if (!scanResult.classList.contains('hidden')) {
            return; // Stop scanning if result is shown
        }

        setTimeout(detectQRCode, 100);
    }

    function handleQRScanResult(qrData) {
        stopQRScanner();
        
        // Parse QR code data
        if (qrData.includes('EventEase-Ticket-')) {
            const parts = qrData.split('-');
            const eventCode = parts[2];
            const userName = parts[3];
            
            const resultContent = scanResult.querySelector('.result-content');
            resultContent.innerHTML = `
                <div class="scan-success">
                    <div class="success-icon">✅</div>
                    <h3>Valid Ticket Scanned</h3>
                    <div class="ticket-details">
                        <p><strong>Event Code:</strong> ${eventCode}</p>
                        <p><strong>Attendee:</strong> ${userName}</p>
                        <p><strong>Status:</strong> <span class="status-valid">VERIFIED</span></p>
                        <p><strong>Gate:</strong> 3</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            `;
            showToast('Ticket verified successfully!', 'success');
        } else {
            const resultContent = scanResult.querySelector('.result-content');
            resultContent.innerHTML = `
                <div class="scan-error">
                    <div class="error-icon">❌</div>
                    <h3>Invalid QR Code</h3>
                    <p>This QR code is not a valid EventEase ticket.</p>
                    <p class="scanned-data">Scanned: ${qrData}</p>
                </div>
            `;
            showToast('Invalid QR code scanned', 'error');
        }
        
        scanResult.classList.remove('hidden');
    }

    // --- Announcements Functionality ---
    // Load announcements from localStorage (shared with volunteer dashboard)
    function loadAnnouncementsFromStorage() {
        try {
            console.log('Loading announcements from localStorage...');
            
            // Check if localStorage is available
            if (typeof(Storage) === "undefined") {
                console.warn('localStorage not supported');
                return getDefaultAnnouncements();
            }
            
            const storedData = localStorage.getItem('announcements');
            console.log('Raw stored data:', storedData);
            
            const storedAnnouncements = JSON.parse(storedData || '[]');
            console.log('Parsed announcements:', storedAnnouncements);
            
            // If no stored announcements, use default ones
            if (!storedAnnouncements || storedAnnouncements.length === 0) {
                console.log('No stored announcements found, using defaults');
                const defaultAnnouncements = getDefaultAnnouncements();
                localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
                return defaultAnnouncements;
            }
            
            console.log('Successfully loaded', storedAnnouncements.length, 'announcements');
            return storedAnnouncements;
        } catch (error) {
            console.error('Error loading announcements from storage:', error);
            console.log('Falling back to default announcements');
            return getDefaultAnnouncements();
        }
    }
    
    function getDefaultAnnouncements() {
        return [
            { id: 1, title: 'Welcome to HackCelestial 2.0!', content: 'The event has officially started. Enjoy your time!', priority: 'normal', timestamp: '2023-10-27T09:00:00Z', author: 'Event Team' },
            { id: 2, title: 'Lunch Break Reminder', content: 'Lunch will be served at 12:30 PM in the main cafeteria.', priority: 'important', timestamp: '2023-10-27T12:00:00Z', author: 'Event Team' },
            { id: 3, title: 'Emergency Drill at 3 PM', content: 'Please follow all instructions during the drill. This is NOT a real emergency.', priority: 'urgent', timestamp: '2023-10-27T14:30:00Z', author: 'Safety Team' },
            { id: 4, title: 'Workshop: Intro to AI', content: 'Join our AI workshop at 4 PM in Room 301.', priority: 'normal', timestamp: '2023-10-27T15:00:00Z', author: 'Workshop Team' }
        ];
    }
    
    let announcements = loadAnnouncementsFromStorage();

    // Volunteer Announcement Form
    const announcementForm = document.getElementById('announcementForm');
    const announcementTitle = document.getElementById('announcementTitle');
    const announcementContent = document.getElementById('announcementContent');
    const announcementPriority = document.getElementById('announcementPriority');

    if (announcementForm) {
        announcementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = announcementTitle.value.trim();
            const content = announcementContent.value.trim();
            const priority = announcementPriority.value;
            const author = userNameSpan.textContent || 'Volunteer';

            if (title && content) {
                const newAnnouncement = {
                    id: announcements.length + 1,
                    title: title,
                    content: content,
                    priority: priority,
                    timestamp: new Date().toISOString(),
                    author: author
                };

                announcements.unshift(newAnnouncement); // Add to beginning
                
                // Save to localStorage to share with user dashboard
                localStorage.setItem('announcements', JSON.stringify(announcements));
                
                renderAnnouncements();
                
                // Clear form
                announcementTitle.value = '';
                announcementContent.value = '';
                announcementPriority.value = 'normal';
                
                showToast(`${priority.charAt(0).toUpperCase() + priority.slice(1)} announcement posted successfully!`, 'success');
            } else {
                showToast('Please fill in all fields', 'error');
            }
        });
    }

    function renderAnnouncements(filter = 'all') {
        console.log('=== RENDER ANNOUNCEMENTS START ===');
        console.log('Rendering announcements with filter:', filter);
        
        // Reload announcements from storage to get latest updates
        announcements = loadAnnouncementsFromStorage();
        console.log('Loaded announcements for rendering:', announcements);
        
        // TEST: Force some test data if no announcements exist
        if (!announcements || announcements.length === 0) {
            console.log('No announcements found, using test data');
            announcements = [
                {
                    id: 'test-1',
                    title: 'Test Announcement',
                    content: 'This is a test announcement to verify rendering works.',
                    priority: 'normal',
                    timestamp: new Date().toISOString(),
                    author: 'Test System'
                }
            ];
            console.log('Using test announcements:', announcements);
        }
        
        console.log('Looking for element with ID: announcement-items');
        const announcementsList = document.getElementById('announcement-items');
        console.log('Found announcementsList element:', announcementsList);
        
        if (!announcementsList) {
            console.error('announcementsList element not found');
            console.log('Available elements with "announcement" in ID:');
            const allElements = document.querySelectorAll('[id*="announcement"]');
            allElements.forEach(el => console.log('- Found element:', el.id, el));
            return;
        }
        
        announcementsList.innerHTML = '';
        const filteredAnnouncements = filter === 'all' ? announcements : announcements.filter(a => a.priority === filter);
        console.log('Filtered announcements:', filteredAnnouncements);

        if (filteredAnnouncements.length === 0) {
            console.log('No announcements to display, showing empty state');
            announcementsList.innerHTML = `
                <li class="empty-state">No announcements yet</li>
            `;
            console.log('Empty state HTML set');
            return;
        }

        console.log('Processing', filteredAnnouncements.length, 'announcements');
        filteredAnnouncements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log('Sorted announcements:', filteredAnnouncements);

        filteredAnnouncements.forEach((announcement, index) => {
            console.log(`Rendering announcement ${index + 1}:`, announcement);
            const announcementLi = document.createElement('li');
            announcementLi.classList.add('announcement-item', announcement.priority);
            const author = announcement.author || 'Event Team';
            const htmlContent = `
                <h4>${announcement.title}</h4>
                <p>${announcement.content}</p>
                <div class="announcement-meta">
                    <span>By: ${author}</span>
                    <span>Priority: ${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}</span>
                    <span>${new Date(announcement.timestamp).toLocaleString()}</span>
                </div>
            `;
            announcementLi.innerHTML = htmlContent;
            console.log('Created announcement element:', announcementLi);
            announcementsList.appendChild(announcementLi);
            console.log('Appended announcement to list');
        });
        
        console.log('=== RENDER ANNOUNCEMENTS COMPLETE ===');
        console.log('Final announcementsList innerHTML:', announcementsList.innerHTML);
    }

    announcementFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            announcementFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAnnouncements(btn.dataset.filter);
        });
    });

    // --- Lost & Found Functionality ---
    let lostFoundItems = [
        { id: 1, name: 'Blue Backpack', description: 'Navy blue backpack with laptop compartment', location: 'Main Hall', category: 'accessories', status: 'found', dateFound: '2023-10-27T10:30:00Z', foundBy: 'Volunteer Team' },
        { id: 2, name: 'iPhone 13', description: 'Black iPhone 13 with cracked screen protector', location: 'Room 301', category: 'electronics', status: 'returned', dateFound: '2023-10-27T11:15:00Z', foundBy: 'Security' },
        { id: 3, name: 'Red Hoodie', description: 'Red hoodie size M with university logo', location: 'Cafeteria', category: 'clothing', status: 'found', dateFound: '2023-10-27T12:00:00Z', foundBy: 'Cleaning Staff' }
    ];

    // Lost & Found Tab Management
    const lostFoundTabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    lostFoundTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            lostFoundTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}-tab`) {
                    content.classList.add('active');
                }
            });
            
            // Load content based on tab
            if (targetTab === 'manage') {
                renderLostFoundItems();
            } else if (targetTab === 'reports') {
                generateReportsSummary();
            }
        });
    });

    // Add Item Modal Management
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemModal = document.getElementById('addItemModal');
    const closeModal = document.getElementById('closeModal');
    const cancelAdd = document.getElementById('cancelAdd');
    const addItemForm = document.getElementById('addItemForm');

    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            addItemModal.classList.remove('hidden');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            addItemModal.classList.add('hidden');
        });
    }

    if (cancelAdd) {
        cancelAdd.addEventListener('click', () => {
            addItemModal.classList.add('hidden');
        });
    }

    if (addItemForm) {
        addItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const itemName = document.getElementById('itemName').value;
            const itemDescription = document.getElementById('itemDescription').value;
            const itemLocation = document.getElementById('itemLocation').value;
            const itemCategory = document.getElementById('itemCategory').value;
            const itemImage = document.getElementById('itemImage').files[0];
            
            const newItem = {
                id: lostFoundItems.length + 1,
                name: itemName,
                description: itemDescription,
                location: itemLocation,
                category: itemCategory,
                status: 'found',
                dateFound: new Date().toISOString(),
                foundBy: userNameSpan.textContent || 'Volunteer'
            };
            
            if (itemImage) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newItem.image = e.target.result;
                    lostFoundItems.unshift(newItem);
                    renderLostFoundItems();
                    addItemModal.classList.add('hidden');
                    addItemForm.reset();
                    showToast('Item added successfully!', 'success');
                };
                reader.readAsDataURL(itemImage);
            } else {
                lostFoundItems.unshift(newItem);
                renderLostFoundItems();
                addItemModal.classList.add('hidden');
                addItemForm.reset();
                showToast('Item added successfully!', 'success');
            }
        });
    }

    // Item Filters
    const itemFilters = document.querySelectorAll('.filter-btn');
    itemFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            itemFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            renderLostFoundItems(filter.dataset.filter);
        });
    });

    function renderLostFoundItems(filter = 'all') {
        const itemsList = document.getElementById('itemsList');
        if (!itemsList) return;
        
        const filteredItems = filter === 'all' 
            ? lostFoundItems 
            : lostFoundItems.filter(item => item.status === filter);

        itemsList.innerHTML = '';
        
        if (filteredItems.length === 0) {
            itemsList.innerHTML = '<div class="empty-state">No items found</div>';
            return;
        }

        filteredItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-card', `status-${item.status}`);
            
            const timeAgo = getTimeAgo(item.dateFound);
            const statusColor = item.status === 'returned' ? 'green' : item.status === 'found' ? 'blue' : 'orange';
            
            itemDiv.innerHTML = `
                <div class="item-header">
                    <h4 class="item-name">${item.name}</h4>
                    <span class="item-status status-${item.status}">${item.status.toUpperCase()}</span>
                </div>
                <div class="item-details">
                    <p class="item-description">${item.description}</p>
                    <div class="item-meta">
                        <span class="item-location">📍 ${item.location}</span>
                        <span class="item-category">🏷️ ${item.category}</span>
                        <span class="item-date">🕒 ${timeAgo}</span>
                        <span class="item-finder">👤 ${item.foundBy}</span>
                    </div>
                </div>
                ${item.image ? `<div class="item-image"><img src="${item.image}" alt="${item.name}" /></div>` : ''}
                <div class="item-actions">
                    ${item.status === 'found' ? `<button class="btn secondary mark-returned" data-id="${item.id}">Mark as Returned</button>` : ''}
                    <button class="btn ghost edit-item" data-id="${item.id}">Edit</button>
                </div>
            `;
            
            itemsList.appendChild(itemDiv);
        });

        // Add event listeners for item actions
        document.querySelectorAll('.mark-returned').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.id);
                const item = lostFoundItems.find(i => i.id === itemId);
                if (item) {
                    item.status = 'returned';
                    item.returnedDate = new Date().toISOString();
                    renderLostFoundItems(filter);
                    showToast('Item marked as returned!', 'success');
                }
            });
        });
    }

    function generateReportsSummary() {
        const totalItems = document.getElementById('totalItems');
        const returnedItems = document.getElementById('returnedItems');
        const pendingItems = document.getElementById('pendingItems');
        
        if (totalItems) totalItems.textContent = lostFoundItems.length;
        if (returnedItems) returnedItems.textContent = lostFoundItems.filter(i => i.status === 'returned').length;
        if (pendingItems) pendingItems.textContent = lostFoundItems.filter(i => i.status === 'found').length;
    }

    function renderChatMessages() {
        chatBox.innerHTML = '';
        chatMessages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('chat-message');
            if (msg.sender === userNameSpan.textContent) {
                msgDiv.classList.add('self');
            }
            msgDiv.innerHTML = `
                <div class="message-meta">${msg.sender} - ${new Date(msg.timestamp).toLocaleString()}</div>
                <div class="message-content">${msg.message}</div>
                ${msg.image ? `<img src="${msg.image}" alt="Chat Image" />` : ''}
            `;
            chatBox.appendChild(msgDiv);
        });
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
    }

    function renderVolunteerChatMessages() {
        if (volunteerChatBox) {
            volunteerChatBox.innerHTML = '';
            chatMessages.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('chat-message');
                if (msg.sender === userNameSpan.textContent) {
                    msgDiv.classList.add('self');
                }
                msgDiv.innerHTML = `
                    <div class="message-meta">${msg.sender} - ${new Date(msg.timestamp).toLocaleString()}</div>
                    <div class="message-content">${msg.message}</div>
                    ${msg.image ? `<img src="${msg.image}" alt="Chat Image" />` : ''}
                `;
                volunteerChatBox.appendChild(msgDiv);
            });
            volunteerChatBox.scrollTop = volunteerChatBox.scrollHeight; // Scroll to bottom
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const sender = chatNameInput.value || userNameSpan.textContent;
        const message = chatMessageInput.value;
        const imageFile = chatImageInput.files[0];
        let imageUrl = '';

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageUrl = e.target.result;
                chatMessages.push({ sender, message, image: imageUrl, timestamp: new Date().toISOString() });
                renderChatMessages();
                renderVolunteerChatMessages();
                chatMessageInput.value = '';
                chatImageInput.value = '';
            };
            reader.readAsDataURL(imageFile);
        } else if (message.trim() !== '') {
            chatMessages.push({ sender, message, image: imageUrl, timestamp: new Date().toISOString() });
            renderChatMessages();
            renderVolunteerChatMessages();
            chatMessageInput.value = '';
        } else {
            showToast('Please enter a message or select an image.', 'error');
        }
    });

    // Volunteer chat form event listener
    if (volunteerChatForm) {
        volunteerChatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sender = volunteerChatNameInput.value || userNameSpan.textContent;
            const message = volunteerChatMessageInput.value;
            const imageFile = volunteerChatImageInput.files[0];
            let imageUrl = '';

            if (imageFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imageUrl = e.target.result;
                    chatMessages.push({ sender, message, image: imageUrl, timestamp: new Date().toISOString() });
                    renderChatMessages();
                    renderVolunteerChatMessages();
                    volunteerChatMessageInput.value = '';
                    volunteerChatImageInput.value = '';
                };
                reader.readAsDataURL(imageFile);
            } else if (message.trim() !== '') {
                chatMessages.push({ sender, message, image: imageUrl, timestamp: new Date().toISOString() });
                renderChatMessages();
                renderVolunteerChatMessages();
                volunteerChatMessageInput.value = '';
            } else {
                showToast('Please enter a message or select an image.', 'error');
            }
        });
    }

    // --- Medical Emergency Functionality ---
    let activeEmergencies = [
        { 
            id: 'emergency-1', 
            userName: 'John Doe', 
            location: { lat: 19.0330, lng: 73.0297 }, 
            timestamp: '2023-10-27T14:30:00Z', 
            status: 'active',
            description: 'Chest pain, difficulty breathing',
            priority: 'high'
        },
        { 
            id: 'emergency-2', 
            userName: 'Sarah Smith', 
            location: { lat: 19.0380, lng: 73.0320 }, 
            timestamp: '2023-10-27T14:45:00Z', 
            status: 'active',
            description: 'Allergic reaction',
            priority: 'medium'
        }
    ];

    let resolvedEmergencies = [];
    let currentEmergencyMap = null;

    // Emergency Statistics Update
    function updateEmergencyStats() {
        const activeCount = activeEmergencies.length;
        const resolvedToday = resolvedEmergencies.filter(e => {
            const today = new Date().toDateString();
            return new Date(e.resolvedAt).toDateString() === today;
        }).length;
        
        const avgResponse = resolvedEmergencies.length > 0 
            ? Math.round(resolvedEmergencies.reduce((sum, e) => sum + (e.responseTime || 0), 0) / resolvedEmergencies.length)
            : 0;

        const activeEmergenciesEl = document.getElementById('activeEmergencies');
        const resolvedTodayEl = document.getElementById('resolvedToday');
        const avgResponseTimeEl = document.getElementById('avgResponseTime');

        if (activeEmergenciesEl) activeEmergenciesEl.textContent = activeCount;
        if (resolvedTodayEl) resolvedTodayEl.textContent = resolvedToday;
        if (avgResponseTimeEl) avgResponseTimeEl.textContent = avgResponse;
    }

    // Emergency List Rendering
    function renderEmergencyList() {
        const emergencyRequests = document.getElementById('emergency-requests');
        if (!emergencyRequests) return;

        emergencyRequests.innerHTML = '';

        if (activeEmergencies.length === 0) {
            const noEmergencies = document.createElement('li');
            noEmergencies.className = 'no-emergencies';
            noEmergencies.innerHTML = '<span class="empty-state">✅ No active emergencies</span>';
            emergencyRequests.appendChild(noEmergencies);
            return;
        }

        activeEmergencies.forEach(emergency => {
            const li = document.createElement('li');
            li.className = `emergency-item priority-${emergency.priority}`;
            
            const timeAgo = getTimeAgo(emergency.timestamp);
            const priorityIcon = emergency.priority === 'high' ? '🔴' : emergency.priority === 'medium' ? '🟡' : '🟢';
            
            li.innerHTML = `
                <div class="emergency-header">
                    <span class="priority-indicator">${priorityIcon}</span>
                    <strong class="user-name">${emergency.userName}</strong>
                    <span class="time-stamp">${timeAgo}</span>
                </div>
                <div class="emergency-description">${emergency.description}</div>
                <div class="emergency-actions">
                    <button class="btn primary small view-details" data-id="${emergency.id}">View Details</button>
                    <button class="btn success small respond-btn" data-id="${emergency.id}">Respond</button>
                </div>
            `;
            
            emergencyRequests.appendChild(li);
        });

        // Add event listeners for emergency actions
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emergencyId = e.target.dataset.id;
                showEmergencyDetails(emergencyId);
            });
        });

        document.querySelectorAll('.respond-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emergencyId = e.target.dataset.id;
                respondToEmergency(emergencyId);
            });
        });
    }

    // Emergency Details Modal
    function showEmergencyDetails(emergencyId) {
        const emergency = activeEmergencies.find(e => e.id === emergencyId);
        if (!emergency) return;

        const modal = document.getElementById('emergencyModal');
        const detailsContainer = document.getElementById('emergencyDetails');
        
        if (!modal || !detailsContainer) return;

        const timeAgo = getTimeAgo(emergency.timestamp);
        const priorityColor = emergency.priority === 'high' ? '#ff4444' : emergency.priority === 'medium' ? '#ffaa00' : '#44ff44';
        
        detailsContainer.innerHTML = `
            <div class="emergency-detail-card">
                <div class="detail-header">
                    <h4>${emergency.userName}</h4>
                    <span class="priority-badge" style="background-color: ${priorityColor}">
                        ${emergency.priority.toUpperCase()} PRIORITY
                    </span>
                </div>
                <div class="detail-info">
                    <p><strong>Description:</strong> ${emergency.description}</p>
                    <p><strong>Time:</strong> ${timeAgo}</p>
                    <p><strong>Location:</strong> ${emergency.location.lat.toFixed(4)}, ${emergency.location.lng.toFixed(4)}</p>
                    <p><strong>Status:</strong> ${emergency.status}</p>
                </div>
                <div class="location-preview">
                    <h5>📍 Emergency Location</h5>
                    <div class="coordinates">
                        Lat: ${emergency.location.lat.toFixed(6)}<br>
                        Lng: ${emergency.location.lng.toFixed(6)}
                    </div>
                </div>
            </div>
        `;

        // Set up modal buttons
        const respondBtn = document.getElementById('respondToEmergency');
        const resolveBtn = document.getElementById('markResolved');
        const cancelBtn = document.getElementById('cancelEmergency');

        if (respondBtn) {
            respondBtn.onclick = () => {
                respondToEmergency(emergencyId);
                modal.classList.add('hidden');
            };
        }

        if (resolveBtn) {
            resolveBtn.onclick = () => {
                markEmergencyResolved(emergencyId);
                modal.classList.add('hidden');
            };
        }

        if (cancelBtn) {
            cancelBtn.onclick = () => {
                modal.classList.add('hidden');
            };
        }

        modal.classList.remove('hidden');
    }

    // Emergency Response Functions
    function respondToEmergency(emergencyId) {
        const emergency = activeEmergencies.find(e => e.id === emergencyId);
        if (!emergency) return;

        emergency.status = 'responding';
        emergency.responseTime = Date.now();
        
        showToast(`🚨 Responding to ${emergency.userName}'s emergency`, 'info');
        renderEmergencyList();
        updateEmergencyStats();
        
        // Focus on emergency location on map
        if (currentEmergencyMap && emergency.location) {
            currentEmergencyMap.setView([emergency.location.lat, emergency.location.lng], 16);
        }
    }

    function markEmergencyResolved(emergencyId) {
        const emergencyIndex = activeEmergencies.findIndex(e => e.id === emergencyId);
        if (emergencyIndex === -1) return;

        const emergency = activeEmergencies[emergencyIndex];
        emergency.status = 'resolved';
        emergency.resolvedAt = new Date().toISOString();
        emergency.responseTime = emergency.responseTime 
            ? Math.round((Date.now() - emergency.responseTime) / 60000) 
            : Math.round((Date.now() - new Date(emergency.timestamp).getTime()) / 60000);

        resolvedEmergencies.push(emergency);
        activeEmergencies.splice(emergencyIndex, 1);

        showToast(`✅ Emergency resolved for ${emergency.userName}`, 'success');
        renderEmergencyList();
        updateEmergencyStats();
        initEmergencyMap();
    }

    // Emergency Map Initialization
    function initEmergencyMap() {
        const mapContainer = document.getElementById('emergency-map');
        if (!mapContainer) return;

        // Clear existing map
        if (currentEmergencyMap) {
            currentEmergencyMap.remove();
        }

        // Initialize new map
        currentEmergencyMap = L.map('emergency-map').setView([19.0330, 73.0297], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(currentEmergencyMap);

        // Add emergency markers
        activeEmergencies.forEach(emergency => {
            const priorityColor = emergency.priority === 'high' ? '#ff4444' : 
                                 emergency.priority === 'medium' ? '#ffaa00' : '#44ff44';
            
            const emergencyIcon = L.divIcon({
                className: 'emergency-marker',
                html: `<div style="background-color: ${priorityColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });

            const marker = L.marker([emergency.location.lat, emergency.location.lng], { 
                icon: emergencyIcon 
            }).addTo(currentEmergencyMap);

            const timeAgo = getTimeAgo(emergency.timestamp);
            marker.bindPopup(`
                <div class="emergency-popup">
                    <h4>🚨 EMERGENCY</h4>
                    <p><strong>${emergency.userName}</strong></p>
                    <p>${emergency.description}</p>
                    <p><small>${timeAgo}</small></p>
                    <button onclick="respondToEmergency('${emergency.id}')" class="btn primary small">Respond</button>
                </div>
            `);
        });

        // Add medical facilities
        const medicalFacilities = [
            { name: "Navi Mumbai Hospital", lat: 19.0330, lng: 73.0297, type: "hospital" },
            { name: "Emergency Care Center", lat: 19.0380, lng: 73.0320, type: "emergency" },
            { name: "Medical Clinic", lat: 19.0280, lng: 73.0350, type: "clinic" }
        ];

        medicalFacilities.forEach(facility => {
            const facilityIcon = L.divIcon({
                className: 'medical-facility-marker',
                html: '<div style="background-color: #00aa44; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">+</div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            L.marker([facility.lat, facility.lng], { icon: facilityIcon })
                .addTo(currentEmergencyMap)
                .bindPopup(`<strong>${facility.name}</strong><br>Medical Facility`);
        });
    }

    // Emergency Control Buttons
    const refreshEmergenciesBtn = document.getElementById('refresh-emergencies');
    const centerMapBtn = document.getElementById('center-map');
    const emergencyHistoryBtn = document.getElementById('emergency-history');
    const closeEmergencyModalBtn = document.getElementById('closeEmergencyModal');

    if (refreshEmergenciesBtn) {
        refreshEmergenciesBtn.addEventListener('click', () => {
            renderEmergencyList();
            updateEmergencyStats();
            initEmergencyMap();
            showToast('Emergency data refreshed', 'info');
        });
    }

    if (centerMapBtn) {
        centerMapBtn.addEventListener('click', () => {
            if (currentEmergencyMap) {
                currentEmergencyMap.setView([19.0330, 73.0297], 13);
                showToast('Map centered on Navi Mumbai', 'info');
            }
        });
    }

    if (emergencyHistoryBtn) {
        emergencyHistoryBtn.addEventListener('click', () => {
            showToast(`${resolvedEmergencies.length} emergencies resolved today`, 'info');
        });
    }

    if (closeEmergencyModalBtn) {
        closeEmergencyModalBtn.addEventListener('click', () => {
            document.getElementById('emergencyModal').classList.add('hidden');
        });
    }

    let userMap = null;
    let userMarker = null;

    function initUserMap() {
        if (userMap) userMap.remove(); // Clean up existing map
        userMap = L.map(userMapDiv).setView([19.0760, 72.8777], 13); // Default to Mumbai
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(userMap);
    }

    // User SOS Button (existing functionality enhanced)
    if (sosButton) {
        sosButton.addEventListener('click', () => {
            sosButton.textContent = 'SENDING...';
            sosButton.disabled = true;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const newEmergency = {
                        id: `emergency-${Date.now()}`,
                        userName: userNameSpan.textContent || 'Anonymous User',
                        location: { 
                            lat: position.coords.latitude, 
                            lng: position.coords.longitude 
                        },
                        timestamp: new Date().toISOString(),
                        status: 'active',
                        description: 'Emergency assistance requested',
                        priority: 'high'
                    };

                    activeEmergencies.unshift(newEmergency);
                    renderEmergencyList();
                    updateEmergencyStats();
                    initEmergencyMap();

                    const { latitude, longitude } = position.coords;
                    locationStatusDiv.classList.remove('hidden');
                    locationStatusDiv.textContent = `Location sent: Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`;
                    showToast('🚨 Emergency request sent with your location!', 'success');

                    // Update map with current location
                    userMap.setView([latitude, longitude], 16);
                    if (userMarker) {
                        userMarker.setLatLng([latitude, longitude]);
                    } else {
                        userMarker = L.marker([latitude, longitude]).addTo(userMap)
                            .bindPopup('Your current location').openPopup();
                    }

                    sosButton.textContent = 'HELP SENT!';
                    sosButton.style.backgroundColor = '#28a745';
                    
                    setTimeout(() => {
                        sosButton.textContent = 'HELP!';
                        sosButton.style.backgroundColor = '';
                        sosButton.disabled = false;
                    }, 3000);
                }, (error) => {
                    console.error('Geolocation error:', error);
                    locationStatusDiv.classList.remove('hidden');
                    locationStatusDiv.textContent = 'Could not get location. Please enable location services.';
                    showToast('Failed to send location. Please enable location services.', 'error');
                    sosButton.textContent = 'HELP!';
                    sosButton.disabled = false;
                });
            } else {
                locationStatusDiv.classList.remove('hidden');
                locationStatusDiv.textContent = 'Geolocation is not supported by your browser.';
                showToast('Geolocation not supported.', 'error');
                sosButton.textContent = 'HELP!';
                sosButton.disabled = false;
            }
        });
    }

    // Initialize emergency system when medical view is loaded
    function initEmergencySystem() {
        renderEmergencyList();
        updateEmergencyStats();
        initEmergencyMap();
    }

    // Make functions globally available
    window.respondToEmergency = respondToEmergency;
    window.markEmergencyResolved = markEmergencyResolved;
    window.initEmergencySystem = initEmergencySystem;

    // --- Toast Notification Function ---
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = `toast ${type}`; // info, success, error
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Listen for localStorage changes (when volunteer posts announcements)
    window.addEventListener('storage', function(e) {
        if (e.key === 'announcements') {
            console.log('Announcements updated in localStorage, refreshing...');
            // Reload announcements if the announcements view is currently active
            const announcementsView = document.getElementById('announcements');
            if (announcementsView && !announcementsView.classList.contains('hidden')) {
                renderAnnouncements();
            }
        }
    });

    // Initializations
    updateUserInfo();
    showView('overview'); // Default view
    // Don't render announcements on initial load - only when announcements view is shown
    renderChatMessages();
    renderVolunteerChatMessages();
    initUserMap();
});

// Placeholder for QRCode library if not loaded via script tag
if (typeof QRCode === 'undefined') {
    console.warn('QRCode library not found. QR code generation will not work.');
    // You might want to load it dynamically or show a message to the user
}

// Placeholder for Leaflet library if not loaded via script tag
if (typeof L === 'undefined') {
    console.warn('Leaflet library not found. Map functionality will not work.');
    // You might want to load it dynamically or show a message to the user
}