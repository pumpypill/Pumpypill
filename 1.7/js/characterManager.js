// characterManager.js
// Handles character selection and management

export class CharacterManager {
    constructor(characters, canvas, gameState) {
        this.characters = characters;
        this.canvas = canvas;
        this.gameState = gameState;
        this.selectedCharacter = characters[0]; // Default to first character
        
        // Set initial character in game state
        if (this.gameState) {
            this.gameState.setSelectedCharacter(this.selectedCharacter.name);
        }
    }

    getSelectedCharacter() {
        return this.selectedCharacter;
    }

    handleSelection(x, y) {
        // Get positioning based on game state
        const isGameOver = this.gameState ? this.gameState.isGameOver() : false;
        const centerY = isGameOver ? this.canvas.height / 2 + 100 : this.canvas.height / 2;
        const startX = this.canvas.width / 2 - (this.characters.length * 70) / 2;

        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            const charX = startX + i * 70;
            const charY = centerY + 20;

            if (x >= charX && x <= charX + 60 && y >= charY && y <= charY + 60) {
                // Only update if character actually changed
                if (this.selectedCharacter !== char) {
                    this.selectedCharacter = char;
                    console.log("Selected character:", char.name);
                    
                    // Update game state with selection
                    if (this.gameState) {
                        this.gameState.setSelectedCharacter(char.name);
                    }
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    drawSelection(ctx) {
        // Position based on game state
        const isGameOver = this.gameState ? this.gameState.isGameOver() : false;
        const centerY = isGameOver ? this.canvas.height / 2 + 100 : this.canvas.height / 2;
        this._drawSelectionAt(ctx, centerY);
    }

    // Internal method to draw at specific Y position
    _drawSelectionAt(ctx, centerY) {
        const startX = this.canvas.width / 2 - (this.characters.length * 70) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "SF Pro Display", sans-serif';
        const selectText = 'Select your character:';
        const textWidth = ctx.measureText(selectText).width;
        ctx.fillText(selectText, this.canvas.width / 2 - textWidth / 2, centerY);

        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            const x = startX + i * 70;
            const y = centerY + 20;
            
            // Draw selection background
            ctx.fillStyle = char === this.selectedCharacter ? 'rgba(0, 212, 255, 0.2)' : 'rgba(30, 35, 41, 0.5)';
            ctx.fillRect(x, y, 60, 60);
            
            // Draw character preview with fallback
            if (char.loaded) {
                ctx.drawImage(
                    char.image,
                    x + (60 - char.width)/2,
                    y + (60 - char.height)/2,
                    char.width,
                    char.height
                );
            } else {
                ctx.fillStyle = char.color;
                ctx.fillRect(x + 10, y + 10, 40, 40);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 10, y + 10, 40, 40);
            }
            
            // Draw selection border
            if (char === this.selectedCharacter) {
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, 60, 60);
            }
        }
    }
}
