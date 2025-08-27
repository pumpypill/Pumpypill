// inputManager.js
// Centralizes input handling for keyboard, mouse, and touch events

export class InputManager {
    constructor(canvas, gameState, handleJump, characterManager) {
        this.canvas = canvas;
        this.gameState = gameState;
        this.handleJump = handleJump;
        this.characterManager = characterManager;
        this.lastInputTime = 0;
        this.debounceTime = 120; // ms between inputs
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard input (spacebar)
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Mouse input
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        // Touch input
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
    }
    
    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        this.canvas.removeEventListener('click', this.handleClick.bind(this));
        this.canvas.removeEventListener('touchstart', this.handleTouch.bind(this));
    }
    
    handleKeyDown(e) {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            this.processInput();
        }
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.processInputWithPosition(x, y);
    }
    
    handleTouch(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.processInputWithPosition(x, y);
    }
    
    processInputWithPosition(x, y) {
        // Check for character selection first
        const isSelectScreen = this.gameState.isStartScreen() || this.gameState.isGameOver();
        
        if (isSelectScreen && this.characterManager) {
            const characterSelected = this.characterManager.handleSelection(x, y);
            if (characterSelected) {
                return; // Don't proceed if character was clicked
            }
        }
        
        // Process regular input (jump/start game)
        this.processInput();
    }
    
    processInput() {
        const now = Date.now();
        if (now - this.lastInputTime < this.debounceTime) {
            return; // Debounce input
        }
        this.lastInputTime = now;
        
        if (this.handleJump) {
            this.handleJump();
        }
    }
}
