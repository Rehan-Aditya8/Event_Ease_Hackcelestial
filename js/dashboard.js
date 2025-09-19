// Import Firebase auth
import { auth, db } from '../js/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
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
    const announcementsList = document.getElementById('announcements-list');
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

    // --- Firebase User Authentication and Display ---
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
            showToast("Logged out successfully", "info");
            window.location.href = '../index.html';
        }).catch((error) => {
            // An error happened
            console.error("Error signing out:", error);
            showToast("Error signing out", "error");
        });
    });

    // --- View Management ---
    function showView(viewId) {
        views.forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(viewId).classList.add('active');

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewId) {
                item.classList.add('active');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            showView(item.dataset.view);
        });
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            showView(btn.dataset.view);
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

    // --- Announcements Functionality ---
    const announcements = [
        { id: 1, title: 'Welcome to HackCelestial 2.0!', content: 'The event has officially started. Enjoy your time!', priority: 'normal', timestamp: '2023-10-27T09:00:00Z' },
        { id: 2, title: 'Lunch Break Reminder', content: 'Lunch will be served at 12:30 PM in the main cafeteria.', priority: 'important', timestamp: '2023-10-27T12:00:00Z' },
        { id: 3, title: 'Emergency Drill at 3 PM', content: 'Please follow all instructions during the drill. This is NOT a real emergency.', priority: 'urgent', timestamp: '2023-10-27T14:30:00Z' },
        { id: 4, title: 'Workshop: Intro to AI', content: 'Join our AI workshop at 4 PM in Room 301.', priority: 'normal', timestamp: '2023-10-27T15:00:00Z' }
    ];

    function renderAnnouncements(filter = 'all') {
        announcementsList.innerHTML = '';
        const filteredAnnouncements = filter === 'all' ? announcements : announcements.filter(a => a.priority === filter);

        if (filteredAnnouncements.length === 0) {
            announcementsList.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    <p>No announcements yet</p>
                </div>
            `;
            return;
        }

        filteredAnnouncements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        filteredAnnouncements.forEach(announcement => {
            const announcementDiv = document.createElement('div');
            announcementDiv.classList.add('announcement-item', announcement.priority);
            announcementDiv.innerHTML = `
                <h4>${announcement.title}</h4>
                <p>${announcement.content}</p>
                <div class="announcement-meta">
                    <span>Priority: ${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}</span>
                    <span>${new Date(announcement.timestamp).toLocaleString()}</span>
                </div>
            `;
            announcementsList.appendChild(announcementDiv);
        });
    }

    announcementFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            announcementFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAnnouncements(btn.dataset.filter);
        });
    });

    // --- Lost & Found Chat Functionality ---
    const chatMessages = [];

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
    let userMap = null;
    let userMarker = null;

    function initUserMap() {
        if (userMap) userMap.remove(); // Clean up existing map
        userMap = L.map(userMapDiv).setView([19.0760, 72.8777], 13); // Default to Mumbai
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(userMap);
    }

    sosButton.addEventListener('click', () => {
        locationStatusDiv.classList.remove('hidden');
        locationStatusDiv.textContent = 'Sending your location...';
        sosButton.disabled = true;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                locationStatusDiv.textContent = `Location sent: Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`;
                showToast('Emergency request sent with your location!', 'success');

                // Update map with current location
                userMap.setView([latitude, longitude], 16);
                if (userMarker) {
                    userMarker.setLatLng([latitude, longitude]);
                } else {
                    userMarker = L.marker([latitude, longitude]).addTo(userMap)
                        .bindPopup('Your current location').openPopup();
                }

                sosButton.disabled = false;
            }, error => {
                console.error('Geolocation error:', error);
                locationStatusDiv.textContent = 'Could not get location. Please enable location services.';
                showToast('Failed to send location. Please enable location services.', 'error');
                sosButton.disabled = false;
            });
        } else {
            locationStatusDiv.textContent = 'Geolocation is not supported by your browser.';
            showToast('Geolocation not supported.', 'error');
            sosButton.disabled = false;
        }
    });

    // --- Toast Notification Function ---
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = `toast ${type}`; // info, success, error
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Initializations
    updateUserInfo();
    showView('overview'); // Default view
    renderAnnouncements();
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