// particles.js
// Handles particle effects for visual feedback

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

    add(x, y, color) {
        let particle;

        // Reuse a particle from the pool if available
        if (this.particlePool.length > 0) {
            particle = this.particlePool.pop();
        } else {
            // Create a new particle if the pool is empty
            particle = {};
        }

        // Initialize particle properties
        particle.x = x;
        particle.y = y;
        particle.color = color;
        particle.life = 30; // Lifespan of the particle
        particle.vx = (Math.random() - 0.5) * 2; // Random horizontal velocity
        particle.vy = (Math.random() - 0.5) * 2; // Random vertical velocity

        this.particles.push(particle);

        // Limit the number of active particles
        if (this.particles.length > this.maxParticles) {
            const removedParticle = this.particles.shift();
            this.particlePool.push(removedParticle); // Return the removed particle to the pool
        }
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
        for (const particle of this.particles) {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = Math.max(0, particle.life / 30); // Fade out as life decreases
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0; // Reset alpha
    }
}
