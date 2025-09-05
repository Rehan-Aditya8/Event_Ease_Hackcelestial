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
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
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
        const userMedical = document.getElementById("user-medical");
        const volunteerMedical = document.getElementById("volunteer-medical");
        
        if (role === "volunteer") {
          if (userMedical) userMedical.classList.add("hidden");
          if (volunteerMedical) volunteerMedical.classList.remove("hidden");
          initEmergencyMap();
        } else {
          if (userMedical) userMedical.classList.remove("hidden");
          if (volunteerMedical) volunteerMedical.classList.add("hidden");
        }
      } else if (viewId === 'dashboard') {
        initDashboard();
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
    // Emergency map initialization logic would go here
    console.log('Emergency map initialized');
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
});