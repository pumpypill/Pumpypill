// gameState.js
// Handles centralized game state management

export class GameState {
    constructor() {
        // States: 'loading', 'start', 'playing', 'gameover'
        this.currentState = 'loading';
        this.difficulty = null; // Initialize difficulty reference
        this.selectedCharacterId = null; // Initialize character selection
        this.reset();
    }

    reset() {
        this.score = 0;
        this.portfolioValue = 50000;
        this.worldX = 0;
        this.scroll = 0;
        // Preserve selected character between games for better UX
        // this.selectedCharacterId = null;
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
        // Ensure amount is a number and provide default value if not
        const validAmount = typeof amount === 'number' ? amount : 1;
        
        // Check if difficulty exists before accessing its properties
        const levelMultiplier = this.difficulty?.level ? (1 + this.difficulty.level * 0.15) : 1;
        
        this.score += Math.ceil(validAmount * levelMultiplier);
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
    
    // Difficulty management
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
}
