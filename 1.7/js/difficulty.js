// difficulty.js
// Handles level progression and dynamic difficulty

export class DifficultyManager {
    constructor(OBSTACLES) {
        this.OBSTACLES = OBSTACLES;
        this.reset();
    }

    reset() {
        this.level = 1;
        this.obstaclesInLevel = 0;
        this.obstaclesNeeded = 3;
        this.speed = 1.4; // Reduced from 1.6 for slower initial speed
        this.pipeGap = this.OBSTACLES.BASE_GAP;
        this.pipeSpacing = this.OBSTACLES.BASE_SPACING;
        this.updateDifficulty();
    }

    updateDifficulty() {
        this.speed = Math.min(3.2, 1.4 + this.level * 0.08); // Reduced max speed and per-level increment
        // FIX: enforce global MIN_GAP instead of hardcoded 150 that could undercut OBSTACLES.MIN_GAP
        const rawGap = this.OBSTACLES.BASE_GAP - this.level * 10 + 10;
        this.pipeGap = Math.max(this.OBSTACLES.MIN_GAP, rawGap);
        this.pipeSpacing = Math.max(240, this.OBSTACLES.BASE_SPACING - this.level * 15); // Fixed spacing, decreases with level
    }

    levelUp() {
        this.obstaclesInLevel++;
        if (this.obstaclesInLevel >= this.obstaclesNeeded) {
            this.level++;
            this.obstaclesInLevel = 0;
            this.obstaclesNeeded = Math.min(50, 3 + Math.floor(this.level * 1.5)); // Slower progression
            this.updateDifficulty();
            return true;
        }
        return false;
    }
}
