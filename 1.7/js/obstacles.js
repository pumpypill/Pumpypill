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
        // Every 5-8 obstacles, switch patterns
        if (this.obstacleCount % (5 + Math.floor(Math.random() * 4)) === 0) {
            this.switchPattern();
        }

        let gapCenter = this.calculateGapCenter();
        
        // Ensure gap stays within bounds
        const minGapPos = 100; // Minimum distance from top
        const maxGapPos = this.canvasHeight - 100; // Maximum distance from bottom
        gapCenter = Math.max(minGapPos, Math.min(maxGapPos, gapCenter));
        
        // Adjust gap size for special patterns
        let currentGap = this.pipeGap;
        if (this.currentPattern === 'narrow') {
            currentGap = Math.max(this.pipeGap * 0.8, this.OBSTACLES.MIN_GAP + 20); // Add buffer for narrow pattern
        } else if (Math.random() < 0.1) {
            currentGap = this.pipeGap * 1.2; // Slightly wider gap as a breather
        }

        const obstacle = {
            x: x,
            scored: false,
            top: gapCenter - currentGap / 2,
            bottom: gapCenter + currentGap / 2,
            // Add a small random offset to pipe heights for visual variety
            topHeight: Math.random() * 10,
            bottomHeight: Math.random() * 10,
            type: this.currentPattern
        };

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
        do {
            newPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
        } while (newPattern === this.currentPattern);

        this.currentPattern = newPattern;

        console.log("Switching to pattern:", this.currentPattern); // Always log pattern changes

        // Reset pattern step counter
        this.patternStep = 0;
        
        // Randomize pattern direction
        this.patternDirection = Math.random() > 0.5 ? 1 : -1;
    }

    updatePipes(speed, canvasWidth) {
        for (let i = 0; i < this.pipes.length; i++) {
            this.pipes[i].x -= speed;
        }
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x <= canvasWidth - this.pipeSpacing) {
            this.pipes.push(this.generateObstacle(canvasWidth));
        }
        while (this.pipes.length > 0 && this.pipes[0].x + this.OBSTACLES.WIDTH < -50) {
            this.pipes.shift();
        }
    }

    checkCollision(bird, PHYSICS) {
        for (let i = 0; i < this.pipes.length; i++) {
            const pipe = this.pipes[i];
            if (Math.abs(bird.x - (pipe.x + this.OBSTACLES.WIDTH / 2)) > this.OBSTACLES.WIDTH) {
                continue;
            }
            const birdLeft = bird.x - PHYSICS.BIRD_RADIUS * 0.8;
            const birdRight = bird.x + PHYSICS.BIRD_RADIUS * 0.8;
            const birdTop = bird.y - PHYSICS.BIRD_RADIUS * 0.8;
            const birdBottom = bird.y + PHYSICS.BIRD_RADIUS * 0.8;
            if (
                birdRight > pipe.x &&
                birdLeft < pipe.x + this.OBSTACLES.WIDTH &&
                (birdTop < pipe.top || birdBottom > pipe.bottom)
            ) {
                return true;
            }
        }
        return false;
    }

    updateDifficulty(pipeGap, pipeSpacing) {
        this.pipeGap = pipeGap;
        this.pipeSpacing = pipeSpacing;
    }

    draw(ctx, level, canvasHeight) {
        const hue = (level * 30) % 360;
        
        for (let i = 0; i < this.pipes.length; i++) {
            const pipe = this.pipes[i];
            
            // Color pipes differently based on pattern type
            switch(pipe.type) {
                case 'staircase':
                    ctx.fillStyle = `hsl(${hue + 30}, 20%, 15%)`;
                    ctx.strokeStyle = `hsl(${hue + 30}, 30%, 25%)`;
                    break;
                case 'wave':
                    ctx.fillStyle = `hsl(${hue + 60}, 20%, 15%)`;
                    ctx.strokeStyle = `hsl(${hue + 60}, 30%, 25%)`;
                    break;
                case 'zigzag':
                    ctx.fillStyle = `hsl(${hue + 90}, 20%, 15%)`;
                    ctx.strokeStyle = `hsl(${hue + 90}, 30%, 25%)`;
                    break;
                case 'narrow':
                    ctx.fillStyle = `hsl(${hue + 180}, 25%, 18%)`;
                    ctx.strokeStyle = `hsl(${hue + 180}, 35%, 28%)`;
                    break;
                case 'rhythm':
                    ctx.fillStyle = `hsl(${hue + 120}, 22%, 16%)`;
                    ctx.strokeStyle = `hsl(${hue + 120}, 32%, 26%)`;
                    break;
                default:
                    ctx.fillStyle = `hsl(${hue}, 15%, 12%)`;
                    ctx.strokeStyle = `hsl(${hue}, 25%, 22%)`;
            }
            
            ctx.lineWidth = 2;
            
            // Draw top pipe with slight height variation
            if (pipe.top > 0) {
                ctx.fillRect(pipe.x, 0, this.OBSTACLES.WIDTH, pipe.top + pipe.topHeight);
                ctx.strokeRect(pipe.x, 0, this.OBSTACLES.WIDTH, pipe.top + pipe.topHeight);
            }
            
            // Draw bottom pipe with slight height variation
            if (pipe.bottom < canvasHeight) {
                ctx.fillRect(
                    pipe.x, 
                    pipe.bottom - pipe.bottomHeight, 
                    this.OBSTACLES.WIDTH, 
                    canvasHeight - pipe.bottom + pipe.bottomHeight
                );
                ctx.strokeRect(
                    pipe.x, 
                    pipe.bottom - pipe.bottomHeight, 
                    this.OBSTACLES.WIDTH, 
                    canvasHeight - pipe.bottom + pipe.bottomHeight
                );
            }
        }
    }
}
        }
    }
}
