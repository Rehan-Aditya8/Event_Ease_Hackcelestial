document.addEventListener("DOMContentLoaded", () => {
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
  // Global variables
  let announcements = [];
  const ANNOUNCEMENTS_STORAGE_KEY = "eventease_announcements";
  let userQRData = null;
  let activeEmergencies = [];

  // Parking slots data
  let parkingSlots = {
    twoWheeler: { available: 45, total: 100 },
    fourWheeler: { available: 23, total: 50 }
  };

  // Function to update parking slots display
  function updateFunctionsParkingSlots() {
    const twoWheelerElement = document.getElementById('functionsPageTwoWheelerSlots');
    const fourWheelerElement = document.getElementById('functionsPageFourWheelerSlots');
    
    if (twoWheelerElement) {
      twoWheelerElement.textContent = `${parkingSlots.twoWheeler.available}/${parkingSlots.twoWheeler.total}`;
    }
    
    if (fourWheelerElement) {
      fourWheelerElement.textContent = `${parkingSlots.fourWheeler.available}/${parkingSlots.fourWheeler.total}`;
    }
  }

  // Initialize parking slots display
  updateFunctionsParkingSlots();

  // ====== EASYENTRY FUNCTIONALITY ======
  function setupEasyEntryFunctionality() {
    const eventCodeForm = document.getElementById('eventCodeForm');
    const eventCodeInput = document.getElementById('eventCode');
    const eventCodeFormCard = document.getElementById('event-code-form');
    const qrTicket = document.getElementById('qr-ticket');
    const ticketUser = document.getElementById('ticketUser');
    const ticketCode = document.getElementById('ticketCode');
    const qrcodeContainer = document.getElementById('qrcode');
    const volunteerScanner = document.getElementById('volunteer-scanner');
    const scannerPreview = document.getElementById('scanner-preview');
    const scanResult = document.getElementById('scan-result');
    const resultContent = document.querySelector('.result-content');
    const resetScannerBtn = document.getElementById('reset-scanner');
    
    const VERIFICATION_CODE = "EventEase_Ticket_Verified_2025";

    const userName = sessionStorage.getItem('userName');
    if (userName && ticketUser) {
      ticketUser.textContent = userName;
    }
    
    const role = sessionStorage.getItem('role');
    if (role === 'volunteer') {
      if (eventCodeFormCard) eventCodeFormCard.classList.add('hidden');
      if (qrTicket) qrTicket.classList.add('hidden');
      if (volunteerScanner) volunteerScanner.classList.remove('hidden');
      initQRScanner();
    } else {
      if (volunteerScanner) volunteerScanner.classList.add('hidden');
      const userEmail = sessionStorage.getItem('userEmail') || userName;
      const savedQRData = localStorage.getItem(`qrData_${userEmail}`);
      if (savedQRData) {
        const qrData = JSON.parse(savedQRData);
        userQRData = qrData;
        showQRCode(qrData.eventCode, VERIFICATION_CODE);
      } else {
        if (eventCodeFormCard) eventCodeFormCard.classList.remove('hidden');
        if (qrTicket) qrTicket.classList.add('hidden');
      }
    }
    
    if (eventCodeForm) {
      eventCodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const eventCode = eventCodeInput.value.trim();
        
        if (eventCode.length === 6 && /^\d{6}$/.test(eventCode)) {
          showQRCode(eventCode, VERIFICATION_CODE);
          
          const userEmail = sessionStorage.getItem('userEmail') || userName;
          const qrData = {
            user: userEmail,
            name: userName,
            eventCode: eventCode,
            timestamp: new Date().toISOString()
          };
          userQRData = qrData;
          localStorage.setItem(`qrData_${userEmail}`, JSON.stringify(qrData));
          
          // Update the entry status immediately
          updateQuickStats();
          
          showToast('Entry pass generated successfully!');
        } else {
          showToast('Please enter a valid 6-digit event code');
        }
      });
    }
    
    function showQRCode(code, verificationString) {
      if (qrcodeContainer) qrcodeContainer.innerHTML = '';
      
      if (ticketCode) ticketCode.textContent = code;
      if (eventCodeFormCard) eventCodeFormCard.classList.add('hidden');
      if (qrTicket) qrTicket.classList.remove('hidden');
      
      if (window.QRCode && qrcodeContainer) {
        new QRCode(qrcodeContainer, {
          text: verificationString,
          width: 140,
          height: 140,
          colorDark: "#000000",
          colorLight: "#ffffff"
        });
      }
    }
    
    function initQRScanner() {
      if (sessionStorage.getItem('role') !== 'volunteer') return;
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (resultContent) resultContent.textContent = 'Your browser does not support camera access';
        if (scanResult) scanResult.classList.remove('hidden');
        return;
      }
      
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (scannerPreview) {
            scannerPreview.srcObject = stream;
            scannerPreview.play();
          }
          
          const scanInterval = setInterval(() => {
            setTimeout(() => {
              clearInterval(scanInterval);
              const tracks = stream.getTracks();
              tracks.forEach(track => track.stop());
              
              handleSuccessfulScan(VERIFICATION_CODE);
              
            }, 5000);
          }, 1000);
          
          if (resetScannerBtn) {
            resetScannerBtn.addEventListener('click', () => {
              if (scanResult) scanResult.classList.add('hidden');
              initQRScanner();
            });
          }
        })
        .catch(error => {
          console.error('Error accessing camera:', error);
          if (resultContent) resultContent.textContent = `Error accessing camera: ${error.message}`;
          if (scanResult) scanResult.classList.remove('hidden');
        });
    }
    
    function handleSuccessfulScan(scannedData) {
      let resultHTML = '';
      let isVerified = scannedData === VERIFICATION_CODE;

      if (isVerified) {
        resultHTML = `
          <h4 style="color: var(--success);">Ticket Verified! ✅</h4>
          <p><strong>You can enter.</strong></p>
        `;
        if (scanResult) scanResult.style.borderColor = 'var(--success)';
      } else {
        resultHTML = `
          <h4 style="color: var(--danger);">Invalid Ticket ❌</h4>
          <p>Please check the QR code and try again.</p>
        `;
        if (scanResult) scanResult.style.borderColor = 'var(--danger)';
      }
      
      if (resultContent) resultContent.innerHTML = resultHTML;
      if (scanResult) scanResult.classList.remove('hidden');
    }
  }
  
  // ====== ANNOUNCEMENTS FUNCTIONALITY ======
  function loadAnnouncements() {
    const storedAnnouncements = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (storedAnnouncements) {
      announcements = JSON.parse(storedAnnouncements);
    }
    displayAnnouncements('all');
    
    const filterButtons = document.querySelectorAll('.announcement-filters button');
    if (filterButtons) {
      filterButtons.forEach(button => {
        button.addEventListener('click', function() {
          filterButtons.forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');
          const filter = this.dataset.filter;
          displayAnnouncements(filter);
        });
      });
    }
    
    const announcementForm = document.getElementById('announcementForm');
    if (announcementForm) {
      announcementForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('announcementTitle').value.trim();
        const content = document.getElementById('announcementContent').value.trim();
        const priority = document.getElementById('announcementPriority').value;
        
        if (title && content) {
          addAnnouncement(title, content, priority);
          this.reset();
          showToast('Announcement posted successfully!');
        }
      });
    }

    const announcementList = document.getElementById('announcement-items');
    if (announcementList) {
      announcementList.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-announcement-btn')) {
          const announcementId = e.target.closest('.announcement-item').dataset.id;
          deleteAnnouncement(announcementId);
        }
      });
    }
  }
  
  function addAnnouncement(title, content, priority) {
    const announcement = {
      id: `announcement-${Date.now()}`,
      title: title,
      content: content,
      priority: priority,
      timestamp: new Date().toISOString(),
      author: sessionStorage.getItem('userName') || 'Volunteer'
    };
    
    announcements.unshift(announcement);
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
    displayAnnouncements('all');
  }

  function deleteAnnouncement(id) {
    announcements = announcements.filter(announcement => announcement.id !== id);
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
    displayAnnouncements('all');
    showToast('Announcement deleted successfully!');
  }
  
  function displayAnnouncements(filter) {
    const announcementItems = document.getElementById('announcement-items');
    if (!announcementItems) return;
    
    announcementItems.innerHTML = '';
    
    const role = sessionStorage.getItem('role');
    
    let filteredAnnouncements = announcements;
    if (filter !== 'all') {
      filteredAnnouncements = announcements.filter(a => a.priority === filter);
    }
    
    if (filteredAnnouncements.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'empty-state';
      emptyState.textContent = filter === 'all' ? 'No announcements yet' : `No ${filter} announcements`;
      announcementItems.appendChild(emptyState);
      return;
    }
    
    filteredAnnouncements.forEach(announcement => {
      const li = document.createElement('li');
      li.className = 'announcement-item';
      li.dataset.id = announcement.id;
      
      const date = new Date(announcement.timestamp);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      
      let deleteButtonHTML = '';
      if (role === 'volunteer') {
        deleteButtonHTML = '<button class="delete-announcement-btn">🗑️</button>';
      }

      li.innerHTML = `
        <div class="announcement-header">
          <span class="announcement-title">${announcement.title}</span>
          <div class="announcement-meta">
            <span class="announcement-timestamp">${formattedDate}</span>
            ${deleteButtonHTML}
          </div>
        </div>
        <div class="announcement-content">${announcement.content}</div>
        <div>
          <span class="announcement-priority priority-${announcement.priority}">${announcement.priority}</span>
          <span class="announcement-author">by ${announcement.author}</span>
        </div>
      `;
      
      announcementItems.appendChild(li);
    });
  }
  
  // ====== LOST & FOUND CHAT FUNCTIONALITY ======
  function initLostFoundChat() {
    const chatBox = document.getElementById("chatBox");
    const chatForm = document.getElementById("chatForm");
    const chatName = document.getElementById("chatName");
    const chatMessage = document.getElementById("chatMessage");
    const chatImage = document.getElementById("chatImage");

    if (!chatBox || !chatForm) return;

    function loadMessages() {
      const saved = localStorage.getItem("lostFoundMessages");
      return saved ? JSON.parse(saved) : [];
    }

    function saveMessages(messages) {
      localStorage.setItem("lostFoundMessages", JSON.stringify(messages));
    }

    let messages = loadMessages();

    function renderMessages() {
      chatBox.innerHTML = "";
      messages.forEach((msg, index) => {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message");
        msgDiv.innerHTML = `
          <div class="message-header">
            <div class="message-avatar">${msg.name.charAt(0).toUpperCase()}</div>
            <div class="message-info">
              <span class="message-name">${msg.name}</span>
              <span class="message-time">${msg.time}</span>
            </div>
          </div>
          <div class="message-content">${msg.text}</div>
        `;
        if (msg.image) {
          const imgContainer = document.createElement("div");
          imgContainer.classList.add("message-image");
          const img = document.createElement("img");
          img.src = msg.image;
          img.alt = "Attached image";
          img.loading = "lazy";
          imgContainer.appendChild(img);
          msgDiv.appendChild(imgContainer);
        }
        chatBox.appendChild(msgDiv);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    renderMessages();

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = chatName.value.trim() || sessionStorage.getItem('userName') || 'Anonymous';
      const text = chatMessage.value.trim();
      const file = chatImage.files[0];
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (!text) return;

      // Show loading state
      const submitBtn = chatForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<div class="loading-spinner"></div>Sending...';
      submitBtn.disabled = true;

      let newMsg = { name, text, time, image: null };

      if (file) {
        // Optimize image processing
        const reader = new FileReader();
        reader.onload = function (event) {
          newMsg.image = event.target.result;
          messages.push(newMsg);
          saveMessages(messages);
          renderMessages();
          
          // Reset form and button
          chatMessage.value = "";
          chatImage.value = "";
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
      } else {
        // Immediate processing for text-only messages
        messages.push(newMsg);
        saveMessages(messages);
        renderMessages();
        
        // Reset form and button
        chatMessage.value = "";
        chatImage.value = "";
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // ====== VIEW HANDLING ======
  function showView(viewId) {
    // Hide all views
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    
    // Show target view
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.remove("hidden");
      
      // Initialize specific functionality based on view
      if (viewId === 'ticket') {
        setupEasyEntryFunctionality();
      } else if (viewId === 'announcements') {
        loadAnnouncements();
        displayAnnouncements('all');
        
        // Show/hide volunteer announcement section
        const volunteerAnnouncementSection = document.getElementById("volunteer-announcement");
        const role = sessionStorage.getItem("role");
        
        if (role === "volunteer" && volunteerAnnouncementSection) {
          volunteerAnnouncementSection.classList.remove("hidden");
        } else if (volunteerAnnouncementSection) {
          volunteerAnnouncementSection.classList.add("hidden");
        }
      } else if (viewId === 'lostfound') {
        initLostFoundChat();
      } else if (viewId === "emergency") {
        const role = sessionStorage.getItem("role");
        console.log('Current user role:', role);
        const userMedical = document.getElementById("user-medical");
        const volunteerMedical = document.getElementById("volunteer-medical");
        
        if (role === "volunteer") {
          if (userMedical) userMedical.classList.add("hidden");
          if (volunteerMedical) volunteerMedical.classList.remove("hidden");
          console.log('Volunteer view activated, initializing map...');
          initEmergencyMap();
        } else {
          if (userMedical) userMedical.classList.remove("hidden");
          if (volunteerMedical) volunteerMedical.classList.add("hidden");
          console.log('User view activated, initializing map...');
          // Initialize map for regular users too
          initEmergencyMap();
        }
      } else if (viewId === 'dashboard') {
        initDashboard();
      } else if (viewId === 'parking') {
        initParkingView();
      } else if (viewId === 'volunteer-parking') {
        const role = sessionStorage.getItem("role");
        if (role === "volunteer") {
          initVolunteerParkingView();
        } else {
          // Redirect non-volunteers back to dashboard
          showView('dashboard');
          return;
        }
      }
    }
  }
  
  // ====== DASHBOARD FUNCTIONALITY ======
  function initDashboard() {
    const userName = sessionStorage.getItem('userName') || 'User';
    const dashboardUserName = document.getElementById('dashboardUserName');
    if (dashboardUserName) {
      dashboardUserName.textContent = userName;
    }
    
    // Update quick stats
    updateQuickStats();
    
    // Setup feature card navigation
    setupFeatureCardNavigation();
  }
  
  function setupFeatureCardNavigation() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      card.addEventListener('click', () => {
        const targetView = card.getAttribute('data-view');
        if (targetView) {
          showView(targetView);
          
          // Update navigation active state
          document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
          const navBtn = document.querySelector(`[data-view="${targetView}"]`);
          if (navBtn && navBtn.classList.contains('nav-btn')) {
            navBtn.classList.add('active');
          }
        }
      });
    });
  }

  function updateQuickStats() {
    // Update entry status
    const entryStatus = document.getElementById('entryStatus');
    if (entryStatus) {
      const userEmail = sessionStorage.getItem('userEmail') || sessionStorage.getItem('userName');
      const savedQRData = localStorage.getItem(`qrData_${userEmail}`);
      if (savedQRData || userQRData) {
        entryStatus.textContent = 'Generated';
        entryStatus.style.color = '#4CAF50';
      } else {
        entryStatus.textContent = 'Not Generated';
        entryStatus.style.color = '#FF6B6B';
      }
    }
    
    // Update announcements count
    const announcementCount = document.getElementById('announcementCount');
    if (announcementCount) {
      const count = announcements.length;
      announcementCount.textContent = count > 0 ? `${count} Available` : 'No New';
    }
  }

  // ====== MEDICAL EMERGENCY FUNCTIONALITY ======
  const sosButton = document.getElementById("sos-button");
  const locationStatus = document.getElementById("location-status");
  const emergencyMap = document.getElementById("emergency-map");
  const emergencyRequests = document.getElementById("emergency-requests");
  
  function updateEmergencyList() {
    if (!emergencyRequests) return;
    
    emergencyRequests.innerHTML = "";
    
    if (activeEmergencies.length === 0) {
      const noEmergencies = document.createElement("li");
      noEmergencies.textContent = "No active emergency requests";
      emergencyRequests.appendChild(noEmergencies);
      return;
    }
    
    activeEmergencies.forEach(emergency => {
      const li = document.createElement("li");
      const time = new Date(emergency.timestamp).toLocaleTimeString();
      li.innerHTML = `<strong>${emergency.userName}</strong> - ${time} <button class="btn ghost" data-id="${emergency.id}">Respond</button>`;
      emergencyRequests.appendChild(li);
    });
    
    document.querySelectorAll("#emergency-requests button").forEach(btn => {
      btn.addEventListener("click", function() {
        const id = this.dataset.id;
        respondToEmergency(id);
      });
    });
  }
  
  function respondToEmergency(id) {
    const index = activeEmergencies.findIndex(e => e.id === id);
    if (index !== -1) {
      showToast(`Responding to ${activeEmergencies[index].userName}'s emergency request`);
      
      activeEmergencies.splice(index, 1);
      updateEmergencyList();
      initEmergencyMap();
    }
  }
  
  function initEmergencyMap() {
    console.log('initEmergencyMap called');
    
    // Determine which map container to use based on visible section
    const userMedical = document.getElementById('user-medical');
    const volunteerMedical = document.getElementById('volunteer-medical');
    let containerId = 'emergency-map'; // default for volunteer view
    
    // Check which section is visible
    if (userMedical && !userMedical.classList.contains('hidden')) {
      containerId = 'user-map';
      console.log('Using user-map container');
      // Initialize enhanced map with live tracking for user view
      initEnhancedUserMap();
      return;
    } else if (volunteerMedical && !volunteerMedical.classList.contains('hidden')) {
      containerId = 'emergency-map';
      console.log('Using emergency-map container');
    }
    
    // Check if the map container exists
    const mapContainer = document.getElementById(containerId);
    console.log('Map container found:', mapContainer);
    
    if (!mapContainer) {
      console.error('Map container not found:', containerId);
      return;
    }
    
    // Check container visibility and dimensions
    const containerStyle = window.getComputedStyle(mapContainer);
    console.log('Container display:', containerStyle.display);
    console.log('Container visibility:', containerStyle.visibility);
    console.log('Container dimensions:', mapContainer.offsetWidth, 'x', mapContainer.offsetHeight);
    
    // Initialize the emergency map using the maps.js function
    if (typeof initMap === 'function') {
      console.log('initMap function found, calling it with container:', containerId);
      // Add a small delay to ensure the DOM element is visible
      setTimeout(() => {
        try {
          const mapInstance = initMap(containerId);
          if (mapInstance) {
            console.log('Emergency map initialized successfully');
          } else {
            console.error('Map initialization returned null');
          }
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }, 300);
    } else {
      console.error('initMap function not found. Make sure maps.js is loaded.');
      console.log('Available window functions:', Object.keys(window).filter(key => key.includes('map') || key.includes('Map')));
    }
  }

  // Enhanced User Map with Live Location Tracking
  let userMap = null;
  let currentLocationMarker = null;
  let locationTrail = [];
  let trailPolyline = null;
  let watchId = null;
  let isTracking = false;
  let lastUpdateTime = 0;
  const UPDATE_INTERVAL = 5000; // 5 seconds

  function initEnhancedUserMap() {
    console.log('Initializing enhanced user map with live tracking');
    
    const mapContainer = document.getElementById('user-map');
    if (!mapContainer) {
      console.error('User map container not found');
      return;
    }

    // Clear existing map
    if (userMap) {
      userMap.remove();
      userMap = null;
    }

    // Initialize map centered on Navi Mumbai
    userMap = L.map('user-map').setView([19.0330, 73.0297], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(userMap);

    // Add medical facilities markers (sample data)
    const medicalFacilities = [
      { name: "Apollo Hospital", lat: 19.0330, lng: 73.0297, type: "hospital" },
      { name: "Fortis Hospital", lat: 19.0400, lng: 73.0350, type: "hospital" },
      { name: "City Clinic", lat: 19.0280, lng: 73.0250, type: "clinic" },
      { name: "Emergency Care Center", lat: 19.0380, lng: 73.0320, type: "emergency" }
    ];

    medicalFacilities.forEach(facility => {
      const icon = L.divIcon({
        className: 'medical-facility-marker',
        html: `<div style="background: #f44336; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏥 ${facility.name}</div>`,
        iconSize: [120, 30],
        iconAnchor: [60, 15]
      });
      
      L.marker([facility.lat, facility.lng], { icon }).addTo(userMap)
        .bindPopup(`<strong>${facility.name}</strong><br>Medical Facility`);
    });

    // Setup tracking controls
    setupTrackingControls();
    
    // Get initial location
    getCurrentLocation();
  }

  function setupTrackingControls() {
    const trackBtn = document.getElementById('track-location-btn');
    const clearBtn = document.getElementById('clear-trail-btn');
    
    if (trackBtn) {
      trackBtn.addEventListener('click', toggleTracking);
    }
    
    if (clearBtn) {
      clearBtn.addEventListener('click', clearTrail);
    }
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      updateStatus('error', 'Geolocation not supported');
      return;
    }

    updateStatus('', 'Getting current location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        updateLocationOnMap(lat, lng, accuracy);
        userMap.setView([lat, lng], 16);
        updateStatus('', `Location found (±${Math.round(accuracy)}m)`);
      },
      (error) => {
        let errorMessage = 'Location error';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            break;
        }
        updateStatus('error', errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function updateLocationOnMap(lat, lng, accuracy) {
    // Remove previous marker
    if (currentLocationMarker) {
      userMap.removeLayer(currentLocationMarker);
    }

    // Create current location marker with pulse animation
    const currentLocationIcon = L.divIcon({
      className: 'current-location-marker',
      html: `
        <div style="position: relative;">
          <div style="width: 20px; height: 20px; background: #4285f4; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(66, 133, 244, 0.4);"></div>
          <div style="position: absolute; top: -15px; left: -15px; width: 50px; height: 50px; border: 2px solid #4285f4; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite;"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    currentLocationMarker = L.marker([lat, lng], { icon: currentLocationIcon }).addTo(userMap);
    
    const currentTime = new Date().toLocaleTimeString();
    const popupContent = `
      <div style="text-align: center;">
        <strong>📍 Your Current Location</strong><br>
        <small>Lat: ${lat.toFixed(6)}<br>
        Lng: ${lng.toFixed(6)}<br>
        Accuracy: ±${Math.round(accuracy)}m<br>
        Updated: ${currentTime}</small>
      </div>
    `;
    
    currentLocationMarker.bindPopup(popupContent);

    // Add to trail if tracking
    if (isTracking) {
      locationTrail.push([lat, lng]);
      updateTrail();
    }
  }

  function updateTrail() {
    if (trailPolyline) {
      userMap.removeLayer(trailPolyline);
    }
    
    if (locationTrail.length > 1) {
      trailPolyline = L.polyline(locationTrail, {
        color: '#4285f4',
        weight: 3,
        opacity: 0.6,
        smoothFactor: 1
      }).addTo(userMap);
    }
  }

  function toggleTracking() {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }

  function startTracking() {
    if (!navigator.geolocation) {
      updateStatus('error', 'Geolocation not supported');
      return;
    }

    isTracking = true;
    const trackBtn = document.getElementById('track-location-btn');
    if (trackBtn) {
      trackBtn.textContent = '⏹ Stop Live Tracking';
      trackBtn.classList.add('active');
    }
    
    updateStatus('tracking', 'Starting live tracking...');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        
        // Throttle updates
        if (now - lastUpdateTime < UPDATE_INTERVAL) {
          return;
        }
        lastUpdateTime = now;

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        updateLocationOnMap(lat, lng, accuracy);
        updateStatus('tracking', `Live tracking active (±${Math.round(accuracy)}m)`);
      },
      (error) => {
        let errorMessage = 'Tracking error';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            break;
        }
        updateStatus('error', errorMessage);
      },
      options
    );
  }

  function stopTracking() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    
    isTracking = false;
    const trackBtn = document.getElementById('track-location-btn');
    if (trackBtn) {
      trackBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
        Start Live Tracking
      `;
      trackBtn.classList.remove('active');
    }
    
    updateStatus('', 'Location tracking stopped');
  }

  function clearTrail() {
    locationTrail = [];
    if (trailPolyline) {
      userMap.removeLayer(trailPolyline);
      trailPolyline = null;
    }
    updateStatus('', isTracking ? 'Live tracking - Trail cleared' : 'Trail cleared');
  }

  function updateStatus(type, message) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    if (statusDot) {
      statusDot.className = 'status-dot';
      if (type) statusDot.classList.add(type);
    }
    
    if (statusText) {
      statusText.textContent = message;
    }
  }
  
  if (sosButton) {
    sosButton.addEventListener("click", () => {
      const locationReport = document.getElementById("location-report");
      
      if (locationStatus) {
        locationStatus.classList.remove("hidden");
        locationStatus.textContent = "Sending your location...";
      }
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            const emergency = {
              id: `emergency-${Date.now()}`,
              userName: sessionStorage.getItem("userName") || "Anonymous User",
              timestamp: new Date().toISOString(),
              location: pos
            };
            
            activeEmergencies.push(emergency);
            updateEmergencyList();
            
            // Show location report
            if (locationReport) {
              locationReport.classList.remove("hidden");
              
              // Update coordinates
              const coordsDisplay = document.getElementById("coordinates-display");
              if (coordsDisplay) {
                coordsDisplay.textContent = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
              }
              
              // Update accuracy
              const accuracyDisplay = document.getElementById("accuracy-display");
              if (accuracyDisplay) {
                accuracyDisplay.textContent = `±${Math.round(position.coords.accuracy)} meters`;
              }
              
              // Update timestamp
              const timestampDisplay = document.getElementById("timestamp-display");
              if (timestampDisplay) {
                timestampDisplay.textContent = new Date().toLocaleString();
              }
              
              // Reverse geocoding to get address
              fetch(`https://api.opencagedata.com/geocode/v1/json?q=${pos.lat}+${pos.lng}&key=YOUR_API_KEY`)
                .then(response => response.json())
                .then(data => {
                  const addressDisplay = document.getElementById("address-display");
                  if (addressDisplay && data.results && data.results[0]) {
                    addressDisplay.textContent = data.results[0].formatted;
                  } else if (addressDisplay) {
                    addressDisplay.textContent = "Address not available";
                  }
                })
                .catch(() => {
                  const addressDisplay = document.getElementById("address-display");
                  if (addressDisplay) {
                    addressDisplay.textContent = "Address lookup failed";
                  }
                });
            }
            
            if (locationStatus) {
              locationStatus.textContent = "Help request sent! Medical staff has been notified.";
              locationStatus.style.color = "var(--success)";
            }
            
            showToast("Emergency alert sent successfully! Your location has been shared.");
            
            setTimeout(() => {
              if (locationStatus) {
                locationStatus.classList.add("hidden");
                locationStatus.style.color = "";
              }
            }, 5000);
          },
          (error) => {
            console.error("Geolocation error:", error);
            if (locationStatus) {
              locationStatus.textContent = "Could not get your location. Please try again.";
              locationStatus.style.color = "var(--danger)";
            }
            
            showToast("Error: Could not determine your location.");
            
            setTimeout(() => {
              if (locationStatus) {
                locationStatus.classList.add("hidden");
                locationStatus.style.color = "";
              }
            }, 5000);
          }
        );
      } else {
        if (locationStatus) {
          locationStatus.textContent = "Your browser doesn't support geolocation.";
          locationStatus.style.color = "var(--danger)";
        }
        
        showToast("Error: Your browser doesn't support geolocation.");
        
        setTimeout(() => {
          if (locationStatus) {
            locationStatus.classList.add("hidden");
            locationStatus.style.color = "";
          }
        }, 5000);
      }
    });
  }

  // ====== VOLUNTEER SECURITY ======
  const volunteerAccounts = [
    { email: "volunteer1@example.com", password: "vol123" },
    { email: "volunteer2@example.com", password: "vol456" },
    { email: "chaitanyapantula25@gmail.com", password: "cha12345" }
  ];
  const VOLUNTEER_CODE = "VOL-SECRET-2025";

  // ====== LOGIN / SIGNUP ======
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const role = document.getElementById("role").value;

      if (!email || password.length < 4) {
        alert("Invalid login. Please try again.");
        return;
      }

      let savedName = email.split("@")[0];

      if (role === "volunteer") {
        const found = volunteerAccounts.find(
          acc => acc.email === email && acc.password === password
        );

        if (!found) {
          alert("Invalid volunteer credentials!");
          return;
        }

        const code = prompt("Enter volunteer access code:");
        if (code !== VOLUNTEER_CODE) {
          alert("Invalid access code!");
          return;
        }

        console.log("✅ Volunteer login success for:", email);
        savedName = found.email.split("@")[0];
      }

      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("userName", savedName);
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("role", role);

      window.location.href = "functions.html";
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value.trim();

      if (name && email && password.length >= 4) {
        localStorage.setItem("userName", name);
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("userName", name);
        sessionStorage.setItem("userEmail", email);
        sessionStorage.setItem("role", "user");

        window.location.href = "functions.html";
      } else {
        alert("Please fill all fields correctly.");
      }
    });
  }



  // ====== TOAST NOTIFICATION ======
  function showToast(message, duration = 3000) {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = message;
      toast.classList.remove("hidden");
      
      setTimeout(() => {
        toast.classList.add("hidden");
      }, duration);
    }
  }

  // ====== UPDATE DASHBOARD GREETING ======
  function updateDashboardGreeting(name, role) {
    const userNameEl = document.getElementById("userName");
    const ticketUserEl = document.getElementById("ticketUser");
    const userAvatarEl = document.querySelector(".user-avatar");
    const userInitials = document.getElementById("userInitials");

    let greetingRole = role === "volunteer" ? "Volunteer" : "User";

    if (userNameEl) userNameEl.textContent = `${name}`;
    if (ticketUserEl) ticketUserEl.textContent = name;
    if (userAvatarEl) userAvatarEl.textContent = name.charAt(0).toUpperCase();
    if (userInitials) userInitials.textContent = name.charAt(0).toUpperCase();
  }

  // ====== NAVIGATION BUTTONS ======
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-view");
      showView(targetView);
      
      // Update active state for navigation buttons
      document.querySelectorAll(".nav-btn").forEach(navBtn => navBtn.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  
  // ====== MOBILE NAVIGATION ======
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetView = tab.getAttribute("data-view");
      showView(targetView);
      
      // Update active state for mobile tabs
      document.querySelectorAll(".nav-tab").forEach(navTab => navTab.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  // ====== QR SCANNER GLOBAL FUNCTION ======
  function handleScan(resultText) {
    try {
      const data = JSON.parse(resultText);
      const scanResultDiv = document.getElementById("scan-result");
      const resultContent = scanResultDiv.querySelector(".result-content");

      resultContent.innerHTML = `
        <h3>✅ The user can enter the event!</h3>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Event Code:</strong> ${data.code}</p>
      `;

      scanResultDiv.classList.remove("hidden");
    } catch (err) {
      alert("Invalid QR Code scanned.");
    }
  }

  // Make it globally available for scanner integration
  window.handleScan = handleScan;

  // ====== INITIAL LOAD ======
  // Add a small delay to ensure session data is properly set
  setTimeout(() => {
    // Check both session storage methods for compatibility
    const isLoggedInSession = sessionStorage.getItem("loggedIn") === "true";
    const eventEaseSession = localStorage.getItem('eventease_session');
    let isLoggedInLocal = false;
    
    if (eventEaseSession) {
      try {
        const sessionData = JSON.parse(eventEaseSession);
        isLoggedInLocal = sessionData.isLoggedIn === true;
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
    
    if (isLoggedInSession || isLoggedInLocal) {
      let savedName = "Attendee";
      let role = "user";
      
      if (isLoggedInSession) {
        savedName = sessionStorage.getItem("userName") || "Attendee";
        role = sessionStorage.getItem("role") || "user";
      } else if (isLoggedInLocal) {
        const sessionData = JSON.parse(eventEaseSession);
        savedName = sessionData.user.name || "Attendee";
        role = "user"; // Default role for new session format
      }
      
      // Update greeting and user info
      updateDashboardGreeting(savedName, role);
      
      // Load announcements
      loadAnnouncements();
      
      // Initialize dashboard by default
      showView("dashboard");
    } else {
      if (!document.getElementById("login") && !document.getElementById("signup")) {
        window.location.href = "login.html";
      }
    }
  }, 100); // Small delay to prevent redirect loops

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Show logout confirmation modal
    const logoutModal = document.getElementById('logoutModal');
    if (logoutModal) {
      logoutModal.classList.remove('hidden');
    }
  });
  
  // Handle logout modal interactions
  const logoutModal = document.getElementById('logoutModal');
  const closeLogoutModal = document.getElementById('closeLogoutModal');
  const cancelLogout = document.getElementById('cancelLogout');
  const confirmLogout = document.getElementById('confirmLogout');
  
  if (closeLogoutModal) {
    closeLogoutModal.addEventListener('click', () => {
      logoutModal.classList.add('hidden');
    });
  }
  
  if (cancelLogout) {
    cancelLogout.addEventListener('click', () => {
      logoutModal.classList.add('hidden');
    });
  }
  
  if (confirmLogout) {
    confirmLogout.addEventListener('click', () => {
      // Hide modal first
      logoutModal.classList.add('hidden');
      
      // Clear session and local storage
      sessionStorage.clear();
      localStorage.removeItem('eventease_announcements');
      // Keep theme preference intact
      
      // Show confirmation toast
      showToast('Logged out successfully!');
      
      // Redirect to landing page after a short delay
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1000);
    });
  }
  
  // Close modal when clicking outside
  if (logoutModal) {
    logoutModal.addEventListener('click', (e) => {
      if (e.target === logoutModal) {
        logoutModal.classList.add('hidden');
      }
    });
  }
}

// ====== PARKING FUNCTIONALITY ======
function initParkingView() {
  // Update parking slots display
  updateParkingSlots();
  
  // Initialize booking form
  const bookingForm = document.getElementById('parkingBookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleParkingBooking);
  }
  
  // Initialize vehicle type selection
  const vehicleTypeInputs = document.querySelectorAll('input[name="vehicleType"]');
  vehicleTypeInputs.forEach(input => {
    input.addEventListener('change', updateAvailableSlots);
  });
  
  // Initialize duration selection
  const durationSelect = document.getElementById('duration');
  if (durationSelect) {
    durationSelect.addEventListener('change', updateBookingPrice);
  }
}

function updateParkingSlots() {
  // Update two-wheeler slots
  const twoWheelerAvailable = document.getElementById('twoWheelerAvailable');
  const twoWheelerTotal = document.getElementById('twoWheelerTotal');
  if (twoWheelerAvailable) twoWheelerAvailable.textContent = parkingSlots.twoWheeler.available;
  if (twoWheelerTotal) twoWheelerTotal.textContent = parkingSlots.twoWheeler.total;
  
  // Update four-wheeler slots
  const fourWheelerAvailable = document.getElementById('fourWheelerAvailable');
  const fourWheelerTotal = document.getElementById('fourWheelerTotal');
  if (fourWheelerAvailable) fourWheelerAvailable.textContent = parkingSlots.fourWheeler.available;
  if (fourWheelerTotal) fourWheelerTotal.textContent = parkingSlots.fourWheeler.total;
  
  // Update progress bars
  const twoWheelerProgress = document.querySelector('.two-wheeler-progress');
  const fourWheelerProgress = document.querySelector('.four-wheeler-progress');
  
  if (twoWheelerProgress) {
    const twoWheelerPercentage = (parkingSlots.twoWheeler.available / parkingSlots.twoWheeler.total) * 100;
    twoWheelerProgress.style.width = `${twoWheelerPercentage}%`;
  }
  
  if (fourWheelerProgress) {
    const fourWheelerPercentage = (parkingSlots.fourWheeler.available / parkingSlots.fourWheeler.total) * 100;
    fourWheelerProgress.style.width = `${fourWheelerPercentage}%`;
  }
}

function updateAvailableSlots() {
  const selectedVehicleType = document.querySelector('input[name="vehicleType"]:checked');
  const availableSlotsSpan = document.getElementById('availableSlots');
  
  if (selectedVehicleType && availableSlotsSpan) {
    const vehicleType = selectedVehicleType.value;
    if (vehicleType === 'two-wheeler') {
      availableSlotsSpan.textContent = parkingSlots.twoWheeler.available;
    } else if (vehicleType === 'four-wheeler') {
      availableSlotsSpan.textContent = parkingSlots.fourWheeler.available;
    }
  }
}

function updateBookingPrice() {
  const durationSelect = document.getElementById('duration');
  const priceSpan = document.getElementById('bookingPrice');
  
  if (durationSelect && priceSpan) {
    const duration = parseInt(durationSelect.value);
    const selectedVehicleType = document.querySelector('input[name="vehicleType"]:checked');
    
    if (selectedVehicleType) {
      const vehicleType = selectedVehicleType.value;
      let hourlyRate = vehicleType === 'two-wheeler' ? 10 : 20; // ₹10 for 2-wheeler, ₹20 for 4-wheeler
      let totalPrice = duration * hourlyRate;
      
      priceSpan.textContent = `₹${totalPrice}`;
    }
  }
}

function handleParkingBooking(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const vehicleType = formData.get('vehicleType');
  const vehicleNumber = formData.get('vehicleNumber');
  const duration = parseInt(formData.get('duration'));
  
  // Check availability
  const availableSlots = vehicleType === 'two-wheeler' ? 
    parkingSlots.twoWheeler.available : parkingSlots.fourWheeler.available;
  
  if (availableSlots <= 0) {
    showToast('No parking slots available for the selected vehicle type!', 'error');
    return;
  }
  
  // Generate slot number
  const slotPrefix = vehicleType === 'two-wheeler' ? 'TW' : 'FW';
  const slotNumber = `${slotPrefix}-${Math.floor(Math.random() * 100) + 1}`;
  
  // Calculate price
  const hourlyRate = vehicleType === 'two-wheeler' ? 10 : 20;
  const totalPrice = duration * hourlyRate;
  
  // Update available slots
  if (vehicleType === 'two-wheeler') {
    parkingSlots.twoWheeler.available--;
  } else {
    parkingSlots.fourWheeler.available--;
  }
  
  // Update displays
  updateParkingSlots();
  updateFunctionsParkingSlots();
  
  // Show confirmation
  showBookingConfirmation({
    vehicleType,
    vehicleNumber,
    duration,
    slotNumber,
    totalPrice
  });
  
  // Reset form
  event.target.reset();
  updateAvailableSlots();
  updateBookingPrice();
}

function showBookingConfirmation(bookingData) {
  const confirmationModal = document.getElementById('bookingConfirmation');
  
  // Update confirmation details
  document.getElementById('confirmedVehicleType').textContent = 
    bookingData.vehicleType === 'two-wheeler' ? 'Two Wheeler' : 'Four Wheeler';
  document.getElementById('confirmedVehicleNumber').textContent = bookingData.vehicleNumber;
  document.getElementById('confirmedSlotNumber').textContent = bookingData.slotNumber;
  document.getElementById('confirmedDuration').textContent = `${bookingData.duration} hour(s)`;
  document.getElementById('confirmedPrice').textContent = `₹${bookingData.totalPrice}`;
  
  // Set booking time
  const now = new Date();
  const bookingTime = now.toLocaleString();
  document.getElementById('confirmedBookingTime').textContent = bookingTime;
  
  // Show modal
  confirmationModal.classList.remove('hidden');
  
  // Show success toast
  showToast('Parking slot booked successfully!', 'success');
}

// Close booking confirmation modal
document.addEventListener('DOMContentLoaded', () => {
  const closeConfirmationBtn = document.getElementById('closeBookingConfirmation');
  const bookingConfirmationModal = document.getElementById('bookingConfirmation');
  
  if (closeConfirmationBtn && bookingConfirmationModal) {
    closeConfirmationBtn.addEventListener('click', () => {
      bookingConfirmationModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    bookingConfirmationModal.addEventListener('click', (e) => {
      if (e.target === bookingConfirmationModal) {
        bookingConfirmationModal.classList.add('hidden');
      }
    });
  }
});

// ===== VOLUNTEER PARKING MANAGEMENT =====

// Initialize volunteer parking view
function initVolunteerParkingView() {
  updateVolunteerParkingStats();
  loadActiveBookings();
  setupVolunteerEventListeners();
}

// Update volunteer parking statistics
function updateVolunteerParkingStats() {
  // Two wheeler stats
  const twoWheelerOccupied = 55;
  const twoWheelerTotal = 100;
  const twoWheelerAvailable = twoWheelerTotal - twoWheelerOccupied;
  const twoWheelerPercentage = (twoWheelerOccupied / twoWheelerTotal) * 100;
  
  document.getElementById('volunteerTwoWheelerOccupied').textContent = twoWheelerOccupied;
  document.getElementById('volunteerTwoWheelerAvailable').textContent = twoWheelerAvailable;
  document.getElementById('volunteerTwoWheelerProgress').style.width = `${twoWheelerPercentage}%`;
  
  // Four wheeler stats
  const fourWheelerOccupied = 27;
  const fourWheelerTotal = 50;
  const fourWheelerAvailable = fourWheelerTotal - fourWheelerOccupied;
  const fourWheelerPercentage = (fourWheelerOccupied / fourWheelerTotal) * 100;
  
  document.getElementById('volunteerFourWheelerOccupied').textContent = fourWheelerOccupied;
  document.getElementById('volunteerFourWheelerAvailable').textContent = fourWheelerAvailable;
  document.getElementById('volunteerFourWheelerProgress').style.width = `${fourWheelerPercentage}%`;
}

// Load active bookings for volunteer view
function loadActiveBookings() {
  // This would typically fetch from a server
  // For now, we'll use the existing sample data in the HTML
  updateBookingTimers();
}

// Update booking timers in real-time
function updateBookingTimers() {
  const bookingItems = document.querySelectorAll('.booking-item');
  
  bookingItems.forEach(item => {
    const timeRemainingElement = item.querySelector('.time-remaining');
    const statusIndicator = item.querySelector('.status-indicator');
    const statusText = item.querySelector('.status-text');
    
    if (timeRemainingElement) {
      const currentTime = timeRemainingElement.textContent;
      
      // Simulate time countdown (in a real app, this would be calculated from actual booking time)
      if (currentTime.includes('15m')) {
        statusIndicator.className = 'status-indicator expiring';
        statusText.textContent = 'Expiring Soon';
      } else if (currentTime.includes('h')) {
        statusIndicator.className = 'status-indicator active';
        statusText.textContent = 'Active';
      }
    }
  });
}

// Setup event listeners for volunteer parking
function setupVolunteerEventListeners() {
  // Refresh bookings button
  const refreshBtn = document.getElementById('refreshBookings');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
        Refreshing...
      `;
      
      setTimeout(() => {
        loadActiveBookings();
        updateVolunteerParkingStats();
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          Refresh
        `;
        showToast('Bookings refreshed successfully!', 'success');
      }, 1500);
    });
  }
  
  // Filter tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      filterTabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      const filter = tab.dataset.filter;
      filterBookings(filter);
    });
  });
  
  // Booking action buttons
  setupBookingActions();
}

// Filter bookings based on selected filter
function filterBookings(filter) {
  const bookingItems = document.querySelectorAll('.booking-item');
  
  bookingItems.forEach(item => {
    let shouldShow = true;
    
    switch (filter) {
      case 'all':
        shouldShow = true;
        break;
      case 'two-wheeler':
        shouldShow = item.classList.contains('two-wheeler');
        break;
      case 'four-wheeler':
        shouldShow = item.classList.contains('four-wheeler');
        break;
      case 'expiring':
        shouldShow = item.querySelector('.status-indicator').classList.contains('expiring');
        break;
    }
    
    item.style.display = shouldShow ? 'flex' : 'none';
  });
}

// Setup booking action buttons (extend, cancel)
function setupBookingActions() {
  const extendButtons = document.querySelectorAll('.btn-action.extend');
  const cancelButtons = document.querySelectorAll('.btn-action.cancel');
  
  extendButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookingItem = btn.closest('.booking-item');
      const vehicleNumber = bookingItem.querySelector('h4').textContent;
      extendBooking(vehicleNumber, bookingItem);
    });
  });
  
  cancelButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookingItem = btn.closest('.booking-item');
      const vehicleNumber = bookingItem.querySelector('h4').textContent;
      cancelBooking(vehicleNumber, bookingItem);
    });
  });
}

// Extend booking functionality
function extendBooking(vehicleNumber, bookingItem) {
  if (confirm(`Extend booking for vehicle ${vehicleNumber}?`)) {
    const timeRemainingElement = bookingItem.querySelector('.time-remaining');
    const currentTime = timeRemainingElement.textContent;
    
    // Simulate extending by 1 hour
    let newTime;
    if (currentTime.includes('15m')) {
      newTime = '1h 15m left';
    } else if (currentTime.includes('1h 45m')) {
      newTime = '2h 45m left';
    } else if (currentTime.includes('3h 30m')) {
      newTime = '4h 30m left';
    }
    
    timeRemainingElement.textContent = newTime;
    
    // Update status if it was expiring
    const statusIndicator = bookingItem.querySelector('.status-indicator');
    const statusText = bookingItem.querySelector('.status-text');
    if (statusIndicator.classList.contains('expiring')) {
      statusIndicator.className = 'status-indicator active';
      statusText.textContent = 'Active';
    }
    
    showToast(`Booking extended for ${vehicleNumber}`, 'success');
  }
}

// Cancel booking functionality
function cancelBooking(vehicleNumber, bookingItem) {
  if (confirm(`Cancel booking for vehicle ${vehicleNumber}? This action cannot be undone.`)) {
    bookingItem.style.opacity = '0.5';
    bookingItem.style.pointerEvents = 'none';
    
    setTimeout(() => {
      bookingItem.remove();
      updateVolunteerParkingStats();
      showToast(`Booking cancelled for ${vehicleNumber}`, 'info');
    }, 500);
  }
}

// Initialize volunteer parking when the view is shown
document.addEventListener('DOMContentLoaded', () => {
  // Check if volunteer parking section exists
  const volunteerParkingSection = document.getElementById('volunteer-parking');
  if (volunteerParkingSection) {
    // Initialize when volunteer parking view becomes visible
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (!volunteerParkingSection.classList.contains('hidden')) {
            initVolunteerParkingView();
            // Start timer updates
            setInterval(updateBookingTimers, 60000); // Update every minute
          }
        }
      });
    });
    
    observer.observe(volunteerParkingSection, { attributes: true });
  }
});

});