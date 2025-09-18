// obstacles.js
// Handles obstacle (pipe) generation, movement, collision, and level progression

// Extract hardcoded values into constants
const EDGE_BOUNDARY = 150; // Minimum distance from edges for staircase pattern
const RHYTHM_OFFSET = 100; // Offset for rhythm pattern

export class Obstacles {
    constructor(canvasHeight, OBSTACLES, pipeGap, pipeSpacing) {
        this.OBSTACLES = OBSTACLES;
        this.pipes = [];
        this.lastObstacleY = canvasHeight / 2;
        this.pipeGap = pipeGap;
        this.pipeSpacing = pipeSpacing;
        this.canvasHeight = canvasHeight;
        this.obstaclePatterns = [
            'standard',  // Regular random pipe
            'staircase', // Series of ascending or descending pipes
            'wave',      // Smooth up and down wave pattern
            'zigzag',    // Sharp up and down pattern
            'narrow',    // Narrower gap than usual
            'rhythm',    // Patterns with rhythm-based spacing
        ];
        this.currentPattern = 'standard';
        this.patternStep = 0;
        this.patternDirection = 1; // 1 for up, -1 for down
        this.obstacleCount = 0;
        this.debugMode = false; // Add a debug mode flag
    }

    reset(canvasHeight, pipeGap, pipeSpacing) {
        this.pipes = [];
        this.lastObstacleY = canvasHeight / 2;
        this.pipeGap = pipeGap;
        this.pipeSpacing = pipeSpacing;
        this.canvasHeight = canvasHeight;
        this.currentPattern = 'standard';
        this.patternStep = 0;
        this.patternDirection = Math.random() > 0.5 ? 1 : -1;
        this.obstacleCount = 0;
    }

    generateObstacle(x) {
        // Every 4-6 obstacles, switch patterns (more frequent changes)
        if (this.obstacleCount % (4 + Math.floor(Math.random() * 3)) === 0) {
            this.switchPattern();
        }

        let gapCenter = this.calculateGapCenter();
        
        // Ensure gap stays within bounds with additional safety margin
        const minGapPos = Math.max(this.pipeGap / 2, 50); // Minimum distance from top
        const maxGapPos = this.canvasHeight - Math.max(this.pipeGap / 2, 50); // Maximum distance from bottom
        gapCenter = Math.max(minGapPos, Math.min(maxGapPos, gapCenter)); // Clamp gap center within visible bounds
        
        // Adjust gap size for special patterns
        let currentGap = this.pipeGap;
        if (this.currentPattern === 'narrow') {
            currentGap = Math.max(this.pipeGap * 0.75, this.OBSTACLES.MIN_GAP); // keep ≥ MIN_GAP
        } else if (Math.random() < 0.1) {
            currentGap = Math.min(this.pipeGap * 1.2, this.pipeGap + 80); // modest wider breather cap
        }
        // Rug adjustment then final clamp
        const rugAdjustment = 10;
        currentGap = Math.max(this.OBSTACLES.MIN_GAP, currentGap - rugAdjustment);

        // Clamp center after final gap to avoid overflow
        const minGapPos = Math.max(currentGap / 2, 50);
        const maxGapPos = this.canvasHeight - Math.max(currentGap / 2, 50);
        gapCenter = Math.max(minGapPos, Math.min(maxGapPos, gapCenter));

        const obstacle = {
            x,
            scored: false,
            top: Math.max(0, gapCenter - currentGap / 2),
            bottom: Math.min(this.canvasHeight, gapCenter + currentGap / 2),
            // Removed random topHeight/bottomHeight that visually narrowed safe gap
            topHeight: 0,
            bottomHeight: 0,
            type: this.currentPattern
        };

        // Ensure top and bottom positions are within the visible canvas area
        obstacle.top = Math.max(0, obstacle.top); // Ensure top pipe is visible
        obstacle.bottom = Math.min(this.canvasHeight, obstacle.bottom); // Ensure bottom pipe is visible

        this.lastObstacleY = gapCenter;
        this.obstacleCount++;
        this.patternStep++;
        return obstacle;
    }

    calculateGapCenter() {
        let gapCenter;
        
        switch(this.currentPattern) {
            case 'staircase':
                // Move consistently up or down, creating a staircase pattern
                gapCenter = this.lastObstacleY + (this.patternDirection * 50);
                // Change direction if getting too close to edges
                if (gapCenter < EDGE_BOUNDARY || gapCenter > this.canvasHeight - EDGE_BOUNDARY) {
                    this.patternDirection *= -1;
                }
                break;
                
            case 'wave':
                // Create a smooth sine wave pattern
                const amplitude = 100; // Height of the wave
                const period = 6; // Length of the wave (in obstacles)
                gapCenter = this.canvasHeight / 2 + 
                            amplitude * Math.sin(this.patternStep * (Math.PI / period));
                break;
                
            case 'zigzag':
                // Sharp alternating pattern
                if (this.patternStep % 2 === 0) {
                    gapCenter = this.canvasHeight / 2 - 80;
                } else {
                    gapCenter = this.canvasHeight / 2 + 80;
                }
                break;
                
            case 'narrow':
                // Random position but with narrower gap
                gapCenter = this.lastObstacleY + (Math.random() - 0.5) * 100;
                break;
                
            case 'rhythm':
                // Creates a pattern that requires rhythmic jumps
                // First pipe at center height, then higher, then lower - repeating
                const rhythmStep = this.patternStep % 3;
                if (rhythmStep === 0) {
                    gapCenter = this.canvasHeight / 2;
                } else if (rhythmStep === 1) {
                    gapCenter = this.canvasHeight / 2 - RHYTHM_OFFSET;
                } else {
                    gapCenter = this.canvasHeight / 2 + RHYTHM_OFFSET;
                }
                break;
                
            case 'standard':
            default:
                // Original random behavior with slight adjustments
                gapCenter = this.lastObstacleY + (Math.random() - 0.5) * 120;
                // Add occasional "surprise" obstacles
                if (Math.random() < 0.2) {
                    // 20% chance of more dramatic change
                    gapCenter += (Math.random() - 0.5) * 100;
                }
        }
        
        return gapCenter;
    }

    switchPattern() {
        let availablePatterns = [...this.obstaclePatterns];
        const hardPatterns = ['narrow', 'zigzag'];
        const easyPatterns = ['standard', 'wave'];

        // Ensure no more than 2 hard patterns in a row
        if (hardPatterns.includes(this.currentPattern)) {
            availablePatterns = availablePatterns.filter(p => !hardPatterns.includes(p));
        }

        // Ensure the new pattern is different from the current one
        let newPattern;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            newPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
            attempts++;
            // Prevent infinite loop if there's only one pattern available
            if (attempts >= maxAttempts) {
                newPattern = easyPatterns[Math.floor(Math.random() * easyPatterns.length)];
                break;
            }
        } while (newPattern === this.currentPattern);

        this.currentPattern = newPattern;

        if (this.debugMode) {
            console.log("Switching to pattern:", this.currentPattern);
        }

        // Reset pattern step counter
        this.patternStep = 0;
        
        // Randomize pattern direction
        this.patternDirection = Math.random() > 0.5 ? 1 : -1;
    }

    updatePipes(speed, canvasWidth) {
        for (let i = 0; i < this.pipes.length; i++) {
            this.pipes[i].x -= speed;
        }
        // Only add a new pipe when the last pipe has moved past the fixed spacing
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x <= canvasWidth - this.pipeSpacing) {
            this.pipes.push(this.generateObstacle(canvasWidth));
        }
        while (this.pipes.length > 0 && this.pipes[0].x + this.OBSTACLES.WIDTH < -50) {
            this.pipes.shift();
        }
    }

    checkCollision(bird, PHYSICS) {
        // Pre-calculate bird bounds once
        const birdRadius = PHYSICS.BIRD_RADIUS * 0.8;
        const birdLeft = bird.x - birdRadius;
        const birdRight = bird.x + birdRadius;
        const birdTop = bird.y - birdRadius;
        const birdBottom = bird.y + birdRadius;
        
        for (let i = 0; i < this.pipes.length; i++) {
            const pipe = this.pipes[i];
            
            // Quick bounds check first (most efficient)
            if (birdRight <= pipe.x || birdLeft >= pipe.x + this.OBSTACLES.WIDTH) {
                continue;
            }
            
            // Only check vertical collision if horizontal collision exists
            if (birdTop < pipe.top || birdBottom > pipe.bottom) {
                return true; // Collision detected
            }
        }
        return false; // No collision
    }

    updateDifficulty(pipeGap, pipeSpacing) {
        this.pipeGap = pipeGap;
        this.pipeSpacing = pipeSpacing; // This is set by DifficultyManager and is now always fixed per level
    }

    draw(ctx, level, canvasHeight) {
        ctx.save();

        const hue = (level * 30) % 360;

        // Precompute active render bounds with a small buffer
        const activeRange = { left: -this.OBSTACLES.WIDTH - 50, right: ctx.canvas.width + 50 };
        const centerY = canvasHeight / 2;

        for (let i = 0; i < this.pipes.length; i++) {
            const pipe = this.pipes[i];

            // Skip drawing pipes that are off-screen for performance
            if (pipe.x > activeRange.right || pipe.x + this.OBSTACLES.WIDTH < activeRange.left) {
                continue;
            }

            // Compute once and reuse
            const distanceToCenter = Math.abs(((pipe.top + pipe.bottom) / 2) - centerY);
            const alpha = Math.max(0.7, 1 - (distanceToCenter / (canvasHeight * 1.2)));
            ctx.globalAlpha = alpha;

            // Create base colors based on pattern type with enhanced saturation and lightness
            let fillColor, strokeColor, gradientColor1, gradientColor2;

            switch (pipe.type) {
                case 'staircase':
                    fillColor = `hsl(${hue + 30}, 40%, 20%)`;
                    strokeColor = `hsl(${hue + 30}, 45%, 30%)`;
                    gradientColor1 = `hsl(${hue + 30}, 42%, 25%)`;
                    gradientColor2 = `hsl(${hue + 30}, 35%, 15%)`;
                    break;
                case 'wave':
                    fillColor = `hsl(${hue + 180}, 40%, 20%)`;
                    strokeColor = `hsl(${hue + 180}, 45%, 30%)`;
                    gradientColor1 = `hsl(${hue + 180}, 42%, 25%)`;
                    gradientColor2 = `hsl(${hue + 180}, 35%, 15%)`;
                    break;
                case 'zigzag':
                    fillColor = `hsl(${hue + 90}, 40%, 20%)`;
                    strokeColor = `hsl(${hue + 90}, 45%, 30%)`;
                    gradientColor1 = `hsl(${hue + 90}, 42%, 25%)`;
                    gradientColor2 = `hsl(${hue + 90}, 35%, 15%)`;
                    break;
                case 'narrow':
                    fillColor = `hsl(${hue + 270}, 40%, 20%)`;
                    strokeColor = `hsl(${hue + 270}, 45%, 30%)`;
                    gradientColor1 = `hsl(${hue + 270}, 42%, 25%)`;
                    gradientColor2 = `hsl(${hue + 270}, 35%, 15%)`;
                    break;
                case 'rhythm':
                    fillColor = `hsl(${hue + 120}, 40%, 20%)`;
                    strokeColor = `hsl(${hue + 120}, 45%, 30%)`;
                    gradientColor1 = `hsl(${hue + 120}, 42%, 25%)`;
                    gradientColor2 = `hsl(${hue + 120}, 35%, 15%)`;
                    break;
                default:
                    fillColor = `hsl(${hue}, 40%, 20%)`;
                    strokeColor = `hsl(${hue}, 45%, 30%)`;
                    gradientColor1 = `hsl(${hue}, 42%, 25%)`;
                    gradientColor2 = `hsl(${hue}, 35%, 15%)`;
            }

            ctx.lineWidth = 2;

            // Draw top pipe with rug-like pattern
            if (pipe.top > 0) {
                const topY = 0;
                const topH = pipe.top; // removed + topHeight to align visuals with collision gap
                if (topH > 0) {
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(pipe.x, topY, this.OBSTACLES.WIDTH, topH);

                    // Clip pattern strictly inside the rect so it cannot overlap shape
                    this.drawPatternClipped(ctx, pipe.x, topY, this.OBSTACLES.WIDTH, topH, pipe.type, hue);

                    ctx.strokeStyle = strokeColor;
                    ctx.strokeRect(pipe.x, topY, this.OBSTACLES.WIDTH, topH);

                    this.drawRugFringe(ctx, pipe.x, topY + topH, this.OBSTACLES.WIDTH, hue);
                }
            }

            // Draw bottom pipe with rug-like pattern
            if (pipe.bottom < canvasHeight) {
                const bottomY = pipe.bottom; // start exactly at gap boundary
                const bottomH = canvasHeight - bottomY; // removed - bottomHeight
                if (bottomH > 0) {
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(pipe.x, bottomY, this.OBSTACLES.WIDTH, bottomH);

                    // Clip pattern strictly inside the rect so it cannot overlap shape
                    this.drawPatternClipped(ctx, pipe.x, bottomY, this.OBSTACLES.WIDTH, bottomH, pipe.type, hue);

                    ctx.strokeStyle = strokeColor;
                    ctx.strokeRect(pipe.x, bottomY, this.OBSTACLES.WIDTH, bottomH);

                    this.drawRugFringe(ctx, pipe.x, bottomY, this.OBSTACLES.WIDTH, hue, true);
                }
            }

            // Reset alpha for next pipe
            ctx.globalAlpha = 1;
        }

        // Restore context state
        ctx.restore();
    }

    // Clip helper to keep design strictly within obstacle rectangle
    drawPatternClipped(ctx, x, y, width, height, type, hue, inset = 1) {
        if (width <= 0 || height <= 0) return;
        ctx.save();
        // Inset so strokes/borders remain clean
        const clipX = x + inset;
        const clipY = y + inset;
        const clipW = Math.max(0, width - inset * 2);
        const clipH = Math.max(0, height - inset * 2);

        ctx.beginPath();
        ctx.rect(clipX, clipY, clipW, clipH);
        ctx.clip();

        // Draw the selected pattern inside the clipped region only
        this.drawRugPattern(ctx, clipX, clipY, clipW, clipH, type, hue);

        ctx.restore();
    }

    // Method to draw rug fringe
    drawRugFringe(ctx, x, y, width, hue, isTopFringe = false) {
        const fringeHeight = 3;
        const fringeCount = 10;
        const fringeWidth = width / fringeCount;
        
        ctx.strokeStyle = `hsla(${hue}, 30%, 40%, 0.6)`;
        ctx.lineWidth = 1;
        
        for (let i = 0; i < fringeCount; i++) {
            const fringeX = x + i * fringeWidth;
            
            if (isTopFringe) {
                // Top fringe (pointing up)
                ctx.beginPath();
                ctx.moveTo(fringeX, y);
                ctx.lineTo(fringeX + fringeWidth/2, y - fringeHeight);
                ctx.lineTo(fringeX + fringeWidth, y);
                ctx.stroke();
            } else {
                // Bottom fringe (pointing down)
                ctx.beginPath();
                ctx.moveTo(fringeX, y);
                ctx.lineTo(fringeX + fringeWidth/2, y + fringeHeight);
                ctx.lineTo(fringeX + fringeWidth, y);
                ctx.stroke();
            }
        }
    }
    
    // Helper method to draw rug patterns based on obstacle type
    drawRugPattern(ctx, x, y, width, height, type, hue) {
        // Different rug pattern for each obstacle type
        switch(type) {
            case 'staircase':
                // Geometric pattern typical of tribal rugs
                this.drawTribalRugPattern(ctx, x, y, width, height, hue);
                break;
                
            case 'wave':
                // Oriental floral pattern
                this.drawOrientalRugPattern(ctx, x, y, width, height, hue);
                break;
                
            case 'zigzag':
                // Chevron/zigzag pattern
                this.drawChevronRugPattern(ctx, x, y, width, height, hue);
                break;
                
            case 'narrow':
                // Persian medallion style
                this.drawPersianRugPattern(ctx, x, y, width, height, hue);
                break;
                
            case 'rhythm':
                // Striped kilim pattern
                this.drawKilimRugPattern(ctx, x, y, width, height, hue);
                break;
                
            default:
                // Simple diamond pattern
                this.drawSimpleDiamondPattern(ctx, x, y, width, height, hue);
        }
    }
    
    // Tribal geometric pattern
    drawTribalRugPattern(ctx, x, y, width, height, hue) {
        const patternSize = 15;
        const accentColor = `hsla(${hue + 30}, 50%, 50%, 0.3)`;
        const bgColor = `hsla(${hue + 30}, 30%, 30%, 0.2)`;
        
        ctx.fillStyle = accentColor;
        
        // Draw geometric shapes
        for (let i = 0; i < height; i += patternSize * 2) {
            for (let j = 0; j < width; j += patternSize * 2) {
                // Diamond shapes
                ctx.beginPath();
                ctx.moveTo(x + j + patternSize/2, y + i);
                ctx.lineTo(x + j + patternSize, y + i + patternSize/2);
                ctx.lineTo(x + j + patternSize/2, y + i + patternSize);
                ctx.lineTo(x + j, y + i + patternSize/2);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        // Add horizontal divider lines
        ctx.fillStyle = bgColor;
        for (let i = patternSize; i < height; i += patternSize * 3) {
            ctx.fillRect(x, y + i, width, 2);
        }
    }
    
    // Oriental floral pattern
    drawOrientalRugPattern(ctx, x, y, width, height, hue) {
        const patternSize = 20;
        const accentColor = `hsla(${hue + 180}, 50%, 60%, 0.25)`;
        const bgColor = `hsla(${hue + 210}, 40%, 40%, 0.2)`;
        
        // Background grid
        ctx.fillStyle = bgColor;
        for (let i = 0; i < height; i += patternSize) {
            for (let j = 0; j < width; j += patternSize) {
                if ((i + j) % (patternSize * 2) === 0) {
                    ctx.fillRect(x + j, y + i, patternSize, patternSize);
                }
            }
        }
        
        // Floral dots
        ctx.fillStyle = accentColor;
        for (let i = patternSize/2; i < height; i += patternSize) {
            for (let j = patternSize/2; j < width; j += patternSize) {
                ctx.beginPath();
                ctx.arc(x + j, y + i, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } // <-- ensure this closes drawOrientalRugPattern

    // Chevron/zigzag pattern
    drawChevronRugPattern(ctx, x, y, width, height, hue) {
        const patternHeight = 12;
        const zigzagWidth = 10;
        const accentColor = `hsla(${hue + 90}, 55%, 55%, 0.3)`;
        
        ctx.fillStyle = accentColor;
        
        for (let i = 0; i < height; i += patternHeight * 2) {
            for (let j = 0; j < width; j += zigzagWidth * 2) {
                // Upward zigzag
                ctx.beginPath();
                ctx.moveTo(x + j, y + i + patternHeight);
                ctx.lineTo(x + j + zigzagWidth, y + i);
                ctx.lineTo(x + j + zigzagWidth * 2, y + i + patternHeight);
                ctx.lineTo(x + j + zigzagWidth * 2 - 2, y + i + patternHeight);
                ctx.lineTo(x + j + zigzagWidth, y + i + 2);
                ctx.lineTo(x + j + 2, y + i + patternHeight);
                ctx.closePath();
                ctx.fill();
                
                // Downward zigzag (offset)
                if (i + patternHeight < height) {
                    ctx.beginPath();
                    ctx.moveTo(x + j, y + i + patternHeight);
                    ctx.lineTo(x + j + zigzagWidth, y + i + patternHeight * 2);
                    ctx.lineTo(x + j + zigzagWidth * 2, y + i + patternHeight);
                    ctx.lineTo(x + j + zigzagWidth * 2 - 2, y + i + patternHeight);
                    ctx.lineTo(x + j + zigzagWidth, y + i + patternHeight * 2 - 2);
                    ctx.lineTo(x + j + 2, y + i + patternHeight);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }
    
    // Persian medallion style
    drawPersianRugPattern(ctx, x, y, width, height, hue) {
        const bgColor = `hsla(${hue + 270}, 30%, 40%, 0.15)`;
        const accentColor = `hsla(${hue + 300}, 50%, 60%, 0.25)`;
        const borderSize = 8;
        
        // Draw border
        ctx.fillStyle = accentColor;
        ctx.fillRect(x, y, width, borderSize);
        ctx.fillRect(x, y + height - borderSize, width, borderSize);
        ctx.fillRect(x, y, borderSize, height);
        ctx.fillRect(x + width - borderSize, y, borderSize, height);
        
        // Inner border
        ctx.fillStyle = bgColor;
        ctx.fillRect(x + borderSize * 2, y + borderSize * 2, 
                    width - borderSize * 4, height - borderSize * 4);
        
        // Center medallion if height is sufficient
        if (height > 60 && width > 60) {
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            const medallionSize = Math.min(width, height) * 0.3;
            
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, medallionSize/2, medallionSize/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner medallion
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, medallionSize/4, medallionSize/4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Kilim stripe pattern
    drawKilimRugPattern(ctx, x, y, width, height, hue) {
        const stripeHeight = 10;
        const colors = [
            `hsla(${hue + 120}, 45%, 35%, 0.3)`,
            `hsla(${hue + 150}, 40%, 45%, 0.25)`,
            `hsla(${hue + 180}, 35%, 40%, 0.2)`
        ];
        
        let colorIndex = 0;
        for (let i = 0; i < height; i += stripeHeight) {
            ctx.fillStyle = colors[colorIndex % colors.length];
            ctx.fillRect(x, y + i, width, stripeHeight);
            colorIndex++;
        }
        
        // Add small diamond motifs
        ctx.fillStyle = `hsla(${hue}, 50%, 60%, 0.3)`;
        for (let i = stripeHeight/2; i < height; i += stripeHeight * 2) {
            for (let j = width/4; j < width; j += width/2) {
                // Small diamond
                ctx.beginPath();
                ctx.moveTo(x + j, y + i - 3);
                ctx.lineTo(x + j + 3, y + i);
                ctx.lineTo(x + j, y + i + 3);
                ctx.lineTo(x + j - 3, y + i);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    
    // Simple diamond pattern
    drawSimpleDiamondPattern(ctx, x, y, width, height, hue) {
        const patternSize = 20;
        const accentColor = `hsla(${hue}, 50%, 60%, 0.25)`;
        
        ctx.fillStyle = accentColor;
        
        for (let i = 0; i < height; i += patternSize) {
            for (let j = 0; j < width; j += patternSize) {
                if ((i/patternSize + j/patternSize) % 2 === 0) {
                    // Diamond shape
                    ctx.beginPath();
                    ctx.moveTo(x + j + patternSize/2, y + i);
                    ctx.lineTo(x + j + patternSize, y + i + patternSize/2);
                    ctx.lineTo(x + j + patternSize/2, y + i + patternSize);
                    ctx.lineTo(x + j, y + i + patternSize/2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }
}
                    ctx.lineTo(x + j + patternSize/2, y + i + patternSize);
                    ctx.lineTo(x + j, y + i + patternSize/2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }
}
