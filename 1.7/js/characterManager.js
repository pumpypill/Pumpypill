// characterManager.js
// Handles character selection and management

export class CharacterManager {
    constructor(characters, canvas, gameState) {
        this.characters = characters;
        this.canvas = canvas;
        this.gameState = gameState;
        
        // Ensure characters array is not empty before accessing
        if (this.characters && this.characters.length > 0) {
            this.selectedCharacter = characters[0]; // Default to first character
            
            // Set initial character in game state
            if (this.gameState) {
                this.gameState.setSelectedCharacter(this.selectedCharacter.name);
            }
        } else {
            console.error("CharacterManager: No characters provided.");
        }
    }

    getSelectedCharacter() {
        // Always ensure we have a valid selected character
        if (!this.selectedCharacter && this.characters && this.characters.length > 0) {
            this.selectedCharacter = this.characters[0];
            // Update game state with selection
            if (this.gameState) {
                this.gameState.setSelectedCharacter(this.selectedCharacter.name);
            }
        }
        return this.selectedCharacter;
    }

    handleSelection(x, y) {
        // Get positioning based on game state
        const isGameOver = this.gameState ? this.gameState.isGameOver() : false;
        const centerY = isGameOver ? this.canvas.height / 2 + 150 : this.canvas.height / 2 + 80; // Match the drawing position
        const charSize = 60; // Use fixed size to match drawing
        const startX = this.canvas.width / 2 - (this.characters.length * 70) / 2;

        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            const charX = startX + i * 70;
            const charY = centerY; // Use the same centerY as in drawSelection

            if (x >= charX && x <= charX + charSize && y >= charY && y <= charY + charSize) {
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
        // Save context state
        ctx.save();
        
        // Position based on game state
        const isGameOver = this.gameState ? this.gameState.isGameOver() : false;
        // Increased start screen offset from +80 to +120 for more space below instructions
        const centerY = isGameOver ? this.canvas.height / 2 + 150 : this.canvas.height / 2 + 120;
        this._drawSelectionAt(ctx, centerY);

        // Draw selected character feedback below character manager
        if (this.selectedCharacter && this.gameState) {
            ctx.font = 'bold 16px "Inter", sans-serif';
            ctx.fillStyle = '#26a69a';
            ctx.textAlign = 'center';
            ctx.fillText(`Selected: ${this.selectedCharacter.name}`, this.canvas.width / 2, centerY + 100); // Positioned below character manager
        }
        
        // Restore context state
        ctx.restore();
    }
    _drawSelectionAt(ctx, centerY) {
        const startX = this.canvas.width / 2 - (this.characters.length * 70) / 2;

        // Ensure we have a valid selectedCharacter
        if (!this.selectedCharacter && this.characters.length > 0) {
            this.selectedCharacter = this.characters[0];
            if (this.gameState) {
                this.gameState.setSelectedCharacter(this.selectedCharacter.name);
            }
        }

        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            const x = startX + i * 70;
            const y = centerY;

            ctx.fillStyle = char === this.selectedCharacter ? 'rgba(0, 212, 255, 0.2)' : 'rgba(30, 35, 41, 0.5)';
            ctx.fillRect(x, y, 60, 60);

            if (char.loaded) {
                // Fit character image inside 60x60 box with padding (48x48 max)
                const maxW = 48, maxH = 48;
                const scale = Math.min(maxW / char.width, maxH / char.height, 1);
                const drawW = Math.round(char.width * scale);
                const drawH = Math.round(char.height * scale);
                const offsetX = Math.floor((60 - drawW) / 2);
                const offsetY = Math.floor((60 - drawH) / 2);

                ctx.drawImage(
                    char.image,
                    x + offsetX,
                    y + offsetY,
                    drawW,
                    drawH
                );
            } else {
                ctx.fillStyle = char.color;
                ctx.fillRect(x + 10, y + 10, 40, 40);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 10, y + 10, 40, 40);
            }

            if (char === this.selectedCharacter) {
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, 60, 60);
            }
        }
    }
}
