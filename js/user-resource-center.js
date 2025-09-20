// User Resource Center JavaScript
class UserResourceCenter {
    constructor() {
        this.isConnected = true;
        this.updateInterval = null;
        this.lastUpdateTime = new Date();
        this.simulationData = {
            security: {
                total: 12,
                mainStage: 4,
                entrance: 3,
                foodCourt: 2,
                merchandise: 3
            },
            medical: {
                total: 6,
                stations: 2,
                mobile: 3,
                standby: 1
            },
            barriers: {
                total: 8,
                stage: 3,
                queue: 2,
                foodCourt: 2,
                entrance: 1
            },
            attendance: {
                current: 2847,
                capacity: 3700,
                zones: {
                    mainStage: { count: 1247, capacity: 1500 },
                    foodCourt: { count: 623, capacity: 800 },
                    entrance: { count: 312, capacity: 500 },
                    merchandise: { count: 665, capacity: 900 }
                }
            }
        };
        
        this.updates = [
            {
                time: '8:45 PM',
                title: 'Security Deployed',
                description: 'Additional security personnel deployed to Main Stage area due to increased crowd density',
                type: 'success',
                badge: 'Security'
            },
            {
                time: '8:42 PM',
                title: 'Crowd Flow Optimized',
                description: 'Barriers repositioned at Food Court to improve crowd movement',
                type: 'info',
                badge: 'Crowd Control'
            },
            {
                time: '8:38 PM',
                title: 'Medical Unit Standby',
                description: 'Mobile medical unit positioned near Main Stage as precautionary measure',
                type: 'medical',
                badge: 'Medical'
            },
            {
                time: '8:35 PM',
                title: 'All Systems Check',
                description: 'Routine safety check completed - all resources operational',
                type: 'success',
                badge: 'System'
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.updateLastUpdateTime();
        this.simulateDataChanges();
    }
    
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        
        // Zone filter
        const zoneFilter = document.getElementById('zone-filter');
        if (zoneFilter) {
            zoneFilter.addEventListener('change', (e) => this.filterZones(e.target.value));
        }
        
        // Clear updates button
        const clearUpdatesBtn = document.getElementById('clear-updates');
        if (clearUpdatesBtn) {
            clearUpdatesBtn.addEventListener('click', () => this.clearUpdates());
        }
        
        // Emergency buttons
        const emergencyBtns = document.querySelectorAll('.emergency-btn');
        emergencyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEmergencyAction(e));
        });
        
        // Zone items hover effects
        const zoneItems = document.querySelectorAll('.zone-item');
        zoneItems.forEach(item => {
            item.addEventListener('mouseenter', () => this.highlightZone(item));
            item.addEventListener('mouseleave', () => this.unhighlightZone(item));
        });
    }
    
    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateLastUpdateTime();
            this.simulateMinorChanges();
        }, 30000); // Update every 30 seconds
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        
        const lastUpdateElement = document.getElementById('last-update-time');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = timeString;
        }
        
        this.lastUpdateTime = now;
    }
    
    simulateDataChanges() {
        // Simulate realistic data changes every few minutes
        setInterval(() => {
            this.simulateAttendanceChanges();
            this.simulateResourceReallocation();
            this.addRandomUpdate();
        }, 120000); // Every 2 minutes
    }
    
    simulateMinorChanges() {
        // Small random fluctuations in attendance
        Object.keys(this.simulationData.attendance.zones).forEach(zone => {
            const zoneData = this.simulationData.attendance.zones[zone];
            const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
            zoneData.count = Math.max(0, Math.min(zoneData.capacity, zoneData.count + change));
        });
        
        // Update total attendance
        this.simulationData.attendance.current = Object.values(this.simulationData.attendance.zones)
            .reduce((total, zone) => total + zone.count, 0);
        
        this.updateDisplayedData();
    }
    
    simulateAttendanceChanges() {
        // Simulate more significant attendance changes
        const zones = Object.keys(this.simulationData.attendance.zones);
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        const zoneData = this.simulationData.attendance.zones[randomZone];
        
        const change = Math.floor(Math.random() * 101) - 50; // -50 to +50
        zoneData.count = Math.max(0, Math.min(zoneData.capacity, zoneData.count + change));
        
        // Update total
        this.simulationData.attendance.current = Object.values(this.simulationData.attendance.zones)
            .reduce((total, zone) => total + zone.count, 0);
        
        this.updateDisplayedData();
        this.updateZoneDisplay();
    }
    
    simulateResourceReallocation() {
        // Randomly adjust resource allocation
        const actions = [
            () => {
                // Move security personnel
                if (this.simulationData.security.mainStage > 2) {
                    this.simulationData.security.mainStage--;
                    this.simulationData.security.foodCourt++;
                }
            },
            () => {
                // Deploy mobile medical unit
                if (this.simulationData.medical.standby > 0) {
                    this.simulationData.medical.standby--;
                    this.simulationData.medical.mobile++;
                }
            },
            () => {
                // Reposition barriers
                if (this.simulationData.barriers.entrance > 0) {
                    this.simulationData.barriers.entrance--;
                    this.simulationData.barriers.stage++;
                }
            }
        ];
        
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        randomAction();
        
        this.updateDisplayedData();
    }
    
    addRandomUpdate() {
        const updateTemplates = [
            {
                title: 'Resource Reallocation',
                description: 'Security personnel redistributed based on crowd density analysis',
                type: 'info',
                badge: 'Security'
            },
            {
                title: 'Medical Check Complete',
                description: 'Routine medical equipment check completed successfully',
                type: 'success',
                badge: 'Medical'
            },
            {
                title: 'Crowd Flow Update',
                description: 'Barriers adjusted to optimize pedestrian movement',
                type: 'info',
                badge: 'Crowd Control'
            },
            {
                title: 'System Status',
                description: 'All monitoring systems operational and reporting normally',
                type: 'success',
                badge: 'System'
            }
        ];
        
        const template = updateTemplates[Math.floor(Math.random() * updateTemplates.length)];
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        const newUpdate = {
            ...template,
            time: timeString
        };
        
        this.updates.unshift(newUpdate);
        if (this.updates.length > 10) {
            this.updates.pop(); // Keep only last 10 updates
        }
        
        this.updateUpdatesDisplay();
    }
    
    updateDisplayedData() {
        // Update security stats
        document.getElementById('security-count').textContent = this.simulationData.security.total;
        document.getElementById('security-main').textContent = this.simulationData.security.mainStage;
        document.getElementById('security-entrance').textContent = this.simulationData.security.entrance;
        
        // Update medical stats
        document.getElementById('medical-count').textContent = this.simulationData.medical.total;
        document.getElementById('medical-stations').textContent = this.simulationData.medical.stations;
        document.getElementById('medical-mobile').textContent = this.simulationData.medical.mobile;
        
        // Update barrier stats
        document.getElementById('barriers-count').textContent = this.simulationData.barriers.total;
        document.getElementById('barriers-stage').textContent = this.simulationData.barriers.stage;
        document.getElementById('barriers-queue').textContent = this.simulationData.barriers.queue;
        
        // Update attendance stats
        document.getElementById('attendance-count').textContent = this.simulationData.attendance.current.toLocaleString();
        const capacityPercentage = Math.round((this.simulationData.attendance.current / this.simulationData.attendance.capacity) * 100);
        document.getElementById('capacity-percentage').textContent = `${capacityPercentage}%`;
        
        // Update capacity bar
        const attendanceFill = document.querySelector('.attendance-fill');
        if (attendanceFill) {
            attendanceFill.style.width = `${capacityPercentage}%`;
        }
        
        // Update peak time (simulate dynamic peak time)
        const peakTimes = ['8:30 PM', '9:15 PM', '9:45 PM', '10:20 PM'];
        const randomPeakTime = peakTimes[Math.floor(Math.random() * peakTimes.length)];
        document.getElementById('peak-time').textContent = randomPeakTime;
    }
    
    updateZoneDisplay() {
        const zones = [
            { element: 'main-stage', data: this.simulationData.attendance.zones.mainStage, name: 'Main Stage Area' },
            { element: 'food-court', data: this.simulationData.attendance.zones.foodCourt, name: 'Food Court' },
            { element: 'entrance', data: this.simulationData.attendance.zones.entrance, name: 'Main Entrance' },
            { element: 'merchandise', data: this.simulationData.attendance.zones.merchandise, name: 'Merchandise Area' }
        ];
        
        zones.forEach(zone => {
            const zoneElement = document.querySelector(`[data-zone="${zone.element}"]`);
            if (zoneElement) {
                const countElement = zoneElement.querySelector('.zone-count');
                const capacityElement = zoneElement.querySelector('.zone-capacity');
                const indicatorElement = zoneElement.querySelector('.zone-indicator');
                
                if (countElement) {
                    countElement.textContent = `${zone.data.count} people`;
                }
                
                if (capacityElement) {
                    const percentage = Math.round((zone.data.count / zone.data.capacity) * 100);
                    capacityElement.textContent = `${percentage}% capacity`;
                }
                
                if (indicatorElement) {
                    const percentage = (zone.data.count / zone.data.capacity) * 100;
                    indicatorElement.className = 'zone-indicator ' + 
                        (percentage > 80 ? 'high' : percentage > 60 ? 'medium' : 'low');
                }
            }
        });
    }
    
    updateUpdatesDisplay() {
        const updatesContainer = document.getElementById('updates-feed');
        if (!updatesContainer) return;
        
        updatesContainer.innerHTML = '';
        
        this.updates.forEach(update => {
            const updateElement = document.createElement('div');
            updateElement.className = `update-item ${update.type}`;
            updateElement.innerHTML = `
                <div class="update-time">${update.time}</div>
                <div class="update-content">
                    <div class="update-title">${update.title}</div>
                    <div class="update-description">${update.description}</div>
                </div>
                <div class="update-badge">${update.badge}</div>
            `;
            updatesContainer.appendChild(updateElement);
        });
    }
    
    refreshData() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(360deg)';
            refreshBtn.style.transition = 'transform 0.5s ease';
            
            setTimeout(() => {
                refreshBtn.style.transform = 'rotate(0deg)';
            }, 500);
        }
        
        this.simulateMinorChanges();
        this.updateLastUpdateTime();
        
        // Show refresh notification
        this.showNotification('Data refreshed successfully', 'success');
    }
    
    filterZones(filter) {
        const zoneItems = document.querySelectorAll('.zone-item');
        
        zoneItems.forEach(item => {
            const indicator = item.querySelector('.zone-indicator');
            const shouldShow = filter === 'all' || indicator.classList.contains(filter);
            
            item.style.display = shouldShow ? 'block' : 'none';
            item.style.opacity = shouldShow ? '1' : '0';
            item.style.transform = shouldShow ? 'translateY(0)' : 'translateY(-10px)';
        });
    }
    
    clearUpdates() {
        const updatesContainer = document.getElementById('updates-feed');
        if (updatesContainer) {
            updatesContainer.innerHTML = '<div class="update-item info"><div class="update-content"><div class="update-title">Updates Cleared</div><div class="update-description">All previous updates have been cleared</div></div></div>';
        }
        
        this.updates = [];
        this.showNotification('Updates cleared', 'info');
    }
    
    handleEmergencyAction(event) {
        const button = event.target;
        const emergencyItem = button.closest('.emergency-item');
        const title = emergencyItem.querySelector('.emergency-item-title').textContent;
        
        // Simulate emergency action
        button.textContent = 'Processing...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = 'Completed';
            button.style.background = 'rgba(76, 175, 80, 0.3)';
            
            // Add emergency update
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            
            const emergencyUpdate = {
                time: timeString,
                title: `Emergency Action: ${title}`,
                description: `Emergency response initiated for ${title.toLowerCase()}`,
                type: 'success',
                badge: 'Emergency'
            };
            
            this.updates.unshift(emergencyUpdate);
            this.updateUpdatesDisplay();
            
            this.showNotification(`Emergency action initiated: ${title}`, 'success');
            
            // Reset button after 3 seconds
            setTimeout(() => {
                button.textContent = button.getAttribute('data-original-text') || 'Get Help';
                button.disabled = false;
                button.style.background = '';
            }, 3000);
        }, 2000);
    }
    
    highlightZone(zoneElement) {
        zoneElement.style.transform = 'scale(1.02)';
        zoneElement.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        zoneElement.style.zIndex = '10';
    }
    
    unhighlightZone(zoneElement) {
        zoneElement.style.transform = 'scale(1)';
        zoneElement.style.boxShadow = '';
        zoneElement.style.zIndex = '';
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    updateConnectionStatus() {
        const connectionStatus = document.getElementById('connection-status');
        const connectionDot = connectionStatus?.querySelector('.connection-dot');
        
        if (this.isConnected) {
            connectionDot?.classList.add('connected');
            connectionStatus.querySelector('span:last-child').textContent = 'Connected';
        } else {
            connectionDot?.classList.remove('connected');
            connectionStatus.querySelector('span:last-child').textContent = 'Disconnected';
        }
    }
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Utility functions
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Simulate logout
        window.location.href = '../index.html';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const resourceCenter = new UserResourceCenter();
    
    // Store reference globally for debugging
    window.resourceCenter = resourceCenter;
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden, reduce update frequency
            clearInterval(resourceCenter.updateInterval);
        } else {
            // Page is visible, resume normal updates
            resourceCenter.startRealTimeUpdates();
            resourceCenter.refreshData();
        }
    });
    
    // Handle window beforeunload
    window.addEventListener('beforeunload', () => {
        resourceCenter.destroy();
    });
});

// Add some CSS for notifications dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .notification-icon {
        font-size: 16px;
    }
    
    .notification-message {
        font-weight: 500;
    }
`;
document.head.appendChild(notificationStyles);