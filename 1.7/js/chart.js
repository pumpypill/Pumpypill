// chart.js
// Handles the chart trail and candle rendering

export class ChartTrail {
    constructor(canvas, CHART) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.CHART = CHART;
        this.candles = [];
        this.lastY = canvas.height / 2; // Start at the middle of the canvas

        // Extract high/low buffers into constants
        this.HIGH_BUFFER = 10;
        this.LOW_BUFFER = 10;
        this.VERTICAL_FILL_FACTOR = 1.2; // Factor to exaggerate vertical movement
    }

    reset() {
        this.candles = [];
        this.lastY = this.canvas.height / 2;
    }

    updateChart(worldX, birdY) {
        // Add a new candle when the world progresses by a candle width
        if (this.candles.length === 0 || worldX - this.candles[this.candles.length - 1].x >= this.CHART.CANDLE_WIDTH) {
            // Ensure birdY is within canvas bounds to prevent rendering issues
            const boundedBirdY = Math.max(0, Math.min(birdY, this.canvas.height));
            const boundedLastY = Math.max(0, Math.min(this.lastY, this.canvas.height));
            
            // Calculate high and low with boundaries
            const highValue = Math.min(boundedLastY, boundedBirdY) - this.HIGH_BUFFER * this.VERTICAL_FILL_FACTOR;
            const lowValue = Math.max(boundedLastY, boundedBirdY) + this.LOW_BUFFER * this.VERTICAL_FILL_FACTOR;
            
            // Create the new candle
            const newCandle = {
                x: worldX,
                open: boundedLastY,
                close: boundedBirdY,
                high: Math.max(0, highValue), // Ensure high is not negative
                low: Math.min(this.canvas.height, lowValue), // Ensure low is within canvas height
                color: boundedBirdY < boundedLastY ? 'green' : 'red' // Green for upward, red for downward
            };
            
            this.candles.push(newCandle);
            this.lastY = boundedBirdY;

            // Limit the number of candles for performance
            if (this.candles.length > this.CHART.MAX_CANDLES) {
                this.candles.shift();
            }
        }
    }

    draw(ctx, worldX, birdX, birdY) {
        // Save context state
        ctx.save();
        
        const chartXOffset = birdX - this.CHART.CANDLE_WIDTH / 2;
        
        // Optimize by checking if there are candles to draw
        if (this.candles.length === 0) {
            ctx.restore();
            return;
        }
        
        // Calculate visible candle range for optimization
        const visibleStartX = -this.CHART.CANDLE_WIDTH;
        const visibleEndX = this.canvas.width;

        // Draw the chart trail
        for (let i = 0; i < this.candles.length; i++) {
            const candle = this.candles[i];
            const candleX = chartXOffset - (worldX - candle.x);

            // Skip candles that are off-screen
            if (candleX + this.CHART.CANDLE_WIDTH < visibleStartX || candleX > visibleEndX) {
                continue;
            }

            // Draw the wick
            ctx.strokeStyle = '#ffffff'; // White wick for better visibility
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(candleX + this.CHART.CANDLE_WIDTH / 2, candle.high);
            ctx.lineTo(candleX + this.CHART.CANDLE_WIDTH / 2, candle.low);
            ctx.stroke();

            // Draw the body
            ctx.fillStyle = candle.color === 'green' ? '#4CAF50' : '#E57373'; // Bright green and red for visibility
            const yPos = Math.min(candle.open, candle.close);
            const height = Math.max(1, Math.abs(candle.open - candle.close)); // Ensure minimum height of 1px
            
            ctx.fillRect(
                candleX,
                yPos,
                this.CHART.CANDLE_WIDTH,
                height
            );

            // Add a border for better visibility
            ctx.strokeStyle = '#000000'; // Black border
            ctx.lineWidth = 0.5;
            ctx.strokeRect(
                candleX,
                yPos,
                this.CHART.CANDLE_WIDTH,
                height
            );
        }
        
        // Restore context state
        ctx.restore();
    }
}