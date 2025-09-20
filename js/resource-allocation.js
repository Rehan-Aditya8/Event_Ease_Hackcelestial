// Resource Allocation System - AI-Powered Event Management
class ResourceAllocationSystem {
    constructor() {
        this.crowdData = {
            zones: {
                'Main Stage': { current: 1247, capacity: 1500, trend: 'increasing' },
                'Food Court': { current: 623, capacity: 800, trend: 'stable' },
                'Entrance': { current: 312, capacity: 500, trend: 'decreasing' },
                'Merchandise': { current: 665, capacity: 900, trend: 'increasing' }
            },
            totalAttendees: 2847,
            lastUpdate: new Date()
        };

        this.resources = {
            security: {
                'Main Stage Security': 4,
                'Entrance Security': 3,
                'Roaming Patrol': 5
            },
            barricades: {
                'Stage Barriers': 3,
                'Queue Management': 2,
                'Emergency Exits': 3
            },
            medical: {
                'First Aid Stations': 2,
                'Mobile Medics': 3,
                'Emergency Response': 1
            }
        };

        this.activityLog = [];
        this.emergencyMode = false;
        this.aiSuggestions = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startCrowdMonitoring();
        this.generateAISuggestions();
        this.updateDashboard();
        this.initializeCrowdChart();
        
        // Log system initialization
        this.addLogEntry('Resource Allocation System initialized', 'success');
    }

    setupEventListeners() {
        // Refresh data button
        document.getElementById('refresh-data')?.addEventListener('click', () => {
            this.refreshData();
        });

        // Emergency mode button
        document.getElementById('emergency-mode')?.addEventListener('click', () => {
            this.activateEmergencyMode();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Resource controls
        document.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleResourceChange(e.target);
            });
        });

        // Time range selector
        document.getElementById('time-range')?.addEventListener('change', (e) => {
            this.updateCrowdChart(e.target.value);
        });
    }

    // Crowd Data Simulation
    startCrowdMonitoring() {
        setInterval(() => {
            this.simulateCrowdMovement();
            this.updateDashboard();
            this.generateAISuggestions();
        }, 5000); // Update every 5 seconds
    }

    simulateCrowdMovement() {
        Object.keys(this.crowdData.zones).forEach(zone => {
            const zoneData = this.crowdData.zones[zone];
            const change = Math.floor(Math.random() * 40) - 20; // -20 to +20 people
            
            zoneData.current = Math.max(0, Math.min(zoneData.capacity, zoneData.current + change));
            
            // Update trend based on recent changes
            if (change > 5) zoneData.trend = 'increasing';
            else if (change < -5) zoneData.trend = 'decreasing';
            else zoneData.trend = 'stable';
        });

        // Update total attendees
        this.crowdData.totalAttendees = Object.values(this.crowdData.zones)
            .reduce((total, zone) => total + zone.current, 0);
        
        this.crowdData.lastUpdate = new Date();
    }

    // AI Suggestion Algorithm
    generateAISuggestions() {
        this.aiSuggestions = [];

        Object.entries(this.crowdData.zones).forEach(([zoneName, zoneData]) => {
            const density = zoneData.current / zoneData.capacity;
            
            // High density suggestions
            if (density > 0.85) {
                this.aiSuggestions.push({
                    type: 'security',
                    priority: 'high',
                    title: `Increase Security at ${zoneName}`,
                    description: `Crowd density at ${Math.round(density * 100)}%. Deploy additional security personnel to manage crowd flow.`,
                    action: () => this.deployResource('security', zoneName, 2)
                });

                if (density > 0.9) {
                    this.aiSuggestions.push({
                        type: 'barricades',
                        priority: 'high',
                        title: `Deploy Crowd Control at ${zoneName}`,
                        description: `Critical density reached. Immediate barricade deployment recommended.`,
                        action: () => this.deployResource('barricades', zoneName, 1)
                    });
                }
            }

            // Trend-based suggestions
            if (zoneData.trend === 'increasing' && density > 0.7) {
                this.aiSuggestions.push({
                    type: 'medical',
                    priority: 'medium',
                    title: `Medical Standby for ${zoneName}`,
                    description: `Increasing crowd trend detected. Position medical staff nearby as precaution.`,
                    action: () => this.deployResource('medical', zoneName, 1)
                });
            }

            // Low density optimization
            if (density < 0.3 && zoneData.trend === 'decreasing') {
                this.aiSuggestions.push({
                    type: 'optimization',
                    priority: 'low',
                    title: `Optimize Resources from ${zoneName}`,
                    description: `Low crowd density. Consider reallocating resources to high-demand areas.`,
                    action: () => this.optimizeResources(zoneName)
                });
            }
        });

        // Emergency suggestions
        const totalDensity = this.crowdData.totalAttendees / 3700; // Total capacity
        if (totalDensity > 0.9) {
            this.aiSuggestions.unshift({
                type: 'emergency',
                priority: 'high',
                title: 'Event Capacity Critical',
                description: 'Total event capacity approaching maximum. Consider entry restrictions.',
                action: () => this.activateEmergencyMode()
            });
        }

        this.updateSuggestionsDisplay();
    }

    deployResource(type, zone, amount) {
        // Simulate resource deployment
        this.addLogEntry(`Deployed ${amount} ${type} unit(s) to ${zone}`, 'success');
        
        // Update resource counts (simplified)
        const resourceKey = Object.keys(this.resources[type])[0];
        if (resourceKey) {
            this.resources[type][resourceKey] += amount;
            this.updateResourceDisplay();
        }
    }

    optimizeResources(fromZone) {
        this.addLogEntry(`Optimizing resources from ${fromZone}`, 'info');
        // Implementation for resource reallocation
    }

    // UI Update Methods
    updateDashboard() {
        // Update status cards
        document.getElementById('total-attendees').textContent = this.crowdData.totalAttendees.toLocaleString();
        
        const avgDensity = this.crowdData.totalAttendees / 3700;
        let densityLevel = 'Low';
        if (avgDensity > 0.7) densityLevel = 'High';
        else if (avgDensity > 0.4) densityLevel = 'Medium';
        
        document.getElementById('crowd-density').textContent = densityLevel;
        
        // Update security count
        const totalSecurity = Object.values(this.resources.security).reduce((a, b) => a + b, 0);
        document.getElementById('security-deployed').textContent = totalSecurity;
        
        // Update barricades count
        const totalBarricades = Object.values(this.resources.barricades).reduce((a, b) => a + b, 0);
        document.getElementById('barricades-deployed').textContent = totalBarricades;

        // Update zone displays
        this.updateZoneDisplay();
    }

    updateZoneDisplay() {
        const zoneContainer = document.querySelector('.crowd-zones');
        if (!zoneContainer) return;

        zoneContainer.innerHTML = '';
        
        Object.entries(this.crowdData.zones).forEach(([zoneName, zoneData]) => {
            const density = zoneData.current / zoneData.capacity;
            let indicatorClass = 'low';
            if (density > 0.7) indicatorClass = 'high';
            else if (density > 0.4) indicatorClass = 'medium';

            const zoneElement = document.createElement('div');
            zoneElement.className = 'zone-item';
            zoneElement.innerHTML = `
                <div class="zone-indicator ${indicatorClass}"></div>
                <span class="zone-name">${zoneName}</span>
                <span class="zone-count">${zoneData.current}</span>
            `;
            
            zoneContainer.appendChild(zoneElement);
        });
    }

    updateSuggestionsDisplay() {
        const suggestionsContainer = document.getElementById('suggestions-list');
        if (!suggestionsContainer) return;

        suggestionsContainer.innerHTML = '';

        // Sort suggestions by priority
        const sortedSuggestions = this.aiSuggestions.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        sortedSuggestions.slice(0, 5).forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = `suggestion-item ${suggestion.priority}-priority`;
            suggestionElement.innerHTML = `
                <div class="suggestion-header">
                    <h4 class="suggestion-title">${suggestion.title}</h4>
                    <span class="suggestion-priority ${suggestion.priority}">${suggestion.priority.toUpperCase()}</span>
                </div>
                <p class="suggestion-description">${suggestion.description}</p>
                <div class="suggestion-actions">
                    <button class="btn primary small" onclick="resourceSystem.executeSuggestion(${index})">
                        Deploy
                    </button>
                    <button class="btn ghost small" onclick="resourceSystem.dismissSuggestion(${index})">
                        Dismiss
                    </button>
                </div>
            `;
            
            suggestionsContainer.appendChild(suggestionElement);
        });
    }

    executeSuggestion(index) {
        const suggestion = this.aiSuggestions[index];
        if (suggestion && suggestion.action) {
            suggestion.action();
            this.addLogEntry(`Executed AI suggestion: ${suggestion.title}`, 'success');
            this.aiSuggestions.splice(index, 1);
            this.updateSuggestionsDisplay();
        }
    }

    dismissSuggestion(index) {
        const suggestion = this.aiSuggestions[index];
        if (suggestion) {
            this.addLogEntry(`Dismissed suggestion: ${suggestion.title}`, 'info');
            this.aiSuggestions.splice(index, 1);
            this.updateSuggestionsDisplay();
        }
    }

    // Resource Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    handleResourceChange(button) {
        const resourceItem = button.closest('.resource-item');
        const resourceName = resourceItem.querySelector('.resource-name').textContent;
        const countElement = resourceItem.querySelector('.resource-count');
        const currentCount = parseInt(countElement.textContent);
        
        const isIncrease = button.classList.contains('increase');
        const newCount = isIncrease ? currentCount + 1 : Math.max(0, currentCount - 1);
        
        countElement.textContent = newCount;
        
        const action = isIncrease ? 'Increased' : 'Decreased';
        this.addLogEntry(`${action} ${resourceName} to ${newCount}`, 'info');
        
        // Update internal resource tracking
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        if (this.resources[activeTab] && this.resources[activeTab][resourceName] !== undefined) {
            this.resources[activeTab][resourceName] = newCount;
        }
        
        this.updateDashboard();
    }

    updateResourceDisplay() {
        Object.entries(this.resources).forEach(([type, resources]) => {
            Object.entries(resources).forEach(([name, count]) => {
                const resourceElement = document.querySelector(`#${type}-tab .resource-item`);
                if (resourceElement && resourceElement.querySelector('.resource-name').textContent === name) {
                    resourceElement.querySelector('.resource-count').textContent = count;
                }
            });
        });
    }

    // Crowd Chart Visualization
    initializeCrowdChart() {
        const canvas = document.getElementById('crowd-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.chartData = this.generateChartData('1h');
        this.drawChart(ctx, canvas);
        
        // Update chart every 30 seconds
        setInterval(() => {
            this.updateChart(ctx, canvas);
        }, 30000);
    }

    generateChartData(timeRange) {
        const points = timeRange === '1h' ? 12 : timeRange === '4h' ? 24 : 48;
        const data = [];
        
        for (let i = 0; i < points; i++) {
            const baseValue = 2500 + Math.sin(i * 0.5) * 500;
            const noise = (Math.random() - 0.5) * 200;
            data.push(Math.max(0, baseValue + noise));
        }
        
        return data;
    }

    drawChart(ctx, canvas) {
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height - 2 * padding) * i / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw chart line
        if (this.chartData.length > 1) {
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            const maxValue = Math.max(...this.chartData);
            const minValue = Math.min(...this.chartData);
            const range = maxValue - minValue || 1;
            
            this.chartData.forEach((value, index) => {
                const x = padding + (width - 2 * padding) * index / (this.chartData.length - 1);
                const y = height - padding - (height - 2 * padding) * (value - minValue) / range;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = '#007bff';
            this.chartData.forEach((value, index) => {
                const x = padding + (width - 2 * padding) * index / (this.chartData.length - 1);
                const y = height - padding - (height - 2 * padding) * (value - minValue) / range;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
        
        // Draw labels
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Crowd Density Over Time', width / 2, 20);
    }

    updateChart(ctx, canvas) {
        // Add new data point
        this.chartData.push(this.crowdData.totalAttendees);
        if (this.chartData.length > 24) {
            this.chartData.shift();
        }
        
        this.drawChart(ctx, canvas);
    }

    updateCrowdChart(timeRange) {
        this.chartData = this.generateChartData(timeRange);
        const canvas = document.getElementById('crowd-chart');
        if (canvas) {
            this.drawChart(canvas.getContext('2d'), canvas);
        }
    }

    // Activity Logging
    addLogEntry(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            timestamp,
            message,
            type
        };
        
        this.activityLog.unshift(entry);
        if (this.activityLog.length > 50) {
            this.activityLog.pop();
        }
        
        this.updateActivityLog();
    }

    updateActivityLog() {
        const logContainer = document.getElementById('activity-log');
        if (!logContainer) return;

        logContainer.innerHTML = '';
        
        this.activityLog.slice(0, 10).forEach(entry => {
            const logElement = document.createElement('div');
            logElement.className = `log-entry ${entry.type}`;
            logElement.innerHTML = `
                <div class="log-timestamp">${entry.timestamp}</div>
                <div class="log-message">${entry.message}</div>
            `;
            
            logContainer.appendChild(logElement);
        });
    }

    // Emergency Mode
    activateEmergencyMode() {
        document.getElementById('emergency-modal').classList.remove('hidden');
    }

    deployEmergencyResources() {
        this.emergencyMode = true;
        
        // Auto-deploy maximum resources to all high-density areas
        Object.entries(this.crowdData.zones).forEach(([zoneName, zoneData]) => {
            const density = zoneData.current / zoneData.capacity;
            if (density > 0.6) {
                this.deployResource('security', zoneName, 3);
                this.deployResource('barricades', zoneName, 2);
                this.deployResource('medical', zoneName, 1);
            }
        });
        
        this.addLogEntry('Emergency mode activated - All resources deployed', 'error');
        this.closeEmergencyModal();
    }

    closeEmergencyModal() {
        document.getElementById('emergency-modal').classList.add('hidden');
    }

    // Data Refresh
    refreshData() {
        this.addLogEntry('Refreshing crowd data...', 'info');
        
        // Simulate data refresh
        setTimeout(() => {
            this.simulateCrowdMovement();
            this.updateDashboard();
            this.generateAISuggestions();
            this.addLogEntry('Data refresh completed', 'success');
        }, 1000);
    }

    // Utility Methods
    clearLog() {
        this.activityLog = [];
        this.updateActivityLog();
        this.addLogEntry('Activity log cleared', 'info');
    }
}

// Global functions for HTML event handlers
function logout() {
    window.location.href = '../index.html';
}

function closeEmergencyModal() {
    resourceSystem.closeEmergencyModal();
}

function deployEmergencyResources() {
    resourceSystem.deployEmergencyResources();
}

function clearLog() {
    resourceSystem.clearLog();
}

// Initialize the system when DOM is loaded
let resourceSystem;

document.addEventListener('DOMContentLoaded', () => {
    resourceSystem = new ResourceAllocationSystem();
    
    // Add some initial log entries
    setTimeout(() => {
        resourceSystem.addLogEntry('AI monitoring system online', 'success');
        resourceSystem.addLogEntry('Crowd sensors calibrated', 'success');
        resourceSystem.addLogEntry('Resource deployment ready', 'info');
    }, 1000);
});