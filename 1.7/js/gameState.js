// gameState.js
// Handles centralized game state management

export class GameState {
    constructor() {
        // States: 'loading', 'start', 'playing', 'gameover'
        this.currentState = 'loading';
        this.reset();
    }

    reset() {
        this.score = 0;
        this.portfolioValue = 50000;
        this.worldX = 0;
        this.scroll = 0;
        this.selectedCharacterId = null;
    }

    // State transitions
    setLoading() {
        this.currentState = 'loading';
    }

    setStart() {
        this.currentState = 'start';
    }

    startGame() {
        this.currentState = 'playing';
    }

    endGame() {
        this.currentState = 'gameover';
    }

    // State checks
    isLoading() {
        return this.currentState === 'loading';
    }

    isStartScreen() {
        return this.currentState === 'start';
    }

    isPlaying() {
        return this.currentState === 'playing';
    }

    isGameOver() {
        return this.currentState === 'gameover';
    }

    // Data getters/setters
    getScore() {
        return this.score;
    }

    incrementScore(amount = 1) {
        this.score += Math.ceil(amount * (1 + (this.difficulty?.level || 0) * 0.1)); // Ensure difficulty is defined
        return this.score;
    }

    getPortfolioValue() {
        return this.portfolioValue;
    }

    updatePortfolio(amount) {
        this.portfolioValue = Math.min(1e9, this.portfolioValue + amount); // Cap portfolio at 1 billion
        return this.portfolioValue;
    }

    getWorldX() {
        return this.worldX;
    }

    updateWorldX(amount) {
        this.worldX += amount;
        return this.worldX;
    }

    getScroll() {
        return this.scroll;
    }

    updateScroll(amount) {
        this.scroll += amount;
        return this.scroll;
    }

    // Character selection
    setSelectedCharacter(characterId) {
        this.selectedCharacterId = characterId;
    }

    getSelectedCharacterId() {
        return this.selectedCharacterId;
    }
}
