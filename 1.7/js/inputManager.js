// inputManager.js
// Centralizes input handling for keyboard, mouse, and touch events

export class InputManager {
    constructor(canvas, gameState, handleJump, characterManager) {
        this.canvas = canvas;
        this.gameState = gameState;
        this.handleJump = handleJump;
        this.characterManager = characterManager;
        this.lastInputTime = 0;
        this.debounceTime = 50; // Default debounce time
        this.isPassiveSupported = this.detectPassiveSupport();
        
        // Store bound handlers for removal
        this._handleKeyDown = this.handleKeyDown.bind(this);
        this._handleClick = this.handleClick.bind(this);
        this._handleTouch = this.handleTouch.bind(this);
        this.setupEventListeners();
    }
    
    // Detect if passive event listeners are supported
    detectPassiveSupport() {
        let passiveSupported = false;
        try {
            const options = {
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            window.addEventListener("test", null, options);
            window.removeEventListener("test", null, options);
        } catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    }
    
    setupEventListeners() {
        // Keyboard input (spacebar)
        document.addEventListener('keydown', this._handleKeyDown);
        
        // Mouse input
        this.canvas.addEventListener('click', this._handleClick);
        
        // Touch input
        const touchOptions = this.isPassiveSupported ? { passive: false } : false;
        this.canvas.addEventListener('touchstart', this._handleTouch, touchOptions);
    }
    
    removeEventListeners() {
        try {
            document.removeEventListener('keydown', this._handleKeyDown);
            this.canvas.removeEventListener('click', this._handleClick);
            const touchOptions = this.isPassiveSupported ? { passive: false } : false;
            this.canvas.removeEventListener('touchstart', this._handleTouch, touchOptions);
        } catch (error) {
            console.error('Error removing event listeners:', error);
        }
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
        
        // Scale coordinates for high DPI displays if needed
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        
        this.processInputWithPosition(scaledX, scaledY);
    }
    
    handleTouch(e) {
        e.preventDefault();
        
        // Guard against empty touch events
        if (!e.touches || e.touches.length === 0) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Scale coordinates for high DPI displays if needed
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        
        this.processInputWithPosition(scaledX, scaledY);
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
        const adaptiveDebounce = this.gameState.isPlaying() ? 50 : 100; // Shorter debounce during gameplay
        if (now - this.lastInputTime < adaptiveDebounce) {
            return; // Debounce input
        }
        this.lastInputTime = now;

        if (this.handleJump) {
            this.handleJump();
        }
    }
}
