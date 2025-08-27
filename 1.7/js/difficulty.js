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
        this.speed = Math.min(3.5, 1.8 + this.level * 0.1);
        this.pipeGap = Math.max(160, this.OBSTACLES.BASE_GAP - this.level * 8);
        this.pipeSpacing = Math.max(250, this.OBSTACLES.BASE_SPACING - this.level * 15);
        if (this.gameState) {
            this.gameState.difficulty = this; // Ensure gameState has access to difficulty
        }
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
