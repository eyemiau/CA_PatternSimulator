export class AutomatonView {
    // В конструктор передаем сам HTML-элемент canvas и размер одной клетки
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d'); // Получаем "кисть" для рисования
        this.cellSize = cellSize;
    }

    // Настройка физического размера холста
    setup(cols, rows) {
        // Задаем холсту ширину и высоту в пикселях
        this.canvas.width = cols * this.cellSize;
        this.canvas.height = rows * this.cellSize;
    }

    // Главный метод отрисовки. Принимает сетку из Модели
    // Теперь draw принимает два аргумента
    draw(grid, phaseName = 'growth') { 
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const rows = grid.length;
        const cols = grid[0].length;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const age = grid[y][x];

                if (age > 0) {
                    // Передаем возраст и фазу для вычисления цвета
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

    // Новая логика расцветки
    getColorByAge(age, phaseName) {
        let baseHue;
        
        // View сам решает, какому смыслу какой цвет (Hue) соответствует
        switch (phaseName) {
            case 'growth':  baseHue = 120; break; // Зеленые оттенки
            case 'crystal': baseHue = 210; break; // Синие оттенки
            case 'decay':   baseHue = 0;   break; // Красные оттенки
            default:        baseHue = 280;        // Фиолетовый (фоллбэк)
        }

        // Чем старше клетка, тем она тусклее (играем со светлотой HSL)
        // Если клетка только родилась (age=1), светлота будет ~68%
        // Чем старше (age=10), тем ближе к 50%
        const lightness = Math.max(30, 70 - (age * 2)); 
        
        return `hsl(${baseHue}, 100%, ${lightness}%)`;
    }
}