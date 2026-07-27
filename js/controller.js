import { audioManager } from './audio.js';

export class AppController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isRunning = false;
        this.animationId = null;
        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        this.view.setup(this.model.cols, this.model.rows);
        this.bindEvents();
        this.view.draw(this.model.grid);
    }

    gameLoop() {
        if (!this.isRunning) return;
        this.model.update();
        
        const activeCount = this.model.getActiveCellsCount();
        const maxCells = this.model.cols * this.model.rows;
        audioManager.updateAmbientByGrid(activeCount, maxCells);
        
        const currentRule = this.model.patternRules[this.model.currentPhaseIndex];
        const phaseName = currentRule.colorPhase;
        
        this.view.draw(this.model.grid, phaseName);
        setTimeout(() => {
            this.animationId = requestAnimationFrame(this.gameLoop);
        }, 100);
    }

    bindEvents() {
        const btnPlay = document.getElementById('btnPlay');
        const btnPause = document.getElementById('btnPause');
        const btnClear = document.getElementById('btnClear');

        btnPlay.addEventListener('click', () => {
            if (!this.isRunning) {
                this.isRunning = true;
                audioManager.play('start');
                audioManager.toggleAmbient(true);
                this.gameLoop();
            }
        });

        btnPause.addEventListener('click', () => {
            this.isRunning = false;
            audioManager.play('pause');
            audioManager.toggleAmbient(false);
            cancelAnimationFrame(this.animationId);
        });

        btnClear.addEventListener('click', () => {
            this.isRunning = false;
            audioManager.play('clear');
            audioManager.toggleAmbient(false);
            cancelAnimationFrame(this.animationId);
            this.model.clear();
            this.view.draw(this.model.grid);
        });

        const ageSlider = document.getElementById('ageModifier');
        const ageSpan = document.getElementById('ageModifierValue');
        ageSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            
            if (val === 0) ageSpan.textContent = '0';
            else if (val === 1) ageSpan.textContent = '1';
            else ageSpan.textContent = '2';
            
            if (val === 0) this.model.globalAgeModifier = -3;
            else if (val === 1) this.model.globalAgeModifier = 0;
            else if (val === 2) this.model.globalAgeModifier = 2;
        });

        const canvas = this.view.canvas;
        const seedSelector = document.getElementById('seedSelector');
        
        let isDrawing = false;
        
        // Переменные для оптимизации рисования
        let lastDrawnCol = -1;
        let lastDrawnRow = -1;
        let lastSoundTime = 0;

        const handleCanvasDraw = (e) => {
            const rect = canvas.getBoundingClientRect();
            
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const colIndex = Math.floor(mouseX / this.view.cellSize);
            const rowIndex = Math.floor(mouseY / this.view.cellSize);

            // ОПТИМИЗАЦИЯ 1: Прерываем функцию, если мышь все еще над той же самой клеткой
            if (colIndex === lastDrawnCol && rowIndex === lastDrawnRow) return;
            
            // Запоминаем текущую клетку
            lastDrawnCol = colIndex;
            lastDrawnRow = rowIndex;

            const selectedSeed = seedSelector.value;
            this.model.stampSeed(colIndex, rowIndex, selectedSeed);

            // ОПТИМИЗАЦИЯ 2: Проигрываем звук создания клетки не чаще, чем раз в 50 миллисекунд
            const now = Date.now();
            if (now - lastSoundTime > 50) {
                audioManager.play('spawn');
                lastSoundTime = now;
            }

            const activeCount = this.model.getActiveCellsCount();
            const maxCells = this.model.cols * this.model.rows;
            audioManager.updateAmbientByGrid(activeCount, maxCells);

            if (!this.isRunning) {
                const currentRule = this.model.patternRules[this.model.currentPhaseIndex];
                this.view.draw(this.model.grid, currentRule.colorPhase);
            }
        };

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            // Сбрасываем координаты при новом клике, чтобы можно было кликать в ту же клетку
            lastDrawnCol = -1; 
            lastDrawnRow = -1;
            handleCanvasDraw(e);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDrawing) {
                handleCanvasDraw(e);
            }
        });

        window.addEventListener('mouseup', () => {
            isDrawing = false;
            lastDrawnCol = -1; 
            lastDrawnRow = -1;
        });
    }
}