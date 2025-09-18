// performanceMonitor.js
// Handles FPS calculation and performance monitoring

export class PerformanceMonitor {
    constructor(updateInterval = 1000) {
        this.lastTime = 0;
        this.frameTime = 0;
        this.fps = 0;
        this.frames = 0;
        this.updateInterval = updateInterval; // Interval to update FPS
        this.lastFpsUpdate = 0;
        this.enabled = true; // Debug toggle

        // Circular buffer for frame time history
        this.frameTimeHistory = new Array(60).fill(0);
        this.frameTimeIndex = 0; // Tracks the current position in the circular buffer
        this.frameTimeVariance = 0;

        this.resetInterval = 300000; // Reset buffer every 5 minutes (300,000ms)
        this.lastResetTime = 0; // Track the last reset timestamp
    }

    reset() {
        this.lastTime = 0;
        this.frameTime = 0;
        this.fps = 0;
        this.frames = 0;
        this.lastFpsUpdate = 0;
        this.frameTimeHistory.fill(0); // Reset the circular buffer
        this.frameTimeIndex = 0;
        this.frameTimeVariance = 0;
        this.lastResetTime = 0; // added: ensure periodic reset schedule restarts
    }

    start(timestamp) {
        if (!this.enabled) return;
        this.lastTime = timestamp;
        this.lastFpsUpdate = timestamp;
    }

    update(timestamp) {
        if (!this.enabled || typeof timestamp !== 'number') return;
        this.frameTime = timestamp - this.lastTime;

        // Periodically reset the circular buffer
        if (timestamp - this.lastResetTime >= this.resetInterval) {
            this.frameTimeHistory.fill(0);
            this.frameTimeIndex = 0;
            this.lastResetTime = timestamp;
        }

        // Update the circular buffer
        this.frameTimeHistory[this.frameTimeIndex] = this.frameTime;
        this.frameTimeIndex = (this.frameTimeIndex + 1) % this.frameTimeHistory.length;

        // Safeguard: Ensure history contains valid numbers
        if (this.frameTimeHistory.some(isNaN) || this.frameTimeHistory.some(val => !isFinite(val))) {
            this.frameTimeVariance = 0;
            this.lastTime = timestamp;
            this.frames++;
            return;
        }

        // Calculate variance (standard deviation)
        const mean = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
        this.frameTimeVariance = Math.sqrt(
            this.frameTimeHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.frameTimeHistory.length
        );

        this.lastTime = timestamp;
        this.frames++;

        // Update FPS at the specified interval
        if (timestamp - this.lastFpsUpdate >= this.updateInterval) {
            this.fps = Math.round((this.frames * 1000) / (timestamp - this.lastFpsUpdate));
            this.frames = 0;
            this.lastFpsUpdate = timestamp;
        }
    }

    getFPS() {
        return this.enabled ? this.fps : 0;
    }
    
    getFrameTime() {
        return this.enabled ? this.frameTime : 0;
    }
    
    getFrameTimeVariance() {
        return this.enabled ? this.frameTimeVariance : 0;
    }

    toggle(enabled) {
        this.enabled = enabled;
    }
}
