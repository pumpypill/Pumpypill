// uiManager.js
// Handles rendering of all UI elements (score, portfolio, level, etc.)

export class UIManager {
    constructor(canvas, gameState, difficulty) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;
        this.difficulty = difficulty;

        // Initialize cached text measurements as null
        this.cachedTextMeasurements = null;
    }

    cacheTextMeasurements() {
        if (!this.cachedTextMeasurements) {
            const ctx = this.ctx;
            // Cache measurements with appropriate fonts for each text element
            ctx.font = 'bold 48px "SF Pro Display", sans-serif';
            const titleWidth = ctx.measureText('PUMPY PILLS').width;
            
            ctx.font = 'bold 14px "SF Pro Display", sans-serif';
            const startTextWidth = ctx.measureText('SPACEBAR or CLICK to start trading').width;
            
            ctx.font = 'bold 36px "SF Pro Display", sans-serif';
            const gameOverTextWidth = ctx.measureText('POSITION LIQUIDATED').width;
            
            this.cachedTextMeasurements = {
                title: { width: titleWidth },
                startText: { width: startTextWidth },
                gameOverText: { width: gameOverTextWidth } // removed trailing comma
            };
        }
    }

    drawLoadingScreen(loadingProgress) {
        const ctx = this.ctx;

        ctx.fillStyle = '#6ee7b7'; // mint accent
        ctx.font = 'bold 24px "SF Pro Display", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2 - 30);

        // Loading bar
        ctx.fillStyle = '#1a1f2e';
        ctx.fillRect(this.canvas.width / 2 - 100, this.canvas.height / 2, 200, 4);
        ctx.fillStyle = '#6ee7b7'; // mint accent
        ctx.fillRect(this.canvas.width / 2 - 100, this.canvas.height / 2, loadingProgress * 2, 4);

        ctx.textAlign = 'start';
    }

    drawUI() {
        const ctx = this.ctx;

        // Add null checks to prevent runtime errors
        if (!this.gameState || !this.difficulty) {
            console.error("UIManager: Missing gameState or difficulty.");
            return;
        }

        ctx.save();
        // Draw score
        ctx.shadowColor = '#6ee7b7'; // mint glow
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#6ee7b7';   // mint accent
        ctx.font = 'bold 38px "SF Pro Display", sans-serif';
        ctx.textAlign = 'center';
        const scoreText = this.gameState.getScore().toString();
        ctx.fillText(scoreText, this.canvas.width / 2, this.canvas.height * 0.1);
        ctx.shadowBlur = 0;

        // Draw portfolio value
        ctx.font = 'bold 16px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left'; // Align text to the left
        ctx.fillText('PUMPY/USD Live', this.canvas.width * 0.02, this.canvas.height * 0.05);

        ctx.font = 'bold 14px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#34d399'; // mint-green positive
        const gainPercent = ((this.gameState.getPortfolioValue() - 50000) / 50000 * 100).toFixed(1);
        ctx.fillText(
            'Portfolio: $' + this.gameState.getPortfolioValue().toLocaleString() + ' (+' + gainPercent + '%)',
            this.canvas.width * 0.02,
            this.canvas.height * 0.08
        );

        // Draw level and difficulty
        ctx.fillStyle = '#6ee7b7'; // mint instead of gold
        ctx.fillText(
            'Level ' + this.difficulty.level + ' (' + this.difficulty.obstaclesInLevel + '/' + this.difficulty.obstaclesNeeded + ')',
            this.canvas.width * 0.02,
            this.canvas.height * 0.11
        );

        // Draw speed and gap
        ctx.font = 'bold 12px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#b2b5be'; // neutral gray
        ctx.fillText(
            'Speed: ' + this.difficulty.speed.toFixed(1) + 'x | Gap: ' + Math.round(this.difficulty.pipeGap) + 'px',
            this.canvas.width * 0.02,
            this.canvas.height * 0.14
        );
        
        // Display current pattern if available
        if (this.currentPattern) {
            switch(this.currentPattern) {
                case 'staircase':
                    ctx.fillStyle = '#34d399'; // mint (darker)
                    break;
                case 'wave':
                    ctx.fillStyle = '#6ee7b7'; // mint (base)
                    break;
                case 'zigzag':
                    ctx.fillStyle = '#a7f3d0'; // mint (light)
                    break;
                case 'narrow':
                    ctx.fillStyle = '#059669'; // emerald deep
                    break;
                default:
                    ctx.fillStyle = '#86efac'; // soft green
            }
            const patternName = this.currentPattern.charAt(0).toUpperCase() + this.currentPattern.slice(1);
            ctx.fillText(
                'Pattern: ' + patternName,
                this.canvas.width * 0.02,
                this.canvas.height * 0.17
            );
        }
        ctx.restore();
    }

    drawStartScreen(characterManager) {
        const ctx = this.ctx;

        // Cache text measurements if not already cached
        this.cacheTextMeasurements();

        ctx.save();
        // Draw overlay
        ctx.fillStyle = 'rgba(13, 20, 33, 0.95)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw title
        ctx.shadowColor = '#6ee7b7';
        ctx.shadowBlur = 15;
        ctx.font = 'bold 48px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#6ee7b7';
        ctx.textAlign = 'center';
        ctx.fillText('PUMPY PILLS', this.canvas.width / 2, this.canvas.height / 2 - 100);
        ctx.shadowBlur = 0;

        // Draw subtitle
        ctx.font = '18px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#b2b5be';
        ctx.fillText('Navigate the volatile crypto markets', this.canvas.width / 2, this.canvas.height / 2 - 60);

        // Draw character selection prompt
        ctx.font = '16px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#b2b5be';
        ctx.fillText('Select your character:', this.canvas.width / 2, this.canvas.height / 2 - 30);

        // Draw start instructions
        ctx.font = 'bold 14px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText('SPACEBAR or CLICK to start trading', this.canvas.width / 2, this.canvas.height / 2 + 50);

        // Draw character selection
        try {
            characterManager.drawSelection(ctx);
        } catch (error) {
            console.error('Error drawing character selection:', error);
        }
        ctx.restore();
    }

    drawGameOverScreen(characterManager) {
        const ctx = this.ctx;

        // Cache text measurements if not already cached
        this.cacheTextMeasurements();

        ctx.save();
        // Overlay
        ctx.fillStyle = 'rgba(13, 20, 33, 0.95)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Game over text (mint accent)
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 36px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText('POSITION LIQUIDATED', this.canvas.width / 2, this.canvas.height / 2 - 80);
        ctx.shadowBlur = 0;

        // Draw final score
        ctx.font = '20px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Final Score: ' + this.gameState.getScore(), this.canvas.width / 2, this.canvas.height / 2 - 30);

        // Draw level reached
        ctx.fillText('Reached Level: ' + this.difficulty.level, this.canvas.width / 2, this.canvas.height / 2);

        // Portfolio value
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText('Portfolio: $' + this.gameState.getPortfolioValue().toLocaleString(), this.canvas.width / 2, this.canvas.height / 2 + 30);

        // Restart instructions
        ctx.font = 'bold 14px "SF Pro Display", sans-serif';
        ctx.fillText('SPACEBAR or CLICK to restart trading', this.canvas.width / 2, this.canvas.height / 2 + 70);

        // Draw character selection
        try {
            characterManager.drawSelection(ctx);
        } catch (error) {
            console.error('Error drawing character selection:', error);
        }
        ctx.restore();
    }

    drawDebugInfo(fps, frameTime = null, frameVariance = null) {
        if (fps > 0) {
            const ctx = this.ctx;

            // Save context state before modifying
            ctx.save();

            // Use relative positioning for debug info
            const debugX = this.canvas.width * 0.8;
            const debugY = 20;

            ctx.font = '12px monospace';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'left';

            // Basic FPS display
            ctx.fillText(`FPS: ${fps}`, debugX, debugY);

            // Enhanced debug info
            if (frameTime !== null) {
                ctx.fillText(`Frame: ${frameTime}ms`, debugX, debugY + 15);
            }

            if (frameVariance !== null) {
                // Color code variance (red when high)
                const varianceValue = parseFloat(frameVariance);
                if (varianceValue > 5) {
                    ctx.fillStyle = '#ff5555';
                } else if (varianceValue > 2) {
                    ctx.fillStyle = '#ffaa55';
                }
                ctx.fillText(`Jitter: ${frameVariance}ms`, debugX, debugY + 30);
            }

            // Restore context state instead of manual resets
            ctx.restore();
        }
    }
}
