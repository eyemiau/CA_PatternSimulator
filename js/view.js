export class AutomatonView {
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = cellSize;
    }

    setup(cols, rows) {
        this.canvas.width = cols * this.cellSize;
        this.canvas.height = rows * this.cellSize;
    }

    draw(grid, phaseName = 'growth') {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const rows = grid.length;
        const cols = grid[0].length;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const age = grid[y][x];

                if (age > 0) {
                    this.ctx.fillStyle = this.getColorByAge(age, phaseName);
                    this.ctx.fillRect(
                        x * this.cellSize, 
                        y * this.cellSize, 
                        this.cellSize - 1, 
                        this.cellSize - 1
                    );
                }
            }
        }
    }

    getColorByAge(age, phaseName) {
        let baseHue;
        switch (phaseName) {
            case 'growth':  baseHue = 120; break; // Зеленый
            case 'crystal': baseHue = 210; break; // Синий
            case 'decay':   baseHue = 0;   break; // Красный
            default:        baseHue = 280;        
        }
        const lightness = Math.max(20, 70 - (age * 10)); 
        return `hsl(${baseHue}, 100%, ${lightness}%)`;
    }
}