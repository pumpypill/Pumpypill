// particles.js
// Handles particle effects for visual feedback

// Cache commonly used values for performance
const TWO_PI = Math.PI * 2;

export class Particles {
    constructor(maxParticles = 12) {
        this.maxParticles = maxParticles;
        this.particles = [];
        this.particlePool = []; // Pool for reusing particle objects
    }

    reset() {
        this.particles = [];
        this.particlePool = []; // Clear the pool on reset
    }

    add(x, y, color = '#ffffff') {
        // Skip particle creation if we're already at maximum particles
        // This prevents unnecessary object creation and removal
        if (this.particles.length >= this.maxParticles) {
            // Move the oldest particle to the pool and reuse it
            const oldestParticle = this.particles.shift();
            this.particlePool.push(oldestParticle);
        }

        let particle;

        // Reuse a particle from the pool if available
        if (this.particlePool.length > 0) {
            particle = this.particlePool.pop();
        } else {
            // Create a new particle if the pool is empty
            particle = {};
        }

        // Initialize particle properties with slight performance optimizations
        particle.x = x;
        particle.y = y;
        particle.color = color;
        particle.life = 30; // Lifespan of the particle
        
        // Use a more efficient random calculation with pre-calculated multiplier
        const randomFactor = 2;
        particle.vx = (Math.random() - 0.5) * randomFactor; // Random horizontal velocity
        particle.vy = (Math.random() - 0.5) * randomFactor; // Random vertical velocity

        this.particles.push(particle);
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            // Update particle position and reduce life
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;

            // Remove dead particles and return them to the pool
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }

    draw(ctx) {
        // Skip drawing if no particles
        if (this.particles.length === 0) return;
        
        // Save context state before modifications
        ctx.save();
        
        // Use a fixed particle size for better performance
        const particleSize = 3;
        
        // Group particles by color for fewer fillStyle changes (a major performance bottleneck)
        const particlesByColor = {};
        
        // Sort particles into color groups
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (!particlesByColor[particle.color]) {
                particlesByColor[particle.color] = [];
            }
            particlesByColor[particle.color].push(particle);
        }
        
        // Draw particles by color groups
        for (const color in particlesByColor) {
            ctx.fillStyle = color;
            const colorGroup = particlesByColor[color];
            
            for (let i = 0; i < colorGroup.length; i++) {
                const particle = colorGroup[i];
                ctx.globalAlpha = Math.max(0, particle.life / 30); // Fade out as life decreases
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particleSize, 0, TWO_PI);
                ctx.fill();
            }
        }
        
        // Restore context state
        ctx.restore();
    }
}
