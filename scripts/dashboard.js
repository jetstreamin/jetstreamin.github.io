// Jetstreamin Dashboard - Real-time Data Management
// Handles live updates, metrics, and compliance monitoring

class DashboardManager {
    constructor() {
        this.updateInterval = 2000; // 2 seconds
        this.websocket = null;
        this.charts = {};
        this.alerts = [];
        this.isAutoRefresh = true;
        
        this.init();
    }
    
    init() {
        this.setupWebSocket();
        this.initializeCharts();
        this.setupRefreshControls();
        this.startDataUpdates();
        console.log('📊 Dashboard Manager initialized');
    }
    
    setupWebSocket() {
        // Simulate WebSocket connection for real-time updates
        // In production, this would connect to actual Jetstreamin backend
        try {
            // Example: this.websocket = new WebSocket('wss://api.jetstreamin.com/ws');
            console.log('🔌 WebSocket connection simulated');
            
            // Simulate incoming data
            setInterval(() => {
                this.simulateWebSocketData();
            }, this.updateInterval);
            
        } catch (error) {
            console.warn('⚠️ WebSocket unavailable, using polling fallback');
            this.setupPollingFallback();
        }
    }
    
    simulateWebSocketData() {
        const mockData = {
            type: 'metrics_update',
            timestamp: Date.now(),
            data: {
                cpu: Math.random() * 100,
                memory: Math.random() * 100,
                network: Math.random() * 100,
                agents: {
                    daemon13: { status: 'active', load: Math.random() * 100 },
                    cyphermorph: { status: 'active', load: Math.random() * 100 },
                    atm: { status: 'active', load: Math.random() * 100 },
                    neta: { status: Math.random() > 0.8 ? 'warning' : 'active', load: Math.random() * 100 },
                    wanita: { status: 'active', load: Math.random() * 100 }
                },
                compliance: {
                    score: 85 + Math.random() * 15,
                    checks: this.generateComplianceChecks()
                }
            }
        };
        
        this.handleWebSocketMessage(mockData);
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'metrics_update':
                this.updateDashboardMetrics(data.data);
                break;
            case 'alert':
                this.addAlert(data.data);
                break;
            case 'agent_status':
                this.updateAgentStatus(data.data);
                break;
        }
    }
    
    updateDashboardMetrics(data) {
        // Update progress bars
        this.updateProgressBar('cpu', data.cpu);
        this.updateProgressBar('memory', data.memory);
        this.updateProgressBar('network', data.network);
        
        // Update agent statuses
        Object.keys(data.agents).forEach(agentKey => {
            this.updateAgentIndicator(agentKey, data.agents[agentKey]);
        });
        
        // Update compliance score
        this.updateComplianceStatus(data.compliance);
        
        // Trigger visual feedback
        this.triggerUpdateAnimation();
    }
    
    updateProgressBar(metricName, value) {
        const progressBar = document.querySelector(`[data-metric="${metricName}"] .progress`);
        const valueDisplay = document.querySelector(`[data-metric="${metricName}"] .metric-value`);
        
        if (progressBar) {
            progressBar.style.width = `${Math.round(value)}%`;
            
            // Color coding based on value
            if (value > 80) {
                progressBar.style.background = 'linear-gradient(90deg, var(--warning-color), var(--error-color))';
            } else if (value > 60) {
                progressBar.style.background = 'linear-gradient(90deg, var(--primary-color), var(--warning-color))';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))';
            }
        }
        
        if (valueDisplay) {
            valueDisplay.textContent = `${Math.round(value)}%`;
        }
    }
    
    updateAgentIndicator(agentKey, agentData) {
        const indicator = document.querySelector(`[data-agent="${agentKey}"] .status-dot`);
        if (indicator) {
            indicator.className = `status-dot ${agentData.status}`;
        }
        
        // Update load information if available
        const loadDisplay = document.querySelector(`[data-agent="${agentKey}"] .agent-load`);
        if (loadDisplay) {
            loadDisplay.textContent = `${Math.round(agentData.load)}%`;
        }
    }
    
    updateComplianceStatus(complianceData) {
        const scoreElement = document.querySelector('.compliance-score');
        if (scoreElement) {
            scoreElement.textContent = `${Math.round(complianceData.score)}%`;
            
            // Update score color
            if (complianceData.score > 90) {
                scoreElement.style.color = 'var(--success-color)';
            } else if (complianceData.score > 70) {
                scoreElement.style.color = 'var(--warning-color)';
            } else {
                scoreElement.style.color = 'var(--error-color)';
            }
        }
        
        // Update individual checks
        complianceData.checks.forEach(check => {
            const checkElement = document.querySelector(`[data-check="${check.id}"]`);
            if (checkElement) {
                checkElement.className = `check-item ${check.status}`;
                checkElement.innerHTML = `${check.icon} ${check.name}`;
            }
        });
    }
    
    generateComplianceChecks() {
        const checks = [
            { id: 'static-analysis', name: 'Static Analysis', status: 'passed', icon: '✓' },
            { id: 'lock-file', name: 'Lock File Validation', status: 'passed', icon: '✓' },
            { id: 'audit-logs', name: 'Audit Logs', status: 'passed', icon: '✓' },
            { id: 'column-format', name: '80-Column Format', status: Math.random() > 0.7 ? 'warning' : 'passed', icon: Math.random() > 0.7 ? '⚠' : '✓' }
        ];
        
        return checks;
    }
    
    triggerUpdateAnimation() {
        const cards = document.querySelectorAll('.dashboard-card');
        cards.forEach(card => {
            card.classList.add('updating');
            setTimeout(() => card.classList.remove('updating'), 1000);
        });
    }
    
    addAlert(alertData) {
        this.alerts.unshift({
            id: Date.now(),
            ...alertData,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 alerts
        this.alerts = this.alerts.slice(0, 50);
        
        this.renderAlerts();
        this.showToastNotification(alertData);
    }
    
    renderAlerts() {
        const alertContainer = document.querySelector('.alerts-container');
        if (!alertContainer) return;
        
        alertContainer.innerHTML = this.alerts.map(alert => `
            <div class="alert alert-${alert.level}" data-alert-id="${alert.id}">
                <div class="alert-header">
                    <span class="alert-icon">${this.getAlertIcon(alert.level)}</span>
                    <span class="alert-title">${alert.title}</span>
                    <button class="alert-close" onclick="dashboardManager.dismissAlert(${alert.id})">&times;</button>
                </div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-timestamp">${new Date(alert.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    
    getAlertIcon(level) {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '🚨',
            success: '✅'
        };
        return icons[level] || 'ℹ️';
    }
    
    showToastNotification(alert) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${alert.level}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getAlertIcon(alert.level)}</span>
                <div class="toast-text">
                    <div class="toast-title">${alert.title}</div>
                    <div class="toast-message">${alert.message}</div>
                </div>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    dismissAlert(alertId) {
        this.alerts = this.alerts.filter(alert => alert.id !== alertId);
        this.renderAlerts();
    }
    
    setupRefreshControls() {
        const refreshButton = document.querySelector('.refresh-button');
        const autoRefreshToggle = document.querySelector('.auto-refresh-toggle');
        
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.manualRefresh();
            });
        }
        
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.isAutoRefresh = e.target.checked;
                this.toggleAutoRefresh();
            });
        }
    }
    
    manualRefresh() {
        console.log('🔄 Manual refresh triggered');
        this.simulateWebSocketData();
        
        // Visual feedback
        const refreshButton = document.querySelector('.refresh-button');
        if (refreshButton) {
            refreshButton.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                refreshButton.style.transform = 'rotate(0deg)';
            }, 500);
        }
    }
    
    toggleAutoRefresh() {
        const indicator = document.querySelector('.refresh-indicator');
        if (indicator) {
            indicator.style.display = this.isAutoRefresh ? 'block' : 'none';
        }
        
        console.log(`🔄 Auto-refresh ${this.isAutoRefresh ? 'enabled' : 'disabled'}`);
    }
    
    startDataUpdates() {
        if (!this.isAutoRefresh) return;
        
        // Start activity log updates
        setInterval(() => {
            this.addActivityLogEntry();
        }, 4000);
        
        // Start performance metric updates
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 3000);
    }
    
    addActivityLogEntry() {
        const activities = [
            { message: 'ATM processed 47 thought cycles', level: 'info' },
            { message: 'NETA executed compliance check', level: 'success' },
            { message: 'Cyphermorph transformed 3 prompts', level: 'info' },
            { message: 'Daemon13 optimized execution path', level: 'success' },
            { message: 'WANITA synchronized network state', level: 'info' },
            { message: 'System backup completed successfully', level: 'success' },
            { message: 'New AR content deployed', level: 'info' },
            { message: 'Security scan detected anomaly', level: 'warning' },
            { message: 'Performance optimization applied', level: 'success' }
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        // Add to activity log
        const logContainer = document.querySelector('.activity-log');
        if (logContainer) {
            const newEntry = document.createElement('div');
            newEntry.className = `activity-item new ${randomActivity.level}`;
            newEntry.innerHTML = `
                <span class="timestamp">${timestamp}</span>
                <span class="message ${randomActivity.level}">${randomActivity.message}</span>
            `;
            
            logContainer.insertBefore(newEntry, logContainer.firstChild);
            
            // Remove old entries (keep only 10)
            const entries = logContainer.querySelectorAll('.activity-item');
            if (entries.length > 10) {
                entries[entries.length - 1].remove();
            }
            
            // Remove 'new' class after animation
            setTimeout(() => newEntry.classList.remove('new'), 1000);
        }
    }
    
    updatePerformanceMetrics() {
        // Update large metric displays
        const metrics = {
            'total-tasks': Math.floor(1200 + Math.random() * 100),
            'active-thoughts': Math.floor(15000 + Math.random() * 1000),
            'decisions-made': Math.floor(3200 + Math.random() * 50),
            'network-nodes': Math.floor(180 + Math.random() * 20)
        };
        
        Object.keys(metrics).forEach(metricKey => {
            const element = document.querySelector(`[data-metric-large="${metricKey}"]`);
            if (element) {
                const currentValue = parseInt(element.textContent.replace(/[^\d]/g, ''));
                const newValue = metrics[metricKey];
                
                // Animate the counter
                this.animateCounter(element, currentValue, newValue, 1000);
            }
        });
    }
    
    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const difference = end - start;
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (difference * progress));
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    initializeCharts() {
        // Initialize performance charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.initPerformanceChart();
            this.initNetworkTopologyChart();
        }
    }
    
    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 20}, (_, i) => `${i}s`),
                datasets: [{
                    label: 'CPU Usage',
                    data: Array.from({length: 20}, () => Math.random() * 100),
                    borderColor: 'var(--primary-color)',
                    tension: 0.4
                }, {
                    label: 'Memory Usage',
                    data: Array.from({length: 20}, () => Math.random() * 100),
                    borderColor: 'var(--secondary-color)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    exportDashboardData() {
        const dashboardData = {
            timestamp: new Date().toISOString(),
            metrics: this.getCurrentMetrics(),
            alerts: this.alerts,
            agents: this.getCurrentAgentStatus(),
            compliance: this.getCurrentComplianceStatus()
        };
        
        const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `jetstreamin-dashboard-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📊 Dashboard data exported');
    }
    
    getCurrentMetrics() {
        // Extract current metrics from DOM
        return {
            cpu: this.getMetricValue('cpu'),
            memory: this.getMetricValue('memory'),
            network: this.getMetricValue('network')
        };
    }
    
    getMetricValue(metricName) {
        const element = document.querySelector(`[data-metric="${metricName}"] .metric-value`);
        return element ? parseFloat(element.textContent) : 0;
    }
    
    getCurrentAgentStatus() {
        const agents = {};
        document.querySelectorAll('[data-agent]').forEach(element => {
            const agentName = element.dataset.agent;
            const statusDot = element.querySelector('.status-dot');
            agents[agentName] = {
                status: statusDot ? statusDot.className.split(' ')[1] : 'unknown'
            };
        });
        return agents;
    }
    
    getCurrentComplianceStatus() {
        const checks = {};
        document.querySelectorAll('[data-check]').forEach(element => {
            const checkName = element.dataset.check;
            checks[checkName] = {
                status: element.className.split(' ')[1]
            };
        });
        return checks;
    }
}

// Initialize dashboard manager
let dashboardManager;
document.addEventListener('DOMContentLoaded', () => {
    dashboardManager = new DashboardManager();
});
