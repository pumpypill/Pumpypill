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

        ctx.save();

        // Group particles by color and opacity bucket (reduces fill/style switches)
        const particlesByColor = {};
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            // Bucket alpha into 11 levels (0-10)
            const alphaBucket = Math.max(0, Math.min(10, Math.round((Math.max(0, p.life) / 30) * 10)));
            const key = `${p.color}|${alphaBucket}`;
            if (!particlesByColor[key]) {
                particlesByColor[key] = { color: p.color, alpha: alphaBucket / 10, items: [] };
            }
            particlesByColor[key].items.push(p);
        }

        // Draw each group with a single path/fill
        for (const key in particlesByColor) {
            const group = particlesByColor[key];
            if (!group.items.length || group.alpha <= 0) continue;

            ctx.globalAlpha = group.alpha;
            ctx.fillStyle = group.color;
            ctx.beginPath();

            for (let i = 0; i < group.items.length; i++) {
                const particle = group.items[i];
                ctx.moveTo(particle.x + 3, particle.y);
                ctx.arc(particle.x, particle.y, 3, 0, TWO_PI);
            }

            ctx.fill();
        }

        ctx.restore();
    }
}
