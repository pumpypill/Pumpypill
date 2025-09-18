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

        const cw = this.CHART.CANDLE_WIDTH;
        const visibles = [];

        // Precompute visible candles with screen-space positions
        for (let i = 0; i < this.candles.length; i++) {
            const c = this.candles[i];
            const x = chartXOffset - (worldX - c.x);
            if (x + cw < visibleStartX || x > visibleEndX) continue;

            const yPos = Math.min(c.open, c.close);
            const height = Math.max(1, Math.abs(c.open - c.close));
            visibles.push({ x, yPos, height, high: c.high, low: c.low, up: c.color === 'green' });
        }

        if (visibles.length === 0) {
            ctx.restore();
            return;
        }

        // 1) Draw all wicks in a single stroke
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < visibles.length; i++) {
            const v = visibles[i];
            ctx.moveTo(v.x + cw / 2, v.high);
            ctx.lineTo(v.x + cw / 2, v.low);
        }
        ctx.stroke();

        // 2) Fill green bodies together
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        for (let i = 0; i < visibles.length; i++) {
            const v = visibles[i];
            if (!v.up) continue;
            ctx.rect(v.x, v.yPos, cw, v.height);
        }
        ctx.fill();

        // 3) Fill red bodies together
        ctx.fillStyle = '#E57373';
        ctx.beginPath();
        for (let i = 0; i < visibles.length; i++) {
            const v = visibles[i];
            if (v.up) continue;
            ctx.rect(v.x, v.yPos, cw, v.height);
        }
        ctx.fill();

        // 4) Stroke borders once for all bodies
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 0; i < visibles.length; i++) {
            const v = visibles[i];
            ctx.rect(v.x, v.yPos, cw, v.height);
        }
        ctx.stroke();
        
        // Restore context state
        ctx.restore();
    }
}