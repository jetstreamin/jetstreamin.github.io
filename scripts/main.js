// Jetstreamin Homepage - Main JavaScript
// Autonomous AI Agent Platform Interactive Features

class JetstreamingHomepage {
    constructor() {
        this.agents = {
            daemon13: { status: 'active', load: 65, uptime: 99.7 },
            cyphermorph: { status: 'active', load: 42, uptime: 98.2 },
            atm: { status: 'active', load: 78, uptime: 99.1 },
            neta: { status: 'warning', load: 55, uptime: 97.8 },
            wanita: { status: 'active', load: 33, uptime: 99.5 }
        };
        
        this.metrics = {
            cpu: 65,
            memory: 42,
            network: 78,
            tasks: 1247,
            thoughts: 15432,
            decisions: 3241
        };
        
        this.activityLog = [];
        this.complianceStatus = {
            staticAnalysis: 'passed',
            lockFile: 'passed',
            auditLogs: 'passed',
            columnFormat: 'warning'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.initializeAnimations();
        this.loadDashboardData();
        console.log('🚀 Jetstreamin Homepage initialized');
    }
    
    setupEventListeners() {
        // Navigation smooth scrolling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Agent network interactions
        document.querySelectorAll('.agent-node').forEach(node => {
            node.addEventListener('click', (e) => {
                this.showAgentDetails(e.target.textContent.trim());
            });
        });
        
        // Dashboard card interactions
        document.querySelectorAll('.dashboard-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('updating');
                setTimeout(() => card.classList.remove('updating'), 2000);
            });
        });
    }
    
    startRealTimeUpdates() {
        // Simulate real-time data updates
        setInterval(() => {
            this.updateMetrics();
            this.updateActivityLog();
            this.updateAgentStatus();
        }, 3000);
        
        // Update progress bars
        setInterval(() => {
            this.animateProgressBars();
        }, 5000);
    }
    
    updateMetrics() {
        // Simulate fluctuating metrics
        this.metrics.cpu = Math.max(30, Math.min(95, this.metrics.cpu + (Math.random() - 0.5) * 10));
        this.metrics.memory = Math.max(20, Math.min(90, this.metrics.memory + (Math.random() - 0.5) * 8));
        this.metrics.network = Math.max(40, Math.min(100, this.metrics.network + (Math.random() - 0.5) * 15));
        
        // Update DOM
        const cpuProgress = document.querySelector('.metric:nth-child(1) .progress');
        const memProgress = document.querySelector('.metric:nth-child(2) .progress');
        const netProgress = document.querySelector('.metric:nth-child(3) .progress');
        
        if (cpuProgress) cpuProgress.style.width = `${this.metrics.cpu}%`;
        if (memProgress) memProgress.style.width = `${this.metrics.memory}%`;
        if (netProgress) netProgress.style.width = `${this.metrics.network}%`;
        
        // Update text values
        const cpuText = document.querySelector('.metric:nth-child(1) span');
        const memText = document.querySelector('.metric:nth-child(2) span');
        const netText = document.querySelector('.metric:nth-child(3) span');
        
        if (cpuText) cpuText.textContent = `${Math.round(this.metrics.cpu)}%`;
        if (memText) memText.textContent = `${Math.round(this.metrics.memory)}%`;
        if (netText) netText.textContent = `${Math.round(this.metrics.network)}%`;
    }
    
    updateActivityLog() {
        const activities = [
            'ATM processed 47 thought cycles',
            'NETA executed compliance check',
            'Cyphermorph transformed 3 prompts',
            'Daemon13 optimized execution path',
            'WANITA synchronized network state',
            'System backup completed successfully',
            'New AR content deployed',
            'Security scan completed',
            'Performance optimization applied'
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        this.activityLog.unshift({ timestamp, message: randomActivity });
        this.activityLog = this.activityLog.slice(0, 10); // Keep only last 10
        
        this.renderActivityLog();
    }
    
    renderActivityLog() {
        const logContainer = document.querySelector('.activity-log');
        if (!logContainer) return;
        
        logContainer.innerHTML = this.activityLog.map(item => `
            <div class="activity-item">
                <span class="timestamp">${item.timestamp}</span>
                <span class="message">${item.message}</span>
            </div>
        `).join('');
    }
    
    updateAgentStatus() {
        // Randomly update agent statuses
        const agentKeys = Object.keys(this.agents);
        const randomAgent = agentKeys[Math.floor(Math.random() * agentKeys.length)];
        
        if (Math.random() < 0.1) { // 10% chance to change status
            const statuses = ['active', 'warning', 'active', 'active']; // Bias toward active
            this.agents[randomAgent].status = statuses[Math.floor(Math.random() * statuses.length)];
        }
        
        this.renderAgentStatus();
    }
    
    renderAgentStatus() {
        const statusItems = document.querySelectorAll('.status-item');
        const agentKeys = Object.keys(this.agents);
        
        statusItems.forEach((item, index) => {
            if (index < agentKeys.length) {
                const agent = this.agents[agentKeys[index]];
                const dot = item.querySelector('.status-dot');
                if (dot) {
                    dot.className = `status-dot ${agent.status}`;
                }
            }
        });
    }
    
    animateProgressBars() {
        document.querySelectorAll('.progress').forEach(bar => {
            const width = parseFloat(bar.style.width) || 0;
            const variance = (Math.random() - 0.5) * 10;
            const newWidth = Math.max(10, Math.min(100, width + variance));
            bar.style.width = `${newWidth}%`;
        });
    }
    
    showAgentDetails(agentName) {
        const agentMap = {
            'D13': 'daemon13',
            'CM': 'cyphermorph',
            'ATM': 'atm',
            'NETA': 'neta',
            'WAN': 'wanita'
        };
        
        const agentKey = agentMap[agentName];
        if (!agentKey || !this.agents[agentKey]) return;
        
        const agent = this.agents[agentKey];
        const modal = this.createAgentModal(agentKey, agent);
        document.body.appendChild(modal);
        
        setTimeout(() => modal.classList.add('show'), 10);
    }
    
    createAgentModal(agentKey, agent) {
        const modal = document.createElement('div');
        modal.className = 'agent-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${agentKey.toUpperCase()} Agent Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="agent-detail">
                        <strong>Status:</strong> 
                        <span class="status-${agent.status}">${agent.status.toUpperCase()}</span>
                    </div>
                    <div class="agent-detail">
                        <strong>Load:</strong> ${agent.load}%
                    </div>
                    <div class="agent-detail">
                        <strong>Uptime:</strong> ${agent.uptime}%
                    </div>
                    <div class="agent-capabilities">
                        <strong>Capabilities:</strong>
                        <ul>
                            ${this.getAgentCapabilities(agentKey).map(cap => `<li>${cap}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
        
        return modal;
    }
    
    getAgentCapabilities(agentKey) {
        const capabilities = {
            daemon13: [
                'Central execution core',
                'DAG state management',
                'Autonomous agent actions',
                'Security enforcement'
            ],
            cyphermorph: [
                'Dynamic transformation',
                'Promptbook mutation',
                'Inference framing',
                'User interface logic'
            ],
            atm: [
                'Independent thought processing',
                'Context iteration',
                'Result refinement',
                'DAG output generation'
            ],
            neta: [
                'Executive authority',
                'Tactical enforcement',
                'Operations oversight',
                'Compliance management'
            ],
            wanita: [
                'Global networking',
                'Broadcast management',
                'Transfer operations',
                'Transport coordination'
            ]
        };
        
        return capabilities[agentKey] || [];
    }
    
    initializeAnimations() {
        // Animate counters on scroll
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounters(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.metric-value, .agent-metrics .metric').forEach(el => {
            observer.observe(el);
        });
    }
    
    animateCounters(element) {
        const text = element.textContent;
        const number = parseInt(text.replace(/[^\d]/g, ''));
        if (isNaN(number)) return;
        
        let current = 0;
        const increment = number / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                current = number;
                clearInterval(timer);
            }
            element.textContent = text.replace(/\d+/, Math.floor(current));
        }, 20);
    }
    
    loadDashboardData() {
        // Simulate loading dashboard data
        setTimeout(() => {
            this.renderActivityLog();
            this.renderAgentStatus();
            this.updateMetrics();
        }, 500);
    }
}

// Global functions for button interactions
window.startDemo = function() {
    console.log('🎮 Starting Jetstreamin demo...');
    alert('Demo mode activated! Explore the autonomous AI agents in action.');
};

window.viewDocs = function() {
    console.log('📚 Opening documentation...');
    window.open('https://github.com/jetstreamin/jetstreamin-private/blob/main/README.md', '_blank');
};

window.startARExperience = function() {
    console.log('🥽 Launching AR experience...');
    const arCanvas = document.querySelector('.ar-canvas');
    if (arCanvas) {
        arCanvas.classList.add('active');
        setTimeout(() => arCanvas.classList.remove('active'), 5000);
    }
    alert('AR Experience launched! Point your device at QR codes to interact.');
};

window.dropARContent = function() {
    console.log('📍 Dropping AR content...');
    alert('AR content dropped at your current location! Others can now discover it.');
};

window.viewARMap = function() {
    console.log('🗺️ Opening AR map...');
    const arMap = document.querySelector('.ar-map');
    if (arMap) {
        arMap.classList.toggle('active');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jetstreamin = new JetstreamingHomepage();
    
    // Add modal styles dynamically
    const modalStyles = `
        .agent-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .agent-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-content {
            background: var(--bg-card);
            border: 1px solid var(--primary-color);
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .agent-modal.show .modal-content {
            transform: scale(1);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            color: var(--primary-color);
        }
        
        .modal-close {
            background: none;
            border: none;
            color: var(--text-dim);
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.3s ease;
        }
        
        .modal-close:hover {
            color: var(--primary-color);
        }
        
        .agent-detail {
            margin-bottom: 1rem;
            color: var(--text-light);
        }
        
        .status-active { color: var(--success-color); }
        .status-warning { color: var(--warning-color); }
        .status-error { color: var(--error-color); }
        
        .agent-capabilities ul {
            margin-top: 0.5rem;
            padding-left: 1.5rem;
        }
        
        .agent-capabilities li {
            margin-bottom: 0.3rem;
            color: var(--text-dim);
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
});
