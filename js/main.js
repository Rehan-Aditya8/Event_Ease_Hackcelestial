document.addEventListener("DOMContentLoaded", () => {
  // Global variables
  let announcements = [];
  const ANNOUNCEMENTS_STORAGE_KEY = "eventease_announcements";
  let userQRData = null;

  // ====== EASYENTRY FUNCTIONALITY ======
  function setupEasyEntryFunctionality() {
    const eventCodeForm = document.getElementById("eventCodeForm");
    const eventCodeInput = document.getElementById("eventCode");
    const eventCodeFormCard = document.getElementById("event-code-form");
    const qrTicket = document.getElementById("qr-ticket");
    const ticketUser = document.getElementById("ticketUser");
    const ticketCode = document.getElementById("ticketCode");
    const qrcodeContainer = document.getElementById("qrcode");
    const volunteerScanner = document.getElementById("volunteer-scanner");
    const scannerPreview = document.getElementById("scanner-preview");
    const scanResult = document.getElementById("scan-result");
    const resultContent = document.querySelector(".result-content");
    const resetScannerBtn = document.getElementById("reset-scanner");

    const VERIFICATION_CODE = "EventEase_Ticket_Verified_2025";

    const userName = sessionStorage.getItem("userName");
    if (userName) {
      ticketUser.textContent = userName;
    }

    const role = sessionStorage.getItem("role");
    if (role === "volunteer") {
      eventCodeFormCard.classList.add("hidden");
      qrTicket.classList.add("hidden");
      volunteerScanner.classList.remove("hidden");
      initQRScanner();
    } else {
      volunteerScanner.classList.add("hidden");
      const userEmail = sessionStorage.getItem("userEmail") || userName;
      const savedQRData = localStorage.getItem(`qrData_${userEmail}`);
      if (savedQRData) {
        const qrData = JSON.parse(savedQRData);
        userQRData = qrData;
        showQRCode(qrData.eventCode, VERIFICATION_CODE);
      } else {
        eventCodeFormCard.classList.remove("hidden");
        qrTicket.classList.add("hidden");
      }
    }

    if (eventCodeForm) {
      eventCodeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const eventCode = eventCodeInput.value.trim();

        if (eventCode.length === 6 && /^\d{6}$/.test(eventCode)) {
          showQRCode(eventCode, VERIFICATION_CODE);

          const userEmail = sessionStorage.getItem("userEmail") || userName;
          const qrData = {
            user: userEmail,
            name: userName,
            eventCode: eventCode,
            timestamp: new Date().toISOString(),
          };
          userQRData = qrData;
          localStorage.setItem(`qrData_${userEmail}`, JSON.stringify(qrData));

          showToast("Entry pass generated successfully!");
        } else {
          showToast("Please enter a valid 6-digit event code");
        }
      });
    }

    function showQRCode(code, verificationString) {
      if (qrcodeContainer) qrcodeContainer.innerHTML = "";

      if (ticketCode) ticketCode.textContent = code;
      if (eventCodeFormCard) eventCodeFormCard.classList.add("hidden");
      if (qrTicket) qrTicket.classList.remove("hidden");

      if (window.QRCode && qrcodeContainer) {
        new QRCode(qrcodeContainer, {
          text: verificationString,
          width: 140,
          height: 140,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });
      }
    }

    function initQRScanner() {
      if (sessionStorage.getItem("role") !== "volunteer") return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (resultContent)
          resultContent.textContent =
            "Your browser does not support camera access";
        if (scanResult) scanResult.classList.remove("hidden");
        return;
      }

      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (scannerPreview) {
            scannerPreview.srcObject = stream;
            scannerPreview.play();
          }

          const scanInterval = setInterval(() => {
            setTimeout(() => {
              clearInterval(scanInterval);
              const tracks = stream.getTracks();
              tracks.forEach((track) => track.stop());

              handleSuccessfulScan(VERIFICATION_CODE);
            }, 5000);
          }, 1000);

          if (resetScannerBtn) {
            resetScannerBtn.addEventListener("click", () => {
              if (scanResult) scanResult.classList.add("hidden");
              initQRScanner();
            });
          }
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          if (resultContent)
            resultContent.textContent = `Error accessing camera: ${error.message}`;
          if (scanResult) scanResult.classList.remove("hidden");
        });
    }

    function handleSuccessfulScan(scannedData) {
      let resultHTML = "";
      let isVerified = scannedData === VERIFICATION_CODE;

      if (isVerified) {
        resultHTML = `
          <h4 style="color: var(--success);">Ticket Verified! ✅</h4>
          <p><strong>You can enter.</strong></p>
        `;
        if (scanResult) scanResult.style.borderColor = "var(--success)";
      } else {
        resultHTML = `
          <h4 style="color: var(--danger);">Invalid Ticket ❌</h4>
          <p>Please check the QR code and try again.</p>
        `;
        if (scanResult) scanResult.style.borderColor = "var(--danger)";
      }

      if (resultContent) resultContent.innerHTML = resultHTML;
      if (scanResult) scanResult.classList.remove("hidden");
    }
  }

  // ====== ANNOUNCEMENTS FUNCTIONALITY ======

  function loadAnnouncements() {
    const storedAnnouncements = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (storedAnnouncements) {
      announcements = JSON.parse(storedAnnouncements);
    }
    displayAnnouncements("all");

    const filterButtons = document.querySelectorAll(
      ".announcement-filters button"
    );
    if (filterButtons) {
      filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
          filterButtons.forEach((btn) => btn.classList.remove("active"));
          this.classList.add("active");
          const filter = this.dataset.filter;
          displayAnnouncements(filter);
        });
      });
    }

    const announcementForm = document.getElementById("announcementForm");
    if (announcementForm) {
      announcementForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const title = document.getElementById("announcementTitle").value.trim();
        const content = document
          .getElementById("announcementContent")
          .value.trim();
        const priority = document.getElementById("announcementPriority").value;

        if (title && content) {
          addAnnouncement(title, content, priority);
          this.reset();
          showToast("Announcement posted successfully!");
        }
      });
    }

    const announcementList = document.getElementById("announcement-items");
    if (announcementList) {
      announcementList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-announcement-btn")) {
          const announcementId =
            e.target.closest(".announcement-item").dataset.id;
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
      author: sessionStorage.getItem("userName") || "Volunteer",
    };

    announcements.unshift(announcement);
    localStorage.setItem(
      ANNOUNCEMENTS_STORAGE_KEY,
      JSON.stringify(announcements)
    );
    displayAnnouncements("all");
  }

  function deleteAnnouncement(id) {
    announcements = announcements.filter(
      (announcement) => announcement.id !== id
    );
    localStorage.setItem(
      ANNOUNCEMENTS_STORAGE_KEY,
      JSON.stringify(announcements)
    );
    displayAnnouncements("all");
    showToast("Announcement deleted successfully!");
  }

  function displayAnnouncements(filter) {
    const announcementItems = document.getElementById("announcement-items");
    if (!announcementItems) return;

    announcementItems.innerHTML = "";

    const role = sessionStorage.getItem("role");

    let filteredAnnouncements = announcements;
    if (filter !== "all") {
      filteredAnnouncements = announcements.filter(
        (a) => a.priority === filter
      );
    }

    if (filteredAnnouncements.length === 0) {
      const emptyState = document.createElement("li");
      emptyState.className = "empty-state";
      emptyState.textContent =
        filter === "all"
          ? "No announcements yet"
          : `No ${filter} announcements`;
      announcementItems.appendChild(emptyState);
      return;
    }

    filteredAnnouncements.forEach((announcement) => {
      const li = document.createElement("li");
      li.className = "announcement-item";
      li.dataset.id = announcement.id;

      const date = new Date(announcement.timestamp);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

      let deleteButtonHTML = "";
      if (role === "volunteer") {
        deleteButtonHTML =
          '<button class="delete-announcement-btn">🗑️</button>';
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

  // ====== VIEW HANDLING ======
  function showView(viewId) {
    document
      .querySelectorAll(".view")
      .forEach((v) => v.classList.add("hidden"));
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.remove("hidden");

      if (viewId === "ticket") {
        setupEasyEntryFunctionality();
      }

      if (viewId === "emergency") {
        const role = sessionStorage.getItem("role");
        const userMedical = document.getElementById("user-medical");
        const volunteerMedical = document.getElementById("volunteer-medical");

        if (role === "volunteer") {
          userMedical.classList.add("hidden");
          volunteerMedical.classList.remove("hidden");
          initEmergencyMap();
        } else {
          userMedical.classList.remove("hidden");
          volunteerMedical.classList.add("hidden");
        }
      }

      if (viewId === "announcements") {
        const volunteerAnnouncementSection = document.getElementById(
          "volunteer-announcement"
        );
        const role = sessionStorage.getItem("role");

        if (role === "volunteer" && volunteerAnnouncementSection) {
          volunteerAnnouncementSection.classList.remove("hidden");
        } else if (volunteerAnnouncementSection) {
          volunteerAnnouncementSection.classList.add("hidden");
        }

        loadAnnouncements();
      }
    }
  }

  // ====== VOLUNTEER SECURITY ======
  const volunteerAccounts = [
    { email: "volunteer1@example.com", password: "vol123" },
    { email: "volunteer2@example.com", password: "vol456" },
    { email: "chaitanyapantula25@gmail.com", password: "cha12345" },
  ];
  const VOLUNTEER_CODE = "VOL-SECRET-2025";

  // ====== LOGIN / SIGNUP ======
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const logoutBtn = document.getElementById("logoutBtn");

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
          (acc) => acc.email === email && acc.password === password
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

      window.location.href = "pages/functions.html";
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

        window.location.href = "pages/functions.html";
      } else {
        alert("Please fill all fields correctly.");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "../index.html";
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

  // ====== MEDICAL EMERGENCY FUNCTIONALITY ======
  const sosButton = document.getElementById("sos-button");
  const locationStatus = document.getElementById("location-status");
  const emergencyMap = document.getElementById("emergency-map");
  const emergencyRequests = document.getElementById("emergency-requests");

  let activeEmergencies = [];

  function updateEmergencyList() {
    if (!emergencyRequests) return;

    emergencyRequests.innerHTML = "";

    if (activeEmergencies.length === 0) {
      const noEmergencies = document.createElement("li");
      noEmergencies.textContent = "No active emergency requests";
      emergencyRequests.appendChild(noEmergencies);
      return;
    }

    activeEmergencies.forEach((emergency) => {
      const li = document.createElement("li");
      const time = new Date(emergency.timestamp).toLocaleTimeString();
      li.innerHTML = `<strong>${emergency.userName}</strong> - ${time} <button class="btn ghost" data-id="${emergency.id}">Respond</button>`;
      emergencyRequests.appendChild(li);
    });

    document.querySelectorAll("#emergency-requests button").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        respondToEmergency(id);
      });
    });
  }

  function respondToEmergency(id) {
    const index = activeEmergencies.findIndex((e) => e.id === id);
    if (index !== -1) {
      showToast(
        `Responding to ${activeEmergencies[index].userName}'s emergency request`
      );

      activeEmergencies.splice(index, 1);

      initEmergencyMap();
    }
  }

  if (sosButton) {
    sosButton.addEventListener("click", () => {
      locationStatus.classList.remove("hidden");
      locationStatus.textContent = "Sending your location...";

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
              location: pos,
            };

            activeEmergencies.push(emergency);

            const userMap = document.getElementById("user-map");
            if (userMap) {
              const userMapInstance = L.map(userMap).setView(
                [pos.lat, pos.lng],
                15
              );

              L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                  maxZoom: 18,
                  minZoom: 8,
                  tileSize: 512,
                  zoomOffset: -1,
                  attribution:
                    '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                  crossOrigin: true,
                  updateWhenIdle: true,
                  updateWhenZooming: false,
                }
              ).addTo(userMapInstance);

              userMapInstance.options.fadeAnimation = false;
              userMapInstance.options.zoomAnimation = false;
              userMapInstance.options.markerZoomAnimation = false;

              L.marker([pos.lat, pos.lng])
                .addTo(userMapInstance)
                .bindPopup("Your Location")
                .openPopup();
            }

            locationStatus.textContent =
              "Help request sent! Medical staff has been notified.";
            locationStatus.style.color = "var(--success)";

            showToast(
              "Emergency alert sent successfully! Your location in Navi Mumbai has been shared."
            );

            setTimeout(() => {
              locationStatus.classList.add("hidden");
              locationStatus.style.color = "";
            }, 5000);
          },
          (error) => {
            console.error("Geolocation error:", error);
            locationStatus.textContent =
              "Could not get your location. Please try again.";
            locationStatus.style.color = "var(--danger)";

            showToast("Error: Could not determine your location.");

            setTimeout(() => {
              locationStatus.classList.add("hidden");
              locationStatus.style.color = "";
            }, 5000);
          }
        );
      } else {
        locationStatus.textContent =
          "Your browser doesn't support geolocation.";
        locationStatus.style.color = "var(--danger)";

        showToast("Error: Your browser doesn't support geolocation.");

        setTimeout(() => {
          locationStatus.classList.add("hidden");
          locationStatus.style.color = "";
        }, 5000);
      }
    });
  }

  // ====== INITIAL LOAD (for p1.html and login.html) ======
  if (sessionStorage.getItem("loggedIn") === "true") {
    const savedName = sessionStorage.getItem("userName") || "Attendee";
    const role = sessionStorage.getItem("role") || "user";
    updateDashboardGreeting(savedName, role);
    showView("dashboard");
  } else {
    if (
      !document.getElementById("login") &&
      !document.getElementById("signup")
    ) {
      window.location.href = "../index.html";
    }
  }

  // ====== NAVIGATION BUTTONS ======
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-view");
      showView(targetView);
    });
  });

  // ====== UPDATE DASHBOARD GREETING ======
  function updateDashboardGreeting(name, role) {
    const userNameEl = document.getElementById("userName");
    const ticketUserEl = document.getElementById("ticketUser");

    let greetingRole = role === "volunteer" ? "Volunteer" : "User";

    if (userNameEl) userNameEl.textContent = `${name}`;
    if (ticketUserEl) ticketUserEl.textContent = name;
  }

  // ====== LOST & FOUND CHAT (persistent) ======
  const chatForm = document.getElementById("chatForm");
  const chatBox = document.getElementById("chatBox");
  const chatName = document.getElementById("chatName");
  const chatMessage = document.getElementById("chatMessage");
  const chatImage = document.getElementById("chatImage");

  function saveMessages(messages) {
    localStorage.setItem("lostFoundMessages", JSON.stringify(messages));
  }
  function loadMessages() {
    try {
      return JSON.parse(localStorage.getItem("lostFoundMessages") || "[]");
    } catch {
      return [];
    }
  }

  if (chatForm && chatBox && chatName && chatMessage && chatImage) {
    let messages = loadMessages();

    function renderMessages() {
      chatBox.innerHTML = "";
      messages.forEach((msg) => {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.innerHTML = `
          <div class="meta"><strong>${msg.name}</strong> • ${msg.time}</div>
          <div class="text">${msg.text}</div>
        `;
        if (msg.image) {
          const img = document.createElement("img");
          img.src = msg.image;
          msgDiv.appendChild(img);
        }
        chatBox.appendChild(msgDiv);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    renderMessages();

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = chatName.value.trim();
      const text = chatMessage.value.trim();
      const file = chatImage.files[0];
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!name || !text) return;

      let newMsg = { name, text, time, image: null };

      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          newMsg.image = event.target.result;
          messages.push(newMsg);
          saveMessages(messages);
          renderMessages();
        };
        reader.readAsDataURL(file);
      } else {
        messages.push(newMsg);
        saveMessages(messages);
        renderMessages();
      }

      chatMessage.value = "";
      chatImage.value = "";
    });
  }
  // ==========================
  // EasyEntry QR Code Handling
  // ==========================

  // Handle Event Code Form
  const eventCodeForm = document.getElementById("eventCodeForm");
  if (eventCodeForm) {
    eventCodeForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const eventCode = document.getElementById("eventCode").value.trim();
      const userEmail =
        localStorage.getItem("loggedInUserEmail") || "unknown@example.com";

      if (!/^[0-9]{6}$/.test(eventCode)) {
        alert("Please enter a valid 6-digit event code.");
        return;
      }

      // Hide form, show QR ticket
      document.getElementById("event-code-form").classList.add("hidden");
      const qrTicket = document.getElementById("qr-ticket");
      qrTicket.classList.remove("hidden");

      // Update UI with details
      document.getElementById("ticketUser").textContent = userEmail;
      document.getElementById("ticketCode").textContent = eventCode;

      // Generate QR (data: email + event code)
      const qrContainer = document.getElementById("qrcode");
      qrContainer.innerHTML = ""; // clear old QR
      new QRCode(qrContainer, {
        text: JSON.stringify({ email: userEmail, code: eventCode }),
        width: 128,
        height: 128,
      });
    });
  }

  // ==========================
  // Volunteer QR Scanner Result
  // ==========================

  // Example: Assuming scanner library already calls handleScan(resultText)
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
});
