// Jetstreamin AR Experience - A-Frame and AR.js Integration
// Handles AR content, geo-awareness, and interactive experiences

class ARExperienceManager {
    constructor() {
        this.arScene = null;
        this.isARActive = false;
        this.markers = [];
        this.userLocation = null;
        this.arContent = [];
        this.camera = null;
        this.currentMode = 'scan';
        
        this.init();
    }
    
    init() {
        this.checkARSupport();
        this.setupARScene();
        this.initializeGeolocation();
        this.setupEventListeners();
        this.loadARContent();
        console.log('🥽 AR Experience Manager initialized');
    }
    
    checkARSupport() {
        // Check for WebXR support
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-ar').then(supported => {
                console.log(`WebXR AR support: ${supported}`);
                this.webXRSupported = supported;
            }).catch(error => {
                console.warn('WebXR check failed:', error);
                this.webXRSupported = false;
            });
        } else {
            this.webXRSupported = false;
        }
        
        // Check for camera access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            })
                .then(stream => {
                    console.log('📷 Camera access granted');
                    stream.getTracks().forEach(track => track.stop());
                    this.cameraSupported = true;
                })
                .catch(error => {
                    console.warn('📷 Camera access denied:', error);
                    this.cameraSupported = false;
                    this.showARError('Camera access required for AR. Please enable camera permissions.');
                });
        } else {
            this.cameraSupported = false;
            this.showARError('Camera not supported on this device.');
        }
    }
    
    setupARScene() {
        // Check if A-Frame is loaded
        if (typeof AFRAME === 'undefined') {
            console.error('A-Frame not loaded');
            this.showARError('AR libraries not loaded. Please refresh the page.');
            return;
        }

        // Create A-Frame scene programmatically
        const sceneEl = document.createElement('a-scene');
        sceneEl.setAttribute('embedded', true);
        sceneEl.setAttribute('arjs', {
            sourceType: 'webcam',
            debugUIEnabled: false,
            detectionMode: 'mono_and_matrix',
            matrixCodeType: '3x3',
            trackingMethod: 'best',
            sourceWidth: 1280,
            sourceHeight: 720,
            displayWidth: window.innerWidth,
            displayHeight: window.innerHeight
        });
        sceneEl.setAttribute('vr-mode-ui', 'enabled: false');
        sceneEl.setAttribute('gesture-detector', '');
        sceneEl.style.display = 'none';
        sceneEl.id = 'ar-scene';
        
        // Add error handling
        sceneEl.addEventListener('arjs-video-loaded', () => {
            console.log('📷 AR video loaded successfully');
        });
        
        sceneEl.addEventListener('camera-error', (error) => {
            console.error('📷 Camera error:', error);
            this.showARError('Camera error. Please check permissions and try again.');
        });

        // Add camera with error handling
        const camera = document.createElement('a-camera');
        camera.setAttribute('gps-camera', 'rotationUpdateEnabled: false');
        camera.setAttribute('arjs-camera', '');
        sceneEl.appendChild(camera);
        
        // Add to DOM
        document.body.appendChild(sceneEl);
        this.arScene = sceneEl;
        
        console.log('🎬 A-Frame AR scene created');
    }
    
    initializeGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    console.log('📍 User location obtained:', this.userLocation);
                    this.loadNearbyARContent();
                },
                error => {
                    console.warn('📍 Geolocation error:', error);
                    this.handleGeolocationError(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
            
            // Watch position for continuous updates
            this.watchId = navigator.geolocation.watchPosition(
                position => {
                    this.updateUserLocation(position);
                }
            );
        }
    }
    
    updateUserLocation(position) {
        this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
        };
        
        // Update AR content based on new location
        this.updateLocationBasedContent();
    }
    
    handleGeolocationError(error) {
        const errorMessages = {
            1: 'Location access denied by user',
            2: 'Location information unavailable',
            3: 'Location request timeout'
        };
        
        console.warn('Geolocation error:', errorMessages[error.code] || 'Unknown error');
        
        // Fall back to manual location entry or default location
        this.showLocationFallback();
    }
    
    setupEventListeners() {
        // AR Mode switcher
        document.querySelectorAll('.ar-mode').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchARMode(e.target.dataset.mode);
            });
        });
        
        // AR scene events
        if (this.arScene) {
            this.arScene.addEventListener('camera-init', () => {
                console.log('📷 AR camera initialized');
            });
            
            this.arScene.addEventListener('markerFound', (e) => {
                this.onMarkerFound(e.detail);
            });
            
            this.arScene.addEventListener('markerLost', (e) => {
                this.onMarkerLost(e.detail);
            });
        }
    }
    
    switchARMode(mode) {
        this.currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.ar-mode').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update AR scene configuration
        this.configureARMode(mode);
        
        console.log(`🔄 Switched to AR mode: ${mode}`);
    }
    
    configureARMode(mode) {
        switch (mode) {
            case 'scan':
                this.setupMarkerScanning();
                break;
            case 'location':
                this.setupLocationBasedAR();
                break;
            case 'hand':
                this.setupHandTracking();
                break;
            case 'face':
                this.setupFaceTracking();
                break;
        }
    }
    
    setupMarkerScanning() {
        // Configure for QR/marker scanning
        if (this.arScene) {
            this.arScene.setAttribute('arjs', {
                sourceType: 'webcam',
                debugUIEnabled: false,
                detectionMode: 'mono_and_matrix',
                matrixCodeType: '3x3'
            });
        }
    }
    
    setupLocationBasedAR() {
        // Configure for GPS-based AR
        if (this.arScene) {
            this.arScene.setAttribute('arjs', {
                sourceType: 'webcam',
                debugUIEnabled: false,
                detectionMode: 'mono',
                trackingMethod: 'best'
            });
        }
        
        this.loadLocationBasedMarkers();
    }
    
    setupHandTracking() {
        // Configure for hand tracking (requires WebXR)
        console.log('✋ Hand tracking mode activated');
        // Implementation would depend on WebXR hand tracking API
    }
    
    setupFaceTracking() {
        // Configure for face tracking
        console.log('😊 Face tracking mode activated');
        // Implementation would use face detection libraries
    }
    
    startARExperience() {
        // Check HTTPS requirement
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            this.showARError('HTTPS required for AR camera access. Please use HTTPS or localhost.');
            return;
        }

        // Check A-Frame availability
        if (typeof AFRAME === 'undefined') {
            this.showARError('AR libraries not loaded. Please refresh the page.');
            return;
        }

        if (!this.cameraSupported) {
            this.showARError('Camera access required for AR experience. Please enable camera permissions and refresh.');
            return;
        }
        
        this.isARActive = true;
        
        // Show loading indicator
        this.showARLoading();
        
        // Request camera permission explicitly
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        })
        .then(stream => {
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
            
            // Show AR scene
            if (this.arScene) {
                this.arScene.style.display = 'block';
                this.arScene.style.position = 'fixed';
                this.arScene.style.top = '0';
                this.arScene.style.left = '0';
                this.arScene.style.width = '100%';
                this.arScene.style.height = '100%';
                this.arScene.style.zIndex = '1000';
                
                // Wait for scene to initialize
                setTimeout(() => {
                    this.hideARLoading();
                    this.showAROverlay();
                }, 2000);
            }
            
            console.log('🥽 AR Experience started');
        })
        .catch(error => {
            console.error('Camera permission error:', error);
            this.hideARLoading();
            this.isARActive = false;
            this.showARError('Camera permission denied. Please allow camera access and try again.');
        });
    }
    
    stopARExperience() {
        this.isARActive = false;
        
        // Hide AR scene
        if (this.arScene) {
            this.arScene.style.display = 'none';
        }
        
        // Hide AR overlay
        this.hideAROverlay();
        
        console.log('🥽 AR Experience stopped');
    }
    
    showARLoading() {
        const loading = document.createElement('div');
        loading.className = 'ar-loading';
        loading.id = 'ar-loading';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>Initializing AR Experience</h3>
                <p>Please allow camera access when prompted</p>
                <p>Make sure you're using HTTPS or localhost</p>
            </div>
        `;
        
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            color: var(--text-light);
            text-align: center;
        `;
        
        document.body.appendChild(loading);
    }
    
    hideARLoading() {
        const loading = document.getElementById('ar-loading');
        if (loading) {
            loading.remove();
        }
    }
    
    showAROverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'ar-overlay';
        overlay.id = 'ar-overlay';
        overlay.innerHTML = `
            <div class="ar-ui-header">
                <div class="ar-status">AR Active</div>
                <button class="ar-close" onclick="arManager.stopARExperience()">✕</button>
            </div>
            <div class="ar-ui-controls">
                <button class="ar-capture" onclick="arManager.captureARScene()">📷</button>
                <button class="ar-record" onclick="arManager.toggleRecording()">🎥</button>
                <button class="ar-drop" onclick="arManager.dropARContent()">📍</button>
            </div>
            <div class="ar-viewfinder"></div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    hideAROverlay() {
        const overlay = document.getElementById('ar-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    onMarkerFound(marker) {
        console.log('🎯 AR marker found:', marker);
        
        // Add AR content to marker
        this.addARContentToMarker(marker);
        
        // Visual feedback
        this.showMarkerFoundFeedback();
    }
    
    onMarkerLost(marker) {
        console.log('🎯 AR marker lost:', marker);
        
        // Remove AR content
        this.removeARContentFromMarker(marker);
    }
    
    addARContentToMarker(marker) {
        // Create 3D content for the marker
        const content = document.createElement('a-entity');
        content.setAttribute('id', `marker-content-${marker.id}`);
        
        // Add 3D model or text
        const text = document.createElement('a-text');
        text.setAttribute('value', 'Jetstreamin AR Content');
        text.setAttribute('color', '#00ff88');
        text.setAttribute('position', '0 1 0');
        text.setAttribute('align', 'center');
        content.appendChild(text);
        
        // Add animation
        const animation = document.createElement('a-animation');
        animation.setAttribute('attribute', 'rotation');
        animation.setAttribute('to', '0 360 0');
        animation.setAttribute('dur', '5000');
        animation.setAttribute('repeat', 'indefinite');
        content.appendChild(animation);
        
        // Add to marker
        const markerEl = document.querySelector(`[data-marker-id="${marker.id}"]`);
        if (markerEl) {
            markerEl.appendChild(content);
        }
    }
    
    removeARContentFromMarker(marker) {
        const content = document.querySelector(`#marker-content-${marker.id}`);
        if (content) {
            content.remove();
        }
    }
    
    showMarkerFoundFeedback() {
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        
        // Visual feedback
        const feedback = document.createElement('div');
        feedback.className = 'ar-feedback';
        feedback.textContent = 'AR Content Detected!';
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 3000);
    }
    
    dropARContent() {
        if (!this.userLocation) {
            this.showARError('Location required to drop AR content');
            return;
        }
        
        const content = {
            id: Date.now(),
            type: 'user-generated',
            location: this.userLocation,
            timestamp: new Date().toISOString(),
            data: {
                text: 'Jetstreamin was here!',
                color: '#00ff88',
                author: 'anonymous'
            }
        };
        
        // Add to local storage
        this.saveARContent(content);
        
        // Add to scene if in location mode
        if (this.currentMode === 'location') {
            this.addLocationBasedContent(content);
        }
        
        console.log('📍 AR content dropped:', content);
        this.showARSuccess('AR content dropped at your location!');
    }
    
    saveARContent(content) {
        const stored = JSON.parse(localStorage.getItem('jetstreamin-ar-content') || '[]');
        stored.push(content);
        localStorage.setItem('jetstreamin-ar-content', JSON.stringify(stored));
    }
    
    loadARContent() {
        const stored = JSON.parse(localStorage.getItem('jetstreamin-ar-content') || '[]');
        this.arContent = stored;
        console.log(`📦 Loaded ${this.arContent.length} AR content items`);
    }
    
    loadNearbyARContent() {
        if (!this.userLocation) return;
        
        // Filter content within 1km radius
        const nearbyContent = this.arContent.filter(content => {
            const distance = this.calculateDistance(
                this.userLocation.lat, this.userLocation.lng,
                content.location.lat, content.location.lng
            );
            return distance < 1000; // 1km
        });
        
        console.log(`📍 Found ${nearbyContent.length} nearby AR content items`);
        
        // Add to AR scene
        nearbyContent.forEach(content => {
            this.addLocationBasedContent(content);
        });
    }
    
    addLocationBasedContent(content) {
        if (!this.arScene) return;
        
        const entity = document.createElement('a-text');
        entity.setAttribute('gps-entity-place', {
            latitude: content.location.lat,
            longitude: content.location.lng
        });
        entity.setAttribute('value', content.data.text);
        entity.setAttribute('color', content.data.color);
        entity.setAttribute('scale', '10 10 10');
        entity.id = `ar-content-${content.id}`;
        
        this.arScene.appendChild(entity);
    }
    
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lng2-lng1) * Math.PI/180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
    
    captureARScene() {
        if (!this.arScene) return;
        
        // Capture screenshot of AR scene
        const canvas = this.arScene.querySelector('canvas');
        if (canvas) {
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `jetstreamin-ar-capture-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
                
                this.showARSuccess('AR scene captured!');
            });
        }
    }
    
    toggleRecording() {
        // AR video recording functionality
        console.log('🎥 AR recording toggle (feature coming soon)');
        this.showARInfo('AR recording feature coming soon!');
    }
    
    showARError(message) {
        this.showARNotification(message, 'error');
    }
    
    showARSuccess(message) {
        this.showARNotification(message, 'success');
    }
    
    showARInfo(message) {
        this.showARNotification(message, 'info');
    }
    
    showARNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `ar-notification ar-${type}`;
        notification.textContent = message;
        
        // Style based on type
        const colors = {
            error: '#ff0000',
            success: '#00ff00',
            info: '#0088ff'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: ${colors[type]};
            padding: 1rem 2rem;
            border-radius: 8px;
            border: 2px solid ${colors[type]};
            z-index: 10000;
            font-weight: bold;
            text-align: center;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 4000);
    }
    
    showLocationFallback() {
        const fallback = document.createElement('div');
        fallback.className = 'location-fallback';
        fallback.innerHTML = `
            <div class="fallback-content">
                <h3>Location Access Required</h3>
                <p>Please enable location access for full AR experience.</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        document.body.appendChild(fallback);
    }
    
    showARFallback() {
        const fallback = document.createElement('div');
        fallback.className = 'ar-fallback';
        fallback.innerHTML = `
            <div class="fallback-content">
                <h3>AR Experience</h3>
                <div class="fallback-demo">
                    <div class="demo-viewport">
                        <div class="demo-content">
                            <div class="floating-logo">🚀 JETSTREAMIN</div>
                            <div class="demo-particles"></div>
                        </div>
                    </div>
                    <div class="demo-controls">
                        <button onclick="arManager.simulateARDrop()">Drop Content</button>
                        <button onclick="arManager.toggleDemo()">Toggle View</button>
                        <button onclick="arManager.hideARFallback()">Close</button>
                    </div>
                </div>
                <div class="fallback-info">
                    <p><strong>For full AR experience:</strong></p>
                    <ul>
                        <li>Use HTTPS or localhost</li>
                        <li>Allow camera access</li>
                        <li>Use a supported browser (Chrome, Safari, Edge)</li>
                        <li>Point camera at QR codes or markers</li>
                    </ul>
                </div>
            </div>
        `;
        
        fallback.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            z-index: 2000;
            color: var(--text-light);
            padding: 2rem;
            overflow-y: auto;
        `;
        
        document.body.appendChild(fallback);
        this.startFallbackDemo();
    }
    
    hideARFallback() {
        const fallback = document.querySelector('.ar-fallback');
        if (fallback) {
            fallback.remove();
        }
    }
    
    startFallbackDemo() {
        // Create animated demo
        const viewport = document.querySelector('.demo-viewport');
        if (!viewport) return;
        
        viewport.style.cssText = `
            width: 100%;
            height: 300px;
            background: radial-gradient(circle, rgba(0,136,255,0.1) 0%, transparent 70%);
            border: 2px solid var(--secondary-color);
            border-radius: 12px;
            position: relative;
            overflow: hidden;
            margin: 2rem 0;
        `;
        
        const logo = viewport.querySelector('.floating-logo');
        if (logo) {
            logo.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--primary-color);
                font-weight: bold;
                font-size: 1.5rem;
                animation: float 3s ease-in-out infinite;
            `;
        }
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
                50% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
            }
            .demo-controls button {
                background: var(--secondary-color);
                color: var(--text-light);
                border: none;
                padding: 0.8rem 1.5rem;
                margin: 0.5rem;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .demo-controls button:hover {
                background: var(--primary-color);
                transform: translateY(-2px);
            }
            .fallback-info {
                background: rgba(0,0,0,0.3);
                padding: 1.5rem;
                border-radius: 8px;
                border-left: 4px solid var(--primary-color);
                margin-top: 2rem;
            }
            .fallback-info ul {
                margin-top: 1rem;
                padding-left: 1.5rem;
            }
            .fallback-info li {
                margin-bottom: 0.5rem;
                color: var(--text-dim);
            }
        `;
        document.head.appendChild(style);
    }
    
    simulateARDrop() {
        const viewport = document.querySelector('.demo-viewport');
        if (!viewport) return;
        
        const drop = document.createElement('div');
        drop.textContent = '📍 Content Dropped!';
        drop.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0,255,136,0.9);
            color: var(--bg-dark);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: bold;
            animation: dropIn 0.5s ease-out;
        `;
        
        viewport.appendChild(drop);
        setTimeout(() => drop.remove(), 3000);
    }
    
    toggleDemo() {
        const logo = document.querySelector('.floating-logo');
        if (!logo) return;
        
        const messages = ['🚀 JETSTREAMIN', '🤖 AI AGENTS', '🥽 AR READY', '🌐 CONNECTED'];
        const currentText = logo.textContent;
        const currentIndex = messages.indexOf(currentText);
        const nextIndex = (currentIndex + 1) % messages.length;
        logo.textContent = messages[nextIndex];
    }
    
    updateLocationBasedContent() {
        // Update AR content based on new location
        this.loadNearbyARContent();
    }
    
    loadLocationBasedMarkers() {
        // Load GPS-based AR markers
        const markers = [
            { lat: 37.7749, lng: -122.4194, content: 'San Francisco Marker' },
            { lat: 40.7128, lng: -74.0060, content: 'New York Marker' },
            { lat: 51.5074, lng: -0.1278, content: 'London Marker' }
        ];
        
        markers.forEach(marker => {
            if (this.userLocation) {
                const distance = this.calculateDistance(
                    this.userLocation.lat, this.userLocation.lng,
                    marker.lat, marker.lng
                );
                
                if (distance < 10000) { // Within 10km
                    this.addLocationBasedContent({
                        id: `marker-${marker.lat}-${marker.lng}`,
                        location: { lat: marker.lat, lng: marker.lng },
                        data: { text: marker.content, color: '#00ff88' }
                    });
                }
            }
        });
    }
}

// Global AR manager instance
let arManager;

// Global AR functions
window.startARExperience = function() {
    if (!arManager) {
        arManager = new ARExperienceManager();
    }
    
    // Check if we should show fallback experience
    if (!arManager.cameraSupported || (location.protocol !== 'https:' && location.hostname !== 'localhost')) {
        arManager.showARFallback();
        return;
    }
    
    arManager.startARExperience();
};

window.stopARExperience = function() {
    if (arManager) {
        arManager.stopARExperience();
    }
};

window.dropARContent = function() {
    if (!arManager) {
        arManager = new ARExperienceManager();
    }
    arManager.dropARContent();
};

window.viewARMap = function() {
    console.log('🗺️ AR Map view activated');
    // Toggle AR map display
    const arMap = document.querySelector('.ar-map');
    if (arMap) {
        arMap.classList.toggle('active');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create AR manager but don't start AR yet
    arManager = new ARExperienceManager();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (arManager && arManager.watchId) {
        navigator.geolocation.clearWatch(arManager.watchId);
    }
});
