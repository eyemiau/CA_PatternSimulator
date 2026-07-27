export class AutomatonModel {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = this.createEmptyGrid();

        // Фрактальные фазы
        this.patternRules = [
            { birth: [1, 2], survive: [1, 2, 3], ageLimit: 3, colorPhase: 'growth' },
            { birth: [2], survive: [2], ageLimit: 5, colorPhase: 'crystal' },
            { birth: [3], survive: [1, 2], ageLimit: 2, colorPhase: 'decay' }
        ];
        
        this.currentPhaseIndex = 0;
        this.globalAgeModifier = 0; 

        // Библиотека кистей
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

    createEmptyGrid() {
        return Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
    }

    getCellAge(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return 0; 
        return this.grid[y][x];
    }

    // Посадка семечка
    stampSeed(centerX, centerY, seedName) {
        const seedPattern = this.seedLibrary[seedName];
        if (!seedPattern) return; 

        for (let i = 0; i < seedPattern.length; i++) {
            const x = centerX + seedPattern[i][0];
            const y = centerY + seedPattern[i][1];

            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                this.grid[y][x] = 1; 
            }
        }
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

    // Переключение фазы
    nextPhase() {
        this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.patternRules.length;
        return this.patternRules[this.currentPhaseIndex].colorPhase; 
    }

    countActiveCells() {
        let count = 0;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] > 0) count++;
            }
        }
        return count;
    }

    update() {
        const nextGrid = this.createEmptyGrid();
        const currentRule = this.patternRules[this.currentPhaseIndex];
        const currentAgeLimit = Math.max(1, currentRule.ageLimit + this.globalAgeModifier);

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const age = this.grid[y][x];
                const neighbors = this.countNeighbors(x, y);

                if (age > 0) {
                    if (currentRule.survive.includes(neighbors) && age < currentAgeLimit) {
                         nextGrid[y][x] = age + 1;
                    } else {
                        nextGrid[y][x] = 0; 
                    }
                } else {
                    if (currentRule.birth.includes(neighbors)) {
                        nextGrid[y][x] = 1;
                    }
                }
            }
        }
        this.grid = nextGrid;
    }

    clear() {
        this.grid = this.createEmptyGrid();
        this.currentPhaseIndex = 0;
    }
}