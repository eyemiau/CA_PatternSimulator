export class AutomatonModel {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = this.createEmptyGrid();

        this.patternRules = [
            { birth: [1, 2], survive: [1, 2, 3], ageLimit: 4, colorPhase: 'growth' },
            { birth: [2], survive: [2], ageLimit: 8, colorPhase: 'crystal' },
            { birth: [3], survive: [1, 2, 3, 4], ageLimit: 12, colorPhase: 'decay' }
        ];
        
        this.currentPhaseIndex = 0; 
        this.tickCounter = 0; 
        this.ticksPerPhase = 25; 
        this.globalAgeModifier = 0;
        this.activeCellsCount = 0; // Оптимизированный счетчик
        
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
    
    getActiveCellsCount() {
        return this.activeCellsCount; // Теперь метод возвращает готовое число моментально
    }

    stampSeed(centerX, centerY, seedName) {
        const seedPattern = this.seedLibrary[seedName];
        if (!seedPattern) return; 

        for (let i = 0; i < seedPattern.length; i++) {
            const offsetX = seedPattern[i][0];
            const offsetY = seedPattern[i][1];
            
            const x = centerX + offsetX;
            const y = centerY + offsetY;

            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                if (this.grid[y][x] === 0) { // Если клетка была пустой
                    this.grid[y][x] = 1; 
                    this.activeCellsCount++; // Плюсуем счетчик при ручном рисовании
                }
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
        const currentRule = this.patternRules[this.currentPhaseIndex];
        const currentAgeLimit = Math.max(1, currentRule.ageLimit + this.globalAgeModifier);
        
        let currentActiveCount = 0; // Считаем заново каждый тик симуляции

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const age = this.grid[y][x];
                const neighbors = this.countNeighbors(x, y);

                if (age > 0) {
                    if (currentRule.survive.includes(neighbors) && age < currentAgeLimit) {
                        nextGrid[y][x] = age + 1;
                        currentActiveCount++; // Клетка выжила
                    } else {
                        nextGrid[y][x] = 0; 
                    }
                } else {
                    if (currentRule.birth.includes(neighbors)) {
                        nextGrid[y][x] = 1;
                        currentActiveCount++; // Клетка родилась
                    }
                }
            }
        }
        
        this.grid = nextGrid;
        this.activeCellsCount = currentActiveCount; // Сохраняем результат
        
        this.tickCounter++;
        if (this.tickCounter % this.ticksPerPhase === 0) {
            this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.patternRules.length;
        }
    }

    clear() {
        this.grid = this.createEmptyGrid();
        this.tickCounter = 0;
        this.currentPhaseIndex = 0;
        this.activeCellsCount = 0; // Сбрасываем счетчик при очистке
    }
}