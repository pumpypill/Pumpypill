// player.js
// Handles player (bird) logic, physics, and rendering
// Modular: All player logic should be managed via this class from the main game file

export class Player {
    constructor(x, y, character, physics) {
        this.x = x;
        this.y = y;
        this.vy = 0;
        this.rotation = 0;
        this.character = character;
        this.physics = physics;
        this.jumpCount = 0; // Track consecutive jumps
        this.jumpBoost = 0.12; // Reduced from 0.2 to lessen the double jump boost
        this.targetRotation = 0; // Target rotation for smoothing
        this.rotationLerpFactor = 0.1; // Default smoothing factor
        this.jumpRotationBoost = 0.3; // Temporary boost for rotation responsiveness
    }

    reset(x, y, character) {
        this.x = x;
        this.y = y;
        this.vy = 0;
        this.rotation = 0;
        this.character = character;
        this.jumpCount = 0; // Reset jump count
        this.targetRotation = 0; // Reset target rotation
        this.rotationLerpFactor = 0.1; // Reset smoothing factor
    }

    update(gravity, maxFall) {
        // Slightly reduced gravity and fall speed for improved forgivability
        this.vy += gravity * 0.95; // More forgiving gravity
        this.vy = Math.min(this.vy, maxFall * 1.05); // Slightly slower max fall
        this.y += this.vy;

        // Reset jump chain when clearly falling to re-enable second-jump boost later
        if (this.vy > 0.5) {
            this.jumpCount = 0;
        }

        // Calculate target rotation based on vertical velocity
        this.targetRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 6, this.vy * 0.2));

        // Smoothly interpolate the current rotation towards the target rotation
        this.rotation += (this.targetRotation - this.rotation) * this.rotationLerpFactor;

        // Gradually return to the default smoothing factor after a jump
        if (this.rotationLerpFactor > 0.1) {
            this.rotationLerpFactor -= 0.02; // Decrease boost over time
        }
    }

    jump(jumpStrength) {
        this.jumpCount++;
        let adjustedJumpStrength = jumpStrength * 1.05; // Slightly stronger jump

        // Apply a slight boost for the second jump
        if (this.jumpCount === 2) {
            adjustedJumpStrength += this.jumpBoost;
        }

        this.vy = adjustedJumpStrength;

        // Temporarily increase rotation responsiveness
        this.rotationLerpFactor = this.jumpRotationBoost;

        // Removed ineffective falling check (vy is negative right after jump)
    }

    draw(ctx, radius) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (this.character.loaded) {
            ctx.drawImage(
                this.character.image,
                -this.character.width / 2,
                -this.character.height / 2,
                this.character.width,
                this.character.height
            );
        } else {
            const size = radius * 2;
            ctx.fillStyle = this.character.color;
            ctx.fillRect(-size / 2, -size / 2, size, size);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-size / 2, -size / 2, size, size);
        }
ctx.restore();
}
}
