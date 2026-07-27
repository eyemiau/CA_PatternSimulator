export class AutomatonModel {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = this.createEmptyGrid();

        // Вместо простых чисел, правила теперь - это массив объектов.
        // Каждый объект - это фаза развития фрактала.
        this.patternRules = [
            // Фаза 1: Первичное разрастание
            { birth: [1, 2], survive: [1, 2, 3], ageLimit: 4, colorPhase: 'growth' },
            // Фаза 2: Кристаллизация (умирают, если слишком тесно)
            { birth: [2], survive: [2], ageLimit: 8, colorPhase: 'crystal' },
             // Фаза 3: Стабилизация и распад
            { birth: [3], survive: [1, 2, 3, 4], ageLimit: 12, colorPhase: 'decay' }
        ];
        
        this.currentPhaseIndex = 0; // Начинаем с первой фазы
        this.tickCounter = 0; // Общий счетчик тиков симуляции
        
        // Время (в тиках) на смену фазы
        this.ticksPerPhase = 25; 
        this.globalAgeModifier = 0;
        this.seedLibrary = {
            'dot': [ [0, 0] ],
            'square': [
                [-1, -1], [0, -1], [1, -1],
                [-1,  0], [0,  0], [1,  0],
                [-1,  1], [0,  1], [1,  1]
            ],
            'glider': [
                          [0, -1],
                                   [1, 0],
                [-1, 1],  [0, 1],  [1, 1]
            ]
        };
    }
    
    // Изменим метод toggleCell, чтобы он мог рисовать целые паттерны
    stampSeed(centerX, centerY, seedName) {
        const seedPattern = this.seedLibrary[seedName];
        
        if (!seedPattern) return; // Если паттерн не найден, ничего не делаем

        // Проходим по каждой точке паттерна
        for (let i = 0; i < seedPattern.length; i++) {
            const offsetX = seedPattern[i][0];
            const offsetY = seedPattern[i][1];
            
            // Вычисляем реальные координаты на сетке
            const x = centerX + offsetX;
            const y = centerY + offsetY;

            // Проверяем границы
            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                this.grid[y][x] = 1; // "Сажаем" живую клетку (возраст 1)
            }
        }
    }
    createEmptyGrid() {
        return Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
    }

    getCellAge(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return 0; 
        return this.grid[y][x];
    }


    countNeighbors(x, y) {
        let sum = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                if (this.getCellAge(x + i, y + j) > 0) sum++;
            }
        }
        return sum;
    }

    update() {
        const nextGrid = this.createEmptyGrid();
        
        // Получаем активное правило для текущей фазы
        const currentRule = this.patternRules[this.currentPhaseIndex];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const age = this.grid[y][x];
                const neighbors = this.countNeighbors(x, y);

                if (age > 0) {
                     // Выживание
                    if (currentRule.survive.includes(neighbors) && age < currentRule.ageLimit) {
                         nextGrid[y][x] = age + 1;
                    } else {
                        nextGrid[y][x] = 0; 
                    }
                } else {
                    // Рождение
                    if (currentRule.birth.includes(neighbors)) {
                        nextGrid[y][x] = 1;
                    }
                }
            }
        }
        
        this.grid = nextGrid;
        
        // Обновляем фазу
        this.tickCounter++;
        if (this.tickCounter % this.ticksPerPhase === 0) {
             // Циклически переключаем фазы (0 -> 1 -> 2 -> 0...)
            this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.patternRules.length;
        }
    }

    clear() {
        this.grid = this.createEmptyGrid();
        this.tickCounter = 0;
        this.currentPhaseIndex = 0;
    }
}