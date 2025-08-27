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
        this.speed = 1.8;
        this.pipeGap = this.OBSTACLES.BASE_GAP;
        this.pipeSpacing = this.OBSTACLES.BASE_SPACING;
        this.updateDifficulty();
    }

    updateDifficulty() {
        this.speed = Math.min(4.0, 1.8 + this.level * 0.12); // Slightly faster speed progression
        this.pipeGap = Math.max(150, this.OBSTACLES.BASE_GAP - this.level * 10); // Slightly tighter gaps
        this.pipeSpacing = Math.max(240, this.OBSTACLES.BASE_SPACING - this.level * 15);
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
