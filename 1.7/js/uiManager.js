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
            ctx.font = 'bold 48px "SF Pro Display", sans-serif'; // Ensure font is set before measuring
            this.cachedTextMeasurements = {
                title: ctx.measureText('PUMPY PILLS'),
                startText: ctx.measureText('SPACEBAR or CLICK to start trading'),
                gameOverText: ctx.measureText('POSITION LIQUIDATED'),
            };
        }
    }

    drawLoadingScreen(loadingProgress) {
        const ctx = this.ctx;

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 24px "SF Pro Display", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2 - 30);

        // Loading bar
        ctx.fillStyle = '#1a1f2e';
        ctx.fillRect(this.canvas.width / 2 - 100, this.canvas.height / 2, 200, 4);
        ctx.fillStyle = '#00d4ff';
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

        // Draw score
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 38px "SF Pro Display", sans-serif';
        const scoreText = this.gameState.getScore().toString();
        const scoreWidth = ctx.measureText(scoreText).width;
        ctx.fillText(scoreText, this.canvas.width / 2 - scoreWidth / 2, this.canvas.height * 0.1);
        ctx.shadowBlur = 0;

        // Draw portfolio value
        ctx.font = 'bold 16px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('PUMPY/USD Live', this.canvas.width * 0.02, this.canvas.height * 0.05);

        ctx.font = 'bold 14px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#26a69a';
        const gainPercent = ((this.gameState.getPortfolioValue() - 50000) / 50000 * 100).toFixed(1);
        ctx.fillText(
            'Portfolio: $' + this.gameState.getPortfolioValue().toLocaleString() + ' (+' + gainPercent + '%)',
            this.canvas.width * 0.02,
            this.canvas.height * 0.08
        );

        // Draw level and difficulty
        ctx.fillStyle = '#ffd700';
        ctx.fillText(
            'Level ' + this.difficulty.level + ' (' + this.difficulty.obstaclesInLevel + '/' + this.difficulty.obstaclesNeeded + ')',
            this.canvas.width * 0.02,
            this.canvas.height * 0.11
        );

        // Draw speed and gap
        ctx.font = 'bold 12px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#ff9800';
        ctx.fillText(
            'Speed: ' + this.difficulty.speed.toFixed(1) + 'x | Gap: ' + Math.round(this.difficulty.pipeGap) + 'px',
            this.canvas.width * 0.02,
            this.canvas.height * 0.14
        );
        
        // Display current pattern if available
        if (this.currentPattern) {
            // Choose color based on pattern
            switch(this.currentPattern) {
                case 'staircase':
                    ctx.fillStyle = '#E57373'; // Red-ish
                    break;
                case 'wave':
                    ctx.fillStyle = '#64B5F6'; // Blue-ish
                    break;
                case 'zigzag':
                    ctx.fillStyle = '#FFD54F'; // Yellow-ish
                    break;
                case 'narrow':
                    ctx.fillStyle = '#9575CD'; // Purple-ish
                    break;
                default:
                    ctx.fillStyle = '#81C784'; // Green-ish for standard
            }
            
            // Format pattern name nicely
            const patternName = this.currentPattern.charAt(0).toUpperCase() + this.currentPattern.slice(1);
            ctx.fillText(
                'Pattern: ' + patternName,
                this.canvas.width * 0.02,
                this.canvas.height * 0.17
            );
        }
    }

    drawStartScreen(characterManager) {
        const ctx = this.ctx;

        // Cache text measurements if not already cached
        this.cacheTextMeasurements();

        // Draw overlay
        ctx.fillStyle = 'rgba(13, 20, 33, 0.95)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw title
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        ctx.font = 'bold 48px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#00d4ff';
        const titleWidth = this.cachedTextMeasurements.title.width;
        ctx.fillText('PUMPY PILLS', this.canvas.width / 2 - titleWidth / 2, this.canvas.height / 2 - 60);
        ctx.shadowBlur = 0;

        // Draw subtitle
        ctx.font = '18px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#b2b5be';
        const subtitle1 = 'Navigate the volatile crypto markets';
        const sub1Width = ctx.measureText(subtitle1).width;
        ctx.fillText(subtitle1, this.canvas.width / 2 - sub1Width / 2, this.canvas.height / 2 - 15);

        // Draw start instructions
        ctx.font = 'bold 14px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#00d4ff';
        const startWidth = this.cachedTextMeasurements.startText.width;
        ctx.fillText('SPACEBAR or CLICK to start trading', this.canvas.width / 2 - startWidth / 2, this.canvas.height / 2 + 50);

        // Draw character selection
        try {
            characterManager.drawSelection(ctx);
        } catch (error) {
            console.error('Error drawing character selection:', error);
        }

        // Draw selected character feedback
        const selectedId = this.gameState.getSelectedCharacterId();
        if (selectedId) {
            ctx.font = 'bold 16px "SF Pro Display", sans-serif';
            ctx.fillStyle = '#26a69a';
            ctx.textAlign = 'center';
            ctx.fillText(`Selected: ${selectedId}`, this.canvas.width / 2, this.canvas.height / 2 + 120);
            ctx.textAlign = 'start';
        }
    }

    drawGameOverScreen(characterManager) {
        const ctx = this.ctx;

        // Cache text measurements if not already cached
        this.cacheTextMeasurements();

        // Draw overlay
        ctx.fillStyle = 'rgba(13, 20, 33, 0.95)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw game over text
        ctx.shadowColor = '#ef5350';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 36px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#ef5350';
        const gameOverWidth = this.cachedTextMeasurements.gameOverText.width;
        ctx.fillText('POSITION LIQUIDATED', this.canvas.width / 2 - gameOverWidth / 2, this.canvas.height / 2 - 80);
        ctx.shadowBlur = 0;

        // Draw final score
        ctx.font = '20px "SF Pro Display", sans-serif';
        ctx.fillStyle = '#ffffff';
        const finalScoreText = 'Final Score: ' + this.gameState.getScore();
        const finalScoreWidth = ctx.measureText(finalScoreText).width;
        ctx.fillText(finalScoreText, this.canvas.width / 2 - finalScoreWidth / 2, this.canvas.height / 2 - 30);

        // Draw level reached
        const levelText = 'Reached Level: ' + this.difficulty.level;
        const levelWidth = ctx.measureText(levelText).width;
        ctx.fillText(levelText, this.canvas.width / 2 - levelWidth / 2, this.canvas.height / 2);

        // Draw portfolio value
        ctx.fillStyle = '#00d4ff';
        const portfolioText = 'Portfolio: $' + this.gameState.getPortfolioValue().toLocaleString();
        const portfolioWidth = ctx.measureText(portfolioText).width;
        ctx.fillText(portfolioText, this.canvas.width / 2 - portfolioWidth / 2, this.canvas.height / 2 + 30);

        // Draw restart instructions
        ctx.font = 'bold 14px "SF Pro Display", sans-serif';
        const restartText = 'SPACEBAR or CLICK to restart trading';
        const restartWidth = ctx.measureText(restartText).width;
        ctx.fillText(restartText, this.canvas.width / 2 - restartWidth / 2, this.canvas.height / 2 + 70);

        // Draw character selection
        try {
            characterManager.drawSelection(ctx);
        } catch (error) {
            console.error('Error drawing character selection:', error);
        }

        // Draw selected character feedback
        const selectedId = this.gameState.getSelectedCharacterId();
        if (selectedId) {
            ctx.font = 'bold 16px "SF Pro Display", sans-serif';
            ctx.fillStyle = '#26a69a';
            ctx.textAlign = 'center';
            ctx.fillText(`Selected: ${selectedId}`, this.canvas.width / 2, this.canvas.height / 2 + 160);
            ctx.textAlign = 'start';
        }
    }

    drawDebugInfo(fps, frameTime = null, frameVariance = null) {
        if (fps > 0) {
            const ctx = this.ctx;

            // Use relative positioning for debug info
            const debugX = this.canvas.width * 0.8;
            const debugY = 20;

            ctx.font = '12px monospace';
            ctx.fillStyle = '#666';

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

            ctx.globalAlpha = 1.0; // Reset alpha
            ctx.fillStyle = '#ffffff'; // Reset fill style
        }
    }
}
