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
            const newCandle = {
                x: worldX,
                open: this.lastY,
                close: birdY,
                high: Math.min(this.lastY, birdY) - this.HIGH_BUFFER * this.VERTICAL_FILL_FACTOR, // Exaggerate upward movement
                low: Math.max(this.lastY, birdY) + this.LOW_BUFFER * this.VERTICAL_FILL_FACTOR,  // Exaggerate downward movement
                color: birdY < this.lastY ? 'green' : 'red' // Flip colors: green for upward, red for downward
            };
            this.candles.push(newCandle);
            this.lastY = birdY;

            // Limit the number of candles for performance
            if (this.candles.length > this.CHART.MAX_CANDLES) {
                this.candles.shift();
            }
        }
    }

    draw(ctx, worldX, birdX, birdY) {
        const chartXOffset = birdX - this.CHART.CANDLE_WIDTH / 2;

        // Draw the chart trail
        for (let i = 0; i < this.candles.length; i++) {
            const candle = this.candles[i];
            const candleX = chartXOffset - (worldX - candle.x);

            // Skip candles that are off-screen
            if (candleX + this.CHART.CANDLE_WIDTH < 0 || candleX > this.canvas.width) {
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
            ctx.fillRect(
                candleX,
                Math.min(candle.open, candle.close),
                this.CHART.CANDLE_WIDTH,
                Math.abs(candle.open - candle.close)
            );

            // Add a border for better visibility
            ctx.strokeStyle = '#000000'; // Black border
            ctx.lineWidth = 0.5;
            ctx.strokeRect(
                candleX,
                Math.min(candle.open, candle.close),
                this.CHART.CANDLE_WIDTH,
                Math.abs(candle.open - candle.close)
            );
        }
    }
}